"use client"

import { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

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
          <Label>Categoria</Label>
          <Select
            value={filters.categoryId || "_all_"}
            onValueChange={(v) => updateFilter("categoryId", v === "_all_" ? "" : v)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Todas las categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all_">Todas las categorias</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Tipo</Label>
          <Select
            value={filters.typeId || "_all_"}
            onValueChange={(v) => updateFilter("typeId", v === "_all_" ? "" : v)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Todos los tipos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all_">Todos los tipos</SelectItem>
              {types.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Time range tabs */}
      <div>
        <Label>Rango de Tiempo</Label>
        <div className="flex flex-wrap gap-1 mt-1">
          {RANGES.map((r) => (
            <Button
              key={r.value}
              type="button"
              size="sm"
              variant={filters.range === r.value ? "default" : "outline"}
              onClick={() => updateFilter("range", r.value)}
            >
              {r.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Custom date range */}
      {filters.range === "custom" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Desde</Label>
            <Input
              type="date"
              value={filters.startDate}
              onChange={(e) => updateFilter("startDate", e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Hasta</Label>
            <Input
              type="date"
              value={filters.endDate}
              onChange={(e) => updateFilter("endDate", e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      )}

      {/* Metric toggle */}
      <div>
        <Label>Metrica</Label>
        <div className="flex gap-1 mt-1">
          {METRICS.map((m) => (
            <Button
              key={m.value}
              type="button"
              size="sm"
              variant={filters.metric === m.value ? "default" : "outline"}
              onClick={() => updateFilter("metric", m.value)}
            >
              {m.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
