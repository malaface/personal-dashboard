import { NextRequest, NextResponse } from "next/server"
import { compare } from "bcryptjs"
import { prisma } from "@/lib/db/prisma"
import { createAuditLog } from "@/lib/audit/logger"

const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'

/**
 * Email Verification Endpoint
 *
 * Security features:
 * - Tokens are hashed in database (can't be used if DB is compromised)
 * - Tokens expire after 24 hours
 * - Tokens are deleted after use (can't be reused)
 * - All verification attempts are audit logged
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")

  if (!token) {
    return NextResponse.json(
      { error: "Verification token is required" },
      { status: 400 }
    )
  }

  try {
    // Find all verification tokens for this identifier
    // We need to check all tokens because we hash them
    const verificationTokens = await prisma.verificationToken.findMany()

    // Find the matching token by comparing hashes
    let verificationRecord = null
    for (const record of verificationTokens) {
      const isValid = await compare(token, record.token)
      if (isValid) {
        verificationRecord = record
        break
      }
    }

    if (!verificationRecord) {
      // Audit log for failed verification attempt
      await createAuditLog({
        action: "EMAIL_VERIFIED",
        metadata: {
          success: false,
          reason: "invalid_token",
        },
      })

      return NextResponse.redirect(
        new URL("/login?error=invalid_token&message=" + encodeURIComponent("Invalid or expired verification link"), APP_URL)
      )
    }

    // Check if token has expired
    if (new Date() > verificationRecord.expires) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: verificationRecord.identifier,
            token: verificationRecord.token,
          },
        },
      })

      // Audit log for expired token
      await createAuditLog({
        action: "EMAIL_VERIFIED",
        metadata: {
          success: false,
          reason: "expired_token",
          email: verificationRecord.identifier,
        },
      })

      return NextResponse.redirect(
        new URL("/login?error=expired_token&message=" + encodeURIComponent("Verification link has expired. Please register again."), APP_URL)
      )
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: verificationRecord.identifier },
    })

    if (!user) {
      return NextResponse.redirect(
        new URL("/login?error=user_not_found&message=" + encodeURIComponent("User not found"), APP_URL)
      )
    }

    // Update user email verification
    await prisma.user.update({
      where: { email: verificationRecord.identifier },
      data: { emailVerified: new Date() },
    })

    // Delete verification token (can't be reused)
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: verificationRecord.identifier,
          token: verificationRecord.token,
        },
      },
    })

    // Audit log for successful verification
    await createAuditLog({
      userId: user.id,
      action: "EMAIL_VERIFIED",
      metadata: {
        success: true,
        email: verificationRecord.identifier,
      },
    })

    console.log(`✅ Email verified successfully: ${verificationRecord.identifier}`)

    // Redirect to login with success message
    return NextResponse.redirect(
      new URL("/login?verified=true&message=" + encodeURIComponent("Email verified successfully! You can now login."), APP_URL)
    )
  } catch (error: unknown) {
    console.error("❌ Email verification error:", error)

    // Audit log for error
    await createAuditLog({
      action: "EMAIL_VERIFIED",
      metadata: {
        success: false,
        reason: "server_error",
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    })

    return NextResponse.redirect(
      new URL("/login?error=verification_failed&message=" + encodeURIComponent("Verification failed. Please try again or contact support."), APP_URL)
    )
  }
}
