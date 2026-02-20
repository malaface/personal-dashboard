"use client"

import { useState, useRef, useEffect } from 'react'
import { CatalogType } from '@/lib/catalog/types'
import { useComboboxSearch } from './hooks/useComboboxSearch'
import { ComboboxCreateDialog } from './ComboboxCreateDialog'
import { ChevronUpDownIcon, PlusIcon } from '@heroicons/react/24/outline'

interface SmartComboboxProps {
  catalogType: CatalogType
  value: string
  onChange: (value: string) => void

  // Config
  searchable?: boolean
  minSearchLength?: number
  debounceMs?: number
  parentId?: string | null
  allowCreate?: boolean

  // UI
  placeholder?: string
  emptyMessage?: string
  required?: boolean
  disabled?: boolean
  error?: string
  className?: string
}

export default function SmartCombobox({
  catalogType,
  value,
  onChange,
  searchable = true,
  minSearchLength = 2,
  debounceMs = 300,
  parentId = null,
  allowCreate = true,
  placeholder = 'Buscar o seleccionar...',
  emptyMessage = 'No se encontraron resultados',
  required = false,
  disabled = false,
  error,
  className = ''
}: SmartComboboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { query, setQuery, results, loading, clearCache } = useComboboxSearch(catalogType, {
    debounceMs,
    minLength: minSearchLength,
    parentId
  })

  // Fetch selected item details
  useEffect(() => {
    if (value) {
      fetch(`/api/catalog/${value}`)
        .then(res => res.json())
        .then(data => setSelectedItem(data.item))
        .catch(() => setSelectedItem(null))
    } else {
      setSelectedItem(null)
    }
  }, [value])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (itemId: string, itemName: string) => {
    onChange(itemId)
    setSelectedItem({ id: itemId, name: itemName })
    setIsOpen(false)
    setQuery('')
  }

  const handleCreateSuccess = (newItem: any) => {
    // Clear cache so new searches include the newly created item
    clearCache()
    handleSelect(newItem.id, newItem.name)
    setShowCreateDialog(false)
  }

  return (
    <>
      <div ref={dropdownRef} className={`relative ${className}`}>
        {/* Input */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full px-3 py-2 border rounded-md flex items-center justify-between bg-white dark:bg-gray-700 ${
            error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
          } ${disabled ? 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed' : 'hover:border-gray-400 dark:hover:border-gray-500'}`}
        >
          <span className={selectedItem ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
            {selectedItem?.name || placeholder}
          </span>
          <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
        </button>

        {/* Dropdown */}
        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
            {/* Search input */}
            {searchable && (
              <div className="p-2 border-b">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Buscar ${catalogType.replace('_', ' ')}...`}
                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            )}

            {/* Results */}
            <div className="py-1">
              {loading && (
                <div className="px-3 py-2 text-sm text-gray-500">Cargando...</div>
              )}

              {!loading && results.length === 0 && query.length >= minSearchLength && (
                <div className="px-3 py-2 text-sm text-gray-500">{emptyMessage}</div>
              )}

              {!loading && results.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.id, item.name)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white flex items-center"
                >
                  {item.icon && <span className="mr-2">{item.icon}</span>}
                  <span>{item.name}</span>
                  {item.breadcrumbs.length > 0 && (
                    <span className="ml-2 text-xs text-gray-400">
                      ({item.breadcrumbs.join(' > ')})
                    </span>
                  )}
                </button>
              ))}

              {/* Create new */}
              {allowCreate && query.length >= minSearchLength && (
                <button
                  type="button"
                  onClick={() => setShowCreateDialog(true)}
                  className="w-full px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 flex items-center border-t"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Crear "{query}"
                </button>
              )}
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>

      {/* Create Dialog */}
      {showCreateDialog && (
        <ComboboxCreateDialog
          catalogType={catalogType}
          initialName={query}
          parentId={parentId}
          onSuccess={handleCreateSuccess}
          onCancel={() => setShowCreateDialog(false)}
        />
      )}
    </>
  )
}
