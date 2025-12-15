"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { createBudget, updateBudget } from "@/app/dashboard/finance/actions"
import CategorySelector from "@/components/catalog/CategorySelector"

interface BudgetFormProps {
  budget?: {
    id: string
    categoryId?: string | null
    // Legacy field (for backward compatibility during migration)
    category?: string | null
    limit: number
    month: Date
    spent?: number
  }
  onCancel?: () => void
}

export default function BudgetForm({ budget, onCancel }: BudgetFormProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [categoryId, setCategoryId] = useState(budget?.categoryId || budget?.category || "")
  const [limit, setLimit] = useState(budget?.limit?.toString() || "")
  const [month, setMonth] = useState(
    budget?.month
      ? new Date(budget.month).toISOString().substring(0, 7) // YYYY-MM format
      : new Date().toISOString().substring(0, 7)
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("categoryId", categoryId)
      formData.append("limit", limit)
      formData.append("month", month + "-01") // Convert YYYY-MM to YYYY-MM-01

      const result = budget
        ? await updateBudget(budget.id, formData)
        : await createBudget(formData)

      if (result.success) {
        router.push("/dashboard/budgets")
        router.refresh()
      } else {
        setError(result.error || "Something went wrong")
      }
    } catch (err: any) {
      setError(err.message || "Failed to save budget")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold">Budget Details</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category *
          </label>
          <CategorySelector
            catalogType="transaction_category"
            value={categoryId}
            onChange={(id) => setCategoryId(id)}
            placeholder="Select expense category"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Select the expense category to budget for (e.g., Food, Transport, etc.)
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Limit *
            </label>
            <input
              type="number"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum amount to spend in this category
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Month *
            </label>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Month and year for this budget
            </p>
          </div>
        </div>

        {budget && budget.spent !== undefined && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-blue-600 font-medium">Current Spending</p>
                <p className="text-2xl font-bold text-blue-700">${budget.spent.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium">Remaining</p>
                <p className={`text-2xl font-bold ${
                  budget.limit - budget.spent >= 0 ? 'text-green-700' : 'text-red-700'
                }`}>
                  ${(budget.limit - budget.spent).toFixed(2)}
                </p>
              </div>
            </div>
            <div className="mt-3">
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    (budget.spent / budget.limit) * 100 > 100 ? 'bg-red-600' : 'bg-blue-600'
                  }`}
                  style={{
                    width: `${Math.min((budget.spent / budget.limit) * 100, 100)}%`
                  }}
                />
              </div>
              <p className="text-xs text-blue-600 mt-1 text-right">
                {((budget.spent / budget.limit) * 100).toFixed(1)}% used
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : budget ? "Update Budget" : "Create Budget"}
        </button>
      </div>
    </form>
  )
}
