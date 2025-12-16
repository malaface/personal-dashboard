"use client"

/**
 * Gym Volume Trends Chart
 * Line chart showing workout volume over time
 */

import { useEffect, useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import ChartSkeleton from './ChartSkeleton'

interface VolumeData {
  date: string
  volume: number
  workoutCount: number
}

export default function GymVolumeChart() {
  const [data, setData] = useState<VolumeData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch last 30 days
        const response = await fetch('/api/analytics/gym-volume')
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
          <p className="font-semibold">No workout data</p>
          <p className="text-sm mt-1">Complete workouts to see your volume trends</p>
        </div>
      </div>
    )
  }

  // Format dates for display
  const chartData = data.map(item => ({
    ...item,
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }))

  // Calculate stats
  const totalVolume = data.reduce((sum, item) => sum + item.volume, 0)
  const avgVolume = totalVolume / data.length
  const maxVolume = Math.max(...data.map(item => item.volume))

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold mb-4">Workout Volume Trends (Last 30 Days)</h3>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 12 }}
            label={{ value: 'Volume (kg)', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip
            formatter={(value, name) => {
              const val = value || 0
              if (name === 'volume') return [`${val.toLocaleString()} kg`, 'Volume']
              if (name === 'workoutCount') return [val, 'Workouts']
              return [val, name]
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="volume"
            stroke="#8884d8"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name="Volume (kg)"
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Summary stats */}
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs text-gray-600">Avg Volume</p>
          <p className="text-lg font-bold text-blue-700">{avgVolume.toFixed(0)} kg</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <p className="text-xs text-gray-600">Peak Volume</p>
          <p className="text-lg font-bold text-green-700">{maxVolume.toFixed(0)} kg</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-3">
          <p className="text-xs text-gray-600">Total Workouts</p>
          <p className="text-lg font-bold text-purple-700">{data.length}</p>
        </div>
      </div>
    </div>
  )
}
