"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/db/prisma"
import { requireAuth } from "@/lib/auth/utils"
import { isCatalogItemDeletable } from "./queries"

/**
 * Create a new user-specific catalog item
 * Only allows creating user categories (isSystem=false)
 */
export async function createCatalogItem(data: {
  catalogType: string
  name: string
  slug: string
  description?: string
  parentId?: string
  icon?: string
  color?: string
  sortOrder?: number
}) {
  try {
    const user = await requireAuth()

    // Generate slug from name if not provided
    const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

    // Check if slug already exists for this user + catalog type
    const existing = await prisma.catalogItem.findFirst({
      where: {
        catalogType: data.catalogType,
        slug,
        userId: user.id
      }
    })

    if (existing) {
      return { success: false, error: "A category with this name already exists" }
    }

    // Validate parent ownership (if parent exists, must be system or user's)
    if (data.parentId) {
      const parent = await prisma.catalogItem.findFirst({
        where: {
          id: data.parentId,
          OR: [
            { isSystem: true, userId: null },
            { isSystem: false, userId: user.id }
          ]
        }
      })

      if (!parent) {
        return { success: false, error: "Invalid parent category" }
      }

      if (parent.level >= 3) {
        return { success: false, error: "Maximum nesting depth (3 levels) exceeded" }
      }
    }

    const catalogItem = await prisma.catalogItem.create({
      data: {
        catalogType: data.catalogType,
        name: data.name,
        slug,
        description: data.description,
        parentId: data.parentId,
        icon: data.icon,
        color: data.color,
        sortOrder: data.sortOrder || 0,
        isSystem: false,
        userId: user.id,
      },
      include: {
        parent: true
      }
    })

    revalidatePath("/dashboard/settings/categories")
    revalidatePath("/dashboard/finance")

    return { success: true, catalogItem }
  } catch (error: any) {
    console.error("Create catalog item error:", error)
    return { success: false, error: error.message || "Failed to create category" }
  }
}

/**
 * Update user-specific catalog item
 * Only allows updating user's own categories (not system)
 */
export async function updateCatalogItem(
  id: string,
  data: {
    name?: string
    description?: string | null
    icon?: string | null
    color?: string | null
    sortOrder?: number
  }
) {
  try {
    const user = await requireAuth()

    // Check ownership (only user's own catalog items can be updated)
    const existing = await prisma.catalogItem.findFirst({
      where: {
        id,
        userId: user.id,
        isSystem: false
      }
    })

    if (!existing) {
      return { success: false, error: "Category not found or cannot be edited (system category)" }
    }

    // Regenerate slug if name changed
    const slug = data.name
      ? data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      : existing.slug

    // Check for duplicate slug if name changed
    if (data.name && slug !== existing.slug) {
      const duplicate = await prisma.catalogItem.findFirst({
        where: {
          catalogType: existing.catalogType,
          slug,
          userId: user.id,
          id: { not: id }
        }
      })

      if (duplicate) {
        return { success: false, error: "A category with this name already exists" }
      }
    }

    const catalogItem = await prisma.catalogItem.update({
      where: { id },
      data: {
        name: data.name || existing.name,
        slug,
        description: data.description !== undefined ? data.description : existing.description,
        icon: data.icon !== undefined ? data.icon : existing.icon,
        color: data.color !== undefined ? data.color : existing.color,
        sortOrder: data.sortOrder !== undefined ? data.sortOrder : existing.sortOrder,
      }
    })

    revalidatePath("/dashboard/settings/categories")
    revalidatePath("/dashboard/finance")

    return { success: true, catalogItem }
  } catch (error: any) {
    console.error("Update catalog item error:", error)
    return { success: false, error: error.message || "Failed to update category" }
  }
}

/**
 * Soft delete catalog item (only if not referenced by transactions/investments/budgets)
 * Only allows deleting user's own categories (not system)
 */
export async function deleteCatalogItem(id: string) {
  try {
    const user = await requireAuth()

    // Check ownership
    const catalogItem = await prisma.catalogItem.findFirst({
      where: {
        id,
        userId: user.id,
        isSystem: false
      }
    })

    if (!catalogItem) {
      return { success: false, error: "Category not found or cannot be deleted (system category)" }
    }

    // Check if deletable
    const isDeletable = await isCatalogItemDeletable(id)

    if (!isDeletable) {
      return {
        success: false,
        error: "Cannot delete category: it is referenced by transactions, investments, budgets, or has child categories"
      }
    }

    // Soft delete
    await prisma.catalogItem.update({
      where: { id },
      data: { isActive: false }
    })

    revalidatePath("/dashboard/settings/categories")
    revalidatePath("/dashboard/finance")

    return { success: true }
  } catch (error: any) {
    console.error("Delete catalog item error:", error)
    return { success: false, error: error.message || "Failed to delete category" }
  }
}

/**
 * Hard delete catalog item (dangerous - use with caution)
 * Only for cleanup purposes, not exposed in UI
 */
export async function hardDeleteCatalogItem(id: string) {
  try {
    const user = await requireAuth()

    // Check ownership
    const catalogItem = await prisma.catalogItem.findFirst({
      where: {
        id,
        userId: user.id,
        isSystem: false
      }
    })

    if (!catalogItem) {
      return { success: false, error: "Category not found or cannot be deleted (system category)" }
    }

    // Check if deletable
    const isDeletable = await isCatalogItemDeletable(id)

    if (!isDeletable) {
      return {
        success: false,
        error: "Cannot delete category: it is referenced by transactions, investments, budgets, or has child categories"
      }
    }

    // Hard delete
    await prisma.catalogItem.delete({
      where: { id }
    })

    revalidatePath("/dashboard/settings/categories")
    revalidatePath("/dashboard/finance")

    return { success: true }
  } catch (error: any) {
    console.error("Hard delete catalog item error:", error)
    return { success: false, error: error.message || "Failed to delete category" }
  }
}
