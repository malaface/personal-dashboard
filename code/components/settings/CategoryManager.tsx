"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import CategoryTree from "@/components/catalog/CategoryTree"
import { CatalogTreeNode } from "@/lib/catalog/types"
import { PlusIcon } from "@heroicons/react/24/outline"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

interface CategoryManagerProps {
  transactionCategories: any[]
  transactionTree: CatalogTreeNode[]
  investmentTypes: any[]
  investmentTree: CatalogTreeNode[]
  exerciseCategories?: any[]
  exerciseTree?: CatalogTreeNode[]
  equipmentTypes?: any[]
  equipmentTree?: CatalogTreeNode[]
  muscleGroups?: any[]
  muscleGroupTree?: CatalogTreeNode[]
}

type TabType = "transactions" | "investments" | "exercises" | "equipment" | "muscles"

export default function CategoryManager({
  transactionCategories,
  transactionTree,
  investmentTypes,
  investmentTree,
  exerciseCategories,
  exerciseTree,
  equipmentTypes,
  equipmentTree,
  muscleGroups,
  muscleGroupTree,
}: CategoryManagerProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TabType>("transactions")
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    color: "",
    parentId: "",
  })

  const handleEdit = (id: string) => {
    let allItems = transactionCategories
    if (activeTab === "investments") allItems = investmentTypes
    else if (activeTab === "exercises") allItems = exerciseCategories || []
    else if (activeTab === "equipment") allItems = equipmentTypes || []
    else if (activeTab === "muscles") allItems = muscleGroups || []

    const item = allItems.find((i) => i.id === id)

    if (item && !item.isSystem) {
      setEditingItem(item)
      setFormData({
        name: item.name,
        description: item.description || "",
        icon: item.icon || "",
        color: item.color || "",
        parentId: item.parentId || "",
      })
      setShowModal(true)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch(`/api/catalog/${id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        router.refresh()
      } else {
        setError(result.error || "Failed to delete category")
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete category")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      let catalogType = "transaction_category"
      if (activeTab === "investments") catalogType = "investment_type"
      else if (activeTab === "exercises") catalogType = "exercise_category"
      else if (activeTab === "equipment") catalogType = "equipment_type"
      else if (activeTab === "muscles") catalogType = "muscle_group"

      const url = editingItem ? `/api/catalog/${editingItem.id}` : "/api/catalog"
      const method = editingItem ? "PUT" : "POST"

      const body = {
        catalogType,
        name: formData.name,
        slug: formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        description: formData.description || undefined,
        icon: formData.icon || undefined,
        color: formData.color || undefined,
        parentId: formData.parentId || undefined,
      }

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      const result = await response.json()

      if (result.success) {
        setShowModal(false)
        setEditingItem(null)
        setFormData({
          name: "",
          description: "",
          icon: "",
          color: "",
          parentId: "",
        })
        router.refresh()
      } else {
        setError(result.error || "Failed to save category")
      }
    } catch (err: any) {
      setError(err.message || "Failed to save category")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNew = () => {
    setEditingItem(null)
    setFormData({
      name: "",
      description: "",
      icon: "",
      color: "",
      parentId: "",
    })
    setShowModal(true)
    setError("")
  }

  let currentTree = transactionTree
  let currentItems = transactionCategories
  if (activeTab === "investments") {
    currentTree = investmentTree
    currentItems = investmentTypes
  } else if (activeTab === "exercises") {
    currentTree = exerciseTree || []
    currentItems = exerciseCategories || []
  } else if (activeTab === "equipment") {
    currentTree = equipmentTree || []
    currentItems = equipmentTypes || []
  } else if (activeTab === "muscles") {
    currentTree = muscleGroupTree || []
    currentItems = muscleGroups || []
  }

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("transactions")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "transactions"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Transaction Categories
          </button>
          <button
            onClick={() => setActiveTab("investments")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "investments"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Investment Types
          </button>
          {exerciseCategories && (
            <button
              onClick={() => setActiveTab("exercises")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "exercises"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Exercise Categories
            </button>
          )}
          {equipmentTypes && (
            <button
              onClick={() => setActiveTab("equipment")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "equipment"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Equipment Types
            </button>
          )}
          {muscleGroups && (
            <button
              onClick={() => setActiveTab("muscles")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "muscles"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Muscle Groups
            </button>
          )}
        </nav>
      </div>

      {/* Action Bar */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {activeTab === "transactions" && "Transaction Categories"}
            {activeTab === "investments" && "Investment Types"}
            {activeTab === "exercises" && "Exercise Categories"}
            {activeTab === "equipment" && "Equipment Types"}
            {activeTab === "muscles" && "Muscle Groups"}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            {currentItems.filter((i) => i.isSystem).length} system categories,{" "}
            {currentItems.filter((i) => !i.isSystem).length} custom categories
          </p>
        </div>
        <Button onClick={handleCreateNew}>
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Custom Category
        </Button>
      </div>

      {/* Category Tree */}
      <CategoryTree
        nodes={currentTree}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">
                {editingItem ? "Edit Category" : "Create New Category"}
              </h3>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Name *</Label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    maxLength={50}
                    placeholder="Category name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Parent Category</Label>
                  <Select
                    value={formData.parentId || "_root_"}
                    onValueChange={(value) => setFormData({ ...formData, parentId: value === "_root_" ? "" : value })}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="None (Root Level)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_root_">None (Root Level)</SelectItem>
                      {currentItems
                        .filter((item) => item.level < 2)
                        .map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {"  ".repeat(item.level)}
                            {item.icon && `${item.icon} `}
                            {item.name}
                            {item.isSystem && " (System)"}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    Maximum nesting depth is 3 levels
                  </p>
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    maxLength={200}
                    placeholder="Optional description"
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Icon (Emoji)</Label>
                    <Input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      maxLength={10}
                      placeholder="💰"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Color</Label>
                    <input
                      type="color"
                      value={formData.color || "#3B82F6"}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="mt-1 w-full h-10 px-1 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowModal(false)
                      setEditingItem(null)
                      setError("")
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : editingItem ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
