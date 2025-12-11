"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  HomeIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserGroupIcon
} from "@heroicons/react/24/outline"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "Gym Training", href: "/dashboard/workouts", icon: ChartBarIcon },
  { name: "Finance", href: "/dashboard/finance", icon: CurrencyDollarIcon },
  { name: "Nutrition", href: "/dashboard/nutrition", icon: CalendarIcon },
  { name: "Family CRM", href: "/dashboard/family", icon: UserGroupIcon },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col w-64 bg-gray-900 min-h-screen">
      <div className="flex items-center justify-center h-16 bg-gray-800">
        <h1 className="text-white text-xl font-bold">Personal Dashboard</h1>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center px-4 py-3 rounded-lg transition-colors
                ${isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }
              `}
            >
              <item.icon className="h-6 w-6 mr-3" />
              <span className="font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-gray-800">
        <p className="text-gray-500 text-sm text-center">
          Personal Dashboard v1.0
        </p>
      </div>
    </div>
  )
}
