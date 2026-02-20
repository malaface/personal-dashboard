"use client"

import { useState, useEffect } from "react"
import { ClockIcon } from "@heroicons/react/24/outline"

interface RecentMeal {
  id: string
  name: string
  mealType: string
  mealTypeLabel: string
  totalCalories: number
  foodItems: Array<{
    name: string
    quantity: number
    unit: string
    calories: number | null
    protein: number | null
    carbs: number | null
    fats: number | null
  }>
}

interface QuickMealBarProps {
  onQuickLoad: (meal: RecentMeal) => void
}

export default function QuickMealBar({ onQuickLoad }: QuickMealBarProps) {
  const [meals, setMeals] = useState<RecentMeal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const response = await fetch("/api/nutrition/recent?limit=10")
        if (response.ok) {
          const data = await response.json()
          setMeals(data.meals || [])
        }
      } catch (error) {
        console.error("Error fetching recent meals:", error)
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
          <span>Comidas recientes</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-8 w-28 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse flex-shrink-0"
            />
          ))}
        </div>
      </div>
    )
  }

  if (meals.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <ClockIcon className="h-4 w-4" />
        <span>Comidas recientes</span>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {meals.map((meal) => (
          <button
            key={meal.id}
            type="button"
            onClick={() => onQuickLoad(meal)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium border transition whitespace-nowrap bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900/50"
          >
            {meal.name}
            <span className="ml-1 text-xs opacity-60">{meal.mealTypeLabel}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
