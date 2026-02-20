/**
 * Nutrition Progress - Daily macro tracking and records
 */

import { prisma } from "@/lib/db/prisma"

export interface DailyNutritionPoint {
  date: string
  calories: number
  protein: number
  carbs: number
  fats: number
  mealCount: number
}

export interface NutritionRecords {
  bestCaloriesDay: { value: number; date: string } | null
  bestProteinDay: { value: number; date: string } | null
  bestCarbsDay: { value: number; date: string } | null
  bestFatsDay: { value: number; date: string } | null
  mostMealsDay: { value: number; date: string } | null
}

/**
 * Get nutrition progress trend grouped by day
 */
export async function getNutritionProgressTrend(
  userId: string,
  filters: {
    mealType?: string
    startDate?: Date
    endDate?: Date
  }
): Promise<DailyNutritionPoint[]> {
  const where: Record<string, unknown> = { userId }

  if (filters.mealType) {
    where.mealType = filters.mealType
  }

  if (filters.startDate || filters.endDate) {
    where.date = {
      ...(filters.startDate ? { gte: filters.startDate } : {}),
      ...(filters.endDate ? { lte: filters.endDate } : {}),
    }
  }

  const meals = await prisma.meal.findMany({
    where,
    include: {
      foodItems: {
        select: {
          calories: true,
          protein: true,
          carbs: true,
          fats: true,
        },
      },
    },
    orderBy: { date: "asc" },
  })

  // Group by day (YYYY-MM-DD)
  const dayMap = new Map<
    string,
    { calories: number; protein: number; carbs: number; fats: number; mealCount: number }
  >()

  for (const meal of meals) {
    const dayKey = meal.date.toISOString().slice(0, 10)
    const existing = dayMap.get(dayKey) || {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      mealCount: 0,
    }

    for (const item of meal.foodItems) {
      existing.calories += item.calories || 0
      existing.protein += item.protein || 0
      existing.carbs += item.carbs || 0
      existing.fats += item.fats || 0
    }
    existing.mealCount += 1

    dayMap.set(dayKey, existing)
  }

  const result: DailyNutritionPoint[] = []
  for (const [date, data] of dayMap) {
    result.push({
      date,
      calories: Math.round(data.calories),
      protein: Math.round(data.protein * 10) / 10,
      carbs: Math.round(data.carbs * 10) / 10,
      fats: Math.round(data.fats * 10) / 10,
      mealCount: data.mealCount,
    })
  }

  return result.sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Get nutrition records (all-time bests)
 */
export async function getNutritionRecords(
  userId: string
): Promise<NutritionRecords> {
  const meals = await prisma.meal.findMany({
    where: { userId },
    include: {
      foodItems: {
        select: {
          calories: true,
          protein: true,
          carbs: true,
          fats: true,
        },
      },
    },
    orderBy: { date: "asc" },
  })

  // Group by day
  const dayMap = new Map<
    string,
    { calories: number; protein: number; carbs: number; fats: number; mealCount: number }
  >()

  for (const meal of meals) {
    const dayKey = meal.date.toISOString().slice(0, 10)
    const existing = dayMap.get(dayKey) || {
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      mealCount: 0,
    }

    for (const item of meal.foodItems) {
      existing.calories += item.calories || 0
      existing.protein += item.protein || 0
      existing.carbs += item.carbs || 0
      existing.fats += item.fats || 0
    }
    existing.mealCount += 1

    dayMap.set(dayKey, existing)
  }

  let bestCaloriesDay: NutritionRecords["bestCaloriesDay"] = null
  let bestProteinDay: NutritionRecords["bestProteinDay"] = null
  let bestCarbsDay: NutritionRecords["bestCarbsDay"] = null
  let bestFatsDay: NutritionRecords["bestFatsDay"] = null
  let mostMealsDay: NutritionRecords["mostMealsDay"] = null

  for (const [date, data] of dayMap) {
    if (!bestCaloriesDay || data.calories > bestCaloriesDay.value) {
      bestCaloriesDay = { value: Math.round(data.calories), date }
    }
    if (!bestProteinDay || data.protein > bestProteinDay.value) {
      bestProteinDay = { value: Math.round(data.protein * 10) / 10, date }
    }
    if (!bestCarbsDay || data.carbs > bestCarbsDay.value) {
      bestCarbsDay = { value: Math.round(data.carbs * 10) / 10, date }
    }
    if (!bestFatsDay || data.fats > bestFatsDay.value) {
      bestFatsDay = { value: Math.round(data.fats * 10) / 10, date }
    }
    if (!mostMealsDay || data.mealCount > mostMealsDay.value) {
      mostMealsDay = { value: data.mealCount, date }
    }
  }

  return {
    bestCaloriesDay,
    bestProteinDay,
    bestCarbsDay,
    bestFatsDay,
    mostMealsDay,
  }
}
