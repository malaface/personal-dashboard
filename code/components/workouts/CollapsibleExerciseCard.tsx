"use client"

import { useEffect, useRef } from "react"
import { Controller, UseFormReturn, FieldArrayWithId } from "react-hook-form"
import {
  ChevronUpIcon,
  ChevronDownIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  ChevronRightIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline"
import SmartCombobox from "@/components/catalog/SmartCombobox"
import ExerciseHistory from "@/components/workouts/ExerciseHistory"

interface WorkoutFormData {
  name: string
  date: string
  duration?: number
  notes?: string
  exercises: Array<{
    exerciseTypeId: string
    muscleGroupId?: string | null
    equipmentId?: string | null
    sets: number
    reps: number
    weight?: number | null
    weightUnit: "kg" | "lbs"
    notes?: string | null
  }>
}

interface CollapsibleExerciseCardProps {
  index: number
  totalCount: number
  form: UseFormReturn<WorkoutFormData>
  field: FieldArrayWithId<WorkoutFormData, "exercises", "id">
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDuplicate: () => void
  isFirst: boolean
  isLast: boolean
  isOpen: boolean
  onToggle: () => void
}

export default function CollapsibleExerciseCard({
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
}: CollapsibleExerciseCardProps) {
  const bodyRef = useRef<HTMLDivElement>(null)

  const exerciseTypeId = form.watch(`exercises.${index}.exerciseTypeId`)
  const sets = form.watch(`exercises.${index}.sets`)
  const reps = form.watch(`exercises.${index}.reps`)
  const weight = form.watch(`exercises.${index}.weight`)
  const weightUnit = form.watch(`exercises.${index}.weightUnit`) || "kg"

  // Check if this exercise has validation errors
  const exerciseErrors = form.formState.errors.exercises?.[index]
  const hasErrors = !!exerciseErrors

  // Auto-expand if there are errors and card is closed
  useEffect(() => {
    if (hasErrors && !isOpen) {
      onToggle()
    }
  }, [hasErrors]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleAutoFill = (data: {
    muscleGroupId: string | null
    equipmentId: string | null
    sets: number
    reps: number
    weight: number | null
  }) => {
    const currentMuscleGroupId = form.getValues(`exercises.${index}.muscleGroupId`)
    const currentEquipmentId = form.getValues(`exercises.${index}.equipmentId`)

    if (!currentMuscleGroupId && data.muscleGroupId) {
      form.setValue(`exercises.${index}.muscleGroupId`, data.muscleGroupId)
    }
    if (!currentEquipmentId && data.equipmentId) {
      form.setValue(`exercises.${index}.equipmentId`, data.equipmentId)
    }
  }

  const getSummaryText = () => {
    const weightText = weight ? `${weight}${weightUnit}` : "Sin peso"
    return `${sets || 0}x${reps || 0} @ ${weightText}`
  }

  return (
    <div
      className={`border rounded-md overflow-hidden transition-colors ${
        hasErrors && !isOpen
          ? "border-red-400 dark:border-red-600"
          : "border-gray-200 dark:border-gray-700"
      }`}
    >
      {/* Header - always visible */}
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
            <span className="font-bold text-blue-600 dark:text-blue-400">#{index + 1}</span>
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
            className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded"
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
          isOpen ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="p-4 space-y-3 bg-white dark:bg-gray-800">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              Tipo de Ejercicio *
            </label>
            <Controller
              name={`exercises.${index}.exerciseTypeId`}
              control={form.control}
              render={({ field: controllerField }) => (
                <SmartCombobox
                  catalogType="exercise_category"
                  value={controllerField.value}
                  onChange={controllerField.onChange}
                  placeholder="Seleccionar ejercicio (Press de banca, Sentadilla, etc.)"
                  required
                  error={form.formState.errors.exercises?.[index]?.exerciseTypeId?.message}
                />
              )}
            />
            <ExerciseHistory
              exerciseTypeId={exerciseTypeId || null}
              currentSets={sets || 0}
              currentReps={reps || 0}
              currentWeight={weight ?? null}
              onUseLastValues={(s, r, w) => {
                form.setValue(`exercises.${index}.sets`, s)
                form.setValue(`exercises.${index}.reps`, r)
                form.setValue(`exercises.${index}.weight`, w)
              }}
              onLastPerformanceLoaded={handleAutoFill}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                Grupo Muscular (Opcional)
              </label>
              <Controller
                name={`exercises.${index}.muscleGroupId`}
                control={form.control}
                render={({ field: controllerField }) => (
                  <SmartCombobox
                    catalogType="muscle_group"
                    value={controllerField.value || ""}
                    onChange={(value) => controllerField.onChange(value || null)}
                    placeholder="Seleccionar grupo muscular"
                    error={form.formState.errors.exercises?.[index]?.muscleGroupId?.message}
                  />
                )}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                Equipo (Opcional)
              </label>
              <Controller
                name={`exercises.${index}.equipmentId`}
                control={form.control}
                render={({ field: controllerField }) => (
                  <SmartCombobox
                    catalogType="equipment_type"
                    value={controllerField.value || ""}
                    onChange={(value) => controllerField.onChange(value || null)}
                    placeholder="Seleccionar equipo"
                    error={form.formState.errors.exercises?.[index]?.equipmentId?.message}
                  />
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Series *</label>
              <input
                type="number"
                {...form.register(`exercises.${index}.sets`, { valueAsNumber: true })}
                min="1"
                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm"
              />
              {form.formState.errors.exercises?.[index]?.sets && (
                <p className="mt-1 text-xs text-red-600">
                  {form.formState.errors.exercises[index]?.sets?.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Repeticiones *</label>
              <input
                type="number"
                {...form.register(`exercises.${index}.reps`, { valueAsNumber: true })}
                min="1"
                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm"
              />
              {form.formState.errors.exercises?.[index]?.reps && (
                <p className="mt-1 text-xs text-red-600">
                  {form.formState.errors.exercises[index]?.reps?.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">Peso</label>
              <div className="flex gap-1">
                <input
                  type="number"
                  {...form.register(`exercises.${index}.weight`, {
                    valueAsNumber: true,
                    setValueAs: (v) => v === '' ? null : Number(v)
                  })}
                  min="0"
                  step="0.5"
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm"
                />
                <select
                  {...form.register(`exercises.${index}.weightUnit`)}
                  className="px-1 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm w-16"
                >
                  <option value="kg">kg</option>
                  <option value="lbs">lbs</option>
                </select>
              </div>
              {form.formState.errors.exercises?.[index]?.weight && (
                <p className="mt-1 text-xs text-red-600">
                  {form.formState.errors.exercises[index]?.weight?.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
