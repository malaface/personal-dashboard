import { z } from "zod"

export const ProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  bio: z.string().max(300).optional(),
  phone: z.string().max(20).optional(),
  birthday: z.string().or(z.date()).optional(),
  country: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  timezone: z.string().max(50).optional(),
})

export const PasswordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export type ProfileInput = z.infer<typeof ProfileSchema>
export type PasswordChangeInput = z.infer<typeof PasswordChangeSchema>
