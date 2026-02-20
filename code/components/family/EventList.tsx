"use client"

import { useState } from "react"
import { format, isPast, isFuture, isToday } from "date-fns"
import { es } from "date-fns/locale"
import { CakeIcon, CalendarDaysIcon, MapPinIcon, TrashIcon, PencilIcon, FunnelIcon } from "@heroicons/react/24/outline"

interface EventItem {
  id: string
  title: string
  date: string | Date
  description?: string | null
  location?: string | null
  isRecurring: boolean
  recurrenceType?: string | null
  familyMember?: { name: string } | null
}

interface EventListProps {
  events: EventItem[]
  onEditEvent?: (event: EventItem) => void
  onDeleteEvent?: (eventId: string) => void
}

type FilterType = "all" | "upcoming" | "past" | "recurring"

export default function EventList({ events, onEditEvent, onDeleteEvent }: EventListProps) {
  const [filter, setFilter] = useState<FilterType>("upcoming")
  const [search, setSearch] = useState("")

  const filteredEvents = events
    .filter((event) => {
      const eventDate = new Date(event.date)
      switch (filter) {
        case "upcoming":
          return isFuture(eventDate) || isToday(eventDate) || event.isRecurring
        case "past":
          return isPast(eventDate) && !event.isRecurring
        case "recurring":
          return event.isRecurring
        default:
          return true
      }
    })
    .filter((event) => {
      if (!search) return true
      const term = search.toLowerCase()
      return (
        event.title.toLowerCase().includes(term) ||
        event.familyMember?.name.toLowerCase().includes(term) ||
        event.location?.toLowerCase().includes(term)
      )
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const filters: { key: FilterType; label: string }[] = [
    { key: "upcoming", label: "Próximos" },
    { key: "all", label: "Todos" },
    { key: "recurring", label: "Recurrentes" },
    { key: "past", label: "Pasados" },
  ]

  // Group events by month
  const groupedEvents: { [key: string]: EventItem[] } = {}
  filteredEvents.forEach((event) => {
    const key = format(new Date(event.date), "MMMM yyyy", { locale: es })
    if (!groupedEvents[key]) groupedEvents[key] = []
    groupedEvents[key].push(event)
  })

  return (
    <div className="space-y-4">
      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                filter === f.key
                  ? "bg-white dark:bg-gray-600 text-purple-600 dark:text-purple-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar eventos..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Events grouped by month */}
      {Object.keys(groupedEvents).length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <CalendarDaysIcon className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No se encontraron eventos</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Intenta cambiar los filtros o crear un nuevo evento
          </p>
        </div>
      ) : (
        Object.entries(groupedEvents).map(([month, monthEvents]) => (
          <div key={month}>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2 capitalize">
              {month}
            </h3>
            <div className="space-y-2">
              {monthEvents.map((event) => {
                const isBirthday = event.title.toLowerCase().startsWith("cumpleaños")
                const Icon = isBirthday ? CakeIcon : CalendarDaysIcon
                const eventDate = new Date(event.date)
                const past = isPast(eventDate) && !event.isRecurring

                return (
                  <div
                    key={event.id}
                    className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-md transition group ${
                      past ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Date badge */}
                      <div className="text-center shrink-0 w-12">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {format(eventDate, "d")}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 uppercase">
                          {format(eventDate, "MMM", { locale: es })}
                        </div>
                      </div>

                      {/* Event info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-purple-500 shrink-0" />
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {event.title}
                          </h4>
                          {event.isRecurring && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full shrink-0">
                              {event.recurrenceType === "YEARLY" ? "Anual" : event.recurrenceType === "MONTHLY" ? "Mensual" : "Semanal"}
                            </span>
                          )}
                        </div>
                        {event.familyMember && (
                          <p className="text-xs text-purple-600 dark:text-purple-400 mt-0.5">
                            {event.familyMember.name}
                          </p>
                        )}
                        {event.location && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                            <MapPinIcon className="h-3 w-3" />
                            {event.location}
                          </p>
                        )}
                        {event.description && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-1">
                            {event.description}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        {onEditEvent && (
                          <button
                            onClick={() => onEditEvent(event)}
                            className="p-1.5 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-md transition"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                        )}
                        {onDeleteEvent && (
                          <button
                            onClick={() => {
                              if (confirm("¿Eliminar este evento?")) onDeleteEvent(event.id)
                            }}
                            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
