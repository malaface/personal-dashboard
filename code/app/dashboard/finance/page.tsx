import { requireAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/db/prisma"
import TransactionList from "@/components/finance/TransactionList"
import FloatingActionButton from "@/components/ui/FloatingActionButton"
import Top3CardsWidget from "@/components/finance/cards/Top3CardsWidget"
import FinanceModeTabs from "@/components/finance/FinanceModeTabs"

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
        </div>

        <FinanceModeTabs accountCount={accountCount} cardCount={cardCount} />

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
