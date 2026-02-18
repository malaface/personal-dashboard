'use client'

import { useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { AI_PROVIDERS, AIProvider, CredentialResponse } from '@/lib/ai/types'

interface AddCredentialModalProps {
  isOpen: boolean
  onClose: () => void
  onCredentialAdded: (credential: CredentialResponse) => void
}

export default function AddCredentialModal({
  isOpen,
  onClose,
  onCredentialAdded,
}: AddCredentialModalProps) {
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('GEMINI')
  const [apiKey, setApiKey] = useState('')
  const [label, setLabel] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!apiKey.trim()) {
      setError('La API key es requerida')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/credentials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: selectedProvider,
          apiKey: apiKey.trim(),
          label: label.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear credencial')
      }

      const newCredential = await response.json()
      onCredentialAdded(newCredential)

      // Reset form
      setApiKey('')
      setLabel('')
      setError(null)
    } catch (err: any) {
      console.error('Error creating credential:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const currentProvider = AI_PROVIDERS[selectedProvider]

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Agregar Credencial de AI</DialogTitle>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Provider Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Proveedor de AI
            </label>

            <div className="grid grid-cols-2 gap-2">
              {Object.values(AI_PROVIDERS).map(provider => (
                <button
                  key={provider.name}
                  type="button"
                  onClick={() => setSelectedProvider(provider.name as AIProvider)}
                  className={`flex items-center space-x-2 p-3 border rounded-lg transition ${
                    selectedProvider === provider.name
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: provider.iconColor }}
                  />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {provider.displayName.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Provider Info */}
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
              {currentProvider.description}
            </p>
            <a
              href={currentProvider.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              Obtener API Key →
            </a>
          </div>

          {/* Label */}
          <div>
            <label htmlFor="label" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Etiqueta (opcional)
            </label>
            <Input
              type="text"
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ej: Mi cuenta personal"
              maxLength={100}
            />
          </div>

          {/* API Key */}
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              API Key *
            </label>
            <Input
              type="password"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={`Ej: ${currentProvider.keyPrefix}...`}
              className="font-mono text-sm"
              required
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Tu API key se encripta antes de guardarse en la base de datos.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Guardando...' : 'Agregar Credencial'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
