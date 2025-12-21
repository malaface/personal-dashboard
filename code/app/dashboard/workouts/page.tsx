import { requireAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/db/prisma"
import Link from "next/link"
import WorkoutList from "@/components/workouts/WorkoutList"

export default async function WorkoutsPage() {
  const user = await requireAuth()

  const workouts = await prisma.workout.findMany({
    where: { userId: user.id },
    include: {
      exercises: {
        include: {
          exerciseType: true,
          muscleGroup: true,
          equipment: true,
        }
      }
    },
    orderBy: { date: 'desc' },
  })

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gym Training</h1>
            <p className="text-gray-600 mt-2">Track your workouts and progress</p>
          </div>
          <Link
            href="/dashboard/workouts/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            New Workout
          </Link>
        </div>

        <WorkoutList workouts={workouts} />
      </div>
    </div>
  )
}
