"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createEvent, updateEvent } from "@/app/dashboard/family/actions"
import { XMarkIcon } from "@heroicons/react/24/outline"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

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
          <Button type="button" variant="ghost" size="icon" onClick={onClose}>
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-3 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <Label>Título *</Label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={2}
              maxLength={100}
              className="mt-1"
              placeholder="Ej., Cena familiar, Aniversario..."
            />
          </div>

          {/* Date + Member */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Fecha *</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label>Persona asociada</Label>
              <Select
                value={familyMemberId || "_none_"}
                onValueChange={(v) => setFamilyMemberId(v === "_none_" ? "" : v)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Ninguna" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none_">Ninguna</SelectItem>
                  {members.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          <div>
            <Label>Ubicación</Label>
            <Input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              maxLength={200}
              className="mt-1"
              placeholder="Ej., Casa de los abuelos..."
            />
          </div>

          {/* Description */}
          <div>
            <Label>Descripción</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              maxLength={500}
              className="mt-1"
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
                <Label>Frecuencia</Label>
                <Select
                  value={recurrenceType || "_none_"}
                  onValueChange={(v) => setRecurrenceType(v === "_none_" ? "" : v)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none_">Seleccionar...</SelectItem>
                    <SelectItem value="WEEKLY">Semanal</SelectItem>
                    <SelectItem value="MONTHLY">Mensual</SelectItem>
                    <SelectItem value="YEARLY">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Guardando..." : event ? "Actualizar" : "Crear Evento"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
