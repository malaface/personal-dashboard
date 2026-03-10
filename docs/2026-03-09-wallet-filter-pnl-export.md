# Wallet Filter, Time Filter, P&L por Token y CSV Export

**Fecha:** 2026-03-09
**PR:** #13
**Branch:** `feature/wallet-filter-pnl-export`

---

## Problema

1. Las transacciones on-chain se mostraban mezcladas sin identificar a qué wallet pertenecen
2. No había forma de filtrar por periodo de tiempo (semana, mes, año fiscal)
3. El reporte fiscal no mostraba la comparación precio de compra vs venta por unidad
4. No existía un resumen de P&L por token para reportes SAT
5. No se podían exportar los datos para importar a Google Sheets

## Solución

### Feature 1: Wallet Name + Filtro por Wallet
- Se agregó `wallet: { select: { id, label } }` al include de transacciones en `page.tsx`
- Nueva columna "Wallet" en la tabla de transacciones
- Dropdown de filtro por wallet (visible cuando hay >1 wallet)

### Feature 2: Filtro Temporal
- Botones de filtro: **Todo**, **1 Sem**, **1 Mes**, **6 Meses** + años dinámicos del data (ej. 2025, 2026)
- Implementado tanto en transacciones (`OnchainTransactionTable`) como en reportes fiscales (`FiscalReportClient`)
- El filtro temporal se combina con los demás filtros (tipo, wallet)
- Se aumentó el límite de transacciones de 200 a 1000 para soportar históricos

### Feature 3: P&L por Token (SAT - Costo Promedio)

**Columnas de precio por unidad en FiscalReportTable:**
- "P. Costo Prom." = costBasisMXN / tokenSoldAmount
- "P. Venta" = proceedsMXN / tokenSoldAmount

**Nuevo componente TokenPnLSummary:**
- Tabla de ganancia/pérdida realizada por token: cant. vendida, costo base, ingresos, precio promedio compra/venta, G/P, # operaciones
- Ordenado por |G/P| descendente (stablecoins quedan al final)
- Sección de holdings actuales con costo promedio y valor en costo total

### Feature 4: Exportación CSV (Google Sheets)
- **Transacciones:** botón "Exportar CSV" con todos los campos (fecha, wallet, tipo, tokens, gas, G/P, hash)
- **Eventos fiscales:** botón "Exportar Eventos CSV" con detalle por evento (precios, G/P, tipo de cambio)
- **P&L por token:** botón "Exportar P&L CSV" con resumen agregado por token
- Todos los CSVs incluyen BOM UTF-8 (`\uFEFF`) para correcta interpretación de caracteres especiales en Google Sheets

### FiscalReportClient (wrapper)
- Nuevo componente client-side que envuelve FiscalReportTable + TokenPnLSummary
- Maneja filtro temporal y recalcula tokenPnL dinámicamente según el periodo seleccionado
- Centraliza los botones de exportación

## Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `code/app/dashboard/finance/onchain/page.tsx` | wallet include, take 1000, wallets prop |
| `code/app/dashboard/finance/onchain/reports/page.tsx` | usa FiscalReportClient, avgCostBasisMXN |
| `code/components/finance/onchain/OnchainTransactionTable.tsx` | wallet col, time filter, CSV export |
| `code/components/finance/onchain/FiscalReportTable.tsx` | columnas precio por unidad |
| `code/components/finance/onchain/FiscalReportClient.tsx` | **nuevo** - wrapper con filtros + export |
| `code/components/finance/onchain/TokenPnLSummary.tsx` | **nuevo** - P&L por token + holdings |
| `code/lib/finance/onchain/fiscal-engine.ts` | expanded select (tokenSoldAmount, prices) |

## Notas Técnicas
- No requiere cambios de schema ni migraciones
- Los filtros son client-side (datos ya cargados server-side)
- El P&L no realizado no se incluye (requeriría API de precios actuales)
- CSV es el formato más compatible para importar directamente a Google Sheets (File > Import > Upload)
