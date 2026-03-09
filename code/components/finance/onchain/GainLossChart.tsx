"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from "recharts"

interface PeriodData {
  gainLossUSD: number
  gainLossMXN: number
  count: number
}

interface GainLossChartProps {
  byPeriod: Record<string, PeriodData>
  currency?: "USD" | "MXN"
}

export default function GainLossChart({ byPeriod, currency = "MXN" }: GainLossChartProps) {
  const data = Object.entries(byPeriod)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([period, d]) => ({
      period,
      value: currency === "MXN" ? d.gainLossMXN : d.gainLossUSD,
      count: d.count,
    }))

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
        Sin datos fiscales para mostrar
      </div>
    )
  }

  const formatValue = (value: number) => {
    const prefix = currency === "MXN" ? "$" : "$"
    const suffix = currency === "MXN" ? " MXN" : " USD"
    if (Math.abs(value) >= 1000) {
      return `${prefix}${(value / 1000).toFixed(1)}k${suffix}`
    }
    return `${prefix}${value.toFixed(0)}${suffix}`
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis
            dataKey="period"
            tick={{ fontSize: 12, fill: "#9CA3AF" }}
            axisLine={{ stroke: "#4B5563" }}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#9CA3AF" }}
            axisLine={{ stroke: "#4B5563" }}
            tickFormatter={(v: number) => {
              if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(0)}k`
              return v.toFixed(0)
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1F2937",
              border: "1px solid #374151",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            labelStyle={{ color: "#D1D5DB" }}
            formatter={(value: number | undefined) => [formatValue(value ?? 0), "G/P"]}
          />
          <ReferenceLine y={0} stroke="#6B7280" strokeDasharray="3 3" />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.value >= 0 ? "#10B981" : "#EF4444"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
