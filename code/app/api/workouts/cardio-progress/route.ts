import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/db/prisma"
import { WorkoutType } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)

    const type = searchParams.get("type") as WorkoutType | null
    const range = searchParams.get("range") || "30d"

    if (!type || !["SWIMMING", "RUNNING", "CYCLING"].includes(type)) {
      return NextResponse.json({ error: "Invalid type" }, { status: 400 })
    }

    const now = new Date()
    const rangeMap: Record<string, number> = {
      "7d": 7,
      "30d": 30,
      "90d": 90,
      "1y": 365,
    }
    const days = rangeMap[range] || 30
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

    const workouts = await prisma.workout.findMany({
      where: {
        userId: user.id,
        type,
        date: { gte: startDate },
      },
      include: { cardioSession: true },
      orderBy: { date: "asc" },
    })

    const series = workouts.map((w) => ({
      date: w.date.toISOString().split("T")[0],
      duration: w.duration,
      caloriesBurned: w.caloriesBurned,
      distance: w.cardioSession?.distance,
      pace: w.cardioSession?.pace,
      avgSpeed: w.cardioSession?.avgSpeed,
      elevationGain: w.cardioSession?.elevationGain,
      avgHeartRate: w.cardioSession?.avgHeartRate,
    }))

    const totalDistance = workouts.reduce((sum, w) => sum + (w.cardioSession?.distance || 0), 0)
    const totalDuration = workouts.reduce((sum, w) => sum + (w.duration || 0), 0)
    const totalCalories = workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0)

    const bestDistance = workouts.reduce(
      (best, w) => Math.max(best, w.cardioSession?.distance || 0),
      0
    )

    let bestPace: number | null = null
    let bestSpeed: number | null = null

    if (type === "RUNNING") {
      const paces = workouts
        .map((w) => w.cardioSession?.pace)
        .filter((p): p is number => p != null && p > 0)
      if (paces.length > 0) bestPace = Math.min(...paces)
    }

    if (type === "CYCLING") {
      const speeds = workouts
        .map((w) => w.cardioSession?.avgSpeed)
        .filter((s): s is number => s != null && s > 0)
      if (speeds.length > 0) bestSpeed = Math.max(...speeds)
    }

    return NextResponse.json({
      series,
      stats: {
        totalSessions: workouts.length,
        totalDistance,
        totalDuration,
        totalCalories,
        bestDistance,
        bestPace,
        bestSpeed,
      },
    })
  } catch (error: any) {
    console.error("Cardio progress error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
