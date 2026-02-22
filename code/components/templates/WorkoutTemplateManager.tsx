"use client"

import { useState, useEffect } from 'react'
import { useForm, Controller, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PlusIcon, TrashIcon, PencilIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
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
  const [loading, setLoading] = useState(true)
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

      const result = await response.json()
      if (editingTemplate) {
        setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? result.template : t))
      } else {
        setTemplates(prev => [result.template, ...prev])
      }
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

      setTemplates(prev => prev.filter(t => t.id !== id))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
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
        <h2 className="text-2xl font-bold">Mis Templates de Entrenamiento</h2>
        <Button onClick={openCreateDialog}>
          <PlusIcon className="h-5 w-5" />
          Crear Template
        </Button>
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
                  <Button type="button" variant="ghost" size="icon" onClick={() => openEditDialog(template)} className="text-blue-600 hover:text-blue-700">
                    <PencilIcon className="h-5 w-5" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" onClick={() => deleteTemplate(template.id)} className="text-red-600 hover:text-red-700">
                    <TrashIcon className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {template.description && (
                <p className="text-sm text-gray-600">{template.description}</p>
              )}

              <div className="flex flex-wrap gap-2">
                {template.difficulty && (
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                    {{ BEGINNER: 'Principiante', INTERMEDIATE: 'Intermedio', ADVANCED: 'Avanzado' }[template.difficulty]}
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
              <Button type="button" variant="ghost" size="icon" onClick={() => setShowDialog(false)}>
                <XMarkIcon className="h-6 w-6" />
              </Button>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <div>
                <Label>Nombre *</Label>
                <Input
                  {...form.register('name')}
                  type="text"
                  className="mt-1"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.name.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <Label>Descripción</Label>
                <Textarea
                  {...form.register('description')}
                  rows={3}
                  className="mt-1"
                />
              </div>

              {/* Difficulty */}
              <div>
                <Label>Dificultad</Label>
                <Select
                  value={form.watch('difficulty') || ''}
                  onValueChange={(val) => form.setValue('difficulty', val as any, { shouldValidate: true })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Sin especificar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">Principiante</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermedio</SelectItem>
                    <SelectItem value="ADVANCED">Avanzado</SelectItem>
                  </SelectContent>
                </Select>
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
                <Label>Tags</Label>
                <div className="flex gap-2 mb-2 mt-1">
                  <Input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Agregar tag..."
                    className="flex-1"
                  />
                  <Button type="button" variant="outline" onClick={addTag}>
                    Agregar
                  </Button>
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
                  <Label>Ejercicios *</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
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
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Agregar Ejercicio
                  </Button>
                </div>

                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="border border-gray-200 rounded-md p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">Ejercicio {index + 1}</span>
                        {fields.length > 1 && (
                          <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-red-600 hover:text-red-700">
                            <TrashIcon className="h-5 w-5" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Controller
                          name={`exercises.${index}.exerciseTypeId`}
                          control={form.control}
                          render={({ field }) => (
                            <div>
                              <Label className="text-xs">
                                Tipo de Ejercicio
                              </Label>
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
                              <Label className="text-xs">
                                Grupo Muscular
                              </Label>
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
                              <Label className="text-xs">
                                Equipo
                              </Label>
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
                          <Label className="text-xs">
                            Sets
                          </Label>
                          <Input
                            {...form.register(`exercises.${index}.sets`, { setValueAs: (v: string) => v === '' || Number.isNaN(Number(v)) ? undefined : Number(v) })}
                            type="number"
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label className="text-xs">
                            Reps
                          </Label>
                          <Input
                            {...form.register(`exercises.${index}.reps`, { setValueAs: (v: string) => v === '' || Number.isNaN(Number(v)) ? undefined : Number(v) })}
                            type="number"
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label className="text-xs">
                            Peso (kg)
                          </Label>
                          <Input
                            {...form.register(`exercises.${index}.weight`, { setValueAs: (v: string) => v === '' || Number.isNaN(Number(v)) ? undefined : Number(v) })}
                            type="number"
                            step="0.5"
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs">Notas</Label>
                        <Input
                          {...form.register(`exercises.${index}.notes`)}
                          type="text"
                          className="mt-1"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Guardando...' : editingTemplate ? 'Actualizar' : 'Crear'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
