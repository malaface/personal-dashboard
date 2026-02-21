"use client"

import { useState, useEffect } from "react"
import Sidebar from "./Sidebar"
import Header from "./Header"
import MobileDrawer from "./MobileDrawer"
import MobileBottomNav from "./MobileBottomNav"

function useKeyboardVisible() {
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

interface DashboardShellProps {
  user: {
    name?: string | null
    email?: string | null
  }
  children: React.ReactNode
}

export default function DashboardShell({ user, children }: DashboardShellProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const isKeyboardVisible = useKeyboardVisible()

  const openDrawer = () => setIsDrawerOpen(true)
  const closeDrawer = () => setIsDrawerOpen(false)

  return (
    <>
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile drawer */}
      <MobileDrawer isOpen={isDrawerOpen} onClose={closeDrawer} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} onMenuClick={openDrawer} />
        <main className={`flex-1 overflow-y-auto ${isKeyboardVisible ? 'pb-2' : 'pb-20'} md:pb-0`}>
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <MobileBottomNav onMoreClick={openDrawer} />
    </>
  )
}
