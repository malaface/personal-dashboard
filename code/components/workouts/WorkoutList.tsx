"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { deleteWorkout } from "@/app/dashboard/workouts/actions"
import {
  TrashIcon,
  PencilIcon,
  PlusIcon,
} from "@heroicons/react/24/outline"

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
    if (!confirm("¿Estás seguro de que quieres eliminar este entrenamiento?")) return

    setDeletingId(workoutId)

    try {
      const result = await deleteWorkout(workoutId)

      if (result.success) {
        router.refresh()
      } else {
        alert(result.error || "Error al eliminar entrenamiento")
      }
    } catch (error) {
      alert("Ocurrió un error")
    } finally {
      setDeletingId(null)
    }
  }

  if (workouts.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
        <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
          <PlusIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-lg">Sin entrenamientos aún</p>
        <p className="text-gray-400 dark:text-gray-500 mt-2">Registra tu primera sesión de entrenamiento</p>
        <Link
          href="/dashboard/workouts/new"
          className="inline-flex items-center mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Nuevo Entrenamiento
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {workouts.map((workout) => (
        <div key={workout.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{workout.name}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                {new Date(workout.date).toLocaleDateString("es-MX", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                {workout.duration && ` • ${workout.duration} minutos`}
              </p>
              {workout.notes && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 italic">{workout.notes}</p>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => router.push(`/dashboard/workouts/${workout.id}/edit`)}
                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition"
                title="Editar entrenamiento"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleDelete(workout.id)}
                disabled={deletingId === workout.id}
                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition disabled:opacity-50"
                title="Eliminar entrenamiento"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {workout.exercises.length > 0 && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Ejercicios ({workout.exercises.length})
              </h4>
              <div className="space-y-2">
                {workout.exercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="flex justify-between items-center bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded-md"
                  >
                    <span className="font-medium text-gray-800 dark:text-gray-200">
                      {exercise.exerciseType?.name || exercise.name || "Ejercicio desconocido"}
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
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
