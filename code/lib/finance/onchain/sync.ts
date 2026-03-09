import { prisma } from "@/lib/db/prisma"
import { getCovalentApiKey, fetchAllERC20Transfers, getChainName } from "./covalent-client"
import { getArbiscanApiKey, fetchArbiscanERC20Transfers } from "./arbiscan-client"
import {
  fetchHyperliquidTrades,
  normalizeHyperliquidTrade,
} from "./hyperliquid-client"
import { parseAllTransfers } from "./parser"
import type { Prisma, OnchainDataSource } from "@prisma/client"
import type { CovalentERC20Transfer } from "./covalent-client"

interface SyncResult {
  success: boolean
  transactionsProcessed: number
  newTransactions: number
  dataSource?: string
  error?: string
}

/**
 * Fetch ERC-20 transfers using available API (Arbiscan preferred, Covalent fallback)
 */
async function fetchTransfers(
  userId: string,
  walletAddress: string,
  network: string
): Promise<{ transfers: CovalentERC20Transfer[]; source: OnchainDataSource }> {
  // Try Arbiscan first (full history, free)
  const arbiscanKey = await getArbiscanApiKey(userId)
  if (arbiscanKey) {
    console.log("[Sync] Using Arbiscan API (primary)")
    const transfers = await fetchArbiscanERC20Transfers(arbiscanKey, walletAddress)
    return { transfers, source: "ARBISCAN" }
  }

  // Fallback to Covalent
  const covalentKey = await getCovalentApiKey(userId)
  if (covalentKey) {
    console.log("[Sync] Using Covalent API (fallback)")
    const chainName = getChainName(network)
    const transfers = await fetchAllERC20Transfers(covalentKey, walletAddress, chainName)
    return { transfers, source: "COVALENT" }
  }

  throw new Error("No se encontró API key de Arbiscan ni Covalent. Configura al menos una.")
}

/**
 * Sync a single wallet: fetch, parse, classify, upsert
 */
