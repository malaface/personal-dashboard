# onchain-fiscal

---
**version**: 1.0.0
**last_updated**: 2026-03-09
**category**: On-Chain Fiscal Tracker (Arbitrum)
**priority**: ALTA
**dependencies**: prisma@5.22.0, covalent-api, hyperliquid-api
**external_apis**:
  covalent: https://api.covalenthq.com/v1 (requiere API key)
  hyperliquid: https://api.hyperliquid.xyz/info (pública)
---

## Cuando invocar esta skill

**Auto-invocar con keywords:** `onchain`, `on-chain`, `wallet`, `arbitrum`, `covalent`, `hyperliquid`, `fiscal`, `SAT`, `costo promedio`, `swap`, `uniswap`, `DeFi`, `token`, `blockchain`, `txHash`, `gas fee`, `LP`, `liquidity`

---

## Reglas Críticas (NUNCA romper)

1. **NUNCA queries sin `userId`** — wallets y transacciones siempre aisladas por usuario
2. **NUNCA almacenar API keys sin cifrar** — usar `encryptAPIKey()` de `lib/ai/encryption.ts`
3. **NUNCA procesar eventos fiscales sin `prisma.$transaction()`** — inventario + evento deben ser atómicos
4. **NUNCA modificar inventario manualmente** — siempre a través del motor fiscal
5. **SIEMPRE normalizar addresses a lowercase** — Ethereum addresses son case-insensitive
6. **SIEMPRE verificar ownership** antes de sync/delete/reclassify
7. **SIEMPRE usar `walletId_txHash` como unique constraint** para deduplicar

---

## Arquitectura del Módulo

```
On-Chain Fiscal Tracker
├── Data Sources
│   ├── Covalent API (GoldRush) → ERC-20 transfers en Arbitrum
│   └── Hyperliquid API → Perp trades (pública, sin API key)
├── Processing Pipeline
│   ├── Fetch → Parser → Classify → Upsert → Fiscal Engine
│   └── Cron endpoint para sync automático
├── Fiscal Engine (SAT México)
│   ├── Método: Costo Promedio Ponderado
│   ├── Monedas: USD → MXN (exchange rate service)
│   └── Inventario por token por wallet
└── UI
    ├── /dashboard/finance/onchain — principal
    └── /dashboard/finance/onchain/reports — reporte fiscal
```

---

## Schema (4 modelos + 5 enums)

### Modelos

| Modelo | Tabla | Propósito |
|--------|-------|-----------|
| `OnchainWallet` | `onchain_wallets` | Wallets del usuario (address, label, network) |
| `OnchainTransaction` | `onchain_transactions` | Transacciones on-chain (parsed + classified) |
| `OnchainTokenInventory` | `onchain_token_inventory` | Inventario de tokens con costo promedio |
| `OnchainFiscalEvent` | `onchain_fiscal_events` | Eventos fiscales calculados (G/P) |

### Enums

| Enum | Valores |
|------|---------|
| `OnchainNetwork` | ARBITRUM, ETHEREUM |
| `OnchainTxType` | SWAP, LP_ADD, LP_REMOVE, TRANSFER_IN, TRANSFER_OUT, APPROVAL, BRIDGE, UNKNOWN |
| `OnchainTxStatus` | RAW, CLASSIFIED, FISCAL_PROCESSED, MANUALLY_OVERRIDDEN |
| `FiscalMethod` | AVERAGE_COST |
| `OnchainDataSource` | COVALENT, HYPERLIQUID |

### Unique constraints

```
OnchainWallet:       @@unique([userId, address, network])
OnchainTransaction:  @@unique([walletId, txHash])
OnchainTokenInventory: @@unique([walletId, tokenAddress])
OnchainFiscalEvent:  transactionId @unique (1:1)
```

---

## Archivos del Módulo

### Core Logic (`code/lib/finance/onchain/`)

| Archivo | Responsabilidad |
|---------|----------------|
| `covalent-client.ts` | API client Covalent con retry + paginación |
| `hyperliquid-client.ts` | API client Hyperliquid (pública) |
| `parser.ts` | Clasificar ERC-20 transfers → SWAP, LP_ADD, LP_REMOVE, etc. |
| `sync.ts` | Orquestador: fetch → parse → classify → upsert |
| `fiscal-engine.ts` | Motor fiscal: costo promedio, G/P en USD/MXN |

### Server Actions (`code/app/dashboard/finance/onchain/actions.ts`)

| Action | Propósito |
|--------|-----------|
| `createOnchainWallet` | CRUD wallet |
| `updateOnchainWallet` | Editar label |
| `deleteOnchainWallet` | Eliminar wallet + cascade txs |
| `saveCovalentApiKey` | Guardar API key cifrada |
| `triggerWalletSync` | Sync manual + auto fiscal processing |
| `reclassifyTransaction` | Override manual de tipo |
| `recalculateWalletFiscalEvents` | Recalcular todo desde cero |

### UI Components (`code/components/finance/onchain/`)

