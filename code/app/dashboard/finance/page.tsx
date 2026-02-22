import { requireAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/db/prisma"
import Link from "next/link"
import TransactionList from "@/components/finance/TransactionList"
import FloatingActionButton from "@/components/ui/FloatingActionButton"
import Top3CardsWidget from "@/components/finance/cards/Top3CardsWidget"

export default async function FinancePage() {
  const user = await requireAuth()

  const [transactions, accountCount, cardCount, accounts] = await Promise.all([
    prisma.transaction.findMany({
      where: { userId: user.id },
      include: {
        typeItem: true,
        categoryItem: true,
      },
      orderBy: { date: "desc" },
    }),
    prisma.financialAccount.count({
      where: { userId: user.id, isActive: true },
    }),
    prisma.creditCard.count({
      where: { userId: user.id, isActive: true },
    }),
    prisma.financialAccount.findMany({
      where: { userId: user.id, isActive: true },
      select: { balance: true },
    }),
  ])

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Finanzas</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Administra tus transacciones, cuentas e inversiones</p>
          </div>
          <Link
            href="/dashboard/finance/progress"
            className="px-4 py-2 border border-green-600 text-green-600 dark:text-green-400 dark:border-green-400 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition"
          >
            Ver Progreso
          </Link>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <Link
            href="/dashboard/finance"
            className="flex-1 px-4 py-2 text-center text-sm font-medium rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
          >
            Transacciones
          </Link>
          <Link
            href="/dashboard/finance/accounts"
            className="flex-1 px-4 py-2 text-center text-sm font-medium rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
          >
            Cuentas {accountCount > 0 && <span className="text-xs opacity-60">({accountCount})</span>}
          </Link>
          <Link
            href="/dashboard/finance/cards"
            className="flex-1 px-4 py-2 text-center text-sm font-medium rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
          >
            Tarjetas {cardCount > 0 && <span className="text-xs opacity-60">({cardCount})</span>}
          </Link>
          <Link
            href="/dashboard/finance/progress"
            className="flex-1 px-4 py-2 text-center text-sm font-medium rounded-md text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
          >
            Progreso
          </Link>
        </div>

        {/* Summary Widgets */}
        {(accountCount > 0 || cardCount > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {accountCount > 0 && (
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-4 text-white">
                <p className="text-blue-100 text-sm">Balance Total en Cuentas</p>
                <p className="text-2xl font-bold mt-1">
                  ${totalBalance.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-blue-200 text-xs mt-1">{accountCount} cuenta{accountCount !== 1 ? "s" : ""}</p>
              </div>
            )}
            {cardCount > 0 && (
              <Top3CardsWidget />
            )}
          </div>
        )}

        <TransactionList transactions={transactions} />

        {/* FAB */}
        <FloatingActionButton href="/dashboard/finance/new" title="Nueva Transaccion" color="bg-green-600 hover:bg-green-700" />
      </div>
    </div>
  )
}
