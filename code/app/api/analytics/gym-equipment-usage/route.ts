/**
 * Gym Equipment Usage Analytics API
 * GET /api/analytics/gym-equipment-usage
 * Returns: Exercise count by equipment type (last 30 days)
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/utils'
import { getGymEquipmentUsage } from '@/lib/analytics/queries'

export async function GET(_request: NextRequest) {
  try {
    const user = await requireAuth()
    const data = await getGymEquipmentUsage(user.id)

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    })
  } catch (error: unknown) {
    console.error('Gym equipment usage API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
