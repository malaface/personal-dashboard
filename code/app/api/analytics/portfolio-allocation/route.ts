/**
 * Portfolio Allocation Analytics API
 * GET /api/analytics/portfolio-allocation
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/utils'
import { getPortfolioAllocation } from '@/lib/analytics/queries'

export async function GET(_request: NextRequest) {
  try {
    // Auth check
    const user = await requireAuth()

    // Fetch data
    const data = await getPortfolioAllocation(user.id)

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    })
  } catch (error: unknown) {
    console.error('Portfolio allocation API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
