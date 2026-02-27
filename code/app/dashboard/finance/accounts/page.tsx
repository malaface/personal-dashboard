import { requireAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/db/prisma"
import FinancialAccountList from "@/components/finance/accounts/FinancialAccountList"
import FloatingActionButton from "@/components/ui/FloatingActionButton"
import FinanceModeTabs from "@/components/finance/FinanceModeTabs"

export default async function AccountsPage() {
  const user = await requireAuth()

  const accounts = await prisma.financialAccount.findMany({
    where: {
      userId: user.id,
      isActive: true,
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  })

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Cuentas Financieras</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Administra tus cuentas de debito, efectivo y ahorro</p>
        </div>

        <FinanceModeTabs accountCount={accounts.length} />

        <FinancialAccountList accounts={accounts} />

        {/* FAB */}
        <FloatingActionButton href="/dashboard/finance/accounts/new" title="Nueva Cuenta" />
      </div>
    </div>
  )
}
