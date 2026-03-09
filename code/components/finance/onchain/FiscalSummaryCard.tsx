interface FiscalSummaryCardProps {
  summary: {
    totalEvents: number
    totalGainLossUSD: number
    totalGainLossMXN: number
    totalCostBasisUSD: number
    totalProceedsUSD: number
    totalGasFees: number
  }
}

export default function FiscalSummaryCard({ summary }: FiscalSummaryCardProps) {
  const isProfit = summary.totalGainLossMXN >= 0

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className={`rounded-lg p-4 ${isProfit ? "bg-green-50 dark:bg-green-900/20" : "bg-red-50 dark:bg-red-900/20"}`}>
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Ganancia/Pérdida (MXN)</p>
        <p className={`text-xl font-bold mt-1 ${isProfit ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
          {isProfit ? "+" : ""}${summary.totalGainLossMXN.toLocaleString("es-MX", { maximumFractionDigits: 2 })}
        </p>
      </div>

      <div className="rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Ganancia/Pérdida (USD)</p>
        <p className={`text-xl font-bold mt-1 ${summary.totalGainLossUSD >= 0 ? "text-green-700 dark:text-green-300" : "text-red-700 dark:text-red-300"}`}>
          {summary.totalGainLossUSD >= 0 ? "+" : ""}${summary.totalGainLossUSD.toLocaleString("en-US", { maximumFractionDigits: 2 })}
        </p>
      </div>

      <div className="rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Eventos Fiscales</p>
        <p className="text-xl font-bold mt-1 text-gray-900 dark:text-white">{summary.totalEvents}</p>
      </div>

      <div className="rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Gas Total (USD)</p>
        <p className="text-xl font-bold mt-1 text-gray-900 dark:text-white">
          ${summary.totalGasFees.toLocaleString("en-US", { maximumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  )
}
