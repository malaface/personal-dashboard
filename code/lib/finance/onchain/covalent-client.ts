import { prisma } from "@/lib/db/prisma"
import { decryptAPIKey } from "@/lib/ai/encryption"

const BASE_URL = "https://api.covalenthq.com/v1"
const MAX_RETRIES = 3
const BASE_DELAY_MS = 1000

// GoldRush API uses chain names instead of numeric IDs
const CHAIN_NAME_MAP: Record<string, string> = {
  ARBITRUM: "arbitrum-mainnet",
  ETHEREUM: "eth-mainnet",
}

const DEFAULT_CHAIN_NAME = "arbitrum-mainnet"


interface CovalentTxItem {
  tx_hash: string
  block_height: number
  block_signed_at: string
  from_address: string
  to_address: string | null
  value: string
  gas_spent: number
  gas_price: number
  gas_quote: number | null
  gas_quote_rate: number | null
  successful: boolean
  log_events: CovalentLogEvent[]
}

interface CovalentLogEvent {
  sender_address: string
  sender_name: string | null
  sender_contract_decimals: number | null
  sender_contract_ticker_symbol: string | null
  decoded: {
    name: string
    signature: string
    params: Array<{
      name: string
      type: string
      value: string
    }>
  } | null
}

interface CovalentERC20Transfer {
  block_signed_at: string
  tx_hash: string
  from_address: string
  to_address: string
  contract_decimals: number
  contract_name: string
  contract_ticker_symbol: string
  contract_address: string
  logo_url: string | null
  transfer_type: "IN" | "OUT"
  delta: string
  balance: number | null
  quote_rate: number | null
  delta_quote: number | null
}

interface CovalentResponse<T> {
  data: {
    items: T[]
    pagination: {
      has_more: boolean
      page_number: number
      page_size: number
    } | null
  }
  error: boolean
  error_message: string | null
  error_code: number | null
}

export type { CovalentTxItem, CovalentERC20Transfer, CovalentLogEvent }

/**
 * Resolve network name to GoldRush chain name
 */
export function getChainName(network?: string): string {
  if (!network) return DEFAULT_CHAIN_NAME
  return CHAIN_NAME_MAP[network.toUpperCase()] ?? DEFAULT_CHAIN_NAME
}

/**
 * Get and decrypt Covalent API key for a user
 */
export async function getCovalentApiKey(userId: string): Promise<string | null> {
  const credential = await prisma.aICredential.findFirst({
    where: {
      userId,
      provider: "COVALENT",
      isActive: true,
    },
  })

  if (!credential) return null

  return decryptAPIKey(credential.apiKey)
}

/**
 * Fetch with exponential backoff retry
 */
async function fetchWithRetry(
  url: string,
  apiKey: string,
  retries = MAX_RETRIES
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    console.log(`[Covalent] Fetching: ${url}`)
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (response.ok) return response

    // Log response body for debugging
    const errorBody = await response.text()
    console.error(`[Covalent] Error ${response.status}: ${errorBody}`)

    // Rate limited - retry with backoff
    if (response.status === 429 && attempt < retries) {
      const delay = BASE_DELAY_MS * Math.pow(2, attempt)
      await new Promise((r) => setTimeout(r, delay))
      continue
    }

    throw new Error(
      `Covalent API error: ${response.status} ${response.statusText}`
    )
  }

  throw new Error("Max retries exceeded")
}

/**
 * Fetch transaction history for a wallet using transactions_v3
 */
export async function fetchTransactionHistory(
  apiKey: string,
  walletAddress: string,
  chainName: string = DEFAULT_CHAIN_NAME,
  pageSize: number = 100,
  pageNumber: number = 0
): Promise<CovalentTxItem[]> {
  const url = `${BASE_URL}/${chainName}/address/${walletAddress}/transactions_v3/?page-size=${pageSize}&page-number=${pageNumber}`

  const response = await fetchWithRetry(url, apiKey)
  const data: CovalentResponse<CovalentTxItem> = await response.json()

  if (data.error) {
    throw new Error(`Covalent error: ${data.error_message}`)
  }

  return data.data.items
}

/**
 * Extract ERC-20 transfers from transaction log events
 */
function extractTransfersFromTx(
  tx: CovalentTxItem,
  walletAddress: string
): CovalentERC20Transfer[] {
  const transfers: CovalentERC20Transfer[] = []
  const wallet = walletAddress.toLowerCase()

  if (!tx.log_events) return transfers

  // Debug: log all decoded event names for this tx
  const decodedEvents = tx.log_events
    .filter((l) => l.decoded)
    .map((l) => `${l.decoded!.name}:${l.decoded!.signature}`)
  if (decodedEvents.length > 0) {
    console.log(`[Covalent] TX ${tx.tx_hash} events:`, decodedEvents)
  } else {
    console.log(`[Covalent] TX ${tx.tx_hash} has ${tx.log_events.length} log_events, 0 decoded`)
  }

  for (const log of tx.log_events) {
    if (!log.decoded) continue
    if (log.decoded.name !== "Transfer") continue

    const fromParam = log.decoded.params.find((p) => p.name === "from")
    const toParam = log.decoded.params.find((p) => p.name === "to")
    const valueParam = log.decoded.params.find((p) => p.name === "value")

    if (!fromParam || !toParam || !valueParam) continue

    const from = fromParam.value.toLowerCase()
    const to = toParam.value.toLowerCase()

    // Only include transfers involving the wallet
    if (from !== wallet && to !== wallet) continue

    transfers.push({
      block_signed_at: tx.block_signed_at,
      tx_hash: tx.tx_hash,
      from_address: fromParam.value,
      to_address: toParam.value,
      contract_decimals: log.sender_contract_decimals ?? 18,
      contract_name: log.sender_name ?? "",
      contract_ticker_symbol: log.sender_contract_ticker_symbol ?? "",
      contract_address: log.sender_address,
      logo_url: null,
      transfer_type: from === wallet ? "OUT" : "IN",
      delta: valueParam.value,
      balance: null,
      quote_rate: null,
      delta_quote: null,
    })
  }

  return transfers
}

/**
 * Fetch all ERC-20 transfers by using transactions_v3 and extracting Transfer events
 */
export async function fetchAllERC20Transfers(
  apiKey: string,
  walletAddress: string,
  chainName: string = DEFAULT_CHAIN_NAME
): Promise<CovalentERC20Transfer[]> {
  const allTransfers: CovalentERC20Transfer[] = []
  let pageNumber = 0
  let hasMore = true

  while (hasMore) {
    const url = `${BASE_URL}/${chainName}/address/${walletAddress}/transactions_v3/?page-size=100&page-number=${pageNumber}`
    const response = await fetchWithRetry(url, apiKey)
    const data: CovalentResponse<CovalentTxItem> = await response.json()

    if (data.error) {
      throw new Error(`Covalent error: ${data.error_message}`)
    }

    // Extract ERC-20 transfers from each transaction's log events
    for (const tx of data.data.items) {
      if (!tx.successful) continue
      const transfers = extractTransfersFromTx(tx, walletAddress)
      allTransfers.push(...transfers)
    }

    hasMore = data.data.pagination?.has_more ?? false
    pageNumber++

    // Safety limit
    if (pageNumber > 50) break
  }

  console.log(
    `[Covalent] Extracted ${allTransfers.length} ERC-20 transfers from ${pageNumber} pages of transactions`
  )

  return allTransfers
}
