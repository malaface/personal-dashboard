"use client"

import { useState } from "react"

interface CatalogTreeNode {
  id: string
  name: string
  icon?: string | null
  color?: string | null
  isSystem: boolean
  children: CatalogTreeNode[]
}

interface CategoryTreeProps {
  nodes: CatalogTreeNode[]
  readonly?: boolean
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  className?: string
}

function TreeNode({
  node,
  readonly = false,
  onEdit,
  onDelete,
  depth = 0
}: {
  node: CatalogTreeNode
  readonly?: boolean
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
  depth?: number
}) {
  const [isExpanded, setIsExpanded] = useState(true)
  const hasChildren = node.children.length > 0

  return (
    <div className="select-none">
      <div
        className="flex items-center space-x-2 py-1 px-2 hover:bg-gray-50 rounded"
        style={{ paddingLeft: `${depth * 1.5}rem` }}
      >
        {/* Expand/Collapse button */}
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-4 h-4 flex items-center justify-center text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? "▼" : "▶"}
          </button>
        )}
        {!hasChildren && <span className="w-4" />}

        {/* Icon */}
        {node.icon && (
          <span className="text-lg">{node.icon}</span>
        )}

        {/* Name */}
        <span
          className="flex-1 font-medium"
          style={node.color ? { color: node.color } : undefined}
        >
          {node.name}
        </span>

        {/* System badge */}
        {node.isSystem && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
            System
          </span>
        )}

        {/* Action buttons (only for user categories) */}
        {!readonly && !node.isSystem && (
          <div className="flex items-center space-x-1">
            {onEdit && (
              <button
                onClick={() => onEdit(node.id)}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(node.id)}
                className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              readonly={readonly}
              onEdit={onEdit}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function CategoryTree({
  nodes,
  readonly = false,
  onEdit,
  onDelete,
  className = ""
}: CategoryTreeProps) {
  if (nodes.length === 0) {
    return (
      <div className={`text-center text-gray-500 py-8 ${className}`}>
        No categories found
      </div>
    )
  }

  return (
    <div className={`border border-gray-200 rounded-md p-2 ${className}`}>
      {nodes.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          readonly={readonly}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
