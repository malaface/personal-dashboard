import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"
import { syncAllActiveWallets } from "@/lib/finance/onchain/sync"
import { processBatchFiscalEvents } from "@/lib/finance/onchain/fiscal-engine"

/**
 * POST /api/cron/onchain
 * Protected with CRON_SECRET - trigger via n8n or crontab
 * Syncs all active wallets for all users with Arbiscan or Covalent credentials
 */
export async function POST(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Find all users with active blockchain API credentials (Arbiscan or Covalent)
    const credentials = await prisma.aICredential.findMany({
      where: {
        provider: { in: ["ARBISCAN", "COVALENT"] },
        isActive: true,
      },
      select: {
        userId: true,
      },
      distinct: ["userId"],
    })

    const results: Array<{
      userId: string
      walletsSynced: number
      totalNewTx: number
      fiscalProcessed: number
    }> = []

    for (const { userId } of credentials) {
      const syncResults = await syncAllActiveWallets(userId)

      // Process fiscal events for each wallet
      const wallets = await prisma.onchainWallet.findMany({
        where: { userId, isActive: true },
        select: { id: true },
      })

      let totalFiscal = 0
      for (const wallet of wallets) {
        const fiscal = await processBatchFiscalEvents(wallet.id)
        totalFiscal += fiscal.processed
      }

      results.push({
        userId: userId.substring(0, 8) + "...",
        walletsSynced: syncResults.length,
        totalNewTx: syncResults.reduce((s, r) => s + r.newTransactions, 0),
        fiscalProcessed: totalFiscal,
      })
    }

    return NextResponse.json({
      success: true,
      usersProcessed: credentials.length,
      results,
      timestamp: new Date().toISOString(),
    })
  } catch (error: unknown) {
    console.error("Cron onchain error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    )
  }
}
