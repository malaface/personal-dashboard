/**
 * TypeScript types for CatalogItem system
 */

export type CatalogType =
  // Finance
  | 'transaction_category'
  | 'investment_type'
  | 'budget_category'

  // Gym Training
  | 'exercise_category'
  | 'equipment_type'
  | 'muscle_group'

  // Nutrition Tracker
  | 'meal_type'
  | 'food_category'
  | 'unit_type'
  | 'nutrition_goal_type'

  // Family CRM
  | 'relationship_type'
  | 'event_category'
  | 'reminder_category'
  | 'activity_type'
  | 'social_circle'

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

export interface ComboboxSearchResult extends CatalogItem {
  breadcrumbs: string[]
  relevanceScore: number
  match?: 'exact' | 'starts' | 'contains'
}
