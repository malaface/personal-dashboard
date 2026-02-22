"use client"

import { useState } from "react"
import Sidebar from "./Sidebar"
import Header from "./Header"
import MobileDrawer from "./MobileDrawer"
import MobileBottomNav from "./MobileBottomNav"
import { useKeyboardVisible } from "@/lib/hooks/useKeyboardVisible"

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
