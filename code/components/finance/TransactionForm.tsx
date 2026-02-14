"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { createTransaction, updateTransaction } from "@/app/dashboard/finance/actions"
import CategorySelector from "@/components/catalog/CategorySelector"
import QuickCategoryBar from "@/components/finance/QuickCategoryBar"
import AccountSelector from "@/components/finance/accounts/AccountSelector"
import CreditCardSelector from "@/components/finance/cards/CreditCardSelector"
import { CheckIcon } from "@heroicons/react/24/outline"

interface TransactionFormProps {
  transaction?: {
    id: string
    typeId?: string | null
    categoryId?: string | null
    type?: string | null
    category?: string | null
    amount: number
    currency?: string
    description?: string | null
    date: Date
    fromAccountId?: string | null
    creditCardId?: string | null
    toAccountId?: string | null
  }
  onCancel?: () => void
}

interface AccountData {
  id: string
  accountType: string
  name: string
  balance: number
  currency: string
  icon?: string | null
}

interface CreditCardData {
  id: string
  name: string
  creditLimit: number
  currentBalance: number
  cutoffDay: number
  paymentDay: number
  color?: string | null
}

export default function TransactionForm({ transaction, onCancel }: TransactionFormProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [typeId, setTypeId] = useState(transaction?.typeId || transaction?.type || "")
  const [categoryId, setCategoryId] = useState(transaction?.categoryId || transaction?.category || "")
  const [amount, setAmount] = useState(transaction?.amount?.toString() || "")
  const [currency, setCurrency] = useState(transaction?.currency || "MXN")
  const [description, setDescription] = useState(transaction?.description || "")
  const [date, setDate] = useState(
    transaction?.date ? new Date(transaction.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  )

  // Funding source state
  const [fundingSource, setFundingSource] = useState<"account" | "card">(
    transaction?.creditCardId ? "card" : "account"
  )
  const [fromAccountId, setFromAccountId] = useState(transaction?.fromAccountId || "")
  const [creditCardId, setCreditCardId] = useState(transaction?.creditCardId || "")
  const [toAccountId, setToAccountId] = useState(transaction?.toAccountId || "")

  // Available accounts and cards
  const [accounts, setAccounts] = useState<AccountData[]>([])
  const [cards, setCards] = useState<CreditCardData[]>([])
  const [loadingFunding, setLoadingFunding] = useState(true)

  const isEditing = !!transaction

  // Get parent type for cascading category selection
  const [selectedTypeItem, setSelectedTypeItem] = useState<any>(null)

  // Check if current type is "Transferencia"
  const isTransfer = selectedTypeItem?.slug === "transferencia" || selectedTypeItem?.name?.toLowerCase().includes("transferencia")

  const handleQuickSelect = (quickTypeId: string, quickCategoryId: string, lastAmount: number | null) => {
    setTypeId(quickTypeId)
    setCategoryId(quickCategoryId)
    if (!amount && lastAmount !== null) {
      setAmount(lastAmount.toString())
    }
  }

  // Fetch accounts and cards
  useEffect(() => {
    async function fetchFundingSources() {
      try {
        const [accRes, cardRes] = await Promise.all([
          fetch("/api/finance/accounts/list"),
          fetch("/api/finance/cards/list"),
        ])
        const accData = await accRes.json()
        const cardData = await cardRes.json()
        setAccounts(accData.accounts || [])
        setCards(cardData.cards || [])
      } catch {
        // Silently fail
      } finally {
        setLoadingFunding(false)
      }
    }
    fetchFundingSources()
  }, [])

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
        setCategoryId("")
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
      formData.append("currency", currency)
      formData.append("categoryId", categoryId)
      if (description) formData.append("description", description)
      formData.append("date", date)

      // Funding source
      if (fundingSource === "account" && fromAccountId) {
        formData.append("fromAccountId", fromAccountId)
      }
      if (fundingSource === "card" && creditCardId) {
        formData.append("creditCardId", creditCardId)
      }
      if (isTransfer && toAccountId) {
        formData.append("toAccountId", toAccountId)
      }

      const result = transaction
        ? await updateTransaction(transaction.id, formData)
        : await createTransaction(formData)

      if (result.success) {
        router.push("/dashboard/finance")
        router.refresh()
      } else {
        setError(result.error || "Algo salio mal")
      }
    } catch (err: any) {
      setError(err.message || "Error al guardar la transaccion")
    } finally {
      setLoading(false)
    }
  }

  const hasFundingSources = accounts.length > 0 || cards.length > 0

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {!isEditing && (
        <QuickCategoryBar onQuickSelect={handleQuickSelect} />
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Detalles de la Transaccion</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo *
            </label>
            <CategorySelector
              catalogType="transaction_category"
              value={typeId}
              onChange={(id) => setTypeId(id)}
              placeholder="Seleccionar tipo"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Seleccionar tipo de transaccion
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Monto *
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                min="0"
                step="0.01"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="px-2 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-20"
              >
                <option value="MXN">MXN</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Categoria *
            </label>
            <CategorySelector
              catalogType="transaction_category"
              value={categoryId}
              onChange={(id) => setCategoryId(id)}
              parentId={typeId}
              placeholder={typeId ? "Seleccionar categoria" : "Seleccionar tipo primero"}
              required
              disabled={!typeId}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {typeId ? "Seleccionar una categoria especifica" : "Elige un tipo primero para ver las categorias"}
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
            Descripcion
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

      {/* Funding Source Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Origen de Fondos</h3>

        {!loadingFunding && !hasFundingSources && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-400 px-4 py-3 rounded-md text-sm">
            No tienes cuentas ni tarjetas registradas. Puedes{" "}
            <a href="/dashboard/finance/accounts/new" className="underline font-medium">crear una cuenta</a>{" "}
            o{" "}
            <a href="/dashboard/finance/cards/new" className="underline font-medium">agregar una tarjeta</a>{" "}
            para asociar tus transacciones.
          </div>
        )}

        {hasFundingSources && (
          <>
            <div className="flex gap-2">
              {accounts.length > 0 && (
                <button
                  type="button"
                  onClick={() => { setFundingSource("account"); setCreditCardId("") }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    fundingSource === "account"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  Cuenta
                </button>
              )}
              {cards.length > 0 && (
                <button
                  type="button"
                  onClick={() => { setFundingSource("card"); setFromAccountId("") }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    fundingSource === "card"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  Tarjeta de Credito
                </button>
              )}
            </div>

            {fundingSource === "account" && accounts.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cuenta de Origen
                </label>
                <AccountSelector
                  accounts={accounts}
                  value={fromAccountId}
                  onChange={(id) => setFromAccountId(id)}
                  placeholder="Seleccionar cuenta"
                />
              </div>
            )}

            {fundingSource === "card" && cards.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tarjeta de Credito
                </label>
                <CreditCardSelector
                  cards={cards}
                  value={creditCardId}
                  onChange={(id) => setCreditCardId(id)}
                  placeholder="Seleccionar tarjeta"
                />
              </div>
            )}

            {isTransfer && accounts.length > 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Cuenta Destino
                </label>
                <AccountSelector
                  accounts={accounts.filter(a => a.id !== fromAccountId)}
                  value={toAccountId}
                  onChange={(id) => setToAccountId(id)}
                  placeholder="Seleccionar cuenta destino"
                />
              </div>
            )}
          </>
        )}
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
          {loading ? "Guardando..." : transaction ? "Actualizar Transaccion" : "Crear Transaccion"}
        </button>
      </div>

      {/* Floating Action Button - Submit */}
      <button
        type="submit"
        disabled={loading}
        className="
          fixed bottom-20 right-6 sm:bottom-10 sm:right-10
          z-50 flex h-14 w-14 sm:h-16 sm:w-16
          items-center justify-center
          rounded-full bg-green-600 text-white
          shadow-[0_8px_30px_rgb(0,0,0,0.12)]
          transition-all
          hover:bg-green-700 hover:scale-110
          active:scale-95
          focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
        "
        title={transaction ? "Actualizar transaccion" : "Guardar transaccion"}
      >
        <CheckIcon className="h-8 w-8 sm:h-9 sm:w-9 stroke-[2.5]" />
      </button>
    </form>
  )
}
