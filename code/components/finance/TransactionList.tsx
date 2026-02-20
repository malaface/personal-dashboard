"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { deleteTransaction } from "@/app/dashboard/finance/actions"
import { TrashIcon, PencilIcon, ArrowUpIcon, ArrowDownIcon, CurrencyDollarIcon, PlusIcon } from "@heroicons/react/24/outline"

interface Transaction {
  id: string
  type: string | null
  typeId?: string | null
  category: string | null
  categoryId?: string | null
  typeItem?: { id: string; name: string } | null
  categoryItem?: { id: string; name: string } | null
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
    if (!confirm("¿Estás seguro de que quieres eliminar esta transacción?")) return

    setDeletingId(transactionId)

    try {
      const result = await deleteTransaction(transactionId)

      if (result.success) {
        router.refresh()
      } else {
        alert(result.error || "Error al eliminar transacción")
      }
    } catch {
      alert("Ocurrió un error")
    } finally {
      setDeletingId(null)
    }
  }

  // Helper to determine if a transaction is income (positive)
  const isIncome = (t: Transaction) => {
    if (t.typeItem?.name) {
      const name = t.typeItem.name.toLowerCase()
      return (
        name.includes("ingreso") ||
        name.includes("income") ||
        name.includes("reembolso") ||
        name.includes("devolucion")
      )
    }
    return t.type === "income"
  }

  // Helper to get display name for category
  const getCategoryName = (t: Transaction) => {
    return t.categoryItem?.name || t.category || "Sin categoría"
  }

  // Helper to get display name for type
  const getTypeName = (t: Transaction) => {
    return t.typeItem?.name || t.type || "Sin tipo"
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
        <CurrencyDollarIcon className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">Sin transacciones aún</p>
        <p className="text-gray-400 dark:text-gray-500 mt-2">Registra tu primera transacción para comenzar</p>
        <Link
          href="/dashboard/finance/new"
          className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
        >
          <PlusIcon className="h-5 w-5" />
          Nueva Transacción
        </Link>
      </div>
    )
  }

  const totalIncome = transactions.filter(t => isIncome(t)).reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = transactions.filter(t => !isIncome(t)).reduce((sum, t) => sum + t.amount, 0)
  const balance = totalIncome - totalExpense

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
          <p className="text-sm text-green-600 dark:text-green-400">Ingresos Totales</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300">${totalIncome.toFixed(2)}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
          <p className="text-sm text-red-600 dark:text-red-400">Gastos Totales</p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-300">${totalExpense.toFixed(2)}</p>
        </div>
        <div className={`border rounded-lg p-4 ${
          balance >= 0
            ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700"
            : "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700"
        }`}>
          <p className={`text-sm ${
            balance >= 0
              ? "text-blue-600 dark:text-blue-400"
              : "text-orange-600 dark:text-orange-400"
          }`}>Balance</p>
          <p className={`text-2xl font-bold ${
            balance >= 0
              ? "text-blue-700 dark:text-blue-300"
              : "text-orange-700 dark:text-orange-300"
          }`}>${balance.toFixed(2)}</p>
        </div>
      </div>

      <div className="space-y-3">
        {transactions.map((transaction) => {
          const income = isIncome(transaction)
          return (
            <div key={transaction.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    {income ? (
                      <ArrowUpIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <ArrowDownIcon className="h-5 w-5 text-red-600 dark:text-red-400" />
                    )}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {getCategoryName(transaction)}
                    </h3>
                    <span className={`text-lg font-bold ${
                      income ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                    }`}>
                      {income ? "+" : "-"}${transaction.amount.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    {new Date(transaction.date).toLocaleDateString("es-MX", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  {transaction.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">{transaction.description}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => router.push(`/dashboard/finance/${transaction.id}/edit`)}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition"
                    title="Editar transacción"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    disabled={deletingId === transaction.id}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition disabled:opacity-50"
                    title="Eliminar transacción"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
