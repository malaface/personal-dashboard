import { requireAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/db/prisma"
import Link from "next/link"
import TransactionList from "@/components/finance/TransactionList"

export default async function FinancePage() {
  const user = await requireAuth()

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
    },
    include: {
      typeItem: true,
      categoryItem: true,
    },
    orderBy: {
      date: "desc",
    },
  })

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Finanzas</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Administra tus transacciones e inversiones</p>
          </div>
          <Link
            href="/dashboard/finance/progress"
            className="px-4 py-2 border border-green-600 text-green-600 dark:text-green-400 dark:border-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition"
          >
            Ver Progreso
          </Link>
        </div>

        <TransactionList transactions={transactions} />

        {/* FAB */}
        <Link
          href="/dashboard/finance/new"
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
          title="Nueva Transacción"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </Link>
      </div>
    </div>
  )
}
