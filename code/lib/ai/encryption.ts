import crypto from 'crypto'

/**
 * Encryption utility for API keys
 * Uses AES-256-GCM for secure encryption/decryption
 */

// Get encryption key from environment (32 bytes for AES-256)
const ENCRYPTION_KEY = process.env.NEXTAUTH_SECRET
  ? crypto.scryptSync(process.env.NEXTAUTH_SECRET, 'salt', 32)
  : (() => {
      throw new Error('NEXTAUTH_SECRET is required for API key encryption')
    })()

/**
 * Encrypt an API key
 * @param apiKey - Plain text API key
 * @returns Encrypted string in format: iv:authTag:encryptedData
 */
export function encryptAPIKey(apiKey: string): string {
  // Generate random initialization vector (IV)
  const iv = crypto.randomBytes(16)

  // Create cipher with AES-256-GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv)

  // Encrypt the API key
  let encrypted = cipher.update(apiKey, 'utf8', 'hex')
  encrypted += cipher.final('hex')

  // Get authentication tag
  const authTag = cipher.getAuthTag()

  // Return format: iv:authTag:encryptedData
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`
}

/**
 * Decrypt an API key
 * @param encryptedKey - Encrypted string in format: iv:authTag:encryptedData
 * @returns Decrypted plain text API key
 */
export function decryptAPIKey(encryptedKey: string): string {
  try {
    // Split the encrypted string
    const parts = encryptedKey.split(':')

    if (parts.length !== 3) {
      throw new Error('Invalid encrypted key format')
    }

    const [ivHex, authTagHex, encryptedData] = parts

    // Convert hex strings back to buffers
    const iv = Buffer.from(ivHex, 'hex')
    const authTag = Buffer.from(authTagHex, 'hex')

    // Create decipher
    const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv)
    decipher.setAuthTag(authTag)

    // Decrypt
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
    decrypted += decipher.final('utf8')

    return decrypted
  } catch (error) {
    console.error('Decryption error:', error)
    throw new Error('Failed to decrypt API key')
  }
}

/**
 * Mask an API key for display (show only first 8 and last 4 characters)
 * @param apiKey - Plain text API key
 * @returns Masked API key (e.g., "sk-proj-...xyz1234")
 */
export function maskAPIKey(apiKey: string): string {
  if (apiKey.length <= 12) {
    return '*'.repeat(apiKey.length)
  }

  const first = apiKey.slice(0, 8)
  const last = apiKey.slice(-4)

  return `${first}...${last}`
}

/**
 * Validate API key format (basic check)
 * @param apiKey - API key to validate
 * @param provider - AI provider (GEMINI, OPENAI, CLAUDE)
 * @returns true if format is valid
 */
export function validateAPIKeyFormat(apiKey: string, provider: string): boolean {
  if (!apiKey || apiKey.trim().length === 0) {
    return false
  }

  // Provider-specific validation
  switch (provider) {
    case 'GEMINI':
      // Gemini API keys typically start with "AIza"
      return apiKey.startsWith('AIza') && apiKey.length >= 30

    case 'OPENAI':
      // OpenAI keys start with "sk-" or "sk-proj-"
      return (apiKey.startsWith('sk-') || apiKey.startsWith('sk-proj-')) && apiKey.length >= 40

    case 'CLAUDE':
      // Anthropic Claude keys start with "sk-ant-"
      return apiKey.startsWith('sk-ant-') && apiKey.length >= 40

    case 'HUGGINGFACE':
      // HuggingFace tokens start with "hf_"
      return apiKey.startsWith('hf_') && apiKey.length >= 30

    default:
      // Generic validation: at least 20 characters
      return apiKey.length >= 20
  }
}
