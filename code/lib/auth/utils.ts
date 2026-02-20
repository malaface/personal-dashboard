import { redirect } from "next/navigation"
import { hash } from "bcryptjs"
import crypto from "crypto"
import { auth } from "./config"
import { prisma } from "@/lib/db/prisma"
import { sendVerificationEmail } from "@/lib/email/resend"
import { createAuditLog } from "@/lib/audit/logger"

/**
 * Require authentication - redirect to login if not authenticated
 * Returns the authenticated user
 */
export async function requireAuth() {
  const session = await auth()

  if (!session || !session.user) {
    redirect("/login")
  }

  return session.user
}

/**
 * Register a new user with email and password
 * Creates user WITHOUT email verification and sends verification email
 */
export async function registerUser(email: string, password: string, name: string) {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    throw new Error("User already exists")
  }

  // Hash password with 12 rounds (secure against brute force)
  const hashedPassword = await hash(password, 12)

  // Create user WITHOUT email verification (security improvement)
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      emailVerified: null, // ← CRITICAL: Do NOT auto-verify
    }
  })

  // Generate cryptographically secure token (32 bytes = 256 bits)
  const token = crypto.randomBytes(32).toString('hex')

  // Hash the token before storing (security best practice)
  // If DB is compromised, tokens can't be used to verify emails
  const hashedToken = await hash(token, 10)

  // Store hashed token with 24h expiration
  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: hashedToken,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    }
  })

  // Send verification email (plain token, not hashed)
  // The email service will create a link with the plain token
  const emailResult = await sendVerificationEmail(email, token)

  // Audit log for security tracking
  await createAuditLog({
    userId: user.id,
    action: "REGISTER",
    metadata: {
      email,
      name,
      emailSent: emailResult.success,
      devMode: emailResult.dev || false,
    },
  })

  console.log(`✅ User registered: ${email}${emailResult.dev ? ' (dev mode - check console for verification link)' : ''}`)

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  }
}

/**
 * Verify that a resource belongs to the current user
 * Throws error if not authorized
 */
export async function verifyOwnership(resourceUserId: string) {
  const user = await requireAuth()

  if (user.id !== resourceUserId) {
    throw new Error("Unauthorized: You don't own this resource")
  }

  return true
}
