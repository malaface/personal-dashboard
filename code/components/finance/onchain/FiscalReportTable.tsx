interface FiscalEvent {
  id: string
  fiscalPeriod: string
  costBasisUSD: number
  costBasisMXN: number
  proceedsUSD: number
  proceedsMXN: number
  gainLossUSD: number
  gainLossMXN: number
  gasFeeDeduction: number
  exchangeRate: number
  transaction: {
    tokenSoldSymbol: string | null
    tokenBoughtSymbol: string | null
    timestamp: Date
    dataSource: string
  }
}

interface FiscalReportTableProps {
  events: FiscalEvent[]
}

export default function FiscalReportTable({ events }: FiscalReportTableProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>No hay eventos fiscales procesados</p>
        <p className="text-sm mt-1">Sincroniza y procesa transacciones para generar el reporte fiscal</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
            <th className="py-2 px-3 font-medium text-gray-500 dark:text-gray-400">Fecha</th>
            <th className="py-2 px-3 font-medium text-gray-500 dark:text-gray-400">Periodo</th>
            <th className="py-2 px-3 font-medium text-gray-500 dark:text-gray-400">Operación</th>
            <th className="py-2 px-3 font-medium text-gray-500 dark:text-gray-400">Costo Base</th>
            <th className="py-2 px-3 font-medium text-gray-500 dark:text-gray-400">Ingresos</th>
            <th className="py-2 px-3 font-medium text-gray-500 dark:text-gray-400">G/P (MXN)</th>
            <th className="py-2 px-3 font-medium text-gray-500 dark:text-gray-400">Gas</th>
            <th className="py-2 px-3 font-medium text-gray-500 dark:text-gray-400">TC</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr
              key={event.id}
              className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <td className="py-2 px-3 text-gray-900 dark:text-white whitespace-nowrap">
                {new Date(event.transaction.timestamp).toLocaleDateString("es-MX", {
                  month: "short",
                  day: "numeric",
                })}
              </td>
              <td className="py-2 px-3 text-gray-600 dark:text-gray-400">{event.fiscalPeriod}</td>
              <td className="py-2 px-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                {event.transaction.tokenSoldSymbol} → {event.transaction.tokenBoughtSymbol}
              </td>
              <td className="py-2 px-3 text-gray-700 dark:text-gray-300">
                ${event.costBasisMXN.toLocaleString("es-MX", { maximumFractionDigits: 2 })}
              </td>
              <td className="py-2 px-3 text-gray-700 dark:text-gray-300">
                ${event.proceedsMXN.toLocaleString("es-MX", { maximumFractionDigits: 2 })}
              </td>
              <td className={`py-2 px-3 font-medium ${
                event.gainLossMXN >= 0
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}>
                {event.gainLossMXN >= 0 ? "+" : ""}${event.gainLossMXN.toLocaleString("es-MX", { maximumFractionDigits: 2 })}
              </td>
              <td className="py-2 px-3 text-gray-500 dark:text-gray-400">
                ${event.gasFeeDeduction.toFixed(2)}
              </td>
              <td className="py-2 px-3 text-gray-500 dark:text-gray-400 text-xs">
                {event.exchangeRate.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
