"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteMeal } from "@/app/dashboard/nutrition/actions"
import { TrashIcon, PencilIcon } from "@heroicons/react/24/outline"

interface Meal {
  id: string
  name: string
  mealType: string
  date: Date
  notes?: string | null
  foodItems: Array<{
    id: string
    name: string
    quantity: number
    unit: string
    calories?: number | null
    protein?: number | null
    carbs?: number | null
    fats?: number | null
  }>
}

interface MealListProps {
  meals: Meal[]
}

const mealTypeColors = {
  BREAKFAST: "bg-yellow-100 text-yellow-800",
  LUNCH: "bg-blue-100 text-blue-800",
  DINNER: "bg-purple-100 text-purple-800",
  SNACK: "bg-green-100 text-green-800",
}

export default function MealList({ meals }: MealListProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (mealId: string) => {
    if (!confirm("Are you sure you want to delete this meal?")) return

    setDeletingId(mealId)

    try {
      const result = await deleteMeal(mealId)

      if (result.success) {
        router.refresh()
      } else {
        alert(result.error || "Failed to delete meal")
      }
    } catch (_error) {
      alert("An error occurred")
    } finally {
      setDeletingId(null)
    }
  }

  if (meals.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-gray-500 text-lg">No meals logged yet</p>
        <p className="text-gray-400 mt-2">Start tracking your nutrition today</p>
      </div>
    )
  }

  const totalCalories = meals.reduce(
    (sum, meal) => sum + meal.foodItems.reduce((s, item) => s + (item.calories || 0), 0),
    0
  )
  const totalProtein = meals.reduce(
    (sum, meal) => sum + meal.foodItems.reduce((s, item) => s + (item.protein || 0), 0),
    0
  )
  const totalCarbs = meals.reduce(
    (sum, meal) => sum + meal.foodItems.reduce((s, item) => s + (item.carbs || 0), 0),
    0
  )
  const totalFats = meals.reduce(
    (sum, meal) => sum + meal.foodItems.reduce((s, item) => s + (item.fats || 0), 0),
    0
  )

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm text-orange-600">Total Calories</p>
          <p className="text-2xl font-bold text-orange-700">{totalCalories.toFixed(0)} kcal</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">Protein</p>
          <p className="text-2xl font-bold text-red-700">{totalProtein.toFixed(1)}g</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-600">Carbs</p>
          <p className="text-2xl font-bold text-blue-700">{totalCarbs.toFixed(1)}g</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-600">Fats</p>
          <p className="text-2xl font-bold text-yellow-700">{totalFats.toFixed(1)}g</p>
        </div>
      </div>

      <div className="space-y-3">
        {meals.map((meal) => {
          const mealCalories = meal.foodItems.reduce((sum, item) => sum + (item.calories || 0), 0)
          const mealProtein = meal.foodItems.reduce((sum, item) => sum + (item.protein || 0), 0)
          const mealCarbs = meal.foodItems.reduce((sum, item) => sum + (item.carbs || 0), 0)
          const mealFats = meal.foodItems.reduce((sum, item) => sum + (item.fats || 0), 0)

          return (
            <div key={meal.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900">{meal.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${mealTypeColors[meal.mealType as keyof typeof mealTypeColors]}`}>
                      {meal.mealType}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mt-1">
                    {new Date(meal.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  {meal.notes && <p className="text-gray-600 text-sm mt-2">{meal.notes}</p>}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => router.push(`/dashboard/nutrition/${meal.id}/edit`)}
                    className="p-2 text-orange-600 hover:bg-orange-50 rounded-md transition"
                    title="Edit meal"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(meal.id)}
                    disabled={deletingId === meal.id}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md transition disabled:opacity-50"
                    title="Delete meal"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="border-t pt-3">
                <div className="grid grid-cols-4 gap-4 mb-3">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Calories</p>
                    <p className="text-sm font-semibold text-orange-600">{mealCalories} kcal</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Protein</p>
                    <p className="text-sm font-semibold text-red-600">{mealProtein.toFixed(1)}g</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Carbs</p>
                    <p className="text-sm font-semibold text-blue-600">{mealCarbs.toFixed(1)}g</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Fats</p>
                    <p className="text-sm font-semibold text-yellow-600">{mealFats.toFixed(1)}g</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-500 mb-1">Food items:</p>
                  {meal.foodItems.map((item) => (
                    <div key={item.id} className="text-sm text-gray-700">
                      • {item.name} - {item.quantity}{item.unit}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
