"use server"

import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/db/prisma"
import { TransactionSchema } from "@/lib/validations/finance"

export async function createTransaction(formData: FormData) {
  try {
    const user = await requireAuth()

    const rawData = {
      type: formData.get("type"),
      amount: parseFloat(formData.get("amount") as string),
      category: formData.get("category"),
      description: formData.get("description") || undefined,
      date: formData.get("date"),
    }

    const validatedData = TransactionSchema.parse(rawData)

    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        type: validatedData.type,
        amount: validatedData.amount,
        category: validatedData.category,
        description: validatedData.description,
        date: new Date(validatedData.date),
      },
    })

    revalidatePath("/dashboard/finance")

    return { success: true, transaction }
  } catch (error: any) {
    console.error("Create transaction error:", error)
    return { success: false, error: error.message || "Failed to create transaction" }
  }
}

export async function deleteTransaction(transactionId: string) {
  try {
    const user = await requireAuth()

    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId: user.id,
      },
    })

    if (!transaction) {
      return { success: false, error: "Transaction not found or access denied" }
    }

    await prisma.transaction.delete({
      where: { id: transactionId },
    })

    revalidatePath("/dashboard/finance")

    return { success: true }
  } catch (error: any) {
    console.error("Delete transaction error:", error)
    return { success: false, error: error.message || "Failed to delete transaction" }
  }
}

export async function updateTransaction(transactionId: string, formData: FormData) {
  try {
    const user = await requireAuth()

    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId: user.id,
      },
    })

    if (!existingTransaction) {
      return { success: false, error: "Transaction not found or access denied" }
    }

    const rawData = {
      type: formData.get("type"),
      amount: parseFloat(formData.get("amount") as string),
      category: formData.get("category"),
      description: formData.get("description") || undefined,
      date: formData.get("date"),
    }

    const validatedData = TransactionSchema.parse(rawData)

    const transaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        type: validatedData.type,
        amount: validatedData.amount,
        category: validatedData.category,
        description: validatedData.description,
        date: new Date(validatedData.date),
      },
    })

    revalidatePath("/dashboard/finance")

    return { success: true, transaction }
  } catch (error: any) {
    console.error("Update transaction error:", error)
    return { success: false, error: error.message || "Failed to update transaction" }
  }
}
