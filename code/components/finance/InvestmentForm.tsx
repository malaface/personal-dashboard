"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { createInvestment, updateInvestment } from "@/app/dashboard/finance/actions"
import CategorySelector from "@/components/catalog/CategorySelector"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

interface InvestmentFormProps {
  investment?: {
    id: string
    typeId?: string | null
    // Legacy field (for backward compatibility during migration)
    type?: string | null
    name: string
    amount: number
    currentValue?: number | null
    purchaseDate: Date
    notes?: string | null
  }
  onCancel?: () => void
}

export default function InvestmentForm({ investment, onCancel }: InvestmentFormProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [typeId, setTypeId] = useState(investment?.typeId || investment?.type || "")
  const [name, setName] = useState(investment?.name || "")
  const [amount, setAmount] = useState(investment?.amount?.toString() || "")
  const [currentValue, setCurrentValue] = useState(investment?.currentValue?.toString() || "")
  const [purchaseDate, setPurchaseDate] = useState(
    investment?.purchaseDate
      ? new Date(investment.purchaseDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  )
  const [notes, setNotes] = useState(investment?.notes || "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("typeId", typeId)
      formData.append("name", name)
      formData.append("amount", amount)
      if (currentValue) formData.append("currentValue", currentValue)
      formData.append("purchaseDate", purchaseDate)
      if (notes) formData.append("notes", notes)

      const result = investment
        ? await updateInvestment(investment.id, formData)
        : await createInvestment(formData)

      if (result.success) {
        router.push("/dashboard/investments")
        router.refresh()
      } else {
        setError(result.error || "Something went wrong")
      }
    } catch (err: any) {
      setError(err.message || "Failed to save investment")
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
        <h3 className="text-lg font-semibold">Investment Details</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Type *</Label>
            <CategorySelector
              catalogType="investment_type"
              value={typeId}
              onChange={(id) => setTypeId(id)}
              placeholder="Select investment type"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Select the type of investment (Stocks, Crypto, Bonds, etc.)
            </p>
          </div>

          <div>
            <Label>Name *</Label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={100}
              className="mt-1"
              placeholder="e.g., Apple Stock, Bitcoin, etc."
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Initial Amount *</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0"
              step="0.01"
              className="mt-1"
              placeholder="0.00"
            />
            <p className="text-xs text-gray-500 mt-1">
              Amount invested initially
            </p>
          </div>

          <div>
            <Label>Current Value</Label>
            <Input
              type="number"
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
              min="0"
              step="0.01"
              className="mt-1"
              placeholder="0.00"
            />
            <p className="text-xs text-gray-500 mt-1">
              Current market value (optional)
            </p>
          </div>
        </div>

        <div>
          <Label>Purchase Date *</Label>
          <Input
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label>Notes</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            maxLength={500}
            className="mt-1"
            placeholder="Optional notes about this investment..."
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : investment ? "Update Investment" : "Create Investment"}
        </Button>
      </div>
    </form>
  )
}
