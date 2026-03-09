import { prisma } from "@/lib/db/prisma"
import { getCovalentApiKey, fetchAllERC20Transfers, getChainName } from "./covalent-client"
import {
  fetchHyperliquidTrades,
  normalizeHyperliquidTrade,
} from "./hyperliquid-client"
import { parseAllTransfers } from "./parser"
import type { Prisma } from "@prisma/client"

const SIX_MONTHS_MS = 6 * 30 * 24 * 60 * 60 * 1000

interface SyncResult {
  success: boolean
  transactionsProcessed: number
  newTransactions: number
  error?: string
}

/**
 * Sync a single wallet: fetch, parse, classify, upsert
 */
export async function syncWallet(
  walletId: string,
  userId: string
): Promise<SyncResult> {
  // 1. Get API key
  const apiKey = await getCovalentApiKey(userId)
  if (!apiKey) {
    return {
      success: false,
      transactionsProcessed: 0,
      newTransactions: 0,
      error: "No se encontró API key de Covalent",
    }
  }

  // 2. Get wallet from DB
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

    // 3. Fetch ERC-20 transfers from Covalent
    const chainName = getChainName(wallet.network)
    const transfers = await fetchAllERC20Transfers(apiKey, wallet.address, chainName)

    // 4. Parse and classify
    const parsedTxs = parseAllTransfers(transfers, wallet.address)

    // 5. Filter by date range (last sync or 6 months)
    const sinceDate = wallet.lastSyncAt
      ? wallet.lastSyncAt
      : new Date(Date.now() - SIX_MONTHS_MS)

    const filteredTxs = parsedTxs.filter((tx) => tx.timestamp >= sinceDate)

    // 6. Upsert Covalent transactions
    for (const tx of filteredTxs) {
      const data: Prisma.OnchainTransactionUncheckedCreateInput = {
        walletId: wallet.id,
        txHash: tx.txHash,
        blockNumber: 0,
        timestamp: tx.timestamp,
        type: tx.type,
        status: tx.type !== "UNKNOWN" ? "CLASSIFIED" : "RAW",
        dataSource: "COVALENT",
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

    // 7. Fetch Hyperliquid trades
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

    // 8. Update lastSyncAt
    await prisma.onchainWallet.update({
      where: { id: wallet.id },
      data: { lastSyncAt: new Date() },
    })

    return {
      success: true,
      transactionsProcessed: filteredTxs.length,
      newTransactions: newTxCount,
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
