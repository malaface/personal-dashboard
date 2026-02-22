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
    name: "Entrenamiento de Fuerza",
    slug: "strength-training",
    icon: "💪",
    color: "#EF4444",
    sortOrder: 1,
    description: "Ejercicios de resistencia y pesas",
    children: [
      {
        name: "Pecho",
        slug: "chest",
        icon: "🏋️",
        sortOrder: 1,
        description: "Ejercicios de pectorales",
        children: [
          { name: "Press de Banca", slug: "bench-press", description: "Press de banca con barra", sortOrder: 1 },
          { name: "Aperturas con Mancuernas", slug: "dumbbell-flyes", description: "Aperturas de pecho con mancuernas", sortOrder: 2 },
          { name: "Flexiones", slug: "push-ups", description: "Flexiones con peso corporal", sortOrder: 3 },
          { name: "Press Inclinado", slug: "incline-press", description: "Press de banca inclinado", sortOrder: 4 },
          { name: "Crossover en Cable", slug: "cable-crossover", description: "Cruce de cables para pecho", sortOrder: 5 }
        ]
      },
      {
        name: "Espalda",
        slug: "back",
        icon: "🦵",
        sortOrder: 2,
        description: "Ejercicios de espalda",
        children: [
          { name: "Peso Muerto", slug: "deadlift", description: "Peso muerto convencional", sortOrder: 1 },
          { name: "Dominadas", slug: "pull-ups", description: "Dominadas con peso corporal", sortOrder: 2 },
          { name: "Remo con Barra", slug: "barbell-rows", description: "Remo inclinado con barra", sortOrder: 3 },
          { name: "Jalón al Pecho", slug: "lat-pulldown", description: "Jalón de dorsales en polea", sortOrder: 4 },
          { name: "Remo en T", slug: "t-bar-row", description: "Remo en barra T", sortOrder: 5 }
        ]
      },
      {
        name: "Piernas",
        slug: "legs",
        icon: "🦿",
        sortOrder: 3,
        description: "Ejercicios de tren inferior",
        children: [
          { name: "Sentadilla", slug: "squat", description: "Sentadilla trasera", sortOrder: 1 },
          { name: "Prensa de Piernas", slug: "leg-press", description: "Prensa de piernas en máquina", sortOrder: 2 },
          { name: "Zancadas", slug: "lunges", description: "Zancadas caminando o estáticas", sortOrder: 3 },
          { name: "Curl de Piernas", slug: "leg-curls", description: "Curl de isquiotibiales", sortOrder: 4 },
          { name: "Elevación de Talones", slug: "calf-raises", description: "Elevación de talones de pie", sortOrder: 5 }
        ]
      },
      {
        name: "Hombros",
        slug: "shoulders",
        icon: "💪",
        sortOrder: 4,
        description: "Ejercicios de hombros",
        children: [
          { name: "Press Militar", slug: "overhead-press", description: "Press militar con barra", sortOrder: 1 },
          { name: "Elevaciones Laterales", slug: "lateral-raises", description: "Elevaciones laterales con mancuernas", sortOrder: 2 },
          { name: "Elevaciones Frontales", slug: "front-raises", description: "Elevaciones frontales con mancuernas", sortOrder: 3 },
          { name: "Encogimientos", slug: "shrugs", description: "Encogimientos con barra o mancuernas", sortOrder: 4 }
        ]
      },
      {
        name: "Brazos",
        slug: "arms",
        icon: "💪",
        sortOrder: 5,
        description: "Ejercicios de brazos",
        children: [
          { name: "Curl de Bíceps", slug: "biceps-curls", description: "Curl con barra o mancuernas", sortOrder: 1 },
          { name: "Curl de Martillo", slug: "hammer-curls", description: "Curl con agarre neutro", sortOrder: 2 },
          { name: "Fondos de Tríceps", slug: "tricep-dips", description: "Fondos con peso corporal o lastre", sortOrder: 3 },
          { name: "Extensión sobre la Cabeza", slug: "overhead-extension", description: "Extensión de tríceps sobre la cabeza", sortOrder: 4 },
          { name: "Press Francés", slug: "skull-crushers", description: "Extensión de tríceps acostado", sortOrder: 5 }
        ]
      },
      {
        name: "Core",
        slug: "core-exercises",
        icon: "🎯",
        sortOrder: 6,
        description: "Ejercicios de fortalecimiento del core",
        children: [
          { name: "Plancha", slug: "planks", description: "Plancha frontal isométrica", sortOrder: 1 },
          { name: "Abdominales", slug: "crunches", description: "Abdominales clásicos", sortOrder: 2 },
          { name: "Giros Rusos", slug: "russian-twists", description: "Giros oblicuos", sortOrder: 3 },
          { name: "Elevación de Piernas", slug: "leg-raises", description: "Elevación de piernas colgado", sortOrder: 4 }
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
    description: "Ejercicios cardiovasculares",
    children: [
      { name: "Correr", slug: "running", icon: "🏃‍♂️", description: "Correr al aire libre o en caminadora", sortOrder: 1 },
      { name: "Ciclismo", slug: "cycling", icon: "🚴", description: "Ciclismo al aire libre o estacionario", sortOrder: 2 },
      { name: "Natación", slug: "swimming", icon: "🏊", description: "Natación en alberca", sortOrder: 3 },
      { name: "Remo", slug: "rowing", icon: "🚣", description: "Máquina de remo", sortOrder: 4 },
      { name: "Saltar la Cuerda", slug: "jump-rope", description: "Cardio con cuerda para saltar", sortOrder: 5 },
      { name: "HIIT", slug: "hiit", description: "Entrenamiento de intervalos de alta intensidad", sortOrder: 6 }
    ]
  },
  {
    name: "Flexibilidad",
    slug: "flexibility",
    icon: "🧘",
    color: "#8B5CF6",
    sortOrder: 3,
    description: "Ejercicios de estiramiento y movilidad",
    children: [
      { name: "Yoga", slug: "yoga", description: "Práctica de yoga", sortOrder: 1 },
      { name: "Estiramiento Dinámico", slug: "dynamic-stretching", description: "Estiramientos basados en movimiento", sortOrder: 2 },
      { name: "Estiramiento Estático", slug: "static-stretching", description: "Estiramientos sostenidos", sortOrder: 3 },
      { name: "Rodillo de Espuma", slug: "foam-rolling", description: "Liberación miofascial", sortOrder: 4 },
      { name: "Pilates", slug: "pilates", description: "Ejercicios de Pilates", sortOrder: 5 }
    ]
  },
  {
    name: "Deportes",
    slug: "sports",
    icon: "⚽",
    color: "#F59E0B",
    sortOrder: 4,
    description: "Actividades deportivas",
    children: [
      { name: "Basquetbol", slug: "basketball", icon: "🏀", description: "Entrenamiento de basquetbol", sortOrder: 1 },
      { name: "Futbol", slug: "soccer", icon: "⚽", description: "Práctica de futbol", sortOrder: 2 },
      { name: "Tenis", slug: "tennis", icon: "🎾", description: "Entrenamiento de tenis", sortOrder: 3 },
      { name: "Artes Marciales", slug: "martial-arts", icon: "🥋", description: "Práctica de artes marciales", sortOrder: 4 },
      { name: "Boxeo", slug: "boxing", icon: "🥊", description: "Entrenamiento de boxeo", sortOrder: 5 }
    ]
  }
]

const equipmentTypesStructure: CatalogSeed[] = [
  {
    name: "Peso Libre",
    slug: "free-weights",
    icon: "🏋️",
    color: "#EF4444",
    sortOrder: 1,
    description: "Equipo de peso libre",
    children: [
      { name: "Barra", slug: "barbell", description: "Barra olímpica estándar", sortOrder: 1 },
      { name: "Mancuernas", slug: "dumbbell", description: "Mancuernas", sortOrder: 2 },
      { name: "Pesa Rusa", slug: "kettlebell", description: "Pesa rusa (kettlebell)", sortOrder: 3 },
      { name: "Barra Z", slug: "ez-bar", description: "Barra Z para curl", sortOrder: 4 },
      { name: "Discos", slug: "weight-plates", description: "Discos de peso", sortOrder: 5 }
    ]
  },
  {
    name: "Máquinas",
    slug: "machines",
    icon: "⚙️",
    color: "#3B82F6",
    sortOrder: 2,
    description: "Máquinas de gimnasio",
    children: [
      { name: "Polea / Cable", slug: "cable-machine", description: "Sistema de poleas y cables", sortOrder: 1 },
      { name: "Máquina Smith", slug: "smith-machine", description: "Máquina Smith guiada", sortOrder: 2 },
      { name: "Prensa de Piernas", slug: "leg-press-machine", description: "Prensa de piernas", sortOrder: 3 },
      { name: "Jalón de Dorsales", slug: "lat-pulldown-machine", description: "Máquina de jalón al pecho", sortOrder: 4 },
      { name: "Press de Pecho", slug: "chest-press-machine", description: "Máquina de press de pecho", sortOrder: 5 }
    ]
  },
  {
    name: "Peso Corporal",
    slug: "bodyweight",
    icon: "🤸",
    color: "#10B981",
    sortOrder: 3,
    description: "Entrenamiento con peso corporal",
    children: [
      { name: "Sin Equipo", slug: "no-equipment", description: "Solo peso corporal", sortOrder: 1 },
      { name: "Barra de Dominadas", slug: "pull-up-bar", description: "Barra para dominadas", sortOrder: 2 },
      { name: "Estación de Fondos", slug: "dip-station", description: "Barras paralelas para fondos", sortOrder: 3 },
      { name: "Anillas", slug: "rings", description: "Anillas de gimnasia", sortOrder: 4 }
    ]
  },
  {
    name: "Equipo de Cardio",
    slug: "cardio-equipment",
    icon: "🏃",
    color: "#F59E0B",
    sortOrder: 4,
    description: "Máquinas de cardio",
    children: [
      { name: "Caminadora", slug: "treadmill", description: "Caminadora / banda para correr", sortOrder: 1 },
      { name: "Bicicleta Estacionaria", slug: "stationary-bike", description: "Bicicleta fija de ejercicio", sortOrder: 2 },
      { name: "Máquina de Remo", slug: "rowing-machine", description: "Remadora indoor", sortOrder: 3 },
      { name: "Elíptica", slug: "elliptical", description: "Máquina elíptica", sortOrder: 4 },
      { name: "Escaladora", slug: "stair-climber", description: "Máquina escaladora", sortOrder: 5 }
    ]
  }
]

const muscleGroupsStructure: CatalogSeed[] = [
  {
    name: "Tren Superior",
    slug: "upper-body",
    icon: "💪",
    color: "#EF4444",
    sortOrder: 1,
    description: "Músculos del tren superior",
    children: [
      {
        name: "Pecho",
        slug: "chest-muscle",
        sortOrder: 1,
        description: "Músculos pectorales"
      },
      {
        name: "Espalda",
        slug: "back-muscle",
        sortOrder: 2,
        description: "Músculos de la espalda"
      },
      {
        name: "Hombros",
        slug: "shoulders-muscle",
        sortOrder: 3,
        description: "Músculos deltoides"
      },
      {
        name: "Brazos",
        slug: "arms-muscle",
        sortOrder: 4,
        description: "Músculos de los brazos",
        children: [
          { name: "Bíceps", slug: "biceps-muscle", description: "Músculos del bíceps", sortOrder: 1 },
          { name: "Tríceps", slug: "triceps-muscle", description: "Músculos del tríceps", sortOrder: 2 },
          { name: "Antebrazos", slug: "forearms-muscle", description: "Músculos del antebrazo", sortOrder: 3 }
        ]
      }
    ]
  },
  {
    name: "Tren Inferior",
    slug: "lower-body",
    icon: "🦵",
    color: "#3B82F6",
    sortOrder: 2,
    description: "Músculos del tren inferior",
    children: [
      { name: "Cuádriceps", slug: "quads", description: "Músculos frontales del muslo", sortOrder: 1 },
      { name: "Isquiotibiales", slug: "hamstrings", description: "Músculos posteriores del muslo", sortOrder: 2 },
      { name: "Glúteos", slug: "glutes", description: "Músculos glúteos", sortOrder: 3 },
      { name: "Pantorrillas", slug: "calves", description: "Músculos de la pantorrilla", sortOrder: 4 },
      { name: "Flexores de Cadera", slug: "hip-flexors", description: "Músculos flexores de la cadera", sortOrder: 5 }
    ]
  },
  {
    name: "Core",
    slug: "core",
    icon: "🎯",
    color: "#10B981",
    sortOrder: 3,
    description: "Músculos del core",
    children: [
      { name: "Abdominales", slug: "abs", description: "Músculos abdominales", sortOrder: 1 },
      { name: "Oblicuos", slug: "obliques", description: "Músculos oblicuos laterales", sortOrder: 2 },
      { name: "Espalda Baja", slug: "lower-back", description: "Músculos de la espalda baja", sortOrder: 3 }
    ]
  }
]

async function upsertCatalogItems(
  catalogType: string,
  structure: CatalogSeed[],
  parentId: string | null = null
): Promise<void> {
  for (const item of structure) {
    // Try to find existing item by slug + catalogType
    const existing = await prisma.catalogItem.findFirst({
      where: { catalogType, slug: item.slug, isSystem: true }
    })

    let itemId: string

    if (existing) {
      // Update existing item (preserve ID and foreign key references)
      await prisma.catalogItem.update({
        where: { id: existing.id },
        data: {
          name: item.name,
          description: item.description,
          icon: item.icon,
          color: item.color,
          sortOrder: item.sortOrder || 0,
          parentId,
        }
      })
      itemId = existing.id
      console.log(`  ✏️ Updated ${catalogType}: ${item.name} (slug: ${item.slug})`)
    } else {
      // Create new item
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
      itemId = created.id
      console.log(`  ✅ Created ${catalogType}: ${item.name} (slug: ${item.slug})`)
    }

    // Recursively upsert children
    if (item.children && item.children.length > 0) {
      await upsertCatalogItems(catalogType, item.children, itemId)
    }
  }
}

export async function seedGymCatalogItems() {
  console.log("🏋️ Seeding Gym Training Module Catalog Items (upsert mode)...")

  try {
    const existingCount = await prisma.catalogItem.count({
      where: {
        isSystem: true,
        catalogType: {
          in: ['exercise_category', 'equipment_type', 'muscle_group']
        }
      }
    })

    console.log(`📋 Found ${existingCount} existing Gym system catalog items`)
    console.log("   Using upsert: existing items will be updated, new ones created.\n")

    console.log("💪 Upserting Exercise Categories...")
    await upsertCatalogItems("exercise_category", exerciseCategoriesStructure)

    console.log("\n🛠️ Upserting Equipment Types...")
    await upsertCatalogItems("equipment_type", equipmentTypesStructure)

    console.log("\n🎯 Upserting Muscle Groups...")
    await upsertCatalogItems("muscle_group", muscleGroupsStructure)

    // Count total items
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
