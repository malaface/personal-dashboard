"use client"

import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createMeal, updateMeal } from "@/app/dashboard/nutrition/actions"
import { PlusIcon } from "@heroicons/react/24/outline"
import CollapsibleFoodCard from "@/components/nutrition/CollapsibleFoodCard"
import QuickMealBar from "@/components/nutrition/QuickMealBar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

// Zod Schemas
const foodItemSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  quantity: z.number().positive("Cantidad requerida"),
  unit: z.string().min(1, "Unidad requerida"),
  calories: z.number().min(0).nullable().optional(),
  protein: z.number().min(0).nullable().optional(),
  carbs: z.number().min(0).nullable().optional(),
  fats: z.number().min(0).nullable().optional(),
})

const mealFormSchema = z.object({
  name: z.string().min(2, "Nombre debe tener al menos 2 caracteres").max(100),
  mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha invalido"),
  notes: z.string().max(300).optional(),
  foodItems: z.array(foodItemSchema).min(1, "Agrega al menos un alimento"),
})

type MealFormData = z.infer<typeof mealFormSchema>

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

const emptyFoodItem = {
  name: "",
  quantity: 0,
  unit: "g",
  calories: null,
  protein: null,
  carbs: null,
  fats: null,
}

export default function MealForm({ meal }: MealFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const isEditing = !!meal

  // Track which food card is open (-1 = all collapsed)
  const [openFoodIndex, setOpenFoodIndex] = useState<number>(isEditing ? -1 : 0)

  const form = useForm<MealFormData>({
    resolver: zodResolver(mealFormSchema),
    defaultValues: {
      name: meal?.name || "",
      mealType: (meal?.mealType as MealFormData["mealType"]) || "BREAKFAST",
      date: meal?.date
        ? new Date(meal.date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      notes: meal?.notes || "",
      foodItems: meal?.foodItems.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        calories: item.calories ?? null,
        protein: item.protein ?? null,
        carbs: item.carbs ?? null,
        fats: item.fats ?? null,
      })) || [{ ...emptyFoodItem }],
    },
  })

  const { fields, append, remove, swap, insert } = useFieldArray({
    control: form.control,
    name: "foodItems",
  })

  const addFoodItem = () => {
    append({ ...emptyFoodItem })
    // Auto-open the new item and collapse others
    setOpenFoodIndex(fields.length)
  }

  const handleToggleFood = (index: number) => {
    setOpenFoodIndex(prev => prev === index ? -1 : index)
  }

  const moveUp = (index: number) => {
    if (index > 0) {
      swap(index, index - 1)
      if (openFoodIndex === index) setOpenFoodIndex(index - 1)
      else if (openFoodIndex === index - 1) setOpenFoodIndex(index)
    }
  }

  const moveDown = (index: number) => {
    if (index < fields.length - 1) {
      swap(index, index + 1)
      if (openFoodIndex === index) setOpenFoodIndex(index + 1)
      else if (openFoodIndex === index + 1) setOpenFoodIndex(index)
    }
  }

  const duplicateFoodItem = (index: number) => {
    const current = form.getValues(`foodItems.${index}`)
    insert(index + 1, { ...current })
    setOpenFoodIndex(index + 1)
  }

  const handleRemoveFood = (index: number) => {
    remove(index)
    if (openFoodIndex === index) {
      setOpenFoodIndex(-1)
    } else if (openFoodIndex > index) {
      setOpenFoodIndex(openFoodIndex - 1)
    }
  }

  const handleQuickLoad = (recentMeal: {
    name: string
    mealType: string
    foodItems: Array<{
      name: string
      quantity: number
      unit: string
      calories: number | null
      protein: number | null
      carbs: number | null
      fats: number | null
    }>
  }) => {
    form.setValue("name", recentMeal.name)
    form.setValue("mealType", recentMeal.mealType as MealFormData["mealType"])
    // Remove all current items and replace
    while (fields.length > 0) {
      remove(0)
    }
    for (const item of recentMeal.foodItems) {
      append({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fats: item.fats,
      })
    }
    // Collapse all after quick load for overview
    setOpenFoodIndex(-1)
  }

  const onSubmit = async (data: MealFormData) => {
    setLoading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("name", data.name)
      formData.append("mealType", data.mealType)
      formData.append("date", data.date)
      if (data.notes) formData.append("notes", data.notes)
      formData.append("foodItems", JSON.stringify(data.foodItems))

      const result = meal
        ? await updateMeal(meal.id, formData)
        : await createMeal(formData)

      if (result.success) {
        router.push("/dashboard/nutrition")
        router.refresh()
      } else {
        setError(result.error || "Algo salio mal")
      }
    } catch (err: any) {
      setError(err.message || "Error al guardar la comida")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Meal Details */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Detalles de la Comida</h3>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>Nombre *</Label>
            <Input
              type="text"
              {...form.register("name")}
              placeholder="Ej., Batido de desayuno"
              className="mt-1"
            />
            {form.formState.errors.name && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <Label>Tipo *</Label>
            <Select
              value={form.watch("mealType")}
              onValueChange={(v) => form.setValue("mealType", v as MealFormData["mealType"])}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BREAKFAST">Desayuno</SelectItem>
                <SelectItem value="LUNCH">Almuerzo</SelectItem>
                <SelectItem value="DINNER">Cena</SelectItem>
                <SelectItem value="SNACK">Merienda</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Fecha *</Label>
            <Input
              type="date"
              {...form.register("date")}
              className="mt-1"
            />
            {form.formState.errors.date && (
              <p className="mt-1 text-sm text-red-600">{form.formState.errors.date.message}</p>
            )}
          </div>
        </div>

        <div>
          <Label>Notas</Label>
          <Textarea
            {...form.register("notes")}
            rows={2}
            maxLength={300}
            placeholder="Notas opcionales..."
            className="mt-1"
          />
        </div>
      </div>

      {/* Food Items */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Alimentos *</h3>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={addFoodItem}
            className="rounded-full bg-orange-50 dark:bg-orange-900 text-orange-700 dark:text-orange-300 hover:bg-orange-100 dark:hover:bg-orange-800"
            title="Agregar alimento"
          >
            <PlusIcon className="h-5 w-5" />
          </Button>
        </div>

        {/* Quick Meal Bar */}
        {!isEditing && <QuickMealBar onQuickLoad={handleQuickLoad} />}

        {form.formState.errors.foodItems && typeof form.formState.errors.foodItems === 'object' && 'message' in form.formState.errors.foodItems && (
          <p className="text-sm text-red-600">{form.formState.errors.foodItems.message as string}</p>
        )}

        {fields.map((field, index) => (
          <CollapsibleFoodCard
            key={field.id}
            index={index}
            totalCount={fields.length}
            form={form}
            field={field}
            onRemove={() => handleRemoveFood(index)}
            onMoveUp={() => moveUp(index)}
            onMoveDown={() => moveDown(index)}
            onDuplicate={() => duplicateFoodItem(index)}
            isFirst={index === 0}
            isLast={index === fields.length - 1}
            isOpen={openFoodIndex === index}
            onToggle={() => handleToggleFood(index)}
          />
        ))}
      </div>

      {/* Submit */}
      <div className="flex justify-end space-x-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : meal ? "Actualizar Comida" : "Crear Comida"}
        </Button>
      </div>

      {/* Floating Action Button */}
      <button
        type="button"
        onClick={addFoodItem}
        className="
          fixed bottom-20 right-6 sm:bottom-10 sm:right-10
          z-50 flex h-14 w-14 sm:h-16 sm:w-16
          items-center justify-center
          rounded-full bg-orange-600 text-white
          shadow-[0_8px_30px_rgb(0,0,0,0.12)]
          transition-all
          hover:bg-orange-700 hover:scale-110
          active:scale-95
          focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
        "
        title="Agregar nuevo alimento"
      >
        <PlusIcon className="h-8 w-8 sm:h-9 sm:w-9 stroke-[2.5]" />
      </button>
    </form>
  )
}
