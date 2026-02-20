"use server"

import { prisma } from "@/lib/db/prisma"
import { CatalogType, CatalogItem } from "./types"

/**
 * Get all catalog items visible to a user (system + user-specific)
 * Implements RLS: Users can see system categories + their own categories
 */
export async function getUserCatalogItems(
  userId: string,
  catalogType: CatalogType,
  includeInactive = false
): Promise<CatalogItem[]> {
  const items = await prisma.catalogItem.findMany({
    where: {
      catalogType,
      isActive: includeInactive ? undefined : true,
      OR: [
        { isSystem: true, userId: null },
        { isSystem: false, userId }
      ]
    },
    include: {
      parent: true,
      children: {
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
      }
    },
    orderBy: [
      { level: 'asc' },
      { sortOrder: 'asc' },
      { name: 'asc' }
    ]
  })

  return items as CatalogItem[]
}

/**
 * Get catalog items by parent (for cascading dropdowns)
 */
export async function getCatalogItemsByParent(
  userId: string,
  catalogType: CatalogType,
  parentId: string | null
): Promise<CatalogItem[]> {
  const items = await prisma.catalogItem.findMany({
    where: {
      catalogType,
      parentId: parentId || null,
      isActive: true,
      OR: [
        { isSystem: true, userId: null },
        { isSystem: false, userId }
      ]
    },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
  })

  return items as CatalogItem[]
}

/**
 * Get single catalog item by ID (with ownership check)
 */
export async function getCatalogItemById(
  id: string,
  userId: string
): Promise<CatalogItem | null> {
  const item = await prisma.catalogItem.findFirst({
    where: {
      id,
      OR: [
        { isSystem: true, userId: null },
        { isSystem: false, userId }
      ]
    },
    include: {
      parent: true,
      children: {
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }]
      }
    }
  })

  return item as CatalogItem | null
}

/**
 * Check if catalog item is deletable (no transactions/investments/budgets reference it)
 */
export async function isCatalogItemDeletable(id: string): Promise<boolean> {
  const [
    transactionsAsTypeCount,
    transactionsAsCategoryCount,
    investmentsCount,
    budgetsCount,
    childrenCount
  ] = await Promise.all([
    prisma.transaction.count({ where: { typeId: id } }),
    prisma.transaction.count({ where: { categoryId: id } }),
    prisma.investment.count({ where: { typeId: id } }),
    prisma.budget.count({ where: { categoryId: id } }),
    prisma.catalogItem.count({ where: { parentId: id } })
  ])

  return (
    transactionsAsTypeCount === 0 &&
    transactionsAsCategoryCount === 0 &&
    investmentsCount === 0 &&
    budgetsCount === 0 &&
    childrenCount === 0
  )
}

/**
 * Get catalog item usage count
 */
export async function getCatalogItemUsageCount(id: string): Promise<{
  transactionsAsType: number
  transactionsAsCategory: number
  investments: number
  budgets: number
  children: number
  total: number
}> {
  const [
    transactionsAsType,
    transactionsAsCategory,
    investments,
    budgets,
    children
  ] = await Promise.all([
    prisma.transaction.count({ where: { typeId: id } }),
    prisma.transaction.count({ where: { categoryId: id } }),
    prisma.investment.count({ where: { typeId: id } }),
    prisma.budget.count({ where: { categoryId: id } }),
    prisma.catalogItem.count({ where: { parentId: id } })
  ])

  return {
    transactionsAsType,
    transactionsAsCategory,
    investments,
    budgets,
    children,
    total: transactionsAsType + transactionsAsCategory + investments + budgets + children
  }
}

/**
 * Get all catalog types for a user
 */
export async function getUserCatalogTypes(userId: string): Promise<{
  catalogType: string
  count: number
  systemCount: number
  userCount: number
}[]> {
  const results = await prisma.$queryRaw<Array<{
    catalogType: string
    count: bigint
    system_count: bigint
    user_count: bigint
  }>>`
    SELECT
      "catalogType" as "catalogType",
      COUNT(*) as count,
      SUM(CASE WHEN "isSystem" = true THEN 1 ELSE 0 END) as system_count,
      SUM(CASE WHEN "isSystem" = false AND "userId" = ${userId} THEN 1 ELSE 0 END) as user_count
    FROM catalog_items
    WHERE "isActive" = true
    AND ("isSystem" = true OR "userId" = ${userId})
    GROUP BY "catalogType"
    ORDER BY "catalogType"
  `

  return results.map(row => ({
    catalogType: row.catalogType,
    count: Number(row.count),
    systemCount: Number(row.system_count),
    userCount: Number(row.user_count)
  }))
}
