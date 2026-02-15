"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createEvent, updateEvent } from "@/app/dashboard/family/actions"
import { XMarkIcon } from "@heroicons/react/24/outline"

interface FamilyMemberOption {
  id: string
  name: string
}

interface EventFormProps {
  members: FamilyMemberOption[]
  event?: {
    id: string
    title: string
    description?: string | null
    date: string | Date
    familyMemberId?: string | null
    location?: string | null
    isRecurring: boolean
    recurrenceType?: string | null
  }
  onClose: () => void
}

export default function EventForm({ members, event, onClose }: EventFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [title, setTitle] = useState(event?.title || "")
  const [description, setDescription] = useState(event?.description || "")
  const [date, setDate] = useState(
    event?.date ? new Date(event.date).toISOString().split("T")[0] : ""
  )
  const [familyMemberId, setFamilyMemberId] = useState(event?.familyMemberId || "")
  const [location, setLocation] = useState(event?.location || "")
  const [isRecurring, setIsRecurring] = useState(event?.isRecurring || false)
  const [recurrenceType, setRecurrenceType] = useState(event?.recurrenceType || "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("title", title)
      if (description) formData.append("description", description)
      formData.append("date", date)
      if (familyMemberId) formData.append("familyMemberId", familyMemberId)
      if (location) formData.append("location", location)
      formData.append("isRecurring", String(isRecurring))
      if (isRecurring && recurrenceType) formData.append("recurrenceType", recurrenceType)

      const result = event
        ? await updateEvent(event.id, formData)
        : await createEvent(formData)

      if (result.success) {
        router.refresh()
        onClose()
      } else {
        setError(result.error || "Algo salió mal")
      }
    } catch (err: any) {
      setError(err.message || "Error al guardar el evento")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {event ? "Editar Evento" : "Nuevo Evento"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-3 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Título *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={2}
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Ej., Cena familiar, Aniversario..."
            />
          </div>

          {/* Date + Member */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha *
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Persona asociada
              </label>
              <select
                value={familyMemberId}
                onChange={(e) => setFamilyMemberId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Ninguna</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ubicación
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              maxLength={200}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Ej., Casa de los abuelos..."
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              maxLength={500}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Notas opcionales sobre el evento..."
            />
          </div>

          {/* Recurrence */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={(e) => {
                  setIsRecurring(e.target.checked)
                  if (!e.target.checked) setRecurrenceType("")
                }}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Evento recurrente</span>
            </label>

            {isRecurring && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Frecuencia
                </label>
                <select
                  value={recurrenceType}
                  onChange={(e) => setRecurrenceType(e.target.value)}
                  required={isRecurring}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Seleccionar...</option>
                  <option value="WEEKLY">Semanal</option>
                  <option value="MONTHLY">Mensual</option>
                  <option value="YEARLY">Anual</option>
                </select>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? "Guardando..." : event ? "Actualizar" : "Crear Evento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
