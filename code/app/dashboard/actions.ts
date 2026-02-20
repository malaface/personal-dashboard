'use server'

import { signOut } from '@/lib/auth/config'
import { createAuditLog } from '@/lib/audit/logger'
import { requireAuth } from '@/lib/auth/utils'

/**
 * Handle user logout with audit logging
 *
 * This function logs the logout event before signing the user out.
 * It must be used instead of calling signOut() directly to ensure
 * proper audit trail.
 */
export async function handleLogout() {
  try {
    const user = await requireAuth()

    // Log before logout
    await createAuditLog({
      userId: user.id,
      action: 'LOGOUT',
      metadata: { email: user.email },
    })

    await signOut({ redirectTo: '/login' })
  } catch (error) {
    console.error('Logout error:', error)
    throw error
  }
}
