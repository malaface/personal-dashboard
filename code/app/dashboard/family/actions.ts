"use server"

import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/db/prisma"
import { FamilyMemberSchema } from "@/lib/validations/family"
import { createAuditLog } from "@/lib/audit/logger"

export async function createFamilyMember(formData: FormData) {
  try {
    const user = await requireAuth()

    const rawData = {
      name: formData.get("name"),
      relationship: formData.get("relationship"),
      birthday: formData.get("birthday") || undefined,
      email: formData.get("email") || undefined,
      phone: formData.get("phone") || undefined,
      notes: formData.get("notes") || undefined,
    }

    const validatedData = FamilyMemberSchema.parse(rawData)

    const familyMember = await prisma.familyMember.create({
      data: {
        userId: user.id,
        name: validatedData.name,
        relationship: validatedData.relationship,
        birthday: validatedData.birthday ? new Date(validatedData.birthday) : null,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
        notes: validatedData.notes || null,
      },
    })

    // Log family member creation
    await createAuditLog({
      userId: user.id,
      action: "FAMILY_MEMBER_CREATED",
      metadata: { familyMemberId: familyMember.id, name: familyMember.name },
    })

    revalidatePath("/dashboard/family")

    return { success: true, familyMember }
  } catch (error: unknown) {
    console.error("Create family member error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to create family member" }
  }
}

export async function deleteFamilyMember(familyMemberId: string) {
  try {
    const user = await requireAuth()

    const familyMember = await prisma.familyMember.findFirst({
      where: {
        id: familyMemberId,
        userId: user.id,
      },
    })

    if (!familyMember) {
      return { success: false, error: "Family member not found or access denied" }
    }

    // Capture name before deleting
    const memberName = familyMember.name

    // Log before deleting
    await createAuditLog({
      userId: user.id,
      action: "FAMILY_MEMBER_DELETED",
      metadata: { familyMemberId, name: memberName },
    })

    await prisma.familyMember.delete({
      where: { id: familyMemberId },
    })

    revalidatePath("/dashboard/family")

    return { success: true }
  } catch (error: unknown) {
    console.error("Delete family member error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete family member" }
  }
}

export async function updateFamilyMember(familyMemberId: string, formData: FormData) {
  try {
    const user = await requireAuth()

    const existingMember = await prisma.familyMember.findFirst({
      where: {
        id: familyMemberId,
        userId: user.id,
      },
    })

    if (!existingMember) {
      return { success: false, error: "Family member not found or access denied" }
    }

    const rawData = {
      name: formData.get("name"),
      relationship: formData.get("relationship"),
      birthday: formData.get("birthday") || undefined,
      email: formData.get("email") || undefined,
      phone: formData.get("phone") || undefined,
      notes: formData.get("notes") || undefined,
    }

    const validatedData = FamilyMemberSchema.parse(rawData)

    const familyMember = await prisma.familyMember.update({
      where: { id: familyMemberId },
      data: {
        name: validatedData.name,
        relationship: validatedData.relationship,
        birthday: validatedData.birthday ? new Date(validatedData.birthday) : null,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
        notes: validatedData.notes || null,
      },
    })

    // Log family member update
    await createAuditLog({
      userId: user.id,
      action: "FAMILY_MEMBER_UPDATED",
      metadata: { familyMemberId, name: validatedData.name },
    })

    revalidatePath("/dashboard/family")

    return { success: true, familyMember }
  } catch (error: unknown) {
    console.error("Update family member error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to update family member" }
  }
}
