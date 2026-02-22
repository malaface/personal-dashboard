#!/usr/bin/env node
/**
 * Seed Runner for Docker Environment
 *
 * Este script:
 * 1. Verifica si la DB está vacía (sin catalog items)
 * 2. Ejecuta los seeds automáticamente si es necesario
 * 3. Maneja errores de duplicados gracefully
 *
 * Diseñado para ejecutarse en el entrypoint de Docker.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

// ==============================================
// Check if database needs seeding
// ==============================================

async function needsSeeding() {
  try {
    const catalogCount = await prisma.catalogItem.count()
    return catalogCount === 0
  } catch (error) {
    console.error('❌ Error checking if database needs seeding:', error.message)
    return false
  }
}

// ==============================================
// Seed Functions
// ==============================================

async function seedFinanceCatalog() {
  console.log('🌱 Seeding Finance catalog...')

  // transaction_type
  await prisma.catalogItem.createMany({
    data: [
      { catalogType: 'transaction_type', name: 'Income', slug: 'income', level: 0, isSystem: true, sortOrder: 1, isActive: true },
      { catalogType: 'transaction_type', name: 'Expense', slug: 'expense', level: 0, isSystem: true, sortOrder: 2, isActive: true }
    ],
    skipDuplicates: true
  })

  // transaction_category (Incomes - Level 0)
  const incomes = await prisma.catalogItem.findFirst({ where: { slug: 'income' } })
  const expenses = await prisma.catalogItem.findFirst({ where: { slug: 'expense' } })

  await prisma.catalogItem.createMany({
    data: [
      // Incomes
      { catalogType: 'transaction_category', name: 'Salary', slug: 'salary', parentId: incomes?.id, level: 1, isSystem: true, icon: '💼', sortOrder: 1, isActive: true },
      { catalogType: 'transaction_category', name: 'Freelance', slug: 'freelance', parentId: incomes?.id, level: 1, isSystem: true, icon: '💻', sortOrder: 2, isActive: true },
      { catalogType: 'transaction_category', name: 'Investments', slug: 'investment-income', parentId: incomes?.id, level: 1, isSystem: true, icon: '📈', sortOrder: 3, isActive: true },
      { catalogType: 'transaction_category', name: 'Other Income', slug: 'other-income', parentId: incomes?.id, level: 1, isSystem: true, icon: '💰', sortOrder: 4, isActive: true },

      // Expenses
      { catalogType: 'transaction_category', name: 'Housing', slug: 'housing', parentId: expenses?.id, level: 1, isSystem: true, icon: '🏠', sortOrder: 1, isActive: true },
      { catalogType: 'transaction_category', name: 'Food & Dining', slug: 'food-dining', parentId: expenses?.id, level: 1, isSystem: true, icon: '🍔', sortOrder: 2, isActive: true },
      { catalogType: 'transaction_category', name: 'Transportation', slug: 'transportation', parentId: expenses?.id, level: 1, isSystem: true, icon: '🚗', sortOrder: 3, isActive: true },
      { catalogType: 'transaction_category', name: 'Healthcare', slug: 'healthcare', parentId: expenses?.id, level: 1, isSystem: true, icon: '🏥', sortOrder: 4, isActive: true },
      { catalogType: 'transaction_category', name: 'Entertainment', slug: 'entertainment', parentId: expenses?.id, level: 1, isSystem: true, icon: '🎮', sortOrder: 5, isActive: true },
      { catalogType: 'transaction_category', name: 'Shopping', slug: 'shopping', parentId: expenses?.id, level: 1, isSystem: true, icon: '🛍️', sortOrder: 6, isActive: true },
      { catalogType: 'transaction_category', name: 'Utilities', slug: 'utilities', parentId: expenses?.id, level: 1, isSystem: true, icon: '💡', sortOrder: 7, isActive: true },
      { catalogType: 'transaction_category', name: 'Other Expenses', slug: 'other-expenses', parentId: expenses?.id, level: 1, isSystem: true, icon: '📦', sortOrder: 8, isActive: true }
    ],
    skipDuplicates: true
  })

  // investment_type
  await prisma.catalogItem.createMany({
    data: [
      { catalogType: 'investment_type', name: 'Stocks', slug: 'stocks', level: 0, isSystem: true, icon: '📊', sortOrder: 1, isActive: true },
      { catalogType: 'investment_type', name: 'Bonds', slug: 'bonds', level: 0, isSystem: true, icon: '📜', sortOrder: 2, isActive: true },
      { catalogType: 'investment_type', name: 'Crypto', slug: 'crypto', level: 0, isSystem: true, icon: '₿', sortOrder: 3, isActive: true },
      { catalogType: 'investment_type', name: 'Real Estate', slug: 'real-estate', level: 0, isSystem: true, icon: '🏢', sortOrder: 4, isActive: true },
      { catalogType: 'investment_type', name: 'Mutual Funds', slug: 'mutual-funds', level: 0, isSystem: true, icon: '🏦', sortOrder: 5, isActive: true }
    ],
    skipDuplicates: true
  })

  console.log('✅ Finance catalog seeded')
}

async function seedGymCatalog() {
  console.log('🌱 Seeding Gym catalog...')

  // exercise_type
  await prisma.catalogItem.createMany({
    data: [
      { catalogType: 'exercise_type', name: 'Bench Press', slug: 'bench-press', level: 0, isSystem: true, icon: '💪', sortOrder: 1, isActive: true },
      { catalogType: 'exercise_type', name: 'Squat', slug: 'squat', level: 0, isSystem: true, icon: '🦵', sortOrder: 2, isActive: true },
      { catalogType: 'exercise_type', name: 'Deadlift', slug: 'deadlift', level: 0, isSystem: true, icon: '🏋️', sortOrder: 3, isActive: true },
      { catalogType: 'exercise_type', name: 'Pull Up', slug: 'pull-up', level: 0, isSystem: true, icon: '⬆️', sortOrder: 4, isActive: true },
      { catalogType: 'exercise_type', name: 'Shoulder Press', slug: 'shoulder-press', level: 0, isSystem: true, icon: '🤸', sortOrder: 5, isActive: true },
      { catalogType: 'exercise_type', name: 'Bicep Curl', slug: 'bicep-curl', level: 0, isSystem: true, icon: '💪', sortOrder: 6, isActive: true },
      { catalogType: 'exercise_type', name: 'Tricep Extension', slug: 'tricep-extension', level: 0, isSystem: true, icon: '💪', sortOrder: 7, isActive: true },
      { catalogType: 'exercise_type', name: 'Leg Press', slug: 'leg-press', level: 0, isSystem: true, icon: '🦿', sortOrder: 8, isActive: true }
    ],
    skipDuplicates: true
  })

  // muscle_group
  await prisma.catalogItem.createMany({
    data: [
      { catalogType: 'muscle_group', name: 'Chest', slug: 'chest', level: 0, isSystem: true, icon: '💪', sortOrder: 1, isActive: true },
      { catalogType: 'muscle_group', name: 'Back', slug: 'back', level: 0, isSystem: true, icon: '🔙', sortOrder: 2, isActive: true },
      { catalogType: 'muscle_group', name: 'Shoulders', slug: 'shoulders', level: 0, isSystem: true, icon: '🤷', sortOrder: 3, isActive: true },
      { catalogType: 'muscle_group', name: 'Arms', slug: 'arms', level: 0, isSystem: true, icon: '💪', sortOrder: 4, isActive: true },
      { catalogType: 'muscle_group', name: 'Legs', slug: 'legs', level: 0, isSystem: true, icon: '🦵', sortOrder: 5, isActive: true },
      { catalogType: 'muscle_group', name: 'Core', slug: 'core', level: 0, isSystem: true, icon: '🎯', sortOrder: 6, isActive: true }
    ],
    skipDuplicates: true
  })

  // equipment
  await prisma.catalogItem.createMany({
    data: [
      { catalogType: 'equipment', name: 'Barbell', slug: 'barbell', level: 0, isSystem: true, icon: '🏋️', sortOrder: 1, isActive: true },
      { catalogType: 'equipment', name: 'Dumbbell', slug: 'dumbbell', level: 0, isSystem: true, icon: '🏋️‍♀️', sortOrder: 2, isActive: true },
      { catalogType: 'equipment', name: 'Machine', slug: 'machine', level: 0, isSystem: true, icon: '⚙️', sortOrder: 3, isActive: true },
      { catalogType: 'equipment', name: 'Bodyweight', slug: 'bodyweight', level: 0, isSystem: true, icon: '🧘', sortOrder: 4, isActive: true },
      { catalogType: 'equipment', name: 'Cable', slug: 'cable', level: 0, isSystem: true, icon: '🔗', sortOrder: 5, isActive: true },
      { catalogType: 'equipment', name: 'Resistance Band', slug: 'resistance-band', level: 0, isSystem: true, icon: '🎗️', sortOrder: 6, isActive: true }
    ],
    skipDuplicates: true
  })

  console.log('✅ Gym catalog seeded')
}

async function seedNutritionCatalog() {
  console.log('🌱 Seeding Nutrition catalog...')

  // meal_type
  await prisma.catalogItem.createMany({
    data: [
      { catalogType: 'meal_type', name: 'Breakfast', slug: 'breakfast', level: 0, isSystem: true, sortOrder: 1, isActive: true },
      { catalogType: 'meal_type', name: 'Lunch', slug: 'lunch', level: 0, isSystem: true, sortOrder: 2, isActive: true },
      { catalogType: 'meal_type', name: 'Dinner', slug: 'dinner', level: 0, isSystem: true, sortOrder: 3, isActive: true },
      { catalogType: 'meal_type', name: 'Snack', slug: 'snack', level: 0, isSystem: true, sortOrder: 4, isActive: true }
    ],
    skipDuplicates: true
  })

  // unit_type
  await prisma.catalogItem.createMany({
    data: [
      { catalogType: 'unit_type', name: 'Grams', slug: 'grams', level: 0, isSystem: true, sortOrder: 1, isActive: true },
      { catalogType: 'unit_type', name: 'Milliliters', slug: 'milliliters', level: 0, isSystem: true, sortOrder: 2, isActive: true },
      { catalogType: 'unit_type', name: 'Pieces', slug: 'pieces', level: 0, isSystem: true, sortOrder: 3, isActive: true }
    ],
    skipDuplicates: true
  })

  // nutrition_goal_type
  await prisma.catalogItem.createMany({
    data: [
      { catalogType: 'nutrition_goal_type', name: 'Weight Loss', slug: 'weight-loss', level: 0, isSystem: true, sortOrder: 1, isActive: true },
      { catalogType: 'nutrition_goal_type', name: 'Muscle Gain', slug: 'muscle-gain', level: 0, isSystem: true, sortOrder: 2, isActive: true },
      { catalogType: 'nutrition_goal_type', name: 'Maintenance', slug: 'maintenance', level: 0, isSystem: true, sortOrder: 3, isActive: true },
      { catalogType: 'nutrition_goal_type', name: 'Performance', slug: 'performance', level: 0, isSystem: true, sortOrder: 4, isActive: true }
    ],
    skipDuplicates: true
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
    ],
    skipDuplicates: true
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
    ],
    skipDuplicates: true
  })

  // event_category
  await prisma.catalogItem.createMany({
    data: [
      { catalogType: 'event_category', name: 'Cumpleaños', slug: 'birthday', level: 0, isSystem: true, icon: '🎂', sortOrder: 1, isActive: true },
      { catalogType: 'event_category', name: 'Aniversario', slug: 'anniversary', level: 0, isSystem: true, icon: '💍', sortOrder: 2, isActive: true },
      { catalogType: 'event_category', name: 'Graduación', slug: 'graduation', level: 0, isSystem: true, icon: '🎓', sortOrder: 3, isActive: true },
      { catalogType: 'event_category', name: 'Festivo', slug: 'holiday', level: 0, isSystem: true, icon: '🎉', sortOrder: 4, isActive: true },
      { catalogType: 'event_category', name: 'Otro', slug: 'other', level: 0, isSystem: true, icon: '📅', sortOrder: 5, isActive: true }
    ],
    skipDuplicates: true
  })

  // reminder_category
  await prisma.catalogItem.createMany({
    data: [
      { catalogType: 'reminder_category', name: 'Personal', slug: 'personal', level: 0, isSystem: true, icon: '👤', sortOrder: 1, isActive: true },
      { catalogType: 'reminder_category', name: 'Trabajo', slug: 'work', level: 0, isSystem: true, icon: '💼', sortOrder: 2, isActive: true },
      { catalogType: 'reminder_category', name: 'Familia', slug: 'family', level: 0, isSystem: true, icon: '👨‍👩‍👧‍👦', sortOrder: 3, isActive: true },
      { catalogType: 'reminder_category', name: 'Salud', slug: 'health', level: 0, isSystem: true, icon: '🏥', sortOrder: 4, isActive: true },
      { catalogType: 'reminder_category', name: 'Otro', slug: 'other', level: 0, isSystem: true, icon: '📌', sortOrder: 5, isActive: true }
    ],
    skipDuplicates: true
  })

  console.log('✅ Family catalog seeded')
}

// ==============================================
// Main Seed Orchestrator
// ==============================================

async function runSeeds() {
  console.log('🚀 Checking if database needs seeding...\n')

  try {
    // Connect to database
    await prisma.$connect()
    console.log('✅ Database connected')

    // Check if seeding is needed
    const shouldSeed = await needsSeeding()

    if (!shouldSeed) {
      console.log('ℹ️  Database already has data, skipping seeds')
      console.log('   (To force re-seed, delete all catalog_items first)\n')
      return
    }

    console.log('🌱 Database is empty, starting seed process...\n')

    // Run all seeds
    await seedFinanceCatalog()
    await seedGymCatalog()
    await seedNutritionCatalog()
    await seedFamilyCatalog()

    // Summary
    const totalCatalogItems = await prisma.catalogItem.count()
    console.log('\n🎉 Seed process completed successfully!')
    console.log(`📊 Total catalog items created: ${totalCatalogItems}\n`)

  } catch (error) {
    console.error('❌ Seed process failed:', error.message)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Execute
runSeeds()
  .then(() => {
    console.log('✅ Seed script finished')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Seed script failed:', error)
    process.exit(1)
  })