| Componente | Tipo | Propósito |
|------------|------|-----------|
| `CovalentKeyForm.tsx` | Client | Configurar API key |
| `WalletForm.tsx` | Client | Agregar wallet |
| `WalletList.tsx` | Client | Lista con edit/delete/sync |
| `SyncButton.tsx` | Client | Botón sync con loading |
| `TransactionTypeBadge.tsx` | Server | Badge por tipo (colores) |
| `OnchainTransactionTable.tsx` | Client | Tabla paginada + filtros |
| `FiscalSummaryCard.tsx` | Server | Resumen G/P USD/MXN |
| `FiscalReportTable.tsx` | Server | Tabla detallada fiscal |

### Pages

| Ruta | Archivo |
|------|---------|
| `/dashboard/finance/onchain` | `code/app/dashboard/finance/onchain/page.tsx` |
| `/dashboard/finance/onchain/reports` | `code/app/dashboard/finance/onchain/reports/page.tsx` |

### API Routes

| Endpoint | Archivo | Protección |
|----------|---------|------------|
| `POST /api/cron/onchain` | `code/app/api/cron/onchain/route.ts` | `CRON_SECRET` header |

### Validaciones (`code/lib/validations/onchain.ts`)

| Schema | Campos principales |
|--------|--------------------|
| `OnchainWalletSchema` | address (regex 0x), label, network |
| `OnchainSyncSchema` | walletId, fromDate?, toDate? |
| `CovalentKeySchema` | apiKey (min 20 chars) |

---

## Motor Fiscal — Costo Promedio (SAT México)

### Fórmula

```
Costo Promedio = (Costo Total Acumulado + Nuevo Costo) / (Cantidad Total + Nueva Cantidad)

Para cada SWAP:
  costBasis = avgCostBasisUSD × amountSold
  proceeds  = priceSoldUSD × amountSold
  gainLoss  = proceeds - costBasis - gasFee
```

### Flujo de procesamiento

```
1. Obtener transacciones CLASSIFIED tipo SWAP (sin fiscal event)
2. Ordenar cronológicamente
3. Para cada swap:
   a. Leer inventario del token vendido
   b. Calcular costBasis con avgCostBasis actual
   c. Calcular proceeds con precio de venta
   d. Calcular gainLoss (USD y MXN)
   e. Crear OnchainFiscalEvent
   f. Reducir inventario del token vendido
   g. Incrementar inventario del token comprado (nuevo avgCost)
4. Todo dentro de prisma.$transaction() para atomicidad
```

---

## Uniswap V3 — Addresses conocidos (Arbitrum)

```
SwapRouter:                    0xe592427a0aece92de3edee1f18e0157c05861564
SwapRouter02:                  0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45
NonfungiblePositionManager:    0xc36442b4a4522e871399cd717abdd847ab11fe88
```

---

## Clasificación de Transacciones

| Tipo | Detección |
|------|-----------|
| SWAP | wallet envía 1 token + recibe 1 token diferente (vía router) |
| LP_ADD | wallet envía 2+ tokens al PositionManager |
| LP_REMOVE | wallet recibe 2+ tokens del PositionManager |
| TRANSFER_IN | solo tokens entrantes |
| TRANSFER_OUT | solo tokens salientes |
| UNKNOWN | no encaja en patrones conocidos |

---

## Patrones Reutilizados

| Recurso | Ubicación | Uso |
|---------|-----------|-----|
| Auth | `lib/auth/utils.ts` → `requireAuth()` | Todas las pages/actions |
| Encryption | `lib/ai/encryption.ts` → `encryptAPIKey/decryptAPIKey` | API key Covalent |
| AI Credentials | modelo `AICredential` + provider `COVALENT` | Almacenar key cifrada |
| Audit logging | `lib/audit/logger.ts` → `createAuditLog()` | CRUD wallets, sync |
| Exchange rate | `lib/finance/exchange-rate.ts` → `getUSDtoMXNRate()` | Precios en MXN |
| Prisma singleton | `lib/db/prisma.ts` | Todas las queries |
| Zod validation | `lib/validations/onchain.ts` | Validar inputs |

---

## Variables de Entorno

```bash
# Agregar a code/.env.local
CRON_SECRET="[tu-secret-para-cron]"  # Proteger endpoint /api/cron/onchain

# API key Covalent se almacena cifrada en DB (modelo AICredential)
# No necesita variable de entorno — se configura desde UI
```

---

## Troubleshooting

```bash
# Verificar migración aplicada
npx prisma migrate status

# Ver wallets de un usuario
docker exec dashboard-postgres psql -U dashboard_user -d dashboard -c \
  "SELECT id, address, label, network, last_sync_at FROM onchain_wallets;"

# Ver transacciones
docker exec dashboard-postgres psql -U dashboard_user -d dashboard -c \
  "SELECT tx_hash, type, status, data_source, token_sold_symbol, token_bought_symbol FROM onchain_transactions ORDER BY timestamp DESC LIMIT 20;"

# Verificar inventario
docker exec dashboard-postgres psql -U dashboard_user -d dashboard -c \
  "SELECT token_symbol, total_amount, avg_cost_basis_usd, avg_cost_basis_mxn FROM onchain_token_inventory;"

# Test cron endpoint
curl -X POST -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/onchain
```
