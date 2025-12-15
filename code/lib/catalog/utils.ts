import { CatalogItem, CatalogTreeNode, CatalogItemFlat } from "./types"

/**
 * Build tree structure from flat catalog items
 */
export function buildCatalogTree(items: CatalogItem[]): CatalogTreeNode[] {
  const itemMap = new Map<string, CatalogTreeNode>()
  const rootItems: CatalogTreeNode[] = []

  // First pass: create tree nodes
  items.forEach(item => {
    itemMap.set(item.id, {
      ...item,
      children: [],
      fullPath: [],
      depth: 0
    })
  })

  // Second pass: build hierarchy
  items.forEach(item => {
    const node = itemMap.get(item.id)!

    if (item.parentId) {
      const parent = itemMap.get(item.parentId)
      if (parent) {
        parent.children.push(node)
        node.fullPath = [...parent.fullPath, item.name]
        node.depth = parent.depth + 1
      } else {
        // Parent not found in current items, treat as root
        rootItems.push(node)
        node.fullPath = [item.name]
        node.depth = 0
      }
    } else {
      rootItems.push(node)
      node.fullPath = [item.name]
      node.depth = 0
    }
  })

  // Sort root items and children by sortOrder and name
  const sortNodes = (nodes: CatalogTreeNode[]) => {
    nodes.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder
      }
      return a.name.localeCompare(b.name)
    })
    nodes.forEach(node => {
      if (node.children.length > 0) {
        sortNodes(node.children)
      }
    })
  }

  sortNodes(rootItems)

  return rootItems
}

/**
 * Flatten tree to list (useful for selects)
 */
export function flattenCatalogTree(
  nodes: CatalogTreeNode[],
  depth = 0
): CatalogItemFlat[] {
  const result: CatalogItemFlat[] = []

  nodes.forEach(node => {
    result.push({
      ...node,
      depth,
      fullPath: node.fullPath
    })

    if (node.children.length > 0) {
      result.push(...flattenCatalogTree(node.children, depth + 1))
    }
  })

  return result
}

/**
 * Get breadcrumb path for a catalog item
 */
export function getCatalogBreadcrumb(
  item: CatalogItem,
  allItems: CatalogItem[]
): CatalogItem[] {
  const breadcrumb: CatalogItem[] = [item]
  let current = item

  while (current.parentId) {
    const parent = allItems.find(i => i.id === current.parentId)
    if (!parent) break
    breadcrumb.unshift(parent)
    current = parent
  }

  return breadcrumb
}

/**
 * Get all children IDs (recursive) of a catalog item
 */
export function getAllChildrenIds(
  parentId: string,
  allItems: CatalogItem[]
): string[] {
  const children = allItems.filter(item => item.parentId === parentId)
  const childrenIds = children.map(child => child.id)

  // Recursively get grandchildren
  children.forEach(child => {
    childrenIds.push(...getAllChildrenIds(child.id, allItems))
  })

  return childrenIds
}

/**
 * Check if an item is a descendant of another
 */
export function isDescendantOf(
  itemId: string,
  ancestorId: string,
  allItems: CatalogItem[]
): boolean {
  const item = allItems.find(i => i.id === itemId)
  if (!item || !item.parentId) return false
  if (item.parentId === ancestorId) return true

  return isDescendantOf(item.parentId, ancestorId, allItems)
}

/**
 * Format catalog item for display (with indentation)
 */
export function formatCatalogItemForDisplay(item: CatalogItemFlat): string {
  const indent = '  '.repeat(item.depth)
  const icon = item.icon ? `${item.icon} ` : ''
  return `${indent}${icon}${item.name}`
}
