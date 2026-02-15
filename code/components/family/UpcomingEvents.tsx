"use client"

import { formatDistanceToNow, differenceInDays, isToday, isTomorrow } from "date-fns"
import { es } from "date-fns/locale"
import { CakeIcon, CalendarDaysIcon, MapPinIcon } from "@heroicons/react/24/outline"

interface UpcomingEvent {
  id: string
  title: string
  date: string | Date
  description?: string | null
  location?: string | null
  isRecurring: boolean
  recurrenceType?: string | null
  familyMember?: { name: string } | null
}

interface UpcomingEventsProps {
  events: UpcomingEvent[]
}

function getNextOccurrence(date: Date, recurrenceType: string | null | undefined): Date {
  if (recurrenceType !== "YEARLY") return date
  const now = new Date()
  const next = new Date(now.getFullYear(), date.getMonth(), date.getDate())
  if (next < now) {
    next.setFullYear(now.getFullYear() + 1)
  }
  return next
}

function getUrgencyColor(daysUntil: number): string {
  if (daysUntil <= 0) return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
  if (daysUntil <= 7) return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
  return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
}

function getRelativeDate(date: Date): string {
  if (isToday(date)) return "Hoy"
  if (isTomorrow(date)) return "Mañana"
  const days = differenceInDays(date, new Date())
  if (days < 0) return "Pasado"
  if (days <= 7) return `En ${days} días`
  return formatDistanceToNow(date, { addSuffix: true, locale: es })
}

function isBirthdayEvent(title: string): boolean {
  return title.toLowerCase().startsWith("cumpleaños")
}

export default function UpcomingEvents({ events }: UpcomingEventsProps) {
  const processedEvents = events
    .map((event) => {
      const eventDate = new Date(event.date)
      const displayDate = event.isRecurring
        ? getNextOccurrence(eventDate, event.recurrenceType)
        : eventDate
      const daysUntil = differenceInDays(displayDate, new Date())
      return { ...event, displayDate, daysUntil }
    })
    .filter((e) => e.daysUntil >= 0)
    .sort((a, b) => a.daysUntil - b.daysUntil)
    .slice(0, 3)

  if (processedEvents.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
        <CalendarDaysIcon className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
        <p className="text-sm text-gray-500 dark:text-gray-400">No hay eventos próximos</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {processedEvents.map((event) => {
        const isBirthday = isBirthdayEvent(event.title)
        const Icon = isBirthday ? CakeIcon : CalendarDaysIcon

        return (
          <div
            key={event.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-md transition"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg shrink-0">
                <Icon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {event.title}
                  </h4>
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${getUrgencyColor(event.daysUntil)}`}
                  >
                    {getRelativeDate(event.displayDate)}
                  </span>
                </div>
                {event.familyMember && (
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-0.5">
                    {event.familyMember.name}
                  </p>
                )}
                {event.location && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                    <MapPinIcon className="h-3 w-3" />
                    {event.location}
                  </p>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
