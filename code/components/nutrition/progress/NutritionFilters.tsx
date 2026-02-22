"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

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
        <Label>Tipo de Comida</Label>
        <Select
          value={filters.mealType || "_all_"}
          onValueChange={(v) => updateFilter("mealType", v === "_all_" ? "" : v)}
        >
          <SelectTrigger className="mt-1 w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MEAL_TYPES.map((mt) => (
              <SelectItem key={mt.value || "_all_"} value={mt.value || "_all_"}>
                {mt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Time range */}
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
        <Label>Métrica</Label>
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
