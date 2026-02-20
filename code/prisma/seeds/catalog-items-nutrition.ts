import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function seedNutritionCatalog() {
  // meal_type
  const mainMeals = await prisma.catalogItem.create({
    data: {
      catalogType: 'meal_type',
      name: 'Main Meals',
      slug: 'main-meals',
      level: 0,
      isSystem: true,
      sortOrder: 1,
      isActive: true
    }
  })

  await prisma.catalogItem.createMany({
    data: [
      { catalogType: 'meal_type', name: 'Breakfast', slug: 'breakfast', parentId: mainMeals.id, level: 1, isSystem: true, sortOrder: 1, isActive: true },
      { catalogType: 'meal_type', name: 'Lunch', slug: 'lunch', parentId: mainMeals.id, level: 1, isSystem: true, sortOrder: 2, isActive: true },
      { catalogType: 'meal_type', name: 'Dinner', slug: 'dinner', parentId: mainMeals.id, level: 1, isSystem: true, sortOrder: 3, isActive: true },
      { catalogType: 'meal_type', name: 'Snacks', slug: 'snacks', level: 0, isSystem: true, sortOrder: 2, isActive: true },
      { catalogType: 'meal_type', name: 'Workout Nutrition', slug: 'workout-nutrition', level: 0, isSystem: true, sortOrder: 3, isActive: true }
    ]
  })

  // food_category
  const protein = await prisma.catalogItem.create({
    data: { catalogType: 'food_category', name: 'Protein Sources', slug: 'protein-sources', level: 0, isSystem: true, sortOrder: 1, isActive: true }
  })

  await prisma.catalogItem.createMany({
    data: [
      { catalogType: 'food_category', name: 'Animal Protein', slug: 'animal-protein', parentId: protein.id, level: 1, isSystem: true, sortOrder: 1, isActive: true },
      { catalogType: 'food_category', name: 'Plant Protein', slug: 'plant-protein', parentId: protein.id, level: 1, isSystem: true, sortOrder: 2, isActive: true },
      { catalogType: 'food_category', name: 'Carbohydrates', slug: 'carbohydrates', level: 0, isSystem: true, sortOrder: 2, isActive: true },
      { catalogType: 'food_category', name: 'Vegetables', slug: 'vegetables', level: 0, isSystem: true, sortOrder: 3, isActive: true },
      { catalogType: 'food_category', name: 'Fruits', slug: 'fruits', level: 0, isSystem: true, sortOrder: 4, isActive: true },
      { catalogType: 'food_category', name: 'Fats & Oils', slug: 'fats-oils', level: 0, isSystem: true, sortOrder: 5, isActive: true }
    ]
  })

  // unit_type
  const weight = await prisma.catalogItem.create({
    data: { catalogType: 'unit_type', name: 'Weight', slug: 'weight', level: 0, isSystem: true, sortOrder: 1, isActive: true }
  })

  await prisma.catalogItem.createMany({
    data: [
      { catalogType: 'unit_type', name: 'Grams (g)', slug: 'grams', parentId: weight.id, level: 1, isSystem: true, sortOrder: 1, isActive: true },
      { catalogType: 'unit_type', name: 'Ounces (oz)', slug: 'ounces', parentId: weight.id, level: 1, isSystem: true, sortOrder: 2, isActive: true },
      { catalogType: 'unit_type', name: 'Volume', slug: 'volume', level: 0, isSystem: true, sortOrder: 2, isActive: true },
      { catalogType: 'unit_type', name: 'Pieces', slug: 'pieces', level: 0, isSystem: true, sortOrder: 3, isActive: true }
    ]
  })

  // nutrition_goal_type
  await prisma.catalogItem.createMany({
    data: [
      { catalogType: 'nutrition_goal_type', name: 'Weight Loss', slug: 'weight-loss', level: 0, isSystem: true, sortOrder: 1, isActive: true },
      { catalogType: 'nutrition_goal_type', name: 'Muscle Gain', slug: 'muscle-gain', level: 0, isSystem: true, sortOrder: 2, isActive: true },
      { catalogType: 'nutrition_goal_type', name: 'Maintenance', slug: 'maintenance', level: 0, isSystem: true, sortOrder: 3, isActive: true },
      { catalogType: 'nutrition_goal_type', name: 'Performance', slug: 'performance', level: 0, isSystem: true, sortOrder: 4, isActive: true }
    ]
  })

  console.log('✅ Nutrition catalog seeded')
}

seedNutritionCatalog()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
