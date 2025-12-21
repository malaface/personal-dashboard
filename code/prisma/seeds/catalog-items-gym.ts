import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Seed system catalog items for Gym Training module
 *
 * Structure:
 * - Exercise Categories (3 levels):
 *   - Strength Training → Muscle Groups → Specific Exercises
 *   - Cardio → Types
 *   - Flexibility → Types
 *   - Sports → Specific Sports
 *
 * - Equipment Types (2 levels):
 *   - Free Weights → Specific Types
 *   - Machines → Specific Machines
 *   - Bodyweight → Types
 *   - Cardio Equipment → Specific Machines
 *
 * - Muscle Groups (3 levels):
 *   - Upper Body → Specific Muscles
 *   - Lower Body → Specific Muscles
 *   - Core → Specific Muscles
 */

interface CatalogSeed {
  name: string
  slug: string
  icon?: string
  color?: string
  sortOrder?: number
  description?: string
  children?: CatalogSeed[]
}

const exerciseCategoriesStructure: CatalogSeed[] = [
  {
    name: "Strength Training",
    slug: "strength-training",
    icon: "💪",
    color: "#EF4444",
    sortOrder: 1,
    description: "Resistance and weight training exercises",
    children: [
      {
        name: "Chest",
        slug: "chest",
        icon: "🏋️",
        sortOrder: 1,
        description: "Pectoral muscle exercises",
        children: [
          { name: "Bench Press", slug: "bench-press", description: "Barbell bench press", sortOrder: 1 },
          { name: "Dumbbell Flyes", slug: "dumbbell-flyes", description: "Chest flyes with dumbbells", sortOrder: 2 },
          { name: "Push-ups", slug: "push-ups", description: "Bodyweight push-ups", sortOrder: 3 },
          { name: "Incline Press", slug: "incline-press", description: "Incline bench press", sortOrder: 4 },
          { name: "Cable Crossover", slug: "cable-crossover", description: "Cable chest crossover", sortOrder: 5 }
        ]
      },
      {
        name: "Back",
        slug: "back",
        icon: "🦵",
        sortOrder: 2,
        description: "Back muscle exercises",
        children: [
          { name: "Deadlift", slug: "deadlift", description: "Conventional deadlift", sortOrder: 1 },
          { name: "Pull-ups", slug: "pull-ups", description: "Bodyweight pull-ups", sortOrder: 2 },
          { name: "Barbell Rows", slug: "barbell-rows", description: "Bent-over barbell rows", sortOrder: 3 },
          { name: "Lat Pulldown", slug: "lat-pulldown", description: "Cable lat pulldown", sortOrder: 4 },
          { name: "T-Bar Row", slug: "t-bar-row", description: "T-bar row exercise", sortOrder: 5 }
        ]
      },
      {
        name: "Legs",
        slug: "legs",
        icon: "🦿",
        sortOrder: 3,
        description: "Lower body exercises",
        children: [
          { name: "Squat", slug: "squat", description: "Back squat", sortOrder: 1 },
          { name: "Leg Press", slug: "leg-press", description: "Machine leg press", sortOrder: 2 },
          { name: "Lunges", slug: "lunges", description: "Walking or stationary lunges", sortOrder: 3 },
          { name: "Leg Curls", slug: "leg-curls", description: "Hamstring curls", sortOrder: 4 },
          { name: "Calf Raises", slug: "calf-raises", description: "Standing calf raises", sortOrder: 5 }
        ]
      },
      {
        name: "Shoulders",
        slug: "shoulders",
        icon: "💪",
        sortOrder: 4,
        description: "Shoulder exercises",
        children: [
          { name: "Overhead Press", slug: "overhead-press", description: "Military press", sortOrder: 1 },
          { name: "Lateral Raises", slug: "lateral-raises", description: "Dumbbell lateral raises", sortOrder: 2 },
          { name: "Front Raises", slug: "front-raises", description: "Front dumbbell raises", sortOrder: 3 },
          { name: "Shrugs", slug: "shrugs", description: "Barbell or dumbbell shrugs", sortOrder: 4 }
        ]
      },
      {
        name: "Arms",
        slug: "arms",
        icon: "💪",
        sortOrder: 5,
        description: "Arm exercises",
        children: [
          { name: "Biceps Curls", slug: "biceps-curls", description: "Barbell or dumbbell curls", sortOrder: 1 },
          { name: "Hammer Curls", slug: "hammer-curls", description: "Neutral grip curls", sortOrder: 2 },
          { name: "Tricep Dips", slug: "tricep-dips", description: "Bodyweight or weighted dips", sortOrder: 3 },
          { name: "Overhead Extension", slug: "overhead-extension", description: "Tricep overhead extension", sortOrder: 4 },
          { name: "Skull Crushers", slug: "skull-crushers", description: "Lying tricep extension", sortOrder: 5 }
        ]
      },
      {
        name: "Core",
        slug: "core-exercises",
        icon: "🎯",
        sortOrder: 6,
        description: "Core strengthening exercises",
        children: [
          { name: "Planks", slug: "planks", description: "Front plank holds", sortOrder: 1 },
          { name: "Crunches", slug: "crunches", description: "Abdominal crunches", sortOrder: 2 },
          { name: "Russian Twists", slug: "russian-twists", description: "Oblique twists", sortOrder: 3 },
          { name: "Leg Raises", slug: "leg-raises", description: "Hanging leg raises", sortOrder: 4 }
        ]
      }
    ]
  },
  {
    name: "Cardio",
    slug: "cardio",
    icon: "🏃",
    color: "#10B981",
    sortOrder: 2,
    description: "Cardiovascular exercises",
    children: [
      { name: "Running", slug: "running", icon: "🏃‍♂️", description: "Outdoor or treadmill running", sortOrder: 1 },
      { name: "Cycling", slug: "cycling", icon: "🚴", description: "Outdoor or stationary cycling", sortOrder: 2 },
      { name: "Swimming", slug: "swimming", icon: "🏊", description: "Pool swimming", sortOrder: 3 },
      { name: "Rowing", slug: "rowing", icon: "🚣", description: "Rowing machine", sortOrder: 4 },
      { name: "Jump Rope", slug: "jump-rope", description: "Jump rope cardio", sortOrder: 5 },
      { name: "HIIT", slug: "hiit", description: "High-intensity interval training", sortOrder: 6 }
    ]
  },
  {
    name: "Flexibility",
    slug: "flexibility",
    icon: "🧘",
    color: "#8B5CF6",
    sortOrder: 3,
    description: "Stretching and mobility exercises",
    children: [
      { name: "Yoga", slug: "yoga", description: "Yoga practice", sortOrder: 1 },
      { name: "Dynamic Stretching", slug: "dynamic-stretching", description: "Movement-based stretches", sortOrder: 2 },
      { name: "Static Stretching", slug: "static-stretching", description: "Hold stretches", sortOrder: 3 },
      { name: "Foam Rolling", slug: "foam-rolling", description: "Myofascial release", sortOrder: 4 },
      { name: "Pilates", slug: "pilates", description: "Pilates exercises", sortOrder: 5 }
    ]
  },
  {
    name: "Sports",
    slug: "sports",
    icon: "⚽",
    color: "#F59E0B",
    sortOrder: 4,
    description: "Sports activities",
    children: [
      { name: "Basketball", slug: "basketball", icon: "🏀", description: "Basketball training", sortOrder: 1 },
      { name: "Soccer", slug: "soccer", icon: "⚽", description: "Soccer practice", sortOrder: 2 },
      { name: "Tennis", slug: "tennis", icon: "🎾", description: "Tennis training", sortOrder: 3 },
      { name: "Martial Arts", slug: "martial-arts", icon: "🥋", description: "Martial arts practice", sortOrder: 4 },
      { name: "Boxing", slug: "boxing", icon: "🥊", description: "Boxing training", sortOrder: 5 }
    ]
  }
]

