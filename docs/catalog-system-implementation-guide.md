# Sistema de Catálogos Mejorado - Guía de Implementación

**Proyecto**: Personal Dashboard
**Estado**: 33% completado (19/57 tareas)
**Última verificación**: 2025-12-15
**Próximo paso**: Fase 1.6 - Frontend Migración a React Hook Form (WorkoutForm.tsx)

---

## ⚠️ REGLAS CRÍTICAS - COMPATIBILIDAD

### Versiones del Proyecto

```json
Next.js: 16.0.8 (App Router)
React: 19.2.1
React Hook Form: 7.68.0
Prisma: 5.22.0
Zod: 4.1.13
TailwindCSS: 4
TypeScript: 5
```

### 🚫 ERRORES COMUNES A EVITAR

#### 1. Next.js 16 + React 19 - Client Components

**❌ NUNCA hacer**:
```typescript
// ❌ INCORRECTO - React 19 requiere explícito
import { useState } from 'react'
export default function Component() { ... }
```

**✅ SIEMPRE hacer**:
```typescript
// ✅ CORRECTO - Agregar "use client" al inicio
"use client"

import { useState } from 'react'
export default function Component() { ... }
```

**Regla**: Todo componente con hooks (`useState`, `useEffect`, `useForm`) DEBE tener `"use client"` en la línea 1.

#### 2. React Hook Form v7 - Controller Pattern

**❌ NUNCA hacer**:
```typescript
// ❌ INCORRECTO - register no funciona con componentes custom
<SmartCombobox {...register("fieldName")} />
```

**✅ SIEMPRE hacer**:
```typescript
// ✅ CORRECTO - Usar Controller para componentes custom
<Controller
  name="fieldName"
  control={form.control}
  render={({ field }) => (
    <SmartCombobox
      value={field.value}
      onChange={field.onChange}
    />
  )}
/>
```

**Regla**: `register()` solo para `<input>`, `<select>`, `<textarea>` nativos. Componentes custom usan `Controller`.

#### 3. Prisma 5.22 - Queries Correctas

**❌ NUNCA hacer**:
```typescript
// ❌ INCORRECTO - where anidado mal estructurado
where: {
  OR: { name: { contains: 'x' } }  // OR debe ser array
}
```

**✅ SIEMPRE hacer**:
```typescript
// ✅ CORRECTO - OR es siempre array
where: {
  OR: [
    { name: { contains: 'x' } },
    { slug: { contains: 'x' } }
  ]
}
```

**Regla**: `OR`, `AND`, `NOT` siempre son arrays en Prisma.

#### 4. TailwindCSS 4 - Imports

**❌ NUNCA hacer**:
```typescript
// ❌ INCORRECTO - TW4 no necesita imports
import 'tailwindcss/tailwind.css'
```

**✅ SIEMPRE hacer**:
```typescript
// ✅ CORRECTO - Sin imports, solo clases
<div className="px-3 py-2 border rounded-md">
```

**Regla**: TailwindCSS 4 se configura en `tailwind.config.ts`, NO requiere imports en componentes.

#### 5. Zod 4 - Schemas

**❌ NUNCA hacer**:
```typescript
// ❌ INCORRECTO - optional().nullable() es redundante en Zod 4
field: z.string().optional().nullable()
```

**✅ SIEMPRE hacer**:
```typescript
// ✅ CORRECTO - Usar uno u otro
field: z.string().nullable()  // null permitido
// O
field: z.string().optional()  // undefined permitido
```

**Regla**: En Zod 4, usar `.nullable()` O `.optional()`, no ambos.

#### 6. TypeScript 5 - Tipos Correctos

**❌ NUNCA hacer**:
```typescript
// ❌ INCORRECTO - any desactiva type checking
const handleChange = (value: any) => { ... }
```

**✅ SIEMPRE hacer**:
```typescript
// ✅ CORRECTO - Tipos específicos
const handleChange = (value: string) => { ... }
// O si es realmente desconocido
const handleChange = (value: unknown) => {
  if (typeof value === 'string') { ... }
}
```

**Regla**: Evitar `any`. Usar `unknown` y type guards si es necesario.

#### 7. Prisma IDs - CUIDs

**❌ NUNCA hacer**:
```typescript
// ❌ INCORRECTO - IDs son VARCHAR(30), no UUID
id: z.string().uuid()
```

**✅ SIEMPRE hacer**:
```typescript
// ✅ CORRECTO - CUIDs son alphanumeric 25-30 chars
id: z.string().cuid()
// O validación genérica
id: z.string().min(20).max(30)
```

