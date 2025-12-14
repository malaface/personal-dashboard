import { z } from "zod"

export const TransactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.number().positive("Amount must be positive"),
  category: z.string().min(2, "Category is required").max(50),
  description: z.string().max(200).optional(),
  date: z.string().or(z.date()),
})

export type TransactionInput = z.infer<typeof TransactionSchema>
