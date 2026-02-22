"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createMeal, updateMeal } from "@/app/dashboard/nutrition/actions"
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline"

interface MealFormProps {
  meal?: {
    id: string
    name: string
    mealType: string
    date: Date
    notes?: string | null
    foodItems: Array<{
      id?: string
      name: string
      quantity: number
      unit: string
      calories?: number | null
      protein?: number | null
      carbs?: number | null
      fats?: number | null
    }>
  }
}

export default function MealForm({ meal }: MealFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [name, setName] = useState(meal?.name || "")
  const [mealType, setMealType] = useState(meal?.mealType || "BREAKFAST")
  const [date, setDate] = useState(
    meal?.date ? new Date(meal.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  )
  const [notes, setNotes] = useState(meal?.notes || "")
  const [foodItems, setFoodItems] = useState(
    meal?.foodItems || [{ name: "", quantity: 0, unit: "g", calories: 0, protein: 0, carbs: 0, fats: 0 }]
  )

  const addFoodItem = () => {
    setFoodItems([...foodItems, { name: "", quantity: 0, unit: "g", calories: 0, protein: 0, carbs: 0, fats: 0 }])
  }

  const removeFoodItem = (index: number) => {
    if (foodItems.length > 1) {
      setFoodItems(foodItems.filter((_, i) => i !== index))
    }
  }

  const updateFoodItem = (index: number, field: string, value: string | number) => {
    const updated = [...foodItems]
    updated[index] = { ...updated[index], [field]: value }
    setFoodItems(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("mealType", mealType)
      formData.append("date", date)
      if (notes) formData.append("notes", notes)
      formData.append("foodItems", JSON.stringify(foodItems))

      const result = meal
        ? await updateMeal(meal.id, formData)
        : await createMeal(formData)

      if (result.success) {
        router.push("/dashboard/nutrition")
        router.refresh()
      } else {
        setError(result.error || "Something went wrong")
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save meal")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold">Meal Details</h3>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meal Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="E.g., Breakfast smoothie"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Meal Type *
            </label>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="BREAKFAST">Breakfast</option>
              <option value="LUNCH">Lunch</option>
              <option value="DINNER">Dinner</option>
              <option value="SNACK">Snack</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            maxLength={300}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Optional notes..."
          />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Food Items</h3>
          <button
            type="button"
            onClick={addFoodItem}
            className="flex items-center space-x-1 text-orange-600 hover:text-orange-700"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add Food</span>
          </button>
        </div>

        <div className="space-y-4">
          {foodItems.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-500">Food #{index + 1}</span>
                {foodItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeFoodItem(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateFoodItem(index, "name", e.target.value)}
                  required
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Food name *"
                />
                <input
                  type="number"
                  value={item.quantity || ""}
                  onChange={(e) => updateFoodItem(index, "quantity", parseFloat(e.target.value) || 0)}
                  required
                  min="0"
                  step="0.1"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Quantity *"
                />
                <input
                  type="text"
                  value={item.unit}
                  onChange={(e) => updateFoodItem(index, "unit", e.target.value)}
                  required
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Unit (g, ml) *"
                />
              </div>

              <div className="grid grid-cols-4 gap-3">
                <input
                  type="number"
                  value={item.calories || ""}
                  onChange={(e) => updateFoodItem(index, "calories", parseInt(e.target.value) || 0)}
                  min="0"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Cal"
                />
                <input
                  type="number"
                  value={item.protein || ""}
                  onChange={(e) => updateFoodItem(index, "protein", parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.1"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Protein (g)"
                />
                <input
                  type="number"
                  value={item.carbs || ""}
                  onChange={(e) => updateFoodItem(index, "carbs", parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.1"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Carbs (g)"
                />
                <input
                  type="number"
                  value={item.fats || ""}
                  onChange={(e) => updateFoodItem(index, "fats", parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.1"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Fats (g)"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : meal ? "Update Meal" : "Create Meal"}
        </button>
      </div>
    </form>
  )
}
