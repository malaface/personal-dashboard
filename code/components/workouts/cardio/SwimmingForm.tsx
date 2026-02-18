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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

const swimmingFormSchema = z.object({
  name: z.string().min(3, "Minimo 3 caracteres").max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha invalida"),
  duration: z.number().int().min(1, "Minimo 1 minuto").optional(),
  caloriesBurned: z.number().min(0).optional(),
  notes: z.string().max(500).optional(),
  distance: z.number().min(0).optional(),
  laps: z.number().int().min(1).optional(),
  poolSize: z.enum(["25", "50"]).optional(),
  strokeType: z.enum(["FREESTYLE", "BACKSTROKE", "BREASTSTROKE", "BUTTERFLY", "MIXED"]).optional(),
  avgHeartRate: z.number().int().min(30).max(250).optional(),
})

type SwimmingFormData = z.infer<typeof swimmingFormSchema>

interface SwimmingFormProps {
  workout?: {
    id: string
    name: string
    date: Date
    duration?: number | null
    caloriesBurned?: number | null
    notes?: string | null
    cardioSession?: {
      distance?: number | null
      laps?: number | null
      poolSize?: number | null
      strokeType?: string | null
      avgHeartRate?: number | null
    } | null
  }
}

const strokeLabels: Record<string, string> = {
  FREESTYLE: "Libre",
  BACKSTROKE: "Dorso",
  BREASTSTROKE: "Pecho",
  BUTTERFLY: "Mariposa",
  MIXED: "Mixto",
}

export default function SwimmingForm({ workout }: SwimmingFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const isEditing = !!workout

  const form = useForm<SwimmingFormData>({
    resolver: zodResolver(swimmingFormSchema),
    defaultValues: {
      name: workout?.name || "",
      date: workout?.date
        ? new Date(workout.date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      duration: workout?.duration || undefined,
      caloriesBurned: workout?.caloriesBurned || undefined,
      notes: workout?.notes || "",
      distance: workout?.cardioSession?.distance || undefined,
      laps: workout?.cardioSession?.laps || undefined,
      poolSize: workout?.cardioSession?.poolSize?.toString() as "25" | "50" | undefined,
      strokeType: (workout?.cardioSession?.strokeType as SwimmingFormData["strokeType"]) || undefined,
      avgHeartRate: workout?.cardioSession?.avgHeartRate || undefined,
    },
  })

  const onSubmit = async (data: SwimmingFormData) => {
    setLoading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("name", data.name)
      formData.append("type", "SWIMMING")
      formData.append("date", data.date)
      if (data.duration) formData.append("duration", data.duration.toString())
      if (data.caloriesBurned) formData.append("caloriesBurned", data.caloriesBurned.toString())
      if (data.notes) formData.append("notes", data.notes)
      formData.append("session", JSON.stringify({
        distance: data.distance || null,
        distanceUnit: "m",
        laps: data.laps || null,
        poolSize: data.poolSize || null,
        strokeType: data.strokeType || null,
        avgHeartRate: data.avgHeartRate || null,
      }))

      const result = isEditing
        ? await updateCardioWorkout(workout.id, formData)
        : await createCardioWorkout(formData)

      if (result.success) {
        router.push("/dashboard/workouts?mode=swimming")
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
            placeholder="ej., Natacion mañana, Entrenamiento piscina"
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
              placeholder="45"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Metricas de Natacion</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Distancia (m)</Label>
            <Input
              type="number"
              {...form.register("distance", { valueAsNumber: true })}
              min="0"
              step="25"
              className="mt-1"
              placeholder="1000"
            />
          </div>
          <div>
            <Label>Vueltas</Label>
            <Input
              type="number"
              {...form.register("laps", { valueAsNumber: true })}
              min="1"
              className="mt-1"
              placeholder="40"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Alberca</Label>
            <select
              {...form.register("poolSize")}
              className="mt-1"
            >
              <option value="">Seleccionar</option>
              <option value="25">25 metros</option>
              <option value="50">50 metros</option>
            </select>
          </div>
          <div>
            <Label>Estilo</Label>
            <select
              {...form.register("strokeType")}
              className="mt-1"
            >
              <option value="">Seleccionar</option>
              {Object.entries(strokeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
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
              placeholder="140"
            />
          </div>
          <div>
            <Label>Calorias (kcal)</Label>
            <Input
              type="number"
              {...form.register("caloriesBurned", { valueAsNumber: true })}
              min="0"
              className="mt-1"
              placeholder="350"
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
          placeholder="Como te fue en la alberca?"
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
