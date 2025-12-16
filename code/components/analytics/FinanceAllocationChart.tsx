"use client"

/**
 * Finance Portfolio Allocation Chart
 * Pie chart showing investment distribution by type
 */

import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import ChartSkeleton from './ChartSkeleton'

interface PortfolioData {
  typeName: string
  value: number
  percentage: number
  count: number
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658']

export default function FinanceAllocationChart() {
  const [data, setData] = useState<PortfolioData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/analytics/portfolio-allocation')
        const result = await response.json()

        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch data')
        }

        setData(result.data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return <ChartSkeleton />
  }

  if (error) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Error loading chart</p>
          <p className="text-gray-500 text-sm mt-1">{error}</p>
        </div>
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="font-semibold">No investment data</p>
          <p className="text-sm mt-1">Add investments to see your portfolio allocation</p>
        </div>
      </div>
    )
  }

  // Format data for recharts
  const chartData = data.map(item => ({
    name: item.typeName,
    value: item.value
  }))

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">Portfolio Allocation</h3>

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
          <Tooltip
            formatter={(value) => `$${(value || 0).toLocaleString()}`}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      {/* Summary stats */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {data.map((item, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm font-medium">{item.typeName}</span>
            </div>
            <p className="text-lg font-bold mt-1">${item.value.toLocaleString()}</p>
            <p className="text-xs text-gray-500">{item.count} investment{item.count !== 1 ? 's' : ''}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
