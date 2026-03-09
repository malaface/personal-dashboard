# Reporte: Integración Arbiscan API + Fix Covalent API

**Fecha:** 2026-03-09
**Módulo:** On-Chain Fiscal Tracker
**Branch:** main

---

## Problema

Al intentar sincronizar wallets on-chain, la API de Covalent (GoldRush) retornaba error `400 Bad Request` y posteriormente solo traía transacciones de los últimos ~30 días debido a limitaciones del plan gratuito.

## Causa Raíz

Tres problemas identificados:

### 1. Chain ID numérico vs Chain Name
La API GoldRush migró a usar **chain names** (`arbitrum-mainnet`) en lugar de **chain IDs numéricos** (`42161`) en las URLs de los endpoints.

**Antes (incorrecto):**
```
https://api.covalenthq.com/v1/42161/address/0x.../transfers_v2/
```

**Después (correcto):**
```
https://api.covalenthq.com/v1/arbitrum-mainnet/address/0x.../transactions_v3/
```

### 2. Endpoint `transfers_v2` requiere `contract-address`
El endpoint `transfers_v2` es para transfers de un token específico, no para todos los ERC-20 transfers de una wallet. Se cambió a `transactions_v3` que devuelve transacciones completas con log events decodificados.

### 3. Plan gratuito de Covalent limitado a ~30 días
El plan gratuito solo devolvía transacciones recientes, omitiendo historial anterior.

## Solución

### Integración de Arbiscan API (Etherscan V2)
Se implementó la API de Arbiscan como fuente **primaria** de datos, con Covalent como fallback:

- **Endpoint:** `https://api.etherscan.io/api?chainid=42161&module=account&action=tokentx`
- **Ventaja:** Historial completo gratuito, sin límite de fechas
- **Paginación:** 1000 transfers por página, hasta 50 páginas (safety limit)
- **Rate limiting:** 5 calls/sec en plan gratuito, con delay de 250ms entre páginas

### Archivos Modificados/Creados

| Archivo | Cambio |
|---------|--------|
| `code/lib/finance/onchain/arbiscan-client.ts` | **Nuevo** — Cliente Arbiscan con fetching y retry |
| `code/lib/finance/onchain/covalent-client.ts` | Fix chain names + extracción de Transfer events desde `transactions_v3` |
| `code/lib/finance/onchain/sync.ts` | Selección automática de fuente (Arbiscan > Covalent) |
| `code/components/finance/onchain/ArbiscanKeyForm.tsx` | **Nuevo** — Form para API key de Arbiscan |
| `code/app/dashboard/finance/onchain/actions.ts` | Action `saveArbiscanApiKey` |
| `code/app/dashboard/finance/onchain/page.tsx` | Renderiza ambos forms de API keys |
| `code/app/api/cron/onchain/route.ts` | Busca usuarios con ARBISCAN o COVALENT |
| `code/lib/ai/types.ts` | Provider ARBISCAN agregado |
| `code/lib/ai/encryption.ts` | Validación para ARBISCAN keys |
| `code/lib/validations/onchain.ts` | Schema `ArbiscanKeySchema` |
| `code/prisma/schema.prisma` | ARBISCAN en enums `AIProvider` y `OnchainDataSource` |
| `docker-compose.yml` | `CRON_SECRET` environment variable |

### Prisma Migrations
- `20260309222352_add_arbiscan_provider` — ARBISCAN en AIProvider enum
- `20260309222437_add_arbiscan_datasource` — ARBISCAN en OnchainDataSource enum

### Cron Job
- **Frecuencia:** Diario a las 4:00 AM (Mexico City)
- **Endpoint:** `POST /api/cron/onchain` con Bearer token
- **Log:** `/var/log/dashboard-onchain-sync.log`

## Flujo de Sync Actualizado

```
1. Usuario presiona "Sincronizar" o cron ejecuta
2. fetchTransfers() busca API keys:
   a. ¿Tiene Arbiscan key? → Usa Arbiscan (historial completo)
   b. ¿Tiene Covalent key? → Usa Covalent (fallback)
   c. ¿Ninguna? → Error con mensaje claro
3. Obtiene ERC-20 transfers (formato normalizado)
4. Parser clasifica: SWAP, LP_ADD, LP_REMOVE, TRANSFER_IN/OUT
5. Filtra por lastSyncAt (o todo el historial si es primer sync)
6. Upsert transacciones en DB
7. Fetch Hyperliquid trades (fuente separada)
8. Actualiza lastSyncAt
9. Procesa eventos fiscales
```

## Estado

- ✅ Covalent API fix (chain names + transactions_v3)
- ✅ Arbiscan API integration
- ✅ UI para ambas API keys
- ✅ Sync automático con selección de fuente
- ✅ Cron diario configurado
- ✅ Migrations aplicadas
- ⏳ Pendiente: verificar sync completo con Arbiscan key
