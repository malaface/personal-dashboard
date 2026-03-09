import { prisma } from "@/lib/db/prisma"
import { getUSDtoMXNRate } from "../exchange-rate"
import type { Prisma } from "@prisma/client"

interface InventoryState {
  totalAmount: number
  avgCostBasisUSD: number
  avgCostBasisMXN: number
}

/**
 * Calculate new average cost when adding tokens to inventory
 */
export function calculateAverageCost(
  inventory: InventoryState,
  newAmount: number,
  newCostUSD: number,
  newCostMXN: number
): InventoryState {
  const totalOldCostUSD = inventory.totalAmount * inventory.avgCostBasisUSD
  const totalOldCostMXN = inventory.totalAmount * inventory.avgCostBasisMXN
  const newTotalAmount = inventory.totalAmount + newAmount

  if (newTotalAmount <= 0) {
    return { totalAmount: 0, avgCostBasisUSD: 0, avgCostBasisMXN: 0 }
  }

  return {
    totalAmount: newTotalAmount,
    avgCostBasisUSD: (totalOldCostUSD + newCostUSD) / newTotalAmount,
    avgCostBasisMXN: (totalOldCostMXN + newCostMXN) / newTotalAmount,
  }
}

/**
 * Get fiscal period string from a date (e.g., "2026-03")
 */
function getFiscalPeriod(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  return `${year}-${month}`
}

/**
 * Process all classified SWAP transactions for a wallet and generate fiscal events.
 * Uses Average Cost method (Costo Promedio) per SAT Mexico rules.
 */
export async function processBatchFiscalEvents(
  walletId: string
): Promise<{ processed: number; errors: number }> {
  const exchangeRate = await getUSDtoMXNRate()

  // Get all classified transactions ordered chronologically
  const transactions = await prisma.onchainTransaction.findMany({
    where: {
      walletId,
      status: { in: ["CLASSIFIED", "MANUALLY_OVERRIDDEN"] },
      type: "SWAP",
      fiscalEvent: null, // Only unprocessed
    },
    orderBy: { timestamp: "asc" },
  })

  let processed = 0
  let errors = 0

  for (const tx of transactions) {
    try {
      await prisma.$transaction(async (prismaClient) => {
        // Get or create inventory for the sold token
        if (tx.tokenSoldAddress && tx.tokenSoldAmount && tx.tokenSoldPriceUSD) {
          const soldInventory =
            await prismaClient.onchainTokenInventory.findUnique({
              where: {
                walletId_tokenAddress: {
                  walletId,
                  tokenAddress: tx.tokenSoldAddress,
                },
              },
            })

          const currentInventory: InventoryState = soldInventory
            ? {
                totalAmount: soldInventory.totalAmount,
                avgCostBasisUSD: soldInventory.avgCostBasisUSD,
                avgCostBasisMXN: soldInventory.avgCostBasisMXN,
              }
            : { totalAmount: 0, avgCostBasisUSD: 0, avgCostBasisMXN: 0 }

          // Calculate fiscal event
          const costBasisUSD =
            currentInventory.avgCostBasisUSD * tx.tokenSoldAmount
          const costBasisMXN =
            currentInventory.avgCostBasisMXN * tx.tokenSoldAmount
          const proceedsUSD = tx.tokenSoldPriceUSD * tx.tokenSoldAmount
          const proceedsMXN = proceedsUSD * exchangeRate
          const gasFee = tx.gasFeeUSD || 0
          const gainLossUSD = proceedsUSD - costBasisUSD - gasFee
          const gainLossMXN = proceedsMXN - costBasisMXN - gasFee * exchangeRate

          // Create fiscal event
          await prismaClient.onchainFiscalEvent.create({
            data: {
              transactionId: tx.id,
              method: "AVERAGE_COST",
              costBasisUSD,
              costBasisMXN,
              proceedsUSD,
              proceedsMXN,
              gainLossUSD,
              gainLossMXN,
              gasFeeDeduction: gasFee,
              fiscalPeriod: getFiscalPeriod(tx.timestamp),
              exchangeRate,
            },
          })

          // Update sold token inventory (reduce)
          const newSoldAmount = Math.max(
            0,
            currentInventory.totalAmount - tx.tokenSoldAmount
          )
          await prismaClient.onchainTokenInventory.upsert({
            where: {
              walletId_tokenAddress: {
                walletId,
                tokenAddress: tx.tokenSoldAddress,
              },
            },
            update: {
              totalAmount: newSoldAmount,
            },
            create: {
              walletId,
              tokenAddress: tx.tokenSoldAddress,
              tokenSymbol: tx.tokenSoldSymbol || "UNKNOWN",
              totalAmount: newSoldAmount,
              avgCostBasisUSD: currentInventory.avgCostBasisUSD,
              avgCostBasisMXN: currentInventory.avgCostBasisMXN,
            },
          })
        }

        // Update bought token inventory (add)
        if (
          tx.tokenBoughtAddress &&
          tx.tokenBoughtAmount &&
          tx.tokenBoughtPriceUSD
        ) {
          const boughtInventory =
            await prismaClient.onchainTokenInventory.findUnique({
              where: {
                walletId_tokenAddress: {
                  walletId,
                  tokenAddress: tx.tokenBoughtAddress,
                },
              },
            })

          const currentBought: InventoryState = boughtInventory
            ? {
                totalAmount: boughtInventory.totalAmount,
                avgCostBasisUSD: boughtInventory.avgCostBasisUSD,
                avgCostBasisMXN: boughtInventory.avgCostBasisMXN,
              }
            : { totalAmount: 0, avgCostBasisUSD: 0, avgCostBasisMXN: 0 }

          const newCostUSD =
            tx.tokenBoughtPriceUSD * tx.tokenBoughtAmount
          const newCostMXN = newCostUSD * exchangeRate

          const updatedBought = calculateAverageCost(
            currentBought,
            tx.tokenBoughtAmount,
            newCostUSD,
            newCostMXN
          )

          await prismaClient.onchainTokenInventory.upsert({
            where: {
              walletId_tokenAddress: {
                walletId,
                tokenAddress: tx.tokenBoughtAddress,
              },
            },
            update: {
              totalAmount: updatedBought.totalAmount,
              avgCostBasisUSD: updatedBought.avgCostBasisUSD,
              avgCostBasisMXN: updatedBought.avgCostBasisMXN,
              tokenSymbol: tx.tokenBoughtSymbol || "UNKNOWN",
            },
            create: {
              walletId,
              tokenAddress: tx.tokenBoughtAddress,
              tokenSymbol: tx.tokenBoughtSymbol || "UNKNOWN",
              totalAmount: updatedBought.totalAmount,
              avgCostBasisUSD: updatedBought.avgCostBasisUSD,
              avgCostBasisMXN: updatedBought.avgCostBasisMXN,
            },
          })
        }

        // Update transaction status
        await prismaClient.onchainTransaction.update({
          where: { id: tx.id },
          data: { status: "FISCAL_PROCESSED" },
        })
      })

      processed++
    } catch (error) {
      console.error(`Fiscal processing error for tx ${tx.id}:`, error)
      errors++
    }
  }

  return { processed, errors }
}

