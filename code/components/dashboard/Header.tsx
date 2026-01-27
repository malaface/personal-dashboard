"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronDownIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon
} from "@heroicons/react/24/outline"
import { handleLogout } from "@/app/dashboard/actions"

interface HeaderProps {
  user: {
    name?: string | null
    email?: string | null
  }
  onMenuClick?: () => void
}

export default function Header({ user, onMenuClick }: HeaderProps) {
  const router = useRouter()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleSignOut = async () => {
    await handleLogout()
  }

  const handleProfileClick = () => {
    setIsDropdownOpen(false)
    router.push("/dashboard/settings")
  }

  return (
    <header
      className={`
        sticky top-0 z-40
        bg-white dark:bg-gray-800
        border-b border-gray-200 dark:border-gray-700
        transition-shadow duration-200
        ${isScrolled ? "shadow-md" : ""}
      `}
    >
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Welcome message - truncated on mobile */}
        <div className="flex-1 min-w-0 mr-4">
          <h2 className="text-lg md:text-2xl font-semibold text-gray-800 dark:text-white truncate">
            <span className="hidden sm:inline">Bienvenido de nuevo, </span>
            <span className="sm:hidden">Hola, </span>
            {user.name || "Usuario"}
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          {/* User dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 md:space-x-3 px-2 md:px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{user.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
              </div>
              <ChevronDownIcon className="h-5 w-5 text-gray-400" />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-10">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                </div>

                <button
                  onClick={handleProfileClick}
                  className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <UserCircleIcon className="h-5 w-5 mr-3 text-gray-400" />
                  Configuracion de Perfil
                </button>

                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border-t border-gray-200 dark:border-gray-700"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                  Cerrar Sesion
                </button>
              </div>
            )}
          </div>

          {/* Hamburger menu button - visible only on mobile */}
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors min-h-[48px] min-w-[48px] flex items-center justify-center"
            aria-label="Abrir menu"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>
      </div>
    </header>
  )
}
