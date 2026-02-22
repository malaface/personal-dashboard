import { requireAuth } from "@/lib/auth/utils"
import FinancialAccountForm from "@/components/finance/accounts/FinancialAccountForm"
import Link from "next/link"

export default async function NewAccountPage() {
  await requireAuth()

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Nueva Cuenta</h1>
          <Link
            href="/dashboard/finance/accounts"
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
          >
            Cancelar
          </Link>
        </div>
        <FinancialAccountForm onCancel={undefined} />
      </div>
    </div>
  )
}
