"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createTransaction, updateTransaction } from "@/app/dashboard/finance/actions"

interface TransactionFormProps {
  transaction?: {
    id: string
    type: string
    amount: number
    category: string
    description?: string | null
    date: Date
  }
  onCancel?: () => void
}

const categories = {
  income: ["Salary", "Freelance", "Investment", "Gift", "Other"],
  expense: ["Food", "Transport", "Housing", "Entertainment", "Shopping", "Healthcare", "Other"],
}

export default function TransactionForm({ transaction, onCancel }: TransactionFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [type, setType] = useState<"income" | "expense">(transaction?.type as any || "expense")
  const [amount, setAmount] = useState(transaction?.amount?.toString() || "")
  const [category, setCategory] = useState(transaction?.category || "")
  const [description, setDescription] = useState(transaction?.description || "")
  const [date, setDate] = useState(
    transaction?.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("type", type)
      formData.append("amount", amount)
      formData.append("category", category)
      if (description) formData.append("description", description)
      formData.append("date", date)

      const result = transaction
        ? await updateTransaction(transaction.id, formData)
        : await createTransaction(formData)

      if (result.success) {
        router.push("/dashboard/finance")
        router.refresh()
      } else {
        setError(result.error || "Something went wrong")
      }
    } catch (err: any) {
      setError(err.message || "Failed to save transaction")
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
        <h3 className="text-lg font-semibold">Transaction Details</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type *
            </label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value as "income" | "expense")
                setCategory("") // Reset category when type changes
              }}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount *
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select category</option>
              {categories[type].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            maxLength={200}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Optional notes..."
          />
        </div>
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
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : transaction ? "Update Transaction" : "Create Transaction"}
        </button>
      </div>
    </form>
  )
}
