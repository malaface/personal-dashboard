"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { deleteCreditCard } from "@/app/dashboard/finance/cards/actions"
import { calculateDaysToPayment, isAfterCutoff } from "@/lib/finance/card-utils"
import { TrashIcon, PencilIcon, PlusIcon, CreditCardIcon } from "@heroicons/react/24/outline"

interface CreditCardData {
  id: string
  name: string
  creditLimit: number
  currentBalance: number
  annualInterestRate: number
  cutoffDay: number
  paymentDay: number
  icon?: string | null
  color?: string | null
  isActive: boolean
}

interface CreditCardListProps {
  cards: CreditCardData[]
}

export default function CreditCardList({ cards }: CreditCardListProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (cardId: string) => {
    if (!confirm("¿Estas seguro de que quieres eliminar esta tarjeta?")) return

    setDeletingId(cardId)
    try {
      const result = await deleteCreditCard(cardId)
      if (result.success) {
        router.refresh()
      } else {
        alert(result.error || "Error al eliminar tarjeta")
      }
    } catch {
      alert("Ocurrio un error")
    } finally {
      setDeletingId(null)
    }
  }

  if (cards.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
        <CreditCardIcon className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">Sin tarjetas registradas</p>
        <p className="text-gray-400 dark:text-gray-500 mt-2">Agrega tu primera tarjeta de credito</p>
        <Link
          href="/dashboard/finance/cards/new"
          className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          <PlusIcon className="h-5 w-5" />
          Nueva Tarjeta
        </Link>
      </div>
    )
  }

  const today = new Date()

  return (
    <div className="space-y-3">
      {cards.map((card) => {
        const availableCredit = card.creditLimit - card.currentBalance
        const usagePercent = (card.currentBalance / card.creditLimit) * 100
        const daysToPayment = calculateDaysToPayment(card.cutoffDay, card.paymentDay, today)
        const afterCutoff = isAfterCutoff(card.cutoffDay, today)
        const cardColor = card.color || "#3B82F6"

        return (
          <div key={card.id} className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
            {/* Color strip at top */}
            <div className="h-1.5" style={{ backgroundColor: cardColor }} />

            <div className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💳</span>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{card.name}</h3>
                    {afterCutoff && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                        Post-corte
                      </span>
                    )}
                  </div>

                  {/* Credit usage bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500 dark:text-gray-400">
                        Disponible: <span className="font-semibold text-gray-900 dark:text-white">${availableCredit.toLocaleString("es-MX", { minimumFractionDigits: 2 })}</span>
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        Limite: ${card.creditLimit.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min(usagePercent, 100)}%`,
                          backgroundColor: usagePercent > 80 ? "#EF4444" : usagePercent > 50 ? "#F59E0B" : cardColor,
                        }}
                      />
                    </div>
                  </div>

                  {/* Days to payment */}
                  <div className="mt-3 flex items-center gap-4 text-sm">
                    <div className={`px-3 py-1 rounded-full font-medium ${
                      afterCutoff
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    }`}>
                      {daysToPayment} dias para pagar
                    </div>
                    <span className="text-gray-400 dark:text-gray-500">
                      Corte: {card.cutoffDay} | Pago: {card.paymentDay} | TAE: {card.annualInterestRate}%
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2 ml-2">
                  <button
                    onClick={() => router.push(`/dashboard/finance/cards/${card.id}/edit`)}
                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition"
                    title="Editar tarjeta"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(card.id)}
                    disabled={deletingId === card.id}
                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition disabled:opacity-50"
                    title="Eliminar tarjeta"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
