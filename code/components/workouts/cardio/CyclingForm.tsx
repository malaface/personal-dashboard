"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createCardioWorkout, updateCardioWorkout } from "@/app/dashboard/workouts/actions"

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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre *</label>
          <input
            type="text"
            {...form.register("name")}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="ej., Ruta dominical, MTB cerro"
          />
          {form.formState.errors.name && (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Fecha *</label>
            <input
              type="date"
              {...form.register("date")}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Duracion (min)</label>
            <input
              type="number"
              {...form.register("duration", { valueAsNumber: true })}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="60"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Metricas de Ciclismo</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Distancia (km)</label>
            <input
              type="number"
              {...form.register("distance", { valueAsNumber: true })}
              min="0"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="30.0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vel. Promedio (km/h)</label>
            <input
              type="number"
              {...form.register("avgSpeed", { valueAsNumber: true })}
              min="0"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="25.0"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vel. Maxima (km/h)</label>
            <input
              type="number"
              {...form.register("maxSpeed", { valueAsNumber: true })}
              min="0"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="45.0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Desnivel (m)</label>
            <input
              type="number"
              {...form.register("elevationGain", { valueAsNumber: true })}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="250"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">FC Promedio (bpm)</label>
            <input
              type="number"
              {...form.register("avgHeartRate", { valueAsNumber: true })}
              min="30"
              max="250"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="145"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Calorias (kcal)</label>
            <input
              type="number"
              {...form.register("caloriesBurned", { valueAsNumber: true })}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notas</label>
        <textarea
          {...form.register("notes")}
          rows={2}
          maxLength={500}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="Como estuvo la ruta?"
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50"
        >
          {loading ? "Guardando..." : isEditing ? "Actualizar" : "Crear Sesion"}
        </button>
      </div>
    </form>
  )
}
