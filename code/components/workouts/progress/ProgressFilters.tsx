"use client"

import { useEffect, useState } from "react"
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
          <Label>Ejercicio</Label>
          <Select
            value={filters.exerciseTypeId || "_all_"}
            onValueChange={(v) => updateFilter("exerciseTypeId", v === "_all_" ? "" : v)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Todos los ejercicios" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all_">Todos los ejercicios</SelectItem>
              {exerciseTypes.map((et) => (
                <SelectItem key={et.id} value={et.id}>
                  {et.name} ({et.totalWorkouts})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Grupo Muscular</Label>
          <Select
            value={filters.muscleGroupId || "_all_"}
            onValueChange={(v) => updateFilter("muscleGroupId", v === "_all_" ? "" : v)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Todos los grupos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_all_">Todos los grupos</SelectItem>
              {muscleGroups.map((mg) => (
                <SelectItem key={mg.id} value={mg.id}>
                  {mg.name}
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
