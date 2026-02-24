import { requireAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/db/prisma"
import { notFound } from "next/navigation"
import WorkoutForm from "@/components/workouts/WorkoutForm"
import SwimmingForm from "@/components/workouts/cardio/SwimmingForm"
import RunningForm from "@/components/workouts/cardio/RunningForm"
import CyclingForm from "@/components/workouts/cardio/CyclingForm"
import Link from "next/link"

const typeToMode: Record<string, string> = {
  GYM: "gym",
  SWIMMING: "swimming",
  RUNNING: "running",
  CYCLING: "cycling",
}

const modeLabels: Record<string, string> = {
  gym: "Gimnasio",
  swimming: "Natacion",
  running: "Correr",
  cycling: "Ciclismo",
}

export default async function EditWorkoutPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await requireAuth()
  const { id } = await params

  const workout = await prisma.workout.findFirst({
    where: {
      id,
      userId: user.id,
    },
    include: {
      exercises: {
        include: {
          exerciseType: true,
          muscleGroup: true,
          equipment: true,
        },
      },
      cardioSession: true,
    },
  })

  if (!workout) {
    notFound()
  }

  const mode = typeToMode[workout.type] || "gym"

  const renderForm = () => {
    switch (workout.type) {
      case "SWIMMING":
        return <SwimmingForm workout={workout} />
      case "RUNNING":
        return <RunningForm workout={workout} />
      case "CYCLING":
        return <CyclingForm workout={workout} />
      default: {
        const workoutData = {
          id: workout.id,
          name: workout.name,
          date: workout.date,
          duration: workout.duration,
          caloriesBurned: workout.caloriesBurned,
          notes: workout.notes,
          exercises: workout.exercises.map(exercise => ({
            exerciseTypeId: exercise.exerciseTypeId,
            muscleGroupId: exercise.muscleGroupId,
            equipmentId: exercise.equipmentId,
            sets: exercise.sets,
            reps: exercise.reps,
            weight: exercise.weight,
            notes: exercise.notes,
          }))
        }
        return <WorkoutForm workout={workoutData} />
      }
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href={`/dashboard/workouts?mode=${mode}`}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm"
          >
            &larr; Volver a {modeLabels[mode]}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">Editar Sesion</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Modifica tu sesion de {modeLabels[mode].toLowerCase()}
          </p>
        </div>

        {renderForm()}
      </div>
    </div>
  )
}
