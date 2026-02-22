"use server"

import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/db/prisma"
import { ProfileSchema, PasswordChangeSchema } from "@/lib/validations/profile"
import { createAuditLog } from "@/lib/audit/logger"
import bcrypt from "bcryptjs"

export async function updateProfile(formData: FormData) {
  try {
    const user = await requireAuth()

    const rawData = {
      name: formData.get("name"),
      bio: formData.get("bio") || undefined,
      phone: formData.get("phone") || undefined,
      birthday: formData.get("birthday") || undefined,
      country: formData.get("country") || undefined,
      city: formData.get("city") || undefined,
      timezone: formData.get("timezone") || undefined,
    }

    const validatedData = ProfileSchema.parse(rawData)

    // Update user name
    await prisma.user.update({
      where: { id: user.id },
      data: { name: validatedData.name },
    })

    // Upsert profile
    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        bio: validatedData.bio || null,
        phone: validatedData.phone || null,
        birthday: validatedData.birthday ? new Date(validatedData.birthday) : null,
        country: validatedData.country || null,
        city: validatedData.city || null,
        timezone: validatedData.timezone || null,
      },
      create: {
        userId: user.id,
        bio: validatedData.bio || null,
        phone: validatedData.phone || null,
        birthday: validatedData.birthday ? new Date(validatedData.birthday) : null,
        country: validatedData.country || null,
        city: validatedData.city || null,
        timezone: validatedData.timezone || null,
      },
    })

    revalidatePath("/dashboard/settings")

    return { success: true }
  } catch (error: unknown) {
    console.error("Update profile error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to update profile" }
  }
}

export async function changePassword(formData: FormData) {
  try {
    const user = await requireAuth()

    const rawData = {
      currentPassword: formData.get("currentPassword"),
      newPassword: formData.get("newPassword"),
      confirmPassword: formData.get("confirmPassword"),
    }

    const validatedData = PasswordChangeSchema.parse(rawData)

    // Get user with password
    const userWithPassword = await prisma.user.findUnique({
      where: { id: user.id },
      select: { password: true },
    })

    if (!userWithPassword?.password) {
      return { success: false, error: "User not found or no password set" }
    }

    // Verify current password
    const isValid = await bcrypt.compare(validatedData.currentPassword, userWithPassword.password)

    if (!isValid) {
      return { success: false, error: "Current password is incorrect" }
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(validatedData.newPassword, 12)

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    // Log password change
    await createAuditLog({
      userId: user.id,
      action: "PASSWORD_CHANGE",
      metadata: {
        email: user.email,
        timestamp: new Date().toISOString(),
      },
    })

    return { success: true }
  } catch (error: unknown) {
    console.error("Change password error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to change password" }
  }
}
