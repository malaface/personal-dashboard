import { z } from "zod"

export const FamilyMemberSchema = z.object({
  name: z.string().min(2, "Name is required").max(100),
  relationship: z.string().min(2, "Relationship is required").max(50),
  birthday: z.string().or(z.date()).optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().max(20).optional(),
  notes: z.string().max(500).optional(),
})

export type FamilyMemberInput = z.infer<typeof FamilyMemberSchema>
