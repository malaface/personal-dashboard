import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/utils"
import { getWorkoutTemplates, createWorkoutTemplate } from "@/lib/templates/workout-queries"
import { WorkoutTemplateWithExercisesSchema } from "@/lib/validations/templates"

/**
 * GET /api/templates/workouts
 * Query params:
 *   - difficulty: BEGINNER | INTERMEDIATE | ADVANCED (optional)
 *   - tags: comma-separated tags (optional)
 *   - search: search term (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const searchParams = request.nextUrl.searchParams

    // Parse filters
    const difficulty = searchParams.get("difficulty") as "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | undefined
    const tagsParam = searchParams.get("tags")
    const search = searchParams.get("search") || undefined

    const tags = tagsParam ? tagsParam.split(",").filter(Boolean) : undefined

    // Validate difficulty if provided
    if (difficulty && !["BEGINNER", "INTERMEDIATE", "ADVANCED"].includes(difficulty)) {
      return NextResponse.json(
        { error: "Invalid difficulty level" },
        { status: 400 }
      )
    }

    // Get templates with filters + pagination
    const take = parseInt(searchParams.get("take") || "50", 10)
    const skip = parseInt(searchParams.get("skip") || "0", 10)

    const { templates, total } = await getWorkoutTemplates(user.id, {
      difficulty,
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
    console.error("GET /api/templates/workouts error:", error)

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
 * POST /api/templates/workouts
 * Body: WorkoutTemplateWithExercisesInput
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()

    // Validate input
    const result = WorkoutTemplateWithExercisesSchema.safeParse(body)

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
    const template = await createWorkoutTemplate(user.id, result.data)

    return NextResponse.json(
      {
        template,
        message: "Workout template created successfully"
      },
      { status: 201 }
    )

  } catch (error: unknown) {
    console.error("POST /api/templates/workouts error:", error)

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
