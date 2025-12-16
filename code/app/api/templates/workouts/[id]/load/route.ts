import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/utils"
import { loadWorkoutTemplate } from "@/lib/templates/workout-queries"

/**
 * GET /api/templates/workouts/[id]/load
 * Load workout template for pre-filling workout form
 * Transforms template structure to workout form structure
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      )
    }

    // Load and transform template
    const workoutData = await loadWorkoutTemplate(id, user.id)

    return NextResponse.json({
      data: workoutData,
      message: "Template loaded successfully"
    })

  } catch (error: any) {
    console.error("GET /api/templates/workouts/[id]/load error:", error)

    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    if (error.message.includes("not found") || error.message.includes("access denied")) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: error.message || "Failed to load template" },
      { status: 500 }
    )
  }
}
