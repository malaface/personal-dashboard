/**
 * Main Seed Orchestrator
 *
 * Ejecuta todos los seeds del proyecto en orden:
 * 1. Catalog Items (Finance, Gym, Nutrition, Family)
 * 2. Public Templates (Workouts, Meals)
 *
 * Este archivo puede ser ejecutado directamente o importado.
 */

import { PrismaClient } from '@prisma/client'
import { seedFinanceCatalogItems } from './catalog-items'
import { seedGymCatalogItems } from './catalog-items-gym'

const prisma = new PrismaClient()

// ==============================================
// Seed Functions for files without exports
// ==============================================

async function seedNutritionCatalog() {
  console.log('🌱 Seeding Nutrition catalog...')

  // meal_type
  await prisma.catalogItem.createMany({
    data: [
      { catalogType: 'meal_type', name: 'Breakfast', slug: 'breakfast', level: 0, isSystem: true, sortOrder: 1, isActive: true },
      { catalogType: 'meal_type', name: 'Lunch', slug: 'lunch', level: 0, isSystem: true, sortOrder: 2, isActive: true },
      { catalogType: 'meal_type', name: 'Dinner', slug: 'dinner', level: 0, isSystem: true, sortOrder: 3, isActive: true },
      { catalogType: 'meal_type', name: 'Snack', slug: 'snack', level: 0, isSystem: true, sortOrder: 4, isActive: true }
    ]
  })

  // unit_type
  await prisma.catalogItem.createMany({
    data: [
      { catalogType: 'unit_type', name: 'Grams', slug: 'grams', level: 0, isSystem: true, sortOrder: 1, isActive: true },
      { catalogType: 'unit_type', name: 'Milliliters', slug: 'milliliters', level: 0, isSystem: true, sortOrder: 2, isActive: true },
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

async function seedFamilyCatalog() {
  console.log('🌱 Seeding Family catalog...')

  // relationship_type
  await prisma.catalogItem.createMany({
    data: [
      { catalogType: 'relationship_type', name: 'Padre/Madre', slug: 'parent', level: 0, isSystem: true, sortOrder: 1, isActive: true },
      { catalogType: 'relationship_type', name: 'Hijo/Hija', slug: 'child', level: 0, isSystem: true, sortOrder: 2, isActive: true },
      { catalogType: 'relationship_type', name: 'Hermano/Hermana', slug: 'sibling', level: 0, isSystem: true, sortOrder: 3, isActive: true },
      { catalogType: 'relationship_type', name: 'Abuelo/Abuela', slug: 'grandparent', level: 0, isSystem: true, sortOrder: 4, isActive: true },
      { catalogType: 'relationship_type', name: 'Tío/Tía', slug: 'uncle-aunt', level: 0, isSystem: true, sortOrder: 5, isActive: true },
      { catalogType: 'relationship_type', name: 'Primo/Prima', slug: 'cousin', level: 0, isSystem: true, sortOrder: 6, isActive: true },
      { catalogType: 'relationship_type', name: 'Pareja', slug: 'partner', level: 0, isSystem: true, sortOrder: 7, isActive: true },
      { catalogType: 'relationship_type', name: 'Amigo/Amiga', slug: 'friend', level: 0, isSystem: true, sortOrder: 8, isActive: true },
      { catalogType: 'relationship_type', name: 'Otro', slug: 'other', level: 0, isSystem: true, sortOrder: 9, isActive: true }
    ]
  })

  // activity_type
  await prisma.catalogItem.createMany({
    data: [
      { catalogType: 'activity_type', name: 'Llamada', slug: 'phone-call', level: 0, isSystem: true, sortOrder: 1, isActive: true },
      { catalogType: 'activity_type', name: 'Visita', slug: 'visit', level: 0, isSystem: true, sortOrder: 2, isActive: true },
      { catalogType: 'activity_type', name: 'Video Llamada', slug: 'video-call', level: 0, isSystem: true, sortOrder: 3, isActive: true },
      { catalogType: 'activity_type', name: 'Mensaje', slug: 'message', level: 0, isSystem: true, sortOrder: 4, isActive: true },
      { catalogType: 'activity_type', name: 'Salida', slug: 'outing', level: 0, isSystem: true, sortOrder: 5, isActive: true },
      { catalogType: 'activity_type', name: 'Celebración', slug: 'celebration', level: 0, isSystem: true, sortOrder: 6, isActive: true },
      { catalogType: 'activity_type', name: 'Otro', slug: 'other', level: 0, isSystem: true, sortOrder: 7, isActive: true }
    ]
  })

  // social_circle
  await prisma.catalogItem.createMany({
    data: [
      { catalogType: 'social_circle', name: 'Familia Cercana', slug: 'familia-cercana', level: 0, isSystem: true, sortOrder: 1, isActive: true },
      { catalogType: 'social_circle', name: 'Familia Extendida', slug: 'familia-extendida', level: 0, isSystem: true, sortOrder: 2, isActive: true },
      { catalogType: 'social_circle', name: 'Amigos', slug: 'amigos', level: 0, isSystem: true, sortOrder: 3, isActive: true },
      { catalogType: 'social_circle', name: 'Trabajo', slug: 'trabajo', level: 0, isSystem: true, sortOrder: 4, isActive: true },
      { catalogType: 'social_circle', name: 'Networking', slug: 'networking', level: 0, isSystem: true, sortOrder: 5, isActive: true }
    ]
  })

  console.log('✅ Family catalog seeded')
}

async function seedPublicTemplates() {
  console.log('🌱 Seeding public templates...')

  // Por ahora, este es un placeholder
  // Las plantillas públicas se pueden agregar aquí en el futuro
  console.log('⏭️  Public templates seed skipped (no templates defined yet)')
}

// ==============================================
// Main Orchestrator
// ==============================================

async function main() {
  console.log('🚀 Starting seed orchestration...\n')

  try {
    // Verificar conexión a la base de datos
    await prisma.$connect()
    console.log('✅ Database connected\n')

    // 1. Seed Finance Catalog
    console.log('📦 Phase 1: Finance Catalog')
    await seedFinanceCatalogItems()
    console.log('')

    // 2. Seed Gym Catalog
    console.log('📦 Phase 2: Gym Catalog')
    await seedGymCatalogItems()
    console.log('')

    // 3. Seed Nutrition Catalog
    console.log('📦 Phase 3: Nutrition Catalog')
    await seedNutritionCatalog()
    console.log('')

    // 4. Seed Family Catalog
    console.log('📦 Phase 4: Family Catalog')
    await seedFamilyCatalog()
    console.log('')

    // 5. Seed Public Templates
    console.log('📦 Phase 5: Public Templates')
    await seedPublicTemplates()
    console.log('')

    // Summary
    const totalCatalogItems = await prisma.catalogItem.count()
    const totalTemplates = await prisma.workoutTemplate.count() + await prisma.mealTemplate.count()

    console.log('🎉 Seed orchestration completed successfully!\n')
    console.log('📊 Summary:')
    console.log(`   - Catalog Items: ${totalCatalogItems}`)
    console.log(`   - Templates: ${totalTemplates}`)
    console.log('')

  } catch (error) {
    console.error('❌ Seed orchestration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Execute if run directly
if (require.main === module) {
  main()
    .then(() => {
      console.log('✅ All seeds completed')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Seed failed:', error)
      process.exit(1)
    })
}

export { main as seedAll }
