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
import SmartCombobox from "@/components/catalog/SmartCombobox"
import ExerciseHistory from "@/components/workouts/ExerciseHistory"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"
// IMPORTANTE: Importamos los componentes del Form de shadcn
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

interface SetDetail {
  setNumber: number
  reps: number
  weight?: number | null
  completed: boolean
}

// Aseguramos que el tipo coincida con tu Zod Schema
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
    setDetails?: SetDetail[]
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
  const setDetails = form.watch(`exercises.${index}.setDetails`) || []

  // Sync setDetails array when sets count changes
  useEffect(() => {
    if (!sets || sets < 1) return
    const current = form.getValues(`exercises.${index}.setDetails`) || []
    if (current.length === sets) return

    const newDetails: SetDetail[] = Array.from({ length: sets }, (_, i) => ({
      setNumber: i + 1,
      reps: current[i]?.reps ?? reps ?? 10,
      weight: current[i]?.weight ?? weight ?? null,
      completed: current[i]?.completed ?? true,
    }))
    form.setValue(`exercises.${index}.setDetails`, newDetails)
  }, [sets]) // eslint-disable-line react-hooks/exhaustive-deps

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

    // Auto-fill sets/reps/weight if user hasn't modified defaults
    const currentSets = form.getValues(`exercises.${index}.sets`)
    const currentReps = form.getValues(`exercises.${index}.reps`)
    const currentWeight = form.getValues(`exercises.${index}.weight`)

    const isDefaults = currentSets === 3 && currentReps === 10 && (currentWeight === null || currentWeight === undefined)
    if (isDefaults && data.sets && data.reps) {
      form.setValue(`exercises.${index}.sets`, data.sets)
      form.setValue(`exercises.${index}.reps`, data.reps)
      form.setValue(`exercises.${index}.weight`, data.weight)
      form.setValue(`exercises.${index}.setDetails`,
        Array.from({ length: data.sets }, (_, i) => ({
          setNumber: i + 1,
          reps: data.reps,
          weight: data.weight,
          completed: true,
        }))
      )
    }
  }

  const getSummaryText = () => {
    const weightText = weight ? `${weight}${weightUnit}` : "Sin peso"
    return `${sets || 0}x${reps || 0} @ ${weightText}`
  }

  return (
    <div
      className={`border rounded-md transition-colors ${
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
            <Button type="button" variant="ghost" size="icon" onClick={onMoveUp} title="Mover arriba" className="h-6 w-6">
              <ChevronUpIcon className="h-4 w-4" />
            </Button>
          )}
          {!isLast && (
            <Button type="button" variant="ghost" size="icon" onClick={onMoveDown} title="Mover abajo" className="h-6 w-6">
              <ChevronDownIcon className="h-4 w-4" />
            </Button>
          )}
          <Button type="button" variant="ghost" size="icon" onClick={onDuplicate} title="Duplicar" className="h-6 w-6 hover:text-blue-600 dark:hover:text-blue-400">
            <DocumentDuplicateIcon className="h-4 w-4" />
          </Button>
          {totalCount > 1 && (
            <Button type="button" variant="ghost" size="icon" onClick={onRemove} title="Eliminar" className="h-6 w-6 hover:text-red-600 dark:hover:text-red-400">
              <TrashIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Body */}
      <div
        ref={bodyRef}
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
        <div className="p-4 space-y-3 bg-white dark:bg-gray-800">
          
          <div>
            {/* CORRECCIÓN PRINCIPAL: Usamos FormField aquí */}
            <FormField
              control={form.control}
              name={`exercises.${index}.exerciseTypeId`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-gray-600 dark:text-gray-400">Tipo de Ejercicio *</FormLabel>
                  <FormControl>
                    <SmartCombobox
                      catalogType="exercise_category"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Seleccionar ejercicio (Press de banca, Sentadilla, etc.)"
                      required
                    />
                  </FormControl>
                  <FormMessage /> {/* Esto muestra el error automáticamente */}
                </FormItem>
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
                form.setValue(`exercises.${index}.setDetails`,
                  Array.from({ length: s }, (_, i) => ({
                    setNumber: i + 1,
                    reps: r,
                    weight: w,
                    completed: true,
                  }))
                )
              }}
              onLastPerformanceLoaded={handleAutoFill}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              {/* Opcional: También aplicamos FormField para consistencia */}
              <FormField
                control={form.control}
                name={`exercises.${index}.muscleGroupId`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-gray-600 dark:text-gray-400">Grupo Muscular (Opcional)</FormLabel>
                    <FormControl>
                      <SmartCombobox
                        catalogType="muscle_group"
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Seleccionar grupo"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <FormField
                control={form.control}
                name={`exercises.${index}.equipmentId`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-gray-600 dark:text-gray-400">Equipo (Opcional)</FormLabel>
                    <FormControl>
                      <SmartCombobox
                        catalogType="equipment_type"
                        value={field.value || ""}
                        onChange={field.onChange}
                        placeholder="Seleccionar equipo"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div className="w-20">
              <Label className="text-xs text-gray-600 dark:text-gray-400">Series *</Label>
              <Select
                value={String(sets || "")}
                onValueChange={(v) => form.setValue(`exercises.${index}.sets`, Number(v))}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="-" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.exercises?.[index]?.sets && (
                <p className="mt-1 text-xs text-red-600">
                  {form.formState.errors.exercises[index]?.sets?.message}
                </p>
              )}
            </div>
            <div className="w-20">
              <Label className="text-xs text-gray-600 dark:text-gray-400">Reps *</Label>
              <Select
                value={String(reps || "")}
                onValueChange={(v) => form.setValue(`exercises.${index}.reps`, Number(v))}
              >
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="-" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 30 }, (_, i) => i + 1).map((n) => (
                    <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.exercises?.[index]?.reps && (
                <p className="mt-1 text-xs text-red-600">
                  {form.formState.errors.exercises[index]?.reps?.message}
                </p>
              )}
            </div>
            <div className="max-w-[200px]">
              <Label className="text-xs text-gray-600 dark:text-gray-400">Peso</Label>
              <div className="flex gap-1">
                <Input
                  type="number"
                  {...form.register(`exercises.${index}.weight`, {
                    setValueAs: (v) => v === '' ? null : Number(v)
                  })}
                  min="0"
                  step="0.5"
                  className="flex-1 min-w-0 h-8 text-sm"
                />
                <Select
                  value={weightUnit}
                  onValueChange={(v) => form.setValue(`exercises.${index}.weightUnit`, v as "kg" | "lbs")}
                >
                  <SelectTrigger className="h-8 text-sm w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="lbs">lbs</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.formState.errors.exercises?.[index]?.weight && (
                <p className="mt-1 text-xs text-red-600">
                  {form.formState.errors.exercises[index]?.weight?.message}
                </p>
              )}
            </div>
          </div>

          {/* Per-set detail rows */}
          {sets > 0 && setDetails.length > 0 && (
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-600 dark:text-gray-400">Detalle por serie</Label>
              <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-x-2 gap-y-1 items-center text-xs text-gray-500 dark:text-gray-400">
                <span></span>
                <span className="text-center">Reps</span>
                <span className="text-center">Peso ({weightUnit})</span>
                <span></span>
              </div>
              {setDetails.map((detail, setIdx) => (
                <div
                  key={setIdx}
                  className="grid grid-cols-[auto_1fr_1fr_auto] gap-x-2 items-center"
                >
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400 w-6 text-center">
                    S{setIdx + 1}
                  </span>
                  <Select
                    value={String(detail.reps)}
                    onValueChange={(v) => {
                      const updated = [...setDetails]
                      updated[setIdx] = { ...updated[setIdx], reps: Number(v) }
                      form.setValue(`exercises.${index}.setDetails`, updated)
                    }}
                  >
                    <SelectTrigger className="h-7 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 30 }, (_, i) => i + 1).map((n) => (
                        <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    value={detail.weight ?? ""}
                    onChange={(e) => {
                      const updated = [...setDetails]
                      updated[setIdx] = {
                        ...updated[setIdx],
                        weight: e.target.value === "" ? null : Number(e.target.value),
                      }
                      form.setValue(`exercises.${index}.setDetails`, updated)
                    }}
                    min="0"
                    step="0.5"
                    placeholder="0"
                    className="h-7 px-1.5 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...setDetails]
                      updated[setIdx] = { ...updated[setIdx], completed: !updated[setIdx].completed }
                      form.setValue(`exercises.${index}.setDetails`, updated)
                    }}
                    className={`w-6 h-6 rounded border text-xs flex items-center justify-center transition-colors ${
                      detail.completed
                        ? "bg-green-100 border-green-400 text-green-700 dark:bg-green-900/30 dark:border-green-600 dark:text-green-400"
                        : "bg-gray-100 border-gray-300 text-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-500"
                    }`}
                    title={detail.completed ? "Completada" : "No completada"}
                  >
                    {detail.completed ? "✓" : "—"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}