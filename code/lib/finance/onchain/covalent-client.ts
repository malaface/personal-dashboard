import { prisma } from "@/lib/db/prisma"
import { decryptAPIKey } from "@/lib/ai/encryption"

const ARBITRUM_CHAIN_ID = 42161
const BASE_URL = "https://api.covalenthq.com/v1"
const MAX_RETRIES = 3
const BASE_DELAY_MS = 1000

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
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (response.ok) return response

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
 * Fetch transaction history for a wallet on Arbitrum
 */
export async function fetchTransactionHistory(
  apiKey: string,
  walletAddress: string,
  chainId: number = ARBITRUM_CHAIN_ID,
  pageSize: number = 100,
  pageNumber: number = 0
): Promise<CovalentTxItem[]> {
  const url = `${BASE_URL}/${chainId}/address/${walletAddress}/transactions_v3/?page-size=${pageSize}&page-number=${pageNumber}`

  const response = await fetchWithRetry(url, apiKey)
  const data: CovalentResponse<CovalentTxItem> = await response.json()

  if (data.error) {
    throw new Error(`Covalent error: ${data.error_message}`)
  }

  return data.data.items
}

/**
 * Fetch ERC-20 token transfers for a wallet
 */
export async function fetchERC20Transfers(
  apiKey: string,
  walletAddress: string,
  chainId: number = ARBITRUM_CHAIN_ID,
  startDate?: string,
  endDate?: string
): Promise<CovalentERC20Transfer[]> {
  let url = `${BASE_URL}/${chainId}/address/${walletAddress}/transfers_v2/?page-size=1000`

  if (startDate) url += `&starting-block=${startDate}`
  if (endDate) url += `&ending-block=${endDate}`

  const response = await fetchWithRetry(url, apiKey)
  const data: CovalentResponse<CovalentERC20Transfer> = await response.json()

  if (data.error) {
    throw new Error(`Covalent error: ${data.error_message}`)
  }

  return data.data.items
}

/**
 * Fetch all transfers with pagination
 */
export async function fetchAllERC20Transfers(
  apiKey: string,
  walletAddress: string,
  chainId: number = ARBITRUM_CHAIN_ID
): Promise<CovalentERC20Transfer[]> {
  const allTransfers: CovalentERC20Transfer[] = []
  let pageNumber = 0
  let hasMore = true

  while (hasMore) {
    const url = `${BASE_URL}/${chainId}/address/${walletAddress}/transfers_v2/?page-size=1000&page-number=${pageNumber}`
    const response = await fetchWithRetry(url, apiKey)
    const data: CovalentResponse<CovalentERC20Transfer> = await response.json()

    if (data.error) {
      throw new Error(`Covalent error: ${data.error_message}`)
    }

    allTransfers.push(...data.data.items)
    hasMore = data.data.pagination?.has_more ?? false
    pageNumber++

    // Safety limit
    if (pageNumber > 50) break
  }

  return allTransfers
}
