import { prisma } from "@/lib/db/prisma"
import type { MealTemplateWithItemsInput, UpdateMealTemplateInput } from "@/lib/validations/templates"

// ============================================
// GET MEAL TEMPLATES
// ============================================

export async function getMealTemplates(userId: string, filters?: {
  isPublic?: boolean
  mealType?: "BREAKFAST" | "LUNCH" | "DINNER" | "SNACK"
  tags?: string[]
  search?: string
}) {
  const where: any = {
    OR: [
      { userId, isPublic: false }, // User's private templates
      { isPublic: true }            // Public templates
    ]
  }

  if (filters?.mealType) {
    where.mealType = filters.mealType
  }

  if (filters?.tags && filters.tags.length > 0) {
    where.tags = {
      hasSome: filters.tags
    }
  }

  if (filters?.search) {
    where.AND = [
      ...(where.AND || []),
      {
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } }
        ]
      }
    ]
  }

  const templates = await prisma.mealTemplate.findMany({
    where,
    include: {
      foodItems: {
        orderBy: {
          sortOrder: 'asc'
        }
      },
      user: {
        select: {
          name: true,
          email: true
        }
      }
    },
    orderBy: [
      { isPublic: 'desc' }, // Public first
      { updatedAt: 'desc' }
    ]
  })

  return templates
}

// ============================================
// GET MEAL TEMPLATE BY ID
// ============================================

export async function getMealTemplateById(id: string, userId: string) {
  const template = await prisma.mealTemplate.findFirst({
    where: {
      id,
      OR: [
        { userId },           // User owns it
        { isPublic: true }    // Or it's public
      ]
    },
    include: {
      foodItems: {
        orderBy: {
          sortOrder: 'asc'
        }
      },
      user: {
        select: {
          name: true,
          email: true
        }
      }
    }
  })

  if (!template) {
    throw new Error("Template not found or access denied")
  }

  return template
}

// ============================================
// CREATE MEAL TEMPLATE
// ============================================

export async function createMealTemplate(
  userId: string,
  data: MealTemplateWithItemsInput
) {
  // Calculate totals from food items
  const totals = data.foodItems.reduce(
    (acc, item) => ({
      calories: acc.calories + (item.calories || 0),
      protein: acc.protein + (item.protein || 0),
      carbs: acc.carbs + (item.carbs || 0),
      fats: acc.fats + (item.fats || 0)
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  )

  const template = await prisma.mealTemplate.create({
    data: {
      userId,
      name: data.name,
      description: data.description || null,
      mealType: data.mealType || null,
      isPublic: data.isPublic,
      tags: data.tags,
      totalCalories: totals.calories,
      totalProtein: totals.protein,
      totalCarbs: totals.carbs,
      totalFats: totals.fats,
      foodItems: {
        create: data.foodItems.map((item, index) => ({
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          calories: item.calories || null,
          protein: item.protein || null,
          carbs: item.carbs || null,
          fats: item.fats || null,
          sortOrder: item.sortOrder ?? index
        }))
      }
    },
    include: {
      foodItems: {
        orderBy: {
          sortOrder: 'asc'
        }
      }
    }
  })

  return template
}

// ============================================
// UPDATE MEAL TEMPLATE
// ============================================

export async function updateMealTemplate(
  id: string,
  userId: string,
  data: UpdateMealTemplateInput
) {
  // Verify ownership
  const existing = await prisma.mealTemplate.findFirst({
    where: { id, userId }
  })

  if (!existing) {
    throw new Error("Template not found or access denied")
  }

  // Calculate totals if food items provided
  let totals = {
    totalCalories: existing.totalCalories,
    totalProtein: existing.totalProtein,
    totalCarbs: existing.totalCarbs,
    totalFats: existing.totalFats
  }

  if (data.foodItems) {
    totals = data.foodItems.reduce(
      (acc, item) => ({
        totalCalories: acc.totalCalories + (item.calories || 0),
        totalProtein: acc.totalProtein + (item.protein || 0),
        totalCarbs: acc.totalCarbs + (item.carbs || 0),
        totalFats: acc.totalFats + (item.fats || 0)
      }),
      { totalCalories: 0, totalProtein: 0, totalCarbs: 0, totalFats: 0 }
    )
  }

  // Update template
  const template = await prisma.mealTemplate.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description || null,
      mealType: data.mealType || null,
      isPublic: data.isPublic,
      tags: data.tags,
      ...totals,
      // If food items provided, replace all
      ...(data.foodItems && {
        foodItems: {
          deleteMany: {}, // Delete all existing
          create: data.foodItems.map((item, index) => ({
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            calories: item.calories || null,
            protein: item.protein || null,
            carbs: item.carbs || null,
            fats: item.fats || null,
            sortOrder: item.sortOrder ?? index
          }))
        }
      })
    },
    include: {
      foodItems: {
        orderBy: {
          sortOrder: 'asc'
        }
      }
    }
  })

  return template
}

// ============================================
// DELETE MEAL TEMPLATE
// ============================================

export async function deleteMealTemplate(id: string, userId: string) {
  // Verify ownership
  const existing = await prisma.mealTemplate.findFirst({
    where: { id, userId }
  })

  if (!existing) {
    throw new Error("Template not found or access denied")
  }

  await prisma.mealTemplate.delete({
    where: { id }
  })

  return { success: true }
}

// ============================================
// LOAD MEAL TEMPLATE (for creating meal)
// ============================================

export async function loadMealTemplate(id: string, userId: string) {
  const template = await getMealTemplateById(id, userId)

  // Transform template to meal format
  return {
    name: template.name,
    mealType: template.mealType,
    totalCalories: template.totalCalories,
    totalProtein: template.totalProtein,
    totalCarbs: template.totalCarbs,
    totalFats: template.totalFats,
    foodItems: template.foodItems.map(item => ({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fats: item.fats
    }))
  }
}