**Regla**: Este proyecto usa CUIDs (`cuid()`), NO UUIDs.

#### 8. Next.js 16 - Server vs Client

**❌ NUNCA hacer**:
```typescript
// ❌ INCORRECTO - useRouter en Server Component
export default async function Page() {
  const router = useRouter()  // ❌ Error
}
```

**✅ SIEMPRE hacer**:
```typescript
// ✅ CORRECTO - useRouter solo en Client Components
"use client"

export default function Page() {
  const router = useRouter()  // ✅ OK
}

// O para Server Components
export default async function Page() {
  // Usar redirect() de next/navigation
  import { redirect } from 'next/navigation'
  redirect('/path')
}
```

**Regla**: `useRouter`, `useSearchParams`, `usePathname` solo en Client Components.

#### 9. Fetch en Server Components

**❌ NUNCA hacer**:
```typescript
// ❌ INCORRECTO - fetch relativo falla en server
const res = await fetch('/api/catalog')
```

**✅ SIEMPRE hacer**:
```typescript
// ✅ CORRECTO - Llamar función directamente (mejor)
import { getCatalogItems } from '@/lib/catalog/queries'
const items = await getCatalogItems(...)

// O usar URL absoluta
const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/catalog`)
```

**Regla**: En Server Components, llamar funciones directamente. Fetch es para Client Components.

#### 10. FormData en Server Actions

**❌ NUNCA hacer**:
```typescript
// ❌ INCORRECTO - FormData.get() retorna FormDataEntryValue, no string
const name = formData.get('name')
const age = parseInt(formData.get('age'))  // ❌ Type error
```

**✅ SIEMPRE hacer**:
```typescript
// ✅ CORRECTO - Convertir explícitamente
const name = formData.get('name') as string
const age = parseInt(formData.get('age') as string)
```

**Regla**: Siempre castear valores de `FormData.get()`.

---

## 📊 ESTADO ACTUAL

### ✅ Completado (19 tareas)

**Sección 1.1 - Backend API de Búsqueda** ✅
- `code/app/api/catalog/search/route.ts` - Full-text search con ranking (exact:100, starts:75, contains:50)
- `code/app/api/catalog/route.ts` - Validación duplicados (ya existía en mutations.ts)
- React Hook Form instalado (`v7.68.0`) pero NO usado
- CategorySelector existe pero es `<select>` simple, NO SmartCombobox

**Sección 1.2 - Backend Extensión de Tipos** ✅
- `code/lib/catalog/types.ts` - Extendido con 9 nuevos tipos (Nutrition: 4, Family: 5)
- Interface `ComboboxSearchResult` agregada con breadcrumbs y relevanceScore
- Validación TypeScript: 0 errores

**Sección 1.3 - Backend Seeds** ✅
- `code/prisma/seeds/catalog-items-nutrition.ts` - 26 items creados (meal_type, food_category, unit_type, nutrition_goal_type)
- `code/prisma/seeds/catalog-items-family.ts` - 21 items creados (relationship_type, event_category, reminder_category, activity_type, social_circle)
- Base de datos poblada: 169 items totales en 14 tipos de catálogo

**Sección 1.4 - Frontend Hooks** ✅
- `code/components/catalog/hooks/useComboboxSearch.ts` - Hook con debounce (300ms), caché, abort controller, y manejo de errores
- `code/components/catalog/hooks/useComboboxCache.ts` - Hook opcional con TTL (5min) para caché avanzado
- Validación TypeScript: 0 errores

**Sección 1.5 - Frontend Componentes Core** ✅
- `code/components/catalog/SmartCombobox.tsx` - Componente de combobox inteligente con búsqueda, debounce, y creación inline
- `code/components/catalog/ComboboxCreateDialog.tsx` - Dialog modal para creación rápida de items del catálogo
- Build exitoso: `npm run build` - 0 errores
- TypeScript validation: `npx tsc --noEmit` - 0 errores

**Tipos soportados ahora**: `transaction_category`, `investment_type`, `budget_category`, `exercise_category`, `equipment_type`, `muscle_group`, `meal_type`, `food_category`, `unit_type`, `nutrition_goal_type`, `relationship_type`, `event_category`, `reminder_category`, `activity_type`, `social_circle`

### ❌ Pendiente (38 tareas)

- WorkoutForm.tsx migración a React Hook Form (próximo paso)
- Fase 2 (Templates): 0/19
- Fase 3 (Analytics): 0/16

---

## 🎯 FASE 1: SMART COMBOBOX (22 tareas, 19 ✅ 3 ❌)

### 1.2 Backend - Extensión de Tipos [4/4] ✅ COMPLETADO

**Archivo**: `code/lib/catalog/types.ts`

Agregar después de línea 14:
```typescript
// Nutrition Tracker
| 'meal_type'
| 'food_category'
| 'unit_type'
| 'nutrition_goal_type'

