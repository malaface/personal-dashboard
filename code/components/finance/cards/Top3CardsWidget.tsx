"use client"

import { useState, useEffect } from "react"
import type { CardRecommendation } from "@/lib/finance/card-utils"

export default function Top3CardsWidget() {
  const [cards, setCards] = useState<CardRecommendation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const response = await fetch("/api/finance/cards/recommendations")
        const data = await response.json()
        setCards(data.cards || [])
      } catch {
        // Silently fail
      } finally {
        setLoading(false)
      }
    }
    fetchRecommendations()
  }, [])

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (cards.length === 0) return null

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
        Mejores Tarjetas para Comprar Hoy
      </h3>
      <div className="space-y-2">
        {cards.map((card, index) => {
          const usagePercent = ((card.creditLimit - card.availableCredit) / card.creditLimit) * 100
          return (
            <div
              key={card.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
            >
              <div
                className="flex items-center justify-center w-8 h-8 rounded-full text-white text-sm font-bold flex-shrink-0"
                style={{ backgroundColor: card.color || "#3B82F6" }}
              >
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {card.name}
                  </p>
                  <span className={`text-xs font-bold ml-2 flex-shrink-0 ${
                    card.isAfterCutoff
                      ? "text-green-600 dark:text-green-400"
                      : "text-blue-600 dark:text-blue-400"
                  }`}>
                    {card.daysToPayment}d
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Si compras ahora tienes <span className="font-semibold">{card.daysToPayment} dias</span> para pagar
                </p>
                {/* Credit usage mini bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1 mt-1">
                  <div
                    className="h-1 rounded-full"
                    style={{
                      width: `${Math.max(100 - usagePercent, 0)}%`,
                      backgroundColor: card.color || "#3B82F6",
                    }}
                  />
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  Disp: ${card.availableCredit.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
