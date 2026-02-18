import { NextRequest, NextResponse } from "next/server"
import { compare, hash } from "bcryptjs"
import { prisma } from "@/lib/db/prisma"
import { createAuditLog } from "@/lib/audit/logger"

/**
 * GET - Validate a reset token (used by the page to check before showing the form)
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")

  if (!token) {
    return NextResponse.json({ valid: false, error: "Token requerido" }, { status: 400 })
  }

  try {
    // Find reset tokens (identifier starts with "reset:")
    const resetTokens = await prisma.verificationToken.findMany({
      where: { identifier: { startsWith: "reset:" } },
    })

    for (const record of resetTokens) {
      const isValid = await compare(token, record.token)
      if (isValid) {
        if (new Date() > record.expires) {
          return NextResponse.json({ valid: false, error: "El enlace ha expirado" })
        }
        const email = record.identifier.replace("reset:", "")
        return NextResponse.json({ valid: true, email })
      }
    }

    return NextResponse.json({ valid: false, error: "Enlace inválido o expirado" })
  } catch (error) {
    console.error("Token validation error:", error)
    return NextResponse.json({ valid: false, error: "Error de servidor" }, { status: 500 })
  }
}

/**
 * POST - Reset password with a valid token
 */
export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token y contraseña son requeridos" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres" },
        { status: 400 }
      )
    }

    // Find matching reset token
    const resetTokens = await prisma.verificationToken.findMany({
      where: { identifier: { startsWith: "reset:" } },
    })

    let verificationRecord = null
    for (const record of resetTokens) {
      const isValid = await compare(token, record.token)
      if (isValid) {
        verificationRecord = record
        break
      }
    }

    if (!verificationRecord) {
      return NextResponse.json(
        { error: "Enlace inválido o expirado" },
        { status: 400 }
      )
    }

    if (new Date() > verificationRecord.expires) {
      // Clean up expired token
      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: verificationRecord.identifier,
            token: verificationRecord.token,
          },
        },
      })
      return NextResponse.json(
        { error: "El enlace ha expirado. Solicita uno nuevo." },
        { status: 400 }
      )
    }

    const email = verificationRecord.identifier.replace("reset:", "")

    // Find user
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Hash new password and update
    const hashedPassword = await hash(password, 12)

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    })

    // Delete used token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: verificationRecord.identifier,
          token: verificationRecord.token,
        },
      },
    })

    await createAuditLog({
      userId: user.id,
      action: "PASSWORD_CHANGE",
      metadata: { method: "reset", email },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Reset password error:", error)
    return NextResponse.json(
      { error: "Error al cambiar contraseña" },
      { status: 500 }
    )
  }
}
