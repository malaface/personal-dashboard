"use client"

import { useState, useEffect } from "react"
import { CatalogType } from "@/lib/catalog/types"

interface CategorySelectorProps {
  catalogType: CatalogType
  value: string // Selected catalog item ID
  onChange: (itemId: string) => void
  parentId?: string | null // For cascading selects
  placeholder?: string
  required?: boolean
  className?: string
  disabled?: boolean
}

interface CatalogItem {
  id: string
  name: string
  icon?: string | null
  level: number
  parentId?: string | null
}

export default function CategorySelector({
  catalogType,
  value,
  onChange,
  parentId = null,
  placeholder = "Select category",
  required = false,
  className = "",
  disabled = false
}: CategorySelectorProps) {
  const [items, setItems] = useState<CatalogItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchItems() {
      setLoading(true)
      setError("")

      try {
        const params = new URLSearchParams({
          catalogType,
          format: "flat"
        })

        if (parentId !== null && parentId !== undefined && parentId !== "") {
          params.append("parentId", parentId)
        }

        const response = await fetch(`/api/catalog?${params}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch categories")
        }

        setItems(data.items || [])
      } catch (err: any) {
        console.error("Failed to fetch catalog items:", err)
        setError(err.message || "Failed to load categories")
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [catalogType, parentId])

  if (loading) {
    return (
      <select
        disabled
        className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 dark:text-gray-400 ${className}`}
      >
        <option>Cargando...</option>
      </select>
    )
  }

  if (error) {
    return (
      <div className="w-full px-3 py-2 border border-red-300 dark:border-red-700 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
        {error}
      </div>
    )
  }

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      disabled={disabled}
      className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 dark:disabled:text-gray-500 disabled:cursor-not-allowed ${className}`}
    >
      <option value="">{placeholder}</option>
      {items.map((item) => (
        <option key={item.id} value={item.id}>
          {"  ".repeat(item.level)}
          {item.icon && `${item.icon} `}
          {item.name}
        </option>
      ))}
    </select>
  )
}
