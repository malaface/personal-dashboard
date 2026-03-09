# Módulo Tracker Fiscal On-Chain (Arbitrum) — Seguimiento

> **Inicio:** 2026-03-08
> **Branch:** `trackeFiscal`
> **Estado:** En progreso

---

## Fase 1: Extracción Básica

**Estado:** ✅ Completada — 2026-03-09

### 1.1 Schema de Base de Datos

- [x] Agregar `COVALENT` al enum `AIProvider`
- [x] Crear enums: `OnchainNetwork`, `OnchainTxType`, `OnchainTxStatus`, `FiscalMethod`, `OnchainDataSource`
- [x] Crear modelo `OnchainWallet`
- [x] Crear modelo `OnchainTransaction`
- [x] Crear modelo `OnchainTokenInventory`
- [x] Crear modelo `OnchainFiscalEvent`
- [x] Agregar relación `onchainWallets` al modelo `User`
- [x] Migración aplicada: `20260309015520_add_onchain_fiscal_tracker`

### 1.2 Validaciones Zod

- [x] `OnchainWalletSchema` (address regex, label, network)
- [x] `OnchainSyncSchema` (walletId, fromDate?, toDate?)
- [x] `CovalentKeySchema` (apiKey min 20 chars)
- **Archivo:** `code/lib/validations/onchain.ts`

### 1.3 Cliente Covalent

- [x] `getCovalentApiKey(userId)` — obtener y descifrar key
- [x] `fetchTransactionHistory(apiKey, walletAddress, chainId)`
- [x] `fetchERC20Transfers(apiKey, walletAddress, chainId)`
- [x] `fetchAllERC20Transfers()` — con paginación
- [x] Manejo de rate limiting (exponential backoff)
- **Archivo:** `code/lib/finance/onchain/covalent-client.ts`

### 1.4 Server Actions

- [x] `createOnchainWallet(formData)`
- [x] `updateOnchainWallet(walletId, formData)`
- [x] `deleteOnchainWallet(walletId)`
- [x] `saveCovalentApiKey(formData)`
- [x] `triggerWalletSync(walletId)`
- [x] `reclassifyTransaction(transactionId, newType)`
- [x] `recalculateWalletFiscalEvents(walletId)`
- **Archivo:** `code/app/dashboard/finance/onchain/actions.ts`

### 1.5 UI — Tab On-Chain en Finanzas

- [x] Tab "On-Chain" con `LinkIcon` y `walletCount`
- **Archivo modificado:** `code/components/finance/FinanceModeTabs.tsx`

### 1.6 UI — Página Principal On-Chain

- [x] `page.tsx` Server Component con lógica condicional (API key, wallets, datos)
- [x] `WalletForm.tsx` — formulario address + label + network
- [x] `WalletList.tsx` — lista con edit/delete/sync
- [x] `OnchainTransactionTable.tsx` — tabla paginada con filtros y badges
- [x] `SyncButton.tsx` — botón con loading state
- [x] `TransactionTypeBadge.tsx` — badge por tipo de transacción
- **Archivos:** `code/app/dashboard/finance/onchain/page.tsx`, `code/components/finance/onchain/*.tsx`

### 1.7 UI — Configuración API Key Covalent

- [x] `CovalentKeyForm.tsx` — formulario con estados configurado/pendiente
- **Archivo:** `code/components/finance/onchain/CovalentKeyForm.tsx`

### 1.8 Dependencia viem

- [ ] `npm install viem` — pendiente para Fase 2 (ABI decoding)

### Verificación Fase 1

- [x] `npx prisma migrate dev` sin errores
- [x] `npx tsc --noEmit` sin errores
- [x] `npm run build` sin errores
- [x] Lint — solo warnings preexistentes
- [ ] Test funcional: crear wallet desde UI → verificar en DB
- [ ] Test funcional: guardar API key → verificar cifrado
- [ ] Test funcional: sincronizar wallet → ver transacciones

---

## Fase 2: Parser y Motor de Reglas

**Estado:** ✅ Completada — 2026-03-09

### 2.1 Transaction Parser

- [x] `classifyTransaction(transfers, walletAddress)`
- [x] `parseSwap(transfers, walletAddress)`
- [x] `parseLiquidityAdd(transfers, walletAddress)`
- [x] `parseLiquidityRemove(transfers, walletAddress)`
- [x] `isUniswapV3Interaction(toAddress)`
- [x] `parseAllTransfers(transfers, walletAddress)` — procesamiento completo
- [x] Detección de routers Uniswap V3 (SwapRouter, SwapRouter02, NonfungiblePositionManager)
- **Archivo:** `code/lib/finance/onchain/parser.ts`

### 2.2 Cliente Hyperliquid

- [x] `fetchHyperliquidTrades(walletAddress, startTime?)`
- [x] `fetchHyperliquidPositions(walletAddress)`
- [x] `normalizeHyperliquidTrade(fill)` — convertir a formato OnchainTransaction
- **Archivo:** `code/lib/finance/onchain/hyperliquid-client.ts`

### 2.3 Orquestador de Sincronización

- [x] `syncWallet(walletId, userId)` — flujo completo (Covalent + Hyperliquid + dedup + classify + upsert)
- [x] `syncAllActiveWallets(userId)`
- [x] Rango de fechas: último sync o 6 meses para inicial
- **Archivo:** `code/lib/finance/onchain/sync.ts`

### 2.4 UI — Detalle de Transacción

