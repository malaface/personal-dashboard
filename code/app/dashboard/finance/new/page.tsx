import { requireAuth } from "@/lib/auth/utils"
import Link from "next/link"
import TransactionForm from "@/components/finance/TransactionForm"

export default async function NewTransactionPage() {
  await requireAuth()

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <Link
            href="/dashboard/finance"
            className="text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 text-sm"
          >
            ← Volver a Finanzas
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Nueva Transacción</h1>

        <TransactionForm />
      </div>
    </div>
  )
}
