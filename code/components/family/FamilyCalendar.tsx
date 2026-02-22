"use client"

import { useState } from "react"
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns"
import { es } from "date-fns/locale"
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline"

interface CalendarEvent {
  id: string
  title: string
  date: string | Date
  familyMember?: { name: string } | null
  isRecurring: boolean
}

interface FamilyCalendarProps {
  events: CalendarEvent[]
  onDayClick?: (date: Date, dayEvents: CalendarEvent[]) => void
  compact?: boolean
}

export default function FamilyCalendar({ events, onDayClick, compact = false }: FamilyCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<Date | null>(null)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const getEventsForDay = (day: Date): CalendarEvent[] => {
    return events.filter((event) => {
      const eventDate = new Date(event.date)
      if (event.isRecurring) {
        return eventDate.getMonth() === day.getMonth() && eventDate.getDate() === day.getDate()
      }
      return isSameDay(eventDate, day)
    })
  }

  const handleDayClick = (day: Date) => {
    const dayEvents = getEventsForDay(day)
    setSelectedDay(day)
    onDayClick?.(day, dayEvents)
  }

  const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition"
        >
          <ChevronLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
          {format(currentMonth, "MMMM yyyy", { locale: es })}
        </h3>
        <button
          onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition"
        >
          <ChevronRightIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1">
            {compact ? day[0] : day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-px">
        {days.map((day) => {
          const dayEvents = getEventsForDay(day)
          const isCurrentMonth = isSameMonth(day, currentMonth)
          const isSelected = selectedDay && isSameDay(day, selectedDay)
          const today = isToday(day)

          return (
            <button
              key={day.toISOString()}
              onClick={() => handleDayClick(day)}
              className={`
                relative ${compact ? "h-8 w-8" : "h-10"} flex flex-col items-center justify-center
                rounded-md text-sm transition
                ${!isCurrentMonth ? "text-gray-300 dark:text-gray-600" : "text-gray-700 dark:text-gray-300"}
                ${today ? "bg-purple-100 dark:bg-purple-900/30 font-bold text-purple-700 dark:text-purple-300" : ""}
                ${isSelected ? "ring-2 ring-purple-500" : ""}
                ${isCurrentMonth && !today ? "hover:bg-gray-100 dark:hover:bg-gray-700" : ""}
              `}
            >
              <span className={compact ? "text-xs" : "text-sm"}>{format(day, "d")}</span>
              {dayEvents.length > 0 && (
                <div className="absolute bottom-0.5 flex gap-0.5">
                  {dayEvents.slice(0, 3).map((_, i) => (
                    <div
                      key={i}
                      className="h-1 w-1 rounded-full bg-purple-500"
                    />
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Selected day events */}
      {selectedDay && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
            {format(selectedDay, "d 'de' MMMM", { locale: es })}
          </p>
          {getEventsForDay(selectedDay).length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-gray-500">Sin eventos</p>
          ) : (
            <div className="space-y-1">
              {getEventsForDay(selectedDay).map((event) => (
                <div
                  key={event.id}
                  className="text-xs px-2 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded"
                >
                  <span className="font-medium">{event.title}</span>
                  {event.familyMember && (
                    <span className="text-purple-500 dark:text-purple-400 ml-1">
                      · {event.familyMember.name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
