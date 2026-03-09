"use client"

import { useState } from "react"
import { createOnchainWallet } from "@/app/dashboard/finance/onchain/actions"

interface WalletFormProps {
  onSuccess?: () => void
}

export default function WalletForm({ onSuccess }: WalletFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await createOnchainWallet(formData)

    if (result.success) {
      setIsOpen(false)
      onSuccess?.()
    } else {
      setError(result.error || "Error al crear wallet")
    }

    setLoading(false)
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
      >
        + Agregar Wallet
      </button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Nueva Wallet</h3>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-md text-sm">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Dirección (0x...)
        </label>
        <input
          type="text"
          name="address"
          id="address"
          required
          placeholder="0x..."
          pattern="^0x[a-fA-F0-9]{40}$"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="label" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Nombre
        </label>
        <input
          type="text"
          name="label"
          id="label"
          required
          placeholder="Mi wallet principal"
          maxLength={50}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label htmlFor="network" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Red
        </label>
        <select
          name="network"
          id="network"
          defaultValue="ARBITRUM"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="ARBITRUM">Arbitrum</option>
          <option value="ETHEREUM">Ethereum</option>
        </select>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "Guardando..." : "Guardar"}
        </button>
        <button
          type="button"
          onClick={() => { setIsOpen(false); setError(null) }}
          className="px-4 py-2 text-sm font-medium rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
