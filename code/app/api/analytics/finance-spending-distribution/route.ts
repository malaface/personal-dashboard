/**
 * Finance Spending Distribution Analytics API
 * GET /api/analytics/finance-spending-distribution
 * Returns: Spending percentage by category (last 30 days)
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/utils'
import { getFinanceSpendingDistribution } from '@/lib/analytics/queries'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const data = await getFinanceSpendingDistribution(user.id)

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Finance spending distribution API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
