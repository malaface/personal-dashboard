"use client"

import { useEffect, useState } from "react"

export interface ProgressFiltersState {
  exerciseTypeId: string
  muscleGroupId: string
  range: string
  startDate: string
  endDate: string
  metric: "weight" | "volume" | "reps"
}

interface ExerciseType {
  id: string
  name: string
  totalWorkouts: number
}

interface MuscleGroup {
  id: string
  name: string
}

interface ProgressFiltersProps {
  onFiltersChange: (filters: ProgressFiltersState) => void
}

const RANGES = [
  { value: "7d", label: "1 Sem" },
  { value: "30d", label: "1 Mes" },
  { value: "90d", label: "3 Meses" },
  { value: "6m", label: "6 Meses" },
  { value: "1y", label: "1 Año" },
  { value: "custom", label: "Personalizado" },
]

const METRICS = [
  { value: "weight" as const, label: "Peso" },
  { value: "volume" as const, label: "Volumen" },
  { value: "reps" as const, label: "Reps" },
]

export default function ProgressFilters({ onFiltersChange }: ProgressFiltersProps) {
  const [exerciseTypes, setExerciseTypes] = useState<ExerciseType[]>([])
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([])
  const [loading, setLoading] = useState(true)

  const [filters, setFilters] = useState<ProgressFiltersState>({
    exerciseTypeId: "",
    muscleGroupId: "",
    range: "90d",
    startDate: "",
    endDate: "",
    metric: "weight",
  })

  useEffect(() => {
    async function fetchTypes() {
      try {
        const response = await fetch("/api/exercises/types")
        if (response.ok) {
          const data = await response.json()
          setExerciseTypes(data.exerciseTypes)
          setMuscleGroups(data.muscleGroups)
        }
      } catch (error) {
        console.error("Error loading exercise types:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchTypes()
  }, [])

  function updateFilter<K extends keyof ProgressFiltersState>(key: K, value: ProgressFiltersState[K]) {
    const updated = { ...filters, [key]: value }
    // Clear muscle group when specific exercise selected and vice versa
    if (key === "exerciseTypeId" && value) {
      updated.muscleGroupId = ""
    }
    if (key === "muscleGroupId" && value) {
      updated.exerciseTypeId = ""
    }
    setFilters(updated)
    onFiltersChange(updated)
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-3">
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Exercise & Muscle Group selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Ejercicio
          </label>
          <select
            value={filters.exerciseTypeId}
            onChange={(e) => updateFilter("exerciseTypeId", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          >
            <option value="">Todos los ejercicios</option>
            {exerciseTypes.map((et) => (
              <option key={et.id} value={et.id}>
                {et.name} ({et.totalWorkouts})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Grupo Muscular
          </label>
          <select
            value={filters.muscleGroupId}
            onChange={(e) => updateFilter("muscleGroupId", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          >
            <option value="">Todos los grupos</option>
            {muscleGroups.map((mg) => (
              <option key={mg.id} value={mg.id}>
                {mg.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Time range tabs */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Rango de Tiempo
        </label>
        <div className="flex flex-wrap gap-1">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => updateFilter("range", r.value)}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filters.range === r.value
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom date range */}
      {filters.range === "custom" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Desde
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => updateFilter("startDate", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Hasta
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => updateFilter("endDate", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
            />
          </div>
        </div>
      )}

      {/* Metric toggle */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Métrica
        </label>
        <div className="flex gap-1">
          {METRICS.map((m) => (
            <button
              key={m.value}
              onClick={() => updateFilter("metric", m.value)}
              className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${
                filters.metric === m.value
                  ? "bg-purple-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
