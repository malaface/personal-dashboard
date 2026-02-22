"use client"

import { useEffect, useState, useMemo } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { type FinanceFiltersState } from "./FinanceFilters"
import ChartSkeleton from "@/components/analytics/ChartSkeleton"

interface MonthlyTrendPoint {
  month: string
  income: number
  expense: number
  balance: number
  transactionCount: number
}

interface FinancialRecordsData {
  bestIncomeMonth: { value: number; month: string } | null
  lowestExpenseMonth: { value: number; month: string } | null
  bestBalanceMonth: { value: number; month: string } | null
  largestIncome: { value: number; date: string; description: string | null } | null
  largestExpense: { value: number; date: string; description: string | null } | null
}

interface FinanceProgressChartProps {
  filters: FinanceFiltersState
  onRecords?: (records: FinancialRecordsData | null) => void
}

const METRIC_LABELS: Record<string, string> = {
  amount: "Monto (MXN)",
  count: "# Transacciones",
  average: "Promedio (MXN)",
}

function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split("-")
  const date = new Date(parseInt(year), parseInt(month) - 1)
  return date.toLocaleDateString("es-MX", { month: "short", year: "2-digit" })
}

export default function FinanceProgressChart({
  filters,
  onRecords,
}: FinanceProgressChartProps) {
  const [rawData, setRawData] = useState<MonthlyTrendPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProgress() {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filters.categoryId) params.set("categoryId", filters.categoryId)
      if (filters.typeId) params.set("typeId", filters.typeId)
      if (filters.range && filters.range !== "custom")
        params.set("range", filters.range)
      if (filters.range === "custom") {
        if (filters.startDate)
          params.set("startDate", new Date(filters.startDate).toISOString())
        if (filters.endDate)
          params.set("endDate", new Date(filters.endDate).toISOString())
      }

      try {
        const response = await fetch(`/api/finance/progress?${params}`)
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Error al cargar datos")
        }

        setRawData(result.data)
        onRecords?.(result.records)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Error desconocido"
        setError(message)
        onRecords?.(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [filters.categoryId, filters.typeId, filters.range, filters.startDate, filters.endDate])

  // Transform data based on selected metric
  const chartData = useMemo(() => {
    if (rawData.length === 0) return []

    return rawData.map((d) => {
      const base = { month: formatMonth(d.month) }

      if (filters.metric === "count") {
        return { ...base, Transacciones: d.transactionCount }
      }

      if (filters.metric === "average") {
        const avgIncome =
          d.transactionCount > 0
            ? Math.round((d.income / Math.max(1, d.transactionCount)) * 100) / 100
            : 0
        const avgExpense =
          d.transactionCount > 0
            ? Math.round((d.expense / Math.max(1, d.transactionCount)) * 100) / 100
            : 0
        return { ...base, "Prom. Ingreso": avgIncome, "Prom. Gasto": avgExpense }
      }

      // Default: amount
      return {
        ...base,
        Ingresos: d.income,
        Gastos: d.expense,
        Balance: d.balance,
      }
    })
  }, [rawData, filters.metric])

  // Calculate summary stats
  const stats = useMemo(() => {
    if (rawData.length === 0) return null

    const totalIncome = rawData.reduce((s, d) => s + d.income, 0)
    const totalExpense = rawData.reduce((s, d) => s + d.expense, 0)
    const totalTransactions = rawData.reduce((s, d) => s + d.transactionCount, 0)
    const avgMonthly =
      rawData.length > 0
        ? Math.round(((totalIncome - totalExpense) / rawData.length) * 100) / 100
        : 0

    // Trend: compare first half to second half
    const mid = Math.floor(rawData.length / 2)
    const firstHalf = rawData.slice(0, mid)
    const secondHalf = rawData.slice(mid)
    const firstBalance =
      firstHalf.length > 0
        ? firstHalf.reduce((s, d) => s + d.balance, 0) / firstHalf.length
        : 0
    const secondBalance =
      secondHalf.length > 0
        ? secondHalf.reduce((s, d) => s + d.balance, 0) / secondHalf.length
        : 0
    const trendPercent =
      firstBalance !== 0
        ? Math.round(((secondBalance - firstBalance) / Math.abs(firstBalance)) * 1000) / 10
        : 0

    return {
      avgMonthly,
      totalTransactions,
      totalBalance: Math.round((totalIncome - totalExpense) * 100) / 100,
      trendPercent,
    }
  }, [rawData])

  if (loading) {
    return <ChartSkeleton />
  }

  if (error) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Error al cargar grafico</p>
          <p className="text-gray-500 text-sm mt-1">{error}</p>
        </div>
      </div>
    )
  }

  if (chartData.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="font-semibold">Sin datos de progreso</p>
          <p className="text-sm mt-1">
            No hay transacciones registradas en el rango seleccionado
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">
        Progreso Financiero - {METRIC_LABELS[filters.metric]}
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
          <YAxis
            tick={{ fontSize: 12 }}
            label={{
              value: METRIC_LABELS[filters.metric],
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Tooltip />
          <Legend />

          {filters.metric === "count" ? (
            <Line
              type="monotone"
              dataKey="Transacciones"
              stroke="#8884d8"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ) : filters.metric === "average" ? (
            <>
              <Line
                type="monotone"
                dataKey="Prom. Ingreso"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="Prom. Gasto"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </>
          ) : (
            <>
              <Line
                type="monotone"
                dataKey="Ingresos"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="Gastos"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="Balance"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>

      {/* Summary stats */}
      {stats && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Promedio Mensual
            </p>
            <p className="text-lg font-bold text-green-700 dark:text-green-300">
              ${stats.avgMonthly.toLocaleString()}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Balance Total
            </p>
            <p
              className={`text-lg font-bold ${
                stats.totalBalance >= 0
                  ? "text-green-700 dark:text-green-300"
                  : "text-red-700 dark:text-red-300"
              }`}
            >
              ${stats.totalBalance.toLocaleString()}
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Total Transacciones
            </p>
            <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
              {stats.totalTransactions}
            </p>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400">Tendencia</p>
            <p
              className={`text-lg font-bold ${
                stats.trendPercent > 0
                  ? "text-green-700 dark:text-green-300"
                  : stats.trendPercent < 0
                    ? "text-red-700 dark:text-red-300"
                    : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {stats.trendPercent > 0 ? "↑" : stats.trendPercent < 0 ? "↓" : "→"}{" "}
              {Math.abs(stats.trendPercent)}%
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
