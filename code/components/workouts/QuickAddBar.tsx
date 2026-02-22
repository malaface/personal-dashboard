"use client"

import { useState, useEffect } from "react"
import { ClockIcon } from "@heroicons/react/24/outline"

interface RecentExercise {
  id: string
  name: string
  lastPerformed: string
  totalWorkouts: number
}

interface QuickAddBarProps {
  onQuickAdd: (exerciseTypeId: string, exerciseName: string) => void
  existingExerciseTypeIds: string[]
}

export default function QuickAddBar({
  onQuickAdd,
  existingExerciseTypeIds,
}: QuickAddBarProps) {
  const [exercises, setExercises] = useState<RecentExercise[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const response = await fetch("/api/exercises/recent?limit=10")
        if (response.ok) {
          const data = await response.json()
          setExercises(data.exercises || [])
        }
      } catch (error) {
        console.error("Error fetching recent exercises:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecent()
  }, [])

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <ClockIcon className="h-4 w-4" />
          <span>Agregar rápido</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse flex-shrink-0"
            />
          ))}
        </div>
      </div>
    )
  }

  if (exercises.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <ClockIcon className="h-4 w-4" />
        <span>Agregar rápido</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {exercises.map((exercise) => {
          const isExisting = existingExerciseTypeIds.includes(exercise.id)
          return (
            <button
              key={exercise.id}
              type="button"
              onClick={() => onQuickAdd(exercise.id, exercise.name)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition whitespace-nowrap ${
                isExisting
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-600"
                  : "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/50"
              }`}
            >
              {exercise.name}
              <span className="ml-1 text-xs opacity-60">×{exercise.totalWorkouts}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
