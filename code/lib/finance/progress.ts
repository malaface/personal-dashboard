/**
 * Finance Progress - Trend tracking and financial records
 */

import { prisma } from "@/lib/db/prisma"
import { getUSDtoMXNRate } from "@/lib/finance/exchange-rate"

export interface MonthlyTrendPoint {
  month: string
  income: number
  expense: number
  balance: number
  transactionCount: number
}

export interface FinancialRecords {
  bestIncomeMonth: { value: number; month: string } | null
  lowestExpenseMonth: { value: number; month: string } | null
  bestBalanceMonth: { value: number; month: string } | null
  largestIncome: { value: number; date: string; description: string | null } | null
  largestExpense: { value: number; date: string; description: string | null } | null
}

/**
 * Determine if a transaction is income based on typeItem name or legacy type field
 */
function isIncomeTransaction(tx: {
  typeItem?: { name: string } | null
  type?: string | null
}): boolean {
  if (tx.typeItem?.name) {
    const name = tx.typeItem.name.toLowerCase()
    return name.includes("ingreso") || name.includes("income")
  }
  return tx.type === "income"
}

/**
 * Get finance progress trend grouped by month
 */
export async function getFinanceProgressTrend(
  userId: string,
  filters: {
    categoryId?: string
    typeId?: string
    startDate?: Date
    endDate?: Date
  }
): Promise<MonthlyTrendPoint[]> {
  const where: Record<string, unknown> = { userId }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId
  }

  if (filters.typeId) {
    where.typeId = filters.typeId
  }

  if (filters.startDate || filters.endDate) {
    where.date = {
      ...(filters.startDate ? { gte: filters.startDate } : {}),
      ...(filters.endDate ? { lte: filters.endDate } : {}),
    }
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      typeItem: { select: { name: true } },
      categoryItem: { select: { name: true } },
    },
    orderBy: { date: "asc" },
  })

  // Get exchange rate for USD to MXN conversion
  const exchangeRate = await getUSDtoMXNRate()

  // Group by month (YYYY-MM)
  const monthMap = new Map<
    string,
    { income: number; expense: number; count: number }
  >()

  for (const tx of transactions) {
    const monthKey = tx.date.toISOString().slice(0, 7) // YYYY-MM
    const existing = monthMap.get(monthKey) || {
      income: 0,
      expense: 0,
      count: 0,
    }

    // Convert to MXN if currency is USD
    const amountMXN = tx.currency === "USD" ? tx.amount * exchangeRate : tx.amount

    if (isIncomeTransaction(tx)) {
      existing.income += amountMXN
    } else {
      existing.expense += amountMXN
    }
    existing.count += 1

    monthMap.set(monthKey, existing)
  }

  const result: MonthlyTrendPoint[] = []
  for (const [month, data] of monthMap) {
    result.push({
      month,
      income: Math.round(data.income * 100) / 100,
      expense: Math.round(Math.abs(data.expense) * 100) / 100,
      balance:
        Math.round((data.income - Math.abs(data.expense)) * 100) / 100,
      transactionCount: data.count,
    })
  }

  return result.sort((a, b) => a.month.localeCompare(b.month))
}

/**
 * Get financial records (all-time bests)
 */
export async function getFinancialRecords(
  userId: string
): Promise<FinancialRecords> {
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    include: {
      typeItem: { select: { name: true } },
    },
    orderBy: { date: "asc" },
  })

  // Get exchange rate for USD to MXN conversion
  const exchangeRate = await getUSDtoMXNRate()

  // Group by month for monthly records
  const monthMap = new Map<string, { income: number; expense: number }>()

  for (const tx of transactions) {
    const monthKey = tx.date.toISOString().slice(0, 7)
    const existing = monthMap.get(monthKey) || { income: 0, expense: 0 }

    const amountMXN = tx.currency === "USD" ? tx.amount * exchangeRate : tx.amount

    if (isIncomeTransaction(tx)) {
      existing.income += amountMXN
    } else {
      existing.expense += Math.abs(amountMXN)
    }

    monthMap.set(monthKey, existing)
  }

  // Find records
  let bestIncomeMonth: FinancialRecords["bestIncomeMonth"] = null
  let lowestExpenseMonth: FinancialRecords["lowestExpenseMonth"] = null
  let bestBalanceMonth: FinancialRecords["bestBalanceMonth"] = null

  for (const [month, data] of monthMap) {
    if (data.income > 0) {
      if (!bestIncomeMonth || data.income > bestIncomeMonth.value) {
        bestIncomeMonth = {
          value: Math.round(data.income * 100) / 100,
          month,
        }
      }
    }

    if (data.expense > 0) {
      if (!lowestExpenseMonth || data.expense < lowestExpenseMonth.value) {
        lowestExpenseMonth = {
          value: Math.round(data.expense * 100) / 100,
          month,
        }
      }
    }

    const balance = data.income - data.expense
    if (!bestBalanceMonth || balance > bestBalanceMonth.value) {
      bestBalanceMonth = {
        value: Math.round(balance * 100) / 100,
        month,
      }
    }
  }

  // Find largest individual transactions
  let largestIncome: FinancialRecords["largestIncome"] = null
  let largestExpense: FinancialRecords["largestExpense"] = null

  for (const tx of transactions) {
    const amountMXN = tx.currency === "USD" ? tx.amount * exchangeRate : tx.amount

    if (isIncomeTransaction(tx)) {
      if (!largestIncome || amountMXN > largestIncome.value) {
        largestIncome = {
          value: Math.round(amountMXN * 100) / 100,
          date: tx.date.toISOString(),
          description: tx.description,
        }
      }
    } else {
      const absAmount = Math.abs(amountMXN)
      if (!largestExpense || absAmount > largestExpense.value) {
        largestExpense = {
          value: Math.round(absAmount * 100) / 100,
          date: tx.date.toISOString(),
          description: tx.description,
        }
      }
    }
  }

  return {
    bestIncomeMonth,
    lowestExpenseMonth,
    bestBalanceMonth,
    largestIncome,
    largestExpense,
  }
}
