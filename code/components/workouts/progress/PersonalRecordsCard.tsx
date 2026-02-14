"use client"

import { TrophyIcon } from "@heroicons/react/24/outline"

interface PersonalRecordsData {
  maxWeight: number | null
  maxWeightDate: string | null
  maxVolume: number
  maxVolumeDate: string | null
  maxReps: number
  maxRepsDate: string | null
}

interface PersonalRecordsCardProps {
  records: PersonalRecordsData | null
  visible: boolean
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export default function PersonalRecordsCard({ records, visible }: PersonalRecordsCardProps) {
  if (!visible || !records) return null

  const hasRecords = records.maxWeight !== null || records.maxVolume > 0 || records.maxReps > 0

  if (!hasRecords) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center text-gray-500 dark:text-gray-400">
        Sin records personales aún
      </div>
    )
  }

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrophyIcon className="h-5 w-5 text-yellow-500" />
        <h3 className="font-semibold text-gray-900 dark:text-white">Records Personales</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {records.maxWeight !== null && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-yellow-200 dark:border-yellow-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">Peso Máximo</p>
            <p className="text-xl font-bold text-yellow-700 dark:text-yellow-300">
              {records.maxWeight} kg
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {formatDate(records.maxWeightDate)}
            </p>
          </div>
        )}

        {records.maxVolume > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-yellow-200 dark:border-yellow-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">Volumen Máximo</p>
            <p className="text-xl font-bold text-yellow-700 dark:text-yellow-300">
              {Math.round(records.maxVolume)} kg
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {formatDate(records.maxVolumeDate)}
            </p>
          </div>
        )}

        {records.maxReps > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-yellow-200 dark:border-yellow-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">Reps Máximas</p>
            <p className="text-xl font-bold text-yellow-700 dark:text-yellow-300">
              {records.maxReps}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {formatDate(records.maxRepsDate)}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
