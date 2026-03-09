"use client"

import { useState } from "react"
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
  fiscalEvent: {
    gainLossUSD: number
    gainLossMXN: number
  } | null
}

interface OnchainTransactionTableProps {
  transactions: OnchainTx[]
}

const PAGE_SIZE = 20

export default function OnchainTransactionTable({ transactions }: OnchainTransactionTableProps) {
  const [page, setPage] = useState(0)
  const [filterType, setFilterType] = useState<string>("ALL")

  const filtered = filterType === "ALL"
    ? transactions
    : transactions.filter((tx) => tx.type === filterType)

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
      <div className="flex items-center gap-2 mb-4 overflow-x-auto">
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

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
              <th className="py-2 px-3 font-medium text-gray-500 dark:text-gray-400">Fecha</th>
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
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td className="py-2 px-3 text-gray-900 dark:text-white whitespace-nowrap">
                  {new Date(tx.timestamp).toLocaleDateString("es-MX", {
                    month: "short",
                    day: "numeric",
                    year: "2-digit",
                  })}
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
