import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Seed system catalog items for Finance module
 *
 * Transaction Types (8 types at level 1):
 *   - Ingreso, Gasto, Pago, Transferencia, Reembolso,
 *     Compra a Meses, Pago de Tarjeta, Devolucion en Efectivo
 *
 * Shared Subcategories (level 2):
 *   - Comida, Transporte, Vivienda, Entretenimiento, Compras,
 *     Salud, Servicios, Salario, Freelance, Rendimientos, etc.
 *
 * Investment Types (1 level):
 *   - Acciones, Criptomonedas, Bonos, Bienes Raices, Materias Primas, Otra Inversion
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

// Shared subcategories for expense-like types
const sharedExpenseSubcategories: CatalogSeed[] = [
  {
    name: "Comida",
    slug: "comida",
    icon: "🍔",
    sortOrder: 1,
    description: "Gastos en alimentos y comidas",
    children: [
      { name: "Supermercado", slug: "supermercado", icon: "🛒", sortOrder: 1, description: "Compras de supermercado" },
      { name: "Restaurantes", slug: "restaurantes", icon: "🍽️", sortOrder: 2, description: "Comer fuera" },
      { name: "Delivery", slug: "delivery", icon: "🚚", sortOrder: 3, description: "Entrega a domicilio" }
    ]
  },
  {
    name: "Transporte",
    slug: "transporte",
    icon: "🚗",
    sortOrder: 2,
    description: "Gastos de transporte",
    children: [
      { name: "Gasolina", slug: "gasolina", icon: "⛽", sortOrder: 1, description: "Combustible" },
      { name: "Transporte Publico", slug: "transporte-publico", icon: "🚌", sortOrder: 2, description: "Metro, autobus, tren" },
      { name: "Taxi/App", slug: "taxi-app", icon: "🚕", sortOrder: 3, description: "Uber, Didi, taxi" }
    ]
  },
  {
    name: "Vivienda",
    slug: "vivienda",
    icon: "🏠",
    sortOrder: 3,
    description: "Gastos de vivienda",
    children: [
      { name: "Renta/Hipoteca", slug: "renta-hipoteca", icon: "🏡", sortOrder: 1, description: "Pago mensual de renta o hipoteca" },
      { name: "Servicios", slug: "servicios-vivienda", icon: "💡", sortOrder: 2, description: "Luz, agua, gas, internet" },
      { name: "Mantenimiento", slug: "mantenimiento", icon: "🔧", sortOrder: 3, description: "Reparaciones y mantenimiento del hogar" }
    ]
  },
  {
    name: "Entretenimiento",
    slug: "entretenimiento",
    icon: "🎬",
    sortOrder: 4,
    description: "Entretenimiento y ocio"
  },
  {
    name: "Compras",
    slug: "compras",
    icon: "🛍️",
    sortOrder: 5,
    description: "Compras generales"
  },
  {
    name: "Salud",
    slug: "salud",
    icon: "🏥",
    sortOrder: 6,
    description: "Gastos medicos y de salud"
  },
  {
    name: "Otro Gasto",
    slug: "otro-gasto",
    icon: "📦",
    sortOrder: 7,
    description: "Otros gastos"
  }
]

// Income subcategories
const incomeSubcategories: CatalogSeed[] = [
  { name: "Salario", slug: "salario", icon: "💼", sortOrder: 1, description: "Ingreso por empleo" },
  { name: "Freelance", slug: "freelance", icon: "🎨", sortOrder: 2, description: "Ingreso independiente" },
  {
    name: "Rendimientos",
    slug: "rendimientos",
    icon: "📈",
    sortOrder: 3,
    description: "Ingresos por inversiones",
    children: [
      { name: "Dividendos", slug: "dividendos", icon: "💵", sortOrder: 1, description: "Dividendos de acciones" },
      { name: "Intereses", slug: "intereses", icon: "💰", sortOrder: 2, description: "Intereses de ahorro/bonos" }
    ]
  },
  { name: "Regalo", slug: "regalo", icon: "🎁", sortOrder: 4, description: "Regalos recibidos" },
  { name: "Otro Ingreso", slug: "otro-ingreso", icon: "💸", sortOrder: 5, description: "Otras fuentes de ingreso" }
]

// Payment subcategories
const paymentSubcategories: CatalogSeed[] = [
  { name: "Pago de Servicios", slug: "pago-servicios", icon: "📄", sortOrder: 1, description: "Pagos de servicios (luz, agua, internet)" },
  { name: "Pago de Deuda", slug: "pago-deuda", icon: "🏦", sortOrder: 2, description: "Pagos de deudas y prestamos" }
]

// Transfer subcategories
const transferSubcategories: CatalogSeed[] = [
  { name: "Entre Cuentas", slug: "entre-cuentas", icon: "🔄", sortOrder: 1, description: "Transferencia entre cuentas propias" },
  { name: "A Terceros", slug: "a-terceros", icon: "👤", sortOrder: 2, description: "Transferencia a otras personas" }
]

// Refund subcategories
const refundSubcategories: CatalogSeed[] = [
  { name: "Reembolso de Compra", slug: "reembolso-compra", icon: "🛍️", sortOrder: 1, description: "Devolucion por compra" },
  { name: "Reembolso de Servicio", slug: "reembolso-servicio", icon: "📋", sortOrder: 2, description: "Devolucion por servicio" }
]

