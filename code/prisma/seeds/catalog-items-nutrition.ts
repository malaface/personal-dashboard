import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function seedNutritionCatalog() {
  // meal_type
  const mainMeals = await prisma.catalogItem.create({
    data: {
      catalogType: 'meal_type',
      name: 'Comidas Principales',
      slug: 'main-meals',
      level: 0,
      isSystem: true,
      sortOrder: 1,
      isActive: true
    }
  })

  await prisma.catalogItem.createMany({
    data: [
      { catalogType: 'meal_type', name: 'Desayuno', slug: 'breakfast', parentId: mainMeals.id, level: 1, isSystem: true, sortOrder: 1, isActive: true },
      { catalogType: 'meal_type', name: 'Almuerzo', slug: 'lunch', parentId: mainMeals.id, level: 1, isSystem: true, sortOrder: 2, isActive: true },
      { catalogType: 'meal_type', name: 'Cena', slug: 'dinner', parentId: mainMeals.id, level: 1, isSystem: true, sortOrder: 3, isActive: true },
      { catalogType: 'meal_type', name: 'Colaciones', slug: 'snacks', level: 0, isSystem: true, sortOrder: 2, isActive: true },
      { catalogType: 'meal_type', name: 'Nutrición de Entrenamiento', slug: 'workout-nutrition', level: 0, isSystem: true, sortOrder: 3, isActive: true }
    ]
  })

  // food_category
  const protein = await prisma.catalogItem.create({
    data: { catalogType: 'food_category', name: 'Fuentes de Proteína', slug: 'protein-sources', level: 0, isSystem: true, sortOrder: 1, isActive: true }
  })

  await prisma.catalogItem.createMany({
    data: [
      { catalogType: 'food_category', name: 'Proteína Animal', slug: 'animal-protein', parentId: protein.id, level: 1, isSystem: true, sortOrder: 1, isActive: true },
      { catalogType: 'food_category', name: 'Proteína Vegetal', slug: 'plant-protein', parentId: protein.id, level: 1, isSystem: true, sortOrder: 2, isActive: true },
      { catalogType: 'food_category', name: 'Carbohidratos', slug: 'carbohydrates', level: 0, isSystem: true, sortOrder: 2, isActive: true },
      { catalogType: 'food_category', name: 'Verduras', slug: 'vegetables', level: 0, isSystem: true, sortOrder: 3, isActive: true },
      { catalogType: 'food_category', name: 'Frutas', slug: 'fruits', level: 0, isSystem: true, sortOrder: 4, isActive: true },
      { catalogType: 'food_category', name: 'Grasas y Aceites', slug: 'fats-oils', level: 0, isSystem: true, sortOrder: 5, isActive: true }
    ]
  })

  // unit_type
  const weight = await prisma.catalogItem.create({
    data: { catalogType: 'unit_type', name: 'Peso', slug: 'weight', level: 0, isSystem: true, sortOrder: 1, isActive: true }
  })

  await prisma.catalogItem.createMany({
    data: [
      { catalogType: 'unit_type', name: 'Gramos (g)', slug: 'grams', parentId: weight.id, level: 1, isSystem: true, sortOrder: 1, isActive: true },
      { catalogType: 'unit_type', name: 'Onzas (oz)', slug: 'ounces', parentId: weight.id, level: 1, isSystem: true, sortOrder: 2, isActive: true },
      { catalogType: 'unit_type', name: 'Volumen', slug: 'volume', level: 0, isSystem: true, sortOrder: 2, isActive: true },
      { catalogType: 'unit_type', name: 'Piezas', slug: 'pieces', level: 0, isSystem: true, sortOrder: 3, isActive: true }
    ]
  })

  // nutrition_goal_type
  await prisma.catalogItem.createMany({
    data: [
      { catalogType: 'nutrition_goal_type', name: 'Pérdida de Peso', slug: 'weight-loss', level: 0, isSystem: true, sortOrder: 1, isActive: true },
      { catalogType: 'nutrition_goal_type', name: 'Ganancia Muscular', slug: 'muscle-gain', level: 0, isSystem: true, sortOrder: 2, isActive: true },
      { catalogType: 'nutrition_goal_type', name: 'Mantenimiento', slug: 'maintenance', level: 0, isSystem: true, sortOrder: 3, isActive: true },
      { catalogType: 'nutrition_goal_type', name: 'Rendimiento', slug: 'performance', level: 0, isSystem: true, sortOrder: 4, isActive: true }
    ]
  })

  console.log('✅ Nutrition catalog seeded')
}

seedNutritionCatalog()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
