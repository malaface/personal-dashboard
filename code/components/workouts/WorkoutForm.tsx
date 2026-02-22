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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Form } from "@/components/ui/form"
import { useKeyboardVisible } from "@/lib/hooks/useKeyboardVisible"

// Zod Schemas
const setDetailSchema = z.object({
  setNumber: z.number().int().min(1),
  reps: z.number().int().min(1),
  weight: z.number().min(0).nullable().optional(),
  completed: z.boolean(),
})

const exerciseSchema = z.object({
  exerciseTypeId: z.string().min(1, "Exercise type required"),
  muscleGroupId: z.string().nullable().optional(),
  equipmentId: z.string().nullable().optional(),
  sets: z.number().int().min(1, "Sets must be at least 1"),
  reps: z.number().int().min(1, "Reps must be at least 1"),
  weight: z.number().min(0).nullable().optional(),
  weightUnit: z.enum(["kg", "lbs"]),
  notes: z.string().max(200).nullable().optional(),
  setDetails: z.array(setDetailSchema).optional(),
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
      weightUnit?: string
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
  weightUnit: "kg" as const,
  notes: null,
}

export default function WorkoutForm({ workout, onCancel }: WorkoutFormProps) {
  const router = useRouter()
  const isKeyboardVisible = useKeyboardVisible()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const isEditing = !!workout

  // Track which exercise card is open (-1 = all collapsed)
  const [openExerciseIndex, setOpenExerciseIndex] = useState<number>(isEditing ? -1 : 0)

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
        weightUnit: (ex.weightUnit as "kg" | "lbs") || "kg",
        notes: ex.notes,
      })) || [{ ...emptyExercise }]
    }
  })

  const { fields, append, remove, swap, insert, replace } = useFieldArray({
    control: form.control,
    name: "exercises"
  })

  // Watch exercise type IDs for QuickAddBar
  const exerciseTypeIds = form.watch("exercises")?.map(e => e.exerciseTypeId).filter(Boolean) || []

  const addExercise = () => {
    append({ ...emptyExercise })
    // Auto-open the new exercise and collapse others
    setOpenExerciseIndex(fields.length)
  }

  const handleToggleExercise = (index: number) => {
    setOpenExerciseIndex(prev => prev === index ? -1 : index)
  }

  const moveExerciseUp = (index: number) => {
    if (index > 0) {
      swap(index, index - 1)
      // Follow the moved card
      if (openExerciseIndex === index) setOpenExerciseIndex(index - 1)
      else if (openExerciseIndex === index - 1) setOpenExerciseIndex(index)
    }
  }

  const moveExerciseDown = (index: number) => {
    if (index < fields.length - 1) {
      swap(index, index + 1)
      // Follow the moved card
      if (openExerciseIndex === index) setOpenExerciseIndex(index + 1)
      else if (openExerciseIndex === index + 1) setOpenExerciseIndex(index)
    }
  }

  const duplicateExercise = (index: number) => {
    const current = form.getValues(`exercises.${index}`)
    insert(index + 1, { ...current })
    // Open the duplicate
    setOpenExerciseIndex(index + 1)
  }

  const handleRemoveExercise = (index: number) => {
    remove(index)
    // Adjust open index after removal
    if (openExerciseIndex === index) {
      setOpenExerciseIndex(-1)
    } else if (openExerciseIndex > index) {
      setOpenExerciseIndex(openExerciseIndex - 1)
    }
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
            weightUnit: data.lastWorkout.weightUnit || "kg",
            notes: null,
          })
          setOpenExerciseIndex(fields.length)
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
      weightUnit: "kg",
      notes: null,
    })
    setOpenExerciseIndex(fields.length)
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
    // Replace all exercises at once (avoids per-item re-renders)
    replace(
      data.exercises.map(ex => ({
        exerciseTypeId: ex.exerciseTypeId || "",
        muscleGroupId: ex.muscleGroupId || null,
        equipmentId: ex.equipmentId || null,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        weightUnit: "kg",
        notes: ex.notes,
      }))
    )
    // Collapse all after template load for overview
    setOpenExerciseIndex(-1)
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
        setError(result.error || "Algo salio mal")
      }
    } catch (err: any) {
      setError(err.message || "Error al guardar el entrenamiento")
    } finally {
      setLoading(false)
    }
  }

  return (
    // CAMBIO IMPORTANTE AQUI:
    // Envolvemos todo con <Form {...form}>
    <Form {...form}>
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
            <Label>Nombre del Entrenamiento *</Label>
            <Input
              type="text"
              {...form.register("name")}
              placeholder="ej., Dia de pecho, Dia de pierna"
              className="mt-1"
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
              {form.formState.errors.date && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.date.message}</p>
              )}
            </div>

            <div>
              <Label>Duracion (minutos)</Label>
              <Input
                type="number"
                {...form.register("duration", { setValueAs: (v) => v === '' || Number.isNaN(Number(v)) ? undefined : Number(v) })}
                min="1"
                placeholder="60"
                className="mt-1"
              />
              {form.formState.errors.duration && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.duration.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label>Notas</Label>
            <Textarea
              {...form.register("notes")}
              rows={2}
              maxLength={500}
              placeholder="Como te fue?"
              className="mt-1"
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
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={addExercise}
              className="rounded-full bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-800"
              title="Agregar ejercicio"
            >
              <PlusIcon className="h-5 w-5" />
            </Button>
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
              onRemove={() => handleRemoveExercise(index)}
              onMoveUp={() => moveExerciseUp(index)}
              onMoveDown={() => moveExerciseDown(index)}
              onDuplicate={() => duplicateExercise(index)}
              isFirst={index === 0}
              isLast={index === fields.length - 1}
              isOpen={openExerciseIndex === index}
              onToggle={() => handleToggleExercise(index)}
            />
          ))}
        </div>

        {/* Submit */}
        <div className="flex justify-end space-x-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? "Guardando..." : workout ? "Actualizar Entrenamiento" : "Crear Entrenamiento"}
          </Button>
        </div>

        {/* Floating Action Button */}
        {!isKeyboardVisible && (
          <button
            type="button"
            onClick={addExercise}
            className="
              fixed bottom-20 right-6 sm:bottom-10 sm:right-10
              z-50 flex h-14 w-14 sm:h-16 sm:w-16
              items-center justify-center
              rounded-full bg-blue-600 text-white
              shadow-[0_8px_30px_rgb(0,0,0,0.12)]
              transition-all
              hover:bg-blue-700 hover:scale-110
              active:scale-95
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
            "
            title="Agregar nuevo ejercicio"
          >
            <PlusIcon className="h-8 w-8 sm:h-9 sm:w-9 stroke-[2.5]" />
          </button>
        )}
      </form>
    </Form> // Cerramos Form al final
  )
}