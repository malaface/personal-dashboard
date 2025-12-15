"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteTransaction } from "@/app/dashboard/finance/actions"
import { TrashIcon, PencilIcon, ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline"

interface Transaction {
  id: string
  type: string | null
  typeId?: string | null
  category: string | null
  categoryId?: string | null
  amount: number
  description?: string | null
  date: Date
}

interface TransactionListProps {
  transactions: Transaction[]
}

export default function TransactionList({ transactions }: TransactionListProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (transactionId: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return

    setDeletingId(transactionId)

    try {
      const result = await deleteTransaction(transactionId)

      if (result.success) {
        router.refresh()
      } else {
        alert(result.error || "Failed to delete transaction")
      }
    } catch (error) {
      alert("An error occurred")
    } finally {
      setDeletingId(null)
    }
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-gray-500 text-lg">No transactions yet</p>
        <p className="text-gray-400 mt-2">Create your first transaction to get started</p>
      </div>
    )
  }

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
  const balance = totalIncome - totalExpense

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-green-600">Total Income</p>
          <p className="text-2xl font-bold text-green-700">${totalIncome.toFixed(2)}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">Total Expense</p>
          <p className="text-2xl font-bold text-red-700">${totalExpense.toFixed(2)}</p>
        </div>
        <div className={`border rounded-lg p-4 ${balance >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
          <p className={`text-sm ${balance >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>Balance</p>
          <p className={`text-2xl font-bold ${balance >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>${balance.toFixed(2)}</p>
        </div>
      </div>

      <div className="space-y-3">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  {transaction.type === 'income' ? (
                    <ArrowUpIcon className="h-5 w-5 text-green-600" />
                  ) : (
                    <ArrowDownIcon className="h-5 w-5 text-red-600" />
                  )}
                  <h3 className="text-lg font-semibold text-gray-900">{transaction.category}</h3>
                  <span className={`text-lg font-bold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mt-1">
                  {new Date(transaction.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
                {transaction.description && (
                  <p className="text-gray-600 text-sm mt-2">{transaction.description}</p>
                )}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => router.push(`/dashboard/finance/${transaction.id}/edit`)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition"
                  title="Edit transaction"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(transaction.id)}
                  disabled={deletingId === transaction.id}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition disabled:opacity-50"
                  title="Delete transaction"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