// Family CRM
| 'relationship_type'
| 'event_category'
| 'reminder_category'
| 'activity_type'
| 'social_circle'
```

Agregar nueva interface después de `CatalogItemFlat`:
```typescript
export interface ComboboxSearchResult extends CatalogItem {
  breadcrumbs: string[]
  relevanceScore: number
  match?: 'exact' | 'starts' | 'contains'
}
```

**Validar**: `npx tsc --noEmit` sin errores ✅

---

### 1.3 Backend - Seeds [2/2] ✅ COMPLETADO

#### Archivo nuevo: `code/prisma/seeds/catalog-items-nutrition.ts`

```typescript
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function seedNutritionCatalog() {
  // meal_type
  const mainMeals = await prisma.catalogItem.create({
    data: {
      catalogType: 'meal_type',
      name: 'Main Meals',
      slug: 'main-meals',
      level: 0,
      isSystem: true,
      sortOrder: 1,
      isActive: true
    }
  })

  await prisma.catalogItem.createMany({
    data: [
      { catalogType: 'meal_type', name: 'Breakfast', slug: 'breakfast', parentId: mainMeals.id, level: 1, isSystem: true, sortOrder: 1, isActive: true },
      { catalogType: 'meal_type', name: 'Lunch', slug: 'lunch', parentId: mainMeals.id, level: 1, isSystem: true, sortOrder: 2, isActive: true },
      { catalogType: 'meal_type', name: 'Dinner', slug: 'dinner', parentId: mainMeals.id, level: 1, isSystem: true, sortOrder: 3, isActive: true },
      { catalogType: 'meal_type', name: 'Snacks', slug: 'snacks', level: 0, isSystem: true, sortOrder: 2, isActive: true },
      { catalogType: 'meal_type', name: 'Workout Nutrition', slug: 'workout-nutrition', level: 0, isSystem: true, sortOrder: 3, isActive: true }
    ]
  })

  // food_category
  const protein = await prisma.catalogItem.create({
    data: { catalogType: 'food_category', name: 'Protein Sources', slug: 'protein-sources', level: 0, isSystem: true, sortOrder: 1, isActive: true }
  })

  await prisma.catalogItem.createMany({
    data: [
      { catalogType: 'food_category', name: 'Animal Protein', slug: 'animal-protein', parentId: protein.id, level: 1, isSystem: true, sortOrder: 1, isActive: true },
      { catalogType: 'food_category', name: 'Plant Protein', slug: 'plant-protein', parentId: protein.id, level: 1, isSystem: true, sortOrder: 2, isActive: true },
      { catalogType: 'food_category', name: 'Carbohydrates', slug: 'carbohydrates', level: 0, isSystem: true, sortOrder: 2, isActive: true },
      { catalogType: 'food_category', name: 'Vegetables', slug: 'vegetables', level: 0, isSystem: true, sortOrder: 3, isActive: true },
      { catalogType: 'food_category', name: 'Fruits', slug: 'fruits', level: 0, isSystem: true, sortOrder: 4, isActive: true },
      { catalogType: 'food_category', name: 'Fats & Oils', slug: 'fats-oils', level: 0, isSystem: true, sortOrder: 5, isActive: true }
    ]
  })

  // unit_type
  const weight = await prisma.catalogItem.create({
    data: { catalogType: 'unit_type', name: 'Weight', slug: 'weight', level: 0, isSystem: true, sortOrder: 1, isActive: true }
  })

  await prisma.catalogItem.createMany({
    data: [
      { catalogType: 'unit_type', name: 'Grams (g)', slug: 'grams', parentId: weight.id, level: 1, isSystem: true, sortOrder: 1, isActive: true },
      { catalogType: 'unit_type', name: 'Ounces (oz)', slug: 'ounces', parentId: weight.id, level: 1, isSystem: true, sortOrder: 2, isActive: true },
      { catalogType: 'unit_type', name: 'Volume', slug: 'volume', level: 0, isSystem: true, sortOrder: 2, isActive: true },
      { catalogType: 'unit_type', name: 'Pieces', slug: 'pieces', level: 0, isSystem: true, sortOrder: 3, isActive: true }
    ]
  })

  // nutrition_goal_type
  await prisma.catalogItem.createMany({
    data: [
      { catalogType: 'nutrition_goal_type', name: 'Weight Loss', slug: 'weight-loss', level: 0, isSystem: true, sortOrder: 1, isActive: true },
      { catalogType: 'nutrition_goal_type', name: 'Muscle Gain', slug: 'muscle-gain', level: 0, isSystem: true, sortOrder: 2, isActive: true },
      { catalogType: 'nutrition_goal_type', name: 'Maintenance', slug: 'maintenance', level: 0, isSystem: true, sortOrder: 3, isActive: true },
      { catalogType: 'nutrition_goal_type', name: 'Performance', slug: 'performance', level: 0, isSystem: true, sortOrder: 4, isActive: true }
    ]
  })

  console.log('✅ Nutrition catalog seeded')
}

