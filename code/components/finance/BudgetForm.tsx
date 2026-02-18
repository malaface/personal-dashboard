"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { createBudget, updateBudget } from "@/app/dashboard/finance/actions"
import CategorySelector from "@/components/catalog/CategorySelector"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

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
          <Label>Category *</Label>
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
            <Label>Monthly Limit *</Label>
            <Input
              type="number"
              value={limit}
              onChange={(e) => setLimit(e.target.value)}
              required
              min="0"
              step="0.01"
              placeholder="0.00"
            />
            <p className="text-xs text-gray-500 mt-1">
              Maximum amount to spend in this category
            </p>
          </div>

          <div>
            <Label>Month *</Label>
            <Input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              required
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
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : budget ? "Update Budget" : "Create Budget"}
        </Button>
      </div>
    </form>
  )
}
