import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/utils"
import {
  getMealTemplateById,
  updateMealTemplate,
  deleteMealTemplate
} from "@/lib/templates/meal-queries"
import { UpdateMealTemplateSchema } from "@/lib/validations/templates"

/**
 * GET /api/templates/meals/[id]
 * Get single meal template by ID
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

    const template = await getMealTemplateById(id, user.id)

    return NextResponse.json({ template })

  } catch (error: unknown) {
    console.error("GET /api/templates/meals/[id] error:", error)
    const message = error instanceof Error ? error.message : 'Unknown error'

    if (message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    if (message.includes("not found") || message.includes("access denied")) {
      return NextResponse.json(
        { error: message },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: message || "Failed to fetch template" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/templates/meals/[id]
 * Update meal template (only owner)
 * Body: UpdateMealTemplateInput
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
    const result = UpdateMealTemplateSchema.safeParse(body)

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
    const template = await updateMealTemplate(id, user.id, result.data)

    return NextResponse.json({
      template,
      message: "Meal template updated successfully"
    })

  } catch (error: unknown) {
    console.error("PUT /api/templates/meals/[id] error:", error)
    const message = error instanceof Error ? error.message : 'Unknown error'

    if (message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    if (message.includes("not found") || message.includes("access denied")) {
      return NextResponse.json(
        { error: message },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: message || "Failed to update template" },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/templates/meals/[id]
 * Delete meal template (only owner)
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
    await deleteMealTemplate(id, user.id)

    return NextResponse.json({
      message: "Meal template deleted successfully"
    })

  } catch (error: unknown) {
    console.error("DELETE /api/templates/meals/[id] error:", error)
    const message = error instanceof Error ? error.message : 'Unknown error'

    if (message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    if (message.includes("not found") || message.includes("access denied")) {
      return NextResponse.json(
        { error: message },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: message || "Failed to delete template" },
      { status: 500 }
    )
  }
}