seedNutritionCatalog()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

**Ejecutar**: `npx tsx code/prisma/seeds/catalog-items-nutrition.ts`

#### Archivo nuevo: `code/prisma/seeds/catalog-items-family.ts`

```typescript
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function seedFamilyCatalog() {
  // relationship_type
  await prisma.catalogItem.createMany({
    data: [
      { catalogType: 'relationship_type', name: 'Immediate Family', slug: 'immediate-family', level: 0, isSystem: true, sortOrder: 1, isActive: true },
      { catalogType: 'relationship_type', name: 'Extended Family', slug: 'extended-family', level: 0, isSystem: true, sortOrder: 2, isActive: true },
      { catalogType: 'relationship_type', name: 'Friends', slug: 'friends', level: 0, isSystem: true, sortOrder: 3, isActive: true }
    ]
  })

  // event_category
  const celebrations = await prisma.catalogItem.create({
    data: { catalogType: 'event_category', name: 'Celebrations', slug: 'celebrations', level: 0, isSystem: true, sortOrder: 1, isActive: true }
  })

  await prisma.catalogItem.createMany({
    data: [
      { catalogType: 'event_category', name: 'Birthdays', slug: 'birthdays', parentId: celebrations.id, level: 1, isSystem: true, sortOrder: 1, isActive: true },
      { catalogType: 'event_category', name: 'Anniversaries', slug: 'anniversaries', parentId: celebrations.id, level: 1, isSystem: true, sortOrder: 2, isActive: true },
      { catalogType: 'event_category', name: 'Holidays', slug: 'holidays', level: 0, isSystem: true, sortOrder: 2, isActive: true },
      { catalogType: 'event_category', name: 'Gatherings', slug: 'gatherings', level: 0, isSystem: true, sortOrder: 3, isActive: true }
    ]
  })

  // reminder_category
  await prisma.catalogItem.createMany({
    data: [
      { catalogType: 'reminder_category', name: 'Communication', slug: 'communication', level: 0, isSystem: true, sortOrder: 1, isActive: true },
      { catalogType: 'reminder_category', name: 'Gifts', slug: 'gifts', level: 0, isSystem: true, sortOrder: 2, isActive: true },
      { catalogType: 'reminder_category', name: 'Tasks', slug: 'tasks', level: 0, isSystem: true, sortOrder: 3, isActive: true },
      { catalogType: 'reminder_category', name: 'Health & Wellness', slug: 'health-wellness', level: 0, isSystem: true, sortOrder: 4, isActive: true }
    ]
  })

  // activity_type
  await prisma.catalogItem.createMany({
    data: [
      { catalogType: 'activity_type', name: 'In-Person', slug: 'in-person', level: 0, isSystem: true, sortOrder: 1, isActive: true },
      { catalogType: 'activity_type', name: 'Phone Call', slug: 'phone-call', level: 0, isSystem: true, sortOrder: 2, isActive: true },
      { catalogType: 'activity_type', name: 'Video Call', slug: 'video-call', level: 0, isSystem: true, sortOrder: 3, isActive: true },
      { catalogType: 'activity_type', name: 'Message', slug: 'message', level: 0, isSystem: true, sortOrder: 4, isActive: true }
    ]
  })

  // social_circle
  await prisma.catalogItem.createMany({
    data: [
      { catalogType: 'social_circle', name: 'Familia Cercana', slug: 'familia-cercana', level: 0, isSystem: true, sortOrder: 1, isActive: true },
      { catalogType: 'social_circle', name: 'Familia Extendida', slug: 'familia-extendida', level: 0, isSystem: true, sortOrder: 2, isActive: true },
      { catalogType: 'social_circle', name: 'Amigos', slug: 'amigos', level: 0, isSystem: true, sortOrder: 3, isActive: true },
      { catalogType: 'social_circle', name: 'Trabajo', slug: 'trabajo', level: 0, isSystem: true, sortOrder: 4, isActive: true },
      { catalogType: 'social_circle', name: 'Networking', slug: 'networking', level: 0, isSystem: true, sortOrder: 5, isActive: true }
    ]
  })

  console.log('✅ Family catalog seeded')
}

seedFamilyCatalog()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

**Ejecutar**: `npx tsx code/prisma/seeds/catalog-items-family.ts` ✅

**Validar**:
```bash
docker exec -i dashboard-postgres psql -U dashboard_user -d dashboard -c "SELECT \"catalogType\", COUNT(*) FROM catalog_items GROUP BY \"catalogType\";"
# Resultado: 169 items totales en 14 tipos de catálogo ✅
```

---

### 1.4 Frontend - Hooks [2/2] ✅ COMPLETADO

#### Archivo nuevo: `code/components/catalog/hooks/useComboboxSearch.ts`

```typescript
import { useState, useEffect, useCallback, useRef } from 'react'
import { CatalogType, ComboboxSearchResult } from '@/lib/catalog/types'

