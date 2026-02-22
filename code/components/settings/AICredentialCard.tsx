'use client'

import { TrashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { CredentialResponse, AI_PROVIDERS } from '@/lib/ai/types'

interface AICredentialCardProps {
  credential: CredentialResponse
  onDelete: (id: string) => void
  onToggleActive: (id: string, currentStatus: boolean) => void
}

export default function AICredentialCard({
  credential,
  onDelete,
  onToggleActive,
}: AICredentialCardProps) {
  const provider = AI_PROVIDERS[credential.provider]

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Nunca'

    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: provider.iconColor }}
          >
            {provider.displayName.charAt(0)}
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {provider.displayName}
            </h3>
            {credential.label && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {credential.label}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => onDelete(credential.id)}
          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
          title="Eliminar credencial"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>

      {/* API Key (masked) */}
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">API Key</p>
        <code className="block px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-sm font-mono text-gray-900 dark:text-gray-100">
          {credential.maskedApiKey}
        </code>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          {credential.isValid ? (
            <CheckCircleIcon className="h-5 w-5 text-green-500" />
          ) : (
            <XCircleIcon className="h-5 w-5 text-gray-400" />
          )}
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {credential.isValid ? 'Validada' : 'No validada'}
          </span>
        </div>

        <button
          onClick={() => onToggleActive(credential.id, credential.isActive)}
          className={`px-3 py-1 rounded-full text-xs font-medium transition ${
            credential.isActive
              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
          }`}
        >
          {credential.isActive ? 'Activa' : 'Inactiva'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 pt-2">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Último uso</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {formatDate(credential.lastUsedAt)}
          </p>
        </div>

        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Uso total</p>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {credential.usageCount} {credential.usageCount === 1 ? 'vez' : 'veces'}
          </p>
        </div>
      </div>
    </div>
  )
}
