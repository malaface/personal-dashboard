import { redirect } from "next/navigation"
import { hash } from "bcryptjs"
import { auth } from "./config"
import { prisma } from "@/lib/db/prisma"

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
 */
export async function registerUser(email: string, password: string, name: string) {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    throw new Error("User already exists")
  }

  // Hash password
  const hashedPassword = await hash(password, 12)

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      emailVerified: new Date(), // Auto-verify for development
    }
  })

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
