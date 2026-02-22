"use server"

import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/db/prisma"
import { CreditCardSchema } from "@/lib/validations/finance"
import { createAuditLog } from "@/lib/audit/logger"

export async function createCreditCard(formData: FormData) {
  try {
    const user = await requireAuth()

    const rawData = {
      name: formData.get("name"),
      creditLimit: parseFloat(formData.get("creditLimit") as string),
      currentBalance: parseFloat(formData.get("currentBalance") as string) || 0,
      annualInterestRate: parseFloat(formData.get("annualInterestRate") as string),
      cutoffDay: parseInt(formData.get("cutoffDay") as string),
      paymentDay: parseInt(formData.get("paymentDay") as string),
      icon: formData.get("icon") || null,
      color: formData.get("color") || null,
    }

    const validatedData = CreditCardSchema.parse(rawData)

    const card = await prisma.creditCard.create({
      data: {
        userId: user.id,
        name: validatedData.name,
        creditLimit: validatedData.creditLimit,
        currentBalance: validatedData.currentBalance,
        annualInterestRate: validatedData.annualInterestRate,
        cutoffDay: validatedData.cutoffDay,
        paymentDay: validatedData.paymentDay,
        icon: validatedData.icon,
        color: validatedData.color,
      },
    })

    await createAuditLog({
      userId: user.id,
      action: "TRANSACTION_CREATED",
      metadata: {
        entity: "credit_card",
        cardId: card.id,
        name: card.name,
      },
    })

    revalidatePath("/dashboard/finance")
    revalidatePath("/dashboard/finance/cards")

    return { success: true, card }
  } catch (error: any) {
    console.error("Create credit card error:", error)
    return { success: false, error: error.message || "Error al crear la tarjeta" }
  }
}

export async function updateCreditCard(cardId: string, formData: FormData) {
  try {
    const user = await requireAuth()

    const existing = await prisma.creditCard.findFirst({
      where: { id: cardId, userId: user.id },
    })

    if (!existing) {
      return { success: false, error: "Tarjeta no encontrada" }
    }

    const rawData = {
      name: formData.get("name"),
      creditLimit: parseFloat(formData.get("creditLimit") as string),
      currentBalance: parseFloat(formData.get("currentBalance") as string) || 0,
      annualInterestRate: parseFloat(formData.get("annualInterestRate") as string),
      cutoffDay: parseInt(formData.get("cutoffDay") as string),
      paymentDay: parseInt(formData.get("paymentDay") as string),
      icon: formData.get("icon") || null,
      color: formData.get("color") || null,
    }

    const validatedData = CreditCardSchema.parse(rawData)

    const card = await prisma.creditCard.update({
      where: { id: cardId },
      data: {
        name: validatedData.name,
        creditLimit: validatedData.creditLimit,
        currentBalance: validatedData.currentBalance,
        annualInterestRate: validatedData.annualInterestRate,
        cutoffDay: validatedData.cutoffDay,
        paymentDay: validatedData.paymentDay,
        icon: validatedData.icon,
        color: validatedData.color,
      },
    })

    await createAuditLog({
      userId: user.id,
      action: "TRANSACTION_UPDATED",
      metadata: {
        entity: "credit_card",
        cardId: card.id,
        changes: validatedData,
      },
    })

    revalidatePath("/dashboard/finance")
    revalidatePath("/dashboard/finance/cards")

    return { success: true, card }
  } catch (error: any) {
    console.error("Update credit card error:", error)
    return { success: false, error: error.message || "Error al actualizar la tarjeta" }
  }
}

export async function deleteCreditCard(cardId: string) {
  try {
    const user = await requireAuth()

    const card = await prisma.creditCard.findFirst({
      where: { id: cardId, userId: user.id },
    })

    if (!card) {
      return { success: false, error: "Tarjeta no encontrada" }
    }

    const txCount = await prisma.transaction.count({
      where: { creditCardId: cardId },
    })

    if (txCount > 0) {
      await prisma.creditCard.update({
        where: { id: cardId },
        data: { isActive: false },
      })
    } else {
      await prisma.creditCard.delete({
        where: { id: cardId },
      })
    }

    await createAuditLog({
      userId: user.id,
      action: "TRANSACTION_DELETED",
      metadata: {
        entity: "credit_card",
        cardId,
        name: card.name,
        softDelete: txCount > 0,
      },
    })

    revalidatePath("/dashboard/finance")
    revalidatePath("/dashboard/finance/cards")

    return { success: true }
  } catch (error: any) {
    console.error("Delete credit card error:", error)
    return { success: false, error: error.message || "Error al eliminar la tarjeta" }
  }
}
