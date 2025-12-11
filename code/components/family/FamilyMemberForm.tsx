"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createFamilyMember, updateFamilyMember } from "@/app/dashboard/family/actions"

interface FamilyMemberFormProps {
  member?: {
    id: string
    name: string
    relationship: string
    birthday?: Date | null
    email?: string | null
    phone?: string | null
    notes?: string | null
  }
}

export default function FamilyMemberForm({ member }: FamilyMemberFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [name, setName] = useState(member?.name || "")
  const [relationship, setRelationship] = useState(member?.relationship || "")
  const [birthday, setBirthday] = useState(
    member?.birthday ? new Date(member.birthday).toISOString().split('T')[0] : ""
  )
  const [email, setEmail] = useState(member?.email || "")
  const [phone, setPhone] = useState(member?.phone || "")
  const [notes, setNotes] = useState(member?.notes || "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("relationship", relationship)
      if (birthday) formData.append("birthday", birthday)
      if (email) formData.append("email", email)
      if (phone) formData.append("phone", phone)
      if (notes) formData.append("notes", notes)

      const result = member
        ? await updateFamilyMember(member.id, formData)
        : await createFamilyMember(formData)

      if (result.success) {
        router.push("/dashboard/family")
        router.refresh()
      } else {
        setError(result.error || "Something went wrong")
      }
    } catch (err: any) {
      setError(err.message || "Failed to save family member")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <h3 className="text-lg font-semibold">Basic Information</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              maxLength={100}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="E.g., John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Relationship *
            </label>
            <input
              type="text"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              required
              minLength={2}
              maxLength={50}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="E.g., Father, Sister, Friend"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Birthday
            </label>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={20}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="+1 234 567 8900"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            maxLength={500}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Optional notes about this person..."
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : member ? "Update Member" : "Add Member"}
        </button>
      </div>
    </form>
  )
}
