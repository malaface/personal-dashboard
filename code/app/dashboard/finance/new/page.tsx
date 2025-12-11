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
            className="text-green-600 hover:text-green-700 text-sm"
          >
            ← Back to Finance
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-6">New Transaction</h1>

        <TransactionForm />
      </div>
    </div>
  )
}
