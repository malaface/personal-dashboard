"use client"

import { useForm, Controller, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createWorkout, updateWorkout } from "@/app/dashboard/workouts/actions"
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline"
import SmartCombobox from "@/components/catalog/SmartCombobox"

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

export default function WorkoutForm({ workout, onCancel }: WorkoutFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // React Hook Form
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
      })) || [{
        exerciseTypeId: "",
        muscleGroupId: null,
        equipmentId: null,
        sets: 3,
        reps: 10,
        weight: null,
        notes: null
      }]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "exercises"
  })

  const addExercise = () => {
    append({
      exerciseTypeId: "",
      muscleGroupId: null,
      equipmentId: null,
      sets: 3,
      reps: 10,
      weight: null,
      notes: null
    })
  }

  const removeExercise = (index: number) => {
    remove(index)
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
        setError(result.error || "Something went wrong")
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save workout")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold">Workout Details</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Workout Name *
          </label>
          <input
            type="text"
            {...form.register("name")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Chest Day, Leg Day"
          />
          {form.formState.errors.name && (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              {...form.register("date")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {form.formState.errors.date && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.date.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              {...form.register("duration", { valueAsNumber: true })}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="60"
            />
            {form.formState.errors.duration && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.duration.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            {...form.register("notes")}
            rows={2}
            maxLength={500}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="How did it go?"
          />
          {form.formState.errors.notes && (
            <p className="mt-1 text-sm text-red-600">{form.formState.errors.notes.message}</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Exercises *</h3>
          <button
            type="button"
            onClick={addExercise}
            className="flex items-center px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            Add Exercise
          </button>
        </div>

        {form.formState.errors.exercises && typeof form.formState.errors.exercises === 'object' && 'message' in form.formState.errors.exercises && (
          <p className="text-sm text-red-600">{form.formState.errors.exercises.message as string}</p>
        )}

        {fields.map((field, index) => (
          <div key={field.id} className="border border-gray-200 rounded-md p-4 space-y-3">
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-sm font-medium text-gray-700">Exercise #{index + 1}</h4>
              {fields.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeExercise(index)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded-md"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              )}
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">
                Exercise Type *
              </label>
              <Controller
                name={`exercises.${index}.exerciseTypeId`}
                control={form.control}
                render={({ field }) => (
                  <SmartCombobox
                    catalogType="exercise_category"
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select exercise (Bench Press, Squat, etc.)"
                    required
                    error={form.formState.errors.exercises?.[index]?.exerciseTypeId?.message}
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Muscle Group (Optional)
                </label>
                <Controller
                  name={`exercises.${index}.muscleGroupId`}
                  control={form.control}
                  render={({ field }) => (
                    <SmartCombobox
                      catalogType="muscle_group"
                      value={field.value || ""}
                      onChange={(value) => field.onChange(value || null)}
                      placeholder="Select muscle group"
                      error={form.formState.errors.exercises?.[index]?.muscleGroupId?.message}
                    />
                  )}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">
                  Equipment (Optional)
                </label>
                <Controller
                  name={`exercises.${index}.equipmentId`}
                  control={form.control}
                  render={({ field }) => (
                    <SmartCombobox
                      catalogType="equipment_type"
                      value={field.value || ""}
                      onChange={(value) => field.onChange(value || null)}
                      placeholder="Select equipment"
                      error={form.formState.errors.exercises?.[index]?.equipmentId?.message}
                    />
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Sets *</label>
                <input
                  type="number"
                  {...form.register(`exercises.${index}.sets`, { valueAsNumber: true })}
                  min="1"
                  className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                />
                {form.formState.errors.exercises?.[index]?.sets && (
                  <p className="mt-1 text-xs text-red-600">
                    {form.formState.errors.exercises[index]?.sets?.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Reps *</label>
                <input
                  type="number"
                  {...form.register(`exercises.${index}.reps`, { valueAsNumber: true })}
                  min="1"
                  className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                />
                {form.formState.errors.exercises?.[index]?.reps && (
                  <p className="mt-1 text-xs text-red-600">
                    {form.formState.errors.exercises[index]?.reps?.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  {...form.register(`exercises.${index}.weight`, {
                    valueAsNumber: true,
                    setValueAs: (v) => v === '' ? null : Number(v)
                  })}
                  min="0"
                  step="0.5"
                  className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                />
                {form.formState.errors.exercises?.[index]?.weight && (
                  <p className="mt-1 text-xs text-red-600">
                    {form.formState.errors.exercises[index]?.weight?.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : workout ? "Update Workout" : "Create Workout"}
        </button>
      </div>
    </form>
  )
}
