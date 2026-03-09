"use client"

import { useState } from "react"
import { KeyIcon } from "@heroicons/react/24/outline"
import { saveArbiscanApiKey } from "@/app/dashboard/finance/onchain/actions"

interface ArbiscanKeyFormProps {
  hasKey: boolean
}

export default function ArbiscanKeyForm({ hasKey }: ArbiscanKeyFormProps) {
  const [isOpen, setIsOpen] = useState(!hasKey)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    const result = await saveArbiscanApiKey(formData)

    if (result.success) {
      setSuccess(true)
      setIsOpen(false)
    } else {
      setError(result.error || "Error al guardar la API key")
    }

    setLoading(false)
  }

  if (!isOpen && hasKey) {
    return (
      <div className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <KeyIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <div className="flex-1">
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">API Key de Arbiscan configurada</p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">Historial completo de transacciones via Etherscan V2 API</p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="text-xs px-3 py-1 rounded-md bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/60 transition-colors"
        >
          Cambiar
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
      <div className="flex items-start gap-3 mb-4">
        <KeyIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Configura tu API Key de Arbiscan
          </h3>
          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
            Necesitas una API key de{" "}
            <a href="https://arbiscan.io/myapikey" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
              Arbiscan
            </a>{" "}
            para obtener el historial completo de transacciones on-chain. Es gratuita.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-3 p-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-3 p-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded text-sm">
          API key guardada correctamente
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="arbiscanApiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            API Key
          </label>
          <input
            type="password"
            name="apiKey"
            id="arbiscanApiKey"
            required
            placeholder="Tu API key de Arbiscan..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {loading ? "Guardando..." : "Guardar API Key"}
          </button>
          {hasKey && (
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 text-sm font-medium rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
