import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedPublicTemplates() {
  console.log('🌱 Seeding public templates...')

  // ============================================
  // WORKOUT TEMPLATES
  // ============================================

  // Get catalog items for workouts
  const benchPress = await prisma.catalogItem.findFirst({
    where: { catalogType: 'exercise_category', slug: 'bench-press' }
  })
  const squat = await prisma.catalogItem.findFirst({
    where: { catalogType: 'exercise_category', slug: 'squat' }
  })
  const deadlift = await prisma.catalogItem.findFirst({
    where: { catalogType: 'exercise_category', slug: 'deadlift' }
  })
  const pullUp = await prisma.catalogItem.findFirst({
    where: { catalogType: 'exercise_category', slug: 'pull-up' }
  })
  const shoulderPress = await prisma.catalogItem.findFirst({
    where: { catalogType: 'exercise_category', slug: 'shoulder-press' }
  })

  const chest = await prisma.catalogItem.findFirst({
    where: { catalogType: 'muscle_group', slug: 'chest' }
  })
  const legs = await prisma.catalogItem.findFirst({
    where: { catalogType: 'muscle_group', slug: 'legs' }
  })
  const back = await prisma.catalogItem.findFirst({
    where: { catalogType: 'muscle_group', slug: 'back' }
  })
  const shoulders = await prisma.catalogItem.findFirst({
    where: { catalogType: 'muscle_group', slug: 'shoulders' }
  })

  const barbell = await prisma.catalogItem.findFirst({
    where: { catalogType: 'equipment_type', slug: 'barbell' }
  })
  const bodyweight = await prisma.catalogItem.findFirst({
    where: { catalogType: 'equipment_type', slug: 'bodyweight' }
  })

  // Template 1: Full Body Beginner
  const _fullBodyBeginner = await prisma.workoutTemplate.create({
    data: {
      userId: null,
      name: 'Full Body - Principiante',
      description: 'Rutina completa para principiantes que trabaja todos los grupos musculares principales',
      isPublic: true,
      difficulty: 'BEGINNER',
      tags: ['cuerpo-completo', 'principiante', 'fuerza'],
      exercises: {
        create: [
          {
            exerciseTypeId: squat?.id,
            muscleGroupId: legs?.id,
            equipmentId: barbell?.id,
            sets: 3,
            reps: 10,
            sortOrder: 0
          },
          {
            exerciseTypeId: benchPress?.id,
            muscleGroupId: chest?.id,
            equipmentId: barbell?.id,
            sets: 3,
            reps: 10,
            sortOrder: 1
          },
          {
            exerciseTypeId: pullUp?.id,
            muscleGroupId: back?.id,
            equipmentId: bodyweight?.id,
            sets: 3,
            reps: 8,
            sortOrder: 2
          }
        ]
      }
    }
  })

  // Template 2: Upper Body Intermediate
  const _upperBodyIntermediate = await prisma.workoutTemplate.create({
    data: {
      userId: null,
      name: 'Upper Body - Intermedio',
      description: 'Rutina enfocada en tren superior con mayor volumen e intensidad',
      isPublic: true,
      difficulty: 'INTERMEDIATE',
      tags: ['tren-superior', 'intermedio', 'hipertrofia'],
      exercises: {
        create: [
          {
            exerciseTypeId: benchPress?.id,
            muscleGroupId: chest?.id,
            equipmentId: barbell?.id,
            sets: 4,
            reps: 8,
            sortOrder: 0
          },
          {
            exerciseTypeId: shoulderPress?.id,
            muscleGroupId: shoulders?.id,
            equipmentId: barbell?.id,
            sets: 4,
            reps: 10,
            sortOrder: 1
          },
          {
            exerciseTypeId: pullUp?.id,
            muscleGroupId: back?.id,
            equipmentId: bodyweight?.id,
            sets: 4,
            reps: 10,
            sortOrder: 2
          }
        ]
      }
    }
  })

  // Template 3: Strength Focus Advanced
  const _strengthAdvanced = await prisma.workoutTemplate.create({
    data: {
      userId: null,
      name: 'Strength - Avanzado',
      description: 'Rutina de fuerza con los 3 grandes: sentadilla, press banca y peso muerto',
      isPublic: true,
      difficulty: 'ADVANCED',
      tags: ['fuerza', 'avanzado', 'powerlifting'],
      exercises: {
        create: [
          {
            exerciseTypeId: squat?.id,
            muscleGroupId: legs?.id,
            equipmentId: barbell?.id,
            sets: 5,
            reps: 5,
            sortOrder: 0
          },
          {
            exerciseTypeId: benchPress?.id,
            muscleGroupId: chest?.id,
            equipmentId: barbell?.id,
            sets: 5,
            reps: 5,
            sortOrder: 1
          },
          {
            exerciseTypeId: deadlift?.id,
            muscleGroupId: back?.id,
            equipmentId: barbell?.id,
            sets: 5,
            reps: 5,
            sortOrder: 2
          }
        ]
      }
    }
  })

  console.log(`✅ Created ${3} workout templates`)

  // ============================================
  // MEAL TEMPLATES
  // ============================================

  // Template 1: High Protein Breakfast
  const _highProteinBreakfast = await prisma.mealTemplate.create({
    data: {
      userId: null,
      name: 'Desayuno Alto en Proteína',
      description: 'Desayuno balanceado con alto contenido proteico para iniciar el día',
      mealType: 'BREAKFAST',
      isPublic: true,
      tags: ['alto-proteina', 'desayuno', 'ganancia-muscular'],
      totalCalories: 520,
      totalProtein: 45,
      totalCarbs: 35,
      totalFats: 20,
      foodItems: {
        create: [
          {
            name: 'Huevos enteros',
            quantity: 3,
            unit: 'unidades',
            calories: 210,
            protein: 18,
            carbs: 1,
            fats: 15,
            sortOrder: 0
          },
          {
            name: 'Avena',
            quantity: 50,
            unit: 'g',
            calories: 190,
            protein: 7,
            carbs: 32,
            fats: 3,
            sortOrder: 1
          },
          {
            name: 'Plátano',
            quantity: 1,
            unit: 'unidad',
            calories: 105,
            protein: 1.3,
            carbs: 27,
            fats: 0.4,
            sortOrder: 2
          },
          {
            name: 'Almendras',
            quantity: 15,
            unit: 'g',
            calories: 90,
            protein: 3.2,
            carbs: 3,
            fats: 7.7,
            sortOrder: 3
          }
        ]
      }
    }
  })

  // Template 2: Post-Workout Lunch
  const _postWorkoutLunch = await prisma.mealTemplate.create({
    data: {
      userId: null,
      name: 'Almuerzo Post-Entrenamiento',
      description: 'Comida completa para recuperación muscular después del entrenamiento',
      mealType: 'LUNCH',
      isPublic: true,
      tags: ['post-entreno', 'almuerzo', 'recuperacion'],
      totalCalories: 650,
      totalProtein: 50,
      totalCarbs: 65,
      totalFats: 15,
      foodItems: {
        create: [
          {
            name: 'Pechuga de pollo',
            quantity: 200,
            unit: 'g',
            calories: 330,
            protein: 62,
            carbs: 0,
            fats: 7.2,
            sortOrder: 0
          },
          {
            name: 'Arroz blanco cocido',
            quantity: 150,
            unit: 'g',
            calories: 195,
            protein: 4,
            carbs: 43,
            fats: 0.3,
            sortOrder: 1
          },
          {
            name: 'Brócoli cocido',
            quantity: 100,
            unit: 'g',
            calories: 35,
            protein: 2.4,
            carbs: 7,
            fats: 0.4,
            sortOrder: 2
          },
          {
            name: 'Aguacate',
            quantity: 50,
            unit: 'g',
            calories: 80,
            protein: 1,
            carbs: 4.3,
            fats: 7.3,
            sortOrder: 3
          }
        ]
      }
    }
  })

  // Template 3: Light Dinner
  const _lightDinner = await prisma.mealTemplate.create({
    data: {
      userId: null,
      name: 'Cena Ligera',
      description: 'Cena balanceada y ligera para terminar el día',
      mealType: 'DINNER',
      isPublic: true,
      tags: ['ligera', 'cena', 'balanceada'],
      totalCalories: 420,
      totalProtein: 35,
      totalCarbs: 30,
      totalFats: 18,
      foodItems: {
        create: [
          {
            name: 'Salmón a la plancha',
            quantity: 150,
            unit: 'g',
            calories: 280,
            protein: 31.5,
            carbs: 0,
            fats: 16.5,
            sortOrder: 0
          },
          {
            name: 'Ensalada mixta',
            quantity: 150,
            unit: 'g',
            calories: 40,
            protein: 2,
            carbs: 8,
            fats: 0.3,
            sortOrder: 1
          },
          {
            name: 'Batata cocida',
            quantity: 100,
            unit: 'g',
            calories: 90,
            protein: 2,
            carbs: 21,
            fats: 0.2,
            sortOrder: 2
          }
        ]
      }
    }
  })

  console.log(`✅ Created ${3} meal templates`)

  console.log('\n✅ Public templates seeding completed!')
  console.log(`📊 Summary:`)
  console.log(`   - Workout templates: 3 (BEGINNER, INTERMEDIATE, ADVANCED)`)
  console.log(`   - Meal templates: 3 (BREAKFAST, LUNCH, DINNER)`)
}

seedPublicTemplates()
  .catch((error) => {
    console.error('❌ Error seeding public templates:', error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
