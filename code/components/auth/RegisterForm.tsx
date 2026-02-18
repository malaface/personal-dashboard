"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import PasswordInput from "@/components/ui/PasswordInput"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function RegisterForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    if (formData.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Falló el registro")
      }

      // Show success message instead of auto-login
      setSuccess(true)
    } catch (error: any) {
      setError(error.message || "Ocurrió un error durante el registro")
    } finally {
      setLoading(false)
    }
  }

  // Show success message if registration was successful
  if (success) {
    return (
      <div className="mt-8 space-y-6">
        <div className="rounded-lg border border-green-500 bg-green-50 p-4 dark:bg-green-950">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                ¡Cuenta creada exitosamente!
              </h3>
              <div className="mt-2 text-sm text-green-700 dark:text-green-300">
                <p>
                  Te hemos enviado un email de verificación a <strong>{formData.email}</strong>.
                </p>
                <p className="mt-1">
                  Por favor revisa tu bandeja de entrada y haz clic en el link de verificación para activar tu cuenta.
                </p>
                <p className="mt-2 text-xs italic">
                  Nota: Si estás en modo desarrollo, puedes iniciar sesión directamente sin verificar el email.
                </p>
              </div>
              <div className="mt-4">
                <Link
                  href="/login"
                  className="text-sm font-medium text-green-800 hover:text-green-600 dark:text-green-200 dark:hover:text-green-100"
                >
                  Ir al login →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Nombre completo</Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="Juan Pérez"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={formData.email}
            onChange={handleChange}
            placeholder="tu@email.com"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="password">Contraseña</Label>
          <div className="mt-1">
            <PasswordInput
              id="password"
              name="password"
              autoComplete="new-password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Mínimo 8 caracteres"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
          <div className="mt-1">
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              autoComplete="new-password"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repite tu contraseña"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Creando cuenta..." : "Crear cuenta"}
      </Button>

      <div className="text-center text-sm">
        <span className="text-gray-600 dark:text-gray-400">¿Ya tienes una cuenta? </span>
        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
          Inicia sesión
        </Link>
      </div>
    </form>
  )
}
