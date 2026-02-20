import { z } from 'zod'

/**
 * Zod validation schemas for AI module
 */

// ============================================
// CREDENTIALS SCHEMAS
// ============================================

export const AIProviderEnum = z.enum(['GEMINI', 'OPENAI', 'CLAUDE', 'HUGGINGFACE'])

export const CreateCredentialSchema = z.object({
  provider: AIProviderEnum,
  apiKey: z.string().min(20, 'API key must be at least 20 characters').max(500, 'API key is too long'),
  label: z.string().min(1).max(100).optional(),
})

export const UpdateCredentialSchema = z.object({
  label: z.string().min(1).max(100).optional(),
  isActive: z.boolean().optional(),
})

// ============================================
// CHAT SCHEMAS
// ============================================

export const ModuleEnum = z.enum(['workouts', 'finance', 'nutrition', 'family'])
export const PeriodEnum = z.enum(['7days', '30days'])

export const ChatRequestSchema = z.object({
  module: ModuleEnum,
  period: PeriodEnum,
  query: z.string().min(1, 'Query cannot be empty').max(500, 'Query is too long'),
  conversationId: z.string().optional(),
})

export const ChatResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  insights: z.array(z.object({
    title: z.string(),
    description: z.string(),
    priority: z.enum(['high', 'medium', 'low']),
  })).optional(),
  recommendations: z.array(z.string()).optional(),
  metrics: z.record(z.string(), z.number()).optional(),
  conversationId: z.string(),
  timestamp: z.string(),
})

// ============================================
// TYPE EXPORTS
// ============================================

export type CreateCredentialRequest = z.infer<typeof CreateCredentialSchema>
export type UpdateCredentialRequest = z.infer<typeof UpdateCredentialSchema>
export type ChatRequest = z.infer<typeof ChatRequestSchema>
export type ChatResponse = z.infer<typeof ChatResponseSchema>
