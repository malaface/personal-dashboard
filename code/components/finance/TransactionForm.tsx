"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { createTransaction, updateTransaction } from "@/app/dashboard/finance/actions"
import CategorySelector from "@/components/catalog/CategorySelector"

interface TransactionFormProps {
  transaction?: {
    id: string
    typeId?: string | null
    categoryId?: string | null
    // Legacy fields (for backward compatibility during migration)
    type?: string | null
    category?: string | null
    amount: number
    description?: string | null
    date: Date
  }
  onCancel?: () => void
}

export default function TransactionForm({ transaction, onCancel }: TransactionFormProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [typeId, setTypeId] = useState(transaction?.typeId || transaction?.type || "")
  const [categoryId, setCategoryId] = useState(transaction?.categoryId || transaction?.category || "")
  const [amount, setAmount] = useState(transaction?.amount?.toString() || "")
  const [description, setDescription] = useState(transaction?.description || "")
  const [date, setDate] = useState(
    transaction?.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  )

  // Get parent type for cascading category selection
  const [selectedTypeItem, setSelectedTypeItem] = useState<any>(null)

  useEffect(() => {
    async function fetchTypeItem() {
      if (typeId) {
        try {
          const response = await fetch(`/api/catalog/${typeId}`)
          const data = await response.json()
          if (data.item) {
            setSelectedTypeItem(data.item)
          }
        } catch (err) {
          console.error("Failed to fetch type item:", err)
        }
      } else {
        setSelectedTypeItem(null)
        setCategoryId("") // Reset category when type changes
      }
    }
    fetchTypeItem()
  }, [typeId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("typeId", typeId)
      formData.append("amount", amount)
      formData.append("categoryId", categoryId)
      if (description) formData.append("description", description)
      formData.append("date", date)

      const result = transaction
        ? await updateTransaction(transaction.id, formData)
        : await createTransaction(formData)

      if (result.success) {
        router.push("/dashboard/finance")
        router.refresh()
      } else {
        setError(result.error || "Algo salió mal")
      }
    } catch (err: any) {
      setError(err.message || "Error al guardar la transacción")
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

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Detalles de la Transacción</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo *
            </label>
            <CategorySelector
              catalogType="transaction_category"
              value={typeId}
              onChange={(id) => setTypeId(id)}
              placeholder="Seleccionar tipo (Ingreso/Gasto)"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Seleccionar Ingreso o Gasto
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Monto *
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Categoría *
            </label>
            <CategorySelector
              catalogType="transaction_category"
              value={categoryId}
              onChange={(id) => setCategoryId(id)}
              parentId={typeId}
              placeholder={typeId ? "Seleccionar categoría" : "Seleccionar tipo primero"}
              required
              disabled={!typeId}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {typeId ? "Seleccionar una categoría específica" : "Elige un tipo primero para ver las categorías"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Fecha *
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Descripción
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            maxLength={200}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Notas opcionales..."
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Guardando..." : transaction ? "Actualizar Transacción" : "Crear Transacción"}
        </button>
      </div>
    </form>
  )
}
