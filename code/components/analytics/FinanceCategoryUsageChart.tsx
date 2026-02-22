"use client"

/**
 * Finance Category Usage Chart
 * Bar chart showing transaction frequency by category
 */

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import ChartSkeleton from './ChartSkeleton'

interface CategoryUsageData {
  categoryName: string
  transactionCount: number
  percentage: number
}

export default function FinanceCategoryUsageChart() {
  const [data, setData] = useState<CategoryUsageData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/analytics/finance-category-usage')
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
          <p className="font-semibold">Sin datos de transacciones</p>
          <p className="text-sm mt-1">Registra transacciones para ver frecuencia por categoría</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">Frecuencia de Uso por Categoría</h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis dataKey="categoryName" type="category" tick={{ fontSize: 12 }} width={120} />
          <Tooltip
            formatter={(value, name) => {
              if (name === 'transactionCount') return [value, 'Transacciones']
              return [value, name]
            }}
          />
          <Legend />
          <Bar
            dataKey="transactionCount"
            fill="#10B981"
            name="Transacciones"
            radius={[0, 8, 8, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Estadísticas resumen */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {data.slice(0, 3).map((item, index) => (
          <div key={index} className="bg-green-50 rounded-lg p-3">
            <p className="text-xs text-gray-600">{item.categoryName}</p>
            <p className="text-lg font-bold text-green-700">{item.transactionCount}</p>
            <p className="text-xs text-gray-500">{item.percentage.toFixed(1)}% del total</p>
          </div>
        ))}
      </div>
    </div>
  )
}
