"use client"

import { useState, useEffect, useRef } from "react"

export function useKeyboardVisible() {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)
  const focusOutTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const viewport = window.visualViewport

    const handleResize = () => {
      if (!viewport) return
      const isKeyboard = viewport.height < window.innerHeight * 0.75
      setIsKeyboardVisible(isKeyboard)
    }

    const handleScroll = () => {
      if (!viewport) return
      const isKeyboard = viewport.height < window.innerHeight * 0.75
      setIsKeyboardVisible(isKeyboard)
    }

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement
      if (focusOutTimeout.current) {
        clearTimeout(focusOutTimeout.current)
        focusOutTimeout.current = null
      }
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable
      ) {
        setIsKeyboardVisible(true)
      }
    }

    const handleFocusOut = () => {
      if (focusOutTimeout.current) {
        clearTimeout(focusOutTimeout.current)
      }
      focusOutTimeout.current = setTimeout(() => {
        setIsKeyboardVisible(false)
        focusOutTimeout.current = null
      }, 300)
    }

    if (viewport) {
      viewport.addEventListener('resize', handleResize)
      viewport.addEventListener('scroll', handleScroll)
    }
    document.addEventListener('focusin', handleFocusIn)
    document.addEventListener('focusout', handleFocusOut)

    return () => {
      if (viewport) {
        viewport.removeEventListener('resize', handleResize)
        viewport.removeEventListener('scroll', handleScroll)
      }
      document.removeEventListener('focusin', handleFocusIn)
      document.removeEventListener('focusout', handleFocusOut)
      if (focusOutTimeout.current) {
        clearTimeout(focusOutTimeout.current)
      }
    }
  }, [])

  return isKeyboardVisible
}
