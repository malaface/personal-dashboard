import { requireAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/db/prisma"
import FinanceModeTabs from "@/components/finance/FinanceModeTabs"
import CovalentKeyForm from "@/components/finance/onchain/CovalentKeyForm"
import ArbiscanKeyForm from "@/components/finance/onchain/ArbiscanKeyForm"
import WalletForm from "@/components/finance/onchain/WalletForm"
import WalletList from "@/components/finance/onchain/WalletList"
import OnchainTransactionTable from "@/components/finance/onchain/OnchainTransactionTable"
import FiscalSummaryCard from "@/components/finance/onchain/FiscalSummaryCard"
import Link from "next/link"

export default async function OnchainPage() {
  const user = await requireAuth()

  const [
    accountCount,
    cardCount,
    walletCount,
    hasCovalentKey,
    hasArbiscanKey,
    wallets,
    transactions,
    fiscalEvents,
  ] = await Promise.all([
    prisma.financialAccount.count({
      where: { userId: user.id, isActive: true },
    }),
    prisma.creditCard.count({
      where: { userId: user.id, isActive: true },
    }),
    prisma.onchainWallet.count({
      where: { userId: user.id },
    }),
    prisma.aICredential
      .findFirst({
        where: { userId: user.id, provider: "COVALENT", isActive: true },
        select: { id: true },
      })
      .then((c) => !!c),
    prisma.aICredential
      .findFirst({
        where: { userId: user.id, provider: "ARBISCAN", isActive: true },
        select: { id: true },
      })
      .then((c) => !!c),
    prisma.onchainWallet.findMany({
      where: { userId: user.id },
      include: {
        _count: { select: { transactions: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.onchainTransaction.findMany({
      where: { wallet: { userId: user.id } },
      include: {
        wallet: {
          select: { id: true, label: true },
        },
        fiscalEvent: {
          select: { gainLossUSD: true, gainLossMXN: true },
        },
      },
      orderBy: { timestamp: "desc" },
      take: 1000,
    }),
    prisma.onchainFiscalEvent.findMany({
      where: { transaction: { wallet: { userId: user.id } } },
      select: {
        gainLossUSD: true,
        gainLossMXN: true,
        costBasisUSD: true,
        proceedsUSD: true,
        gasFeeDeduction: true,
      },
    }),
  ])

  const fiscalSummary = {
    totalEvents: fiscalEvents.length,
    totalGainLossUSD: fiscalEvents.reduce((s, e) => s + e.gainLossUSD, 0),
    totalGainLossMXN: fiscalEvents.reduce((s, e) => s + e.gainLossMXN, 0),
    totalCostBasisUSD: fiscalEvents.reduce((s, e) => s + e.costBasisUSD, 0),
    totalProceedsUSD: fiscalEvents.reduce((s, e) => s + e.proceedsUSD, 0),
    totalGasFees: fiscalEvents.reduce((s, e) => s + e.gasFeeDeduction, 0),
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Finanzas
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Tracker fiscal on-chain — Arbitrum / Hyperliquid
            </p>
          </div>
          {fiscalEvents.length > 0 && (
            <Link
              href="/dashboard/finance/onchain/reports"
              className="px-4 py-2 text-sm font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
            >
              Ver Reporte Fiscal
            </Link>
          )}
        </div>

        <FinanceModeTabs
          accountCount={accountCount}
          cardCount={cardCount}
          walletCount={walletCount}
        />

        {/* API Key Configuration */}
        <div className="mb-6 space-y-3">
          <ArbiscanKeyForm hasKey={hasArbiscanKey} />
          <CovalentKeyForm hasKey={hasCovalentKey} />
        </div>

        {/* Fiscal Summary */}
        {fiscalEvents.length > 0 && (
          <div className="mb-6">
            <FiscalSummaryCard summary={fiscalSummary} />
          </div>
        )}

        {/* Wallets Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Wallets
            </h2>
            <WalletForm />
          </div>
          <WalletList wallets={wallets} />
        </div>

        {/* Transactions Table */}
        {transactions.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Transacciones On-Chain
            </h2>
            <OnchainTransactionTable
              transactions={transactions}
              wallets={wallets.map((w) => ({ id: w.id, label: w.label }))}
            />
          </div>
        )}
      </div>
    </div>
  )
}
