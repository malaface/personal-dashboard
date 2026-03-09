import { requireAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/db/prisma"
import { notFound } from "next/navigation"
import Link from "next/link"
import TransactionTypeBadge from "@/components/finance/onchain/TransactionTypeBadge"
import TransactionReclassify from "@/components/finance/onchain/TransactionReclassify"

interface Props {
  params: Promise<{ txId: string }>
}

export default async function TransactionDetailPage({ params }: Props) {
  const { txId } = await params
  const user = await requireAuth()

  const transaction = await prisma.onchainTransaction.findFirst({
    where: {
      id: txId,
      wallet: { userId: user.id },
    },
    include: {
      wallet: { select: { label: true, address: true, network: true } },
      fiscalEvent: true,
    },
  })

  if (!transaction) {
    notFound()
  }

  const formatAmount = (amount: number | null, symbol: string | null) => {
    if (amount === null || amount === undefined) return "-"
    const formatted =
      amount < 0.01
        ? amount.toFixed(6)
        : amount.toLocaleString("en-US", { maximumFractionDigits: 4 })
    return `${formatted} ${symbol || ""}`
  }

  const formatUSD = (value: number | null) => {
    if (value === null || value === undefined) return "-"
    return `$${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatMXN = (value: number | null) => {
    if (value === null || value === undefined) return "-"
    return `$${value.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`
  }

  const explorerUrl =
    transaction.wallet.network === "ARBITRUM"
      ? `https://arbiscan.io/tx/${transaction.txHash}`
      : `https://etherscan.io/tx/${transaction.txHash}`

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link
              href="/dashboard/finance/onchain"
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-2 inline-block"
            >
              &larr; Volver a On-Chain
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Detalle de Transaccion
            </h1>
          </div>
          <TransactionTypeBadge type={transaction.type} />
        </div>

        {/* Main Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
            Informacion General
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoRow label="Hash">
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
              >
                {transaction.txHash}
              </a>
            </InfoRow>
            <InfoRow label="Fecha">
              {new Date(transaction.timestamp).toLocaleString("es-MX", {
                dateStyle: "long",
                timeStyle: "short",
              })}
            </InfoRow>
            <InfoRow label="Wallet">
              {transaction.wallet.label} ({transaction.wallet.address.slice(0, 6)}...{transaction.wallet.address.slice(-4)})
            </InfoRow>
            <InfoRow label="Red">{transaction.wallet.network}</InfoRow>
            <InfoRow label="Bloque">{transaction.blockNumber ?? "-"}</InfoRow>
            <InfoRow label="Estado">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                transaction.status === "FISCAL_PROCESSED"
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                  : transaction.status === "MANUALLY_OVERRIDDEN"
                    ? "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
              }`}>
                {transaction.status.replace("_", " ")}
              </span>
            </InfoRow>
            <InfoRow label="Fuente">
              {transaction.dataSource === "COVALENT" ? "Covalent GoldRush" : "Hyperliquid"}
            </InfoRow>
          </div>
        </div>

        {/* Token Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Sold */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-sm font-medium text-red-500 dark:text-red-400 mb-4">
              Token Vendido
            </h2>
            {transaction.tokenSoldSymbol ? (
              <div className="space-y-3">
                <InfoRow label="Token">{transaction.tokenSoldSymbol}</InfoRow>
                <InfoRow label="Cantidad">{formatAmount(transaction.tokenSoldAmount, null)}</InfoRow>
                <InfoRow label="Precio USD">{formatUSD(transaction.tokenSoldPriceUSD)}</InfoRow>
                <InfoRow label="Direccion">
                  <span className="font-mono text-xs break-all">
                    {transaction.tokenSoldAddress || "-"}
                  </span>
                </InfoRow>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Sin datos de venta</p>
            )}
          </div>

          {/* Bought */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-sm font-medium text-green-500 dark:text-green-400 mb-4">
              Token Comprado
            </h2>
            {transaction.tokenBoughtSymbol ? (
              <div className="space-y-3">
                <InfoRow label="Token">{transaction.tokenBoughtSymbol}</InfoRow>
                <InfoRow label="Cantidad">{formatAmount(transaction.tokenBoughtAmount, null)}</InfoRow>
                <InfoRow label="Precio USD">{formatUSD(transaction.tokenBoughtPriceUSD)}</InfoRow>
                <InfoRow label="Direccion">
                  <span className="font-mono text-xs break-all">
                    {transaction.tokenBoughtAddress || "-"}
                  </span>
                </InfoRow>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Sin datos de compra</p>
            )}
          </div>
        </div>

        {/* Gas Fees */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
            Gas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoRow label="Gas (ETH)">
              {transaction.gasFeeETH ? `${transaction.gasFeeETH.toFixed(6)} ETH` : "-"}
            </InfoRow>
            <InfoRow label="Gas (USD)">{formatUSD(transaction.gasFeeUSD)}</InfoRow>
          </div>
        </div>

        {/* Fiscal Event */}
        {transaction.fiscalEvent && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <h2 className="text-sm font-medium text-purple-500 dark:text-purple-400 mb-4">
              Evento Fiscal (Costo Promedio SAT)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow label="Base de Costo (USD)">{formatUSD(transaction.fiscalEvent.costBasisUSD)}</InfoRow>
              <InfoRow label="Base de Costo (MXN)">{formatMXN(transaction.fiscalEvent.costBasisMXN)}</InfoRow>
              <InfoRow label="Ingresos (USD)">{formatUSD(transaction.fiscalEvent.proceedsUSD)}</InfoRow>
              <InfoRow label="Ingresos (MXN)">{formatMXN(transaction.fiscalEvent.proceedsMXN)}</InfoRow>
              <InfoRow label="Ganancia/Perdida (USD)">
                <span className={transaction.fiscalEvent.gainLossUSD >= 0 ? "text-green-600 dark:text-green-400 font-semibold" : "text-red-600 dark:text-red-400 font-semibold"}>
                  {transaction.fiscalEvent.gainLossUSD >= 0 ? "+" : ""}
                  {formatUSD(transaction.fiscalEvent.gainLossUSD)}
                </span>
              </InfoRow>
              <InfoRow label="Ganancia/Perdida (MXN)">
                <span className={transaction.fiscalEvent.gainLossMXN >= 0 ? "text-green-600 dark:text-green-400 font-semibold" : "text-red-600 dark:text-red-400 font-semibold"}>
                  {transaction.fiscalEvent.gainLossMXN >= 0 ? "+" : ""}
                  {formatMXN(transaction.fiscalEvent.gainLossMXN)}
                </span>
              </InfoRow>
              <InfoRow label="Deduccion Gas">{formatUSD(transaction.fiscalEvent.gasFeeDeduction)}</InfoRow>
              <InfoRow label="Tipo de Cambio">
                1 USD = {transaction.fiscalEvent.exchangeRate.toFixed(2)} MXN
              </InfoRow>
              <InfoRow label="Periodo Fiscal">{transaction.fiscalEvent.fiscalPeriod}</InfoRow>
              <InfoRow label="Metodo">{transaction.fiscalEvent.method.replace("_", " ")}</InfoRow>
            </div>
          </div>
        )}

        {/* Reclassify */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
            Reclasificar Transaccion
          </h2>
          <TransactionReclassify
            transactionId={transaction.id}
            currentType={transaction.type}
          />
        </div>

        {/* Raw Data */}
        {transaction.rawData && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
              Raw Data (API)
            </h2>
            <pre className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 text-xs font-mono text-gray-700 dark:text-gray-300 overflow-x-auto max-h-96 overflow-y-auto">
              {JSON.stringify(transaction.rawData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm text-gray-900 dark:text-white">{children}</p>
    </div>
  )
}
