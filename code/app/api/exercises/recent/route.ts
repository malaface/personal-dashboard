/**
 * GET /api/exercises/recent
 * Get recent exercise types performed by the authenticated user
 */

import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/utils"
import { getUserExerciseTypes } from "@/lib/workouts/history"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()

    const { searchParams } = new URL(request.url)
    const limitParam = parseInt(searchParams.get("limit") || "10", 10)
    const limit = Math.min(Math.max(1, limitParam), 20)

    const exerciseTypes = await getUserExerciseTypes(user.id)

    // Already sorted by lastPerformed desc from the function, just apply limit
    const limited = exerciseTypes.slice(0, limit)

    return NextResponse.json({
      exercises: limited.map((e) => ({
        id: e.id,
        name: e.name,
        lastPerformed: e.lastPerformed.toISOString(),
        totalWorkouts: e.totalWorkouts,
      })),
      count: limited.length,
    })
  } catch (error: any) {
    console.error("GET /api/exercises/recent error:", error)

    if (error.message === "Unauthorized" || error.digest?.includes("NEXT_REDIRECT")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
