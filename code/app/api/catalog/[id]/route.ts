import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/utils"
import { getCatalogItemById, getCatalogItemUsageCount } from "@/lib/catalog/queries"
import { updateCatalogItem, deleteCatalogItem } from "@/lib/catalog/mutations"
import { CatalogItemUpdateSchema } from "@/lib/validations/catalog"

type RouteContext = {
  params: Promise<{
    id: string
  }>
}

/**
 * GET /api/catalog/[id]
 * Get a single catalog item by ID
 */
export async function GET(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    const item = await getCatalogItemById(id, user.id)

    if (!item) {
      return NextResponse.json(
        { error: "Catalog item not found" },
        { status: 404 }
      )
    }

    // Optionally include usage count
    const includeUsage = request.nextUrl.searchParams.get("includeUsage") === "true"
    let usage = undefined

    if (includeUsage) {
      usage = await getCatalogItemUsageCount(id)
    }

    return NextResponse.json({ item, usage })

  } catch (error: any) {
    console.error("GET /api/catalog/[id] error:", error)

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
 * PUT /api/catalog/[id]
 * Update a catalog item (user-owned only)
 */
export async function PUT(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    await requireAuth()
    const { id } = await params

    const body = await request.json()

    // Validate input
    const validatedData = CatalogItemUpdateSchema.parse(body)

    // Update catalog item
    const result = await updateCatalogItem(id, validatedData)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      item: result.catalogItem
    })

  } catch (error: any) {
    console.error("PUT /api/catalog/[id] error:", error)

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

/**
 * DELETE /api/catalog/[id]
 * Soft delete a catalog item (user-owned only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteContext
) {
  try {
    await requireAuth()
    const { id } = await params

    // Delete catalog item
    const result = await deleteCatalogItem(id)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error("DELETE /api/catalog/[id] error:", error)

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
