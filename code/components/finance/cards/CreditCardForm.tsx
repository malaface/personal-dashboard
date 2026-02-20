"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createCreditCard, updateCreditCard } from "@/app/dashboard/finance/cards/actions"
import { CheckIcon } from "@heroicons/react/24/outline"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const CARD_COLORS = [
  { value: "#3B82F6", label: "Azul" },
  { value: "#EF4444", label: "Rojo" },
  { value: "#10B981", label: "Verde" },
  { value: "#F59E0B", label: "Amarillo" },
  { value: "#8B5CF6", label: "Morado" },
  { value: "#EC4899", label: "Rosa" },
  { value: "#6366F1", label: "Indigo" },
  { value: "#14B8A6", label: "Teal" },
]

interface CreditCardFormProps {
  card?: {
    id: string
    name: string
    creditLimit: number
    currentBalance: number
    annualInterestRate: number
    cutoffDay: number
    paymentDay: number
    icon?: string | null
    color?: string | null
  }
  onCancel?: () => void
}

export default function CreditCardForm({ card, onCancel }: CreditCardFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [name, setName] = useState(card?.name || "")
  const [creditLimit, setCreditLimit] = useState(card?.creditLimit?.toString() || "")
  const [currentBalance, setCurrentBalance] = useState(card?.currentBalance?.toString() || "0")
  const [annualInterestRate, setAnnualInterestRate] = useState(card?.annualInterestRate?.toString() || "")
  const [cutoffDay, setCutoffDay] = useState(card?.cutoffDay?.toString() || "")
  const [paymentDay, setPaymentDay] = useState(card?.paymentDay?.toString() || "")
  const [color, setColor] = useState(card?.color || "#3B82F6")

  const isEditing = !!card

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("creditLimit", creditLimit)
      formData.append("currentBalance", currentBalance)
      formData.append("annualInterestRate", annualInterestRate)
      formData.append("cutoffDay", cutoffDay)
      formData.append("paymentDay", paymentDay)
      formData.append("icon", "💳")
      formData.append("color", color)

      const result = card
        ? await updateCreditCard(card.id, formData)
        : await createCreditCard(formData)

      if (result.success) {
        router.push("/dashboard/finance/cards")
        router.refresh()
      } else {
        setError(result.error || "Algo salio mal")
      }
    } catch (err: any) {
      setError(err.message || "Error al guardar la tarjeta")
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
          {isEditing ? "Editar Tarjeta" : "Nueva Tarjeta de Credito"}
        </h3>

        <div>
          <Label>Nombre de la Tarjeta *</Label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={100}
            className="mt-1"
            placeholder="Ej: BBVA Oro, Nu, Citibanamex"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Limite de Credito *</Label>
            <Input
              type="number"
              value={creditLimit}
              onChange={(e) => setCreditLimit(e.target.value)}
              required
              min="0"
              step="0.01"
              className="mt-1"
              placeholder="50,000"
            />
          </div>
          <div>
            <Label>Saldo Actual</Label>
            <Input
              type="number"
              value={currentBalance}
              onChange={(e) => setCurrentBalance(e.target.value)}
              min="0"
              step="0.01"
              className="mt-1"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <Label>Tasa de Interes Anual (%) *</Label>
          <Input
            type="number"
            value={annualInterestRate}
            onChange={(e) => setAnnualInterestRate(e.target.value)}
            required
            min="0"
            max="100"
            step="0.01"
            className="mt-1"
            placeholder="36.5"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Dia de Corte (1-31) *</Label>
            <Input
              type="number"
              value={cutoffDay}
              onChange={(e) => setCutoffDay(e.target.value)}
              required
              min="1"
              max="31"
              className="mt-1"
              placeholder="15"
            />
          </div>
          <div>
            <Label>Dia de Pago (1-31) *</Label>
            <Input
              type="number"
              value={paymentDay}
              onChange={(e) => setPaymentDay(e.target.value)}
              required
              min="1"
              max="31"
              className="mt-1"
              placeholder="5"
            />
          </div>
        </div>

        <div>
          <Label>Color</Label>
          <div className="flex gap-2 flex-wrap">
            {CARD_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setColor(c.value)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  color === c.value ? "border-gray-900 dark:border-white scale-110" : "border-transparent"
                }`}
                style={{ backgroundColor: c.value }}
                title={c.label}
              />
            ))}
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
          {loading ? "Guardando..." : isEditing ? "Actualizar Tarjeta" : "Crear Tarjeta"}
        </Button>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="fixed bottom-20 right-6 sm:bottom-10 sm:right-10 z-50 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all hover:bg-blue-700 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        title={isEditing ? "Actualizar tarjeta" : "Guardar tarjeta"}
      >
        <CheckIcon className="h-8 w-8 sm:h-9 sm:w-9 stroke-[2.5]" />
      </button>
    </form>
  )
}
