"use server"

import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/db/prisma"
import { MealWithFoodItemsSchema } from "@/lib/validations/nutrition"
import { createAuditLog } from "@/lib/audit/logger"

export async function createMeal(formData: FormData) {
  try {
    const user = await requireAuth()

    const rawData = {
      name: formData.get("name"),
      mealType: formData.get("mealType"),
      date: formData.get("date"),
      notes: formData.get("notes") || undefined,
      foodItems: JSON.parse(formData.get("foodItems") as string),
    }

    const validatedData = MealWithFoodItemsSchema.parse(rawData)

    const meal = await prisma.meal.create({
      data: {
        userId: user.id,
        name: validatedData.name,
        mealType: validatedData.mealType,
        date: new Date(validatedData.date),
        notes: validatedData.notes,
        foodItems: {
          create: validatedData.foodItems.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            calories: item.calories,
            protein: item.protein,
            carbs: item.carbs,
            fats: item.fats,
          })),
        },
      },
      include: {
        foodItems: true,
      },
    })

    // Log meal creation
    await createAuditLog({
      userId: user.id,
      action: "MEAL_CREATED",
      metadata: { mealId: meal.id, mealType: meal.mealType },
    })

    revalidatePath("/dashboard/nutrition")

    return { success: true, meal }
  } catch (error: any) {
    console.error("Create meal error:", error)
    return { success: false, error: error.message || "Failed to create meal" }
  }
}

export async function deleteMeal(mealId: string) {
  try {
    const user = await requireAuth()

    const meal = await prisma.meal.findFirst({
      where: {
        id: mealId,
        userId: user.id,
      },
    })

    if (!meal) {
      return { success: false, error: "Meal not found or access denied" }
    }

    // Log before deleting
    await createAuditLog({
      userId: user.id,
      action: "MEAL_DELETED",
      metadata: { mealId },
    })

    await prisma.meal.delete({
      where: { id: mealId },
    })

    revalidatePath("/dashboard/nutrition")

    return { success: true }
  } catch (error: any) {
    console.error("Delete meal error:", error)
    return { success: false, error: error.message || "Failed to delete meal" }
  }
}

export async function updateMeal(mealId: string, formData: FormData) {
  try {
    const user = await requireAuth()

    const existingMeal = await prisma.meal.findFirst({
      where: {
        id: mealId,
        userId: user.id,
      },
    })

    if (!existingMeal) {
      return { success: false, error: "Meal not found or access denied" }
    }

    const rawData = {
      name: formData.get("name"),
      mealType: formData.get("mealType"),
      date: formData.get("date"),
      notes: formData.get("notes") || undefined,
      foodItems: JSON.parse(formData.get("foodItems") as string),
    }

    const validatedData = MealWithFoodItemsSchema.parse(rawData)

    const meal = await prisma.$transaction(async (tx) => {
      await tx.foodItem.deleteMany({
        where: { mealId },
      })

      return tx.meal.update({
        where: { id: mealId },
        data: {
          name: validatedData.name,
          mealType: validatedData.mealType,
          date: new Date(validatedData.date),
          notes: validatedData.notes,
          foodItems: {
            create: validatedData.foodItems.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              unit: item.unit,
              calories: item.calories,
              protein: item.protein,
              carbs: item.carbs,
              fats: item.fats,
            })),
          },
        },
        include: {
          foodItems: true,
        },
      })
    })

    // Log meal update
    await createAuditLog({
      userId: user.id,
      action: "MEAL_UPDATED",
      metadata: { mealId },
    })

    revalidatePath("/dashboard/nutrition")

    return { success: true, meal }
  } catch (error: any) {
    console.error("Update meal error:", error)
    return { success: false, error: error.message || "Failed to update meal" }
  }
}
