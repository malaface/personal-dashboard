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
  fromAccountId: z.string().cuid("Invalid account ID").optional().nullable(),
  creditCardId: z.string().cuid("Invalid credit card ID").optional().nullable(),
  toAccountId: z.string().cuid("Invalid destination account ID").optional().nullable(),
})

// Financial Account Schema
export const FinancialAccountSchema = z.object({
  accountType: z.enum(["DEBIT_CARD", "CASH", "SAVINGS"]),
  name: z.string().min(1, "El nombre es requerido").max(100),
  balance: z.number().default(0),
  currency: z.enum(["MXN", "USD"]).default("MXN"),
  icon: z.string().max(10).optional().nullable(),
  color: z.string().max(10).optional().nullable(),
})

// Credit Card Schema
export const CreditCardSchema = z.object({
  name: z.string().min(1, "El nombre es requerido").max(100),
  creditLimit: z.number().positive("El limite debe ser positivo"),
  currentBalance: z.number().min(0).default(0),
  annualInterestRate: z.number().min(0).max(100),
  cutoffDay: z.number().int().min(1).max(31),
  paymentDay: z.number().int().min(1).max(31),
  icon: z.string().max(10).optional().nullable(),
  color: z.string().max(10).optional().nullable(),
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
export type FinancialAccountInput = z.infer<typeof FinancialAccountSchema>
export type CreditCardInput = z.infer<typeof CreditCardSchema>
export type InvestmentInput = z.infer<typeof InvestmentSchema>
export type BudgetInput = z.infer<typeof BudgetSchema>
