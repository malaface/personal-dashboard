import { requireAuth } from "@/lib/auth/utils"
import FinanceProgressDashboard from "@/components/finance/progress/FinanceProgressDashboard"
import FinanceModeTabs from "@/components/finance/FinanceModeTabs"

export const metadata = {
  title: "Progreso Financiero | Dashboard",
  description: "Visualiza la evolucion de tus ingresos, gastos y balance",
}

export default async function FinanceProgressPage() {
  await requireAuth()

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Progreso Financiero
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Rastrea la evolucion de tus ingresos, gastos y balance por categoria
          </p>
        </div>

        <FinanceModeTabs />

        <FinanceProgressDashboard />
      </div>
    </div>
  )
}
