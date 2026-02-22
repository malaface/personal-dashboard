import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function proxy(request: NextRequest) {
  // Get token with explicit configuration for production (HTTPS + Cloudflare Tunnel)
  const isProduction = process.env.NODE_ENV === "production"
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    // Use secure cookies in production (HTTPS), non-secure in development
    secureCookie: isProduction,
    // Cookie name matches the one defined in lib/auth/config.ts
    cookieName: isProduction
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token",
  })

  const isAuth = !!token
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
                     request.nextUrl.pathname.startsWith('/register')

  // If authenticated and trying to access auth pages, redirect to dashboard
  if (isAuthPage && isAuth) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If not authenticated and trying to access protected pages, redirect to login
  if (!isAuthPage && !isAuth && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/register'
  ]
}
