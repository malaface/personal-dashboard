import Redis from 'ioredis'

/**
 * Rate limiting configuration using Redis
 * Prevents API abuse and manages AI request costs
 */

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000)
    return delay
  },
})

redis.on('error', (err) => {
  console.error('Redis connection error:', err)
})

redis.on('connect', () => {
  console.log('Redis connected successfully')
})

interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Max requests per window
}

/**
 * Rate limit configurations for different operations
 */
const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // AI Chat requests
  ai_chat: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10, // 10 requests per minute per user
  },
  ai_chat_daily: {
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    maxRequests: 100, // 100 requests per day per user
  },
  // Credential operations
  credential_create: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 5, // 5 new credentials per hour
  },
}

/**
 * Check if user has exceeded rate limit
 * @param userId - User ID
 * @param limitType - Type of rate limit to check
 * @throws Error if rate limit exceeded
 */
export async function checkRateLimit(
  userId: string,
  limitType: keyof typeof RATE_LIMITS
): Promise<void> {
  const config = RATE_LIMITS[limitType]

  if (!config) {
    throw new Error(`Unknown rate limit type: ${limitType}`)
  }

  const key = `rate_limit:${limitType}:${userId}`

  try {
    // Increment counter
    const current = await redis.incr(key)

    // Set expiration on first request
    if (current === 1) {
      await redis.pexpire(key, config.windowMs)
    }

    // Check if limit exceeded
    if (current > config.maxRequests) {
      const ttl = await redis.pttl(key)
      const secondsRemaining = Math.ceil(ttl / 1000)

      throw new Error(
        `RATE_LIMIT_EXCEEDED:${secondsRemaining}:${config.maxRequests}`
      )
    }
  } catch (error: any) {
    // Re-throw rate limit errors
    if (error.message.startsWith('RATE_LIMIT_EXCEEDED')) {
      throw error
    }

    // Log other errors but don't block the request
    console.error('Rate limit check error:', error)
  }
}

/**
 * Get rate limit status for a user
 * @param userId - User ID
 * @param limitType - Type of rate limit
 * @returns Rate limit status
 */
export async function getRateLimitStatus(
  userId: string,
  limitType: keyof typeof RATE_LIMITS
) {
  const config = RATE_LIMITS[limitType]

  if (!config) {
    return null
  }

  const key = `rate_limit:${limitType}:${userId}`

  try {
    const current = await redis.get(key)
    const ttl = await redis.pttl(key)

    return {
      current: parseInt(current || '0'),
      limit: config.maxRequests,
      remaining: Math.max(0, config.maxRequests - parseInt(current || '0')),
      resetIn: ttl > 0 ? Math.ceil(ttl / 1000) : 0,
      resetAt: ttl > 0 ? new Date(Date.now() + ttl) : null,
    }
  } catch (error) {
    console.error('Error getting rate limit status:', error)
    return null
  }
}

/**
 * Reset rate limit for a user (admin only)
 * @param userId - User ID
 * @param limitType - Type of rate limit
 */
export async function resetRateLimit(
  userId: string,
  limitType: keyof typeof RATE_LIMITS
): Promise<void> {
  const key = `rate_limit:${limitType}:${userId}`

  try {
    await redis.del(key)
    console.log(`Rate limit reset for user ${userId} (${limitType})`)
  } catch (error) {
    console.error('Error resetting rate limit:', error)
  }
}

/**
 * Parse rate limit error message
 * @param error - Error object
 * @returns Parsed error info
 */
export function parseRateLimitError(error: Error): {
  isRateLimit: boolean
  secondsRemaining?: number
  maxRequests?: number
} {
  if (!error.message.startsWith('RATE_LIMIT_EXCEEDED')) {
    return { isRateLimit: false }
  }

  const parts = error.message.split(':')

  return {
    isRateLimit: true,
    secondsRemaining: parseInt(parts[1] || '0'),
    maxRequests: parseInt(parts[2] || '0'),
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  redis.quit()
})

process.on('SIGINT', () => {
  redis.quit()
})
