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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Entrenamiento</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Rastrea tus entrenamientos y progreso</p>
          </div>
          <Link
            href="/dashboard/workouts/progress"
            className="px-4 py-2 border border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            Ver Progreso
          </Link>
        </div>

        <WorkoutList workouts={workouts} />

        {/* FAB */}
        <Link
          href="/dashboard/workouts/new"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
          title="Nuevo Entrenamiento"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
