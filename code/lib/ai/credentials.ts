import { prisma } from '@/lib/db/prisma'
import { decryptAPIKey } from './encryption'
import { AIProvider } from './types'

/**
 * Get user's active AI credential for a specific provider
 * @param userId - User ID
 * @param provider - AI provider (GEMINI, OPENAI, etc.)
 * @returns Decrypted API key and credential ID, or null if not found
 */
export async function getUserAICredential(
  userId: string,
  provider?: AIProvider
): Promise<{ apiKey: string; credentialId: string; provider: AIProvider } | null> {
  try {
    // If provider is specified, find specific credential
    // Otherwise, find the first active credential
    const credential = await prisma.aICredential.findFirst({
      where: {
        userId,
        isActive: true,
        ...(provider && { provider }),
      },
      orderBy: [
        { lastUsedAt: 'desc' },
        { createdAt: 'desc' },
      ],
    })

    if (!credential) {
      return null
    }

    // Decrypt API key
    const decryptedKey = decryptAPIKey(credential.apiKey)

    return {
      apiKey: decryptedKey,
      credentialId: credential.id,
      provider: credential.provider as AIProvider,
    }
  } catch (error) {
    console.error('Error getting user AI credential:', error)
    return null
  }
}

/**
 * Update credential usage statistics
 * @param credentialId - Credential ID
 * @param isValid - Whether the credential was successfully validated
 */
export async function updateCredentialUsage(
  credentialId: string,
  isValid: boolean = true
): Promise<void> {
  try {
    await prisma.aICredential.update({
      where: { id: credentialId },
      data: {
        usageCount: { increment: 1 },
        lastUsedAt: new Date(),
        isValid,
        lastValidated: new Date(),
      },
    })
  } catch (error) {
    console.error('Error updating credential usage:', error)
  }
}

/**
 * Mark credential as invalid
 * @param credentialId - Credential ID
 * @param error - Error message
 */
export async function markCredentialInvalid(
  credentialId: string,
  error?: string
): Promise<void> {
  try {
    await prisma.aICredential.update({
      where: { id: credentialId },
      data: {
        isValid: false,
        lastValidated: new Date(),
      },
    })

    console.error(`Credential ${credentialId} marked as invalid:`, error)
  } catch (err) {
    console.error('Error marking credential as invalid:', err)
  }
}
