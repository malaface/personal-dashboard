import type { CovalentERC20Transfer } from "./covalent-client"

// Known Uniswap V3 contract addresses on Arbitrum
const UNISWAP_V3_ROUTERS = new Set([
  "0xe592427a0aece92de3edee1f18e0157c05861564", // SwapRouter
  "0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45", // SwapRouter02
])

const UNISWAP_V3_POSITION_MANAGER =
  "0xc36442b4a4522e871399cd717abdd847ab11fe88"

type TxType =
  | "SWAP"
  | "LP_ADD"
  | "LP_REMOVE"
  | "TRANSFER_IN"
  | "TRANSFER_OUT"
  | "APPROVAL"
  | "BRIDGE"
  | "UNKNOWN"

interface ParsedTransaction {
  txHash: string
  type: TxType
  timestamp: Date
  tokenSoldAddress: string | null
  tokenSoldSymbol: string | null
  tokenSoldAmount: number | null
  tokenSoldPriceUSD: number | null
  tokenBoughtAddress: string | null
  tokenBoughtSymbol: string | null
  tokenBoughtAmount: number | null
  tokenBoughtPriceUSD: number | null
  gasFeeUSD: number | null
}

export type { ParsedTransaction, TxType }

/**
 * Group ERC-20 transfers by tx_hash
 */
function groupByTxHash(
  transfers: CovalentERC20Transfer[]
): Map<string, CovalentERC20Transfer[]> {
  const groups = new Map<string, CovalentERC20Transfer[]>()
  for (const t of transfers) {
    const existing = groups.get(t.tx_hash) || []
    existing.push(t)
    groups.set(t.tx_hash, existing)
  }
  return groups
}

/**
 * Classify a group of transfers within a single transaction
 */
export function classifyTransaction(
  transfers: CovalentERC20Transfer[],
  walletAddress: string
): TxType {
  const wallet = walletAddress.toLowerCase()
  const outgoing = transfers.filter(
    (t) => t.from_address.toLowerCase() === wallet
  )
  const incoming = transfers.filter(
    (t) => t.to_address.toLowerCase() === wallet
  )

  // Check if any transfer involves Uniswap V3 routers
  const involvesUniswapRouter = transfers.some(
    (t) =>
      UNISWAP_V3_ROUTERS.has(t.from_address.toLowerCase()) ||
      UNISWAP_V3_ROUTERS.has(t.to_address.toLowerCase())
  )

  const involvesPositionManager = transfers.some(
    (t) =>
      t.from_address.toLowerCase() === UNISWAP_V3_POSITION_MANAGER ||
      t.to_address.toLowerCase() === UNISWAP_V3_POSITION_MANAGER
  )

  // SWAP: wallet sends 1 token, receives 1 different token (via router)
  if (
    outgoing.length >= 1 &&
    incoming.length >= 1 &&
    (involvesUniswapRouter || outgoing.length === 1 && incoming.length === 1)
  ) {
    return "SWAP"
  }

  // LP_ADD: wallet sends 2 tokens to position manager
  if (outgoing.length >= 2 && involvesPositionManager) {
    return "LP_ADD"
  }

  // LP_REMOVE: wallet receives 2 tokens from position manager
  if (incoming.length >= 2 && involvesPositionManager) {
    return "LP_REMOVE"
  }

  // Simple transfer
  if (outgoing.length > 0 && incoming.length === 0) {
    return "TRANSFER_OUT"
  }
  if (incoming.length > 0 && outgoing.length === 0) {
    return "TRANSFER_IN"
  }

  return "UNKNOWN"
}

/**
 * Parse a swap transaction from ERC-20 transfers
 */
export function parseSwap(
  transfers: CovalentERC20Transfer[],
  walletAddress: string
): Pick<
  ParsedTransaction,
  | "tokenSoldAddress"
  | "tokenSoldSymbol"
  | "tokenSoldAmount"
  | "tokenSoldPriceUSD"
  | "tokenBoughtAddress"
  | "tokenBoughtSymbol"
  | "tokenBoughtAmount"
  | "tokenBoughtPriceUSD"
> {
  const wallet = walletAddress.toLowerCase()
  const outgoing = transfers.find(
    (t) => t.from_address.toLowerCase() === wallet
  )
  const incoming = transfers.find(
    (t) => t.to_address.toLowerCase() === wallet
  )

  return {
    tokenSoldAddress: outgoing?.contract_address || null,
    tokenSoldSymbol: outgoing?.contract_ticker_symbol || null,
    tokenSoldAmount: outgoing
      ? parseFloat(outgoing.delta) / Math.pow(10, outgoing.contract_decimals)
      : null,
    tokenSoldPriceUSD: outgoing?.quote_rate || null,
    tokenBoughtAddress: incoming?.contract_address || null,
    tokenBoughtSymbol: incoming?.contract_ticker_symbol || null,
    tokenBoughtAmount: incoming
      ? parseFloat(incoming.delta) / Math.pow(10, incoming.contract_decimals)
      : null,
    tokenBoughtPriceUSD: incoming?.quote_rate || null,
  }
}

/**
 * Parse LP add - wallet sends 2 tokens
 */
