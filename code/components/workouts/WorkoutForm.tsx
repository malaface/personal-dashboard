"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createWorkout, updateWorkout } from "@/app/dashboard/workouts/actions"
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline"

interface Exercise {
  name: string
  sets: number
  reps: number
  weight?: number | null
  notes?: string | null
}

interface WorkoutFormProps {
  workout?: {
    id: string
    name: string
    date: Date
    duration?: number | null
    notes?: string | null
    exercises: Exercise[]
  }
  onCancel?: () => void
}

export default function WorkoutForm({ workout, onCancel }: WorkoutFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [name, setName] = useState(workout?.name || "")
  const [date, setDate] = useState(
    workout?.date ? new Date(workout.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  )
  const [duration, setDuration] = useState(workout?.duration?.toString() || "")
  const [notes, setNotes] = useState(workout?.notes || "")
  const [exercises, setExercises] = useState<Exercise[]>(
    workout?.exercises || [{ name: "", sets: 3, reps: 10, weight: 0 }]
  )

  const addExercise = () => {
    setExercises([...exercises, { name: "", sets: 3, reps: 10, weight: 0 }])
  }

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index))
  }

  const updateExercise = (index: number, field: keyof Exercise, value: any) => {
    const updated = [...exercises]
    updated[index] = { ...updated[index], [field]: value }
    setExercises(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("date", date)
      if (duration) formData.append("duration", duration)
      if (notes) formData.append("notes", notes)
      formData.append("exercises", JSON.stringify(exercises.map(ex => ({
        name: ex.name,
        sets: Number(ex.sets),
        reps: Number(ex.reps),
        weight: ex.weight ? Number(ex.weight) : undefined,
        notes: ex.notes || undefined,
      }))))

      const result = workout
        ? await updateWorkout(workout.id, formData)
        : await createWorkout(formData)

      if (result.success) {
        router.push("/dashboard/workouts")
        router.refresh()
      } else {
        setError(result.error || "Something went wrong")
      }
    } catch (err: any) {
      setError(err.message || "Failed to save workout")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Chest Day, Leg Day"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="60"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            maxLength={500}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="How did it go?"
          />
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

        {exercises.map((exercise, index) => (
          <div key={index} className="border border-gray-200 rounded-md p-4 space-y-3">
            <div className="flex justify-between items-start">
              <input
                type="text"
                value={exercise.name}
                onChange={(e) => updateExercise(index, "name", e.target.value)}
                required
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Exercise name"
              />
              {exercises.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeExercise(index)}
                  className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-md"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Sets</label>
                <input
                  type="number"
                  value={exercise.sets}
                  onChange={(e) => updateExercise(index, "sets", e.target.value)}
                  required
                  min="1"
                  className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Reps</label>
                <input
                  type="number"
                  value={exercise.reps}
                  onChange={(e) => updateExercise(index, "reps", e.target.value)}
                  required
                  min="1"
                  className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={exercise.weight || ""}
                  onChange={(e) => updateExercise(index, "weight", e.target.value ? parseFloat(e.target.value) : undefined)}
                  min="0"
                  step="0.5"
                  className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                />
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
