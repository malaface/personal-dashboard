"use client"

import { useState } from "react"
import { KeyIcon } from "@heroicons/react/24/outline"
import { saveCovalentApiKey } from "@/app/dashboard/finance/onchain/actions"

interface CovalentKeyFormProps {
  hasKey: boolean
}

export default function CovalentKeyForm({ hasKey }: CovalentKeyFormProps) {
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
    const result = await saveCovalentApiKey(formData)

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
      <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <KeyIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
        <div className="flex-1">
          <p className="text-sm font-medium text-green-700 dark:text-green-300">API Key de Covalent configurada</p>
          <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">Las transacciones se obtienen desde la API de Covalent (GoldRush)</p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="text-xs px-3 py-1 rounded-md bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/60 transition-colors"
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
            Configura tu API Key de Covalent
          </h3>
          <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
            Necesitas una API key de{" "}
            <a href="https://www.covalenthq.com/platform/" target="_blank" rel="noopener noreferrer" className="underline hover:no-underline">
              Covalent (GoldRush)
            </a>{" "}
            para obtener el historial de transacciones on-chain. Es gratuita.
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
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            API Key
          </label>
          <input
            type="password"
            name="apiKey"
            id="apiKey"
            required
            placeholder="cqt_..."
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
