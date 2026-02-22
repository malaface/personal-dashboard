"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteWorkout } from "@/app/dashboard/workouts/actions"
import { TrashIcon, PencilIcon } from "@heroicons/react/24/outline"

interface Exercise {
  id: string
  name?: string | null
  exerciseTypeId?: string | null
  muscleGroupId?: string | null
  equipmentId?: string | null
  exerciseType?: { id: string; name: string } | null
  muscleGroup?: { id: string; name: string } | null
  equipment?: { id: string; name: string } | null
  sets: number
  reps: number
  weight?: number | null
}

interface Workout {
  id: string
  name: string
  date: Date
  duration?: number | null
  notes?: string | null
  exercises: Exercise[]
}

interface WorkoutListProps {
  workouts: Workout[]
}

export default function WorkoutList({ workouts }: WorkoutListProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (workoutId: string) => {
    if (!confirm("Are you sure you want to delete this workout?")) return

    setDeletingId(workoutId)

    try {
      const result = await deleteWorkout(workoutId)

      if (result.success) {
        router.refresh()
      } else {
        alert(result.error || "Failed to delete workout")
      }
    } catch (_error) {
      alert("An error occurred")
    } finally {
      setDeletingId(null)
    }
  }

  if (workouts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-gray-500 text-lg">No workouts yet</p>
        <p className="text-gray-400 mt-2">Create your first workout to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {workouts.map((workout) => (
        <div key={workout.id} className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">{workout.name}</h3>
              <p className="text-gray-500 text-sm mt-1">
                {new Date(workout.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                {workout.duration && ` • ${workout.duration} minutes`}
              </p>
              {workout.notes && (
                <p className="text-gray-600 text-sm mt-2 italic">{workout.notes}</p>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => router.push(`/dashboard/workouts/${workout.id}/edit`)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition"
                title="Edit workout"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleDelete(workout.id)}
                disabled={deletingId === workout.id}
                className="p-2 text-red-600 hover:bg-red-50 rounded-md transition disabled:opacity-50"
                title="Delete workout"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {workout.exercises.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Exercises ({workout.exercises.length})
              </h4>
              <div className="space-y-2">
                {workout.exercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="flex justify-between items-center bg-gray-50 px-4 py-2 rounded-md"
                  >
                    <span className="font-medium text-gray-800">
                      {exercise.exerciseType?.name || exercise.name || "Unknown Exercise"}
                    </span>
                    <span className="text-sm text-gray-600">
                      {exercise.sets} × {exercise.reps}
                      {exercise.weight && ` @ ${exercise.weight}kg`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
