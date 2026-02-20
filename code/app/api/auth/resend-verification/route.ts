import { NextResponse } from "next/server"
import crypto from "crypto"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/db/prisma"
import { sendVerificationEmail } from "@/lib/email/resend"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: "Email es requerido" },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Always return success to prevent email enumeration
    if (!user || user.emailVerified) {
      return NextResponse.json({ success: true })
    }

    // Delete existing verification tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    })

    // Generate new token
    const token = crypto.randomBytes(32).toString("hex")
    const hashedToken = await hash(token, 10)

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: hashedToken,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    })

    await sendVerificationEmail(email, token)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Resend verification error:", error)
    return NextResponse.json(
      { error: "Error al reenviar verificación" },
      { status: 500 }
    )
  }
}
