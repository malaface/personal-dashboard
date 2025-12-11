"use client"

import { useState } from "react"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { ChevronDownIcon, UserCircleIcon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline"

interface HeaderProps {
  user: {
    name?: string | null
    email?: string | null
  }
}

export default function Header({ user }: HeaderProps) {
  const router = useRouter()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" })
  }

  const handleProfileClick = () => {
    setIsDropdownOpen(false)
    router.push("/dashboard/settings")
  }

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-6">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            Welcome back, {user.name || "User"}!
          </h2>
        </div>

        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
            <ChevronDownIcon className="h-5 w-5 text-gray-400" />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
              <div className="px-4 py-3 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>

              <button
                onClick={handleProfileClick}
                className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <UserCircleIcon className="h-5 w-5 mr-3 text-gray-400" />
                Profile Settings
              </button>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-200"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
