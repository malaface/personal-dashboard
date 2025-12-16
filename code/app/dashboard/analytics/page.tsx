/**
 * Analytics Dashboard Page
 * Displays 4 analytics charts for Finance, Gym, Family, and Nutrition modules
 */

import { Suspense } from 'react'
import FinanceAllocationChart from '@/components/analytics/FinanceAllocationChart'
import GymVolumeChart from '@/components/analytics/GymVolumeChart'
import FamilyTimeChart from '@/components/analytics/FamilyTimeChart'
import NutritionMacrosChart from '@/components/analytics/NutritionMacrosChart'
import ChartSkeleton from '@/components/analytics/ChartSkeleton'

export const metadata = {
  title: 'Analytics | Personal Dashboard',
  description: 'View analytics for your fitness, finance, nutrition, and family activities'
}

export default function AnalyticsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Visualize your progress across all modules
        </p>
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
      </div>

      {/* Info footer */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">📊 Analytics Information</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Portfolio Allocation:</strong> Current distribution of investments by type</li>
          <li>• <strong>Gym Volume:</strong> Total workout volume (sets × reps × weight) over last 30 days</li>
          <li>• <strong>Family Time:</strong> Time spent with each family member over last 30 days</li>
          <li>• <strong>Nutrition Macros:</strong> Daily protein, carbs, and fats intake over last 30 days</li>
        </ul>
      </div>
    </div>
  )
}
