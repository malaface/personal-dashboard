"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { deleteWorkout } from "@/app/dashboard/workouts/actions"
import { TrashIcon, PencilIcon, PlusIcon } from "@heroicons/react/24/outline"

interface CardioSession {
  distance?: number | null
  distanceUnit?: string | null
  pace?: number | null
  avgSpeed?: number | null
  maxSpeed?: number | null
  elevationGain?: number | null
  avgHeartRate?: number | null
  laps?: number | null
  poolSize?: number | null
  strokeType?: string | null
}

interface CardioWorkout {
  id: string
  name: string
  type: string
  date: Date
  duration?: number | null
  caloriesBurned?: number | null
  notes?: string | null
  cardioSession?: CardioSession | null
}

interface CardioWorkoutListProps {
  workouts: CardioWorkout[]
  mode: "swimming" | "running" | "cycling"
}

const strokeLabels: Record<string, string> = {
  FREESTYLE: "Libre",
  BACKSTROKE: "Dorso",
  BREASTSTROKE: "Pecho",
  BUTTERFLY: "Mariposa",
  MIXED: "Mixto",
}

const modeLabels: Record<string, string> = {
  swimming: "Natacion",
  running: "Carrera",
  cycling: "Ciclismo",
}

const modeColors: Record<string, string> = {
  swimming: "cyan",
  running: "green",
  cycling: "amber",
}

export default function CardioWorkoutList({ workouts, mode }: CardioWorkoutListProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (workoutId: string) => {
    if (!confirm("Estas seguro de que quieres eliminar esta sesion?")) return

    setDeletingId(workoutId)
    try {
      const result = await deleteWorkout(workoutId)
      if (result.success) {
        router.refresh()
      } else {
        alert(result.error || "Error al eliminar")
      }
    } catch {
      alert("Ocurrio un error")
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
        <p className="text-gray-500 dark:text-gray-400 text-lg">Sin sesiones de {modeLabels[mode]} aun</p>
        <p className="text-gray-400 dark:text-gray-500 mt-2">Registra tu primera sesion</p>
        <Link
          href={`/dashboard/workouts/new?mode=${mode}`}
          className={`inline-flex items-center mt-4 px-4 py-2 bg-${modeColors[mode]}-600 text-white rounded-md hover:bg-${modeColors[mode]}-700 transition`}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Nueva Sesion
        </Link>
      </div>
    )
  }

  const renderMetrics = (session: CardioSession | null | undefined) => {
    if (!session) return null

    switch (mode) {
      case "swimming":
        return (
          <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
            {session.distance != null && <span>{session.distance} m</span>}
            {session.laps != null && <span>{session.laps} vueltas</span>}
            {session.poolSize != null && <span>{session.poolSize}m alberca</span>}
            {session.strokeType && <span>{strokeLabels[session.strokeType] || session.strokeType}</span>}
            {session.avgHeartRate != null && <span>{session.avgHeartRate} bpm</span>}
          </div>
        )
      case "running":
        return (
          <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
            {session.distance != null && <span>{session.distance} km</span>}
            {session.pace != null && <span>{session.pace} min/km</span>}
            {session.elevationGain != null && <span>{session.elevationGain} m desnivel</span>}
            {session.avgHeartRate != null && <span>{session.avgHeartRate} bpm</span>}
          </div>
        )
      case "cycling":
        return (
          <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400">
            {session.distance != null && <span>{session.distance} km</span>}
            {session.avgSpeed != null && <span>{session.avgSpeed} km/h avg</span>}
            {session.maxSpeed != null && <span>{session.maxSpeed} km/h max</span>}
            {session.elevationGain != null && <span>{session.elevationGain} m desnivel</span>}
            {session.avgHeartRate != null && <span>{session.avgHeartRate} bpm</span>}
          </div>
        )
    }
  }

  return (
    <div className="space-y-4">
      {workouts.map((workout) => (
        <div key={workout.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-3">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{workout.name}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                {new Date(workout.date).toLocaleDateString("es-MX", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                {workout.duration && ` · ${workout.duration} min`}
                {workout.caloriesBurned && ` · ${workout.caloriesBurned} kcal`}
              </p>
              {workout.notes && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 italic">{workout.notes}</p>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => router.push(`/dashboard/workouts/${workout.id}/edit`)}
                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition"
                title="Editar sesion"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleDelete(workout.id)}
                disabled={deletingId === workout.id}
                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition disabled:opacity-50"
                title="Eliminar sesion"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {workout.cardioSession && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
              {renderMetrics(workout.cardioSession)}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
