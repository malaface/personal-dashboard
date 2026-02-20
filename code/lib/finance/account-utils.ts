/**
 * Financial Account utility functions
 */

import { prisma } from "@/lib/db/prisma"

/**
 * Calculate total balance across all active financial accounts for a user
 */
export async function calculateTotalBalance(userId: string): Promise<{
  total: number
  currency: string
  accountCount: number
}> {
  const accounts = await prisma.financialAccount.findMany({
    where: {
      userId,
      isActive: true,
    },
    select: {
      balance: true,
      currency: true,
    },
  })

  const total = accounts.reduce((sum, acc) => sum + acc.balance, 0)

  return {
    total: Math.round(total * 100) / 100,
    currency: "MXN",
    accountCount: accounts.length,
  }
}
