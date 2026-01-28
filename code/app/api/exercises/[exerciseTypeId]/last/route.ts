/**
 * GET /api/exercises/[exerciseTypeId]/last
 * Get the last time a user performed a specific exercise type
 */

import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/utils"
import { getLastExercisePerformance } from "@/lib/workouts/history"
import { getPersonalRecords } from "@/lib/workouts/progress"

interface RouteParams {
  params: Promise<{
    exerciseTypeId: string
  }>
}

export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const user = await requireAuth()
    const params = await context.params
    const { exerciseTypeId } = params

    if (!exerciseTypeId) {
      return NextResponse.json(
        { error: "Exercise type ID is required" },
        { status: 400 }
      )
    }

    // Get last performance and PRs in parallel
    const [lastPerformance, personalRecord] = await Promise.all([
      getLastExercisePerformance(user.id, exerciseTypeId),
      getPersonalRecords(user.id, exerciseTypeId),
    ])

    return NextResponse.json({
      found: lastPerformance.found,
      lastWorkout: lastPerformance.lastWorkout
        ? {
            date: lastPerformance.lastWorkout.date.toISOString(),
            daysAgo: lastPerformance.lastWorkout.daysAgo,
            sets: lastPerformance.lastWorkout.sets,
            reps: lastPerformance.lastWorkout.reps,
            weight: lastPerformance.lastWorkout.weight,
            volume: lastPerformance.lastWorkout.volume,
            workoutName: lastPerformance.lastWorkout.workoutName,
          }
        : null,
      personalRecord: {
        maxWeight: personalRecord.maxWeight.value,
        maxWeightDate: personalRecord.maxWeight.date?.toISOString() || null,
        maxVolume: personalRecord.maxVolume.value,
        maxVolumeDate: personalRecord.maxVolume.date?.toISOString() || null,
        maxReps: personalRecord.maxReps.value,
        maxRepsDate: personalRecord.maxReps.date?.toISOString() || null,
      },
    })
  } catch (error: any) {
    console.error("GET /api/exercises/[exerciseTypeId]/last error:", error)

    if (error.message === "Unauthorized" || error.digest?.includes("NEXT_REDIRECT")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
