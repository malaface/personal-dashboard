"use client"

/**
 * Nutrition Macros Trends Chart
 * Stacked bar chart showing daily macro breakdown
 */

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import ChartSkeleton from './ChartSkeleton'

interface MacrosData {
  date: string
  calories: number
  protein: number
  carbs: number
  fats: number
  mealCount: number
}

export default function NutritionMacrosChart() {
  const [data, setData] = useState<MacrosData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch last 30 days
        const response = await fetch('/api/analytics/nutrition-macros')
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
          <p className="font-semibold">Sin datos de nutrición</p>
          <p className="text-sm mt-1">Registra comidas para ver tus tendencias de macros</p>
        </div>
      </div>
    )
  }

  // Format dates for display
  const chartData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })
  }))

  // Calculate averages
  const avgCalories = data.reduce((sum, item) => sum + item.calories, 0) / data.length
  const avgProtein = data.reduce((sum, item) => sum + item.protein, 0) / data.length
  const avgCarbs = data.reduce((sum, item) => sum + item.carbs, 0) / data.length
  const avgFats = data.reduce((sum, item) => sum + item.fats, 0) / data.length

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">Macronutrientes (Últimos 30 Días)</h3>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            label={{ value: 'Gramos', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            formatter={(value, name) => {
              const val = value || 0
              const nameStr = String(name || '')
              if (nameStr === 'calories') return [`${val} kcal`, 'Calorías']
              if (nameStr === 'protein' || nameStr === 'Proteínas') return [`${val}g`, 'Proteínas']
              if (nameStr === 'carbs' || nameStr === 'Carbohidratos') return [`${val}g`, 'Carbohidratos']
              if (nameStr === 'fats' || nameStr === 'Grasas') return [`${val}g`, 'Grasas']
              return [`${val}g`, nameStr]
            }}
          />
          <Legend />
          <Bar dataKey="protein" stackId="macros" fill="#8884d8" name="Proteínas" />
          <Bar dataKey="carbs" stackId="macros" fill="#82ca9d" name="Carbohidratos" />
          <Bar dataKey="fats" stackId="macros" fill="#ffc658" name="Grasas" />
        </BarChart>
      </ResponsiveContainer>

      {/* Summary stats */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-600">Calorías Promedio</p>
          <p className="text-lg font-bold">{avgCalories.toFixed(0)} kcal</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs text-gray-600">Proteínas Promedio</p>
          <p className="text-lg font-bold text-blue-700">{avgProtein.toFixed(0)}g</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-xs text-gray-600">Carbohidratos Promedio</p>
          <p className="text-lg font-bold text-green-700">{avgCarbs.toFixed(0)}g</p>
        </div>
        <div className="bg-yellow-50 rounded-lg p-3">
          <p className="text-xs text-gray-600">Grasas Promedio</p>
          <p className="text-lg font-bold text-yellow-700">{avgFats.toFixed(0)}g</p>
        </div>
      </div>
    </div>
  )
}
