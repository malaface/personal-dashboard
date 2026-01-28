/**
 * GET /api/exercises/history
 * Get exercise history for a specific exercise type
 *
 * Query params:
 *   - exerciseTypeId: string (required)
 *   - limit: number (optional, default: 10, max: 50)
 */

import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/utils"
import { getExerciseHistory } from "@/lib/workouts/history"
import { getProgressTrend } from "@/lib/workouts/progress"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const searchParams = request.nextUrl.searchParams

    const exerciseTypeId = searchParams.get("exerciseTypeId")
    const limitParam = searchParams.get("limit")
    const format = searchParams.get("format") || "list" // list or chart

    if (!exerciseTypeId) {
      return NextResponse.json(
        { error: "exerciseTypeId is required" },
        { status: 400 }
      )
    }

    const limit = Math.min(parseInt(limitParam || "10"), 50)

    if (format === "chart") {
      // Return data formatted for charts
      const trend = await getProgressTrend(user.id, exerciseTypeId, limit)

      return NextResponse.json({
        history: trend.map((entry) => ({
          date: entry.date.toISOString(),
          weight: entry.weight,
          volume: entry.volume,
          sets: entry.sets,
          reps: entry.reps,
        })),
        count: trend.length,
      })
    }

    // Default: return list format
    const history = await getExerciseHistory(user.id, exerciseTypeId, limit)

    return NextResponse.json({
      history: history.map((entry) => ({
        date: entry.date.toISOString(),
        sets: entry.sets,
        reps: entry.reps,
        weight: entry.weight,
        volume: entry.volume,
        workoutId: entry.workoutId,
        workoutName: entry.workoutName,
      })),
      count: history.length,
    })
  } catch (error: any) {
    console.error("GET /api/exercises/history error:", error)

    if (error.message === "Unauthorized" || error.digest?.includes("NEXT_REDIRECT")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
