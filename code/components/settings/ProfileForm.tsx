"use client"

import { useState } from "react"
import { updateProfile } from "@/app/dashboard/settings/actions"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface ProfileFormProps {
  user: {
    name?: string | null
    email?: string | null
  }
  profile?: {
    bio?: string | null
    phone?: string | null
    birthday?: Date | null
    country?: string | null
    city?: string | null
    timezone?: string | null
  } | null
}

export default function ProfileForm({ user, profile }: ProfileFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const [name, setName] = useState(user.name || "")
  const [bio, setBio] = useState(profile?.bio || "")
  const [phone, setPhone] = useState(profile?.phone || "")
  const [birthday, setBirthday] = useState(
    profile?.birthday ? new Date(profile.birthday).toISOString().split('T')[0] : ""
  )
  const [country, setCountry] = useState(profile?.country || "")
  const [city, setCity] = useState(profile?.city || "")
  const [timezone, setTimezone] = useState(profile?.timezone || "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      const formData = new FormData()
      formData.append("name", name)
      if (bio) formData.append("bio", bio)
      if (phone) formData.append("phone", phone)
      if (birthday) formData.append("birthday", birthday)
      if (country) formData.append("country", country)
      if (city) formData.append("city", city)
      if (timezone) formData.append("timezone", timezone)

      const result = await updateProfile(formData)

      if (result.success) {
        setSuccess(true)
        router.refresh()
      } else {
        setError(result.error || "Algo salió mal")
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al actualizar el perfil")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-300 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-600 dark:text-green-300 px-4 py-3 rounded-md">
          ¡Perfil actualizado exitosamente!
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold dark:text-white">Información Personal</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Nombre Completo *</Label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              maxLength={100}
              className="mt-1"
            />
          </div>

          <div>
            <Label>Email (solo lectura)</Label>
            <Input
              type="email"
              value={user.email || ""}
              disabled
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label>Biografía</Label>
          <Textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            maxLength={300}
            placeholder="Cuéntanos sobre ti..."
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Teléfono</Label>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={20}
              placeholder="+52 55 1234 5678"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Fecha de Nacimiento</Label>
            <Input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>País</Label>
            <Input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              maxLength={100}
              placeholder="México"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Ciudad</Label>
            <Input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              maxLength={100}
              placeholder="Ciudad de México"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Zona Horaria</Label>
            <Input
              type="text"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              maxLength={50}
              placeholder="America/Mexico_City"
              className="mt-1"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>
    </form>
  )
}
