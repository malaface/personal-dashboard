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
import { ChevronLeftIcon, ChevronRightIcon, MapPinIcon, CakeIcon, CalendarDaysIcon } from "@heroicons/react/24/outline"

interface CalendarEvent {
  id: string
  title: string
  date: string | Date
  description?: string | null
  location?: string | null
  isRecurring: boolean
  recurrenceType?: string | null
  familyMember?: { name: string } | null
}

interface CalendarDetailViewProps {
  events: CalendarEvent[]
  onEditEvent?: (event: CalendarEvent) => void
  onDeleteEvent?: (eventId: string) => void
}

export default function CalendarDetailView({ events, onEditEvent, onDeleteEvent }: CalendarDetailViewProps) {
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
      if (event.isRecurring && event.recurrenceType === "YEARLY") {
        return eventDate.getMonth() === day.getMonth() && eventDate.getDate() === day.getDate()
      }
      return isSameDay(eventDate, day)
    })
  }

  const weekDays = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

  // Events for selected day or all events this month
  const displayEvents = selectedDay
    ? getEventsForDay(selectedDay)
    : events.filter((event) => {
        const eventDate = new Date(event.date)
        if (event.isRecurring && event.recurrenceType === "YEARLY") {
          return eventDate.getMonth() === currentMonth.getMonth()
        }
        return isSameMonth(eventDate, currentMonth)
      })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: es })}
          </h3>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <ChevronRightIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.slice(0, 3)}</span>
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const dayEvents = getEventsForDay(day)
            const isCurrentMonth = isSameMonth(day, currentMonth)
            const isSelected = selectedDay && isSameDay(day, selectedDay)
            const today = isToday(day)

            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                className={`
                  relative min-h-[60px] sm:min-h-[80px] p-1 sm:p-2 rounded-lg text-left transition border
                  ${!isCurrentMonth ? "text-gray-300 dark:text-gray-600 border-transparent" : "border-gray-100 dark:border-gray-700"}
                  ${today ? "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800" : ""}
                  ${isSelected ? "ring-2 ring-purple-500 border-purple-300" : ""}
                  ${isCurrentMonth && !today && !isSelected ? "hover:bg-gray-50 dark:hover:bg-gray-750" : ""}
                `}
              >
                <span className={`text-sm ${today ? "font-bold text-purple-700 dark:text-purple-300" : ""}`}>
                  {format(day, "d")}
                </span>
                {dayEvents.length > 0 && (
                  <div className="mt-1 space-y-0.5">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className="text-[10px] sm:text-xs truncate px-1 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded"
                      >
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[10px] text-gray-400 px-1">+{dayEvents.length - 2} más</div>
                    )}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Event list sidebar */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
          {selectedDay
            ? format(selectedDay, "d 'de' MMMM, yyyy", { locale: es })
            : `Eventos de ${format(currentMonth, "MMMM", { locale: es })}`}
        </h3>

        {displayEvents.length === 0 ? (
          <div className="text-center py-8">
            <CalendarDaysIcon className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedDay ? "Sin eventos este día" : "Sin eventos este mes"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayEvents.map((event) => {
              const isBirthday = event.title.toLowerCase().startsWith("cumpleaños")
              const Icon = isBirthday ? CakeIcon : CalendarDaysIcon

              return (
                <div
                  key={event.id}
                  className="p-3 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-750 transition group"
                >
                  <div className="flex items-start gap-2">
                    <Icon className="h-4 w-4 text-purple-500 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {event.title}
                      </p>
                      {event.familyMember && (
                        <p className="text-xs text-purple-600 dark:text-purple-400">
                          {event.familyMember.name}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {format(new Date(event.date), "d MMM yyyy", { locale: es })}
                        {event.isRecurring && " · Recurrente"}
                      </p>
                      {event.location && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                          <MapPinIcon className="h-3 w-3" />
                          {event.location}
                        </p>
                      )}
                      {event.description && (
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                  </div>
                  {(onEditEvent || onDeleteEvent) && (
                    <div className="flex justify-end gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {onEditEvent && (
                        <button
                          onClick={() => onEditEvent(event)}
                          className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                        >
                          Editar
                        </button>
                      )}
                      {onDeleteEvent && (
                        <button
                          onClick={() => {
                            if (confirm("¿Eliminar este evento?")) onDeleteEvent(event.id)
                          }}
                          className="text-xs text-red-600 dark:text-red-400 hover:underline"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
