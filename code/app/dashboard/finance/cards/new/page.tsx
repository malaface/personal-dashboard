import { requireAuth } from "@/lib/auth/utils"
import CreditCardForm from "@/components/finance/cards/CreditCardForm"
import Link from "next/link"

export default async function NewCardPage() {
  await requireAuth()

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Nueva Tarjeta</h1>
          <Link
            href="/dashboard/finance/cards"
            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
          >
            Cancelar
          </Link>
        </div>
        <CreditCardForm onCancel={undefined} />
      </div>
    </div>
  )
}
