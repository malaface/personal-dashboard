"use client"

import { useState, useTransition } from "react"
import { reclassifyTransaction } from "@/app/dashboard/finance/onchain/actions"
import { useRouter } from "next/navigation"

interface TransactionReclassifyProps {
  transactionId: string
  currentType: string
}

const TX_TYPES = [
  { value: "SWAP", label: "Swap" },
  { value: "LP_ADD", label: "LP Add" },
  { value: "LP_REMOVE", label: "LP Remove" },
  { value: "TRANSFER_IN", label: "Transfer In" },
  { value: "TRANSFER_OUT", label: "Transfer Out" },
  { value: "APPROVAL", label: "Approval" },
  { value: "BRIDGE", label: "Bridge" },
  { value: "UNKNOWN", label: "Unknown" },
]

export default function TransactionReclassify({
  transactionId,
  currentType,
}: TransactionReclassifyProps) {
  const [selectedType, setSelectedType] = useState(currentType)
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()

  const handleReclassify = () => {
    if (selectedType === currentType) return

    startTransition(async () => {
      const result = await reclassifyTransaction(transactionId, selectedType)
      if (result.success) {
        setMessage({ type: "success", text: "Transaccion reclasificada correctamente" })
        router.refresh()
      } else {
        setMessage({ type: "error", text: result.error || "Error al reclasificar" })
      }
    })
  }

  return (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        Tipo actual: <span className="font-medium">{currentType}</span>. Selecciona un nuevo tipo si la clasificacion automatica fue incorrecta.
      </p>
      <div className="flex items-center gap-3">
        <select
          value={selectedType}
          onChange={(e) => { setSelectedType(e.target.value); setMessage(null) }}
          className="flex-1 max-w-xs px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
        >
          {TX_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <button
          onClick={handleReclassify}
          disabled={isPending || selectedType === currentType}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? "Guardando..." : "Reclasificar"}
        </button>
      </div>
      {message && (
        <p className={`text-xs mt-2 ${message.type === "success" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
          {message.text}
        </p>
      )}
    </div>
  )
}
