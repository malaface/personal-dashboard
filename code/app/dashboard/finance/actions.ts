"use server"

import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/db/prisma"
import { TransactionSchema, InvestmentSchema, BudgetSchema } from "@/lib/validations/finance"
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
  } catch (error: unknown) {
    console.error("Create transaction error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to create transaction" }
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
  } catch (error: unknown) {
    console.error("Delete transaction error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete transaction" }
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
  } catch (error: unknown) {
    console.error("Update transaction error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to update transaction" }
  }
}

// ==================== INVESTMENT ACTIONS ====================

export async function createInvestment(formData: FormData) {
  try {
    const user = await requireAuth()

    const rawData = {
      typeId: formData.get("typeId"),
      name: formData.get("name"),
      amount: parseFloat(formData.get("amount") as string),
      currentValue: formData.get("currentValue")
        ? parseFloat(formData.get("currentValue") as string)
        : undefined,
      purchaseDate: formData.get("purchaseDate"),
      notes: formData.get("notes") || undefined,
    }

    const validatedData = InvestmentSchema.parse(rawData)

    // Validate that user has access to selected catalog item
    const typeItem = await getCatalogItemById(validatedData.typeId, user.id)

    if (!typeItem) {
      return { success: false, error: "Invalid investment type" }
    }

    const investment = await prisma.investment.create({
      data: {
        userId: user.id,
        typeId: validatedData.typeId,
        name: validatedData.name,
        amount: validatedData.amount,
        currentValue: validatedData.currentValue,
        purchaseDate: new Date(validatedData.purchaseDate),
        notes: validatedData.notes,
      },
      include: {
        typeItem: true
      }
    })

    // Log investment creation
    await createAuditLog({
      userId: user.id,
      action: "INVESTMENT_CREATED",
      metadata: {
        investmentId: investment.id,
        typeId: investment.typeId,
        name: investment.name,
        amount: investment.amount,
      },
    })

    revalidatePath("/dashboard/investments")

    return { success: true, investment }
  } catch (error: unknown) {
    console.error("Create investment error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to create investment" }
  }
}

export async function updateInvestment(investmentId: string, formData: FormData) {
  try {
    const user = await requireAuth()

    const existingInvestment = await prisma.investment.findFirst({
      where: {
        id: investmentId,
        userId: user.id,
      },
    })

    if (!existingInvestment) {
      return { success: false, error: "Investment not found or access denied" }
    }

    const rawData = {
      typeId: formData.get("typeId"),
      name: formData.get("name"),
      amount: parseFloat(formData.get("amount") as string),
      currentValue: formData.get("currentValue")
        ? parseFloat(formData.get("currentValue") as string)
        : undefined,
      purchaseDate: formData.get("purchaseDate"),
      notes: formData.get("notes") || undefined,
    }

    const validatedData = InvestmentSchema.parse(rawData)

    // Validate that user has access to selected catalog item
    const typeItem = await getCatalogItemById(validatedData.typeId, user.id)

    if (!typeItem) {
      return { success: false, error: "Invalid investment type" }
    }

    const investment = await prisma.investment.update({
      where: { id: investmentId },
      data: {
        typeId: validatedData.typeId,
        name: validatedData.name,
        amount: validatedData.amount,
        currentValue: validatedData.currentValue,
        purchaseDate: new Date(validatedData.purchaseDate),
        notes: validatedData.notes,
      },
      include: {
        typeItem: true
      }
    })

    // Log investment update
    await createAuditLog({
      userId: user.id,
      action: "INVESTMENT_UPDATED",
      metadata: { investmentId, changes: validatedData },
    })

    revalidatePath("/dashboard/investments")

    return { success: true, investment }
  } catch (error: unknown) {
    console.error("Update investment error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to update investment" }
  }
}

export async function deleteInvestment(investmentId: string) {
  try {
    const user = await requireAuth()

    const investment = await prisma.investment.findFirst({
      where: {
        id: investmentId,
        userId: user.id,
      },
    })

    if (!investment) {
      return { success: false, error: "Investment not found or access denied" }
    }

    // Capture investment data before deleting
    const name = investment.name
    const amount = investment.amount

    // Log before deleting
    await createAuditLog({
      userId: user.id,
      action: "INVESTMENT_DELETED",
      metadata: { investmentId, name, amount },
    })

    await prisma.investment.delete({
      where: { id: investmentId },
    })

    revalidatePath("/dashboard/investments")

    return { success: true }
  } catch (error: unknown) {
    console.error("Delete investment error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete investment" }
  }
}

