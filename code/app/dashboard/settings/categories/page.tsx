import { requireAuth } from "@/lib/auth/utils"
import { getUserCatalogItems } from "@/lib/catalog/queries"
import { buildCatalogTree } from "@/lib/catalog/utils"
import CategoryManager from "@/components/settings/CategoryManager"

export default async function CategoriesSettingsPage() {
  const user = await requireAuth()

  // Fetch all catalog items for all types
  const [
    transactionCategories,
    investmentTypes,
    exerciseCategories,
    equipmentTypes,
    muscleGroups,
  ] = await Promise.all([
    getUserCatalogItems(user.id, "transaction_category"),
    getUserCatalogItems(user.id, "investment_type"),
    getUserCatalogItems(user.id, "exercise_category"),
    getUserCatalogItems(user.id, "equipment_type"),
    getUserCatalogItems(user.id, "muscle_group"),
  ])

  // Build tree structures
  const transactionTree = buildCatalogTree(transactionCategories)
  const investmentTree = buildCatalogTree(investmentTypes)
  const exerciseTree = buildCatalogTree(exerciseCategories)
  const equipmentTree = buildCatalogTree(equipmentTypes)
  const muscleGroupTree = buildCatalogTree(muscleGroups)

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
          <p className="text-gray-600 mt-2">
            Manage categories across all modules. System categories cannot be edited or deleted.
          </p>
        </div>

        <CategoryManager
          transactionCategories={transactionCategories}
          transactionTree={transactionTree}
          investmentTypes={investmentTypes}
          investmentTree={investmentTree}
          exerciseCategories={exerciseCategories}
          exerciseTree={exerciseTree}
          equipmentTypes={equipmentTypes}
          equipmentTree={equipmentTree}
          muscleGroups={muscleGroups}
          muscleGroupTree={muscleGroupTree}
        />
      </div>
    </div>
  )
}
