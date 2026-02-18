"use client"

import { useState, useRef } from "react"
import {
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  DocumentCheckIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline"
import type { ImportPreview } from "@/lib/backup/types"
import { Button } from "@/components/ui/button"

interface ExportCounts {
  profile: number
  workouts: number
  workoutTemplates: number
  transactions: number
  investments: number
  budgets: number
  meals: number
  nutritionGoals: number
  mealTemplates: number
  familyMembers: number
  timeLogs: number
  events: number
  reminders: number
  catalogItems: number
}

interface BackupManagerProps {
  exportCounts: ExportCounts
}

export default function BackupManager({ exportCounts }: BackupManagerProps) {
  const [exportLoading, setExportLoading] = useState(false)
  const [importLoading, setImportLoading] = useState(false)
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [importResult, setImportResult] = useState<{
    success: boolean
    message: string
    imported?: Record<string, number>
  } | null>(null)
  const [error, setError] = useState("")
  const [showImportModal, setShowImportModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [backupData, setBackupData] = useState<unknown>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const totalExportItems =
    exportCounts.profile +
    exportCounts.workouts +
    exportCounts.workoutTemplates +
    exportCounts.transactions +
    exportCounts.investments +
    exportCounts.budgets +
    exportCounts.meals +
    exportCounts.nutritionGoals +
    exportCounts.mealTemplates +
    exportCounts.familyMembers +
    exportCounts.timeLogs +
    exportCounts.events +
    exportCounts.reminders +
    exportCounts.catalogItems

  const handleExport = async () => {
    setExportLoading(true)
    setError("")

    try {
      const response = await fetch("/api/backup/export")

      if (!response.ok) {
        throw new Error("Error al exportar datos")
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition")
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/)
      const filename = filenameMatch?.[1] || "dashboard_backup.json"

      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err: any) {
      setError(err.message || "Error al exportar datos")
    } finally {
      setExportLoading(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError("")
    setPreview(null)
    setImportResult(null)
    setSelectedFile(file)

    try {
      const text = await file.text()
      const data = JSON.parse(text)
      setBackupData(data)

      // Preview the backup
      const response = await fetch("/api/backup/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: text,
      })

      const previewResult = await response.json()
      setPreview(previewResult)
      setShowImportModal(true)
    } catch (err: any) {
      setError("Archivo JSON inválido")
      setSelectedFile(null)
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleImport = async (mode: "merge" | "replace") => {
    if (!backupData) return

    setImportLoading(true)
    setError("")

    try {
      const response = await fetch("/api/backup/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: backupData, mode }),
      })

      const result = await response.json()

      if (result.success) {
        setImportResult({
          success: true,
          message: "Datos importados exitosamente",
          imported: result.imported,
        })
        setShowImportModal(false)
        // Refresh page to show updated data
        setTimeout(() => {
          window.location.reload()
        }, 2000)
      } else {
        setError(result.error || "Error al importar datos")
      }
    } catch (err: any) {
      setError(err.message || "Error al importar datos")
    } finally {
      setImportLoading(false)
    }
  }

  const closeModal = () => {
    setShowImportModal(false)
    setPreview(null)
    setSelectedFile(null)
    setBackupData(null)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Backup y Restauración
      </h2>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Exporta tus datos para hacer un respaldo o importa un backup previo.
        Al importar, puedes elegir agregar los datos (merge) o reemplazar todo.
      </p>

      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-300 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {importResult?.success && (
        <div className="mb-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 text-green-600 dark:text-green-300 px-4 py-3 rounded-md">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5" />
            <span>{importResult.message}</span>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {/* Export Section */}
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0">
              <ArrowDownTrayIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white">
                Exportar Datos
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Descarga todos tus datos en formato JSON.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                {totalExportItems} registros disponibles
              </p>
              <Button
                onClick={handleExport}
                disabled={exportLoading || totalExportItems === 0}
                className="mt-3"
                size="sm"
              >
                {exportLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Exportando...
                  </>
                ) : (
                  <>
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    Exportar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Import Section */}
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center shrink-0">
              <ArrowUpTrayIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900 dark:text-white">
                Importar Datos
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Restaura datos desde un archivo de backup.
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                Formato: JSON (max 10MB)
              </p>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json,application/json"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={importLoading}
                variant="secondary"
                className="mt-3 bg-green-600 text-white hover:bg-green-700"
                size="sm"
              >
                <ArrowUpTrayIcon className="h-4 w-4" />
                Seleccionar Archivo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Export Details */}
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Datos disponibles para exportar:
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
          <div className="flex justify-between bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded">
            <span className="text-gray-600 dark:text-gray-400">Perfil</span>
            <span className="font-medium dark:text-white">{exportCounts.profile}</span>
          </div>
          <div className="flex justify-between bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded">
            <span className="text-gray-600 dark:text-gray-400">Entrenamientos</span>
            <span className="font-medium dark:text-white">{exportCounts.workouts}</span>
          </div>
          <div className="flex justify-between bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded">
            <span className="text-gray-600 dark:text-gray-400">Transacciones</span>
            <span className="font-medium dark:text-white">{exportCounts.transactions}</span>
          </div>
          <div className="flex justify-between bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded">
            <span className="text-gray-600 dark:text-gray-400">Inversiones</span>
            <span className="font-medium dark:text-white">{exportCounts.investments}</span>
          </div>
          <div className="flex justify-between bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded">
            <span className="text-gray-600 dark:text-gray-400">Comidas</span>
            <span className="font-medium dark:text-white">{exportCounts.meals}</span>
          </div>
          <div className="flex justify-between bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded">
            <span className="text-gray-600 dark:text-gray-400">Familia</span>
            <span className="font-medium dark:text-white">{exportCounts.familyMembers}</span>
          </div>
          <div className="flex justify-between bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded">
            <span className="text-gray-600 dark:text-gray-400">Recordatorios</span>
            <span className="font-medium dark:text-white">{exportCounts.reminders}</span>
          </div>
          <div className="flex justify-between bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded">
            <span className="text-gray-600 dark:text-gray-400">Categorías</span>
            <span className="font-medium dark:text-white">{exportCounts.catalogItems}</span>
          </div>
        </div>
      </div>

      {/* Import Preview Modal */}
      {showImportModal && preview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Vista Previa de Importación
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeModal}
                >
                  <XMarkIcon className="h-5 w-5" />
                </Button>
              </div>

              {!preview.valid ? (
                <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <ExclamationTriangleIcon className="h-5 w-5" />
                    <span className="font-medium">Archivo inválido</span>
                  </div>
                  <ul className="mt-2 text-sm text-red-600 dark:text-red-300 list-disc list-inside">
                    {preview.errors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
              ) : (
                <>
                  {/* File Info */}
                  <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DocumentCheckIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {selectedFile?.name}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      <p>Versión: {preview.version}</p>
                      <p>Fecha: {new Date(preview.exportDate).toLocaleDateString()}</p>
                      <p>Origen: {preview.sourceEmail}</p>
                    </div>
                  </div>

                  {/* Warnings */}
                  {preview.warnings.length > 0 && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-4">
                      <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                        <ExclamationTriangleIcon className="h-5 w-5" />
                        <span className="font-medium">Advertencias</span>
                      </div>
                      <ul className="mt-2 text-sm text-yellow-700 dark:text-yellow-300 list-disc list-inside">
                        {preview.warnings.map((warning, i) => (
                          <li key={i}>{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Counts */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Datos a importar:
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {preview.counts.profile > 0 && (
                        <div className="flex justify-between bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded">
                          <span className="text-gray-600 dark:text-gray-400">Perfil</span>
                          <span className="font-medium dark:text-white">{preview.counts.profile}</span>
                        </div>
                      )}
                      {preview.counts.workouts > 0 && (
                        <div className="flex justify-between bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded">
                          <span className="text-gray-600 dark:text-gray-400">Entrenamientos</span>
                          <span className="font-medium dark:text-white">{preview.counts.workouts}</span>
                        </div>
                      )}
                      {preview.counts.transactions > 0 && (
                        <div className="flex justify-between bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded">
                          <span className="text-gray-600 dark:text-gray-400">Transacciones</span>
                          <span className="font-medium dark:text-white">{preview.counts.transactions}</span>
                        </div>
                      )}
                      {preview.counts.investments > 0 && (
                        <div className="flex justify-between bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded">
                          <span className="text-gray-600 dark:text-gray-400">Inversiones</span>
                          <span className="font-medium dark:text-white">{preview.counts.investments}</span>
                        </div>
                      )}
                      {preview.counts.meals > 0 && (
                        <div className="flex justify-between bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded">
                          <span className="text-gray-600 dark:text-gray-400">Comidas</span>
                          <span className="font-medium dark:text-white">{preview.counts.meals}</span>
                        </div>
                      )}
                      {preview.counts.familyMembers > 0 && (
                        <div className="flex justify-between bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded">
                          <span className="text-gray-600 dark:text-gray-400">Familia</span>
                          <span className="font-medium dark:text-white">{preview.counts.familyMembers}</span>
                        </div>
                      )}
                      {preview.counts.reminders > 0 && (
                        <div className="flex justify-between bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded">
                          <span className="text-gray-600 dark:text-gray-400">Recordatorios</span>
                          <span className="font-medium dark:text-white">{preview.counts.reminders}</span>
                        </div>
                      )}
                      {preview.counts.catalogItems > 0 && (
                        <div className="flex justify-between bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded">
                          <span className="text-gray-600 dark:text-gray-400">Categorías</span>
                          <span className="font-medium dark:text-white">{preview.counts.catalogItems}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Import Options */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Modo de importación:
                    </h4>

                    <Button
                      onClick={() => handleImport("merge")}
                      disabled={importLoading}
                      className="w-full h-auto py-3 bg-green-600 text-white hover:bg-green-700 justify-start"
                    >
                      <div className="flex items-center gap-3">
                        {importLoading ? (
                          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          <ArrowUpTrayIcon className="h-5 w-5" />
                        )}
                        <div className="text-left">
                          <div className="font-medium">Agregar (Merge)</div>
                          <div className="text-sm opacity-90">
                            Agrega los datos sin borrar los existentes
                          </div>
                        </div>
                      </div>
                    </Button>

                    <Button
                      onClick={() => handleImport("replace")}
                      disabled={importLoading}
                      variant="destructive"
                      className="w-full h-auto py-3 justify-start"
                    >
                      <div className="flex items-center gap-3">
                        <ExclamationTriangleIcon className="h-5 w-5" />
                        <div className="text-left">
                          <div className="font-medium">Reemplazar</div>
                          <div className="text-sm opacity-90">
                            Borra todos los datos existentes primero
                          </div>
                        </div>
                      </div>
                    </Button>
                  </div>
                </>
              )}

              <Button
                variant="outline"
                onClick={closeModal}
                className="mt-4 w-full"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
