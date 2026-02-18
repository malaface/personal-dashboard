"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import PasswordInput from "@/components/ui/PasswordInput"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [showResend, setShowResend] = useState(false)

  // Check for verified message from query params
  const verified = searchParams.get("verified")
  const urlMessage = searchParams.get("message")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setInfo("")
    setShowResend(false)
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        // NextAuth returns generic "CredentialsSignin" for all authorize failures.
        // Check if the real reason is unverified email.
        try {
          const statusRes = await fetch("/api/auth/check-email-status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          })
          const statusData = await statusRes.json()
          if (statusData.status === "unverified") {
            setError("Tu email aún no ha sido verificado. Revisa tu bandeja de entrada.")
            setShowResend(true)
            setLoading(false)
            return
          }
        } catch {}
        setError("Email o contraseña inválidos")
        setLoading(false)
      } else if (result?.ok) {
        window.location.href = "/dashboard"
      }
    } catch (error) {
      setError("Ocurrió un error. Por favor intenta de nuevo.")
      setLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (!email) {
      setError("Ingresa tu email primero")
      return
    }
    setResending(true)
    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        setInfo("Se ha reenviado el email de verificación. Revisa tu bandeja de entrada.")
        setShowResend(false)
      } else {
        setError(data.error || "No se pudo reenviar el email")
      }
    } catch {
      setError("Error al reenviar email de verificación")
    } finally {
      setResending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {verified && urlMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
          {decodeURIComponent(urlMessage)}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="email">Correo electrónico</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
          {error}
          {showResend && (
            <Button
              type="button"
              variant="link"
              onClick={handleResendVerification}
              disabled={resending}
              className="ml-2 h-auto p-0 text-red-600 underline font-medium hover:text-red-800"
            >
              {resending ? "Reenviando..." : "Reenviar email"}
            </Button>
          )}
        </div>
      )}

      {info && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md text-sm">
          {info}
        </div>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Iniciando sesión..." : "Iniciar sesión"}
      </Button>

      <div className="flex items-center justify-between text-sm">
        <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
          ¿Olvidaste tu contraseña?
        </Link>
        <span>
          <span className="text-gray-600 dark:text-gray-400">¿No tienes cuenta? </span>
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
            Regístrate
          </Link>
        </span>
      </div>
    </form>
  )
}
