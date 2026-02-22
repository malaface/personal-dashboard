'use client'

import { useState, useEffect } from 'react'
import { PlusIcon } from '@heroicons/react/24/outline'
import { AI_PROVIDERS, CredentialResponse } from '@/lib/ai/types'
import AICredentialCard from './AICredentialCard'
import AddCredentialModal from './AddCredentialModal'

interface AICredentialsManagerProps {
  userId: string
}

export default function AICredentialsManager({ userId }: AICredentialsManagerProps) {
  const [credentials, setCredentials] = useState<CredentialResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch credentials
  const fetchCredentials = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/ai/credentials')

      if (!response.ok) {
        throw new Error('Error al cargar credenciales')
      }

      const data = await response.json()
      setCredentials(data)
      setError(null)
    } catch (err: any) {
      console.error('Error fetching credentials:', err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCredentials()
  }, [])

  // Handle delete credential
  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta credencial?')) {
      return
    }

    try {
      const response = await fetch(`/api/ai/credentials/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Error al eliminar credencial')
      }

      // Remove from list
      setCredentials(prev => prev.filter(c => c.id !== id))
    } catch (err: any) {
      console.error('Error deleting credential:', err)
      alert(err.message)
    }
  }

  // Handle toggle active
  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/ai/credentials/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar credencial')
      }

      const updated = await response.json()

      // Update in list
      setCredentials(prev =>
        prev.map(c => (c.id === id ? updated : c))
      )
    } catch (err: any) {
      console.error('Error toggling credential:', err)
      alert(err.message)
    }
  }

  // Handle credential added
  const handleCredentialAdded = (newCredential: CredentialResponse) => {
    setCredentials(prev => [newCredential, ...prev])
    setIsModalOpen(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-200">{error}</p>
        <button
          onClick={fetchCredentials}
          className="mt-2 text-red-600 dark:text-red-400 hover:underline"
        >
          Reintentar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Mis Credenciales
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {credentials.length} {credentials.length === 1 ? 'credencial configurada' : 'credenciales configuradas'}
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <PlusIcon className="h-5 w-5" />
          <span>Agregar Credencial</span>
        </button>
      </div>

      {/* Credentials List */}
      {credentials.length === 0 ? (
        <div className="bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-12 text-center">
          <div className="max-w-sm mx-auto">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <PlusIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No hay credenciales configuradas
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Agrega tu primera API key para empezar a usar el Coach AI en tus módulos.
            </p>

            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Agregar Primera Credencial</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {credentials.map(credential => (
            <AICredentialCard
              key={credential.id}
              credential={credential}
              onDelete={handleDelete}
              onToggleActive={handleToggleActive}
            />
          ))}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          ℹ️ Proveedores Disponibles
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {Object.values(AI_PROVIDERS).map(provider => (
            <div key={provider.name} className="flex items-start space-x-2">
              <div
                className="w-3 h-3 rounded-full mt-1"
                style={{ backgroundColor: provider.iconColor }}
              />
              <div>
                <p className="font-medium text-blue-900 dark:text-blue-100 text-sm">
                  {provider.displayName}
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  {provider.description}
                </p>
                <a
                  href={provider.docsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Obtener API Key →
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Credential Modal */}
      <AddCredentialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCredentialAdded={handleCredentialAdded}
      />
    </div>
  )
}