export async function syncWallet(
  walletId: string,
  userId: string
): Promise<SyncResult> {
  // 1. Get wallet from DB
  const wallet = await prisma.onchainWallet.findFirst({
    where: { id: walletId, userId },
  })

  if (!wallet) {
    return {
      success: false,
      transactionsProcessed: 0,
      newTransactions: 0,
      error: "Wallet no encontrada",
    }
  }

  try {
    let newTxCount = 0

    // 2. Fetch ERC-20 transfers (Arbiscan preferred)
    const { transfers, source } = await fetchTransfers(userId, wallet.address, wallet.network)

    // 3. Parse and classify
    const parsedTxs = parseAllTransfers(transfers, wallet.address)

    // 4. Filter by date range (last sync or all history for first sync)
    const sinceDate = wallet.lastSyncAt
      ? wallet.lastSyncAt
      : new Date(0) // First sync: import all history

    if (parsedTxs.length > 0) {
      const dates = parsedTxs.map((tx) => tx.timestamp)
      const oldest = new Date(Math.min(...dates.map((d) => d.getTime())))
      const newest = new Date(Math.max(...dates.map((d) => d.getTime())))
      console.log(
        `[Sync] ${parsedTxs.length} parsed txs via ${source}, range: ${oldest.toISOString()} to ${newest.toISOString()}, sinceDate: ${sinceDate.toISOString()}`
      )
    }

    const filteredTxs = parsedTxs.filter((tx) => tx.timestamp >= sinceDate)

    // 5. Upsert transactions
    for (const tx of filteredTxs) {
      const data: Prisma.OnchainTransactionUncheckedCreateInput = {
        walletId: wallet.id,
        txHash: tx.txHash,
        blockNumber: 0,
        timestamp: tx.timestamp,
        type: tx.type,
        status: tx.type !== "UNKNOWN" ? "CLASSIFIED" : "RAW",
        dataSource: source,
        tokenSoldAddress: tx.tokenSoldAddress,
        tokenSoldSymbol: tx.tokenSoldSymbol,
        tokenSoldAmount: tx.tokenSoldAmount,
        tokenSoldPriceUSD: tx.tokenSoldPriceUSD,
        tokenBoughtAddress: tx.tokenBoughtAddress,
        tokenBoughtSymbol: tx.tokenBoughtSymbol,
        tokenBoughtAmount: tx.tokenBoughtAmount,
        tokenBoughtPriceUSD: tx.tokenBoughtPriceUSD,
        gasFeeUSD: tx.gasFeeUSD,
      }

      const result = await prisma.onchainTransaction.upsert({
        where: {
          walletId_txHash: {
            walletId: wallet.id,
            txHash: tx.txHash,
          },
        },
        update: {
          type: data.type,
          status: data.status,
          tokenSoldAddress: data.tokenSoldAddress,
          tokenSoldSymbol: data.tokenSoldSymbol,
          tokenSoldAmount: data.tokenSoldAmount,
          tokenSoldPriceUSD: data.tokenSoldPriceUSD,
          tokenBoughtAddress: data.tokenBoughtAddress,
          tokenBoughtSymbol: data.tokenBoughtSymbol,
          tokenBoughtAmount: data.tokenBoughtAmount,
          tokenBoughtPriceUSD: data.tokenBoughtPriceUSD,
          gasFeeUSD: data.gasFeeUSD,
        },
        create: data,
      })

      if (result.createdAt.getTime() === result.updatedAt.getTime()) {
        newTxCount++
      }
    }

    // 6. Fetch Hyperliquid trades
    try {
      const hlStartTime = sinceDate.getTime()
      const hlTrades = await fetchHyperliquidTrades(
        wallet.address,
        hlStartTime
      )

      for (const fill of hlTrades) {
        const normalized = normalizeHyperliquidTrade(fill)
        const hlData: Prisma.OnchainTransactionUncheckedCreateInput = {
          walletId: wallet.id,
          txHash: normalized.txHash,
          blockNumber: normalized.blockNumber,
          timestamp: normalized.timestamp,
          type: normalized.type,
          status: "CLASSIFIED",
          dataSource: normalized.dataSource,
          tokenSoldSymbol: normalized.tokenSoldSymbol,
          tokenSoldAmount: normalized.tokenSoldAmount,
          tokenSoldPriceUSD: normalized.tokenSoldPriceUSD,
          tokenBoughtSymbol: normalized.tokenBoughtSymbol,
          tokenBoughtAmount: normalized.tokenBoughtAmount,
          tokenBoughtPriceUSD: normalized.tokenBoughtPriceUSD,
          gasFeeUSD: normalized.gasFeeUSD,
          rawData: normalized.rawData as Prisma.InputJsonValue,
        }

        const result = await prisma.onchainTransaction.upsert({
          where: {
            walletId_txHash: {
              walletId: wallet.id,
              txHash: normalized.txHash,
            },
          },
          update: {},
          create: hlData,
        })

        if (result.createdAt.getTime() === result.updatedAt.getTime()) {
          newTxCount++
        }
      }
    } catch (hlError) {
      console.warn("Hyperliquid sync failed (non-critical):", hlError)
    }

    // 7. Update lastSyncAt
    await prisma.onchainWallet.update({
      where: { id: wallet.id },
      data: { lastSyncAt: new Date() },
    })

    return {
      success: true,
      transactionsProcessed: filteredTxs.length,
      newTransactions: newTxCount,
      dataSource: source,
    }
  } catch (error: unknown) {
    console.error(`Sync wallet ${walletId} error:`, error)
    const message = error instanceof Error ? error.message : "Error al sincronizar"
    return {
      success: false,
      transactionsProcessed: 0,
      newTransactions: 0,
      error: message,
    }
  }
}

/**
 * Sync all active wallets for a user
 */
export async function syncAllActiveWallets(
  userId: string
): Promise<SyncResult[]> {
  const wallets = await prisma.onchainWallet.findMany({
    where: { userId, isActive: true },
  })

  const results: SyncResult[] = []

  for (const wallet of wallets) {
    const result = await syncWallet(wallet.id, userId)
    results.push(result)
  }

  return results
}
