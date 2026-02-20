import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/utils'
import { prisma } from '@/lib/db/prisma'
import { UpdateCredentialSchema } from '@/lib/ai/schemas'
import { maskAPIKey } from '@/lib/ai/encryption'
import { CredentialResponse } from '@/lib/ai/types'

interface RouteContext {
  params: Promise<{ id: string }>
}

/**
 * PATCH /api/ai/credentials/[id]
 * Update an AI credential
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    // Auth check
    const user = await requireAuth()

    const { id } = await context.params

    // Find credential and verify ownership
    const credential = await prisma.aICredential.findUnique({
      where: { id },
    })

    if (!credential) {
      return NextResponse.json(
        { error: 'Credencial no encontrada' },
        { status: 404 }
      )
    }

    if (credential.userId !== user.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = UpdateCredentialSchema.parse(body)

    // Update credential
    const updated = await prisma.aICredential.update({
      where: { id },
      data: {
        label: validatedData.label !== undefined ? validatedData.label : credential.label,
        isActive: validatedData.isActive !== undefined ? validatedData.isActive : credential.isActive,
      },
    })

    // Return response
    const response: CredentialResponse = {
      id: updated.id,
      provider: updated.provider as any,
      label: updated.label,
      maskedApiKey: maskAPIKey(updated.apiKey),
      isActive: updated.isActive,
      isValid: updated.isValid,
      lastValidated: updated.lastValidated?.toISOString() || null,
      usageCount: updated.usageCount,
      lastUsedAt: updated.lastUsedAt?.toISOString() || null,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    }

    return NextResponse.json(response)

  } catch (error: any) {
    console.error('Error updating credential:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Datos invalidos', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Error al actualizar credencial' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/ai/credentials/[id]
 * Delete an AI credential
 */
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    // Auth check
    const user = await requireAuth()

    const { id } = await context.params

    // Find credential and verify ownership
    const credential = await prisma.aICredential.findUnique({
      where: { id },
    })

    if (!credential) {
      return NextResponse.json(
        { error: 'Credencial no encontrada' },
        { status: 404 }
      )
    }

    if (credential.userId !== user.id) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 403 }
      )
    }

    // Delete credential
    await prisma.aICredential.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Credencial eliminada exitosamente',
    })

  } catch (error: any) {
    console.error('Error deleting credential:', error)

    return NextResponse.json(
      { error: 'Error al eliminar credencial' },
      { status: 500 }
    )
  }
}
