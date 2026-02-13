"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createWorkout, updateWorkout } from "@/app/dashboard/workouts/actions"
import { PlusIcon } from "@heroicons/react/24/outline"
import CollapsibleExerciseCard from "@/components/workouts/CollapsibleExerciseCard"
import QuickAddBar from "@/components/workouts/QuickAddBar"
import WorkoutTemplateSelector from "@/components/templates/WorkoutTemplateSelector"

// Zod Schemas
const exerciseSchema = z.object({
  exerciseTypeId: z.string().min(1, "Exercise type required"),
  muscleGroupId: z.string().nullable().optional(),
  equipmentId: z.string().nullable().optional(),
  sets: z.number().int().min(1, "Sets must be at least 1"),
  reps: z.number().int().min(1, "Reps must be at least 1"),
  weight: z.number().min(0).nullable().optional(),
  notes: z.string().max(200).nullable().optional()
})

const workoutFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100, "Name too long"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  duration: z.number().int().min(1).optional(),
  notes: z.string().max(500).optional(),
  exercises: z.array(exerciseSchema).min(1, "At least one exercise required")
})

type WorkoutFormData = z.infer<typeof workoutFormSchema>

interface WorkoutFormProps {
  workout?: {
    id: string
    name: string
    date: Date
    duration?: number | null
    notes?: string | null
    exercises: Array<{
      exerciseTypeId?: string | null
      muscleGroupId?: string | null
      equipmentId?: string | null
      sets: number
      reps: number
      weight?: number | null
      notes?: string | null
    }>
  }
  onCancel?: () => void
}

const emptyExercise = {
  exerciseTypeId: "",
  muscleGroupId: null,
  equipmentId: null,
  sets: 3,
  reps: 10,
  weight: null,
  notes: null,
}

