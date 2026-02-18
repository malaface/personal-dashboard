"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createFamilyMember, updateFamilyMember } from "@/app/dashboard/family/actions"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface FamilyMemberFormProps {
  member?: {
    id: string
    name: string
    relationship: string
    birthday?: Date | null
    email?: string | null
    phone?: string | null
    notes?: string | null
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

      const result = member
        ? await updateFamilyMember(member.id, formData)
        : await createFamilyMember(formData)

      if (result.success) {
        router.push("/dashboard/family")
        router.refresh()
      } else {
        setError(result.error || "Algo salió mal")
      }
    } catch (err: any) {
      setError(err.message || "Error al guardar el miembro de la familia")
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

        <div className="grid grid-cols-2 gap-4">
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

        <div className="grid grid-cols-3 gap-4">
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

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : member ? "Actualizar Miembro" : "Agregar Miembro"}
        </Button>
      </div>
    </form>
  )
}
