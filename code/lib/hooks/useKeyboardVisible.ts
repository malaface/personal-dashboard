"use client"

import { useState, useEffect } from "react"

export function useKeyboardVisible() {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return

    const viewport = window.visualViewport
    const handleResize = () => {
      const isKeyboard = viewport.height < window.innerHeight * 0.75
      setIsKeyboardVisible(isKeyboard)
    }

    viewport.addEventListener('resize', handleResize)
    return () => viewport.removeEventListener('resize', handleResize)
  }, [])

  return isKeyboardVisible
}
