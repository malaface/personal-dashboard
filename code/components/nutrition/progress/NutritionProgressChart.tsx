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
import { type NutritionFiltersState } from "./NutritionFilters"
import ChartSkeleton from "@/components/analytics/ChartSkeleton"

interface DailyNutritionPoint {
  date: string
  calories: number
  protein: number
  carbs: number
  fats: number
  mealCount: number
}

interface NutritionRecordsData {
  bestCaloriesDay: { value: number; date: string } | null
  bestProteinDay: { value: number; date: string } | null
  bestCarbsDay: { value: number; date: string } | null
  bestFatsDay: { value: number; date: string } | null
  mostMealsDay: { value: number; date: string } | null
}

interface NutritionProgressChartProps {
  filters: NutritionFiltersState
  onRecords?: (records: NutritionRecordsData | null) => void
}

const METRIC_LABELS: Record<string, string> = {
  calories: "Calorías (kcal)",
  protein: "Proteína (g)",
  carbs: "Carbohidratos (g)",
  fats: "Grasas (g)",
}

const METRIC_COLORS: Record<string, string> = {
  calories: "#f97316",
  protein: "#ef4444",
  carbs: "#3b82f6",
  fats: "#eab308",
}

export default function NutritionProgressChart({
  filters,
  onRecords,
}: NutritionProgressChartProps) {
  const [rawData, setRawData] = useState<DailyNutritionPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProgress() {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filters.mealType) params.set("mealType", filters.mealType)
      if (filters.range && filters.range !== "custom")
        params.set("range", filters.range)
      if (filters.range === "custom") {
        if (filters.startDate)
          params.set("startDate", new Date(filters.startDate).toISOString())
        if (filters.endDate)
          params.set("endDate", new Date(filters.endDate).toISOString())
      }

      try {
        const response = await fetch(`/api/nutrition/progress?${params}`)
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
  }, [filters.mealType, filters.range, filters.startDate, filters.endDate])

  const chartData = useMemo(() => {
    if (rawData.length === 0) return []

    return rawData.map((d) => ({
      date: new Date(d.date).toLocaleDateString("es-MX", {
        month: "short",
        day: "numeric",
      }),
      [filters.metric]: d[filters.metric],
    }))
  }, [rawData, filters.metric])

  // Summary stats
  const stats = useMemo(() => {
    if (rawData.length === 0) return null

    const values = rawData.map((d) => d[filters.metric])
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    const max = Math.max(...values)
    const totalDays = rawData.length

    const mid = Math.floor(values.length / 2)
    const firstHalf = values.slice(0, mid)
    const secondHalf = values.slice(mid)
    const firstAvg =
      firstHalf.length > 0
        ? firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
        : 0
    const secondAvg =
      secondHalf.length > 0
        ? secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length
        : 0
    const trendPercent =
      firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0

    return {
      avg: Math.round(avg * 10) / 10,
      max: Math.round(max * 10) / 10,
      totalDays,
      trendPercent: Math.round(trendPercent * 10) / 10,
    }
  }, [rawData, filters.metric])

  if (loading) {
    return <ChartSkeleton />
  }

  if (error) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Error al cargar gráfico</p>
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
            No hay comidas registradas en el rango seleccionado
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">
        Progreso Nutricional - {METRIC_LABELS[filters.metric]}
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
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
          <Line
            type="monotone"
            dataKey={filters.metric}
            stroke={METRIC_COLORS[filters.metric]}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name={METRIC_LABELS[filters.metric]}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Summary stats */}
      {stats && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Promedio Diario
            </p>
            <p className="text-lg font-bold text-orange-700 dark:text-orange-300">
              {stats.avg}
              {filters.metric === "calories" ? " kcal" : " g"}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400">Máximo</p>
            <p className="text-lg font-bold text-green-700 dark:text-green-300">
              {stats.max}
              {filters.metric === "calories" ? " kcal" : " g"}
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Días Registrados
            </p>
            <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
              {stats.totalDays}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Tendencia
            </p>
            <p
              className={`text-lg font-bold ${
                stats.trendPercent > 0
                  ? "text-green-700 dark:text-green-300"
                  : stats.trendPercent < 0
                    ? "text-red-700 dark:text-red-300"
                    : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {stats.trendPercent > 0
                ? "↑"
                : stats.trendPercent < 0
                  ? "↓"
                  : "→"}{" "}
              {Math.abs(stats.trendPercent)}%
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
