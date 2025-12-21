"use client"

/**
 * Gym Muscle Group Distribution Chart
 * Pie chart showing volume distribution by muscle group (last 30 days)
 */

import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import ChartSkeleton from './ChartSkeleton'

interface MuscleDistributionData {
  muscleGroupName: string
  totalVolume: number
  percentage: number
  exerciseCount: number
}

const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6']

export default function GymMuscleDistributionChart() {
  const [data, setData] = useState<MuscleDistributionData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/analytics/gym-muscle-distribution')
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
          <p className="font-semibold">Sin datos de entrenamiento</p>
          <p className="text-sm mt-1">Completa ejercicios para ver la distribución por grupo muscular</p>
        </div>
      </div>
    )
  }

  const chartData = data.map(item => ({
    name: item.muscleGroupName,
    value: item.totalVolume
  }))

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">Volumen por Grupo Muscular</h3>

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
          <Tooltip formatter={(value) => `${(value || 0).toLocaleString()} kg`} />
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
              <span className="text-sm font-medium">{item.muscleGroupName}</span>
            </div>
            <p className="text-lg font-bold mt-1">{item.totalVolume.toLocaleString()} kg</p>
            <p className="text-xs text-gray-500">{item.exerciseCount} ejercicio{item.exerciseCount !== 1 ? 's' : ''}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
