"use client"

interface CatalogItem {
  id: string
  name: string
  icon?: string | null
  color?: string | null
}

interface CategoryBreadcrumbProps {
  items: CatalogItem[] // Ordered from root to leaf
  className?: string
  separator?: string
}

export default function CategoryBreadcrumb({
  items,
  className = "",
  separator = "→"
}: CategoryBreadcrumbProps) {
  if (items.length === 0) return null

  return (
    <div className={`flex items-center space-x-2 text-sm text-gray-600 ${className}`}>
      {items.map((item, index) => (
        <div key={item.id} className="flex items-center space-x-2">
          {index > 0 && (
            <span className="text-gray-400">{separator}</span>
          )}
          <span
            className="flex items-center space-x-1"
            style={item.color ? { color: item.color } : undefined}
          >
            {item.icon && <span>{item.icon}</span>}
            <span className="font-medium">{item.name}</span>
          </span>
        </div>
      ))}
    </div>
  )
}
