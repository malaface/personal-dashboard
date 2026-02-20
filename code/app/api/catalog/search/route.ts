import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/utils"
import { CatalogType } from "@/lib/catalog/types"
import { prisma } from "@/lib/db/prisma"

/**
 * GET /api/catalog/search
 * Smart search endpoint for catalog items with full-text search and relevance ranking
 *
 * Query params:
 *   - q: search query (required, min 2 characters)
 *   - catalogType: transaction_category | investment_type | budget_category | exercise_category | equipment_type | muscle_group (required)
 *   - parentId: filter by parent ID (optional)
 *   - limit: number of results (default: 20, max: 100)
 *   - offset: pagination offset (default: 0)
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const searchParams = request.nextUrl.searchParams

    const query = searchParams.get("q")
    const catalogType = searchParams.get("catalogType") as CatalogType
    const parentId = searchParams.get("parentId")
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100)
    const offset = parseInt(searchParams.get("offset") || "0")

    // Validate required params
    if (!query) {
      return NextResponse.json(
        { error: "Search query (q) is required" },
        { status: 400 }
      )
    }

    if (query.length < 2) {
      return NextResponse.json(
        { error: "Search query must be at least 2 characters" },
        { status: 400 }
      )
    }

    if (!catalogType) {
      return NextResponse.json(
        { error: "catalogType is required" },
        { status: 400 }
      )
    }

    // Validate catalogType
    const validTypes = [
      "transaction_category",
      "investment_type",
      "budget_category",
      "exercise_category",
      "equipment_type",
      "muscle_group"
    ]
    if (!validTypes.includes(catalogType)) {
      return NextResponse.json(
        { error: "Invalid catalogType" },
        { status: 400 }
      )
    }

    // Prepare search term (case-insensitive)
    const searchTerm = query.toLowerCase().trim()

    // Build WHERE clause
    const whereClause: any = {
      catalogType,
      isActive: true,
      OR: [
        { isSystem: true, userId: null },
        { isSystem: false, userId: user.id }
      ],
      AND: [
        {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
            { slug: { contains: searchTerm, mode: 'insensitive' } }
          ]
        }
      ]
    }

    // Add parentId filter if provided
    if (parentId !== null && parentId !== undefined && parentId !== "") {
      whereClause.parentId = parentId
    }

    // Execute search query
    const items = await prisma.catalogItem.findMany({
      where: whereClause,
      include: {
        parent: true,
        children: {
          where: { isActive: true },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
        }
      },
      take: limit,
      skip: offset
    })

    // Build breadcrumbs and calculate relevance score
    const results = await Promise.all(items.map(async (item) => {
      const breadcrumbs: string[] = []

      // Build breadcrumb path by recursively fetching parents
      let currentParentId = item.parentId
      while (currentParentId) {
        const parent = await prisma.catalogItem.findUnique({
          where: { id: currentParentId },
          select: { name: true, parentId: true }
        })
        if (parent) {
          breadcrumbs.unshift(parent.name)
          currentParentId = parent.parentId
        } else {
          break
        }
      }

      // Calculate relevance score
      // Exact match = 100, starts with = 75, contains = 50
      let relevanceScore = 50 // Default: contains

      const nameLower = item.name.toLowerCase()
      const slugLower = item.slug.toLowerCase()

      if (nameLower === searchTerm || slugLower === searchTerm) {
        relevanceScore = 100 // Exact match
      } else if (nameLower.startsWith(searchTerm) || slugLower.startsWith(searchTerm)) {
        relevanceScore = 75 // Starts with
      }

      return {
        id: item.id,
        catalogType: item.catalogType,
        name: item.name,
        slug: item.slug,
        description: item.description,
        parentId: item.parentId,
        level: item.level,
        isSystem: item.isSystem,
        userId: item.userId,
        icon: item.icon,
        color: item.color,
        sortOrder: item.sortOrder,
        metadata: item.metadata,
        isActive: item.isActive,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        breadcrumbs,
        relevanceScore,
        parent: item.parent ? {
          id: item.parent.id,
          catalogType: item.parent.catalogType,
          name: item.parent.name,
          slug: item.parent.slug,
          description: item.parent.description,
          parentId: item.parent.parentId,
          level: item.parent.level,
          isSystem: item.parent.isSystem,
          userId: item.parent.userId,
          icon: item.parent.icon,
          color: item.parent.color,
          sortOrder: item.parent.sortOrder,
          metadata: item.parent.metadata,
          isActive: item.parent.isActive,
          createdAt: item.parent.createdAt,
          updatedAt: item.parent.updatedAt,
        } : null,
        children: item.children.map(child => ({
          id: child.id,
          catalogType: child.catalogType,
          name: child.name,
          slug: child.slug,
          description: child.description,
          parentId: child.parentId,
          level: child.level,
          isSystem: child.isSystem,
          userId: child.userId,
          icon: child.icon,
          color: child.color,
          sortOrder: child.sortOrder,
          metadata: child.metadata,
          isActive: child.isActive,
          createdAt: child.createdAt,
          updatedAt: child.updatedAt,
        }))
      }
    }))

    // Sort by relevance score (highest first), then by name
    results.sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore
      }
      return a.name.localeCompare(b.name)
    })

    // Get total count for pagination
    const totalCount = await prisma.catalogItem.count({ where: whereClause })

    return NextResponse.json({
      results,
      count: results.length,
      totalCount,
      limit,
      offset,
      hasMore: offset + results.length < totalCount,
      query: searchTerm
    })

  } catch (error: any) {
    console.error("GET /api/catalog/search error:", error)

    if (error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    )
  }
}
