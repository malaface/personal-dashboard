import { requireAuth } from "@/lib/auth/utils"
import Link from "next/link"
import ExerciseProgressDashboard from "@/components/workouts/progress/ExerciseProgressDashboard"

export const metadata = {
  title: "Progreso de Ejercicios | Dashboard",
  description: "Visualiza tu progreso por ejercicio a lo largo del tiempo",
}

export default async function ExerciseProgressPage() {
  await requireAuth()

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Progreso de Ejercicios
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Rastrea tu evolución por ejercicio, peso, volumen y repeticiones
            </p>
          </div>
          <Link
            href="/dashboard/workouts"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Volver a Entrenamientos
          </Link>
        </div>

        <ExerciseProgressDashboard />
      </div>
    </div>
  )
}