const equipmentTypesStructure: CatalogSeed[] = [
  {
    name: "Free Weights",
    slug: "free-weights",
    icon: "🏋️",
    color: "#EF4444",
    sortOrder: 1,
    description: "Free weight equipment",
    children: [
      { name: "Barbell", slug: "barbell", description: "Standard barbell", sortOrder: 1 },
      { name: "Dumbbell", slug: "dumbbell", description: "Dumbbells", sortOrder: 2 },
      { name: "Kettlebell", slug: "kettlebell", description: "Kettlebell weights", sortOrder: 3 },
      { name: "EZ Bar", slug: "ez-bar", description: "EZ curl bar", sortOrder: 4 },
      { name: "Weight Plates", slug: "weight-plates", description: "Weight plates", sortOrder: 5 }
    ]
  },
  {
    name: "Machines",
    slug: "machines",
    icon: "⚙️",
    color: "#3B82F6",
    sortOrder: 2,
    description: "Gym machines",
    children: [
      { name: "Cable Machine", slug: "cable-machine", description: "Cable pulley system", sortOrder: 1 },
      { name: "Smith Machine", slug: "smith-machine", description: "Smith machine rack", sortOrder: 2 },
      { name: "Leg Press Machine", slug: "leg-press-machine", description: "Leg press", sortOrder: 3 },
      { name: "Lat Pulldown Machine", slug: "lat-pulldown-machine", description: "Lat pulldown", sortOrder: 4 },
      { name: "Chest Press Machine", slug: "chest-press-machine", description: "Machine chest press", sortOrder: 5 }
    ]
  },
  {
    name: "Bodyweight",
    slug: "bodyweight",
    icon: "🤸",
    color: "#10B981",
    sortOrder: 3,
    description: "Bodyweight training",
    children: [
      { name: "No Equipment", slug: "no-equipment", description: "Pure bodyweight", sortOrder: 1 },
      { name: "Pull-up Bar", slug: "pull-up-bar", description: "Pull-up bar", sortOrder: 2 },
      { name: "Dip Station", slug: "dip-station", description: "Dip bars", sortOrder: 3 },
      { name: "Rings", slug: "rings", description: "Gymnastic rings", sortOrder: 4 }
    ]
  },
  {
    name: "Cardio Equipment",
    slug: "cardio-equipment",
    icon: "🏃",
    color: "#F59E0B",
    sortOrder: 4,
    description: "Cardio machines",
    children: [
      { name: "Treadmill", slug: "treadmill", description: "Running treadmill", sortOrder: 1 },
      { name: "Stationary Bike", slug: "stationary-bike", description: "Exercise bike", sortOrder: 2 },
      { name: "Rowing Machine", slug: "rowing-machine", description: "Indoor rower", sortOrder: 3 },
      { name: "Elliptical", slug: "elliptical", description: "Elliptical trainer", sortOrder: 4 },
      { name: "Stair Climber", slug: "stair-climber", description: "Stair climbing machine", sortOrder: 5 }
    ]
  }
]