export function parseLiquidityAdd(
  transfers: CovalentERC20Transfer[],
  walletAddress: string
): Pick<
  ParsedTransaction,
  | "tokenSoldAddress"
  | "tokenSoldSymbol"
  | "tokenSoldAmount"
  | "tokenSoldPriceUSD"
  | "tokenBoughtAddress"
  | "tokenBoughtSymbol"
  | "tokenBoughtAmount"
  | "tokenBoughtPriceUSD"
> {
  const wallet = walletAddress.toLowerCase()
  const outgoing = transfers.filter(
    (t) => t.from_address.toLowerCase() === wallet
  )

  const token0 = outgoing[0]
  const token1 = outgoing[1]

  return {
    tokenSoldAddress: token0?.contract_address || null,
    tokenSoldSymbol: token0
      ? `${token0.contract_ticker_symbol}+${token1?.contract_ticker_symbol || "?"}`
      : null,
    tokenSoldAmount: token0
      ? parseFloat(token0.delta) / Math.pow(10, token0.contract_decimals)
      : null,
    tokenSoldPriceUSD: token0?.quote_rate || null,
    tokenBoughtAddress: null,
    tokenBoughtSymbol: "LP Position",
    tokenBoughtAmount: null,
    tokenBoughtPriceUSD: null,
  }
}

/**
 * Parse LP remove - wallet receives 2 tokens
 */
export function parseLiquidityRemove(
  transfers: CovalentERC20Transfer[],
  walletAddress: string
): Pick<
  ParsedTransaction,
  | "tokenSoldAddress"
  | "tokenSoldSymbol"
  | "tokenSoldAmount"
  | "tokenSoldPriceUSD"
  | "tokenBoughtAddress"
  | "tokenBoughtSymbol"
  | "tokenBoughtAmount"
  | "tokenBoughtPriceUSD"
> {
  const wallet = walletAddress.toLowerCase()
  const incoming = transfers.filter(
    (t) => t.to_address.toLowerCase() === wallet
  )

  const token0 = incoming[0]
  const token1 = incoming[1]

  return {
    tokenSoldAddress: null,
    tokenSoldSymbol: "LP Position",
    tokenSoldAmount: null,
    tokenSoldPriceUSD: null,
    tokenBoughtAddress: token0?.contract_address || null,
    tokenBoughtSymbol: token0
      ? `${token0.contract_ticker_symbol}+${token1?.contract_ticker_symbol || "?"}`
      : null,
    tokenBoughtAmount: token0
      ? parseFloat(token0.delta) / Math.pow(10, token0.contract_decimals)
      : null,
    tokenBoughtPriceUSD: token0?.quote_rate || null,
  }
}

/**
 * Check if a transaction involves Uniswap V3
 */
export function isUniswapV3Interaction(toAddress: string | null): boolean {
  if (!toAddress) return false
  const addr = toAddress.toLowerCase()
  return (
    UNISWAP_V3_ROUTERS.has(addr) || addr === UNISWAP_V3_POSITION_MANAGER
  )
}

/**
 * Process all ERC-20 transfers and return parsed transactions
 */
export function parseAllTransfers(
  transfers: CovalentERC20Transfer[],
  walletAddress: string
): ParsedTransaction[] {
  const grouped = groupByTxHash(transfers)
  const results: ParsedTransaction[] = []

  for (const [txHash, txTransfers] of grouped) {
    const type = classifyTransaction(txTransfers, walletAddress)
    const firstTransfer = txTransfers[0]

    let tokenData: Pick<
      ParsedTransaction,
      | "tokenSoldAddress"
      | "tokenSoldSymbol"
      | "tokenSoldAmount"
      | "tokenSoldPriceUSD"
      | "tokenBoughtAddress"
      | "tokenBoughtSymbol"
      | "tokenBoughtAmount"
      | "tokenBoughtPriceUSD"
    >

    switch (type) {
      case "SWAP":
        tokenData = parseSwap(txTransfers, walletAddress)
        break
      case "LP_ADD":
        tokenData = parseLiquidityAdd(txTransfers, walletAddress)
        break
      case "LP_REMOVE":
        tokenData = parseLiquidityRemove(txTransfers, walletAddress)
        break
      default: {
        const wallet = walletAddress.toLowerCase()
        const outgoing = txTransfers.find(
          (t) => t.from_address.toLowerCase() === wallet
        )
        const incoming = txTransfers.find(
          (t) => t.to_address.toLowerCase() === wallet
        )
        tokenData = {
          tokenSoldAddress: outgoing?.contract_address || null,
          tokenSoldSymbol: outgoing?.contract_ticker_symbol || null,
          tokenSoldAmount: outgoing
            ? parseFloat(outgoing.delta) /
              Math.pow(10, outgoing.contract_decimals)
            : null,
          tokenSoldPriceUSD: outgoing?.quote_rate || null,
          tokenBoughtAddress: incoming?.contract_address || null,
          tokenBoughtSymbol: incoming?.contract_ticker_symbol || null,
          tokenBoughtAmount: incoming
            ? parseFloat(incoming.delta) /
              Math.pow(10, incoming.contract_decimals)
            : null,
          tokenBoughtPriceUSD: incoming?.quote_rate || null,
        }
      }
    }

    results.push({
      txHash,
      type,
      timestamp: new Date(firstTransfer.block_signed_at),
      gasFeeUSD: firstTransfer.delta_quote
        ? Math.abs(firstTransfer.delta_quote) * 0.001
        : null, // Approximate, real gas from tx endpoint
      ...tokenData,
    })
  }

  return results
}
