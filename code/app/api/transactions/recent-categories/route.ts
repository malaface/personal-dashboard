/**
 * GET /api/transactions/recent-categories
 * Returns the most frequently used type+category combinations for quick-add
 */

import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
  try {
    const user = await requireAuth()

    // Get most frequent type+category combinations
    const recentCategories = await prisma.transaction.groupBy({
      by: ["typeId", "categoryId"],
      where: {
        userId: user.id,
        typeId: { not: null },
        categoryId: { not: null },
      },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 8,
    })

    // Fetch catalog item names and last amounts for each combination
    const categories = await Promise.all(
      recentCategories.map(async (rc) => {
        const [typeItem, categoryItem, lastTransaction] = await Promise.all([
          prisma.catalogItem.findUnique({
            where: { id: rc.typeId! },
            select: { id: true, name: true },
          }),
          prisma.catalogItem.findUnique({
            where: { id: rc.categoryId! },
            select: { id: true, name: true },
          }),
          prisma.transaction.findFirst({
            where: {
              userId: user.id,
              typeId: rc.typeId,
              categoryId: rc.categoryId,
            },
            orderBy: { date: "desc" },
            select: { amount: true },
          }),
        ])

        if (!typeItem || !categoryItem) return null

        return {
          typeId: rc.typeId!,
          categoryId: rc.categoryId!,
          typeName: typeItem.name,
          categoryName: categoryItem.name,
          count: rc._count.id,
          lastAmount: lastTransaction?.amount ?? null,
        }
      })
    )

    return NextResponse.json({
      categories: categories.filter(Boolean),
    })
  } catch (error: any) {
    console.error("GET /api/transactions/recent-categories error:", error)

    if (error.digest?.includes("NEXT_REDIRECT")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
