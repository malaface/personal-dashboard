import { requireAuth } from "@/lib/auth/utils"
import Link from "next/link"
import FinanceProgressDashboard from "@/components/finance/progress/FinanceProgressDashboard"

export const metadata = {
  title: "Progreso Financiero | Dashboard",
  description: "Visualiza la evolucion de tus ingresos, gastos y balance",
}

export default async function FinanceProgressPage() {
  await requireAuth()

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Progreso Financiero
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Rastrea la evolucion de tus ingresos, gastos y balance por categoria
            </p>
          </div>
          <Link
            href="/dashboard/finance"
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Volver a Finanzas
          </Link>
        </div>

        <FinanceProgressDashboard />
      </div>
    </div>
  )
}
