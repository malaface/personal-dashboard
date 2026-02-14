"use client"

import { useState } from "react"

export interface NutritionFiltersState {
  mealType: string
  range: string
  startDate: string
  endDate: string
  metric: "calories" | "protein" | "carbs" | "fats"
}

interface NutritionFiltersProps {
  onFiltersChange: (filters: NutritionFiltersState) => void
}

const RANGES = [
  { value: "7d", label: "1 Sem" },
  { value: "30d", label: "1 Mes" },
  { value: "90d", label: "3 Meses" },
  { value: "6m", label: "6 Meses" },
  { value: "1y", label: "1 Año" },
  { value: "custom", label: "Personalizado" },
]

const MEAL_TYPES = [
  { value: "", label: "Todas" },
  { value: "BREAKFAST", label: "Desayuno" },
  { value: "LUNCH", label: "Almuerzo" },
  { value: "DINNER", label: "Cena" },
  { value: "SNACK", label: "Merienda" },
]

const METRICS = [
  { value: "calories" as const, label: "Calorías" },
  { value: "protein" as const, label: "Proteína" },
  { value: "carbs" as const, label: "Carbohidratos" },
  { value: "fats" as const, label: "Grasas" },
]

export default function NutritionFilters({ onFiltersChange }: NutritionFiltersProps) {
  const [filters, setFilters] = useState<NutritionFiltersState>({
    mealType: "",
    range: "30d",
    startDate: "",
    endDate: "",
    metric: "calories",
  })

  function updateFilter<K extends keyof NutritionFiltersState>(
    key: K,
    value: NutritionFiltersState[K]
  ) {
    const updated = { ...filters, [key]: value }
    setFilters(updated)
    onFiltersChange(updated)
  }

  return (
    <div className="space-y-4">
      {/* Meal Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Tipo de Comida
        </label>
        <select
          value={filters.mealType}
          onChange={(e) => updateFilter("mealType", e.target.value)}
          className="w-full sm:w-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
        >
          {MEAL_TYPES.map((mt) => (
            <option key={mt.value} value={mt.value}>
              {mt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Time range */}
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
                  ? "bg-orange-600 text-white"
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
                  ? "bg-orange-600 text-white"
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
