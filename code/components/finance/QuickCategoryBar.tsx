"use client"

import { useState, useEffect } from "react"
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline"

interface RecentCategory {
  typeId: string
  categoryId: string
  typeName: string
  categoryName: string
  count: number
  lastAmount: number | null
}

interface QuickCategoryBarProps {
  onQuickSelect: (typeId: string, categoryId: string, lastAmount: number | null) => void
}

export default function QuickCategoryBar({ onQuickSelect }: QuickCategoryBarProps) {
  const [categories, setCategories] = useState<RecentCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecent() {
      try {
        const response = await fetch("/api/transactions/recent-categories")
        const data = await response.json()
        setCategories(data.categories || [])
      } catch {
        // Silently fail - this is a convenience feature
      } finally {
        setLoading(false)
      }
    }
    fetchRecent()
  }, [])

  if (loading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-8 w-28 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0"
          />
        ))}
      </div>
    )
  }

  if (categories.length === 0) return null

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
        Categorías recientes
      </p>
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => {
          const typeLower = cat.typeName.toLowerCase()
          const isIncome = typeLower.includes("ingreso") || typeLower.includes("income") || typeLower.includes("reembolso") || typeLower.includes("devolucion")
          return (
            <button
              key={`${cat.typeId}-${cat.categoryId}`}
              type="button"
              onClick={() => onQuickSelect(cat.typeId, cat.categoryId, cat.lastAmount)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium flex-shrink-0 transition-colors ${
                isIncome
                  ? "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50"
                  : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50"
              }`}
            >
              {isIncome ? (
                <ArrowUpIcon className="h-3.5 w-3.5" />
              ) : (
                <ArrowDownIcon className="h-3.5 w-3.5" />
              )}
              <span>{cat.categoryName}</span>
              <span className="text-xs opacity-60">({cat.count})</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
