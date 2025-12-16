/**
 * Family Time Spent Analytics API
 * GET /api/analytics/family-time?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 */

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/utils'
import { getFamilyTimeSpent, getDefaultDateRange } from '@/lib/analytics/queries'

export async function GET(request: NextRequest) {
  try {
    // Auth check
    const user = await requireAuth()

    // Parse date range from query params
    const { searchParams } = new URL(request.url)
    const startDateParam = searchParams.get('startDate')
    const endDateParam = searchParams.get('endDate')

    let dateRange
    if (startDateParam && endDateParam) {
      dateRange = {
        startDate: new Date(startDateParam),
        endDate: new Date(endDateParam)
      }
    } else {
      dateRange = getDefaultDateRange()
    }

    // Fetch data
    const data = await getFamilyTimeSpent(user.id, dateRange)

    return NextResponse.json({
      success: true,
      data,
      dateRange: {
        startDate: dateRange.startDate.toISOString().split('T')[0],
        endDate: dateRange.endDate.toISOString().split('T')[0]
      },
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    console.error('Family time API error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
