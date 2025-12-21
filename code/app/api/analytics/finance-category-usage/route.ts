/**
 * Finance Category Usage Analytics API
 * GET /api/analytics/finance-category-usage
 * Returns: Transaction count by category (last 30 days, top 10)
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/utils'
import { getFinanceCategoryUsage } from '@/lib/analytics/queries'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const data = await getFinanceCategoryUsage(user.id)

    return NextResponse.json({
      success: true,
      data,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Finance category usage API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