- [x] Página `/dashboard/finance/onchain/tx/[txId]/page.tsx` con raw data, evento fiscal y reclasificación manual
- [x] `TransactionReclassify.tsx` — componente client para reclasificar tipo de transacción

### Verificación Fase 2

- [ ] Sincronizar wallet → transacciones clasificadas (SWAP, LP, TRANSFER)
- [ ] Verificar detección de Uniswap V3
- [ ] Verificar trades Hyperliquid con `dataSource = HYPERLIQUID`
- [ ] Reclasificar manualmente → verificar cambio en DB

---

## Fase 3: Cálculo Fiscal y Automatización

**Estado:** ✅ Completada — 2026-03-09

### 3.1 Motor Fiscal

- [x] `calculateAverageCost(inventory, newAmount, newCostUSD, newCostMXN)`
- [x] `processBatchFiscalEvents(walletId)` — Costo Promedio SAT
- [x] `generateFiscalSummary(userId, period?)`
- [x] `recalculateFiscalEvents(walletId)` — re-procesar desde cero
- [x] Uso de `prisma.$transaction()` para atomicidad
- **Archivo:** `code/lib/finance/onchain/fiscal-engine.ts`

### 3.2 Cron Endpoint

- [x] `POST /api/cron/onchain` protegido con `CRON_SECRET`
- [x] Sync + fiscal processing para todos los usuarios con Covalent
- **Archivo:** `code/app/api/cron/onchain/route.ts`
- [ ] Agregar `CRON_SECRET` a `.env.local`
- [ ] Configurar trigger en n8n

### 3.3 UI — Reportes

- [x] Página de reportes `/dashboard/finance/onchain/reports/page.tsx`
- [x] `FiscalSummaryCard.tsx` — resumen ganancia/pérdida
- [x] `FiscalReportTable.tsx` — tabla detallada de eventos fiscales
- [x] `OnchainPortfolioChart.tsx` — pie chart de holdings por costo base (recharts)
- [x] `GainLossChart.tsx` — bar chart mensual ganancia/pérdida por periodo (recharts)

### 3.4 Server Actions Fase 3

- [x] `recalculateWalletFiscalEvents(walletId)`
- [x] `triggerWalletSync` incluye clasificación + procesamiento fiscal automático

### Verificación Fase 3

- [ ] Ejecutar cálculo fiscal → verificar G/P por transacción
- [ ] Verificar inventario de tokens actualizado
- [ ] Probar cron endpoint con curl
- [ ] Verificar reportes/gráficos con datos correctos
- [ ] Build completo sin errores ✅

---

## Archivos Creados/Modificados

| Archivo | Tipo | Fase |
|---------|------|------|
| `code/prisma/schema.prisma` | Modificado | 1 |
| `code/prisma/migrations/20260309015520_*` | Nuevo | 1 |
| `code/lib/validations/onchain.ts` | Nuevo | 1 |
| `code/lib/ai/types.ts` | Modificado | 1 |
| `code/lib/ai/encryption.ts` | Modificado | 1 |
| `code/lib/finance/onchain/covalent-client.ts` | Nuevo | 1 |
| `code/lib/finance/onchain/hyperliquid-client.ts` | Nuevo | 2 |
| `code/lib/finance/onchain/parser.ts` | Nuevo | 2 |
| `code/lib/finance/onchain/sync.ts` | Nuevo | 2 |
| `code/lib/finance/onchain/fiscal-engine.ts` | Nuevo | 3 |
| `code/app/dashboard/finance/onchain/actions.ts` | Nuevo | 1 |
| `code/app/dashboard/finance/onchain/page.tsx` | Nuevo | 1 |
| `code/app/dashboard/finance/onchain/reports/page.tsx` | Nuevo | 3 |
| `code/app/api/cron/onchain/route.ts` | Nuevo | 3 |
| `code/components/finance/FinanceModeTabs.tsx` | Modificado | 1 |
| `code/components/finance/onchain/WalletForm.tsx` | Nuevo | 1 |
| `code/components/finance/onchain/WalletList.tsx` | Nuevo | 1 |
| `code/components/finance/onchain/SyncButton.tsx` | Nuevo | 1 |
| `code/components/finance/onchain/TransactionTypeBadge.tsx` | Nuevo | 1 |
| `code/components/finance/onchain/OnchainTransactionTable.tsx` | Nuevo | 1 |
| `code/components/finance/onchain/CovalentKeyForm.tsx` | Nuevo | 1 |
| `code/components/finance/onchain/FiscalSummaryCard.tsx` | Nuevo | 3 |
| `code/components/finance/onchain/FiscalReportTable.tsx` | Nuevo | 3 |
| `code/components/finance/onchain/GainLossChart.tsx` | Nuevo | 3 |
| `code/components/finance/onchain/OnchainPortfolioChart.tsx` | Nuevo | 3 |
| `code/components/finance/onchain/TransactionReclassify.tsx` | Nuevo | 2 |
| `code/app/dashboard/finance/onchain/tx/[txId]/page.tsx` | Nuevo | 2 |

---

## Pendientes Globales

- [ ] Instalar `viem` para ABI decoding avanzado
- [x] Página detalle de transacción individual (`tx/[txId]/page.tsx`)
- [x] Gráficos recharts (portfolio pie chart + gain/loss bar chart)
- [ ] Agregar `CRON_SECRET` a `.env.local`
- [ ] Configurar n8n webhook para cron diario
- [ ] Tests funcionales end-to-end con wallet real
- [ ] Reporte en `docs/` tras confirmación funcional
- [ ] Commit al repositorio principal
