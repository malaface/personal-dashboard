"use client"

import { useState } from "react"
import { ArrowPathIcon } from "@heroicons/react/24/outline"
import { triggerWalletSync } from "@/app/dashboard/finance/onchain/actions"

interface SyncButtonProps {
  walletId: string
  lastSyncAt: Date | null
}

export default function SyncButton({ walletId, lastSyncAt }: SyncButtonProps) {
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleSync = async () => {
    setSyncing(true)
    setResult(null)

    try {
      const res = await triggerWalletSync(walletId)
      if (res.success) {
        setResult(`${"newTransactions" in res ? res.newTransactions : 0} nuevas transacciones`)
      } else {
        setResult(("error" in res ? res.error : null) || "Error al sincronizar")
      }
    } catch {
      setResult("Error al sincronizar")
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleSync}
        disabled={syncing}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ArrowPathIcon className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
        {syncing ? "Sincronizando..." : "Sync"}
      </button>
      {result && (
        <span className="text-xs text-gray-500 dark:text-gray-400">{result}</span>
      )}
      {lastSyncAt && !result && (
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {new Date(lastSyncAt).toLocaleDateString("es-MX", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      )}
    </div>
  )
}
