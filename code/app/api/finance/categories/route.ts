/**
 * GET /api/finance/categories
 * Get user's transaction categories and types for filter dropdowns
 */

import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/db/prisma"

export async function GET() {
  try {
    const user = await requireAuth()

    // Get distinct categories used by the user
    const categoryTransactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        categoryId: { not: null },
      },
      select: {
        categoryItem: {
          select: { id: true, name: true },
        },
      },
      distinct: ["categoryId"],
    })

    const categories = categoryTransactions
      .filter((t) => t.categoryItem !== null)
      .map((t) => ({
        id: t.categoryItem!.id,
        name: t.categoryItem!.name,
      }))

    // Get distinct types used by the user
    const typeTransactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        typeId: { not: null },
      },
      select: {
        typeItem: {
          select: { id: true, name: true },
        },
      },
      distinct: ["typeId"],
    })

    const types = typeTransactions
      .filter((t) => t.typeItem !== null)
      .map((t) => ({
        id: t.typeItem!.id,
        name: t.typeItem!.name,
      }))

    return NextResponse.json({ categories, types })
  } catch (error: unknown) {
    console.error("GET /api/finance/categories error:", error)

    const message = error instanceof Error ? error.message : ""
    if (
      message === "Unauthorized" ||
      (error as { digest?: string })?.digest?.includes("NEXT_REDIRECT")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
