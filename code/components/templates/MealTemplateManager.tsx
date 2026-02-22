"use client"

import { useState, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
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

// Zod schemas
const foodItemSchema = z.object({
  name: z.string().min(2).max(100),
  quantity: z.number().min(0.1),
  unit: z.string().min(1).max(20),
  calories: z.number().min(0).nullable(),
  protein: z.number().min(0).nullable(),
  carbs: z.number().min(0).nullable(),
  fats: z.number().min(0).nullable(),
  sortOrder: z.number().int().min(0).default(0)
})

const templateSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).nullable(),
  mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']).nullable(),
  isPublic: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  foodItems: z.array(foodItemSchema).min(1, "Al menos un alimento requerido")
})

type TemplateFormData = z.infer<typeof templateSchema>

interface MealTemplate {
  id: string
  name: string
  description: string | null
  mealType: "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK" | null
  isPublic: boolean
  tags: string[]
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFats: number
  foodItems: Array<{
    name: string
    quantity: number
    unit: string
    calories: number | null
    protein: number | null
    carbs: number | null
    fats: number | null
    sortOrder: number
  }>
  user: { name: string | null } | null
  createdAt: string
  updatedAt: string
}

export default function MealTemplateManager() {
  const [templates, setTemplates] = useState<MealTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<MealTemplate | null>(null)
  const [tagInput, setTagInput] = useState('')

  const form = useForm<TemplateFormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(templateSchema) as any,
    defaultValues: {
      name: '',
      description: null,
      mealType: null,
      isPublic: false,
      tags: [],
      foodItems: [{
        name: '',
        quantity: 100,
        unit: 'g',
        calories: null,
        protein: null,
        carbs: null,
        fats: null,
        sortOrder: 0
      }]
    }
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'foodItems'
  })

  useEffect(() => {
    fetchTemplates()
  }, [])

  const fetchTemplates = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/templates/meals')
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
      mealType: null,
      isPublic: false,
      tags: [],
      foodItems: [{
        name: '',
        quantity: 100,
        unit: 'g',
        calories: null,
        protein: null,
        carbs: null,
        fats: null,
        sortOrder: 0
      }]
    })
    setShowDialog(true)
  }

  const openEditDialog = (template: MealTemplate) => {
    setEditingTemplate(template)
    form.reset({
      name: template.name,
      description: template.description,
      mealType: template.mealType,
      isPublic: template.isPublic,
      tags: template.tags,
      foodItems: template.foodItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fats: item.fats,
        sortOrder: item.sortOrder
      }))
    })
    setShowDialog(true)
  }

  const onSubmit = async (data: TemplateFormData) => {
    setLoading(true)
    setError(null)

    try {
      const url = editingTemplate
        ? `/api/templates/meals/${editingTemplate.id}`
        : '/api/templates/meals'

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
      const response = await fetch(`/api/templates/meals/${id}`, {
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

  // Calculate totals
  const calculateTotals = () => {
    const items = form.watch('foodItems')
    return items.reduce((acc, item) => ({
      calories: acc.calories + (item.calories || 0),
      protein: acc.protein + (item.protein || 0),
      carbs: acc.carbs + (item.carbs || 0),
      fats: acc.fats + (item.fats || 0)
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 })
  }

  const totals = showDialog ? calculateTotals() : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mis Templates de Comidas</h2>
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
                {template.mealType && (
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                    {{ BREAKFAST: 'Desayuno', LUNCH: 'Almuerzo', DINNER: 'Cena', SNACK: 'Colación' }[template.mealType]}
                  </span>
                )}
                {template.isPublic && (
                  <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                    Público
                  </span>
                )}
              </div>

              <div className="text-sm space-y-1">
                <p className="text-gray-700 font-medium">
                  {Math.round(template.totalCalories)} kcal
                </p>
                <div className="flex gap-3 text-xs text-gray-500">
                  <span>P: {Math.round(template.totalProtein)}g</span>
                  <span>C: {Math.round(template.totalCarbs)}g</span>
                  <span>G: {Math.round(template.totalFats)}g</span>
                </div>
                <p className="text-xs text-gray-500">
                  {template.foodItems.length} alimento{template.foodItems.length !== 1 ? 's' : ''}
                </p>
              </div>

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

              {/* Meal Type */}
              <div>
                <Label>Tipo de Comida</Label>
                <Select
                  value={form.watch('mealType') || ''}
                  onValueChange={(val) => form.setValue('mealType', val as any, { shouldValidate: true })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Sin especificar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BREAKFAST">Desayuno</SelectItem>
                    <SelectItem value="LUNCH">Almuerzo</SelectItem>
                    <SelectItem value="DINNER">Cena</SelectItem>
                    <SelectItem value="SNACK">Colación</SelectItem>
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

              {/* Food Items */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <Label>Alimentos *</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => append({
                      name: '',
                      quantity: 100,
                      unit: 'g',
                      calories: null,
                      protein: null,
                      carbs: null,
                      fats: null,
                      sortOrder: fields.length
                    })}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <PlusIcon className="h-4 w-4" />
                    Agregar Alimento
                  </Button>
                </div>

                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="border border-gray-200 rounded-md p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">Alimento {index + 1}</span>
                        {fields.length > 1 && (
                          <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="text-red-600 hover:text-red-700">
                            <TrashIcon className="h-5 w-5" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-2">
                          <Label className="text-xs">
                            Nombre
                          </Label>
                          <Input
                            {...form.register(`foodItems.${index}.name`)}
                            type="text"
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label className="text-xs">
                            Cantidad
                          </Label>
                          <div className="flex gap-2">
                            <Input
                              {...form.register(`foodItems.${index}.quantity`, { setValueAs: (v: string) => v === '' || Number.isNaN(Number(v)) ? undefined : Number(v) })}
                              type="number"
                              step="0.1"
                              className="w-20"
                            />
                            <Input
                              {...form.register(`foodItems.${index}.unit`)}
                              type="text"
                              placeholder="g, ml, oz"
                              className="flex-1"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <Label className="text-xs">
                            Calorías
                          </Label>
                          <Input
                            {...form.register(`foodItems.${index}.calories`, { setValueAs: (v: string) => v === '' || Number.isNaN(Number(v)) ? undefined : Number(v) })}
                            type="number"
                            step="0.1"
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label className="text-xs">
                            Proteína (g)
                          </Label>
                          <Input
                            {...form.register(`foodItems.${index}.protein`, { setValueAs: (v: string) => v === '' || Number.isNaN(Number(v)) ? undefined : Number(v) })}
                            type="number"
                            step="0.1"
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label className="text-xs">
                            Carbos (g)
                          </Label>
                          <Input
                            {...form.register(`foodItems.${index}.carbs`, { setValueAs: (v: string) => v === '' || Number.isNaN(Number(v)) ? undefined : Number(v) })}
                            type="number"
                            step="0.1"
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label className="text-xs">
                            Grasas (g)
                          </Label>
                          <Input
                            {...form.register(`foodItems.${index}.fats`, { setValueAs: (v: string) => v === '' || Number.isNaN(Number(v)) ? undefined : Number(v) })}
                            type="number"
                            step="0.1"
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals Summary */}
              {totals && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h4 className="font-medium text-sm text-blue-900 mb-2">Totales Calculados</h4>
                  <div className="flex gap-6 text-sm text-blue-800">
                    <span>{Math.round(totals.calories)} kcal</span>
                    <span>P: {Math.round(totals.protein)}g</span>
                    <span>C: {Math.round(totals.carbs)}g</span>
                    <span>G: {Math.round(totals.fats)}g</span>
                  </div>
                </div>
              )}

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
