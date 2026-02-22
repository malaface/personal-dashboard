"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createFinancialAccount, updateFinancialAccount } from "@/app/dashboard/finance/accounts/actions"
import { CheckIcon } from "@heroicons/react/24/outline"
import { useKeyboardVisible } from "@/lib/hooks/useKeyboardVisible"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

const ACCOUNT_TYPES = [
  { value: "DEBIT_CARD", label: "Tarjeta de Debito", icon: "💳", color: "#3B82F6" },
  { value: "CASH", label: "Efectivo", icon: "💵", color: "#10B981" },
  { value: "SAVINGS", label: "Ahorro", icon: "🏦", color: "#8B5CF6" },
]

interface FinancialAccountFormProps {
  account?: {
    id: string
    accountType: string
    name: string
    balance: number
    currency: string
    icon?: string | null
    color?: string | null
  }
  onCancel?: () => void
}

export default function FinancialAccountForm({ account, onCancel }: FinancialAccountFormProps) {
  const router = useRouter()
  const isKeyboardVisible = useKeyboardVisible()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [accountType, setAccountType] = useState(account?.accountType || "DEBIT_CARD")
  const [name, setName] = useState(account?.name || "")
  const [balance, setBalance] = useState(account?.balance?.toString() || "0")
  const [currency, setCurrency] = useState(account?.currency || "MXN")

  const isEditing = !!account

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("accountType", accountType)
      formData.append("name", name)
      formData.append("balance", balance)
      formData.append("currency", currency)

      const selectedType = ACCOUNT_TYPES.find(t => t.value === accountType)
      if (selectedType) {
        formData.append("icon", selectedType.icon)
        formData.append("color", selectedType.color)
      }

      const result = account
        ? await updateFinancialAccount(account.id, formData)
        : await createFinancialAccount(formData)

      if (result.success) {
        router.push("/dashboard/finance/accounts")
        router.refresh()
      } else {
        setError(result.error || "Algo salio mal")
      }
    } catch (err: any) {
      setError(err.message || "Error al guardar la cuenta")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {isEditing ? "Editar Cuenta" : "Nueva Cuenta Financiera"}
        </h3>

        <div>
          <Label>Tipo de Cuenta *</Label>
          <div className="grid grid-cols-3 gap-3">
            {ACCOUNT_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setAccountType(type.value)}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                  accountType === type.value
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                }`}
              >
                <span className="text-2xl">{type.icon}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>Nombre *</Label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={100}
            className="mt-1"
            placeholder="Ej: BBVA Debito, Cartera, Nu Ahorro"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Balance Inicial</Label>
            <Input
              type="number"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              step="0.01"
              className="mt-1"
              placeholder="0.00"
            />
          </div>
          <div>
            <Label>Moneda</Label>
            <Select value={currency} onValueChange={(v) => setCurrency(v)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MXN">MXN</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Guardando..." : isEditing ? "Actualizar Cuenta" : "Crear Cuenta"}
        </Button>
      </div>

      {!isKeyboardVisible && (
        <button
          type="submit"
          disabled={loading}
          className="fixed bottom-20 right-6 sm:bottom-10 sm:right-10 z-50 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all hover:bg-blue-700 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          title={isEditing ? "Actualizar cuenta" : "Guardar cuenta"}
        >
          <CheckIcon className="h-8 w-8 sm:h-9 sm:w-9 stroke-[2.5]" />
        </button>
      )}
    </form>
  )
}
