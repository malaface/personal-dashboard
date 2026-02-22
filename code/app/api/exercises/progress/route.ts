/**
 * GET /api/exercises/progress
 * Get exercise progress data for charts
 *
 * Query params:
 *   - exerciseTypeId: string (optional) - specific exercise
 *   - muscleGroupId: string (optional) - filter by muscle group
 *   - range: "7d"|"30d"|"90d"|"6m"|"1y" (optional) - preset range
 *   - startDate: ISO string (optional) - custom start
 *   - endDate: ISO string (optional) - custom end
 */

import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/utils"
import { getProgressTrendFiltered, getPersonalRecords } from "@/lib/workouts/progress"

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
      return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const searchParams = request.nextUrl.searchParams

    const exerciseTypeId = searchParams.get("exerciseTypeId") || undefined
    const muscleGroupId = searchParams.get("muscleGroupId") || undefined
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

    const trend = await getProgressTrendFiltered(user.id, {
      exerciseTypeId,
      muscleGroupId,
      startDate,
      endDate,
    })

    // Format response
    const data = trend.map((entry) => ({
      date: entry.date.toISOString(),
      weight: entry.weight,
      volume: entry.volume,
      sets: entry.sets,
      reps: entry.reps,
      exerciseTypeId: entry.exerciseTypeId,
      exerciseTypeName: entry.exerciseTypeName,
    }))

    // Include PRs if specific exercise selected
    let personalRecords = null
    if (exerciseTypeId) {
      const prs = await getPersonalRecords(user.id, exerciseTypeId)
      personalRecords = {
        maxWeight: prs.maxWeight.value,
        maxWeightDate: prs.maxWeight.date?.toISOString() ?? null,
        maxVolume: prs.maxVolume.value,
        maxVolumeDate: prs.maxVolume.date?.toISOString() ?? null,
        maxReps: prs.maxReps.value,
        maxRepsDate: prs.maxReps.date?.toISOString() ?? null,
      }
    }

    return NextResponse.json({ data, personalRecords, count: data.length })
  } catch (error: unknown) {
    console.error("GET /api/exercises/progress error:", error)

    const message = error instanceof Error ? error.message : ""
    if (message === "Unauthorized" || (error as { digest?: string })?.digest?.includes("NEXT_REDIRECT")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
