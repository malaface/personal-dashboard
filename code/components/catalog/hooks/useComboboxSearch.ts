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
