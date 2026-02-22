"use client"

import { useState, useEffect } from 'react'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PlusIcon, TrashIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline'
import SmartCombobox from '@/components/catalog/SmartCombobox'

// Zod schemas
const exerciseSchema = z.object({
  exerciseTypeId: z.string().nullable(),
  muscleGroupId: z.string().nullable(),
  equipmentId: z.string().nullable(),
  sets: z.number().int().min(1).max(20),
  reps: z.number().int().min(1).max(100),
  weight: z.number().min(0).nullable(),
  notes: z.string().max(200).nullable(),
  sortOrder: z.number().int().min(0).default(0)
})

const templateSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).nullable(),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED']).nullable(),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  exercises: z.array(exerciseSchema).min(1, "Al menos un ejercicio requerido")
})

type TemplateFormData = z.infer<typeof templateSchema>

interface WorkoutTemplate {
  id: string
  name: string
  description: string | null
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | null
  isPublic: boolean
  tags: string[]
  exercises: Array<{
    exerciseTypeId: string | null
    muscleGroupId: string | null
    equipmentId: string | null
    sets: number
    reps: number
    weight: number | null
    notes: string | null
    sortOrder: number
  }>
  user: { name: string | null } | null
  createdAt: string
  updatedAt: string
}

export default function WorkoutTemplateManager() {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplate | null>(null)
  const [tagInput, setTagInput] = useState('')

  const form = useForm<TemplateFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(templateSchema) as any,
    defaultValues: {
      name: '',
      description: null,
      difficulty: null,
      isPublic: false,
      tags: [],
      exercises: [{
        exerciseTypeId: null,
        muscleGroupId: null,
        equipmentId: null,
        sets: 3,
        reps: 10,
        weight: null,
        notes: null,
        sortOrder: 0
      }]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'exercises'
  })

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/templates/workouts')
      if (!response.ok) throw new Error('Failed to fetch templates')
      const data = await response.json()
      setTemplates(data.templates || [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const openCreateDialog = () => {
    setEditingTemplate(null)
    form.reset({
      name: '',
      description: null,
      difficulty: null,
      isPublic: false,
      tags: [],
      exercises: [{
        exerciseTypeId: null,
        muscleGroupId: null,
        equipmentId: null,
        sets: 3,
        reps: 10,
        weight: null,
        notes: null,
        sortOrder: 0
      }]
    })
    setShowDialog(true)
  }

  const openEditDialog = (template: WorkoutTemplate) => {
    setEditingTemplate(template)
    form.reset({
      name: template.name,
      description: template.description,
      difficulty: template.difficulty,
      isPublic: template.isPublic,
      tags: template.tags,
      exercises: template.exercises.map(ex => ({
        exerciseTypeId: ex.exerciseTypeId,
        muscleGroupId: ex.muscleGroupId,
        equipmentId: ex.equipmentId,
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight,
        notes: ex.notes,
        sortOrder: ex.sortOrder
      }))
    })
    setShowDialog(true)
  }

  const onSubmit = async (data: TemplateFormData) => {
    setLoading(true)
    setError(null)

    try {
      const url = editingTemplate
        ? `/api/templates/workouts/${editingTemplate.id}`
        : '/api/templates/workouts'

      const response = await fetch(url, {
        method: editingTemplate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save template')
      }

      await fetchTemplates()
      setShowDialog(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const deleteTemplate = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este template?')) return

    setLoading(true)
    try {
      const response = await fetch(`/api/templates/workouts/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete template')

      await fetchTemplates()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const addTag = () => {
    if (!tagInput.trim()) return
    const currentTags = form.getValues('tags')
    if (!currentTags.includes(tagInput.trim())) {
      form.setValue('tags', [...currentTags, tagInput.trim()])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    const currentTags = form.getValues('tags')
    form.setValue('tags', currentTags.filter(t => t !== tag))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mis Templates de Workout</h2>
        <button
          onClick={openCreateDialog}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <PlusIcon className="h-5 w-5" />
          Crear Template
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Templates list */}
      {loading && !showDialog ? (
        <div className="text-center py-8 text-gray-500">Cargando templates...</div>
      ) : templates.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No tienes templates aún. ¡Crea tu primer template!
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map(template => (
            <div key={template.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold text-lg">{template.name}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditDialog(template)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => deleteTemplate(template.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {template.description && (
                <p className="text-sm text-gray-600">{template.description}</p>
              )}

              <div className="flex flex-wrap gap-2">
                {template.difficulty && (
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                    {template.difficulty}
                  </span>
                )}
                {template.isPublic && (
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    Público
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-500">
                {template.exercises.length} ejercicio{template.exercises.length !== 1 ? 's' : ''}
              </p>

              {template.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {template.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-0.5 text-xs rounded bg-gray-100 text-gray-700">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 my-8 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {editingTemplate ? 'Editar Template' : 'Crear Template'}
              </h3>
              <button onClick={() => setShowDialog(false)} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre *
                </label>
                <input
                  {...form.register('name')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.name.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  {...form.register('description')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dificultad
                </label>
                <select
                  {...form.register('difficulty')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Sin especificar</option>
                  <option value="BEGINNER">Principiante</option>
                  <option value="INTERMEDIATE">Intermedio</option>
                  <option value="ADVANCED">Avanzado</option>
                </select>
              </div>

              {/* Is Public */}
              <div className="flex items-center">
                <input
                  {...form.register('isPublic')}
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Template público (visible para otros usuarios)
                </label>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Agregar tag..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  >
                    Agregar
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {form.watch('tags').map((tag, idx) => (
                    <span key={idx} className="px-2 py-1 text-sm rounded bg-blue-100 text-blue-800 flex items-center gap-1">
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-blue-900"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Exercises */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Ejercicios *
                  </label>
                  <button
                    type="button"
                    onClick={() => append({
                      exerciseTypeId: null,
                      muscleGroupId: null,
                      equipmentId: null,
                      sets: 3,
                      reps: 10,
                      weight: null,
                      notes: null,
                      sortOrder: fields.length
                    })}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Agregar Ejercicio
                  </button>
                </div>

                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="border border-gray-200 rounded-md p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">Ejercicio {index + 1}</span>
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Controller
                          name={`exercises.${index}.exerciseTypeId`}
                          control={form.control}
                          render={({ field }) => (
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Tipo de Ejercicio
                              </label>
                              <SmartCombobox
                                catalogType="exercise_category"
                                value={field.value || ''}
                                onChange={field.onChange}
                                placeholder="Seleccionar ejercicio"
                              />
                            </div>
                          )}
                        />

                        <Controller
                          name={`exercises.${index}.muscleGroupId`}
                          control={form.control}
                          render={({ field }) => (
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Grupo Muscular
                              </label>
                              <SmartCombobox
                                catalogType="muscle_group"
                                value={field.value || ''}
                                onChange={field.onChange}
                                placeholder="Seleccionar músculo"
                              />
                            </div>
                          )}
                        />

                        <Controller
                          name={`exercises.${index}.equipmentId`}
                          control={form.control}
                          render={({ field }) => (
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Equipo
                              </label>
                              <SmartCombobox
                                catalogType="equipment_type"
                                value={field.value || ''}
                                onChange={field.onChange}
                                placeholder="Seleccionar equipo"
                              />
                            </div>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Sets
                          </label>
                          <input
                            {...form.register(`exercises.${index}.sets`, { valueAsNumber: true })}
                            type="number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Reps
                          </label>
                          <input
                            {...form.register(`exercises.${index}.reps`, { valueAsNumber: true })}
                            type="number"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Peso (kg)
                          </label>
                          <input
                            {...form.register(`exercises.${index}.weight`, { valueAsNumber: true })}
                            type="number"
                            step="0.5"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Notas
                        </label>
                        <input
                          {...form.register(`exercises.${index}.notes`)}
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowDialog(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : editingTemplate ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
