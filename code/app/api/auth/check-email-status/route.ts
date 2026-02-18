import { NextResponse } from "next/server"
import { prisma } from "@/lib/db/prisma"

/**
 * Check if a user's email is verified.
 * Used by LoginForm to distinguish "email not verified" from "bad credentials".
 * Returns generic response to prevent email enumeration.
 */
export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ status: "unknown" })
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { emailVerified: true },
    })

    // User exists but email not verified
    if (user && !user.emailVerified) {
      return NextResponse.json({ status: "unverified" })
    }

    // User doesn't exist or email is verified - return generic
    return NextResponse.json({ status: "ok" })
  } catch {
    return NextResponse.json({ status: "unknown" })
  }
}
