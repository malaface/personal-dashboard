import { requireAuth } from "@/lib/auth/utils"
import Link from "next/link"
import { Suspense } from "react"
import ExerciseProgressDashboard from "@/components/workouts/progress/ExerciseProgressDashboard"
import CardioProgressDashboard from "@/components/workouts/progress/CardioProgressDashboard"
import WorkoutProgressTabs from "./WorkoutProgressTabs"

export const metadata = {
  title: "Progreso de Entrenamiento | Dashboard",
  description: "Visualiza tu progreso de entrenamiento a lo largo del tiempo",
}

const modeLabels: Record<string, string> = {
  gym: "Gimnasio",
  swimming: "Natacion",
  running: "Correr",
  cycling: "Ciclismo",
}

export default async function ProgressPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>
}) {
  await requireAuth()
  const params = await searchParams
  const mode = params.mode || "gym"

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Progreso - {modeLabels[mode] || "Entrenamiento"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Rastrea tu evolucion a lo largo del tiempo
            </p>
          </div>
          <Link
            href={`/dashboard/workouts?mode=${mode}`}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Volver a Entrenamientos
          </Link>
        </div>

        <Suspense fallback={<div className="animate-pulse h-10 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6" />}>
          <WorkoutProgressTabs />
        </Suspense>

        {mode === "gym" && <ExerciseProgressDashboard />}
        {(mode === "swimming" || mode === "running" || mode === "cycling") && (
          <CardioProgressDashboard mode={mode} />
        )}
      </div>
    </div>
  )
}
