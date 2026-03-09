"use client"

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts"

interface TokenHolding {
  tokenSymbol: string
  totalAmount: number
  avgCostBasisUSD: number
}

interface OnchainPortfolioChartProps {
  holdings: TokenHolding[]
}

const COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
  "#EC4899", "#06B6D4", "#F97316", "#14B8A6", "#6366F1",
]

export default function OnchainPortfolioChart({ holdings }: OnchainPortfolioChartProps) {
  const data = holdings
    .filter((h) => h.totalAmount > 0)
    .map((h) => ({
      name: h.tokenSymbol,
      value: h.totalAmount * h.avgCostBasisUSD,
      amount: h.totalAmount,
    }))
    .sort((a, b) => b.value - a.value)

  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
        Sin holdings para mostrar
      </div>
    )
  }

  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#1F2937",
              border: "1px solid #374151",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value: number | undefined, name: string | undefined) => {
              const v = value ?? 0
              const pct = ((v / total) * 100).toFixed(1)
              return [`$${v.toFixed(2)} USD (${pct}%)`, name ?? ""]
            }}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            iconSize={8}
            formatter={(value: string) => (
              <span style={{ color: "#D1D5DB", fontSize: "12px" }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
