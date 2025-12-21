/**
 * Analytics Dashboard Page
 * Displays 4 analytics charts for Finance, Gym, Family, and Nutrition modules
 */

import { Suspense } from 'react'
import FinanceAllocationChart from '@/components/analytics/FinanceAllocationChart'
import GymVolumeChart from '@/components/analytics/GymVolumeChart'
import FamilyTimeChart from '@/components/analytics/FamilyTimeChart'
import NutritionMacrosChart from '@/components/analytics/NutritionMacrosChart'
import GymMuscleDistributionChart from '@/components/analytics/GymMuscleDistributionChart'
import GymEquipmentUsageChart from '@/components/analytics/GymEquipmentUsageChart'
import FinanceCategoryUsageChart from '@/components/analytics/FinanceCategoryUsageChart'
import FinanceSpendingDistributionChart from '@/components/analytics/FinanceSpendingDistributionChart'
import ChartSkeleton from '@/components/analytics/ChartSkeleton'

export const metadata = {
  title: 'Analítica | Panel Personal',
  description: 'Visualiza tu progreso en entrenamiento, finanzas, nutrición y familia'
}

export default function AnalyticsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Panel de Analítica</h1>
        <p className="mt-2 text-gray-600">
          Visualiza tu progreso en todos los módulos
        </p>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {/* Finance - Portfolio Allocation */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <Suspense fallback={<ChartSkeleton />}>
            <FinanceAllocationChart />
          </Suspense>
        </div>

        {/* Gym - Volume Trends */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <Suspense fallback={<ChartSkeleton />}>
            <GymVolumeChart />
          </Suspense>
        </div>

        {/* Family - Time Spent */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <Suspense fallback={<ChartSkeleton />}>
            <FamilyTimeChart />
          </Suspense>
        </div>

        {/* Nutrition - Macro Trends */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <Suspense fallback={<ChartSkeleton />}>
            <NutritionMacrosChart />
          </Suspense>
        </div>

        {/* Gym - Muscle Group Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <Suspense fallback={<ChartSkeleton />}>
            <GymMuscleDistributionChart />
          </Suspense>
        </div>

        {/* Gym - Equipment Usage */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <Suspense fallback={<ChartSkeleton />}>
            <GymEquipmentUsageChart />
          </Suspense>
        </div>

        {/* Finance - Spending Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <Suspense fallback={<ChartSkeleton />}>
            <FinanceSpendingDistributionChart />
          </Suspense>
        </div>

        {/* Finance - Category Usage */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <Suspense fallback={<ChartSkeleton />}>
            <FinanceCategoryUsageChart />
          </Suspense>
        </div>
      </div>

      {/* Info footer */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">📊 Información de Analítica</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Distribución de Portafolio:</strong> Distribución actual de inversiones por tipo</li>
          <li>• <strong>Volumen de Entrenamiento:</strong> Volumen total de entrenamiento (series × reps × peso) en los últimos 30 días</li>
          <li>• <strong>Tiempo Familiar:</strong> Tiempo dedicado a cada miembro de la familia en los últimos 30 días</li>
          <li>• <strong>Macronutrientes:</strong> Ingesta diaria de proteínas, carbohidratos y grasas en los últimos 30 días</li>
          <li>• <strong>Volumen por Grupo Muscular:</strong> Distribución de volumen de entrenamiento por grupos musculares (últimos 30 días)</li>
          <li>• <strong>Uso de Equipamiento:</strong> Frecuencia de uso de diferentes tipos de equipamiento (últimos 30 días)</li>
          <li>• <strong>Distribución de Gastos:</strong> Distribución porcentual de gastos por categorías (últimos 30 días)</li>
          <li>• <strong>Frecuencia de Categorías:</strong> Categorías de transacción más utilizadas (últimos 30 días)</li>
        </ul>
      </div>
    </div>
  )
}
