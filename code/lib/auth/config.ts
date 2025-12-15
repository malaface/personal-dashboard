import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { compare } from "bcryptjs"
import { prisma } from "@/lib/db/prisma"
import { createAuditLog } from "@/lib/audit/logger"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Validate credentials exist
        if (!credentials?.email || !credentials?.password) {
          await createAuditLog({
            action: "LOGIN_FAILED",
            metadata: {
              reason: "missing_credentials",
              email: credentials?.email || null,
            },
          })
          return null
        }

        // Find user
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })

        // User not found
        if (!user || !user.password) {
          await createAuditLog({
            action: "LOGIN_FAILED",
            metadata: {
              reason: "user_not_found",
              email: credentials.email,
            },
          })
          return null
        }

        // Verify password
        const isPasswordValid = await compare(credentials.password as string, user.password)

        if (!isPasswordValid) {
          await createAuditLog({
            userId: user.id,
            action: "LOGIN_FAILED",
            metadata: {
              reason: "invalid_password",
              email: credentials.email,
            },
          })
          return null
        }

        // CRITICAL SECURITY: Require email verification for production
        // Allow bypass in development for easier testing
        if (!user.emailVerified && process.env.NODE_ENV !== 'development') {
          await createAuditLog({
            userId: user.id,
            action: "LOGIN_FAILED",
            metadata: {
              reason: "email_not_verified",
              email: credentials.email,
            },
          })
          throw new Error("Please verify your email before logging in. Check your inbox for the verification link.")
        }

        // Log development bypass if used
        if (!user.emailVerified && process.env.NODE_ENV === 'development') {
          console.log(`[DEV MODE] Bypassing email verification for ${credentials.email}`)
        }

        // Successful login - log it
        await createAuditLog({
          userId: user.id,
          action: "LOGIN",
          metadata: {
            email: credentials.email,
          },
        })

        console.log(`✅ User logged in: ${user.email}`)

        return {
          id: user.id,
          email: user.email!,
          name: user.name,
          role: user.role,
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user && user.id) {
        token.id = user.id
        token.role = user.role || "USER"
      }
      return token
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
        session.user.role = (token.role as string) || "USER"
      }
      return session
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
})
