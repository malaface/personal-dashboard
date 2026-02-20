"use client"

import { TrophyIcon } from "@heroicons/react/24/outline"

interface NutritionRecordsData {
  bestCaloriesDay: { value: number; date: string } | null
  bestProteinDay: { value: number; date: string } | null
  bestCarbsDay: { value: number; date: string } | null
  bestFatsDay: { value: number; date: string } | null
  mostMealsDay: { value: number; date: string } | null
}

interface NutritionRecordsCardProps {
  records: NutritionRecordsData | null
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export default function NutritionRecordsCard({
  records,
}: NutritionRecordsCardProps) {
  if (!records) return null

  const hasRecords =
    records.bestCaloriesDay ||
    records.bestProteinDay ||
    records.bestCarbsDay ||
    records.bestFatsDay ||
    records.mostMealsDay

  if (!hasRecords) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center text-gray-500 dark:text-gray-400">
        Sin records nutricionales aún
      </div>
    )
  }

  return (
    <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrophyIcon className="h-5 w-5 text-orange-500" />
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Records Nutricionales
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {records.bestCaloriesDay && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-orange-200 dark:border-orange-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Mayor Calorías en un Día
            </p>
            <p className="text-xl font-bold text-orange-700 dark:text-orange-300">
              {records.bestCaloriesDay.value.toLocaleString()} kcal
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {formatDate(records.bestCaloriesDay.date)}
            </p>
          </div>
        )}

        {records.bestProteinDay && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-red-200 dark:border-red-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Mayor Proteína en un Día
            </p>
            <p className="text-xl font-bold text-red-700 dark:text-red-300">
              {records.bestProteinDay.value}g
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {formatDate(records.bestProteinDay.date)}
            </p>
          </div>
        )}

        {records.bestCarbsDay && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Mayor Carbohidratos en un Día
            </p>
            <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
              {records.bestCarbsDay.value}g
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {formatDate(records.bestCarbsDay.date)}
            </p>
          </div>
        )}

        {records.bestFatsDay && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-yellow-200 dark:border-yellow-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Mayor Grasas en un Día
            </p>
            <p className="text-xl font-bold text-yellow-700 dark:text-yellow-300">
              {records.bestFatsDay.value}g
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {formatDate(records.bestFatsDay.date)}
            </p>
          </div>
        )}

        {records.mostMealsDay && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-purple-200 dark:border-purple-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Más Comidas en un Día
            </p>
            <p className="text-xl font-bold text-purple-700 dark:text-purple-300">
              {records.mostMealsDay.value}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {formatDate(records.mostMealsDay.date)}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
