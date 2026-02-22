"use client"

import { useState } from "react"
import Link from "next/link"

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Error al procesar solicitud")
      }

      setSent(true)
    } catch (err: any) {
      setError(err.message || "Ocurrió un error")
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="mt-8 space-y-6">
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded-md text-sm">
          <p className="font-medium">¡Revisa tu bandeja de entrada!</p>
          <p className="mt-1">
            Si existe una cuenta con <strong>{email}</strong>, te hemos enviado un enlace para restablecer tu contraseña.
          </p>
          <p className="mt-1 text-xs italic">
            El enlace expira en 1 hora.
          </p>
        </div>
        <div className="text-center">
          <Link href="/login" className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
            Volver al login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Correo electrónico
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Enviando..." : "Enviar enlace de recuperación"}
      </button>

      <div className="text-center text-sm">
        <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
          Volver al login
        </Link>
      </div>
    </form>
  )
}