interface UseComboboxSearchOptions {
  debounceMs?: number
  minLength?: number
  parentId?: string | null
  enableCache?: boolean
}

export function useComboboxSearch(
  catalogType: CatalogType,
  options: UseComboboxSearchOptions = {}
) {
  const {
    debounceMs = 300,
    minLength = 2,
    parentId = null,
    enableCache = true
  } = options

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ComboboxSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)

  const abortControllerRef = useRef<AbortController | null>(null)
  const cacheRef = useRef<Map<string, ComboboxSearchResult[]>>(new Map())
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  const search = useCallback(async (searchQuery: string) => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Reset if query too short
    if (searchQuery.length < minLength) {
      setResults([])
      setError(null)
      setLoading(false)
      return
    }

    // Debounce
    debounceTimerRef.current = setTimeout(async () => {
      // Check cache
      const cacheKey = `${catalogType}:${searchQuery}:${parentId || 'null'}`
      if (enableCache && cacheRef.current.has(cacheKey)) {
        setResults(cacheRef.current.get(cacheKey)!)
        setLoading(false)
        return
      }

      // Abort previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      abortControllerRef.current = new AbortController()
      setLoading(true)
      setError(null)

      try {
        const params = new URLSearchParams({
          q: searchQuery,
          catalogType,
          limit: '20'
        })
        if (parentId) params.append('parentId', parentId)

        const response = await fetch(`/api/catalog/search?${params}`, {
          signal: abortControllerRef.current.signal
        })

        if (!response.ok) {
          throw new Error('Search failed')
        }

        const data = await response.json()
        setResults(data.results || [])
        setHasMore(data.hasMore || false)

        // Cache results
        if (enableCache) {
          cacheRef.current.set(cacheKey, data.results || [])
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Search error')
          setResults([])
        }
      } finally {
        setLoading(false)
      }
    }, debounceMs)
  }, [catalogType, parentId, minLength, debounceMs, enableCache])

  useEffect(() => {
    search(query)
  }, [query, search])

  const clearCache = useCallback(() => {
    cacheRef.current.clear()
  }, [])

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    hasMore,
    clearCache
  }
}
```

#### Archivo nuevo (opcional): `code/components/catalog/hooks/useComboboxCache.ts`

```typescript
import { useRef, useCallback } from 'react'

interface CacheEntry<T> {
  data: T
  timestamp: number
}

