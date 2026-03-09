"use client"

import { useState } from "react"
import { TrashIcon, PencilIcon } from "@heroicons/react/24/outline"
import SyncButton from "./SyncButton"
import { deleteOnchainWallet, updateOnchainWallet } from "@/app/dashboard/finance/onchain/actions"

interface Wallet {
  id: string
  address: string
  label: string
  network: string
  isActive: boolean
  lastSyncAt: Date | null
  _count: { transactions: number }
}

interface WalletListProps {
  wallets: Wallet[]
}

export default function WalletList({ wallets }: WalletListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editLabel, setEditLabel] = useState("")
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleEdit = (wallet: Wallet) => {
    setEditingId(wallet.id)
    setEditLabel(wallet.label)
  }

  const handleSaveEdit = async (walletId: string) => {
    const formData = new FormData()
    formData.set("label", editLabel)
    await updateOnchainWallet(walletId, formData)
    setEditingId(null)
  }

  const handleDelete = async (walletId: string) => {
    if (!confirm("¿Eliminar esta wallet y todas sus transacciones?")) return
    setDeleting(walletId)
    await deleteOnchainWallet(walletId)
    setDeleting(null)
  }

  if (wallets.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>No hay wallets registradas</p>
        <p className="text-sm mt-1">Agrega una wallet para comenzar a trackear tus operaciones on-chain</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {wallets.map((wallet) => (
        <div
          key={wallet.id}
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              {editingId === wallet.id ? (
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={() => handleSaveEdit(wallet.id)}
                    className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    OK
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                  >
                    X
                  </button>
                </div>
              ) : (
                <h3 className="font-semibold text-gray-900 dark:text-white">{wallet.label}</h3>
              )}
              <p className="text-xs font-mono text-gray-500 dark:text-gray-400 truncate">
                {wallet.address}
              </p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                  {wallet.network}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {wallet._count.transactions} txs
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <SyncButton walletId={wallet.id} lastSyncAt={wallet.lastSyncAt} />
              <button
                onClick={() => handleEdit(wallet)}
                className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                title="Editar"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(wallet.id)}
                disabled={deleting === wallet.id}
                className="p-1.5 rounded-md text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                title="Eliminar"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
