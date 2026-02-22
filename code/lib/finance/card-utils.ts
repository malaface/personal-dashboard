/**
 * Credit Card utility functions
 * - Days to payment calculation
 * - Post-cutoff detection
 * - Top 3 cards recommendation
 */

import { prisma } from "@/lib/db/prisma"

export interface CardRecommendation {
  id: string
  name: string
  color: string | null
  creditLimit: number
  currentBalance: number
  availableCredit: number
  daysToPayment: number
  isAfterCutoff: boolean
  cutoffDay: number
  paymentDay: number
}

/**
 * Calculate days remaining until payment is due
 *
 * Logic:
 * - If today <= cutoffDay → payment is paymentDay of next month
 * - If today > cutoffDay → payment is paymentDay of 2 months from now
 */
export function calculateDaysToPayment(
  cutoffDay: number,
  paymentDay: number,
  today: Date = new Date()
): number {
  const currentDay = today.getDate()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  let paymentDate: Date

  if (currentDay <= cutoffDay) {
    // Payment is paymentDay of next month
    const nextMonth = currentMonth + 1
    const year = nextMonth > 11 ? currentYear + 1 : currentYear
    const month = nextMonth > 11 ? 0 : nextMonth
    const maxDay = new Date(year, month + 1, 0).getDate()
    paymentDate = new Date(year, month, Math.min(paymentDay, maxDay))
  } else {
    // Payment is paymentDay of 2 months from now
    const twoMonthsLater = currentMonth + 2
    const year = twoMonthsLater > 11 ? currentYear + 1 : currentYear
    const month = twoMonthsLater > 11 ? twoMonthsLater - 12 : twoMonthsLater
    const maxDay = new Date(year, month + 1, 0).getDate()
    paymentDate = new Date(year, month, Math.min(paymentDay, maxDay))
  }

  const diffTime = paymentDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}

/**
 * Check if we are in the optimal purchase window (after cutoff)
 *
 * Returns true if today is between cutoffDay+1 and cutoffDay+20
 * (window where purchases go to next billing cycle)
 */
export function isAfterCutoff(cutoffDay: number, today: Date = new Date()): boolean {
  const currentDay = today.getDate()
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()

  if (cutoffDay < daysInMonth - 20) {
    // Simple case: cutoff doesn't wrap around month end
    return currentDay > cutoffDay && currentDay <= cutoffDay + 20
  } else {
    // Wrap case: e.g., cutoff day 28, window extends to next month
    if (currentDay > cutoffDay) return true
    if (currentDay <= (cutoffDay + 20) - daysInMonth) return true
    return false
  }
}

/**
 * Get top 3 credit cards recommended for purchases
 * Ordered by most days to payment (descending)
 */
export async function getTop3CardsForPurchase(userId: string): Promise<CardRecommendation[]> {
  const cards = await prisma.creditCard.findMany({
    where: {
      userId,
      isActive: true,
    },
    orderBy: { sortOrder: "asc" },
  })

  const today = new Date()

  const recommendations: CardRecommendation[] = cards
    .filter((card) => card.creditLimit - card.currentBalance > 0)
    .map((card) => ({
      id: card.id,
      name: card.name,
      color: card.color,
      creditLimit: card.creditLimit,
      currentBalance: card.currentBalance,
      availableCredit: card.creditLimit - card.currentBalance,
      daysToPayment: calculateDaysToPayment(card.cutoffDay, card.paymentDay, today),
      isAfterCutoff: isAfterCutoff(card.cutoffDay, today),
      cutoffDay: card.cutoffDay,
      paymentDay: card.paymentDay,
    }))
    .sort((a, b) => b.daysToPayment - a.daysToPayment)

  return recommendations.slice(0, 3)
}
