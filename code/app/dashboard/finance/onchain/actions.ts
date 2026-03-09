"use server"

import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/db/prisma"
import { createAuditLog } from "@/lib/audit/logger"
import { encryptAPIKey } from "@/lib/ai/encryption"
import { OnchainWalletSchema, CovalentKeySchema } from "@/lib/validations/onchain"
import { syncWallet } from "@/lib/finance/onchain/sync"
import { processBatchFiscalEvents } from "@/lib/finance/onchain/fiscal-engine"

export async function createOnchainWallet(formData: FormData) {
  try {
    const user = await requireAuth()

    const rawData = {
      address: (formData.get("address") as string)?.trim().toLowerCase(),
      label: formData.get("label") as string,
      network: formData.get("network") || "ARBITRUM",
    }

    const validatedData = OnchainWalletSchema.parse(rawData)

    const wallet = await prisma.onchainWallet.create({
      data: {
        userId: user.id,
        address: validatedData.address,
        label: validatedData.label,
        network: validatedData.network,
      },
    })

    await createAuditLog({
      userId: user.id,
      action: "TRANSACTION_CREATED",
      metadata: {
        entity: "onchain_wallet",
        walletId: wallet.id,
        address: wallet.address,
        label: wallet.label,
      },
    })

    revalidatePath("/dashboard/finance/onchain")
    return { success: true, wallet }
  } catch (error: unknown) {
    console.error("Create onchain wallet error:", error)
    if (error instanceof Error && "code" in error && (error as { code: string }).code === "P2002") {
      return { success: false, error: "Esta wallet ya está registrada en esta red" }
    }
    return { success: false, error: error instanceof Error ? error.message : "Error al crear la wallet" }
  }
}

export async function updateOnchainWallet(walletId: string, formData: FormData) {
  try {
    const user = await requireAuth()

    const existing = await prisma.onchainWallet.findFirst({
      where: { id: walletId, userId: user.id },
    })

    if (!existing) {
      return { success: false, error: "Wallet no encontrada" }
    }

    const label = formData.get("label") as string
    if (!label || label.trim().length === 0) {
      return { success: false, error: "El nombre es requerido" }
    }

    const wallet = await prisma.onchainWallet.update({
      where: { id: walletId },
      data: { label: label.trim() },
    })

    await createAuditLog({
      userId: user.id,
      action: "TRANSACTION_UPDATED",
      metadata: {
        entity: "onchain_wallet",
        walletId: wallet.id,
        label: wallet.label,
      },
    })

    revalidatePath("/dashboard/finance/onchain")
    return { success: true, wallet }
  } catch (error: unknown) {
    console.error("Update onchain wallet error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Error al actualizar la wallet" }
  }
}

export async function deleteOnchainWallet(walletId: string) {
  try {
    const user = await requireAuth()

    const wallet = await prisma.onchainWallet.findFirst({
      where: { id: walletId, userId: user.id },
    })

    if (!wallet) {
      return { success: false, error: "Wallet no encontrada" }
    }

    await prisma.onchainWallet.delete({
      where: { id: walletId },
    })

    await createAuditLog({
      userId: user.id,
      action: "TRANSACTION_DELETED",
      metadata: {
        entity: "onchain_wallet",
        walletId,
        address: wallet.address,
        label: wallet.label,
      },
    })

    revalidatePath("/dashboard/finance/onchain")
    return { success: true }
  } catch (error: unknown) {
    console.error("Delete onchain wallet error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Error al eliminar la wallet" }
  }
}

export async function saveCovalentApiKey(formData: FormData) {
  try {
    const user = await requireAuth()

    const rawData = {
      apiKey: formData.get("apiKey") as string,
    }

    const validatedData = CovalentKeySchema.parse(rawData)
    const encrypted = encryptAPIKey(validatedData.apiKey)

    await prisma.aICredential.upsert({
      where: {
        id: (
          await prisma.aICredential.findFirst({
            where: { userId: user.id, provider: "COVALENT" },
            select: { id: true },
          })
        )?.id || "",
      },
      update: {
        apiKey: encrypted,
        isActive: true,
        isValid: false,
      },
      create: {
        userId: user.id,
        provider: "COVALENT",
        apiKey: encrypted,
        label: "Covalent GoldRush API Key",
        isActive: true,
      },
    })

    await createAuditLog({
      userId: user.id,
      action: "TRANSACTION_CREATED",
      metadata: {
        entity: "ai_credential",
        provider: "COVALENT",
        action: "upsert",
      },
    })

    revalidatePath("/dashboard/finance/onchain")
    return { success: true }
  } catch (error: unknown) {
    console.error("Save Covalent API key error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Error al guardar la API key" }
  }
}

