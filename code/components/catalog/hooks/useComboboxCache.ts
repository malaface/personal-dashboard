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
