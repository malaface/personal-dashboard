import {
  HomeIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserGroupIcon,
  ChartPieIcon,
} from "@heroicons/react/24/outline"

export interface NavigationItem {
  name: string
  href: string
  icon: typeof HomeIcon
  showInBottomNav?: boolean
}

export const navigation: NavigationItem[] = [
  { name: "Inicio", href: "/dashboard", icon: HomeIcon, showInBottomNav: true },
  { name: "Entrenamiento", href: "/dashboard/workouts", icon: ChartBarIcon, showInBottomNav: true },
  { name: "Finanzas", href: "/dashboard/finance", icon: CurrencyDollarIcon, showInBottomNav: true },
  { name: "Nutrición", href: "/dashboard/nutrition", icon: CalendarIcon, showInBottomNav: true },
  { name: "Familia", href: "/dashboard/family", icon: UserGroupIcon, showInBottomNav: true },
  { name: "Analítica", href: "/dashboard/analytics", icon: ChartPieIcon, showInBottomNav: true },
]

export const bottomNavItems = navigation.filter(item => item.showInBottomNav)
