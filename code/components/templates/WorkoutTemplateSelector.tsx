"use client"

import { useState, useEffect, useRef } from 'react'
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/24/outline'

interface WorkoutTemplate {
  id: string
  name: string
  description: string | null
  difficulty: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | null
  isPublic: boolean
  exercises: any[]
  user: {
    name: string | null
    email: string
  } | null
}

interface WorkoutTemplateData {
  name: string
  exercises: Array<{
    exerciseTypeId: string | null
    muscleGroupId: string | null
    equipmentId: string | null
    sets: number
    reps: number
    weight: number | null
    notes: string | null
  }>
}

interface WorkoutTemplateSelectorProps {
  onTemplateLoad: (data: WorkoutTemplateData) => void
  difficulty?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
  className?: string
}

export default function WorkoutTemplateSelector({
  onTemplateLoad,
  difficulty,
  className = ''
}: WorkoutTemplateSelectorProps) {
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<WorkoutTemplate | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch templates on mount
  useEffect(() => {
    fetchTemplates()
  }, [difficulty])

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

  const fetchTemplates = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (difficulty) params.append('difficulty', difficulty)

      const response = await fetch(`/api/templates/workouts?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch templates')
      }

      const data = await response.json()
      setTemplates(data.templates || [])
    } catch (err: any) {
      setError(err.message || 'Error loading templates')
      setTemplates([])
    } finally {
      setLoading(false)
    }
  }

  const loadTemplate = async (templateId: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/templates/workouts/${templateId}/load`)

      if (!response.ok) {
        throw new Error('Failed to load template')
      }

      const result = await response.json()
      onTemplateLoad(result.data)
      setIsOpen(false)
    } catch (err: any) {
      setError(err.message || 'Error loading template')
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (template: WorkoutTemplate) => {
    setSelectedTemplate(template)
    loadTemplate(template.id)
  }

  const getDifficultyBadge = (diff: string | null) => {
    if (!diff) return null

    const colors = {
      BEGINNER: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
      INTERMEDIATE: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
      ADVANCED: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
    }

    return (
      <span className={`px-2 py-0.5 text-xs rounded-full ${colors[diff as keyof typeof colors]}`}>
        {diff}
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
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md flex items-center justify-between bg-white dark:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
      >
        <span className={selectedTemplate ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
          {selectedTemplate ? selectedTemplate.name : 'Cargar desde template...'}
        </span>
        <ChevronUpDownIcon className="h-5 w-5 text-gray-400 dark:text-gray-500" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-96 overflow-auto">
          {/* Loading state */}
          {loading && (
            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
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
            <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
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
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex flex-col"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {template.name}
                    </span>
                    <div className="flex items-center gap-2">
                      {getDifficultyBadge(template.difficulty)}
                      {template.isPublic && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                          Público
                        </span>
                      )}
                    </div>
                  </div>
                  {template.description && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {template.description}
                    </span>
                  )}
                  <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {template.exercises.length} ejercicio{template.exercises.length !== 1 ? 's' : ''}
                  </span>
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
