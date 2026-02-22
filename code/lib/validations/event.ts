import { z } from "zod"

export const EventSchema = z.object({
  title: z.string().min(2, "El título es requerido").max(100),
  description: z.string().max(500).optional(),
  date: z.string().min(1, "La fecha es requerida"),
  familyMemberId: z.string().optional(),
  location: z.string().max(200).optional(),
  isRecurring: z.boolean().default(false),
  recurrenceType: z.enum(["YEARLY", "MONTHLY", "WEEKLY"]).optional().nullable(),
})

export type EventInput = z.infer<typeof EventSchema>