export function useComboboxCache<T>(ttlMs: number = 300000) { // 5min default
  const cacheRef = useRef<Map<string, CacheEntry<T>>>(new Map())

  const get = useCallback((key: string): T | null => {
    const entry = cacheRef.current.get(key)
    if (!entry) return null

    const now = Date.now()
    if (now - entry.timestamp > ttlMs) {
      cacheRef.current.delete(key)
      return null
    }

    return entry.data
  }, [ttlMs])

  const set = useCallback((key: string, data: T) => {
    cacheRef.current.set(key, { data, timestamp: Date.now() })
  }, [])

  const clear = useCallback(() => {
    cacheRef.current.clear()
  }, [])

  return { get, set, clear }
}
```

---

### 1.5 Frontend - Componentes Core [3/3] ✅ COMPLETADO

#### Archivo nuevo: `code/components/catalog/SmartCombobox.tsx`

```typescript
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
  placeholder = 'Search or select...',
  emptyMessage = 'No items found',
  required = false,
  disabled = false,
  error,
  className = ''
}: SmartComboboxProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { query, setQuery, results, loading } = useComboboxSearch(catalogType, {
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
          className={`w-full px-3 py-2 border rounded-md flex items-center justify-between bg-white ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'hover:border-gray-400'}`}
        >
          <span className={selectedItem ? 'text-gray-900' : 'text-gray-500'}>
            {selectedItem?.name || placeholder}
          </span>
          <ChevronUpDownIcon className="h-5 w-5 text-gray-400" />
        </button>

        {/* Dropdown */}
        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {/* Search input */}
            {searchable && (
              <div className="p-2 border-b">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={`Search ${catalogType.replace('_', ' ')}...`}
                  className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            )}

            {/* Results */}
            <div className="py-1">
              {loading && (
                <div className="px-3 py-2 text-sm text-gray-500">Loading...</div>
              )}

              {!loading && results.length === 0 && query.length >= minSearchLength && (
                <div className="px-3 py-2 text-sm text-gray-500">{emptyMessage}</div>
              )}

              {!loading && results.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item.id, item.name)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center"
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
                  Create "{query}"
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
```

#### Archivo nuevo: `code/components/catalog/ComboboxCreateDialog.tsx`

```typescript
"use client"

import { useState } from 'react'
import { CatalogType } from '@/lib/catalog/types'
import { XMarkIcon } from '@heroicons/react/24/outline'

interface ComboboxCreateDialogProps {
  catalogType: CatalogType
  initialName: string
  parentId?: string | null
  onSuccess: (item: any) => void
  onCancel: () => void
}

export function ComboboxCreateDialog({
  catalogType,
  initialName,
  parentId,
  onSuccess,
  onCancel
}: ComboboxCreateDialogProps) {
  const [name, setName] = useState(initialName)
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/catalog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          catalogType,
          name: name.trim(),
          description: description.trim() || undefined,
          parentId: parentId || undefined
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create')
      }

      onSuccess(data.item)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Create New Item</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

**Validar**: ✅
```bash
npm run build        # ✅ Exitoso - 0 errores
npx tsc --noEmit    # ✅ Exitoso - 0 errores de tipo
```

---

### 1.6 Frontend - Migración a React Hook Form [0/5]

#### Modificar: `code/components/workouts/WorkoutForm.tsx`

**Línea 1-7** - Cambiar imports:
```typescript
"use client"

import { useForm, Controller, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { createWorkout, updateWorkout } from "@/app/dashboard/workouts/actions"
import { PlusIcon, TrashIcon } from "@heroicons/react/24/outline"
import SmartCombobox from "@/components/catalog/SmartCombobox"
```

**Agregar schema** (después de imports):
```typescript
const exerciseSchema = z.object({
  exerciseTypeId: z.string().min(1, "Exercise type required"),
  muscleGroupId: z.string().nullable().optional(),
  equipmentId: z.string().nullable().optional(),
  sets: z.number().int().min(1),
  reps: z.number().int().min(1),
  weight: z.number().min(0).nullable().optional(),
  notes: z.string().max(200).nullable().optional()
})

const workoutFormSchema = z.object({
  name: z.string().min(3).max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  duration: z.number().int().min(1).optional(),
  notes: z.string().max(500).optional(),
  exercises: z.array(exerciseSchema).min(1)
})

type WorkoutFormData = z.infer<typeof workoutFormSchema>
```

**Línea 39-60** - Reemplazar useState con useForm:
```typescript
const form = useForm<WorkoutFormData>({
  resolver: zodResolver(workoutFormSchema),
  defaultValues: {
    name: workout?.name || "",
    date: workout?.date ? new Date(workout.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    duration: workout?.duration || undefined,
    notes: workout?.notes || "",
    exercises: workout?.exercises.map(ex => ({
      exerciseTypeId: ex.exerciseTypeId || "",
      muscleGroupId: ex.muscleGroupId || null,
      equipmentId: ex.equipmentId || null,
      sets: ex.sets,
      reps: ex.reps,
      weight: ex.weight,
      notes: ex.notes,
    })) || [{ exerciseTypeId: "", muscleGroupId: null, equipmentId: null, sets: 3, reps: 10, weight: null, notes: null }]
  }
})

const { fields, append, remove } = useFieldArray({
  control: form.control,
  name: "exercises"
})
```

**Línea 215-221** - Cambiar CategorySelector a SmartCombobox con Controller:
```typescript
<Controller
  name={`exercises.${index}.exerciseTypeId`}
  control={form.control}
  render={({ field }) => (
    <SmartCombobox
      catalogType="exercise_category"
      value={field.value}
      onChange={field.onChange}
      placeholder="Select exercise (Bench Press, Squat, etc.)"
      required
      error={form.formState.errors.exercises?.[index]?.exerciseTypeId?.message}
    />
  )}
/>
```

**Repetir para muscleGroupId y equipmentId**

**Línea 76-112** - Cambiar handleSubmit:
```typescript
const onSubmit = async (data: WorkoutFormData) => {
  setLoading(true)
  setError("")

  try {
    const formData = new FormData()
    formData.append("name", data.name)
    formData.append("date", data.date)
    if (data.duration) formData.append("duration", data.duration.toString())
    if (data.notes) formData.append("notes", data.notes)
    formData.append("exercises", JSON.stringify(data.exercises))

    const result = workout
      ? await updateWorkout(workout.id, formData)
      : await createWorkout(formData)

    if (result.success) {
      router.push("/dashboard/workouts")
      router.refresh()
    } else {
      setError(result.error || "Something went wrong")
    }
  } catch (err: any) {
    setError(err.message || "Failed to save workout")
  } finally {
    setLoading(false)
  }
}
```

**Línea 115** - Cambiar form tag:
```typescript
<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
```

**Línea 62-64** - Cambiar addExercise/removeExercise:
```typescript
const addExercise = () => {
  append({ exerciseTypeId: "", muscleGroupId: null, equipmentId: null, sets: 3, reps: 10, weight: null, notes: null })
}

const removeExercise = (index: number) => {
  remove(index)
}
```

**Línea 196** - Cambiar map de exercises:
```typescript
{fields.map((field, index) => (
  <div key={field.id} className="border border-gray-200 rounded-md p-4 space-y-3">
```

**Validar**: Crear workout y verificar que se guarda correctamente

---

### 1.7 Testing Fase 1 [0/3]

**Test manual checklist**:
```bash
# 1. SmartCombobox funcional
- [ ] Buscar "bench" → muestra resultados
- [ ] Buscar "xyz" → muestra "No items found"
- [ ] Click "Create new" → modal abre
- [ ] Crear item → aparece en lista sin refresh
- [ ] Typing rápido → solo 1 request (debouncing)

# 2. React Hook Form integración
- [ ] Submit vacío → muestra errores
- [ ] Llenar form → submit exitoso
- [ ] form.reset() → limpia SmartCombobox

# 3. Keyboard navigation
- [ ] Tab → navega entre campos
- [ ] Arrow keys → navega opciones
- [ ] Enter → selecciona
- [ ] Escape → cierra dropdown

# 4. Build
npm run build  # Debe completar sin errores
npx tsc --noEmit  # 0 errors
```

---

## 🏋️ FASE 2: TEMPLATES (19 tareas, 0% completado)

### Resumen de Archivos Nuevos

**Schema**:
- Migración: `YYYYMMDDHHMMSS_add_templates_system/migration.sql`
- Modificar: `schema.prisma` (agregar 4 modelos)

**Backend**:
- `lib/validations/templates.ts` (Zod schemas)
- `lib/templates/workout-queries.ts` (6 funciones)
- `lib/templates/meal-queries.ts` (6 funciones)
- `app/api/templates/workouts/route.ts` (GET, POST)
- `app/api/templates/workouts/[id]/route.ts` (GET, PUT, DELETE)
- `app/api/templates/workouts/[id]/load/route.ts` (GET)
- `app/api/templates/meals/...` (misma estructura)

**Frontend**:
- `components/templates/WorkoutTemplateSelector.tsx`
- `components/templates/WorkoutTemplateManager.tsx`
- `components/templates/MealTemplateSelector.tsx`
- `components/templates/MealTemplateManager.tsx`
- `app/dashboard/templates/workouts/page.tsx`
- `app/dashboard/templates/meals/page.tsx`

**Seeds**:
- `prisma/seeds/templates-public.ts` (3 workout, 3 meal templates)

**Criterio de éxito**: Templates pre-cargan formularios sin errores

---

## 📊 FASE 3: ANALYTICS (16 tareas, 0% completado)

### Resumen de Archivos Nuevos

**Schema**:
- Migración: `YYYYMMDDHHMMSS_add_family_catalog_references/migration.sql`
- Migración: `YYYYMMDDHHMMSS_add_analytics_indexes/migration.sql`

**Backend**:
- `lib/analytics/queries.ts` (4 funciones de agregación)
- `app/api/analytics/portfolio-allocation/route.ts`
- `app/api/analytics/gym-volume/route.ts`
- `app/api/analytics/family-time/route.ts`
- `app/api/analytics/nutrition-macros/route.ts`

**Frontend**:
- Instalar: `npm install recharts @types/recharts`
- `components/analytics/FinanceAllocationChart.tsx` (PieChart)
- `components/analytics/GymVolumeChart.tsx` (LineChart)
- `components/analytics/FamilyTimeChart.tsx` (BarChart)
- `components/analytics/NutritionMacrosChart.tsx` (Stacked Bar)
- `components/analytics/ChartSkeleton.tsx`
- `app/dashboard/analytics/page.tsx`

**Criterio de éxito**: 4 gráficos renderizan con data precisa < 2s

---

## 📁 ARCHIVOS CRÍTICOS

### Rutas exactas para modificar

```
code/lib/catalog/types.ts                          # Extender CatalogType
code/components/workouts/WorkoutForm.tsx           # Migrar a RHF
code/app/api/catalog/search/route.ts               # Ya existe ✅
code/prisma/schema.prisma                          # Agregar templates (Fase 2)
```

### Rutas exactas para crear

```
# Fase 1
code/prisma/seeds/catalog-items-nutrition.ts
code/prisma/seeds/catalog-items-family.ts
code/components/catalog/hooks/useComboboxSearch.ts
code/components/catalog/SmartCombobox.tsx
code/components/catalog/ComboboxCreateDialog.tsx

# Fase 2
code/lib/templates/workout-queries.ts
code/lib/validations/templates.ts
code/app/api/templates/workouts/route.ts
code/components/templates/WorkoutTemplateSelector.tsx

# Fase 3
code/lib/analytics/queries.ts
code/app/api/analytics/portfolio-allocation/route.ts
code/components/analytics/FinanceAllocationChart.tsx
code/app/dashboard/analytics/page.tsx
```

---

## 🚀 COMANDOS ÚTILES

```bash
# Desarrollo
cd /home/badfaceserverlap/personal-dashboard/code
npm run dev

# Build y validación
npm run build
npx tsc --noEmit

# Migraciones
npx prisma migrate dev --name add_templates_system
npx prisma generate

# Seeds
npx tsx prisma/seeds/catalog-items-nutrition.ts
npx tsx prisma/seeds/catalog-items-family.ts

# Verificar BD
docker exec -i supabase-db psql -U postgres -c "SELECT catalogType, COUNT(*) FROM catalog_items GROUP BY catalogType;"

# Health check
cd /home/badfaceserverlap/docker/contenedores
bash shared/scripts/health-check.sh
```

---

## ✅ CRITERIOS DE ÉXITO POR FASE

**Fase 1**:
- SmartCombobox funciona en 3+ módulos
- Búsqueda < 500ms
- Creación inline sin refresh
- RHF integrado
- Keyboard navigation funcional

**Fase 2**:
- Templates CRUD completo
- Pre-fill funciona sin errores
- Macros auto-calculados (meals)

**Fase 3**:
- 4 gráficos renderizan
- Data precisa
- Performance < 2s
- Responsive

---

## 📝 NOTAS PARA AGENTES

1. **Siempre validar** con `npm run build` y `npx tsc --noEmit` después de cambios
2. **API de búsqueda ya existe** pero NO se usa actualmente (CategorySelector usa `/api/catalog`)
3. **React Hook Form ya instalado** (`v7.68.0`) - solo falta usarlo
4. **Seguir orden**: Tipos → Seeds → Hooks → Components → Forms → Testing
5. **No crear formularios Transaction/Investment/Meal hasta que WorkoutForm esté completamente migrado**

---

**Última actualización**: 2025-12-15
**Progreso actual**: 16/57 tareas (28%)
**Próximo paso**: Sección 1.5 - Crear componentes `SmartCombobox.tsx` y `ComboboxCreateDialog.tsx`
**Completado recientemente**: ✅ Fase 1.2 (Tipos) + ✅ Fase 1.3 (Seeds) + ✅ Fase 1.4 (Hooks)
