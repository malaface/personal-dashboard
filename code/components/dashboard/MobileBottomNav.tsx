"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { EllipsisHorizontalIcon } from "@heroicons/react/24/outline"
import { bottomNavItems } from "@/lib/navigation"

interface MobileBottomNavProps {
  onMoreClick: () => void
}

export default function MobileBottomNav({ onMoreClick }: MobileBottomNavProps) {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 md:hidden safe-area-bottom">
      <div className="flex items-center justify-around h-16">
        {bottomNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex flex-col items-center justify-center flex-1 h-full min-w-[48px] py-2
                transition-colors
                ${isActive
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }
              `}
            >
              <item.icon className="h-6 w-6" />
              <span className="text-xs mt-1 font-medium truncate max-w-[64px]">{item.name}</span>
            </Link>
          )
        })}

        {/* More button to open drawer */}
        <button
          onClick={onMoreClick}
          className="flex flex-col items-center justify-center flex-1 h-full min-w-[48px] py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          aria-label="Ver mas opciones"
        >
          <EllipsisHorizontalIcon className="h-6 w-6" />
          <span className="text-xs mt-1 font-medium">Mas</span>
        </button>
      </div>
    </nav>
  )
}