const muscleGroupsStructure: CatalogSeed[] = [
  {
    name: "Upper Body",
    slug: "upper-body",
    icon: "💪",
    color: "#EF4444",
    sortOrder: 1,
    description: "Upper body muscles",
    children: [
      {
        name: "Chest",
        slug: "chest-muscle",
        sortOrder: 1,
        description: "Pectoral muscles"
      },
      {
        name: "Back",
        slug: "back-muscle",
        sortOrder: 2,
        description: "Back muscles"
      },
      {
        name: "Shoulders",
        slug: "shoulders-muscle",
        sortOrder: 3,
        description: "Deltoid muscles"
      },
      {
        name: "Arms",
        slug: "arms-muscle",
        sortOrder: 4,
        description: "Arm muscles",
        children: [
          { name: "Biceps", slug: "biceps-muscle", description: "Bicep muscles", sortOrder: 1 },
          { name: "Triceps", slug: "triceps-muscle", description: "Tricep muscles", sortOrder: 2 },
          { name: "Forearms", slug: "forearms-muscle", description: "Forearm muscles", sortOrder: 3 }
        ]
      }
    ]
  },
  {
    name: "Lower Body",
    slug: "lower-body",
    icon: "🦵",
    color: "#3B82F6",
    sortOrder: 2,
    description: "Lower body muscles",
    children: [
      { name: "Quadriceps", slug: "quads", description: "Front thigh muscles", sortOrder: 1 },
      { name: "Hamstrings", slug: "hamstrings", description: "Back thigh muscles", sortOrder: 2 },
      { name: "Glutes", slug: "glutes", description: "Gluteal muscles", sortOrder: 3 },
      { name: "Calves", slug: "calves", description: "Calf muscles", sortOrder: 4 },
      { name: "Hip Flexors", slug: "hip-flexors", description: "Hip flexor muscles", sortOrder: 5 }
    ]
  },
  {
    name: "Core",
    slug: "core",
    icon: "🎯",
    color: "#10B981",
    sortOrder: 3,
    description: "Core muscles",
    children: [
      { name: "Abs", slug: "abs", description: "Abdominal muscles", sortOrder: 1 },
      { name: "Obliques", slug: "obliques", description: "Side abdominal muscles", sortOrder: 2 },
      { name: "Lower Back", slug: "lower-back", description: "Lower back muscles", sortOrder: 3 }
    ]
  }
]

