"use client"

import { calculateDaysToPayment } from "@/lib/finance/card-utils"

interface CreditCardData {
  id: string
  name: string
  creditLimit: number
  currentBalance: number
  cutoffDay: number
  paymentDay: number
  color?: string | null
}

interface CreditCardSelectorProps {
  cards: CreditCardData[]
  value: string
  onChange: (id: string) => void
  placeholder?: string
  disabled?: boolean
  required?: boolean
}

export default function CreditCardSelector({
  cards,
  value,
  onChange,
  placeholder = "Seleccionar tarjeta",
  disabled = false,
  required = false,
}: CreditCardSelectorProps) {
  const today = new Date()

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      required={required}
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
    >
      <option value="">{placeholder}</option>
      {cards.map((card) => {
        const available = card.creditLimit - card.currentBalance
        const days = calculateDaysToPayment(card.cutoffDay, card.paymentDay, today)
        return (
          <option key={card.id} value={card.id}>
            💳 {card.name} - Disp: ${available.toLocaleString("es-MX", { minimumFractionDigits: 2 })} ({days}d para pagar)
          </option>
        )
      })}
    </select>
  )
}
