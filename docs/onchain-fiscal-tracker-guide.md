# On-Chain Fiscal Tracker — Guia de Usuario

> Modulo para rastrear transacciones on-chain (Arbitrum/Ethereum), calcular eventos fiscales con metodo Costo Promedio (SAT Mexico) y generar reportes de ganancia/perdida.

---

## Requisitos Previos

1. **Cuenta activa** en el dashboard
2. **API Key de Covalent GoldRush** — obtenerla gratis en [goldrush.dev](https://goldrush.dev/). Necesaria para extraer transacciones de Arbitrum/Ethereum
3. **Wallet address** — direccion Ethereum (0x...) que quieras rastrear

---

## Configuracion Inicial

### 1. Guardar API Key de Covalent

1. Ir a **Finanzas → On-Chain**
2. En la seccion "Configuracion API Key", pegar tu API key de Covalent
3. Click en **Guardar**
4. La key se almacena cifrada en la base de datos

### 2. Agregar Wallets

1. En la seccion "Wallets", click en **Agregar Wallet**
2. Completar:
   - **Direccion**: tu wallet (formato 0x + 40 caracteres hex)
   - **Nombre**: etiqueta descriptiva (ej. "Main Arbitrum", "Trading Wallet")
   - **Red**: Arbitrum o Ethereum
3. Click en **Guardar**

> Puedes agregar multiples wallets. Cada una se sincroniza y calcula de forma independiente.

---

## Uso Diario

### Sincronizar Transacciones

1. En la lista de wallets, click en **Sincronizar** junto a la wallet deseada
2. El sistema:
   - Extrae transferencias ERC-20 via Covalent
   - Obtiene trades de Hyperliquid (automatico, sin API key)
   - Clasifica cada transaccion (Swap, LP Add, LP Remove, Transfer In/Out, etc.)
   - Calcula eventos fiscales para los swaps detectados
3. Al terminar muestra cuantas transacciones nuevas se encontraron

> La primera sincronizacion cubre los ultimos 6 meses. Las siguientes solo traen datos desde la ultima sync.

### Ver Transacciones

- La tabla principal muestra todas las transacciones con filtros por tipo
- **Filtros disponibles**: Todas, Swap, LP Add, LP Remove, Transfer In, Transfer Out, Unknown
- Cada fila muestra: fecha, tipo, token vendido/comprado, gas, ganancia/perdida, fuente
- **Click en cualquier fila** para ver el detalle completo

### Detalle de Transaccion

En la pagina de detalle (`/dashboard/finance/onchain/tx/[id]`) puedes ver:

- **Informacion general**: hash (con link al explorador), fecha, wallet, red, bloque, estado
- **Tokens**: detalles de token vendido y comprado (cantidad, precio USD, direccion del contrato)
- **Gas**: costo en ETH y USD
- **Evento fiscal**: si es un swap procesado, muestra costo base, ingresos, ganancia/perdida en USD y MXN, tipo de cambio usado, periodo fiscal
- **Reclasificar**: si la clasificacion automatica fue incorrecta, puedes cambiar el tipo manualmente
- **Raw Data**: datos crudos del API para verificacion

### Reclasificar Transacciones

Si el parser automatico clasifico mal una transaccion:

1. Abrir el detalle de la transaccion
2. En "Reclasificar Transaccion", seleccionar el tipo correcto
3. Click en **Reclasificar**
4. El estado cambia a "MANUALLY OVERRIDDEN"

> Despues de reclasificar swaps, considera recalcular los eventos fiscales de la wallet.

---

## Reportes Fiscales

### Acceder a Reportes

1. Click en **Ver Reporte Fiscal** (boton morado en la pagina On-Chain)
2. O navegar directamente a `/dashboard/finance/onchain/reports`

### Contenido del Reporte

- **Resumen general**: ganancia/perdida total (USD y MXN), cantidad de eventos, gas total
- **Grafico de barras**: ganancia/perdida por periodo mensual (barras verdes = ganancia, rojas = perdida)
- **Grafico de pie**: distribucion del portfolio actual por costo base en USD
- **Resumen por periodo**: cards con G/P mensual y cantidad de eventos
- **Tabla detallada**: cada evento fiscal con costo base, ingresos, G/P, gas, tipo de cambio

---

## Tipos de Transaccion

| Tipo | Descripcion | Genera evento fiscal |
|------|-------------|---------------------|
| **Swap** | Intercambio de un token por otro (ej. ETH → USDC) | Si |
| **LP Add** | Deposito de tokens en pool de liquidez | No |
| **LP Remove** | Retiro de tokens de pool de liquidez | No |
| **Transfer In** | Recepcion de tokens desde otra wallet | No |
| **Transfer Out** | Envio de tokens a otra wallet | No |
| **Approval** | Aprobacion de gasto de tokens | No |
| **Bridge** | Transferencia entre redes | No |
| **Unknown** | No clasificado | No |

> Solo las transacciones tipo **Swap** generan eventos fiscales con calculo de ganancia/perdida.

---

## Metodo Fiscal: Costo Promedio (SAT)

El modulo usa el metodo de **Costo Promedio** requerido por el SAT en Mexico:

1. Al **comprar** un token, se recalcula el costo promedio ponderado del inventario
2. Al **vender** (swap), la ganancia/perdida se calcula como:
   - `Ingresos = precio_venta × cantidad`
   - `Costo base = costo_promedio × cantidad`
   - `G/P = Ingresos - Costo base - Gas`
3. Los montos se calculan en **USD** y se convierten a **MXN** con el tipo de cambio del momento
4. Cada evento se asigna a un **periodo fiscal** mensual (ej. "2026-03")

---

## Fuentes de Datos

| Fuente | Que extrae | Requiere API key |
|--------|-----------|-----------------|
| **Covalent GoldRush** | Transferencias ERC-20 en Arbitrum/Ethereum | Si |
| **Hyperliquid** | Trades de perpetuos (API publica) | No |

> Hyperliquid se sincroniza automaticamente si la wallet tiene actividad en esa plataforma. Los errores de Hyperliquid no bloquean la sincronizacion de Covalent.

---

## Sincronizacion Automatica (Cron)

El endpoint `POST /api/cron/onchain` permite sincronizar todas las wallets automaticamente.

### Configuracion

1. Agregar `CRON_SECRET` al archivo `.env.local`
2. Configurar un webhook en n8n que llame al endpoint diariamente:
   ```
   POST http://localhost:3000/api/cron/onchain
   Header: Authorization: Bearer <CRON_SECRET>
   ```

---

## Navegacion Rapida

| Pagina | Ruta | Descripcion |
|--------|------|-------------|
| On-Chain principal | `/dashboard/finance/onchain` | Wallets, transacciones, sync |
| Detalle transaccion | `/dashboard/finance/onchain/tx/[id]` | Info completa + reclasificar |
| Reportes fiscales | `/dashboard/finance/onchain/reports` | Graficos + tabla fiscal |
