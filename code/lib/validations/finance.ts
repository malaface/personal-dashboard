import { z } from "zod"

// Legacy Transaction Schema (for backward compatibility)
export const TransactionSchemaLegacy = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().positive("Amount must be positive"),
  category: z.string().min(2, "Category is required").max(50),
  description: z.string().max(200).optional(),
  date: z.string().or(z.date()),
})

// New Transaction Schema (using CatalogItems)
export const TransactionSchema = z.object({
  typeId: z.string().cuid("Invalid transaction type ID"),
  amount: z.number().positive("Amount must be positive"),
  currency: z.enum(["MXN", "USD"]).default("MXN"),
  categoryId: z.string().cuid("Invalid category ID"),
  description: z.string().max(200).optional(),
  date: z.string().or(z.date()),
})

// Investment Schema (using CatalogItems)
export const InvestmentSchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  typeId: z.string().cuid("Invalid investment type ID"),
  amount: z.number().positive("Amount must be positive"),
  currentValue: z.number().positive().optional(),
  purchaseDate: z.string().or(z.date()),
  notes: z.string().max(500).optional(),
})

// Budget Schema (using CatalogItems)
export const BudgetSchema = z.object({
  categoryId: z.string().cuid("Invalid category ID"),
  limit: z.number().positive("Limit must be positive"),
  month: z.string().or(z.date()),
  spent: z.number().min(0, "Spent must be non-negative").default(0),
})

export type TransactionInput = z.infer<typeof TransactionSchema>
export type TransactionInputLegacy = z.infer<typeof TransactionSchemaLegacy>
export type InvestmentInput = z.infer<typeof InvestmentSchema>
export type BudgetInput = z.infer<typeof BudgetSchema>
