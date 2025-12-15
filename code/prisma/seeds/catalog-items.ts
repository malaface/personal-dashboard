import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Seed system catalog items for Finance module
 *
 * Structure:
 * - Transaction Categories (3 levels):
 *   - Income (level 1)
 *     - Salary (level 2)
 *     - Freelance (level 2)
 *     - Investment Returns (level 2)
 *       - Dividends (level 3)
 *       - Interest (level 3)
 *     - Gift (level 2)
 *     - Other Income (level 2)
 *   - Expense (level 1)
 *     - Food (level 2)
 *       - Groceries (level 3)
 *       - Restaurants (level 3)
 *       - Delivery (level 3)
 *     - Transport (level 2)
 *       - Gas (level 3)
 *       - Public Transit (level 3)
 *       - Ride Share (level 3)
 *     - Housing (level 2)
 *       - Rent/Mortgage (level 3)
 *       - Utilities (level 3)
 *       - Maintenance (level 3)
 *     - Entertainment (level 2)
 *     - Shopping (level 2)
 *     - Healthcare (level 2)
 *     - Other Expense (level 2)
 *
 * - Investment Types (1 level):
 *   - Stocks (level 1)
 *   - Cryptocurrency (level 1)
 *   - Bonds (level 1)
 *   - Real Estate (level 1)
 *   - Commodities (level 1)
 *   - Other Investment (level 1)
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

const transactionCategoriesStructure: CatalogSeed[] = [
  {
    name: "Income",
    slug: "income",
    icon: "💰",
    color: "#10B981", // green
    sortOrder: 1,
    description: "Money received",
    children: [
      {
        name: "Salary",
        slug: "salary",
        icon: "💼",
        sortOrder: 1,
        description: "Regular employment income"
      },
      {
        name: "Freelance",
        slug: "freelance",
        icon: "🎨",
        sortOrder: 2,
        description: "Self-employment income"
      },
      {
        name: "Investment Returns",
        slug: "investment-returns",
        icon: "📈",
        sortOrder: 3,
        description: "Income from investments",
        children: [
          {
            name: "Dividends",
            slug: "dividends",
            icon: "💵",
            sortOrder: 1,
            description: "Stock dividends"
          },
          {
            name: "Interest",
            slug: "interest",
            icon: "💰",
            sortOrder: 2,
            description: "Interest from savings/bonds"
          }
        ]
      },
      {
        name: "Gift",
        slug: "gift",
        icon: "🎁",
        sortOrder: 4,
        description: "Gifts received"
      },
      {
        name: "Other Income",
        slug: "other-income",
        icon: "💸",
        sortOrder: 5,
        description: "Other sources of income"
      }
    ]
  },
  {
    name: "Expense",
    slug: "expense",
    icon: "💸",
    color: "#EF4444", // red
    sortOrder: 2,
    description: "Money spent",
    children: [
      {
        name: "Food",
        slug: "food",
        icon: "🍔",
        sortOrder: 1,
        description: "Food and dining expenses",
        children: [
          {
            name: "Groceries",
            slug: "groceries",
            icon: "🛒",
            sortOrder: 1,
            description: "Supermarket purchases"
          },
          {
            name: "Restaurants",
            slug: "restaurants",
            icon: "🍽️",
            sortOrder: 2,
            description: "Dining out"
          },
          {
            name: "Delivery",
            slug: "delivery",
            icon: "🚚",
            sortOrder: 3,
            description: "Food delivery services"
          }
        ]
      },
      {
        name: "Transport",
        slug: "transport",
        icon: "🚗",
        sortOrder: 2,
        description: "Transportation expenses",
        children: [
          {
            name: "Gas",
            slug: "gas",
            icon: "⛽",
            sortOrder: 1,
            description: "Fuel for vehicles"
          },
          {
            name: "Public Transit",
            slug: "public-transit",
            icon: "🚌",
            sortOrder: 2,
            description: "Bus, metro, train tickets"
          },
          {
            name: "Ride Share",
            slug: "ride-share",
            icon: "🚕",
            sortOrder: 3,
            description: "Uber, Lyft, taxi"
          }
        ]
      },
      {
        name: "Housing",
        slug: "housing",
        icon: "🏠",
        sortOrder: 3,
        description: "Housing-related expenses",
        children: [
          {
            name: "Rent/Mortgage",
            slug: "rent-mortgage",
            icon: "🏡",
            sortOrder: 1,
            description: "Monthly rent or mortgage payment"
          },
          {
            name: "Utilities",
            slug: "utilities",
            icon: "💡",
            sortOrder: 2,
            description: "Electricity, water, gas, internet"
          },
          {
            name: "Maintenance",
            slug: "maintenance",
            icon: "🔧",
            sortOrder: 3,
            description: "Repairs and home maintenance"
          }
        ]
      },
      {
        name: "Entertainment",
        slug: "entertainment",
        icon: "🎬",
        sortOrder: 4,
        description: "Entertainment and leisure"
      },
      {
        name: "Shopping",
        slug: "shopping",
        icon: "🛍️",
        sortOrder: 5,
        description: "Retail purchases"
      },
      {
        name: "Healthcare",
        slug: "healthcare",
        icon: "🏥",
        sortOrder: 6,
        description: "Medical and health expenses"
      },
      {
        name: "Other Expense",
        slug: "other-expense",
        icon: "📦",
        sortOrder: 7,
        description: "Other expenses"
      }
    ]
  }
]

const investmentTypesStructure: CatalogSeed[] = [
  {
    name: "Stocks",
    slug: "stocks",
    icon: "📊",
    color: "#3B82F6",
    sortOrder: 1,
    description: "Stock market investments"
  },
  {
    name: "Cryptocurrency",
    slug: "cryptocurrency",
    icon: "₿",
    color: "#F59E0B",
    sortOrder: 2,
    description: "Digital currencies"
  },
  {
    name: "Bonds",
    slug: "bonds",
    icon: "📜",
    color: "#6366F1",
    sortOrder: 3,
    description: "Government and corporate bonds"
  },
  {
    name: "Real Estate",
    slug: "real-estate",
    icon: "🏢",
    color: "#14B8A6",
    sortOrder: 4,
    description: "Property investments"
  },
  {
    name: "Commodities",
    slug: "commodities",
    icon: "⚡",
    color: "#8B5CF6",
    sortOrder: 5,
    description: "Gold, silver, oil, etc."
  },
  {
    name: "Other Investment",
    slug: "other-investment",
    icon: "💼",
    color: "#6B7280",
    sortOrder: 6,
    description: "Other investment types"
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

      await prisma.catalogItem.deleteMany({
        where: { isSystem: true }
      })

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
