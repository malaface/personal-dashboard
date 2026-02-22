"use client"

import { useState } from "react"
import NutritionFilters, { type NutritionFiltersState } from "./NutritionFilters"
import NutritionProgressChart from "./NutritionProgressChart"
import NutritionRecordsCard from "./NutritionRecordsCard"

interface NutritionRecordsData {
  bestCaloriesDay: { value: number; date: string } | null
  bestProteinDay: { value: number; date: string } | null
  bestCarbsDay: { value: number; date: string } | null
  bestFatsDay: { value: number; date: string } | null
  mostMealsDay: { value: number; date: string } | null
}

export default function NutritionProgressDashboard() {
  const [filters, setFilters] = useState<NutritionFiltersState>({
    mealType: "",
    range: "30d",
    startDate: "",
    endDate: "",
    metric: "calories",
  })
  const [records, setRecords] = useState<NutritionRecordsData | null>(null)

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <NutritionFilters onFiltersChange={setFilters} />
      </div>

      {/* Nutrition Records */}
      <NutritionRecordsCard records={records} />

      {/* Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <NutritionProgressChart filters={filters} onRecords={setRecords} />
      </div>
    </div>
  )
}
