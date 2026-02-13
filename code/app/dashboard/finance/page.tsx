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
            href="/dashboard/finance/new"
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            Nueva Transacción
          </Link>
        </div>

        <TransactionList transactions={transactions} />
      </div>
    </div>
  )
}
