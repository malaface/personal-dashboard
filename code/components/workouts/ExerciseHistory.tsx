"use client"

import { useState, useEffect } from "react"
import {
  ArrowUpIcon,
  ArrowDownIcon,
  TrophyIcon,
  ClockIcon,
} from "@heroicons/react/24/outline"

interface LastPerformanceData {
  found: boolean
  lastWorkout?: {
    date: string
    daysAgo: number
    sets: number
    reps: number
    weight: number | null
    volume: number
    workoutName: string
  }
  personalRecord?: {
    maxWeight: number | null
    maxWeightDate: string | null
    maxVolume: number
    maxVolumeDate: string | null
    maxReps: number
    maxRepsDate: string | null
  }
}

interface ExerciseHistoryProps {
  exerciseTypeId: string | null
  currentSets: number
  currentReps: number
  currentWeight: number | null
  onUseLastValues: (sets: number, reps: number, weight: number | null) => void
}

export default function ExerciseHistory({
  exerciseTypeId,
  currentSets,
  currentReps,
  currentWeight,
  onUseLastValues,
}: ExerciseHistoryProps) {
  const [data, setData] = useState<LastPerformanceData | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!exerciseTypeId) {
      setData(null)
      return
    }

    const fetchData = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/exercises/${exerciseTypeId}/last`)
        if (response.ok) {
          const result = await response.json()
          setData(result)
        }
      } catch (error) {
        console.error("Error fetching exercise history:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [exerciseTypeId])

  if (!exerciseTypeId || loading) {
    return null
  }

  if (!data?.found || !data.lastWorkout) {
    return (
      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        Primera vez realizando este ejercicio
      </div>
    )
  }

  const { lastWorkout, personalRecord } = data
  const currentVolume = currentSets * currentReps * (currentWeight || 0)
  const volumeChange = currentVolume - lastWorkout.volume
  const isImproving = volumeChange > 0
  const isDecreasing = volumeChange < 0

  // Check if current values would be a PR
  const isNewWeightPR =
    currentWeight !== null &&
    personalRecord?.maxWeight !== null &&
    currentWeight > (personalRecord?.maxWeight || 0)
  const isNewVolumePR = currentVolume > (personalRecord?.maxVolume || 0)

  return (
    <div className="mt-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
      {/* Last Performance */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <ClockIcon className="h-4 w-4" />
          <span>
            Última vez ({lastWorkout.daysAgo === 0 ? "hoy" : `hace ${lastWorkout.daysAgo} día${lastWorkout.daysAgo !== 1 ? "s" : ""}`}):
          </span>
        </div>
        {currentVolume > 0 && (
          <div className="flex items-center gap-1">
            {isImproving && (
              <span className="flex items-center text-green-600 dark:text-green-400 text-sm font-medium">
                <ArrowUpIcon className="h-3 w-3 mr-0.5" />
                +{Math.abs(Math.round(volumeChange))}
              </span>
            )}
            {isDecreasing && (
              <span className="flex items-center text-red-600 dark:text-red-400 text-sm font-medium">
                <ArrowDownIcon className="h-3 w-3 mr-0.5" />
                {Math.round(volumeChange)}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div className="text-gray-900 dark:text-white font-medium">
          {lastWorkout.weight !== null ? `${lastWorkout.weight}kg` : "Sin peso"} × {lastWorkout.reps} × {lastWorkout.sets} sets
          <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
            (Vol: {Math.round(lastWorkout.volume)})
          </span>
        </div>
        <button
          type="button"
          onClick={() =>
            onUseLastValues(lastWorkout.sets, lastWorkout.reps, lastWorkout.weight)
          }
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
        >
          Usar estos valores
        </button>
      </div>

      {/* Personal Records */}
      {personalRecord && (personalRecord.maxWeight || personalRecord.maxVolume > 0) && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
            <TrophyIcon className="h-4 w-4 text-yellow-500" />
            <span>Records Personales:</span>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            {personalRecord.maxWeight !== null && (
              <div
                className={`px-2 py-1 rounded ${
                  isNewWeightPR
                    ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                }`}
              >
                <span className="font-medium">Peso:</span> {personalRecord.maxWeight}kg
                {isNewWeightPR && " (Nuevo PR!)"}
              </div>
            )}
            {personalRecord.maxVolume > 0 && (
              <div
                className={`px-2 py-1 rounded ${
                  isNewVolumePR
                    ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                }`}
              >
                <span className="font-medium">Volumen:</span> {Math.round(personalRecord.maxVolume)}
                {isNewVolumePR && " (Nuevo PR!)"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
