import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/utils"
import { loadMealTemplate } from "@/lib/templates/meal-queries"

/**
 * GET /api/templates/meals/[id]/load
 * Load meal template for pre-filling meal form
 * Transforms template structure to meal form structure
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
    const mealData = await loadMealTemplate(id, user.id)

    return NextResponse.json({
      data: mealData,
      message: "Template loaded successfully"
    })

  } catch (error: any) {
    console.error("GET /api/templates/meals/[id]/load error:", error)

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
