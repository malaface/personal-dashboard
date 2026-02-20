"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { XMarkIcon } from "@heroicons/react/24/outline"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { navigation } from "@/lib/navigation"

interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export default function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const pathname = usePathname()

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="right" className="w-full max-w-xs bg-gray-900 border-gray-800 p-0 flex flex-col md:hidden">
        {/* Header with close button */}
        <SheetHeader className="flex flex-row items-center justify-between h-16 px-4 bg-gray-800 space-y-0">
          <SheetTitle className="text-white text-lg font-bold">Menu</SheetTitle>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            aria-label="Cerrar menu"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </SheetHeader>

        {/* Navigation links */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={`
                  flex items-center px-4 py-3 rounded-lg transition-colors min-h-[48px]
                  ${isActive
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }
                `}
              >
                <item.icon className="h-6 w-6 mr-3 flex-shrink-0" />
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <p className="text-gray-500 text-sm text-center">
            Panel Personal v1.0
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}