async function seedCatalogItems(
  catalogType: string,
  structure: CatalogSeed[],
  parentId: string | null = null
): Promise<void> {
  for (const item of structure) {
    // Create the catalog item
    const created = await prisma.catalogItem.create({
      data: {
        catalogType,
        name: item.name,
        slug: item.slug,
        description: item.description,
        icon: item.icon,
        color: item.color,
        sortOrder: item.sortOrder || 0,
        parentId,
        isSystem: true,
        userId: null,
        isActive: true,
      }
    })

    console.log(`  ✓ Created ${catalogType}: ${item.name} (level ${created.level}) - ID: ${created.id}`)

    // Recursively seed children
    if (item.children && item.children.length > 0) {
      await seedCatalogItems(catalogType, item.children, created.id)
    }
  }
}

export async function seedGymCatalogItems() {
  console.log("🏋️ Seeding Gym Training Module Catalog Items...")

  try {
    // Check if gym catalog items already exist
    const existingCount = await prisma.catalogItem.count({
      where: {
        isSystem: true,
        catalogType: {
          in: ['exercise_category', 'equipment_type', 'muscle_group']
        }
      }
    })

    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing Gym system catalog items`)
      console.log("   Clearing existing Gym system catalog items...")

      await prisma.catalogItem.deleteMany({
        where: {
          isSystem: true,
          catalogType: {
            in: ['exercise_category', 'equipment_type', 'muscle_group']
          }
        }
      })

      console.log("   ✓ Cleared existing Gym system catalog items")
    }

    console.log("\n💪 Seeding Exercise Categories...")
    await seedCatalogItems("exercise_category", exerciseCategoriesStructure)

    console.log("\n🛠️ Seeding Equipment Types...")
    await seedCatalogItems("equipment_type", equipmentTypesStructure)

    console.log("\n🎯 Seeding Muscle Groups...")
    await seedCatalogItems("muscle_group", muscleGroupsStructure)

    // Count total items created
    const totalCount = await prisma.catalogItem.count({
      where: {
        isSystem: true,
        catalogType: {
          in: ['exercise_category', 'equipment_type', 'muscle_group']
        }
      }
    })

    console.log(`\n✅ Gym catalog seeding completed! Total items: ${totalCount}`)

    // Show summary by catalog type and level
    const summary = await prisma.$queryRaw<Array<{ catalog_type: string, level: number, count: bigint }>>`
      SELECT "catalogType" as catalog_type, level, COUNT(*) as count
      FROM catalog_items
      WHERE "isSystem" = true
        AND "catalogType" IN ('exercise_category', 'equipment_type', 'muscle_group')
      GROUP BY "catalogType", level
      ORDER BY "catalogType", level
    `

    console.log("\n📊 Summary:")
    for (const row of summary) {
      console.log(`   ${row.catalog_type} (level ${row.level}): ${row.count} items`)
    }

  } catch (error) {
    console.error("❌ Error seeding Gym catalog items:", error)
    throw error
  }
}

// Run if executed directly
if (require.main === module) {
  seedGymCatalogItems()
    .then(() => {
      console.log("\n✅ Gym seed completed successfully")
      process.exit(0)
    })
    .catch((error) => {
      console.error("\n❌ Gym seed failed:", error)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
