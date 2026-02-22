import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/utils"
import { getMealTemplates, createMealTemplate } from "@/lib/templates/meal-queries"
import { MealTemplateWithItemsSchema } from "@/lib/validations/templates"

/**
 * GET /api/templates/meals
 * Query params:
 *   - mealType: BREAKFAST | LUNCH | DINNER | SNACK (optional)
 *   - tags: comma-separated tags (optional)
 *   - search: search term (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const searchParams = request.nextUrl.searchParams

    // Parse filters
    const mealType = searchParams.get("mealType") as "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK" | undefined
    const tagsParam = searchParams.get("tags")
    const search = searchParams.get("search") || undefined

    const tags = tagsParam ? tagsParam.split(",").filter(Boolean) : undefined

    // Validate mealType if provided
    if (mealType && !["BREAKFAST", "LUNCH", "DINNER", "SNACK"].includes(mealType)) {
      return NextResponse.json(
        { error: "Invalid meal type" },
        { status: 400 }
      )
    }

    // Get templates with filters + pagination
    const take = parseInt(searchParams.get("take") || "50", 10)
    const skip = parseInt(searchParams.get("skip") || "0", 10)

    const { templates, total } = await getMealTemplates(user.id, {
      mealType,
      tags,
      search,
      take: Math.min(take, 100),
      skip
    })

    return NextResponse.json({
      templates,
      count: templates.length,
      total
    })

  } catch (error: unknown) {
    console.error("GET /api/templates/meals error:", error)

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch templates" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/templates/meals
 * Body: MealTemplateWithItemsInput
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    // Validate input
    const result = MealTemplateWithItemsSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: result.error.issues
        },
        { status: 400 }
      )
    }

    // Create template
    const template = await createMealTemplate(user.id, result.data)

    return NextResponse.json(
      {
        template,
        message: "Meal template created successfully"
      },
      { status: 201 }
    )

  } catch (error: unknown) {
    console.error("POST /api/templates/meals error:", error)

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create template" },
      { status: 500 }
    )
  }
}
