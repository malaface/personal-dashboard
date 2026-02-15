"use client"

import { useState } from "react"
import { PlusIcon, UserPlusIcon, CalendarDaysIcon, XMarkIcon } from "@heroicons/react/24/outline"

interface FamilyFABProps {
  onAddMember: () => void
  onAddEvent: () => void
}

export default function FamilyFAB({ onAddMember, onAddEvent }: FamilyFABProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col-reverse items-end gap-3">
      {/* Options (visible when open) */}
      {isOpen && (
        <>
          <button
            onClick={() => {
              onAddEvent()
              setIsOpen(false)
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition transform animate-in fade-in slide-in-from-bottom-2 duration-200"
          >
            <CalendarDaysIcon className="h-5 w-5" />
            <span className="text-sm font-medium">Nuevo Evento</span>
          </button>
          <button
            onClick={() => {
              onAddMember()
              setIsOpen(false)
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition transform animate-in fade-in slide-in-from-bottom-2 duration-150"
          >
            <UserPlusIcon className="h-5 w-5" />
            <span className="text-sm font-medium">Nuevo Miembro</span>
          </button>
        </>
      )}

      {/* Main FAB */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-full shadow-lg transition-all duration-200 ${
          isOpen
            ? "bg-gray-600 hover:bg-gray-700 rotate-45"
            : "bg-purple-600 hover:bg-purple-700"
        }`}
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6 text-white" />
        ) : (
          <PlusIcon className="h-6 w-6 text-white" />
        )}
      </button>
    </div>
  )
}
