const HYPERLIQUID_API_URL = "https://api.hyperliquid.xyz/info"

interface HyperliquidFill {
  coin: string
  px: string // price
  sz: string // size
  side: "A" | "B" // A = buy, B = sell
  time: number // timestamp ms
  startPosition: string
  dir: string
  closedPnl: string
  hash: string
  oid: number
  crossed: boolean
  fee: string
  tid: number
  cloid: string | null
}

interface HyperliquidPosition {
  coin: string
  entryPx: string | null
  leverage: { type: string; value: number }
  liquidationPx: string | null
  marginUsed: string
  positionValue: string
  returnOnEquity: string
  szi: string // signed size
  unrealizedPnl: string
}

interface HyperliquidClearinghouseState {
  assetPositions: Array<{
    position: HyperliquidPosition
    type: string
  }>
  crossMarginSummary: {
    accountValue: string
    totalMarginUsed: string
    totalNtlPos: string
    totalRawUsd: string
  }
}

export type { HyperliquidFill, HyperliquidPosition }

/**
 * Fetch user trade fills from Hyperliquid (public API, no key required)
 */
export async function fetchHyperliquidTrades(
  walletAddress: string,
  startTime?: number
): Promise<HyperliquidFill[]> {
  const body: Record<string, unknown> = {
    type: "userFills",
    user: walletAddress,
  }

  if (startTime) {
    body.startTime = startTime
  }

  const response = await fetch(HYPERLIQUID_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    throw new Error(`Hyperliquid API error: ${response.status}`)
  }

  return response.json()
}

/**
 * Fetch current positions from Hyperliquid
 */
export async function fetchHyperliquidPositions(
  walletAddress: string
): Promise<HyperliquidPosition[]> {
  const response = await fetch(HYPERLIQUID_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "clearinghouseState",
      user: walletAddress,
    }),
  })

  if (!response.ok) {
    throw new Error(`Hyperliquid API error: ${response.status}`)
  }

  const data: HyperliquidClearinghouseState = await response.json()

  return data.assetPositions.map((ap) => ap.position)
}

/**
 * Normalize a Hyperliquid trade fill into the format needed for OnchainTransaction
 */
export function normalizeHyperliquidTrade(fill: HyperliquidFill) {
  const isBuy = fill.side === "A"
  const size = parseFloat(fill.sz)
  const price = parseFloat(fill.px)
  const usdValue = size * price
  const fee = parseFloat(fill.fee)

  return {
    txHash: fill.hash || `hl-${fill.tid}`,
    blockNumber: 0, // Hyperliquid doesn't use blocks
    timestamp: new Date(fill.time),
    type: "SWAP" as const,
    dataSource: "HYPERLIQUID" as const,
    tokenSoldSymbol: isBuy ? "USD" : fill.coin,
    tokenSoldAmount: isBuy ? usdValue : size,
    tokenSoldPriceUSD: isBuy ? 1 : price,
    tokenSoldAddress: null,
    tokenBoughtSymbol: isBuy ? fill.coin : "USD",
    tokenBoughtAmount: isBuy ? size : usdValue,
    tokenBoughtPriceUSD: isBuy ? price : 1,
    tokenBoughtAddress: null,
    gasFeeETH: null,
    gasFeeUSD: fee,
    rawData: fill as unknown as Record<string, unknown>,
  }
}