export async function triggerWalletSync(walletId: string) {
  try {
    const user = await requireAuth()

    const wallet = await prisma.onchainWallet.findFirst({
      where: { id: walletId, userId: user.id },
    })

    if (!wallet) {
      return { success: false, error: "Wallet no encontrada" }
    }

    const result = await syncWallet(walletId, user.id)

    if (result.success) {
      // Auto-process fiscal events for classified swaps
      const fiscalResult = await processBatchFiscalEvents(walletId)

      await createAuditLog({
        userId: user.id,
        action: "TRANSACTION_UPDATED",
        metadata: {
          entity: "onchain_sync",
          walletId,
          transactionsProcessed: result.transactionsProcessed,
          newTransactions: result.newTransactions,
          fiscalProcessed: fiscalResult.processed,
        },
      })
    }

    revalidatePath("/dashboard/finance/onchain")
    return result
  } catch (error: unknown) {
    console.error("Trigger wallet sync error:", error)
    return { success: false, transactionsProcessed: 0, newTransactions: 0, error: error instanceof Error ? error.message : "Error al sincronizar" }
  }
}

export async function reclassifyTransaction(
  transactionId: string,
  newType: string
) {
  try {
    const user = await requireAuth()

    const tx = await prisma.onchainTransaction.findFirst({
      where: {
        id: transactionId,
        wallet: { userId: user.id },
      },
    })

    if (!tx) {
      return { success: false, error: "Transacción no encontrada" }
    }

    const validTypes = [
      "SWAP",
      "LP_ADD",
      "LP_REMOVE",
      "TRANSFER_IN",
      "TRANSFER_OUT",
      "APPROVAL",
      "BRIDGE",
      "UNKNOWN",
    ]

    if (!validTypes.includes(newType)) {
      return { success: false, error: "Tipo de transacción inválido" }
    }

    await prisma.onchainTransaction.update({
      where: { id: transactionId },
      data: {
        type: newType as "SWAP" | "LP_ADD" | "LP_REMOVE" | "TRANSFER_IN" | "TRANSFER_OUT" | "APPROVAL" | "BRIDGE" | "UNKNOWN",
        status: "MANUALLY_OVERRIDDEN",
      },
    })

    await createAuditLog({
      userId: user.id,
      action: "TRANSACTION_UPDATED",
      metadata: {
        entity: "onchain_transaction",
        transactionId,
        previousType: tx.type,
        newType,
      },
    })

    revalidatePath("/dashboard/finance/onchain")
    return { success: true }
  } catch (error: unknown) {
    console.error("Reclassify transaction error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Error al reclasificar" }
  }
}

export async function recalculateWalletFiscalEvents(walletId: string) {
  try {
    const user = await requireAuth()

    const wallet = await prisma.onchainWallet.findFirst({
      where: { id: walletId, userId: user.id },
    })

    if (!wallet) {
      return { success: false, error: "Wallet no encontrada" }
    }

    const { recalculateFiscalEvents } = await import(
      "@/lib/finance/onchain/fiscal-engine"
    )
    const result = await recalculateFiscalEvents(walletId)

    await createAuditLog({
      userId: user.id,
      action: "TRANSACTION_UPDATED",
      metadata: {
        entity: "onchain_fiscal_recalculation",
        walletId,
        processed: result.processed,
        errors: result.errors,
      },
    })

    revalidatePath("/dashboard/finance/onchain")
    return { success: true, ...result }
  } catch (error: unknown) {
    console.error("Recalculate fiscal events error:", error)
    return { success: false, error: error instanceof Error ? error.message : "Error al recalcular" }
  }
}
