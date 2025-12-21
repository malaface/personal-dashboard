import { requireAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/db/prisma"
import { notFound, redirect } from "next/navigation"
import WorkoutForm from "@/components/workouts/WorkoutForm"
import Link from "next/link"

export default async function EditWorkoutPage({
  params,
}: {
  params: { id: string }
}) {
  const user = await requireAuth()

  // Fetch workout with authorization check
  const workout = await prisma.workout.findFirst({
    where: {
      id: params.id,
      userId: user.id, // ← Authorization: user can only edit their own workouts
    },
    include: {
      exercises: true,
    },
  })

  if (!workout) {
    notFound()
  }

  // Transform Prisma data to WorkoutForm format
  const workoutData = {
    id: workout.id,
    name: workout.name,
    date: workout.date,
    duration: workout.duration,
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

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href="/dashboard/workouts"
            className="text-blue-600 hover:text-blue-700 text-sm"
          >
            ← Back to Workouts
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Edit Workout</h1>
          <p className="text-gray-600 mt-2">Update your workout details</p>
        </div>

        <WorkoutForm workout={workoutData} />
      </div>
    </div>
  )
}
