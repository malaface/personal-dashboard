"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createFamilyMember, updateFamilyMember } from "@/app/dashboard/family/actions"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline"

interface ImportantDate {
  id?: string
  title: string
  date: string
  isRecurring: boolean
  recurrenceType: "YEARLY" | "MONTHLY" | "WEEKLY"
}

interface FamilyMemberFormProps {
  member?: {
    id: string
    name: string
    relationship: string
    birthday?: Date | null
    email?: string | null
    phone?: string | null
    notes?: string | null
    events?: {
      id: string
      title: string
      date: Date
      isRecurring: boolean
      recurrenceType: string | null
    }[]
  }
}

export default function FamilyMemberForm({ member }: FamilyMemberFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [name, setName] = useState(member?.name || "")
  const [relationship, setRelationship] = useState(member?.relationship || "")
  const [birthday, setBirthday] = useState(
    member?.birthday ? new Date(member.birthday).toISOString().split('T')[0] : ""
  )
  const [email, setEmail] = useState(member?.email || "")
  const [phone, setPhone] = useState(member?.phone || "")
  const [notes, setNotes] = useState(member?.notes || "")

  const [importantDates, setImportantDates] = useState<ImportantDate[]>(
    member?.events?.map((e) => ({
      id: e.id,
      title: e.title,
      date: new Date(e.date).toISOString().split('T')[0],
      isRecurring: e.isRecurring,
      recurrenceType: (e.recurrenceType as ImportantDate["recurrenceType"]) || "YEARLY",
    })) || []
  )

  const addDate = () => {
    setImportantDates([
      ...importantDates,
      { title: "", date: "", isRecurring: true, recurrenceType: "YEARLY" },
    ])
  }

  const removeDate = (index: number) => {
    setImportantDates(importantDates.filter((_, i) => i !== index))
  }

  const updateDate = (index: number, field: keyof ImportantDate, value: string | boolean) => {
    setImportantDates(
      importantDates.map((d, i) => (i === index ? { ...d, [field]: value } : d))
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("relationship", relationship)
      if (birthday) formData.append("birthday", birthday)
      if (email) formData.append("email", email)
      if (phone) formData.append("phone", phone)
      if (notes) formData.append("notes", notes)

      // Serialize important dates as JSON
      const validDates = importantDates.filter((d) => d.title && d.date)
      if (validDates.length > 0) {
        formData.append("importantDates", JSON.stringify(validDates))
      }

      const result = member
        ? await updateFamilyMember(member.id, formData)
        : await createFamilyMember(formData)

      if (result.success) {
        router.push("/dashboard/family")
        router.refresh()
      } else {
        setError(result.error || "Algo salió mal")
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al guardar el miembro de la familia")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Información Básica</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>
              Nombre *
            </Label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              maxLength={100}
              className="mt-1"
              placeholder="Ej., Juan Pérez"
            />
          </div>

          <div>
            <Label>
              Relación *
            </Label>
            <Input
              type="text"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              required
              minLength={2}
              maxLength={50}
              className="mt-1"
              placeholder="Ej., Padre, Hermana, Amigo"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label>
              Cumpleaños
            </Label>
            <Input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label>
              Correo Electrónico
            </Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div>
            <Label>
              Teléfono
            </Label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={20}
              className="mt-1"
              placeholder="+52 555 123 4567"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notas
          </label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            maxLength={500}
            className="mt-1"
            placeholder="Notas opcionales sobre esta persona..."
          />
        </div>
      </div>

      {/* Important Dates Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Fechas Importantes</h3>
          <Button type="button" variant="outline" size="sm" onClick={addDate}>
            <PlusIcon className="h-4 w-4 mr-1" />
            Agregar
          </Button>
        </div>

        {importantDates.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No hay fechas adicionales. El cumpleaños se sincroniza automáticamente.
          </p>
        )}

        {importantDates.map((dateItem, index) => (
          <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                <div>
                  <Label>Nombre del evento</Label>
                  <Input
                    type="text"
                    value={dateItem.title}
                    onChange={(e) => updateDate(index, "title", e.target.value)}
                    className="mt-1"
                    placeholder="Ej., Aniversario, Graduación"
                    maxLength={100}
                  />
                </div>
                <div>
                  <Label>Fecha</Label>
                  <Input
                    type="date"
                    value={dateItem.date}
                    onChange={(e) => updateDate(index, "date", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeDate(index)}
                className="mt-6 p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                aria-label="Eliminar fecha"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dateItem.isRecurring}
                  onChange={(e) => updateDate(index, "isRecurring", e.target.checked)}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Recurrente</span>
              </label>

              {dateItem.isRecurring && (
                <select
                  value={dateItem.recurrenceType}
                  onChange={(e) => updateDate(index, "recurrenceType", e.target.value)}
                  className="text-sm border border-gray-300 dark:border-gray-600 rounded-md px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="YEARLY">Anual</option>
                  <option value="MONTHLY">Mensual</option>
                  <option value="WEEKLY">Semanal</option>
                </select>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : member ? "Actualizar Miembro" : "Agregar Miembro"}
        </Button>
      </div>
    </form>
  )
}
