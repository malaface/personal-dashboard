"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { deleteWorkout } from "@/app/dashboard/workouts/actions"
import {
  TrashIcon,
  PencilIcon,
  PlusIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  FireIcon,
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
  caloriesBurned?: number | null
  notes?: string | null
  exercises: Exercise[]
}

interface WorkoutListProps {
  workouts: Workout[]
}

export default function WorkoutList({ workouts }: WorkoutListProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

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
    } catch {
      alert("Ocurrió un error")
    } finally {
      setDeletingId(null)
    }
  }

  const toggleExpand = (workoutId: string) => {
    setExpandedId((prev) => (prev === workoutId ? null : workoutId))
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
    <div className="space-y-3">
      {workouts.map((workout) => {
        const isExpanded = expandedId === workout.id

        return (
          <div key={workout.id} className="bg-white dark:bg-gray-800 rounded-lg shadow">
            {/* Summary row - always visible */}
            <div
              className="flex items-center justify-between px-4 sm:px-6 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
              onClick={() => toggleExpand(workout.id)}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {isExpanded ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                    {workout.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    <span>
                      {new Date(workout.date).toLocaleDateString("es-MX", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    {workout.duration && (
                      <span className="flex items-center gap-1">
                        <ClockIcon className="h-3.5 w-3.5" />
                        {workout.duration} min
                      </span>
                    )}
                    {workout.caloriesBurned && (
                      <span className="flex items-center gap-1">
                        <FireIcon className="h-3.5 w-3.5" />
                        {Math.round(workout.caloriesBurned)} kcal
                      </span>
                    )}
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      {workout.exercises.length} ejercicio{workout.exercises.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1 ml-2" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => router.push(`/dashboard/workouts/${workout.id}/edit`)}
                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition"
                  title="Editar entrenamiento"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(workout.id)}
                  disabled={deletingId === workout.id}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition disabled:opacity-50"
                  title="Eliminar entrenamiento"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Expanded exercise details */}
            <div
              className={`grid transition-all duration-300 ease-in-out ${
                isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="border-t border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-4">
                  {workout.notes && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 italic">
                      {workout.notes}
                    </p>
                  )}
                  <div className="space-y-2">
                    {workout.exercises.map((exercise) => (
                      <div
                        key={exercise.id}
                        className="flex justify-between items-center bg-gray-50 dark:bg-gray-900 px-4 py-2 rounded-md"
                      >
                        <span className="font-medium text-gray-800 dark:text-gray-200 text-sm">
                          {exercise.exerciseType?.name || exercise.name || "Ejercicio desconocido"}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {exercise.sets} x {exercise.reps}
                          {exercise.weight != null && exercise.weight > 0 && ` @ ${exercise.weight}kg`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
