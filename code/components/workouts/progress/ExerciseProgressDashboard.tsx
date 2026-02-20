"use client"

import { useState } from "react"
import ProgressFilters, { type ProgressFiltersState } from "./ProgressFilters"
import ExerciseProgressChart from "./ExerciseProgressChart"
import PersonalRecordsCard from "./PersonalRecordsCard"

interface PersonalRecordsData {
  maxWeight: number | null
  maxWeightDate: string | null
  maxVolume: number
  maxVolumeDate: string | null
  maxReps: number
  maxRepsDate: string | null
}

export default function ExerciseProgressDashboard() {
  const [filters, setFilters] = useState<ProgressFiltersState>({
    exerciseTypeId: "",
    muscleGroupId: "",
    range: "90d",
    startDate: "",
    endDate: "",
    metric: "weight",
  })
  const [personalRecords, setPersonalRecords] = useState<PersonalRecordsData | null>(null)

  return (
    <div className="flex flex-col gap-6">
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <ProgressFilters onFiltersChange={setFilters} />
      </div>

      {/* Personal Records */}
      <div className="relative z-10">
        <PersonalRecordsCard
          records={personalRecords}
          visible={!!filters.exerciseTypeId}
        />
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 min-h-[300px] overflow-x-auto">
        <ExerciseProgressChart
          filters={filters}
          onPersonalRecords={setPersonalRecords}
        />
      </div>
    </div>
  )
}
