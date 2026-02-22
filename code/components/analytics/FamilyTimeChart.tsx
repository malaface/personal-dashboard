"use client"

/**
 * Family Time Spent Chart
 * Bar chart showing time spent with each family member
 */

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import ChartSkeleton from './ChartSkeleton'

interface FamilyTimeData {
  memberName: string
  totalMinutes: number
  activityCount: number
}

export default function FamilyTimeChart() {
  const [data, setData] = useState<FamilyTimeData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch last 30 days
        const response = await fetch('/api/analytics/family-time')
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

  if (loading) {
    return <ChartSkeleton />
  }

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
          <p className="font-semibold">Sin datos de tiempo familiar</p>
          <p className="text-sm mt-1">Registra tiempo con miembros de la familia para ver analíticas</p>
        </div>
      </div>
    )
  }

  // Convert minutes to hours for display
  const chartData = data.map(item => ({
    ...item,
    hours: Math.round((item.totalMinutes / 60) * 10) / 10
  }))

  const totalMinutes = data.reduce((sum, item) => sum + item.totalMinutes, 0)
  const totalHours = Math.round((totalMinutes / 60) * 10) / 10

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">Tiempo Familiar (Últimos 30 Días)</h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="memberName"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            tick={{ fontSize: 12 }}
            label={{ value: 'Horas', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            formatter={(value, name) => {
              const val = value || 0
              if (name === 'hours') return [`${val} hrs`, 'Tiempo Dedicado']
              if (name === 'activityCount') return [val, 'Actividades']
              return [val, name]
            }}
          />
          <Legend />
          <Bar
            dataKey="hours"
            fill="#82ca9d"
            name="Horas"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Summary stats */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-xs text-gray-600">Tiempo Total</p>
          <p className="text-lg font-bold text-green-700">{totalHours} horas</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs text-gray-600">Miembros de Familia</p>
          <p className="text-lg font-bold text-blue-700">{data.length}</p>
        </div>
      </div>

      {/* Individual breakdown */}
      <div className="mt-4 space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex justify-between items-center bg-gray-50 rounded-lg p-3">
            <div>
              <p className="font-medium">{item.memberName}</p>
              <p className="text-xs text-gray-500">{item.activityCount} actividad{item.activityCount !== 1 ? 'es' : ''}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">{Math.round((item.totalMinutes / 60) * 10) / 10}h</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
