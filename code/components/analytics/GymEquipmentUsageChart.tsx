"use client"

/**
 * Gym Equipment Usage Chart
 * Bar chart showing exercise count by equipment type
 */

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import ChartSkeleton from './ChartSkeleton'

interface EquipmentUsageData {
  equipmentName: string
  exerciseCount: number
  percentage: number
}

export default function GymEquipmentUsageChart() {
  const [data, setData] = useState<EquipmentUsageData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/analytics/gym-equipment-usage')
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
          <p className="font-semibold">Sin datos de equipamiento</p>
          <p className="text-sm mt-1">Completa ejercicios para ver el uso de equipamiento</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">Uso de Equipamiento</h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" tick={{ fontSize: 12 }} />
          <YAxis dataKey="equipmentName" type="category" tick={{ fontSize: 12 }} width={120} />
          <Tooltip
            formatter={(value, name) => {
              if (name === 'exerciseCount') return [value, 'Ejercicios']
              return [value, name]
            }}
          />
          <Legend />
          <Bar
            dataKey="exerciseCount"
            fill="#8B5CF6"
            name="Ejercicios"
            radius={[0, 8, 8, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Estadísticas resumen */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
        {data.slice(0, 3).map((item, index) => (
          <div key={index} className="bg-purple-50 rounded-lg p-3">
            <p className="text-xs text-gray-600">{item.equipmentName}</p>
            <p className="text-lg font-bold text-purple-700">{item.exerciseCount}</p>
            <p className="text-xs text-gray-500">{item.percentage.toFixed(1)}% del total</p>
          </div>
        ))}
      </div>
    </div>
  )
}
