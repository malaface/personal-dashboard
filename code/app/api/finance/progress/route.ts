/**
 * GET /api/finance/progress
 * Get finance progress data for charts
 *
 * Query params:
 *   - categoryId: string (optional) - specific category
 *   - typeId: string (optional) - filter by transaction type
 *   - range: "30d"|"90d"|"6m"|"1y" (optional) - preset range
 *   - startDate: ISO string (optional) - custom start
 *   - endDate: ISO string (optional) - custom end
 */

import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/utils"
import {
  getFinanceProgressTrend,
  getFinancialRecords,
} from "@/lib/finance/progress"

function rangeToDate(range: string): Date {
  const now = new Date()
  switch (range) {
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    case "90d":
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    case "6m":
      return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
    case "1y":
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
    default:
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const searchParams = request.nextUrl.searchParams

    const categoryId = searchParams.get("categoryId") || undefined
    const typeId = searchParams.get("typeId") || undefined
    const range = searchParams.get("range")
    const startDateParam = searchParams.get("startDate")
    const endDateParam = searchParams.get("endDate")

    let startDate: Date | undefined
    let endDate: Date | undefined

    if (startDateParam) {
      startDate = new Date(startDateParam)
    } else if (range) {
      startDate = rangeToDate(range)
    }

    if (endDateParam) {
      endDate = new Date(endDateParam)
    }

    const trend = await getFinanceProgressTrend(user.id, {
      categoryId,
      typeId,
      startDate,
      endDate,
    })

    const records = await getFinancialRecords(user.id)

    return NextResponse.json({
      data: trend,
      records,
      count: trend.length,
    })
  } catch (error: unknown) {
    console.error("GET /api/finance/progress error:", error)

    const message = error instanceof Error ? error.message : ""
    if (
      message === "Unauthorized" ||
      (error as { digest?: string })?.digest?.includes("NEXT_REDIRECT")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
