/**
 * GET /api/nutrition/progress
 * Get nutrition progress data for charts
 *
 * Query params:
 *   - mealType: "BREAKFAST"|"LUNCH"|"DINNER"|"SNACK" (optional)
 *   - range: "7d"|"30d"|"90d"|"6m"|"1y" (optional)
 *   - startDate: ISO string (optional)
 *   - endDate: ISO string (optional)
 */

import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/utils"
import {
  getNutritionProgressTrend,
  getNutritionRecords,
} from "@/lib/nutrition/progress"

function rangeToDate(range: string): Date {
  const now = new Date()
  switch (range) {
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    case "90d":
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
    case "6m":
      return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate())
    case "1y":
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
    default:
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const searchParams = request.nextUrl.searchParams

    const mealType = searchParams.get("mealType") || undefined
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

    const trend = await getNutritionProgressTrend(user.id, {
      mealType,
      startDate,
      endDate,
    })

    const records = await getNutritionRecords(user.id)

    return NextResponse.json({
      data: trend,
      records,
      count: trend.length,
    })
  } catch (error: unknown) {
    console.error("GET /api/nutrition/progress error:", error)

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
