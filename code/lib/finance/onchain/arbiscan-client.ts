import { prisma } from "@/lib/db/prisma"
import { decryptAPIKey } from "@/lib/ai/encryption"
import type { CovalentERC20Transfer } from "./covalent-client"

const BASE_URL = "https://api.etherscan.io/api"
const ARBITRUM_CHAIN_ID = 42161
const MAX_RETRIES = 3
const BASE_DELAY_MS = 1000

interface ArbiscanTokenTx {
  blockNumber: string
  timeStamp: string
  hash: string
  from: string
  to: string
  contractAddress: string
  tokenName: string
  tokenSymbol: string
  tokenDecimal: string
  value: string
  gasUsed: string
  gasPrice: string
}

interface ArbiscanResponse {
  status: string
  message: string
  result: ArbiscanTokenTx[] | string
}

/**
 * Get and decrypt Arbiscan API key for a user
 */
export async function getArbiscanApiKey(userId: string): Promise<string | null> {
  const credential = await prisma.aICredential.findFirst({
    where: {
      userId,
      provider: "ARBISCAN",
      isActive: true,
    },
  })

  if (!credential) return null

  return decryptAPIKey(credential.apiKey)
}

/**
 * Fetch with retry and rate limit handling
 */
async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<ArbiscanResponse> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    console.log(`[Arbiscan] Fetching: ${url.replace(/apikey=[^&]+/, "apikey=***")}`)
    const response = await fetch(url)

    if (!response.ok) {
      if (response.status === 429 && attempt < retries) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt)
        await new Promise((r) => setTimeout(r, delay))
        continue
      }
      throw new Error(`Arbiscan API error: ${response.status} ${response.statusText}`)
    }

    const data: ArbiscanResponse = await response.json()

    // Arbiscan returns status "0" with message for rate limits
    if (data.status === "0" && typeof data.result === "string" && data.result.includes("rate limit")) {
      if (attempt < retries) {
        const delay = BASE_DELAY_MS * Math.pow(2, attempt)
        await new Promise((r) => setTimeout(r, delay))
        continue
      }
    }

    return data
  }

  throw new Error("Max retries exceeded")
}

/**
 * Fetch all ERC-20 token transfers for a wallet from Arbiscan
 * Returns data in the same CovalentERC20Transfer format for compatibility
 */
export async function fetchArbiscanERC20Transfers(
  apiKey: string,
  walletAddress: string,
  startBlock: number = 0
): Promise<CovalentERC20Transfer[]> {
  const allTransfers: CovalentERC20Transfer[] = []
  let page = 1
  const offset = 1000
  let hasMore = true

  while (hasMore) {
    const url = `${BASE_URL}?chainid=${ARBITRUM_CHAIN_ID}&module=account&action=tokentx&address=${walletAddress}&startblock=${startBlock}&endblock=99999999&page=${page}&offset=${offset}&sort=asc&apikey=${apiKey}`

    const data = await fetchWithRetry(url)

    if (data.status === "0") {
      // "No transactions found" is not an error
      if (typeof data.result === "string" && data.result.includes("No transactions found")) {
        break
      }
      // Real error
      if (typeof data.result === "string") {
        throw new Error(`Arbiscan error: ${data.result}`)
      }
      break
    }

    const txs = data.result as ArbiscanTokenTx[]

    for (const tx of txs) {
      const wallet = walletAddress.toLowerCase()
      const from = tx.from.toLowerCase()
      const isOutgoing = from === wallet

      allTransfers.push({
        block_signed_at: new Date(parseInt(tx.timeStamp) * 1000).toISOString(),
        tx_hash: tx.hash,
        from_address: tx.from,
        to_address: tx.to,
        contract_decimals: parseInt(tx.tokenDecimal) || 18,
        contract_name: tx.tokenName,
        contract_ticker_symbol: tx.tokenSymbol,
        contract_address: tx.contractAddress,
        logo_url: null,
        transfer_type: isOutgoing ? "OUT" : "IN",
        delta: tx.value,
        balance: null,
        quote_rate: null,
        delta_quote: null,
      })
    }

    // If we got less than offset, there are no more pages
    hasMore = txs.length >= offset
    page++

    // Safety limit
    if (page > 50) break

    // Arbiscan free tier: 5 calls/sec — small delay between pages
    if (hasMore) {
      await new Promise((r) => setTimeout(r, 250))
    }
  }

  console.log(`[Arbiscan] Fetched ${allTransfers.length} ERC-20 transfers from ${page - 1} pages`)

  return allTransfers
}
