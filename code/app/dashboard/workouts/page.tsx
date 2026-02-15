import { requireAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/db/prisma"
import Link from "next/link"
import { Suspense } from "react"
import WorkoutModeTabs from "@/components/workouts/WorkoutModeTabs"
import WorkoutList from "@/components/workouts/WorkoutList"
import GeneralOverview from "@/components/workouts/GeneralOverview"
import CardioWorkoutList from "@/components/workouts/cardio/CardioWorkoutList"
import { WorkoutType } from "@prisma/client"

const modeToType: Record<string, WorkoutType> = {
  gym: "GYM",
  swimming: "SWIMMING",
  running: "RUNNING",
  cycling: "CYCLING",
}

const modeLabels: Record<string, string> = {
  general: "Entrenamiento",
  gym: "Gimnasio",
  swimming: "Natacion",
  running: "Correr",
  cycling: "Ciclismo",
}

export default async function WorkoutsPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>
}) {
  const user = await requireAuth()
  const params = await searchParams
  const mode = params.mode || "general"

  if (mode === "general") {
    const workouts = await prisma.workout.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        name: true,
        type: true,
        date: true,
        duration: true,
        caloriesBurned: true,
      },
      orderBy: { date: "desc" },
    })

    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Entrenamiento</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Resumen de toda tu actividad</p>
            </div>
            <Link
              href="/dashboard/workouts/progress"
              className="px-4 py-2 border border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              Ver Progreso
            </Link>
          </div>

          <Suspense fallback={<div className="animate-pulse h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />}>
            <WorkoutModeTabs />
          </Suspense>

          <GeneralOverview workouts={workouts} />
        </div>
      </div>
    )
  }

  if (mode === "gym") {
    const workouts = await prisma.workout.findMany({
      where: { userId: user.id, type: "GYM" },
      include: {
        exercises: {
          include: {
            exerciseType: true,
            muscleGroup: true,
            equipment: true,
          },
        },
      },
      orderBy: { date: "desc" },
    })

    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gimnasio</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Tus sesiones de pesas y ejercicios</p>
            </div>
            <Link
              href="/dashboard/workouts/progress"
              className="px-4 py-2 border border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              Ver Progreso
            </Link>
          </div>

          <Suspense fallback={<div className="animate-pulse h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />}>
            <WorkoutModeTabs />
          </Suspense>

          <WorkoutList workouts={workouts} />

          <Link
            href="/dashboard/workouts/new?mode=gym"
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

  // Cardio modes: swimming, running, cycling
  const workoutType = modeToType[mode]
  if (!workoutType) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-500">Modo no reconocido</p>
        </div>
      </div>
    )
  }

  const workouts = await prisma.workout.findMany({
    where: { userId: user.id, type: workoutType },
    include: { cardioSession: true },
    orderBy: { date: "desc" },
  })

  const cardioMode = mode as "swimming" | "running" | "cycling"

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{modeLabels[mode]}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Tus sesiones de {modeLabels[mode].toLowerCase()}</p>
          </div>
          <Link
            href={`/dashboard/workouts/progress?mode=${mode}`}
            className="px-4 py-2 border border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            Ver Progreso
          </Link>
        </div>

        <Suspense fallback={<div className="animate-pulse h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />}>
          <WorkoutModeTabs />
        </Suspense>

        <CardioWorkoutList workouts={workouts} mode={cardioMode} />

        <Link
          href={`/dashboard/workouts/new?mode=${mode}`}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
          title="Nueva Sesion"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
