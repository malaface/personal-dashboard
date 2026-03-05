"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { LayoutGrid, Dumbbell, Waves, Footprints, Bike } from "lucide-react"

const modes = [
  { key: "general", label: "General", icon: LayoutGrid },
  { key: "gym", label: "Gimnasio", icon: Dumbbell },
  { key: "swimming", label: "Natacion", icon: Waves },
  { key: "running", label: "Correr", icon: Footprints },
  { key: "cycling", label: "Ciclismo", icon: Bike },
]

export default function WorkoutModeTabs() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentMode = searchParams.get("mode") || "general"

  const handleModeChange = (mode: string) => {
    router.push(`/dashboard/workouts?mode=${mode}`)
  }

  return (
    <div className="flex overflow-x-auto scrollbar-hide gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-6">
      {modes.map((mode) => {
        const Icon = mode.icon
        return (
          <button
            key={mode.key}
            onClick={() => handleModeChange(mode.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
              currentMode === mode.key
                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
          >
            <Icon className="w-5 h-5" />
            {mode.label}
          </button>
        )
      })}
    </div>
  )
}
