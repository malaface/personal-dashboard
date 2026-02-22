"use client"

import { useRouter, useSearchParams } from "next/navigation"

const modes = [
  { key: "gym", label: "Gimnasio" },
  { key: "swimming", label: "Natacion" },
  { key: "running", label: "Correr" },
  { key: "cycling", label: "Ciclismo" },
]

export default function WorkoutProgressTabs() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentMode = searchParams.get("mode") || "gym"

  return (
    <div className="flex overflow-x-auto scrollbar-hide gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-6">
      {modes.map((mode) => (
        <button
          key={mode.key}
          onClick={() => router.push(`/dashboard/workouts/progress?mode=${mode.key}`)}
          className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
            currentMode === mode.key
              ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
          }`}
        >
          {mode.label}
        </button>
      ))}
    </div>
  )
}
