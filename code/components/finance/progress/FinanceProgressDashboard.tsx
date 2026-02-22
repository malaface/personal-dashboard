"use client"

import { useState } from "react"
import FinanceFilters, { type FinanceFiltersState } from "./FinanceFilters"
import FinanceProgressChart from "./FinanceProgressChart"
import FinancialRecordsCard from "./FinancialRecordsCard"

interface FinancialRecordsData {
  bestIncomeMonth: { value: number; month: string } | null
  lowestExpenseMonth: { value: number; month: string } | null
  bestBalanceMonth: { value: number; month: string } | null
  largestIncome: { value: number; date: string; description: string | null } | null
  largestExpense: { value: number; date: string; description: string | null } | null
}

export default function FinanceProgressDashboard() {
  const [filters, setFilters] = useState<FinanceFiltersState>({
    categoryId: "",
    typeId: "",
    range: "6m",
    startDate: "",
    endDate: "",
    metric: "amount",
  })
  const [records, setRecords] = useState<FinancialRecordsData | null>(null)

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <FinanceFilters onFiltersChange={setFilters} />
      </div>

      {/* Financial Records */}
      <FinancialRecordsCard records={records} />

      {/* Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <FinanceProgressChart filters={filters} onRecords={setRecords} />
      </div>
    </div>
  )
}
