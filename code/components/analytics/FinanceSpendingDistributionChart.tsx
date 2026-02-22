"use client"

/**
 * Finance Spending Distribution Chart
 * Pie chart showing expense distribution by category
 */

import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import ChartSkeleton from './ChartSkeleton'

interface SpendingDistributionData {
  categoryName: string
  totalSpent: number
  percentage: number
  transactionCount: number
}

const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6']

export default function FinanceSpendingDistributionChart() {
  const [data, setData] = useState<SpendingDistributionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/analytics/finance-spending-distribution')
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch data')
        }

        setData(result.data)
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <ChartSkeleton />

  if (error) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Error al cargar gráfico</p>
          <p className="text-gray-500 text-sm mt-1">{error}</p>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="font-semibold">Sin datos de gastos</p>
          <p className="text-sm mt-1">Registra gastos para ver distribución por categoría</p>
        </div>
      </div>
    )
  }

  const chartData = data.map(item => ({
    name: item.categoryName,
    value: item.totalSpent
  }))

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">Distribución de Gastos por Categoría</h3>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(1)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => `$${(value || 0).toLocaleString()}`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      {/* Estadísticas resumen */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {data.slice(0, 4).map((item, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm font-medium">{item.categoryName}</span>
            </div>
            <p className="text-lg font-bold mt-1">${item.totalSpent.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{item.transactionCount} transacción{item.transactionCount !== 1 ? 'es' : ''}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
