import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/utils"
import {
  getWorkoutTemplateById,
  updateWorkoutTemplate,
  deleteWorkoutTemplate
} from "@/lib/templates/workout-queries"
import { UpdateWorkoutTemplateSchema } from "@/lib/validations/templates"

/**
 * GET /api/templates/workouts/[id]
 * Get single workout template by ID
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

    const template = await getWorkoutTemplateById(id, user.id)

    return NextResponse.json({ template })

  } catch (error: any) {
    console.error("GET /api/templates/workouts/[id] error:", error)

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
      { error: error.message || "Failed to fetch template" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/templates/workouts/[id]
 * Update workout template (only owner)
 * Body: UpdateWorkoutTemplateInput
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params
    const body = await request.json()

    if (!id) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      )
    }

    // Validate input
    const result = UpdateWorkoutTemplateSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: result.error.issues
        },
        { status: 400 }
      )
    }

    // Update template
    const template = await updateWorkoutTemplate(id, user.id, result.data)

    return NextResponse.json({
      template,
      message: "Workout template updated successfully"
    })

  } catch (error: any) {
    console.error("PUT /api/templates/workouts/[id] error:", error)

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
      { error: error.message || "Failed to update template" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/templates/workouts/[id]
 * Delete workout template (only owner)
 */
export async function DELETE(
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

    // Delete template
    await deleteWorkoutTemplate(id, user.id)

    return NextResponse.json({
      message: "Workout template deleted successfully"
    })

  } catch (error: any) {
    console.error("DELETE /api/templates/workouts/[id] error:", error)

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
      { error: error.message || "Failed to delete template" },
      { status: 500 }
    )
  }
}
