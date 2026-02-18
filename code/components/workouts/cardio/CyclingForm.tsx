"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createCardioWorkout, updateCardioWorkout } from "@/app/dashboard/workouts/actions"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

const cyclingFormSchema = z.object({
  name: z.string().min(3, "Minimo 3 caracteres").max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha invalida"),
  duration: z.number().int().min(1, "Minimo 1 minuto").optional(),
  caloriesBurned: z.number().min(0).optional(),
  notes: z.string().max(500).optional(),
  distance: z.number().min(0).optional(),
  avgSpeed: z.number().min(0).optional(),
  maxSpeed: z.number().min(0).optional(),
  elevationGain: z.number().min(0).optional(),
  avgHeartRate: z.number().int().min(30).max(250).optional(),
})

type CyclingFormData = z.infer<typeof cyclingFormSchema>

interface CyclingFormProps {
  workout?: {
    id: string
    name: string
    date: Date
    duration?: number | null
    caloriesBurned?: number | null
    notes?: string | null
    cardioSession?: {
      distance?: number | null
      avgSpeed?: number | null
      maxSpeed?: number | null
      elevationGain?: number | null
      avgHeartRate?: number | null
    } | null
  }
}

export default function CyclingForm({ workout }: CyclingFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const isEditing = !!workout

  const form = useForm<CyclingFormData>({
    resolver: zodResolver(cyclingFormSchema),
    defaultValues: {
      name: workout?.name || "",
      date: workout?.date
        ? new Date(workout.date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      duration: workout?.duration || undefined,
      caloriesBurned: workout?.caloriesBurned || undefined,
      notes: workout?.notes || "",
      distance: workout?.cardioSession?.distance || undefined,
      avgSpeed: workout?.cardioSession?.avgSpeed || undefined,
      maxSpeed: workout?.cardioSession?.maxSpeed || undefined,
      elevationGain: workout?.cardioSession?.elevationGain || undefined,
      avgHeartRate: workout?.cardioSession?.avgHeartRate || undefined,
    },
  })

  const onSubmit = async (data: CyclingFormData) => {
    setLoading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("name", data.name)
      formData.append("type", "CYCLING")
      formData.append("date", data.date)
      if (data.duration) formData.append("duration", data.duration.toString())
      if (data.caloriesBurned) formData.append("caloriesBurned", data.caloriesBurned.toString())
      if (data.notes) formData.append("notes", data.notes)
      formData.append("session", JSON.stringify({
        distance: data.distance || null,
        distanceUnit: "km",
        avgSpeed: data.avgSpeed || null,
        maxSpeed: data.maxSpeed || null,
        elevationGain: data.elevationGain || null,
        avgHeartRate: data.avgHeartRate || null,
      }))

      const result = isEditing
        ? await updateCardioWorkout(workout.id, formData)
        : await createCardioWorkout(formData)

      if (result.success) {
        router.push("/dashboard/workouts?mode=cycling")
        router.refresh()
      } else {
        setError(result.error || "Error al guardar")
      }
    } catch (err: any) {
      setError(err.message || "Error al guardar la sesion")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Detalles de la Sesion</h3>

        <div>
          <Label>Nombre *</Label>
          <input
            type="text"
            {...form.register("name")}
            className="mt-1"
            placeholder="ej., Ruta dominical, MTB cerro"
          />
          {form.formState.errors.name && (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Fecha *</Label>
            <Input
              type="date"
              {...form.register("date")}
              className="mt-1"
            />
          </div>
          <div>
            <Label>Duracion (min)</Label>
            <Input
              type="number"
              {...form.register("duration", { valueAsNumber: true })}
              min="1"
              className="mt-1"
              placeholder="60"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Metricas de Ciclismo</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Distancia (km)</Label>
            <Input
              type="number"
              {...form.register("distance", { valueAsNumber: true })}
              min="0"
              step="0.1"
              className="mt-1"
              placeholder="30.0"
            />
          </div>
          <div>
            <Label>Vel. Promedio (km/h)</Label>
            <Input
              type="number"
              {...form.register("avgSpeed", { valueAsNumber: true })}
              min="0"
              step="0.1"
              className="mt-1"
              placeholder="25.0"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Vel. Maxima (km/h)</Label>
            <Input
              type="number"
              {...form.register("maxSpeed", { valueAsNumber: true })}
              min="0"
              step="0.1"
              className="mt-1"
              placeholder="45.0"
            />
          </div>
          <div>
            <Label>Desnivel (m)</Label>
            <Input
              type="number"
              {...form.register("elevationGain", { valueAsNumber: true })}
              min="0"
              className="mt-1"
              placeholder="250"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>FC Promedio (bpm)</Label>
            <Input
              type="number"
              {...form.register("avgHeartRate", { valueAsNumber: true })}
              min="30"
              max="250"
              className="mt-1"
              placeholder="145"
            />
          </div>
          <div>
            <Label>Calorias (kcal)</Label>
            <Input
              type="number"
              {...form.register("caloriesBurned", { valueAsNumber: true })}
              min="0"
              className="mt-1"
              placeholder="500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <Label>Notas</Label>
        <Textarea
          {...form.register("notes")}
          rows={2}
          maxLength={500}
          className="mt-1"
          placeholder="Como estuvo la ruta?"
        />
      </div>

      <div className="flex justify-end space-x-3">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : isEditing ? "Actualizar" : "Crear Sesion"}
        </Button>
      </div>
    </form>
  )
}