const transactionCategoriesStructure: CatalogSeed[] = [
  {
    name: "Ingreso",
    slug: "ingreso",
    icon: "💰",
    color: "#10B981",
    sortOrder: 1,
    description: "Dinero recibido",
    children: incomeSubcategories
  },
  {
    name: "Gasto",
    slug: "gasto",
    icon: "💸",
    color: "#EF4444",
    sortOrder: 2,
    description: "Dinero gastado",
    children: sharedExpenseSubcategories
  },
  {
    name: "Pago",
    slug: "pago",
    icon: "📄",
    color: "#F59E0B",
    sortOrder: 3,
    description: "Pagos de servicios y deudas",
    children: paymentSubcategories
  },
  {
    name: "Transferencia",
    slug: "transferencia",
    icon: "🔄",
    color: "#3B82F6",
    sortOrder: 4,
    description: "Movimientos entre cuentas",
    children: transferSubcategories
  },
  {
    name: "Reembolso",
    slug: "reembolso",
    icon: "↩️",
    color: "#8B5CF6",
    sortOrder: 5,
    description: "Dinero devuelto",
    children: refundSubcategories
  },
  {
    name: "Compra a Meses",
    slug: "compra-a-meses",
    icon: "📅",
    color: "#EC4899",
    sortOrder: 6,
    description: "Compras a meses sin intereses o con intereses",
    children: sharedExpenseSubcategories
  },
  {
    name: "Pago de Tarjeta",
    slug: "pago-de-tarjeta",
    icon: "💳",
    color: "#14B8A6",
    sortOrder: 7,
    description: "Pagos a tarjetas de credito",
    children: sharedExpenseSubcategories
  },
  {
    name: "Devolucion en Efectivo",
    slug: "devolucion-en-efectivo",
    icon: "💵",
    color: "#6366F1",
    sortOrder: 8,
    description: "Devoluciones recibidas en efectivo",
    children: sharedExpenseSubcategories
  }
]

const investmentTypesStructure: CatalogSeed[] = [
  {
    name: "Acciones",
    slug: "acciones",
    icon: "📊",
    color: "#3B82F6",
    sortOrder: 1,
    description: "Inversiones en bolsa de valores"
  },
  {
    name: "Criptomonedas",
    slug: "criptomonedas",
    icon: "₿",
    color: "#F59E0B",
    sortOrder: 2,
    description: "Monedas digitales"
  },
  {
    name: "Bonos",
    slug: "bonos",
    icon: "📜",
    color: "#6366F1",
    sortOrder: 3,
    description: "Bonos gubernamentales y corporativos"
  },
  {
    name: "Bienes Raices",
    slug: "bienes-raices",
    icon: "🏢",
    color: "#14B8A6",
    sortOrder: 4,
    description: "Inversiones en propiedades"
  },
  {
    name: "Materias Primas",
    slug: "materias-primas",
    icon: "⚡",
    color: "#8B5CF6",
    sortOrder: 5,
    description: "Oro, plata, petroleo, etc."
  },
  {
    name: "Otra Inversion",
    slug: "otra-inversion",
    icon: "💼",
    color: "#6B7280",
    sortOrder: 6,
    description: "Otros tipos de inversion"
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

    console.log(`  ✓ Created ${catalogType}: ${item.name} (${created.level}) - ID: ${created.id}`)

    // Recursively seed children
    if (item.children && item.children.length > 0) {
      await seedCatalogItems(catalogType, item.children, created.id)
    }
  }
}

export async function seedFinanceCatalogItems() {
  console.log("🌱 Seeding Finance Module Catalog Items...")

  try {
    // Check if catalog items already exist
    const existingCount = await prisma.catalogItem.count({
      where: { isSystem: true }
    })

    if (existingCount > 0) {
      console.log(`⚠️  Found ${existingCount} existing system catalog items`)
      console.log("   Clearing existing system catalog items...")

      // Delete children first (level 3, then 2, then 1, then 0)
      for (let level = 3; level >= 0; level--) {
        await prisma.catalogItem.deleteMany({
          where: { isSystem: true, level }
        })
      }

      console.log("   ✓ Cleared existing system catalog items")
    }

    console.log("\n📦 Seeding Transaction Categories...")
    await seedCatalogItems("transaction_category", transactionCategoriesStructure)

    console.log("\n📦 Seeding Investment Types...")
    await seedCatalogItems("investment_type", investmentTypesStructure)

    // Count total items created
    const totalCount = await prisma.catalogItem.count({
      where: { isSystem: true }
    })

    console.log(`\n✅ Finance catalog seeding completed! Total items: ${totalCount}`)

    // Show summary by catalog type and level
    const summary = await prisma.$queryRaw<Array<{ catalog_type: string, level: number, count: bigint }>>`
      SELECT "catalogType" as catalog_type, level, COUNT(*) as count
      FROM catalog_items
      WHERE "isSystem" = true
      GROUP BY "catalogType", level
      ORDER BY "catalogType", level
    `

    console.log("\n📊 Summary:")
    for (const row of summary) {
      console.log(`   ${row.catalog_type} (level ${row.level}): ${row.count} items`)
    }

  } catch (error) {
    console.error("❌ Error seeding catalog items:", error)
    throw error
  }
}

// Run if executed directly
if (require.main === module) {
  seedFinanceCatalogItems()
    .then(() => {
      console.log("\n✅ Seed completed successfully")
      process.exit(0)
    })
    .catch((error) => {
      console.error("\n❌ Seed failed:", error)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
