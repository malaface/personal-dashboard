import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/utils'
import { ChatRequestSchema } from '@/lib/ai/schemas'
import { checkRateLimit, parseRateLimitError } from '@/lib/ai/rate-limit'
import { getUserAICredential, updateCredentialUsage, markCredentialInvalid } from '@/lib/ai/credentials'
import { prepareModuleData } from '@/lib/ai/data-preparation'
import { triggerN8nWorkflow } from '@/lib/ai/n8n-client'
import { createAuditLog } from '@/lib/audit/logger'

/**
 * POST /api/ai/chat
 * Main AI chat endpoint
 *
 * Flow:
 * 1. Authenticate user
 * 2. Validate request
 * 3. Check rate limits
 * 4. Get user's AI credential (with decrypted API key)
 * 5. Prepare module data
 * 6. Trigger n8n workflow (passing user's API key)
 * 7. Update usage statistics
 * 8. Return AI response
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // 1. Authentication check
    const user = await requireAuth()

    // 2. Parse and validate request body
    const body = await request.json()
    const validatedData = ChatRequestSchema.parse(body)

    console.log('AI chat request:', {
      userId: user.id,
      module: validatedData.module,
      period: validatedData.period,
      queryLength: validatedData.query.length,
    })

    // 3. Rate limiting check
    try {
      await checkRateLimit(user.id, 'ai_chat')
      await checkRateLimit(user.id, 'ai_chat_daily')
    } catch (error: any) {
      const rateLimitInfo = parseRateLimitError(error)

      if (rateLimitInfo.isRateLimit) {
        return NextResponse.json(
          {
            error: 'Límite de consultas excedido',
            message: `Por favor, intenta de nuevo en ${rateLimitInfo.secondsRemaining} segundos`,
            retryAfter: rateLimitInfo.secondsRemaining,
          },
          { status: 429 }
        )
      }

      throw error
    }

    // 4. Get user's AI credential
    const credential = await getUserAICredential(user.id)

    if (!credential) {
      return NextResponse.json(
        {
          error: 'No se encontró credencial de AI',
          message: 'Por favor, configura tus credenciales de AI en Ajustes',
          requiresSetup: true,
        },
        { status: 400 }
      )
    }

    console.log('Using AI credential:', {
      provider: credential.provider,
      credentialId: credential.credentialId,
    })

    // 5. Prepare module data
    let moduleData
    try {
      moduleData = await prepareModuleData({
        userId: user.id,
        module: validatedData.module,
        period: validatedData.period,
      })

      console.log('Module data prepared:', {
        module: validatedData.module,
        dataPoints: (moduleData as any).dataPoints || 0,
        period: validatedData.period,
      })
    } catch (error: any) {
      console.error('Error preparing module data:', error)

      return NextResponse.json(
        {
          error: 'Error al preparar datos',
          message: error.message || 'No se pudieron cargar tus datos',
        },
        { status: 500 }
      )
    }

    // 6. Trigger n8n workflow with user's API key
    let n8nResponse
    try {
      n8nResponse = await triggerN8nWorkflow({
        module: validatedData.module,
        query: validatedData.query,
        data: moduleData,
        userId: user.id,
        apiKey: credential.apiKey, // User's decrypted API key
        provider: credential.provider,
        conversationId: validatedData.conversationId,
      })

      // 7. Update credential usage (successful)
      await updateCredentialUsage(credential.credentialId, true)

    } catch (error: any) {
      console.error('n8n workflow error:', error)

      // Check if it's an API key issue
      if (
        error.message.includes('API key') ||
        error.message.includes('authentication') ||
        error.message.includes('unauthorized')
      ) {
        // Mark credential as invalid
        await markCredentialInvalid(credential.credentialId, error.message)

        return NextResponse.json(
          {
            error: 'Credencial de AI inválida',
            message: 'Tu API key parece ser inválida. Por favor, actualízala en Ajustes',
            requiresSetup: true,
          },
          { status: 401 }
        )
      }

      return NextResponse.json(
        {
          error: 'Error al procesar solicitud',
          message: error.message || 'Ocurrió un error al generar los insights',
        },
        { status: 500 }
      )
    }

    // 8. Audit log
    const duration = Date.now() - startTime
    await createAuditLog({
      userId: user.id,
      action: 'AI_CHAT_REQUEST' as any, // Will need to add to AuditAction enum
      metadata: {
        module: validatedData.module,
        period: validatedData.period,
        queryLength: validatedData.query.length,
        dataPoints: (moduleData as any).dataPoints || 0,
        provider: credential.provider,
        duration,
        success: true,
      },
    })

    console.log('AI chat request completed:', {
      userId: user.id,
      module: validatedData.module,
      duration,
      hasInsights: !!n8nResponse.insights,
    })

    // 9. Return response
    return NextResponse.json(n8nResponse)

  } catch (error: any) {
    console.error('AI chat API error:', error)

    // Audit log for errors
    try {
      const user = await requireAuth()
      await createAuditLog({
        userId: user.id,
        action: 'AI_CHAT_ERROR' as any,
        metadata: {
          error: error.message,
          duration: Date.now() - startTime,
        },
      })
    } catch {
      // Ignore audit log errors
    }

    // Handle Zod validation errors
    if (error.name === 'ZodError') {
      return NextResponse.json(
        {
          error: 'Datos de solicitud inválidos',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    // Generic error response
    return NextResponse.json(
      {
        error: 'Error interno del servidor',
        message: 'Ocurrió un error al procesar tu solicitud',
      },
      { status: 500 }
    )
  }
}
