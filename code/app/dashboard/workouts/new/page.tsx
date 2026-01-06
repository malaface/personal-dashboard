import { requireAuth } from "@/lib/auth/utils"
import WorkoutForm from "@/components/workouts/WorkoutForm"
import Link from "next/link"

export default async function NewWorkoutPage() {
  await requireAuth()

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href="/dashboard/workouts"
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm"
          >
            ← Volver a Entrenamientos
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">Nuevo Entrenamiento</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Registra tu sesión de entrenamiento</p>
        </div>

        <WorkoutForm />
      </div>
    </div>
  )
}
