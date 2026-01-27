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

  const updateFoodItem = (index: number, field: string, value: any) => {
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
        setError(result.error || "Algo salió mal")
      }
    } catch (err: any) {
      setError(err.message || "Error al guardar la comida")
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

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Detalles de la Comida</h3>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre de la Comida *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Ej., Batido de desayuno"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo de Comida *
            </label>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="BREAKFAST">Desayuno</option>
              <option value="LUNCH">Almuerzo</option>
              <option value="DINNER">Cena</option>
              <option value="SNACK">Merienda</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notas
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            maxLength={300}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            placeholder="Notas opcionales..."
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Alimentos</h3>
          <button
            type="button"
            onClick={addFoodItem}
            className="flex items-center space-x-1 text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Agregar Alimento</span>
          </button>
        </div>

        <div className="space-y-4">
          {foodItems.map((item, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Alimento #{index + 1}</span>
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
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Nombre del alimento *"
                />
                <input
                  type="number"
                  value={item.quantity || ""}
                  onChange={(e) => updateFoodItem(index, "quantity", parseFloat(e.target.value) || 0)}
                  required
                  min="0"
                  step="0.1"
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Cantidad *"
                />
                <input
                  type="text"
                  value={item.unit}
                  onChange={(e) => updateFoodItem(index, "unit", e.target.value)}
                  required
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Unidad (g, ml) *"
                />
              </div>

              <div className="grid grid-cols-4 gap-3">
                <input
                  type="number"
                  value={item.calories || ""}
                  onChange={(e) => updateFoodItem(index, "calories", parseInt(e.target.value) || 0)}
                  min="0"
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Cal"
                />
                <input
                  type="number"
                  value={item.protein || ""}
                  onChange={(e) => updateFoodItem(index, "protein", parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.1"
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Proteína (g)"
                />
                <input
                  type="number"
                  value={item.carbs || ""}
                  onChange={(e) => updateFoodItem(index, "carbs", parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.1"
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Carbohidratos (g)"
                />
                <input
                  type="number"
                  value={item.fats || ""}
                  onChange={(e) => updateFoodItem(index, "fats", parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.1"
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="Grasas (g)"
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
          {loading ? "Guardando..." : meal ? "Actualizar Comida" : "Crear Comida"}
        </button>
      </div>
    </form>
  )
}
