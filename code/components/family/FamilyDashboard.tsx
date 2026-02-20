"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import FamilyMemberList from "./FamilyMemberList"
import FamilyCalendar from "./FamilyCalendar"
import UpcomingEvents from "./UpcomingEvents"
import CalendarDetailView from "./CalendarDetailView"
import EventList from "./EventList"
import EventForm from "./EventForm"
import FamilyFAB from "./FamilyFAB"
import { deleteEvent } from "@/app/dashboard/family/actions"
import { UsersIcon, CalendarDaysIcon, CalendarIcon } from "@heroicons/react/24/outline"

interface FamilyMember {
  id: string
  name: string
  relationship: string
  birthday?: Date | null
  email?: string | null
  phone?: string | null
  notes?: string | null
}

interface Event {
  id: string
  title: string
  date: string | Date
  description?: string | null
  location?: string | null
  isRecurring: boolean
  recurrenceType?: string | null
  familyMemberId?: string | null
  familyMember?: { name: string } | null
}

interface FamilyDashboardProps {
  members: FamilyMember[]
  events: Event[]
}

type TabType = "members" | "calendar" | "events"

export default function FamilyDashboard({ members, events }: FamilyDashboardProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>("members")
  const [showEventForm, setShowEventForm] = useState(false)
  const [editingEvent, setEditingEvent] = useState<Event | null>(null)

  const handleAddMember = () => {
    router.push("/dashboard/family/new")
  }

  const handleAddEvent = () => {
    setEditingEvent(null)
    setShowEventForm(true)
  }

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event)
    setShowEventForm(true)
  }

  const handleDeleteEvent = async (eventId: string) => {
    const result = await deleteEvent(eventId)
    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || "Error al eliminar evento")
    }
  }

  const tabs: { key: TabType; label: string; icon: typeof UsersIcon }[] = [
    { key: "members", label: "Miembros", icon: UsersIcon },
    { key: "calendar", label: "Calendario", icon: CalendarIcon },
    { key: "events", label: "Eventos", icon: CalendarDaysIcon },
  ]

  // Stats
  const upcomingCount = events.filter((e) => {
    const d = new Date(e.date)
    const now = new Date()
    const monthFromNow = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate())
    return d >= now || e.isRecurring
  }).length

  return (
    <>
      {/* Stats header */}
      <div className="flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400 mb-6">
        <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full">
          {members.length} miembro{members.length !== 1 ? "s" : ""}
        </span>
        <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-full">
          {events.length} evento{events.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Top section: Upcoming Events + Mini Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Próximos Eventos</h2>
          <UpcomingEvents events={events} />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Calendario</h2>
          <FamilyCalendar events={events} compact />
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="flex gap-1 -mb-px">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
                  activeTab === tab.key
                    ? "border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === "members" && <FamilyMemberList members={members} />}
      {activeTab === "calendar" && (
        <CalendarDetailView
          events={events}
          onEditEvent={handleEditEvent}
          onDeleteEvent={handleDeleteEvent}
        />
      )}
      {activeTab === "events" && (
        <EventList
          events={events}
          onEditEvent={handleEditEvent}
          onDeleteEvent={handleDeleteEvent}
        />
      )}

      {/* FAB */}
      <FamilyFAB onAddMember={handleAddMember} onAddEvent={handleAddEvent} />

      {/* Event Form Modal */}
      {showEventForm && (
        <EventForm
          members={members.map((m) => ({ id: m.id, name: m.name }))}
          event={editingEvent || undefined}
          onClose={() => {
            setShowEventForm(false)
            setEditingEvent(null)
          }}
        />
      )}
    </>
  )
}
