# Finance Module v2.0 - Cuentas, Tarjetas de Credito y Tipos de Transaccion Expandidos

**Fecha:** 2026-02-14
**Version:** v2.0
**Branch:** feature/github-actions-branch-workflow

## Resumen

Implementacion completa del modulo de finanzas v2.0 que incluye:
1. **8 tipos de transaccion** expandidos (antes solo 2: Income/Expense)
2. **Cuentas financieras** (debito, efectivo, ahorro) con balance total
3. **Tarjetas de credito** con limite, tasa de interes, dia de corte/pago, indicador post-corte y contador de dias para pagar
4. **Widget Top 3** tarjetas recomendadas para comprar en el dashboard

## Cambios Realizados

### Base de Datos (Prisma)

**Nuevos modelos:**
- `FinancialAccount` - Cuentas financieras (debito, efectivo, ahorro)
- `CreditCard` - Tarjetas de credito con limite, tasa, corte/pago

**Nuevo enum:**
- `AccountType` (DEBIT_CARD, CASH, SAVINGS)

**Modelo Transaction actualizado:**
- Nuevos campos: `fromAccountId`, `creditCardId`, `toAccountId`
- Nuevos indices: `[fromAccountId]`, `[creditCardId]`
- Relaciones con FinancialAccount y CreditCard (onDelete: SetNull)

**Migracion:** `20260214225453_add_financial_accounts_and_credit_cards`

### Catalog Items (Seeds)

**8 tipos de transaccion (nivel 1):**
| Tipo | Color | Descripcion |
|------|-------|-------------|
| Ingreso | Verde (#10B981) | Dinero recibido |
| Gasto | Rojo (#EF4444) | Dinero gastado |
| Pago | Ambar (#F59E0B) | Pagos de servicios y deudas |
| Transferencia | Azul (#3B82F6) | Movimientos entre cuentas |
| Reembolso | Morado (#8B5CF6) | Dinero devuelto |
| Compra a Meses | Rosa (#EC4899) | Compras a MSI/con intereses |
| Pago de Tarjeta | Teal (#14B8A6) | Pagos a tarjetas de credito |
| Devolucion en Efectivo | Indigo (#6366F1) | Devoluciones en efectivo |

**Total catalog items:** 91 (finance) + 95 (gym) + nutrition + family = 218 total

**Idioma:** Todos los nombres traducidos al espanol (Income→Ingreso, Expense→Gasto, etc.)

### Archivos Creados (21 archivos)

**Utilidades:**
- `code/lib/finance/card-utils.ts` - Calculo de dias para pagar, deteccion post-corte, Top 3 cards
- `code/lib/finance/account-utils.ts` - Calculo de balance total

**Server Actions:**
- `code/app/dashboard/finance/accounts/actions.ts` - CRUD cuentas financieras
- `code/app/dashboard/finance/cards/actions.ts` - CRUD tarjetas de credito

**Componentes:**
- `code/components/finance/accounts/FinancialAccountForm.tsx` - Formulario de cuenta
- `code/components/finance/accounts/FinancialAccountList.tsx` - Lista de cuentas con balance total
- `code/components/finance/accounts/AccountSelector.tsx` - Dropdown selector de cuenta
- `code/components/finance/cards/CreditCardForm.tsx` - Formulario de tarjeta
- `code/components/finance/cards/CreditCardList.tsx` - Lista con indicadores de color/dias
- `code/components/finance/cards/CreditCardSelector.tsx` - Dropdown selector de tarjeta
- `code/components/finance/cards/Top3CardsWidget.tsx` - Widget top 3 tarjetas

**Paginas:**
- `code/app/dashboard/finance/accounts/page.tsx` - Lista de cuentas
- `code/app/dashboard/finance/accounts/new/page.tsx` - Nueva cuenta
- `code/app/dashboard/finance/accounts/[id]/edit/page.tsx` - Editar cuenta
- `code/app/dashboard/finance/cards/page.tsx` - Lista de tarjetas + Top3
- `code/app/dashboard/finance/cards/new/page.tsx` - Nueva tarjeta
- `code/app/dashboard/finance/cards/[id]/edit/page.tsx` - Editar tarjeta

**API Routes:**
- `code/app/api/finance/cards/recommendations/route.ts` - GET top 3 tarjetas
- `code/app/api/finance/accounts/balance/route.ts` - GET balance total
- `code/app/api/finance/accounts/list/route.ts` - GET lista de cuentas (para TransactionForm)
- `code/app/api/finance/cards/list/route.ts` - GET lista de tarjetas (para TransactionForm)

### Archivos Modificados (7 archivos)

- `code/prisma/schema.prisma` - Nuevos modelos y relaciones
- `code/prisma/seeds/catalog-items.ts` - 8 tipos de transaccion en espanol
- `code/lib/validations/finance.ts` - Schemas para FinancialAccount y CreditCard
- `code/app/dashboard/finance/actions.ts` - Soporte fromAccountId/creditCardId/toAccountId
- `code/components/finance/TransactionForm.tsx` - Seccion "Origen de Fondos"
- `code/app/dashboard/finance/page.tsx` - Tabs de navegacion + widgets
- `code/lib/finance/progress.ts` - isIncomeTransaction reconoce reembolso/devolucion
- `code/components/finance/TransactionList.tsx` - isIncome reconoce nuevos tipos
- `code/components/finance/QuickCategoryBar.tsx` - isIncome reconoce nuevos tipos

## Logica del Contador de Dias

```
Si hoy <= dia de corte → pago sera dia_pago del mes siguiente
Si hoy > dia de corte → pago sera dia_pago de 2 meses despues
Retorna dias restantes
```

## Logica Post-Corte

```
Post-corte = true si estamos entre cutoffDay+1 y cutoffDay+20
(ventana optima de compra: cargos van al siguiente periodo)
```

## Estrategia de Migracion

- **Sin breaking changes**: campos nuevos en Transaction son nullable
- **Transacciones existentes** siguen funcionando sin cuenta/tarjeta
- **Seeds**: eliminan items existentes y recrean con nuevos tipos
- **Gradual**: usuarios crean cuentas/tarjetas primero, luego las usan

## Verificacion

- [x] `npx prisma migrate dev` sin errores
- [x] `npm run prisma:seed` crea 91 items de finanzas (8 tipos + subcategorias)
- [x] `npm run build` sin errores TypeScript
- [x] `npx tsc --noEmit` sin errores
- [x] Tablas `financial_accounts` y `credit_cards` creadas
- [x] Columnas `fromAccountId`, `creditCardId`, `toAccountId` en transactions
- [x] Dark mode soportado en todos los componentes
- [x] Responsive (mobile) en formularios y listas
