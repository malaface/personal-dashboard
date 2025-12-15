/**
 * TypeScript types for CatalogItem system
 */

export type CatalogType =
  | 'transaction_category'
  | 'investment_type'
  | 'budget_category'

export interface CatalogItem {
  id: string
  catalogType: CatalogType
  name: string
  slug: string
  description?: string | null
  parentId?: string | null
  level: number
  isSystem: boolean
  userId?: string | null
  icon?: string | null
  color?: string | null
  sortOrder: number
  metadata?: any
  isActive: boolean
  createdAt: Date
  updatedAt: Date

  // Relations
  parent?: CatalogItem | null
  children?: CatalogItem[]
}

export interface CatalogTreeNode extends CatalogItem {
  children: CatalogTreeNode[]
  fullPath: string[] // ['Expense', 'Food', 'Restaurants']
  depth: number // For rendering indentation
}

export interface CatalogItemFlat extends CatalogItem {
  depth: number
  fullPath: string[]
}
