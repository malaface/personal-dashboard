"use client"

import { useEffect, useState } from "react"

export interface FinanceFiltersState {
  categoryId: string
  typeId: string
  range: string
  startDate: string
  endDate: string
  metric: "amount" | "count" | "average"
}

interface CategoryOption {
  id: string
  name: string
}

interface TypeOption {
  id: string
  name: string
}

interface FinanceFiltersProps {
  onFiltersChange: (filters: FinanceFiltersState) => void
}

const RANGES = [
  { value: "30d", label: "1 Mes" },
  { value: "90d", label: "3 Meses" },
  { value: "6m", label: "6 Meses" },
  { value: "1y", label: "1 Ano" },
  { value: "custom", label: "Personalizado" },
]

const METRICS = [
  { value: "amount" as const, label: "Monto Total" },
  { value: "count" as const, label: "# Transacciones" },
  { value: "average" as const, label: "Promedio" },
]

export default function FinanceFilters({ onFiltersChange }: FinanceFiltersProps) {
  const [categories, setCategories] = useState<CategoryOption[]>([])
  const [types, setTypes] = useState<TypeOption[]>([])
  const [loading, setLoading] = useState(true)

  const [filters, setFilters] = useState<FinanceFiltersState>({
    categoryId: "",
    typeId: "",
    range: "6m",
    startDate: "",
    endDate: "",
    metric: "amount",
  })

  useEffect(() => {
    async function fetchOptions() {
      try {
        const response = await fetch("/api/finance/categories")
        if (response.ok) {
          const data = await response.json()
          setCategories(data.categories)
          setTypes(data.types)
        }
      } catch (error) {
        console.error("Error loading finance categories:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchOptions()
  }, [])

  function updateFilter<K extends keyof FinanceFiltersState>(
    key: K,
    value: FinanceFiltersState[K]
  ) {
    const updated = { ...filters, [key]: value }
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
      {/* Category & Type selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Categoria
          </label>
          <select
            value={filters.categoryId}
            onChange={(e) => updateFilter("categoryId", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          >
            <option value="">Todas las categorias</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tipo
          </label>
          <select
            value={filters.typeId}
            onChange={(e) => updateFilter("typeId", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
          >
            <option value="">Todos los tipos</option>
            {types.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
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
                  ? "bg-green-600 text-white"
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
          Metrica
        </label>
        <div className="flex gap-1">
          {METRICS.map((m) => (
            <button
              key={m.value}
              onClick={() => updateFilter("metric", m.value)}
              className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${
                filters.metric === m.value
                  ? "bg-emerald-600 text-white"
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
