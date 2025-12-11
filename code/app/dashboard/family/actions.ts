"use server"

import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/db/prisma"
import { FamilyMemberSchema } from "@/lib/validations/family"

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

    revalidatePath("/dashboard/family")

    return { success: true, familyMember }
  } catch (error: any) {
    console.error("Create family member error:", error)
    return { success: false, error: error.message || "Failed to create family member" }
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

    await prisma.familyMember.delete({
      where: { id: familyMemberId },
    })

    revalidatePath("/dashboard/family")

    return { success: true }
  } catch (error: any) {
    console.error("Delete family member error:", error)
    return { success: false, error: error.message || "Failed to delete family member" }
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

    revalidatePath("/dashboard/family")

    return { success: true, familyMember }
  } catch (error: any) {
    console.error("Update family member error:", error)
    return { success: false, error: error.message || "Failed to update family member" }
  }
}
