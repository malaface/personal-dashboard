"use client"

import { useState, useMemo } from "react"
import TransactionTypeBadge from "./TransactionTypeBadge"

interface OnchainTx {
  id: string
  txHash: string
  timestamp: Date
  type: string
  status: string
  dataSource: string
  tokenSoldSymbol: string | null
  tokenSoldAmount: number | null
  tokenBoughtSymbol: string | null
  tokenBoughtAmount: number | null
  gasFeeUSD: number | null
  wallet: {
    id: string
    label: string
  }
  fiscalEvent: {
    gainLossUSD: number
    gainLossMXN: number
  } | null
}

interface OnchainTransactionTableProps {
  transactions: OnchainTx[]
  wallets: { id: string; label: string }[]
}

const PAGE_SIZE = 20

function getAvailableYears(transactions: OnchainTx[]): number[] {
  const years = new Set<number>()
  for (const tx of transactions) {
    years.add(new Date(tx.timestamp).getFullYear())
  }
  return Array.from(years).sort((a, b) => b - a)
}

function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export default function OnchainTransactionTable({ transactions, wallets }: OnchainTransactionTableProps) {
  const [page, setPage] = useState(0)
  const [filterType, setFilterType] = useState<string>("ALL")
  const [filterWallet, setFilterWallet] = useState<string>("ALL")
  const [filterTime, setFilterTime] = useState<string>("ALL")

  const years = useMemo(() => getAvailableYears(transactions), [transactions])

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (filterType !== "ALL" && tx.type !== filterType) return false
      if (filterWallet !== "ALL" && tx.wallet.id !== filterWallet) return false
      if (filterTime !== "ALL") {
        const txDate = new Date(tx.timestamp)
        if (/^\d{4}$/.test(filterTime)) {
          if (txDate.getFullYear() !== parseInt(filterTime)) return false
        } else {
          const now = new Date()
          let cutoff: Date
          switch (filterTime) {
            case "1W": cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7); break
            case "1M": cutoff = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()); break
            case "6M": cutoff = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate()); break
            default: cutoff = new Date(0)
          }
          if (txDate < cutoff) return false
        }
      }
      return true
    })
  }, [transactions, filterType, filterWallet, filterTime])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const formatAmount = (amount: number | null, symbol: string | null) => {
    if (amount === null || amount === undefined) return "-"
    const formatted = amount < 0.01 ? amount.toFixed(6) : amount.toLocaleString("en-US", { maximumFractionDigits: 4 })
    return `${formatted} ${symbol || ""}`
  }

  const formatHash = (hash: string) => {
    if (hash.length <= 14) return hash
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>No hay transacciones</p>
        <p className="text-sm mt-1">Sincroniza una wallet para ver sus transacciones</p>
      </div>
    )
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          {["ALL", "SWAP", "LP_ADD", "LP_REMOVE", "TRANSFER_IN", "TRANSFER_OUT", "UNKNOWN"].map((type) => (
            <button
              key={type}
              onClick={() => { setFilterType(type); setPage(0) }}
              className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                filterType === type
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {type === "ALL" ? "Todas" : type.replace("_", " ")}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {(["ALL", "1W", "1M", "6M"] as const).map((opt) => {
            const label = opt === "ALL" ? "Todo" : opt === "1W" ? "1 Sem" : opt === "1M" ? "1 Mes" : "6 Meses"
            return (
              <button
                key={opt}
                onClick={() => { setFilterTime(opt); setPage(0) }}
                className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                  filterTime === opt
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                {label}
              </button>
            )
          })}
          {years.map((year) => (
            <button
              key={year}
              onClick={() => { setFilterTime(String(year)); setPage(0) }}
              className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                filterTime === String(year)
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {year}
            </button>
          ))}
        </div>
        {wallets.length > 1 && (
          <select
            value={filterWallet}
            onChange={(e) => { setFilterWallet(e.target.value); setPage(0) }}
            className="px-3 py-1 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
          >
            <option value="ALL">Todas las wallets</option>
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>{w.label}</option>
            ))}
          </select>
        )}
        <button
          onClick={() => {
            const headers = ["Fecha", "Wallet", "Tipo", "Token Vendido", "Cant. Vendida", "Token Comprado", "Cant. Comprada", "Gas (USD)", "G/P (USD)", "G/P (MXN)", "Fuente", "Hash"]
            const rows = filtered.map((tx) => [
              new Date(tx.timestamp).toISOString().split("T")[0],
              tx.wallet.label,
              tx.type,
              tx.tokenSoldSymbol || "",
              tx.tokenSoldAmount ?? "",
              tx.tokenBoughtSymbol || "",
              tx.tokenBoughtAmount ?? "",
              tx.gasFeeUSD?.toFixed(2) ?? "",
              tx.fiscalEvent?.gainLossUSD.toFixed(2) ?? "",
              tx.fiscalEvent?.gainLossMXN.toFixed(2) ?? "",
              tx.dataSource,
              tx.txHash,
            ].join(","))
            downloadCSV(`transacciones-onchain-${filterTime === "ALL" ? "completo" : filterTime}.csv`, [headers.join(","), ...rows].join("\n"))
          }}
          disabled={filtered.length === 0}
          className="ml-auto px-3 py-1 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors whitespace-nowrap"
        >
          Exportar CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
              <th className="py-2 px-3 font-medium text-gray-500 dark:text-gray-400">Fecha</th>
              <th className="py-2 px-3 font-medium text-gray-500 dark:text-gray-400">Wallet</th>
              <th className="py-2 px-3 font-medium text-gray-500 dark:text-gray-400">Tipo</th>
              <th className="py-2 px-3 font-medium text-gray-500 dark:text-gray-400">Vendido</th>
              <th className="py-2 px-3 font-medium text-gray-500 dark:text-gray-400">Comprado</th>
              <th className="py-2 px-3 font-medium text-gray-500 dark:text-gray-400">Gas (USD)</th>
              <th className="py-2 px-3 font-medium text-gray-500 dark:text-gray-400">G/P (USD)</th>
              <th className="py-2 px-3 font-medium text-gray-500 dark:text-gray-400">Fuente</th>
              <th className="py-2 px-3 font-medium text-gray-500 dark:text-gray-400">Hash</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((tx) => (
              <tr
                key={tx.id}
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                onClick={() => window.location.href = `/dashboard/finance/onchain/tx/${tx.id}`}
              >
                <td className="py-2 px-3 text-gray-900 dark:text-white whitespace-nowrap">
                  {new Date(tx.timestamp).toLocaleDateString("es-MX", {
                    month: "short",
                    day: "numeric",
                    year: "2-digit",
                  })}
                </td>
                <td className="py-2 px-3 text-gray-600 dark:text-gray-400 whitespace-nowrap text-xs">
                  {tx.wallet.label}
                </td>
                <td className="py-2 px-3">
                  <TransactionTypeBadge type={tx.type} />
                </td>
                <td className="py-2 px-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  {formatAmount(tx.tokenSoldAmount, tx.tokenSoldSymbol)}
                </td>
                <td className="py-2 px-3 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  {formatAmount(tx.tokenBoughtAmount, tx.tokenBoughtSymbol)}
                </td>
                <td className="py-2 px-3 text-gray-500 dark:text-gray-400">
                  {tx.gasFeeUSD ? `$${tx.gasFeeUSD.toFixed(2)}` : "-"}
                </td>
                <td className={`py-2 px-3 font-medium whitespace-nowrap ${
                  tx.fiscalEvent
                    ? tx.fiscalEvent.gainLossUSD >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                    : "text-gray-400"
                }`}>
                  {tx.fiscalEvent
                    ? `${tx.fiscalEvent.gainLossUSD >= 0 ? "+" : ""}$${tx.fiscalEvent.gainLossUSD.toFixed(2)}`
                    : "-"}
                </td>
                <td className="py-2 px-3">
                  <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                    {tx.dataSource === "COVALENT" ? "CVT" : "HL"}
                  </span>
                </td>
                <td className="py-2 px-3 font-mono text-xs text-gray-500 dark:text-gray-400">
                  {tx.dataSource === "COVALENT" ? (
                    <a
                      href={`https://arbiscan.io/tx/${tx.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      {formatHash(tx.txHash)}
                    </a>
                  ) : (
                    formatHash(tx.txHash)
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {filtered.length} transacciones
          </p>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="px-3 py-1 text-xs text-gray-500">
              {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
