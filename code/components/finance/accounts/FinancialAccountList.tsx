"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { deleteFinancialAccount } from "@/app/dashboard/finance/accounts/actions"
import { TrashIcon, PencilIcon, PlusIcon, BanknotesIcon } from "@heroicons/react/24/outline"

const ACCOUNT_TYPE_CONFIG: Record<string, { label: string; icon: string; bgColor: string; textColor: string; borderColor: string }> = {
  DEBIT_CARD: { label: "Debito", icon: "💳", bgColor: "bg-blue-50 dark:bg-blue-900/20", textColor: "text-blue-700 dark:text-blue-300", borderColor: "border-blue-200 dark:border-blue-700" },
  CASH: { label: "Efectivo", icon: "💵", bgColor: "bg-green-50 dark:bg-green-900/20", textColor: "text-green-700 dark:text-green-300", borderColor: "border-green-200 dark:border-green-700" },
  SAVINGS: { label: "Ahorro", icon: "🏦", bgColor: "bg-purple-50 dark:bg-purple-900/20", textColor: "text-purple-700 dark:text-purple-300", borderColor: "border-purple-200 dark:border-purple-700" },
}

interface FinancialAccount {
  id: string
  accountType: string
  name: string
  balance: number
  currency: string
  icon?: string | null
  color?: string | null
  isActive: boolean
}

interface FinancialAccountListProps {
  accounts: FinancialAccount[]
}

export default function FinancialAccountList({ accounts }: FinancialAccountListProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)

  const handleDelete = async (accountId: string) => {
    if (!confirm("¿Estas seguro de que quieres eliminar esta cuenta?")) return

    setDeletingId(accountId)
    try {
      const result = await deleteFinancialAccount(accountId)
      if (result.success) {
        router.refresh()
      } else {
        alert(result.error || "Error al eliminar cuenta")
      }
    } catch {
      alert("Ocurrio un error")
    } finally {
      setDeletingId(null)
    }
  }

  if (accounts.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
        <BanknotesIcon className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">Sin cuentas registradas</p>
        <p className="text-gray-400 dark:text-gray-500 mt-2">Agrega tu primera cuenta financiera</p>
        <Link
          href="/dashboard/finance/accounts/new"
          className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          <PlusIcon className="h-5 w-5" />
          Nueva Cuenta
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Balance Total */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 text-white">
        <p className="text-blue-100 text-sm font-medium">Balance Total</p>
        <p className="text-3xl font-bold mt-1">${totalBalance.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</p>
        <p className="text-blue-200 text-sm mt-1">{accounts.length} cuenta{accounts.length !== 1 ? "s" : ""} activa{accounts.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Account Cards */}
      <div className="space-y-3">
        {accounts.map((account) => {
          const config = ACCOUNT_TYPE_CONFIG[account.accountType] || ACCOUNT_TYPE_CONFIG.DEBIT_CARD
          return (
            <div key={account.id} className={`${config.bgColor} border ${config.borderColor} rounded-lg p-4`}>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{account.icon || config.icon}</span>
                    <div>
                      <h3 className={`font-semibold ${config.textColor}`}>{account.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{config.label}</p>
                    </div>
                  </div>
                  <p className={`text-2xl font-bold mt-2 ${config.textColor}`}>
                    ${account.balance.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                    <span className="text-sm font-normal ml-1">{account.currency}</span>
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => router.push(`/dashboard/finance/accounts/${account.id}/edit`)}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-md transition"
                    title="Editar cuenta"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(account.id)}
                    disabled={deletingId === account.id}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-md transition disabled:opacity-50"
                    title="Eliminar cuenta"
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
