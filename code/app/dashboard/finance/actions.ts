"use server"

import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/db/prisma"
import { TransactionSchema } from "@/lib/validations/finance"
import { createAuditLog } from "@/lib/audit/logger"
import { getCatalogItemById } from "@/lib/catalog/queries"

export async function createTransaction(formData: FormData) {
  try {
    const user = await requireAuth()

    const rawData = {
      typeId: formData.get("typeId"),
      amount: parseFloat(formData.get("amount") as string),
      categoryId: formData.get("categoryId"),
      description: formData.get("description") || undefined,
      date: formData.get("date"),
    }

    const validatedData = TransactionSchema.parse(rawData)

    // Validate that user has access to selected catalog items
    const [typeItem, categoryItem] = await Promise.all([
      getCatalogItemById(validatedData.typeId, user.id),
      getCatalogItemById(validatedData.categoryId, user.id)
    ])

    if (!typeItem) {
      return { success: false, error: "Invalid transaction type" }
    }

    if (!categoryItem) {
      return { success: false, error: "Invalid category" }
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        typeId: validatedData.typeId,
        amount: validatedData.amount,
        categoryId: validatedData.categoryId,
        description: validatedData.description,
        date: new Date(validatedData.date),
      },
      include: {
        typeItem: true,
        categoryItem: true
      }
    })

    // Log transaction creation
    await createAuditLog({
      userId: user.id,
      action: "TRANSACTION_CREATED",
      metadata: {
        transactionId: transaction.id,
        typeId: transaction.typeId,
        amount: transaction.amount,
        categoryId: transaction.categoryId,
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

    // Capture transaction data before deleting
    const amount = transaction.amount
    const category = transaction.category

    // Log before deleting
    await createAuditLog({
      userId: user.id,
      action: "TRANSACTION_DELETED",
      metadata: { transactionId, amount, category },
    })

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
      typeId: formData.get("typeId"),
      amount: parseFloat(formData.get("amount") as string),
      categoryId: formData.get("categoryId"),
      description: formData.get("description") || undefined,
      date: formData.get("date"),
    }

    const validatedData = TransactionSchema.parse(rawData)

    // Validate that user has access to selected catalog items
    const [typeItem, categoryItem] = await Promise.all([
      getCatalogItemById(validatedData.typeId, user.id),
      getCatalogItemById(validatedData.categoryId, user.id)
    ])

    if (!typeItem) {
      return { success: false, error: "Invalid transaction type" }
    }

    if (!categoryItem) {
      return { success: false, error: "Invalid category" }
    }

    const transaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        typeId: validatedData.typeId,
        amount: validatedData.amount,
        categoryId: validatedData.categoryId,
        description: validatedData.description,
        date: new Date(validatedData.date),
      },
      include: {
        typeItem: true,
        categoryItem: true
      }
    })

    // Log transaction update
    await createAuditLog({
      userId: user.id,
      action: "TRANSACTION_UPDATED",
      metadata: { transactionId, changes: validatedData },
    })

    revalidatePath("/dashboard/finance")

    return { success: true, transaction }
  } catch (error: any) {
    console.error("Update transaction error:", error)
    return { success: false, error: error.message || "Failed to update transaction" }
  }
}
