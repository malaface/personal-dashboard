/**
 * Gym Muscle Group Distribution Analytics API
 * GET /api/analytics/gym-muscle-distribution
 * Returns: Volume percentage by muscle group (last 30 days)
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/utils'
import { getGymMuscleDistribution } from '@/lib/analytics/queries'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const data = await getGymMuscleDistribution(user.id)

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Gym muscle distribution API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
