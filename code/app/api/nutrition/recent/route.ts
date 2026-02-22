/**
 * GET /api/nutrition/recent
 * Get recent meals for QuickMealBar
 *
 * Query params:
 *   - limit: number (default 10)
 */

import { NextRequest, NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/db/prisma"

const MEAL_TYPE_LABELS: Record<string, string> = {
  BREAKFAST: "Desayuno",
  LUNCH: "Almuerzo",
  DINNER: "Cena",
  SNACK: "Merienda",
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const limit = parseInt(request.nextUrl.searchParams.get("limit") || "10")

    const meals = await prisma.meal.findMany({
      where: { userId: user.id },
      include: {
        foodItems: true,
      },
      orderBy: { date: "desc" },
      take: Math.min(limit, 20),
    })

    const recentMeals = meals.map((meal) => ({
      id: meal.id,
      name: meal.name,
      mealType: meal.mealType,
      mealTypeLabel: MEAL_TYPE_LABELS[meal.mealType] || meal.mealType,
      date: meal.date.toISOString(),
      foodItems: meal.foodItems.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unit: item.unit,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fats: item.fats,
      })),
      totalCalories: meal.foodItems.reduce((sum, item) => sum + (item.calories || 0), 0),
    }))

    return NextResponse.json({ meals: recentMeals })
  } catch (error: unknown) {
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
