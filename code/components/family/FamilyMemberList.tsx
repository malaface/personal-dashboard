"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteFamilyMember } from "@/app/dashboard/family/actions"
import { TrashIcon, PencilIcon, EnvelopeIcon, PhoneIcon, CakeIcon } from "@heroicons/react/24/outline"

interface FamilyMember {
  id: string
  name: string
  relationship: string
  birthday?: Date | null
  email?: string | null
  phone?: string | null
  notes?: string | null
}

interface FamilyMemberListProps {
  members: FamilyMember[]
}

export default function FamilyMemberList({ members }: FamilyMemberListProps) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (memberId: string) => {
    if (!confirm("Are you sure you want to delete this family member?")) return

    setDeletingId(memberId)

    try {
      const result = await deleteFamilyMember(memberId)

      if (result.success) {
        router.refresh()
      } else {
        alert(result.error || "Failed to delete family member")
      }
    } catch (error) {
      alert("An error occurred")
    } finally {
      setDeletingId(null)
    }
  }

  if (members.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-gray-500 text-lg">No family members yet</p>
        <p className="text-gray-400 mt-2">Add your first family member to get started</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {members.map((member) => (
        <div key={member.id} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
              <p className="text-sm text-purple-600">{member.relationship}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => router.push(`/dashboard/family/${member.id}/edit`)}
                className="p-1 text-purple-600 hover:bg-purple-50 rounded-md transition"
                title="Edit member"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(member.id)}
                disabled={deletingId === member.id}
                className="p-1 text-red-600 hover:bg-red-50 rounded-md transition disabled:opacity-50"
                title="Delete member"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {member.birthday && (
              <div className="flex items-center text-sm text-gray-600">
                <CakeIcon className="h-4 w-4 mr-2 text-gray-400" />
                {new Date(member.birthday).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            )}

            {member.email && (
              <div className="flex items-center text-sm text-gray-600">
                <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                <a href={`mailto:${member.email}`} className="hover:text-purple-600">
                  {member.email}
                </a>
              </div>
            )}

            {member.phone && (
              <div className="flex items-center text-sm text-gray-600">
                <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                <a href={`tel:${member.phone}`} className="hover:text-purple-600">
                  {member.phone}
                </a>
              </div>
            )}

            {member.notes && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-sm text-gray-600 line-clamp-2">{member.notes}</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
