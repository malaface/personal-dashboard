"use client"

import { useMemo } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import Link from "next/link"

interface WorkoutData {
  id: string
  name: string
  type: string
  date: Date
  duration?: number | null
  caloriesBurned?: number | null
}

interface GeneralOverviewProps {
  workouts: WorkoutData[]
}

const typeLabels: Record<string, string> = {
  GYM: "Gimnasio",
  SWIMMING: "Natacion",
  RUNNING: "Correr",
  CYCLING: "Ciclismo",
}

const typeColors: Record<string, string> = {
  GYM: "#3B82F6",
  SWIMMING: "#06B6D4",
  RUNNING: "#10B981",
  CYCLING: "#F59E0B",
}

export default function GeneralOverview({ workouts }: GeneralOverviewProps) {
  const stats = useMemo(() => {
    const totalWorkouts = workouts.length
    const totalCalories = workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0)
    const totalMinutes = workouts.reduce((sum, w) => sum + (w.duration || 0), 0)

    const byType = ["GYM", "SWIMMING", "RUNNING", "CYCLING"].map((type) => {
      const typeWorkouts = workouts.filter((w) => w.type === type)
      return {
        name: typeLabels[type],
        type,
        count: typeWorkouts.length,
        calories: typeWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0),
        minutes: typeWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0),
      }
    }).filter((d) => d.count > 0)

    return { totalWorkouts, totalCalories, totalMinutes, byType }
  }, [workouts])

  const recentWorkouts = workouts.slice(0, 10)

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Entrenamientos</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats.totalWorkouts}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">Calorias Totales</p>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-1">
            {stats.totalCalories.toLocaleString()} <span className="text-lg font-normal">kcal</span>
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">Tiempo Total</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
            {(stats.totalMinutes / 60).toFixed(1)} <span className="text-lg font-normal">hrs</span>
          </p>
        </div>
      </div>

      {/* Distribution Chart */}
      {stats.byType.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Distribucion por Actividad
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.byType}>
                <XAxis dataKey="name" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                <YAxis tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(31, 41, 55, 0.95)",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value: number | undefined) => {
                    return [value ?? 0, "Sesiones"]
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {stats.byType.map((entry) => (
                    <Cell key={entry.type} fill={typeColors[entry.type]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {recentWorkouts.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Actividad Reciente
          </h3>
          <div className="space-y-3">
            {recentWorkouts.map((workout) => (
              <div
                key={workout.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: typeColors[workout.type] || "#6B7280" }}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{workout.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {typeLabels[workout.type]} &middot;{" "}
                      {new Date(workout.date).toLocaleDateString("es-MX", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-500 dark:text-gray-400">
                  {workout.duration && <span>{workout.duration} min</span>}
                  {workout.caloriesBurned && (
                    <span className="ml-2 text-orange-500">{workout.caloriesBurned} kcal</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {workouts.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-lg">Sin entrenamientos aun</p>
          <p className="text-gray-400 dark:text-gray-500 mt-2">Selecciona un modo y registra tu primera sesion</p>
        </div>
      )}
    </div>
  )
}