export default function WorkoutForm({ workout, onCancel }: WorkoutFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const isEditing = !!workout

  const form = useForm<WorkoutFormData>({
    resolver: zodResolver(workoutFormSchema),
    defaultValues: {
      name: workout?.name || "",
      date: workout?.date
        ? new Date(workout.date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      duration: workout?.duration || undefined,
      notes: workout?.notes || "",
      exercises: workout?.exercises.map(ex => ({
        exerciseTypeId: ex.exerciseTypeId || "",
        muscleGroupId: ex.muscleGroupId || null,
        equipmentId: ex.equipmentId || null,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        notes: ex.notes,
      })) || [{ ...emptyExercise }]
    }
  })

  const { fields, append, remove, swap, insert } = useFieldArray({
    control: form.control,
    name: "exercises"
  })

  // Watch exercise type IDs for QuickAddBar
  const exerciseTypeIds = form.watch("exercises")?.map(e => e.exerciseTypeId).filter(Boolean) || []

  const addExercise = () => {
    append({ ...emptyExercise })
  }

  const moveExerciseUp = (index: number) => {
    if (index > 0) swap(index, index - 1)
  }

  const moveExerciseDown = (index: number) => {
    if (index < fields.length - 1) swap(index, index + 1)
  }

  const duplicateExercise = (index: number) => {
    const current = form.getValues(`exercises.${index}`)
    insert(index + 1, { ...current })
  }

  const handleQuickAdd = async (exerciseTypeId: string, exerciseName: string) => {
    try {
      const response = await fetch(`/api/exercises/${exerciseTypeId}/last`)
      if (response.ok) {
        const data = await response.json()
        if (data.found && data.lastWorkout) {
          append({
            exerciseTypeId,
            muscleGroupId: data.lastWorkout.muscleGroupId || null,
            equipmentId: data.lastWorkout.equipmentId || null,
            sets: data.lastWorkout.sets,
            reps: data.lastWorkout.reps,
            weight: data.lastWorkout.weight ?? null,
            notes: null,
          })
          return
        }
      }
    } catch (error) {
      console.error("Error fetching last performance for quick-add:", error)
    }
    // Fallback: add with defaults
    append({
      exerciseTypeId,
      muscleGroupId: null,
      equipmentId: null,
      sets: 3,
      reps: 10,
      weight: null,
      notes: null,
    })
  }

  const handleTemplateLoad = (data: {
    name: string
    exercises: Array<{
      exerciseTypeId: string | null
      muscleGroupId: string | null
      equipmentId: string | null
      sets: number
      reps: number
      weight: number | null
      notes: string | null
    }>
  }) => {
    form.setValue("name", data.name)
    // Remove all current exercises and replace with template
    while (fields.length > 0) {
      remove(0)
    }
    for (const ex of data.exercises) {
      append({
        exerciseTypeId: ex.exerciseTypeId || "",
        muscleGroupId: ex.muscleGroupId || null,
        equipmentId: ex.equipmentId || null,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        notes: ex.notes,
      })
    }
  }

  const onSubmit = async (data: WorkoutFormData) => {
    setLoading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("name", data.name)
      formData.append("date", data.date)
      if (data.duration) formData.append("duration", data.duration.toString())
      if (data.notes) formData.append("notes", data.notes)
      formData.append("exercises", JSON.stringify(data.exercises))

      const result = workout
        ? await updateWorkout(workout.id, formData)
        : await createWorkout(formData)

      if (result.success) {
        router.push("/dashboard/workouts")
        router.refresh()
      } else {
        setError(result.error || "Algo salió mal")
      }
    } catch (err: any) {
      setError(err.message || "Error al guardar el entrenamiento")
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

      {/* Workout Details */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Detalles del Entrenamiento</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Nombre del Entrenamiento *
          </label>
          <input
            type="text"
            {...form.register("name")}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ej., Día de pecho, Día de pierna"
          />
          {form.formState.errors.name && (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha *
            </label>
            <input
              type="date"
              {...form.register("date")}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {form.formState.errors.date && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.date.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Duración (minutos)
            </label>
            <input
              type="number"
              {...form.register("duration", { valueAsNumber: true })}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="60"
            />
            {form.formState.errors.duration && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.duration.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notas
          </label>
          <textarea
            {...form.register("notes")}
            rows={2}
            maxLength={500}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="¿Cómo te fue?"
          />
          {form.formState.errors.notes && (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.notes.message}</p>
          )}
        </div>
      </div>

      {/* Template Selector - only when creating */}
      {!isEditing && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cargar desde template
          </h3>
          <WorkoutTemplateSelector onTemplateLoad={handleTemplateLoad} />
        </div>
      )}

      {/* Exercises */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Ejercicios *</h3>
          <button
            type="button"
            onClick={addExercise}
            className="flex items-center px-3 py-1 text-sm bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md hover:bg-blue-100 dark:hover:bg-blue-800"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Agregar Ejercicio
          </button>
        </div>

        {/* Quick Add Bar */}
        <QuickAddBar
          onQuickAdd={handleQuickAdd}
          existingExerciseTypeIds={exerciseTypeIds}
        />

        {form.formState.errors.exercises && typeof form.formState.errors.exercises === 'object' && 'message' in form.formState.errors.exercises && (
          <p className="text-sm text-red-600">{form.formState.errors.exercises.message as string}</p>
        )}

        {fields.map((field, index) => (
          <CollapsibleExerciseCard
            key={field.id}
            index={index}
            totalCount={fields.length}
            form={form}
            field={field}
            onRemove={() => remove(index)}
            onMoveUp={() => moveExerciseUp(index)}
            onMoveDown={() => moveExerciseDown(index)}
            onDuplicate={() => duplicateExercise(index)}
            isFirst={index === 0}
            isLast={index === fields.length - 1}
          />
        ))}
      </div>

      {/* Submit */}
      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Guardando..." : workout ? "Actualizar Entrenamiento" : "Crear Entrenamiento"}
        </button>
      </div>
    </form>
  )
}
