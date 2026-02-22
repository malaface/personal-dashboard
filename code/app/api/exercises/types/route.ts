/**
 * GET /api/exercises/types
 * Get all exercise types and muscle groups for the authenticated user
 * Used to populate filter dropdowns
 */

import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/utils"
import { getUserExerciseTypes } from "@/lib/workouts/history"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
  try {
    const user = await requireAuth()

    // Get exercise types the user has performed
    const exerciseTypes = await getUserExerciseTypes(user.id)

    // Get distinct muscle groups from user's exercises
    const muscleGroupExercises = await prisma.exercise.findMany({
      where: {
        workout: { userId: user.id },
        muscleGroupId: { not: null },
      },
      select: {
        muscleGroup: {
          select: { id: true, name: true },
        },
      },
      distinct: ["muscleGroupId"],
    })

    const muscleGroups = muscleGroupExercises
      .filter((e) => e.muscleGroup !== null)
      .map((e) => ({
        id: e.muscleGroup!.id,
        name: e.muscleGroup!.name,
      }))

    return NextResponse.json({
      exerciseTypes: exerciseTypes.map((e) => ({
        id: e.id,
        name: e.name,
        lastPerformed: e.lastPerformed.toISOString(),
        totalWorkouts: e.totalWorkouts,
      })),
      muscleGroups,
    })
  } catch (error: unknown) {
    console.error("GET /api/exercises/types error:", error)

    const message = error instanceof Error ? error.message : ""
    if (message === "Unauthorized" || (error as { digest?: string })?.digest?.includes("NEXT_REDIRECT")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
