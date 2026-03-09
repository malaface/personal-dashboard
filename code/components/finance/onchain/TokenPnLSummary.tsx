interface TokenPnL {
  token: string
  soldAmount: number
  costBasisMXN: number
  proceedsMXN: number
  gainLossMXN: number
  eventCount: number
}

interface Holding {
  tokenSymbol: string
  totalAmount: number
  avgCostBasisMXN: number
}

interface TokenPnLSummaryProps {
  tokenPnL: TokenPnL[]
  holdings: Holding[]
}

export default function TokenPnLSummary({ tokenPnL, holdings }: TokenPnLSummaryProps) {
  const sorted = [...tokenPnL].sort(
    (a, b) => Math.abs(b.gainLossMXN) - Math.abs(a.gainLossMXN)
  )

  return (
    <div className="space-y-6">
      {/* P&L por Token */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Ganancia/Pérdida Realizada por Token
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                <th className="py-2 px-3 font-medium text-gray-500 dark:text-gray-400">Token</th>
                <th className="py-2 px-3 font-medium text-gray-500 dark:text-gray-400">Cant. Vendida</th>
                <th className="py-2 px-3 font-medium text-gray-500 dark:text-gray-400">Costo Base (MXN)</th>
                <th className="py-2 px-3 font-medium text-gray-500 dark:text-gray-400">Ingresos (MXN)</th>
                <th className="py-2 px-3 font-medium text-gray-500 dark:text-gray-400">P. Prom. Compra</th>
                <th className="py-2 px-3 font-medium text-gray-500 dark:text-gray-400">P. Prom. Venta</th>
                <th className="py-2 px-3 font-medium text-gray-500 dark:text-gray-400">G/P (MXN)</th>
                <th className="py-2 px-3 font-medium text-gray-500 dark:text-gray-400"># Ops</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((row) => (
                <tr
                  key={row.token}
                  className="border-b border-gray-100 dark:border-gray-800"
                >
                  <td className="py-2 px-3 font-medium text-gray-900 dark:text-white">
                    {row.token}
                  </td>
                  <td className="py-2 px-3 text-gray-700 dark:text-gray-300">
                    {row.soldAmount < 0.01
                      ? row.soldAmount.toFixed(6)
                      : row.soldAmount.toLocaleString("en-US", { maximumFractionDigits: 4 })}
                  </td>
                  <td className="py-2 px-3 text-gray-700 dark:text-gray-300">
                    ${row.costBasisMXN.toLocaleString("es-MX", { maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-3 text-gray-700 dark:text-gray-300">
                    ${row.proceedsMXN.toLocaleString("es-MX", { maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-3 text-gray-500 dark:text-gray-400 text-xs">
                    {row.soldAmount > 0
                      ? `$${(row.costBasisMXN / row.soldAmount).toLocaleString("es-MX", { maximumFractionDigits: 2 })}`
                      : "-"}
                  </td>
                  <td className="py-2 px-3 text-gray-500 dark:text-gray-400 text-xs">
                    {row.soldAmount > 0
                      ? `$${(row.proceedsMXN / row.soldAmount).toLocaleString("es-MX", { maximumFractionDigits: 2 })}`
                      : "-"}
                  </td>
                  <td className={`py-2 px-3 font-medium ${
                    row.gainLossMXN >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}>
                    {row.gainLossMXN >= 0 ? "+" : ""}${row.gainLossMXN.toLocaleString("es-MX", { maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-3 text-gray-500 dark:text-gray-400">
                    {row.eventCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Holdings actuales */}
      {holdings.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Holdings Actuales (Costo Promedio)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                  <th className="py-2 px-3 font-medium text-gray-500 dark:text-gray-400">Token</th>
                  <th className="py-2 px-3 font-medium text-gray-500 dark:text-gray-400">Saldo</th>
                  <th className="py-2 px-3 font-medium text-gray-500 dark:text-gray-400">Costo Prom. (MXN)</th>
                  <th className="py-2 px-3 font-medium text-gray-500 dark:text-gray-400">Valor en Costo (MXN)</th>
                </tr>
              </thead>
              <tbody>
                {holdings
                  .sort((a, b) => (b.totalAmount * b.avgCostBasisMXN) - (a.totalAmount * a.avgCostBasisMXN))
                  .map((h) => (
                    <tr
                      key={h.tokenSymbol}
                      className="border-b border-gray-100 dark:border-gray-800"
                    >
                      <td className="py-2 px-3 font-medium text-gray-900 dark:text-white">
                        {h.tokenSymbol}
                      </td>
                      <td className="py-2 px-3 text-gray-700 dark:text-gray-300">
                        {h.totalAmount < 0.01
                          ? h.totalAmount.toFixed(6)
                          : h.totalAmount.toLocaleString("en-US", { maximumFractionDigits: 4 })}
                      </td>
                      <td className="py-2 px-3 text-gray-500 dark:text-gray-400">
                        ${h.avgCostBasisMXN.toLocaleString("es-MX", { maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-3 text-gray-700 dark:text-gray-300">
                        ${(h.totalAmount * h.avgCostBasisMXN).toLocaleString("es-MX", { maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
