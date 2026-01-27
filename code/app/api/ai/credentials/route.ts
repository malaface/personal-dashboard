import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/utils'
import { prisma } from '@/lib/db/prisma'
import { CreateCredentialSchema } from '@/lib/ai/schemas'
import { encryptAPIKey, maskAPIKey, validateAPIKeyFormat } from '@/lib/ai/encryption'
import { CredentialResponse } from '@/lib/ai/types'

/**
 * GET /api/ai/credentials
 * List all AI credentials for the current user
 */
export async function GET(request: NextRequest) {
  try {
    // Auth check
    const user = await requireAuth()

    // Fetch user's credentials
    const credentials = await prisma.aICredential.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    // Map to response format (mask API keys)
    const response: CredentialResponse[] = credentials.map(cred => ({
      id: cred.id,
      provider: cred.provider as any,
      label: cred.label,
      maskedApiKey: maskAPIKey(cred.apiKey),
      isActive: cred.isActive,
      isValid: cred.isValid,
      lastValidated: cred.lastValidated?.toISOString() || null,
      usageCount: cred.usageCount,
      lastUsedAt: cred.lastUsedAt?.toISOString() || null,
      createdAt: cred.createdAt.toISOString(),
      updatedAt: cred.updatedAt.toISOString(),
    }))

    return NextResponse.json(response)

  } catch (error: any) {
    console.error('Error fetching credentials:', error)

    return NextResponse.json(
      { error: 'Error al obtener credenciales' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/ai/credentials
 * Create a new AI credential
 */
export async function POST(request: NextRequest) {
  try {
    // Auth check
    const user = await requireAuth()

    // Parse and validate request body
    const body = await request.json()
    const validatedData = CreateCredentialSchema.parse(body)

    // Validate API key format
    if (!validateAPIKeyFormat(validatedData.apiKey, validatedData.provider)) {
      return NextResponse.json(
        { error: `Formato de API key inválido para ${validatedData.provider}` },
        { status: 400 }
      )
    }

    // Check if user already has a credential for this provider
    const existing = await prisma.aICredential.findFirst({
      where: {
        userId: user.id,
        provider: validatedData.provider,
        isActive: true,
      },
    })

    if (existing) {
      return NextResponse.json(
        { error: `Ya tienes una credencial activa para ${validatedData.provider}` },
        { status: 409 }
      )
    }

    // Encrypt API key
    const encryptedApiKey = encryptAPIKey(validatedData.apiKey)

    // Create credential
    const credential = await prisma.aICredential.create({
      data: {
        userId: user.id,
        provider: validatedData.provider,
        apiKey: encryptedApiKey,
        label: validatedData.label || null,
        isActive: true,
        isValid: false, // Will be validated on first use
      },
    })

    // Return response (masked API key)
    const response: CredentialResponse = {
      id: credential.id,
      provider: credential.provider as any,
      label: credential.label,
      maskedApiKey: maskAPIKey(validatedData.apiKey),
      isActive: credential.isActive,
      isValid: credential.isValid,
      lastValidated: null,
      usageCount: 0,
      lastUsedAt: null,
      createdAt: credential.createdAt.toISOString(),
      updatedAt: credential.updatedAt.toISOString(),
    }

    return NextResponse.json(response, { status: 201 })

  } catch (error: any) {
    console.error('Error creating credential:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Error al crear credencial' },
      { status: 500 }
    )
  }
}
