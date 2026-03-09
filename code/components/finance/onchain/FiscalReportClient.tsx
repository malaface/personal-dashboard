"use client"

import { useState, useMemo } from "react"
import FiscalReportTable from "./FiscalReportTable"
import TokenPnLSummary from "./TokenPnLSummary"

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
    tokenSoldAmount: number | null
    tokenSoldPriceUSD: number | null
    tokenBoughtSymbol: string | null
    tokenBoughtAmount: number | null
    tokenBoughtPriceUSD: number | null
    timestamp: Date
    dataSource: string
  }
}

interface Holding {
  tokenSymbol: string
  totalAmount: number
  avgCostBasisUSD: number
  avgCostBasisMXN: number
}

interface FiscalReportClientProps {
  events: FiscalEvent[]
  holdings: Holding[]
}

type TimeFilter = "ALL" | "1W" | "1M" | "6M" | string // string for year like "2025"

function getTimeFilterDate(filter: TimeFilter): Date | null {
  if (filter === "ALL") return null
  const now = new Date()
  switch (filter) {
    case "1W":
      return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)
    case "1M":
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
    case "6M":
      return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
    default:
      return null // Year handled separately
  }
}

function getAvailableYears(events: FiscalEvent[]): number[] {
  const years = new Set<number>()
  for (const e of events) {
    years.add(new Date(e.transaction.timestamp).getFullYear())
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

export default function FiscalReportClient({ events, holdings }: FiscalReportClientProps) {
  const [filterTime, setFilterTime] = useState<TimeFilter>("ALL")

  const years = useMemo(() => getAvailableYears(events), [events])

  const filteredEvents = useMemo(() => {
    if (filterTime === "ALL") return events

    // Year filter
    if (/^\d{4}$/.test(filterTime)) {
      const year = parseInt(filterTime)
      return events.filter((e) => new Date(e.transaction.timestamp).getFullYear() === year)
    }

    // Relative time filter
    const cutoff = getTimeFilterDate(filterTime)
    if (!cutoff) return events
    return events.filter((e) => new Date(e.transaction.timestamp) >= cutoff)
  }, [events, filterTime])

  const tokenPnL = useMemo(() => {
    const map: Record<string, {
      soldAmount: number
      costBasisMXN: number
      proceedsMXN: number
      gainLossMXN: number
      eventCount: number
    }> = {}

    for (const event of filteredEvents) {
      const token = event.transaction.tokenSoldSymbol || "UNKNOWN"
      if (!map[token]) {
        map[token] = { soldAmount: 0, costBasisMXN: 0, proceedsMXN: 0, gainLossMXN: 0, eventCount: 0 }
      }
      map[token].soldAmount += event.transaction.tokenSoldAmount || 0
      map[token].costBasisMXN += event.costBasisMXN
      map[token].proceedsMXN += event.proceedsMXN
      map[token].gainLossMXN += event.gainLossMXN
      map[token].eventCount++
    }

    return Object.entries(map).map(([token, data]) => ({ token, ...data }))
  }, [filteredEvents])

  const exportFiscalCSV = () => {
    const headers = [
      "Fecha", "Periodo", "Token Vendido", "Token Comprado", "Cant. Vendida",
      "Costo Base (MXN)", "P. Costo Prom. (MXN)", "Ingresos (MXN)", "P. Venta (MXN)",
      "G/P (MXN)", "G/P (USD)", "Gas (USD)", "Tipo de Cambio", "Fuente"
    ]
    const rows = filteredEvents.map((e) => {
      const soldAmt = e.transaction.tokenSoldAmount || 0
      return [
        new Date(e.transaction.timestamp).toISOString().split("T")[0],
        e.fiscalPeriod,
        e.transaction.tokenSoldSymbol || "",
        e.transaction.tokenBoughtSymbol || "",
        soldAmt,
        e.costBasisMXN.toFixed(2),
        soldAmt > 0 ? (e.costBasisMXN / soldAmt).toFixed(2) : "",
        e.proceedsMXN.toFixed(2),
        soldAmt > 0 ? (e.proceedsMXN / soldAmt).toFixed(2) : "",
        e.gainLossMXN.toFixed(2),
        e.gainLossUSD.toFixed(2),
        e.gasFeeDeduction.toFixed(2),
        e.exchangeRate.toFixed(2),
        e.transaction.dataSource,
      ].join(",")
    })
    downloadCSV(
      `reporte-fiscal-${filterTime === "ALL" ? "completo" : filterTime}.csv`,
      [headers.join(","), ...rows].join("\n")
    )
  }

  const exportTokenPnLCSV = () => {
    const headers = [
      "Token", "Cant. Vendida", "Costo Base (MXN)", "Ingresos (MXN)",
      "P. Prom. Compra (MXN)", "P. Prom. Venta (MXN)", "G/P Realizada (MXN)", "# Operaciones"
    ]
    const sorted = [...tokenPnL].sort((a, b) => Math.abs(b.gainLossMXN) - Math.abs(a.gainLossMXN))
    const rows = sorted.map((r) => [
      r.token,
      r.soldAmount,
      r.costBasisMXN.toFixed(2),
      r.proceedsMXN.toFixed(2),
      r.soldAmount > 0 ? (r.costBasisMXN / r.soldAmount).toFixed(2) : "",
      r.soldAmount > 0 ? (r.proceedsMXN / r.soldAmount).toFixed(2) : "",
      r.gainLossMXN.toFixed(2),
      r.eventCount,
    ].join(","))
    downloadCSV(
      `pnl-por-token-${filterTime === "ALL" ? "completo" : filterTime}.csv`,
      [headers.join(","), ...rows].join("\n")
    )
  }

  const filterLabel = filterTime === "ALL" ? "Todo" : filterTime === "1W" ? "Última semana"
    : filterTime === "1M" ? "Último mes" : filterTime === "6M" ? "6 meses" : filterTime

  return (
    <div className="space-y-6">
      {/* Time filter + Export */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          {(["ALL", "1W", "1M", "6M"] as const).map((opt) => {
            const label = opt === "ALL" ? "Todo" : opt === "1W" ? "1 Sem" : opt === "1M" ? "1 Mes" : "6 Meses"
            return (
              <button
                key={opt}
                onClick={() => setFilterTime(opt)}
                className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                  filterTime === opt
                    ? "bg-purple-600 text-white"
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
              onClick={() => setFilterTime(String(year))}
              className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                filterTime === String(year)
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {year}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={exportFiscalCSV}
            disabled={filteredEvents.length === 0}
            className="px-3 py-1 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            Exportar Eventos CSV
          </button>
          <button
            onClick={exportTokenPnLCSV}
            disabled={tokenPnL.length === 0}
            className="px-3 py-1 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            Exportar P&L CSV
          </button>
        </div>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400">
        {filteredEvents.length} eventos fiscales — {filterLabel}
      </p>

      {/* Token P&L Summary */}
      {tokenPnL.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            P&L por Token (SAT - Costo Promedio)
          </h2>
          <TokenPnLSummary tokenPnL={tokenPnL} holdings={holdings} />
        </div>
      )}

      {/* Detailed Events Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Detalle de Eventos Fiscales
        </h2>
        <FiscalReportTable events={filteredEvents} />
      </div>
    </div>
  )
}
