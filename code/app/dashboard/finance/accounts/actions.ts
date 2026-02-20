"use server"

import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/db/prisma"
import { FinancialAccountSchema } from "@/lib/validations/finance"
import { createAuditLog } from "@/lib/audit/logger"

export async function createFinancialAccount(formData: FormData) {
  try {
    const user = await requireAuth()

    const rawData = {
      accountType: formData.get("accountType"),
      name: formData.get("name"),
      balance: parseFloat(formData.get("balance") as string) || 0,
      currency: formData.get("currency") || "MXN",
      icon: formData.get("icon") || null,
      color: formData.get("color") || null,
    }

    const validatedData = FinancialAccountSchema.parse(rawData)

    const account = await prisma.financialAccount.create({
      data: {
        userId: user.id,
        accountType: validatedData.accountType,
        name: validatedData.name,
        balance: validatedData.balance,
        currency: validatedData.currency,
        icon: validatedData.icon,
        color: validatedData.color,
      },
    })

    await createAuditLog({
      userId: user.id,
      action: "TRANSACTION_CREATED",
      metadata: {
        entity: "financial_account",
        accountId: account.id,
        accountType: account.accountType,
        name: account.name,
      },
    })

    revalidatePath("/dashboard/finance")
    revalidatePath("/dashboard/finance/accounts")

    return { success: true, account }
  } catch (error: any) {
    console.error("Create financial account error:", error)
    return { success: false, error: error.message || "Error al crear la cuenta" }
  }
}

export async function updateFinancialAccount(accountId: string, formData: FormData) {
  try {
    const user = await requireAuth()

    const existing = await prisma.financialAccount.findFirst({
      where: { id: accountId, userId: user.id },
    })

    if (!existing) {
      return { success: false, error: "Cuenta no encontrada" }
    }

    const rawData = {
      accountType: formData.get("accountType"),
      name: formData.get("name"),
      balance: parseFloat(formData.get("balance") as string) || 0,
      currency: formData.get("currency") || "MXN",
      icon: formData.get("icon") || null,
      color: formData.get("color") || null,
    }

    const validatedData = FinancialAccountSchema.parse(rawData)

    const account = await prisma.financialAccount.update({
      where: { id: accountId },
      data: {
        accountType: validatedData.accountType,
        name: validatedData.name,
        balance: validatedData.balance,
        currency: validatedData.currency,
        icon: validatedData.icon,
        color: validatedData.color,
      },
    })

    await createAuditLog({
      userId: user.id,
      action: "TRANSACTION_UPDATED",
      metadata: {
        entity: "financial_account",
        accountId: account.id,
        changes: validatedData,
      },
    })

    revalidatePath("/dashboard/finance")
    revalidatePath("/dashboard/finance/accounts")

    return { success: true, account }
  } catch (error: any) {
    console.error("Update financial account error:", error)
    return { success: false, error: error.message || "Error al actualizar la cuenta" }
  }
}

export async function deleteFinancialAccount(accountId: string) {
  try {
    const user = await requireAuth()

    const account = await prisma.financialAccount.findFirst({
      where: { id: accountId, userId: user.id },
    })

    if (!account) {
      return { success: false, error: "Cuenta no encontrada" }
    }

    // Check if account has transactions
    const txCount = await prisma.transaction.count({
      where: { fromAccountId: accountId },
    })

    if (txCount > 0) {
      // Soft delete - deactivate instead of deleting
      await prisma.financialAccount.update({
        where: { id: accountId },
        data: { isActive: false },
      })
    } else {
      await prisma.financialAccount.delete({
        where: { id: accountId },
      })
    }

    await createAuditLog({
      userId: user.id,
      action: "TRANSACTION_DELETED",
      metadata: {
        entity: "financial_account",
        accountId,
        name: account.name,
        softDelete: txCount > 0,
      },
    })

    revalidatePath("/dashboard/finance")
    revalidatePath("/dashboard/finance/accounts")

    return { success: true }
  } catch (error: any) {
    console.error("Delete financial account error:", error)
    return { success: false, error: error.message || "Error al eliminar la cuenta" }
  }
}
