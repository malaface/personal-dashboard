/**
 * Exchange Rate Service
 * Fetches USD to MXN rate from ExchangeRate-API
 * Caches in memory for 1 hour
 */

const CACHE_DURATION_MS = 60 * 60 * 1000 // 1 hour
const FALLBACK_RATE = 17.5

let cachedRate: { value: number; timestamp: number } | null = null

/**
 * Get the current USD to MXN exchange rate
 * Uses ExchangeRate-API with API key from env, falls back to open API
 */
export async function getUSDtoMXNRate(): Promise<number> {
  // Return cached rate if still valid
  if (cachedRate && Date.now() - cachedRate.timestamp < CACHE_DURATION_MS) {
    return cachedRate.value
  }

  try {
    const apiKey = process.env.EXCHANGE_RATE_API_KEY
    const url = apiKey
      ? `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`
      : "https://open.er-api.com/v6/latest/USD"

    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache at Next.js level too
    })

    if (!response.ok) {
      throw new Error(`Exchange rate API returned ${response.status}`)
    }

    const data = await response.json()
    const rate = data.rates?.MXN

    if (typeof rate !== "number" || rate <= 0) {
      throw new Error("Invalid MXN rate in response")
    }

    cachedRate = { value: rate, timestamp: Date.now() }
    return rate
  } catch (error) {
    console.error("Error fetching exchange rate:", error)
    // Return cached rate even if expired, or fallback
    return cachedRate?.value ?? FALLBACK_RATE
  }
}

/**
 * Convert USD amount to MXN
 */
export async function convertUSDtoMXN(amountUSD: number): Promise<number> {
  const rate = await getUSDtoMXNRate()
  return amountUSD * rate
}
