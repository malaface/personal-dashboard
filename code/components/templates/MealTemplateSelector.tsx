"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronUpDownIcon } from '@heroicons/react/24/outline'

interface MealTemplate {
  id: string
  name: string
  description: string | null
  mealType: "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK" | null
  isPublic: boolean
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
  }>
  user: {
    name: string | null
    email: string
  } | null
}

interface MealTemplateData {
  name: string
  mealType: "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK" | null
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
  }>
}

interface MealTemplateSelectorProps {
  onTemplateLoad: (data: MealTemplateData) => void
  mealType?: "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK"
  className?: string
}

export default function MealTemplateSelector({
  onTemplateLoad,
  mealType,
  className = ''
}: MealTemplateSelectorProps) {
  const [templates, setTemplates] = useState<MealTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<MealTemplate | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchTemplates = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (mealType) params.append('mealType', mealType)

      const response = await fetch(`/api/templates/meals?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch templates')
      }

      const data = await response.json()
      setTemplates(data.templates || [])
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error loading templates')
      setTemplates([])
    } finally {
      setLoading(false)
    }
  }, [mealType])

  // Fetch templates on mount
  useEffect(() => {
    fetchTemplates()
  }, [fetchTemplates])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadTemplate = async (templateId: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/templates/meals/${templateId}/load`)

      if (!response.ok) {
        throw new Error('Failed to load template')
      }

      const result = await response.json()
      onTemplateLoad(result.data)
      setIsOpen(false)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error loading template')
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (template: MealTemplate) => {
    setSelectedTemplate(template)
    loadTemplate(template.id)
  }

  const getMealTypeBadge = (type: string | null) => {
    if (!type) return null

    const colors = {
      BREAKFAST: 'bg-amber-100 text-amber-800',
      LUNCH: 'bg-blue-100 text-blue-800',
      DINNER: 'bg-purple-100 text-purple-800',
      SNACK: 'bg-green-100 text-green-800'
    }

    const labels = {
      BREAKFAST: 'Desayuno',
      LUNCH: 'Almuerzo',
      DINNER: 'Cena',
      SNACK: 'Snack'
    }

    return (
      <span className={`px-2 py-0.5 text-xs rounded-full ${colors[type as keyof typeof colors]}`}>
        {labels[type as keyof typeof labels]}
      </span>
    )
  }

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Selector Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="w-full px-3 py-2 border border-gray-300 rounded-md flex items-center justify-between bg-white hover:border-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        <span className={selectedTemplate ? 'text-gray-900' : 'text-gray-500'}>
          {selectedTemplate ? selectedTemplate.name : 'Cargar desde template...'}
        </span>
        <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-96 overflow-auto">
          {/* Loading state */}
          {loading && (
            <div className="px-3 py-2 text-sm text-gray-500">
              Cargando templates...
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="px-3 py-2 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && templates.length === 0 && (
            <div className="px-3 py-2 text-sm text-gray-500">
              No hay templates disponibles
            </div>
          )}

          {/* Templates list */}
          {!loading && !error && templates.length > 0 && (
            <div className="py-1">
              {templates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleSelect(template)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 flex flex-col"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">
                      {template.name}
                    </span>
                    <div className="flex items-center gap-2">
                      {getMealTypeBadge(template.mealType)}
                      {template.isPublic && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                          Público
                        </span>
                      )}
                    </div>
                  </div>
                  {template.description && (
                    <span className="text-xs text-gray-500 mt-1">
                      {template.description}
                    </span>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                    <span>{template.foodItems.length} alimento{template.foodItems.length !== 1 ? 's' : ''}</span>
                    <span>•</span>
                    <span>{Math.round(template.totalCalories)} kcal</span>
                    <span>•</span>
                    <span>P: {Math.round(template.totalProtein)}g</span>
                    <span>C: {Math.round(template.totalCarbs)}g</span>
                    <span>G: {Math.round(template.totalFats)}g</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Error message below selector */}
      {error && !isOpen && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
