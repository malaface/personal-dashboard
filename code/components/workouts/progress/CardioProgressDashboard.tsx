"use client"

import { useState, useEffect } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts"

interface CardioProgressDashboardProps {
  mode: "swimming" | "running" | "cycling"
}

interface ProgressData {
  series: Array<{
    date: string
    duration?: number | null
    caloriesBurned?: number | null
    distance?: number | null
    pace?: number | null
    avgSpeed?: number | null
    elevationGain?: number | null
    avgHeartRate?: number | null
  }>
  stats: {
    totalSessions: number
    totalDistance: number
    totalDuration: number
    totalCalories: number
    bestDistance: number
    bestPace: number | null
    bestSpeed: number | null
  }
}

const modeToType: Record<string, string> = {
  swimming: "SWIMMING",
  running: "RUNNING",
  cycling: "CYCLING",
}

const modeLabels: Record<string, string> = {
  swimming: "Natacion",
  running: "Correr",
  cycling: "Ciclismo",
}

const modeColors: Record<string, string> = {
  swimming: "#06B6D4",
  running: "#10B981",
  cycling: "#F59E0B",
}

const ranges = [
  { key: "7d", label: "7 dias" },
  { key: "30d", label: "30 dias" },
  { key: "90d", label: "90 dias" },
  { key: "1y", label: "1 año" },
]

export default function CardioProgressDashboard({ mode }: CardioProgressDashboardProps) {
  const [data, setData] = useState<ProgressData | null>(null)
  const [range, setRange] = useState("30d")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `/api/workouts/cardio-progress?type=${modeToType[mode]}&range=${range}`
        )
        if (res.ok) {
          const json = await res.json()
          setData(json)
        }
      } catch (err) {
        console.error("Error fetching cardio progress:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [mode, range])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        ))}
      </div>
    )
  }

  if (!data || data.stats.totalSessions === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          Sin datos de {modeLabels[mode]} aun
        </p>
        <p className="text-gray-400 dark:text-gray-500 mt-2">
          Registra sesiones para ver tu progreso
        </p>
      </div>
    )
  }

  const distanceUnit = mode === "swimming" ? "m" : "km"
  const color = modeColors[mode]

  return (
    <div className="space-y-6">
      {/* Range Filter */}
      <div className="flex gap-2">
        {ranges.map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              range === r.key
                ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Sesiones</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.stats.totalSessions}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Distancia Total</p>
          <p className="text-2xl font-bold" style={{ color }}>
            {mode === "swimming"
              ? data.stats.totalDistance.toLocaleString()
              : data.stats.totalDistance.toFixed(1)}{" "}
            <span className="text-sm font-normal">{distanceUnit}</span>
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">Mejor Distancia</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {mode === "swimming"
              ? data.stats.bestDistance.toLocaleString()
              : data.stats.bestDistance.toFixed(1)}{" "}
            <span className="text-sm font-normal">{distanceUnit}</span>
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {mode === "running"
              ? "Mejor Pace"
              : mode === "cycling"
              ? "Mejor Velocidad"
              : "Calorias"}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {mode === "running" && data.stats.bestPace != null
              ? `${data.stats.bestPace.toFixed(1)} min/km`
              : mode === "cycling" && data.stats.bestSpeed != null
              ? `${data.stats.bestSpeed.toFixed(1)} km/h`
              : `${data.stats.totalCalories.toLocaleString()} kcal`}
          </p>
        </div>
      </div>

      {/* Distance Chart */}
      {data.series.length > 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Distancia por Sesion
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.series}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#9CA3AF", fontSize: 11 }}
                  tickFormatter={(val) => {
                    const d = new Date(val)
                    return `${d.getDate()}/${d.getMonth() + 1}`
                  }}
                />
                <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(31, 41, 55, 0.95)",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value: number | undefined) => [`${value ?? 0} ${distanceUnit}`, "Distancia"]}
                />
                <Line
                  type="monotone"
                  dataKey="distance"
                  stroke={color}
                  strokeWidth={2}
                  dot={{ fill: color, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Pace/Speed Chart for running/cycling */}
      {data.series.length > 1 && (mode === "running" || mode === "cycling") && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {mode === "running" ? "Pace por Sesion" : "Velocidad por Sesion"}
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.series}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#9CA3AF", fontSize: 11 }}
                  tickFormatter={(val) => {
                    const d = new Date(val)
                    return `${d.getDate()}/${d.getMonth() + 1}`
                  }}
                />
                <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(31, 41, 55, 0.95)",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value: number | undefined) => [
                    mode === "running" ? `${value ?? 0} min/km` : `${value ?? 0} km/h`,
                    mode === "running" ? "Pace" : "Velocidad",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey={mode === "running" ? "pace" : "avgSpeed"}
                  stroke={color}
                  strokeWidth={2}
                  dot={{ fill: color, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}
