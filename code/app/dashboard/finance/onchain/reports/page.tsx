import { requireAuth } from "@/lib/auth/utils"
import { generateFiscalSummary } from "@/lib/finance/onchain/fiscal-engine"
import FinanceModeTabs from "@/components/finance/FinanceModeTabs"
import FiscalSummaryCard from "@/components/finance/onchain/FiscalSummaryCard"
import FiscalReportTable from "@/components/finance/onchain/FiscalReportTable"
import GainLossChart from "@/components/finance/onchain/GainLossChart"
import OnchainPortfolioChart from "@/components/finance/onchain/OnchainPortfolioChart"
import { prisma } from "@/lib/db/prisma"
import Link from "next/link"

export default async function OnchainReportsPage() {
  const user = await requireAuth()

  const [accountCount, cardCount, walletCount] = await Promise.all([
    prisma.financialAccount.count({
      where: { userId: user.id, isActive: true },
    }),
    prisma.creditCard.count({
      where: { userId: user.id, isActive: true },
    }),
    prisma.onchainWallet.count({
      where: { userId: user.id },
    }),
  ])

  const [{ events, summary }, holdings] = await Promise.all([
    generateFiscalSummary(user.id),
    prisma.onchainTokenInventory.findMany({
      where: {
        wallet: { userId: user.id },
        totalAmount: { gt: 0 },
      },
      select: {
        tokenSymbol: true,
        totalAmount: true,
        avgCostBasisUSD: true,
      },
    }),
  ])

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Finanzas
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Reporte fiscal on-chain — Método Costo Promedio (SAT)
            </p>
          </div>
          <Link
            href="/dashboard/finance/onchain"
            className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Volver a On-Chain
          </Link>
        </div>

        <FinanceModeTabs
          accountCount={accountCount}
          cardCount={cardCount}
          walletCount={walletCount}
        />

        {/* Summary */}
        <div className="mb-6">
          <FiscalSummaryCard summary={summary} />
        </div>

        {/* By Period */}
        {Object.keys(summary.byPeriod).length > 0 && (
          <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Resumen por Periodo
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(summary.byPeriod)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([period, data]) => (
                  <div
                    key={period}
                    className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
                  >
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {period}
                    </p>
                    <p
                      className={`text-lg font-bold mt-1 ${
                        data.gainLossMXN >= 0
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {data.gainLossMXN >= 0 ? "+" : ""}$
                      {data.gainLossMXN.toLocaleString("es-MX", {
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {data.count} eventos
                    </p>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Charts */}
        {Object.keys(summary.byPeriod).length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Ganancia/Perdida por Periodo
              </h2>
              <GainLossChart byPeriod={summary.byPeriod} currency="MXN" />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Portfolio (Costo Base)
              </h2>
              <OnchainPortfolioChart holdings={holdings} />
            </div>
          </div>
        )}

        {/* Detailed Events Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Detalle de Eventos Fiscales
          </h2>
          <FiscalReportTable events={events} />
        </div>
      </div>
    </div>
  )
}
