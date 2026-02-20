import { requireAuth } from "@/lib/auth/utils"
import WorkoutForm from "@/components/workouts/WorkoutForm"
import SwimmingForm from "@/components/workouts/cardio/SwimmingForm"
import RunningForm from "@/components/workouts/cardio/RunningForm"
import CyclingForm from "@/components/workouts/cardio/CyclingForm"
import Link from "next/link"

const modeLabels: Record<string, string> = {
  gym: "Gimnasio",
  swimming: "Natacion",
  running: "Correr",
  cycling: "Ciclismo",
}

export default async function NewWorkoutPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>
}) {
  await requireAuth()
  const params = await searchParams
  const mode = params.mode || "gym"

  const renderForm = () => {
    switch (mode) {
      case "swimming":
        return <SwimmingForm />
      case "running":
        return <RunningForm />
      case "cycling":
        return <CyclingForm />
      default:
        return <WorkoutForm />
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
            &larr; Volver a {modeLabels[mode] || "Entrenamientos"}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-4">
            Nueva Sesion de {modeLabels[mode] || "Entrenamiento"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Registra tu sesion de {(modeLabels[mode] || "entrenamiento").toLowerCase()}
          </p>
        </div>

        {renderForm()}
      </div>
    </div>
  )
}
