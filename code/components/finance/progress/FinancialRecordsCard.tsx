"use client"

import { TrophyIcon } from "@heroicons/react/24/outline"

interface FinancialRecordsData {
  bestIncomeMonth: { value: number; month: string } | null
  lowestExpenseMonth: { value: number; month: string } | null
  bestBalanceMonth: { value: number; month: string } | null
  largestIncome: { value: number; date: string; description: string | null } | null
  largestExpense: { value: number; date: string; description: string | null } | null
}

interface FinancialRecordsCardProps {
  records: FinancialRecordsData | null
}

function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split("-")
  const date = new Date(parseInt(year), parseInt(month) - 1)
  return date.toLocaleDateString("es-MX", { month: "long", year: "numeric" })
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export default function FinancialRecordsCard({ records }: FinancialRecordsCardProps) {
  if (!records) return null

  const hasRecords =
    records.bestIncomeMonth ||
    records.lowestExpenseMonth ||
    records.bestBalanceMonth ||
    records.largestIncome ||
    records.largestExpense

  if (!hasRecords) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 text-center text-gray-500 dark:text-gray-400">
        Sin records financieros aun
      </div>
    )
  }

  return (
    <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <TrophyIcon className="h-5 w-5 text-emerald-500" />
        <h3 className="font-semibold text-gray-900 dark:text-white">
          Records Financieros
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {records.bestIncomeMonth && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-200 dark:border-green-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Mayor Ingreso Mensual
            </p>
            <p className="text-xl font-bold text-green-700 dark:text-green-300">
              ${records.bestIncomeMonth.value.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {formatMonth(records.bestIncomeMonth.month)}
            </p>
          </div>
        )}

        {records.lowestExpenseMonth && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Menor Gasto Mensual
            </p>
            <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
              ${records.lowestExpenseMonth.value.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {formatMonth(records.lowestExpenseMonth.month)}
            </p>
          </div>
        )}

        {records.bestBalanceMonth && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-emerald-200 dark:border-emerald-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Mejor Balance Mensual
            </p>
            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
              ${records.bestBalanceMonth.value.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {formatMonth(records.bestBalanceMonth.month)}
            </p>
          </div>
        )}

        {records.largestIncome && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-200 dark:border-green-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Mayor Ingreso Individual
            </p>
            <p className="text-xl font-bold text-green-700 dark:text-green-300">
              ${records.largestIncome.value.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {formatDate(records.largestIncome.date)}
              {records.largestIncome.description && (
                <span className="block truncate">
                  {records.largestIncome.description}
                </span>
              )}
            </p>
          </div>
        )}

        {records.largestExpense && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-red-200 dark:border-red-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Mayor Gasto Individual
            </p>
            <p className="text-xl font-bold text-red-700 dark:text-red-300">
              ${records.largestExpense.value.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {formatDate(records.largestExpense.date)}
              {records.largestExpense.description && (
                <span className="block truncate">
                  {records.largestExpense.description}
                </span>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
