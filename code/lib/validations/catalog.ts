import { z } from "zod"

export const CatalogTypeEnum = z.enum([
  // Finance Module (3)
  "transaction_category",
  "investment_type",
  "budget_category",

  // Gym Training Module (3)
  "exercise_category",
  "equipment_type",
  "muscle_group",

  // Nutrition Module (4)
  "meal_type",
  "food_category",
  "unit_type",
  "nutrition_goal_type",

  // Family CRM Module (5)
  "relationship_type",
  "event_category",
  "reminder_category",
  "activity_type",
  "social_circle"
])

export const CatalogItemSchema = z.object({
  catalogType: CatalogTypeEnum,
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .trim(),
  slug: z.string()
    .min(2, "Slug must be at least 2 characters")
    .max(50, "Slug must be less than 50 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens")
    .optional(),
  description: z.string()
    .max(200, "Description must be less than 200 characters")
    .optional(),
  parentId: z.string().cuid("Invalid parent ID").optional(),
  icon: z.string()
    .max(50, "Icon must be less than 50 characters")
    .optional(),
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color (e.g., #FF5733)")
    .optional(),
  sortOrder: z.number()
    .int("Sort order must be an integer")
    .min(0, "Sort order must be non-negative")
    .default(0)
})

export const CatalogItemUpdateSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .trim()
    .optional(),
  description: z.string()
    .max(200, "Description must be less than 200 characters")
    .nullable()
    .optional(),
  icon: z.string()
    .max(50, "Icon must be less than 50 characters")
    .nullable()
    .optional(),
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex color (e.g., #FF5733)")
    .nullable()
    .optional(),
  sortOrder: z.number()
    .int("Sort order must be an integer")
    .min(0, "Sort order must be non-negative")
    .optional()
})

export type CatalogItemInput = z.infer<typeof CatalogItemSchema>
export type CatalogItemUpdateInput = z.infer<typeof CatalogItemUpdateSchema>
export type CatalogType = z.infer<typeof CatalogTypeEnum>
