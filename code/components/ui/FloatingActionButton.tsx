"use client"

import Link from "next/link"
import { useKeyboardVisible } from "@/lib/hooks/useKeyboardVisible"

interface FloatingActionButtonProps {
  href: string
  title: string
  color?: string
}

export default function FloatingActionButton({ href, title, color = "bg-blue-600 hover:bg-blue-700" }: FloatingActionButtonProps) {
  const isKeyboardVisible = useKeyboardVisible()

  if (isKeyboardVisible) return null

  return (
    <Link
      href={href}
      className={`fixed bottom-24 right-4 sm:bottom-6 sm:right-6 z-50 w-14 h-14 ${color} text-white rounded-full shadow-lg flex items-center justify-center transition-colors`}
      title={title}
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    </Link>
  )
}
