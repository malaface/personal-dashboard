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
import { type ProgressFiltersState } from "./ProgressFilters"
import ChartSkeleton from "@/components/analytics/ChartSkeleton"

interface ProgressDataPoint {
  date: string
  weight: number | null
  volume: number
  sets: number
  reps: number
  exerciseTypeId: string | null
  exerciseTypeName: string | null
}

interface PersonalRecordsData {
  maxWeight: number | null
  maxWeightDate: string | null
  maxVolume: number
  maxVolumeDate: string | null
  maxReps: number
  maxRepsDate: string | null
}

interface ExerciseProgressChartProps {
  filters: ProgressFiltersState
  onPersonalRecords?: (prs: PersonalRecordsData | null) => void
}

const MULTI_LINE_COLORS = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#0088fe",
  "#00c49f",
  "#ffbb28",
  "#ff8042",
  "#a4de6c",
  "#d0ed57",
]

const METRIC_LABELS: Record<string, string> = {
  weight: "Peso (kg)",
  volume: "Volumen (kg)",
  reps: "Repeticiones",
}

export default function ExerciseProgressChart({
  filters,
  onPersonalRecords,
}: ExerciseProgressChartProps) {
  const [rawData, setRawData] = useState<ProgressDataPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProgress() {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filters.exerciseTypeId) params.set("exerciseTypeId", filters.exerciseTypeId)
      if (filters.muscleGroupId) params.set("muscleGroupId", filters.muscleGroupId)
      if (filters.range && filters.range !== "custom") params.set("range", filters.range)
      if (filters.range === "custom") {
        if (filters.startDate) params.set("startDate", new Date(filters.startDate).toISOString())
        if (filters.endDate) params.set("endDate", new Date(filters.endDate).toISOString())
      }

      try {
        const response = await fetch(`/api/exercises/progress?${params}`)
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || "Error al cargar datos")
        }

        setRawData(result.data)
        onPersonalRecords?.(result.personalRecords)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Error desconocido"
        setError(message)
        onPersonalRecords?.(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProgress()
  }, [filters.exerciseTypeId, filters.muscleGroupId, filters.range, filters.startDate, filters.endDate])

  // Determine if single or multi exercise mode
  const isSingleExercise = !!filters.exerciseTypeId

  // For multi-exercise: group by date, then by exercise name
  const { chartData, exerciseNames } = useMemo(() => {
    if (rawData.length === 0) return { chartData: [], exerciseNames: [] }

    const metricKey = filters.metric

    if (isSingleExercise) {
      // Single exercise: one line
      const formatted = rawData.map((d) => ({
        date: new Date(d.date).toLocaleDateString("es-MX", { month: "short", day: "numeric" }),
        [metricKey]: metricKey === "weight" ? d.weight : metricKey === "volume" ? d.volume : d.reps,
      }))
      return { chartData: formatted, exerciseNames: [metricKey] }
    }

    // Multi-exercise: group by date, each exercise as a separate key
    const names = new Set<string>()
    const dateMap = new Map<string, Record<string, number | string>>()

    for (const d of rawData) {
      const name = d.exerciseTypeName || "Sin nombre"
      names.add(name)
      const dateLabel = new Date(d.date).toLocaleDateString("es-MX", {
        month: "short",
        day: "numeric",
      })
      const value = metricKey === "weight" ? (d.weight ?? 0) : metricKey === "volume" ? d.volume : d.reps

      const existing = dateMap.get(dateLabel) || { date: dateLabel }
      // If same exercise on same date, keep the higher value
      const currentVal = (existing[name] as number) || 0
      if (value > currentVal) {
        existing[name] = value
      }
      dateMap.set(dateLabel, existing)
    }

    return {
      chartData: Array.from(dateMap.values()),
      exerciseNames: Array.from(names),
    }
  }, [rawData, filters.metric, isSingleExercise])

  // Calculate summary stats
  const stats = useMemo(() => {
    if (rawData.length === 0) return null

    const values = rawData.map((d) =>
      filters.metric === "weight" ? (d.weight ?? 0) : filters.metric === "volume" ? d.volume : d.reps
    )
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    const max = Math.max(...values)

    // Trend: compare first half avg to second half avg
    const mid = Math.floor(values.length / 2)
    const firstHalf = values.slice(0, mid)
    const secondHalf = values.slice(mid)
    const firstAvg = firstHalf.length > 0 ? firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length : 0
    const secondAvg = secondHalf.length > 0 ? secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length : 0
    const trendPercent = firstAvg > 0 ? ((secondAvg - firstAvg) / firstAvg) * 100 : 0

    return {
      avg: Math.round(avg * 10) / 10,
      max: Math.round(max * 10) / 10,
      sessions: rawData.length,
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
            {filters.exerciseTypeId || filters.muscleGroupId
              ? "No hay registros para los filtros seleccionados"
              : "Selecciona un ejercicio o grupo muscular para ver tu progreso"}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">
        Progreso - {METRIC_LABELS[filters.metric]}
      </h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} interval="preserveStartEnd" />
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
          {isSingleExercise ? (
            <Line
              type="monotone"
              dataKey={filters.metric}
              stroke="#8884d8"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name={METRIC_LABELS[filters.metric]}
            />
          ) : (
            exerciseNames.map((name, index) => (
              <Line
                key={name}
                type="monotone"
                dataKey={name}
                stroke={MULTI_LINE_COLORS[index % MULTI_LINE_COLORS.length]}
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
                connectNulls
                name={name}
              />
            ))
          )}
        </LineChart>
      </ResponsiveContainer>

      {/* Summary stats */}
      {stats && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400">Promedio</p>
            <p className="text-lg font-bold text-blue-700 dark:text-blue-300">
              {stats.avg}
              {filters.metric !== "reps" ? " kg" : ""}
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400">Máximo</p>
            <p className="text-lg font-bold text-green-700 dark:text-green-300">
              {stats.max}
              {filters.metric !== "reps" ? " kg" : ""}
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400">Sesiones</p>
            <p className="text-lg font-bold text-purple-700 dark:text-purple-300">
              {stats.sessions}
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
