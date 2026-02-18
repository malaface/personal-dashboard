"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import PasswordInput from "@/components/ui/PasswordInput"

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
        // Check if the error is about email not verified
        if (result.error.includes("verify your email")) {
          setError("Tu email aún no ha sido verificado. Revisa tu bandeja de entrada.")
          setShowResend(true)
        } else {
          setError("Email o contraseña inválidos")
        }
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
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Contraseña
          </label>
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
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resending}
              className="ml-2 underline font-medium hover:text-red-800 disabled:opacity-50"
            >
              {resending ? "Reenviando..." : "Reenviar email"}
            </button>
          )}
        </div>
      )}

      {info && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md text-sm">
          {info}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Iniciando sesión..." : "Iniciar sesión"}
      </button>

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