// ==================== BUDGET ACTIONS ====================

export async function createBudget(formData: FormData) {
  try {
    const user = await requireAuth()

    const rawData = {
      categoryId: formData.get("categoryId"),
      limit: parseFloat(formData.get("limit") as string),
      month: formData.get("month"),
      spent: 0, // Initial spent is always 0
    }

    const validatedData = BudgetSchema.parse(rawData)

    // Validate that user has access to selected catalog item
    const categoryItem = await getCatalogItemById(validatedData.categoryId, user.id)

    if (!categoryItem) {
      return { success: false, error: "Invalid category" }
    }

    // Check for duplicate budget (same user, category, month)
    const existingBudget = await prisma.budget.findFirst({
      where: {
        userId: user.id,
        categoryId: validatedData.categoryId,
        month: new Date(validatedData.month),
      },
    })

    if (existingBudget) {
      return {
        success: false,
        error: "A budget for this category and month already exists"
      }
    }

    const budget = await prisma.budget.create({
      data: {
        userId: user.id,
        categoryId: validatedData.categoryId,
        limit: validatedData.limit,
        month: new Date(validatedData.month),
        spent: validatedData.spent,
      },
      include: {
        categoryItem: true
      }
    })

    // Log budget creation
    await createAuditLog({
      userId: user.id,
      action: "BUDGET_CREATED",
      metadata: {
        budgetId: budget.id,
        categoryId: budget.categoryId,
        limit: budget.limit,
        month: budget.month,
      },
    })

    revalidatePath("/dashboard/budgets")

    return { success: true, budget }
  } catch (error: unknown) {
    console.error("Create budget error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to create budget" }
  }
}

export async function updateBudget(budgetId: string, formData: FormData) {
  try {
    const user = await requireAuth()

    const existingBudget = await prisma.budget.findFirst({
      where: {
        id: budgetId,
        userId: user.id,
      },
    })

    if (!existingBudget) {
      return { success: false, error: "Budget not found or access denied" }
    }

    const rawData = {
      categoryId: formData.get("categoryId"),
      limit: parseFloat(formData.get("limit") as string),
      month: formData.get("month"),
      spent: existingBudget.spent, // Keep existing spent value
    }

    const validatedData = BudgetSchema.parse(rawData)

    // Validate that user has access to selected catalog item
    const categoryItem = await getCatalogItemById(validatedData.categoryId, user.id)

    if (!categoryItem) {
      return { success: false, error: "Invalid category" }
    }

    // Check for duplicate budget (only if category or month changed)
    if (
      validatedData.categoryId !== existingBudget.categoryId ||
      new Date(validatedData.month).getTime() !== existingBudget.month.getTime()
    ) {
      const duplicateBudget = await prisma.budget.findFirst({
        where: {
          userId: user.id,
          categoryId: validatedData.categoryId,
          month: new Date(validatedData.month),
          id: { not: budgetId },
        },
      })

      if (duplicateBudget) {
        return {
          success: false,
          error: "A budget for this category and month already exists"
        }
      }
    }

    const budget = await prisma.budget.update({
      where: { id: budgetId },
      data: {
        categoryId: validatedData.categoryId,
        limit: validatedData.limit,
        month: new Date(validatedData.month),
      },
      include: {
        categoryItem: true
      }
    })

    // Log budget update
    await createAuditLog({
      userId: user.id,
      action: "BUDGET_UPDATED",
      metadata: { budgetId, changes: validatedData },
    })

    revalidatePath("/dashboard/budgets")

    return { success: true, budget }
  } catch (error: unknown) {
    console.error("Update budget error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to update budget" }
  }
}

export async function deleteBudget(budgetId: string) {
  try {
    const user = await requireAuth()

    const budget = await prisma.budget.findFirst({
      where: {
        id: budgetId,
        userId: user.id,
      },
    })

    if (!budget) {
      return { success: false, error: "Budget not found or access denied" }
    }

    // Capture budget data before deleting
    const limit = budget.limit
    const month = budget.month

    // Log before deleting
    await createAuditLog({
      userId: user.id,
      action: "BUDGET_DELETED",
      metadata: { budgetId, limit, month },
    })

    await prisma.budget.delete({
      where: { id: budgetId },
    })

    revalidatePath("/dashboard/budgets")

    return { success: true }
  } catch (error: unknown) {
    console.error("Delete budget error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete budget" }
  }
}
