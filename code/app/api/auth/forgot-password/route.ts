import { NextResponse } from "next/server"
import crypto from "crypto"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/db/prisma"
import { sendPasswordResetEmail } from "@/lib/email/resend"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email es requerido" },
        { status: 400 }
      )
    }

    // Find user - always return success to prevent email enumeration
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ success: true })
    }

    // Delete existing reset tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: `reset:${email}` },
    })

    // Generate token
    const token = crypto.randomBytes(32).toString("hex")
    const hashedToken = await hash(token, 10)

    // Store with 1 hour expiration using "reset:" prefix to distinguish from email verification
    await prisma.verificationToken.create({
      data: {
        identifier: `reset:${email}`,
        token: hashedToken,
        expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    })

    await sendPasswordResetEmail(email, token)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Forgot password error:", error)
    return NextResponse.json(
      { error: "Error al procesar solicitud" },
      { status: 500 }
    )
  }
}
