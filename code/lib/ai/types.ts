/**
 * AI Module Types
 * Types for AI chat, credentials, and workflows
 */

// ============================================
// AI PROVIDERS
// ============================================

export type AIProvider = 'GEMINI' | 'OPENAI' | 'CLAUDE' | 'HUGGINGFACE'

export interface AIProviderInfo {
  name: string
  displayName: string
  description: string
  website: string
  docsUrl: string
  iconColor: string
  keyPrefix: string
}

export const AI_PROVIDERS: Record<AIProvider, AIProviderInfo> = {
  GEMINI: {
    name: 'GEMINI',
    displayName: 'Google Gemini',
    description: 'Google\'s most capable AI model with multimodal capabilities',
    website: 'https://ai.google.dev',
    docsUrl: 'https://ai.google.dev/docs',
    iconColor: '#4285F4',
    keyPrefix: 'AIza',
  },
  OPENAI: {
    name: 'OPENAI',
    displayName: 'OpenAI',
    description: 'ChatGPT and GPT-4 models from OpenAI',
    website: 'https://platform.openai.com',
    docsUrl: 'https://platform.openai.com/docs',
    iconColor: '#10A37F',
    keyPrefix: 'sk-',
  },
  CLAUDE: {
    name: 'CLAUDE',
    displayName: 'Anthropic Claude',
    description: 'Claude AI models optimized for safety and reliability',
    website: 'https://www.anthropic.com',
    docsUrl: 'https://docs.anthropic.com',
    iconColor: '#D97757',
    keyPrefix: 'sk-ant-',
  },
  HUGGINGFACE: {
    name: 'HUGGINGFACE',
    displayName: 'Hugging Face',
    description: 'Access thousands of open-source AI models',
    website: 'https://huggingface.co',
    docsUrl: 'https://huggingface.co/docs',
    iconColor: '#FFD21E',
    keyPrefix: 'hf_',
  },
}

// ============================================
// CREDENTIALS
// ============================================

export interface AICredential {
  id: string
  userId: string
  provider: AIProvider
  apiKey: string // Encrypted in DB
  label?: string | null
  isActive: boolean
  isValid: boolean
  lastValidated?: Date | null
  usageCount: number
  lastUsedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateCredentialRequest {
  provider: AIProvider
  apiKey: string
  label?: string
}

export interface UpdateCredentialRequest {
  label?: string
  isActive?: boolean
}

export interface CredentialResponse {
  id: string
  provider: AIProvider
  label?: string | null
  maskedApiKey: string
  isActive: boolean
  isValid: boolean
  lastValidated?: string | null
  usageCount: number
  lastUsedAt?: string | null
  createdAt: string
  updatedAt: string
}

// ============================================
// CHAT & MESSAGES
// ============================================

export type ModuleType = 'workouts' | 'finance' | 'nutrition' | 'family'
export type PeriodType = '7days' | '30days'
export type MessageRole = 'user' | 'assistant' | 'system'

export interface AIChatMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: Date
  metadata?: {
    module?: ModuleType
    period?: PeriodType
    dataPoints?: number
  }
}

export interface AIChatState {
  isOpen: boolean
  messages: AIChatMessage[]
  isLoading: boolean
  currentModule: ModuleType | null
  currentPeriod: PeriodType
  error: string | null
}

// ============================================
// AI INSIGHTS & RESPONSES
// ============================================

export type InsightPriority = 'high' | 'medium' | 'low'

export interface AIInsight {
  title: string
  description: string
  priority: InsightPriority
}

export interface AIResponse {
  success: boolean
  message: string
  insights?: AIInsight[]
  recommendations?: string[]
  metrics?: Record<string, number>
  conversationId: string
  timestamp: string
}

// ============================================
// MODULE DATA PREPARATION
// ============================================

export interface PrepareDataParams {
  userId: string
  module: ModuleType
  period: PeriodType
}

export interface WorkoutsData {
  workouts: any[]
  totalVolume: number
  avgVolume: number
  muscleGroups: Record<string, number>
  equipment: Record<string, number>
  volumeTrend: 'increasing' | 'decreasing' | 'stable'
  frequency: number
  periodDays: number
  dataPoints: number
}

export interface FinanceData {
  transactions: any[]
  totalIncome: number
  totalExpenses: number
  netCashFlow: number
  categorySpending: Record<string, number>
  budgetAdherence: any[]
  portfolioValue: number
  spendingTrend: 'increasing' | 'decreasing' | 'stable'
  periodDays: number
  dataPoints: number
}

export interface NutritionData {
  meals: any[]
  dailyTotals: Record<string, any>
  avgCalories: number
  avgProtein: number
  avgCarbs: number
  avgFats: number
  goalAdherence: any | null
  mealTypes: Record<string, number>
  periodDays: number
  dataPoints: number
}

export interface FamilyData {
  familyMembers: any[]
  timeLogs: any[]
  timePerMember: Record<string, number>
  activities: Record<string, number>
  totalTime: number
  upcomingEvents: any[]
  reminders: any[]
  periodDays: number
  dataPoints: number
}

export type ModuleData = WorkoutsData | FinanceData | NutritionData | FamilyData

// ============================================
// N8N WORKFLOW
// ============================================

export interface N8nWorkflowParams {
  module: ModuleType
  query: string
  data: ModuleData
  userId: string
  apiKey: string // User's AI API key (decrypted)
  provider: AIProvider
  conversationId?: string
}

export interface N8nWorkflowResponse {
  success: boolean
  message: string
  insights?: AIInsight[]
  recommendations?: string[]
  metrics?: Record<string, number>
  conversationId: string
  timestamp: string
}
