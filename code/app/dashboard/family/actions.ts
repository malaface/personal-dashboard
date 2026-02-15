"use server"

import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/db/prisma"
import { FamilyMemberSchema } from "@/lib/validations/family"
import { EventSchema } from "@/lib/validations/event"
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

    // Auto-create birthday event if birthday is provided
    await syncBirthdayEvent(user.id, familyMember.id, validatedData.name, validatedData.birthday ? new Date(validatedData.birthday) : null)

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

    // Log family member update
    await createAuditLog({
      userId: user.id,
      action: "FAMILY_MEMBER_UPDATED",
      metadata: { familyMemberId, name: validatedData.name },
    })

    revalidatePath("/dashboard/family")

    // Auto-sync birthday event
    await syncBirthdayEvent(user.id, familyMember.id, validatedData.name, validatedData.birthday ? new Date(validatedData.birthday) : null)

    return { success: true, familyMember }
  } catch (error: any) {
    console.error("Update family member error:", error)
    return { success: false, error: error.message || "Failed to update family member" }
  }
}

// ============================================
// BIRTHDAY EVENT AUTO-SYNC
// ============================================

async function syncBirthdayEvent(userId: string, familyMemberId: string, memberName: string, birthday: Date | null) {
  const birthdayTitle = `Cumpleaños de ${memberName}`

  // Find existing birthday event for this member
  const existingBirthdayEvent = await prisma.event.findFirst({
    where: {
      userId,
      familyMemberId,
      title: { startsWith: "Cumpleaños de " },
      isRecurring: true,
      recurrenceType: "YEARLY",
    },
  })

  if (birthday) {
    if (existingBirthdayEvent) {
      await prisma.event.update({
        where: { id: existingBirthdayEvent.id },
        data: { title: birthdayTitle, date: birthday },
      })
    } else {
      await prisma.event.create({
        data: {
          userId,
          familyMemberId,
          title: birthdayTitle,
          date: birthday,
          isRecurring: true,
          recurrenceType: "YEARLY",
        },
      })
    }
  } else if (existingBirthdayEvent) {
    await prisma.event.delete({ where: { id: existingBirthdayEvent.id } })
  }
}

// ============================================
// EVENT CRUD ACTIONS
// ============================================

export async function createEvent(formData: FormData) {
  try {
    const user = await requireAuth()

    const rawData = {
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      date: formData.get("date"),
      familyMemberId: formData.get("familyMemberId") || undefined,
      location: formData.get("location") || undefined,
      isRecurring: formData.get("isRecurring") === "true",
      recurrenceType: formData.get("recurrenceType") || null,
    }

    const validatedData = EventSchema.parse(rawData)

    const event = await prisma.event.create({
      data: {
        userId: user.id,
        title: validatedData.title,
        description: validatedData.description || null,
        date: new Date(validatedData.date),
        familyMemberId: validatedData.familyMemberId || null,
        location: validatedData.location || null,
        isRecurring: validatedData.isRecurring,
        recurrenceType: validatedData.recurrenceType || null,
      },
    })

    await createAuditLog({
      userId: user.id,
      action: "EVENT_CREATED",
      metadata: { eventId: event.id, title: event.title },
    })

    revalidatePath("/dashboard/family")

    return { success: true, event }
  } catch (error: any) {
    console.error("Create event error:", error)
    return { success: false, error: error.message || "Failed to create event" }
  }
}

export async function updateEvent(eventId: string, formData: FormData) {
  try {
    const user = await requireAuth()

    const existingEvent = await prisma.event.findFirst({
      where: { id: eventId, userId: user.id },
    })

    if (!existingEvent) {
      return { success: false, error: "Event not found or access denied" }
    }

    const rawData = {
      title: formData.get("title"),
      description: formData.get("description") || undefined,
      date: formData.get("date"),
      familyMemberId: formData.get("familyMemberId") || undefined,
      location: formData.get("location") || undefined,
      isRecurring: formData.get("isRecurring") === "true",
      recurrenceType: formData.get("recurrenceType") || null,
    }

    const validatedData = EventSchema.parse(rawData)

    const event = await prisma.event.update({
      where: { id: eventId },
      data: {
        title: validatedData.title,
        description: validatedData.description || null,
        date: new Date(validatedData.date),
        familyMemberId: validatedData.familyMemberId || null,
        location: validatedData.location || null,
        isRecurring: validatedData.isRecurring,
        recurrenceType: validatedData.recurrenceType || null,
      },
    })

    await createAuditLog({
      userId: user.id,
      action: "EVENT_UPDATED",
      metadata: { eventId, title: validatedData.title },
    })

    revalidatePath("/dashboard/family")

    return { success: true, event }
  } catch (error: any) {
    console.error("Update event error:", error)
    return { success: false, error: error.message || "Failed to update event" }
  }
}

export async function deleteEvent(eventId: string) {
  try {
    const user = await requireAuth()

    const event = await prisma.event.findFirst({
      where: { id: eventId, userId: user.id },
    })

    if (!event) {
      return { success: false, error: "Event not found or access denied" }
    }

    await createAuditLog({
      userId: user.id,
      action: "EVENT_DELETED",
      metadata: { eventId, title: event.title },
    })

    await prisma.event.delete({ where: { id: eventId } })

    revalidatePath("/dashboard/family")

    return { success: true }
  } catch (error: any) {
    console.error("Delete event error:", error)
    return { success: false, error: error.message || "Failed to delete event" }
  }
}
