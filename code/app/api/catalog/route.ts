import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/utils"
import { getUserCatalogItems, getCatalogItemsByParent } from "@/lib/catalog/queries"
import { buildCatalogTree } from "@/lib/catalog/utils"
import { createCatalogItem } from "@/lib/catalog/mutations"
import { CatalogType } from "@/lib/catalog/types"
import { CatalogItemSchema } from "@/lib/validations/catalog"
import { prisma } from "@/lib/db/prisma"

/**
 * GET /api/catalog
 * Query params:
 *   - catalogType: transaction_category | investment_type | budget_category (required)
 *   - parentId: filter by parent ID (optional)
 *   - format: flat | tree (default: flat)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const searchParams = request.nextUrl.searchParams

    const catalogType = searchParams.get("catalogType") as CatalogType
    const parentId = searchParams.get("parentId")
    const format = searchParams.get("format") || "flat"

    if (!catalogType) {
      return NextResponse.json(
        { error: "catalogType is required" },
        { status: 400 }
      )
    }

    // Validate catalogType
    const validTypes = [
      // Finance (3)
      "transaction_category", "investment_type", "budget_category",
      // Gym (3)
      "exercise_category", "equipment_type", "muscle_group",
      // Nutrition (4)
      "meal_type", "food_category", "unit_type", "nutrition_goal_type",
      // Family (5)
      "relationship_type", "event_category", "reminder_category", "activity_type", "social_circle"
    ]
    if (!validTypes.includes(catalogType)) {
      return NextResponse.json(
        { error: "Invalid catalogType" },
        { status: 400 }
      )
    }

    let items

    // If parentId is provided, get children of that parent
    if (parentId !== null && parentId !== undefined && parentId !== "") {
      items = await getCatalogItemsByParent(user.id, catalogType, parentId)
    } else {
      // Get all items for this catalog type
      items = await getUserCatalogItems(user.id, catalogType)
    }

    // Format response based on format parameter
    if (format === "tree") {
      const tree = buildCatalogTree(items)
      return NextResponse.json({ items: tree, count: items.length })
    }

    // Default: flat list
    return NextResponse.json({ items, count: items.length })

  } catch (error: any) {
    console.error("GET /api/catalog error:", error)

    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * POST /api/catalog
 * Create a new user catalog item
 */
export async function POST(request: NextRequest) {
  try {
    await requireAuth()

    const body = await request.json()

    // Validate input
    const validatedData = CatalogItemSchema.parse(body)

    // Generate slug if not provided
    const slug = validatedData.slug || validatedData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    // Create catalog item
    const result = await createCatalogItem({
      ...validatedData,
      slug
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    // Fetch complete item with all relations (parent, children)
    const completeItem = await prisma.catalogItem.findUnique({
      where: { id: result.catalogItem!.id },
      include: {
        parent: true,
        children: {
          where: { isActive: true },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
        }
      }
    })

    return NextResponse.json({
      success: true,
      item: completeItem
    }, { status: 201 })

  } catch (error: any) {
    console.error("POST /api/catalog error:", error)

    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
