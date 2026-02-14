"use client"

import { useEffect, useRef } from "react"
import { UseFormReturn, FieldArrayWithId } from "react-hook-form"
import {
  ChevronUpIcon,
  ChevronDownIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  ChevronRightIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline"

interface MealFormData {
  name: string
  mealType: "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK"
  date: string
  notes?: string
  foodItems: Array<{
    name: string
    quantity: number
    unit: string
    calories?: number | null
    protein?: number | null
    carbs?: number | null
    fats?: number | null
  }>
}

interface CollapsibleFoodCardProps {
  index: number
  totalCount: number
  form: UseFormReturn<MealFormData>
  field: FieldArrayWithId<MealFormData, "foodItems", "id">
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDuplicate: () => void
  isFirst: boolean
  isLast: boolean
  isOpen: boolean
  onToggle: () => void
}

export default function CollapsibleFoodCard({
  index,
  totalCount,
  form,
  field,
  onRemove,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  isFirst,
  isLast,
  isOpen,
  onToggle,
}: CollapsibleFoodCardProps) {
  const bodyRef = useRef<HTMLDivElement>(null)

  const foodName = form.watch(`foodItems.${index}.name`)
  const calories = form.watch(`foodItems.${index}.calories`)
  const protein = form.watch(`foodItems.${index}.protein`)
  const carbs = form.watch(`foodItems.${index}.carbs`)
  const fats = form.watch(`foodItems.${index}.fats`)

  // Check if this food item has validation errors
  const foodErrors = form.formState.errors.foodItems?.[index]
  const hasErrors = !!foodErrors

  // Auto-expand if there are errors and card is closed
  useEffect(() => {
    if (hasErrors && !isOpen) {
      onToggle()
    }
  }, [hasErrors]) // eslint-disable-line react-hooks/exhaustive-deps

  const getSummaryText = () => {
    const parts: string[] = []
    if (calories) parts.push(`${calories} cal`)
    if (protein) parts.push(`${protein}g prot`)
    if (carbs) parts.push(`${carbs}g carbs`)
    if (fats) parts.push(`${fats}g grasas`)
    return parts.length > 0 ? parts.join(" · ") : "Sin macros"
  }

  return (
    <div
      className={`border rounded-md overflow-hidden transition-colors ${
        hasErrors && !isOpen
          ? "border-red-400 dark:border-red-600"
          : "border-gray-200 dark:border-gray-700"
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between px-4 py-3 cursor-pointer select-none transition-colors ${
          hasErrors && !isOpen
            ? "bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30"
            : "bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
        onClick={onToggle}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <ChevronRightIcon
            className={`h-4 w-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${
              isOpen ? "rotate-90" : ""
            }`}
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
            <span className="font-bold text-orange-600 dark:text-orange-400">
              {foodName || `Alimento #${index + 1}`}
            </span>
            {!isOpen && (
              <span className="ml-2 text-gray-500 dark:text-gray-400 font-normal">
                {getSummaryText()}
              </span>
            )}
          </span>
          {hasErrors && !isOpen && (
            <ExclamationCircleIcon className="h-4 w-4 text-red-500 flex-shrink-0" />
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 ml-2" onClick={(e) => e.stopPropagation()}>
          {!isFirst && (
            <button
              type="button"
              onClick={onMoveUp}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              title="Mover arriba"
            >
              <ChevronUpIcon className="h-4 w-4" />
            </button>
          )}
          {!isLast && (
            <button
              type="button"
              onClick={onMoveDown}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              title="Mover abajo"
            >
              <ChevronDownIcon className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onDuplicate}
            className="p-1 text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded"
            title="Duplicar"
          >
            <DocumentDuplicateIcon className="h-4 w-4" />
          </button>
          {totalCount > 1 && (
            <button
              type="button"
              onClick={onRemove}
              className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
              title="Eliminar"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Body - animated expandable */}
      <div
        ref={bodyRef}
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-4 space-y-3 bg-white dark:bg-gray-800">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Nombre *</label>
              <input
                type="text"
                {...form.register(`foodItems.${index}.name`)}
                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm focus:ring-2 focus:ring-orange-500"
                placeholder="Nombre del alimento"
              />
              {form.formState.errors.foodItems?.[index]?.name && (
                <p className="mt-1 text-xs text-red-600">
                  {form.formState.errors.foodItems[index]?.name?.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Cantidad *</label>
              <input
                type="number"
                {...form.register(`foodItems.${index}.quantity`, { valueAsNumber: true })}
                min="0"
                step="0.1"
                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm focus:ring-2 focus:ring-orange-500"
                placeholder="100"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Unidad *</label>
              <input
                type="text"
                {...form.register(`foodItems.${index}.unit`)}
                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm focus:ring-2 focus:ring-orange-500"
                placeholder="g, ml, oz"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Cal</label>
              <input
                type="number"
                {...form.register(`foodItems.${index}.calories`, {
                  valueAsNumber: true,
                  setValueAs: (v: string) => v === '' ? null : Number(v)
                })}
                min="0"
                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm focus:ring-2 focus:ring-orange-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Prot (g)</label>
              <input
                type="number"
                {...form.register(`foodItems.${index}.protein`, {
                  valueAsNumber: true,
                  setValueAs: (v: string) => v === '' ? null : Number(v)
                })}
                min="0"
                step="0.1"
                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm focus:ring-2 focus:ring-orange-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Carbs (g)</label>
              <input
                type="number"
                {...form.register(`foodItems.${index}.carbs`, {
                  valueAsNumber: true,
                  setValueAs: (v: string) => v === '' ? null : Number(v)
                })}
                min="0"
                step="0.1"
                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm focus:ring-2 focus:ring-orange-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Grasas (g)</label>
              <input
                type="number"
                {...form.register(`foodItems.${index}.fats`, {
                  valueAsNumber: true,
                  setValueAs: (v: string) => v === '' ? null : Number(v)
                })}
                min="0"
                step="0.1"
                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm focus:ring-2 focus:ring-orange-500"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
