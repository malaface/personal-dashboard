import axios from 'axios'
import { N8nWorkflowParams, N8nWorkflowResponse } from './types'

/**
 * n8n workflow webhook URLs
 * Each module has its own dedicated workflow
 */
const WORKFLOW_WEBHOOKS: Record<string, string> = {
  workouts: `${process.env.N8N_BASE_URL}/webhook/ai-coach-workouts`,
  finance: `${process.env.N8N_BASE_URL}/webhook/ai-coach-finance`,
  nutrition: `${process.env.N8N_BASE_URL}/webhook/ai-coach-nutrition`,
  family: `${process.env.N8N_BASE_URL}/webhook/ai-coach-family`,
}

/**
 * Trigger n8n workflow with user's AI credentials
 * The API key is sent in the payload and n8n uses it to call the AI provider
 *
 * @param params - Workflow parameters including user's decrypted API key
 * @returns AI-generated response with insights and recommendations
 */
export async function triggerN8nWorkflow(
  params: N8nWorkflowParams
): Promise<N8nWorkflowResponse> {
  const webhookUrl = WORKFLOW_WEBHOOKS[params.module]

  if (!webhookUrl) {
    throw new Error(`No webhook configured for module: ${params.module}`)
  }

  try {
    console.log(`Triggering n8n workflow for ${params.module}...`, {
      userId: params.userId,
      provider: params.provider,
      dataPoints: (params.data as any).dataPoints || 'unknown',
      queryLength: params.query.length,
    })

    const response = await axios.post(
      webhookUrl,
      {
        module: params.module,
        query: params.query,
        data: params.data,
        userId: params.userId,
        apiKey: params.apiKey, // User's decrypted API key
        provider: params.provider,
        conversationId: params.conversationId || `${params.module}_${Date.now()}`,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.N8N_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 seconds timeout
      }
    )

    console.log(`n8n workflow response received for ${params.module}`, {
      success: response.data.success,
      hasInsights: !!response.data.insights,
      hasRecommendations: !!response.data.recommendations,
    })

    // Validate response structure
    if (!response.data || typeof response.data !== 'object') {
      throw new Error('Invalid response format from n8n workflow')
    }

    return response.data as N8nWorkflowResponse

  } catch (error: any) {
    console.error('n8n workflow trigger error:', {
      module: params.module,
      error: error.message,
      status: error.response?.status,
      data: error.response?.data,
    })

    // Handle specific error cases
    if (error.code === 'ECONNREFUSED') {
      throw new Error('n8n service is not available. Please try again later.')
    }

    if (error.response?.status === 401) {
      throw new Error('Authentication failed with n8n service.')
    }

    if (error.response?.status === 400) {
      throw new Error(error.response.data?.error || 'Invalid request to n8n workflow.')
    }

    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      throw new Error('AI request timed out. Please try again.')
    }

    // Generic error
    throw new Error('Failed to process AI request. Please try again.')
  }
}

/**
 * Check if n8n service is healthy
 * @returns true if n8n is reachable
 */
export async function checkN8nHealth(): Promise<boolean> {
  try {
    const response = await axios.get(`${process.env.N8N_BASE_URL}/healthz`, {
      timeout: 5000,
    })

    return response.status === 200
  } catch (error) {
    console.error('n8n health check failed:', error)
    return false
  }
}