/**
 * Generate fiscal summary for a user by period
 */
export async function generateFiscalSummary(
  userId: string,
  period?: string
) {
  const wallets = await prisma.onchainWallet.findMany({
    where: { userId },
    select: { id: true },
  })

  const walletIds = wallets.map((w) => w.id)

  const where: Prisma.OnchainFiscalEventWhereInput = {
    transaction: {
      walletId: { in: walletIds },
    },
    ...(period && { fiscalPeriod: period }),
  }

  const events = await prisma.onchainFiscalEvent.findMany({
    where,
    include: {
      transaction: {
        select: {
          tokenSoldSymbol: true,
          tokenSoldAmount: true,
          tokenSoldPriceUSD: true,
          tokenBoughtSymbol: true,
          tokenBoughtAmount: true,
          tokenBoughtPriceUSD: true,
          timestamp: true,
          dataSource: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  })

  const totalGainLossUSD = events.reduce((sum, e) => sum + e.gainLossUSD, 0)
  const totalGainLossMXN = events.reduce((sum, e) => sum + e.gainLossMXN, 0)
  const totalCostBasisUSD = events.reduce((sum, e) => sum + e.costBasisUSD, 0)
  const totalProceedsUSD = events.reduce((sum, e) => sum + e.proceedsUSD, 0)
  const totalGasFees = events.reduce((sum, e) => sum + e.gasFeeDeduction, 0)

  // Group by period
  const byPeriod: Record<
    string,
    { gainLossUSD: number; gainLossMXN: number; count: number }
  > = {}

  for (const event of events) {
    if (!byPeriod[event.fiscalPeriod]) {
      byPeriod[event.fiscalPeriod] = {
        gainLossUSD: 0,
        gainLossMXN: 0,
        count: 0,
      }
    }
    byPeriod[event.fiscalPeriod].gainLossUSD += event.gainLossUSD
    byPeriod[event.fiscalPeriod].gainLossMXN += event.gainLossMXN
    byPeriod[event.fiscalPeriod].count++
  }

  return {
    events,
    summary: {
      totalEvents: events.length,
      totalGainLossUSD,
      totalGainLossMXN,
      totalCostBasisUSD,
      totalProceedsUSD,
      totalGasFees,
      byPeriod,
    },
  }
}

/**
 * Recalculate all fiscal events for a wallet (destructive - deletes and reprocesses)
 */
export async function recalculateFiscalEvents(
  walletId: string
): Promise<{ processed: number; errors: number }> {
  // Delete existing fiscal events and reset inventory
  await prisma.$transaction([
    prisma.onchainFiscalEvent.deleteMany({
      where: { transaction: { walletId } },
    }),
    prisma.onchainTokenInventory.deleteMany({
      where: { walletId },
    }),
    prisma.onchainTransaction.updateMany({
      where: { walletId, status: "FISCAL_PROCESSED" },
      data: { status: "CLASSIFIED" },
    }),
  ])

  // Reprocess
  return processBatchFiscalEvents(walletId)
}
