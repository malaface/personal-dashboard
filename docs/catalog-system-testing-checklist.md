# Catalog System Testing Checklist (E2E Manual)

## Test Session Information
- **Date:** 2025-12-15
- **Tester:** Manual QA
- **Build Version:** Latest (post catalog-system implementation)
- **Environment:** Development (localhost:3000)

---

## 1. Database Layer Tests

### 1.1 Trigger Validation: Max Depth (3 Levels)

**Test Case:** Verify trigger prevents creating categories deeper than 3 levels

**Steps:**
```sql
-- Try to create a level 4 category (should fail)
INSERT INTO catalog_items (
  id, catalog_type, name, slug, "parentId", "isSystem", "userId"
)
SELECT
  gen_random_uuid(),
  'transaction_category',
  'Level 4 Test',
  'level-4-test',
  id,
  false,
  (SELECT id FROM users LIMIT 1)
FROM catalog_items
WHERE level = 3
LIMIT 1;
```

**Expected Result:** ❌ Error: "Cannot create catalog item: maximum depth of 3 levels exceeded"

**Actual Result:**
- [ ] PASS - Error thrown as expected
- [ ] FAIL - Category created (trigger not working)
- [ ] NOT TESTED

---

### 1.2 Trigger Validation: Circular Reference Prevention

**Test Case:** Verify trigger prevents circular references

**Steps:**
```sql
-- Try to create circular reference (Parent → Child → Parent)
-- 1. Get a parent category ID
SELECT id, name, "parentId" FROM catalog_items WHERE "parentId" IS NOT NULL LIMIT 1;

-- 2. Try to update the parent to point to its child (circular)
UPDATE catalog_items
SET "parentId" = (
  SELECT id FROM catalog_items WHERE "parentId" = 'PARENT_ID_FROM_STEP_1' LIMIT 1
)
WHERE id = 'PARENT_ID_FROM_STEP_1';
```

**Expected Result:** ❌ Error: "Circular reference detected in catalog hierarchy"

**Actual Result:**
- [ ] PASS - Error thrown as expected
- [ ] FAIL - Update succeeded (trigger not working)
- [ ] NOT TESTED

---

### 1.3 Trigger Validation: Auto-Calculate Level

**Test Case:** Verify trigger automatically calculates level based on parent

**Steps:**
```sql
-- Create a category with parent (don't specify level)
INSERT INTO catalog_items (
  id, catalog_type, name, slug, "parentId", "isSystem", "userId"
)
SELECT
  gen_random_uuid(),
  'transaction_category',
  'Auto Level Test',
  'auto-level-test',
  id,
  false,
  (SELECT id FROM users LIMIT 1)
FROM catalog_items
WHERE level = 1 AND "isSystem" = false
LIMIT 1;

-- Check the created category's level
SELECT level FROM catalog_items WHERE slug = 'auto-level-test';
```

**Expected Result:** ✅ level = 2 (parent level + 1)

**Actual Result:**
- [ ] PASS - Level auto-calculated correctly
- [ ] FAIL - Level incorrect
- [ ] NOT TESTED

---

### 1.4 RLS-Style Filtering: User Only Sees System + Own Categories

**Test Case:** Verify users only see system categories + their own

**Steps:**
```sql
-- Check catalog items for a specific user
SELECT id, name, "isSystem", "userId", level
FROM catalog_items
WHERE catalog_type = 'transaction_category'
  AND ("isSystem" = true OR "userId" = 'USER_ID_HERE')
ORDER BY level, name;
```

**Expected Result:** ✅ Returns system categories (userId=NULL) + user's categories only

**Actual Result:**
- [ ] PASS - Correct filtering
- [ ] FAIL - Shows other users' categories
- [ ] NOT TESTED

---

### 1.5 Soft Delete Validation

**Test Case:** Verify deleted categories are soft-deleted (isActive=false)

**Steps:**
```sql
-- Create a test category
INSERT INTO catalog_items (
  id, catalog_type, name, slug, "isSystem", "userId", "isActive"
)
VALUES (
  gen_random_uuid(),
  'transaction_category',
  'Soft Delete Test',
  'soft-delete-test',
  false,
  (SELECT id FROM users LIMIT 1),
  true
);

-- Soft delete it
UPDATE catalog_items SET "isActive" = false WHERE slug = 'soft-delete-test';

-- Verify it still exists but isActive = false
SELECT id, name, "isActive" FROM catalog_items WHERE slug = 'soft-delete-test';
```

**Expected Result:** ✅ Category exists with isActive = false

**Actual Result:**
- [ ] PASS - Soft delete works
- [ ] FAIL - Category hard deleted or still active
- [ ] NOT TESTED

---

## 2. Backend API Tests

### 2.1 GET /api/catalog (Flat Format)

**Test Case:** Fetch transaction categories in flat format

**Steps:**
```bash
curl "http://localhost:3000/api/catalog?catalogType=transaction_category&format=flat" \
  -H "Cookie: YOUR_SESSION_COOKIE"
```

**Expected Result:** ✅ JSON array with all system + user categories, flat structure

**Actual Result:**
- [ ] PASS - Returns correct data
- [ ] FAIL - Error or incorrect data
- [ ] NOT TESTED

---

### 2.2 GET /api/catalog (Tree Format)

**Test Case:** Fetch transaction categories in tree format

**Steps:**
```bash
curl "http://localhost:3000/api/catalog?catalogType=transaction_category&format=tree" \
  -H "Cookie: YOUR_SESSION_COOKIE"
```

**Expected Result:** ✅ JSON tree with nested children arrays

**Actual Result:**
- [ ] PASS - Returns correct tree
- [ ] FAIL - Error or incorrect structure
- [ ] NOT TESTED

---

### 2.3 GET /api/catalog (Filter by Parent)

**Test Case:** Fetch categories filtered by parentId (cascading)

**Steps:**
```bash
# Get Income ID first
INCOME_ID="ID_OF_INCOME_CATEGORY"

# Fetch children of Income
curl "http://localhost:3000/api/catalog?catalogType=transaction_category&parentId=$INCOME_ID" \
  -H "Cookie: YOUR_SESSION_COOKIE"
```

**Expected Result:** ✅ Only children of Income (Salary, Freelance, Investment Returns, etc.)

**Actual Result:**
- [ ] PASS - Returns correct children
- [ ] FAIL - Returns all categories or error
- [ ] NOT TESTED

---

### 2.4 POST /api/catalog (Create User Category)

**Test Case:** Create a new user-specific category

**Steps:**
```bash
curl -X POST "http://localhost:3000/api/catalog" \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_SESSION_COOKIE" \
  -d '{
    "catalogType": "transaction_category",
    "name": "Test Custom Category",
    "description": "Created via API test",
    "icon": "🧪",
    "color": "#FF5733",
    "parentId": "ID_OF_EXPENSE_CATEGORY"
  }'
```

**Expected Result:** ✅ 201 Created with catalogItem in response

**Actual Result:**
- [ ] PASS - Category created
- [ ] FAIL - Error or validation failed
- [ ] NOT TESTED

---

### 2.5 PUT /api/catalog/[id] (Update User Category)

**Test Case:** Update a user-owned category

**Steps:**
```bash
CATEGORY_ID="ID_OF_USER_CATEGORY"

curl -X PUT "http://localhost:3000/api/catalog/$CATEGORY_ID" \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_SESSION_COOKIE" \
  -d '{
    "name": "Updated Category Name",
    "color": "#00FF00"
  }'
```

**Expected Result:** ✅ 200 OK with updated catalogItem

**Actual Result:**
- [ ] PASS - Category updated
- [ ] FAIL - Error or unchanged
- [ ] NOT TESTED

---

### 2.6 PUT /api/catalog/[id] (Attempt to Update System Category)

**Test Case:** Verify system categories cannot be edited

**Steps:**
```bash
SYSTEM_CATEGORY_ID="ID_OF_INCOME_OR_EXPENSE"

curl -X PUT "http://localhost:3000/api/catalog/$SYSTEM_CATEGORY_ID" \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_SESSION_COOKIE" \
  -d '{
    "name": "Hacked Income"
  }'
```

**Expected Result:** ❌ 400 Bad Request - "Category not found or cannot be edited (system category)"

**Actual Result:**
- [ ] PASS - Error as expected
- [ ] FAIL - System category was edited
- [ ] NOT TESTED

---

### 2.7 DELETE /api/catalog/[id] (Delete User Category)

**Test Case:** Soft delete a user-owned category

**Steps:**
```bash
CATEGORY_ID="ID_OF_USER_CATEGORY_WITH_NO_REFERENCES"

curl -X DELETE "http://localhost:3000/api/catalog/$CATEGORY_ID" \
  -H "Cookie: YOUR_SESSION_COOKIE"
```

**Expected Result:** ✅ 200 OK, category soft deleted (isActive=false)

**Actual Result:**
- [ ] PASS - Category soft deleted
- [ ] FAIL - Error or hard deleted
- [ ] NOT TESTED

---

### 2.8 DELETE /api/catalog/[id] (Attempt to Delete Category with References)

**Test Case:** Verify categories with transactions cannot be deleted

**Steps:**
```bash
# 1. Create transaction with a category
# 2. Try to delete that category

CATEGORY_ID="ID_OF_CATEGORY_USED_IN_TRANSACTION"

curl -X DELETE "http://localhost:3000/api/catalog/$CATEGORY_ID" \
  -H "Cookie: YOUR_SESSION_COOKIE"
```

**Expected Result:** ❌ 400 Bad Request - "Cannot delete category: it is referenced by transactions, investments, budgets, or has child categories"

**Actual Result:**
- [ ] PASS - Error as expected
- [ ] FAIL - Category deleted despite references
- [ ] NOT TESTED

---

## 3. Frontend UI Tests

### 3.1 TransactionForm: Cascading Category Selection

**Test Case:** Type selector filters category options

**Steps:**
1. Navigate to `/dashboard/finance/new`
2. Select "Type" → "Income"
3. Open "Category" dropdown
4. Verify only Income categories shown (Salary, Freelance, Investment Returns, etc.)
5. Change Type to "Expense"
6. Verify Category dropdown updates to show Expense categories (Food, Transport, etc.)

**Expected Result:** ✅ Category dropdown dynamically filters based on Type selection

**Actual Result:**
- [ ] PASS - Cascading works correctly
- [ ] FAIL - Shows all categories or doesn't update
- [ ] NOT TESTED

---

### 3.2 TransactionForm: Create Transaction with Nested Category

**Test Case:** Create transaction using a 3-level category

**Steps:**
1. Navigate to `/dashboard/finance/new`
2. Select Type: "Expense"
3. Select Category: "Food → Restaurants" (level 3)
4. Enter Amount: $50.00
5. Select Date: Today
6. Submit form

**Expected Result:** ✅ Transaction created with categoryId pointing to "Restaurants"

**Actual Result:**
- [ ] PASS - Transaction created successfully
- [ ] FAIL - Error or validation failed
- [ ] NOT TESTED

---

### 3.3 TransactionList: Display Category Breadcrumb

**Test Case:** Transactions show full category path

**Steps:**
1. Navigate to `/dashboard/finance`
2. Find transaction created in 3.2
3. Verify category is displayed (should show icon + name or breadcrumb)

**Expected Result:** ✅ Shows category name (e.g., "Restaurants" or "Food → Restaurants")

**Actual Result:**
- [ ] PASS - Category displayed correctly
- [ ] FAIL - Shows ID or undefined
- [ ] NOT TESTED

---

### 3.4 InvestmentForm: Select Investment Type

**Test Case:** Create investment with CategorySelector

**Steps:**
1. Navigate to `/dashboard/investments/new`
2. Select Type from dropdown (Stocks, Crypto, Bonds, Real Estate, Other)
3. Enter Name: "Apple Stock"
4. Enter Amount: $1000
5. Select Purchase Date: Today
6. Submit form

**Expected Result:** ✅ Investment created with typeId from catalog

**Actual Result:**
- [ ] PASS - Investment created
- [ ] FAIL - Error or validation failed
- [ ] NOT TESTED

---

### 3.5 BudgetForm: Create Budget with Category

**Test Case:** Create budget using transaction category

**Steps:**
1. Navigate to `/dashboard/budgets/new`
2. Select Category: "Food" (expense category)
3. Enter Limit: $500
4. Select Month: Current month
5. Submit form

**Expected Result:** ✅ Budget created with categoryId

**Actual Result:**
- [ ] PASS - Budget created
- [ ] FAIL - Error or validation failed
- [ ] NOT TESTED

---

### 3.6 Category Manager: View System Categories (Read-Only)

**Test Case:** Verify system categories cannot be edited/deleted in UI

**Steps:**
1. Navigate to `/dashboard/settings/categories`
2. Expand "Income" category (system)
3. Verify no Edit/Delete buttons appear for system categories
4. Verify Edit/Delete buttons DO appear for user categories

**Expected Result:** ✅ System categories shown without action buttons, user categories have Edit/Delete

**Actual Result:**
- [ ] PASS - UI correctly disables system category actions
- [ ] FAIL - Edit/Delete buttons shown for system categories
- [ ] NOT TESTED

---

### 3.7 Category Manager: Create Custom Category

**Test Case:** Create a user-specific category via UI

**Steps:**
1. Navigate to `/dashboard/settings/categories`
2. Click "Add Custom Category" button
3. Fill form:
   - Name: "My Custom Expense"
   - Parent: "Expense"
   - Description: "Test category"
   - Icon: "🎯"
   - Color: Blue
4. Submit

**Expected Result:** ✅ Category created, appears in tree under "Expense"

**Actual Result:**
- [ ] PASS - Category created and visible
- [ ] FAIL - Error or not shown
- [ ] NOT TESTED

---

### 3.8 Category Manager: Edit Custom Category

**Test Case:** Edit user-owned category

**Steps:**
1. Navigate to `/dashboard/settings/categories`
2. Find user-created category from 3.7
3. Click "Edit" button
4. Change Name to "My Updated Category"
5. Change Color to Red
6. Submit

**Expected Result:** ✅ Category updated, changes reflected in tree

**Actual Result:**
- [ ] PASS - Category updated
- [ ] FAIL - Error or unchanged
- [ ] NOT TESTED

---

### 3.9 Category Manager: Delete Custom Category

**Test Case:** Delete user-owned category (no references)

**Steps:**
1. Navigate to `/dashboard/settings/categories`
2. Create a new test category (or use unused category)
3. Click "Delete" button
4. Confirm deletion
5. Verify category is removed from tree

**Expected Result:** ✅ Category soft deleted, no longer visible

**Actual Result:**
- [ ] PASS - Category deleted
- [ ] FAIL - Error or still visible
- [ ] NOT TESTED

---

### 3.10 Category Manager: Attempt to Delete Category with Transactions

**Test Case:** Verify UI prevents deleting categories in use

**Steps:**
1. Navigate to `/dashboard/settings/categories`
2. Try to delete "Food" or any category used in transactions
3. Confirm deletion

**Expected Result:** ❌ Error message: "Cannot delete category: it is referenced by transactions..."

**Actual Result:**
- [ ] PASS - Error shown, deletion prevented
- [ ] FAIL - Category deleted despite references
- [ ] NOT TESTED

---

### 3.11 Category Manager: Tab Switching

**Test Case:** Verify tab switching between transaction categories and investment types

**Steps:**
1. Navigate to `/dashboard/settings/categories`
2. Verify "Transaction Categories" tab is active by default
3. Click "Investment Types" tab
4. Verify tree updates to show investment types (Stocks, Crypto, etc.)
5. Click back to "Transaction Categories"
6. Verify tree shows transaction categories again

**Expected Result:** ✅ Tabs switch correctly, tree updates

**Actual Result:**
- [ ] PASS - Tab switching works
- [ ] FAIL - Tree doesn't update or error
- [ ] NOT TESTED

---

## 4. Data Integrity Tests

### 4.1 Transaction References CatalogItems

**Test Case:** Verify transactions point to catalog items, not strings

**Steps:**
```sql
SELECT t.id, t.amount, t.type, t.category, t."typeId", t."categoryId",
       type_cat.name AS type_name,
       cat.name AS category_name
FROM transactions t
LEFT JOIN catalog_items type_cat ON t."typeId" = type_cat.id
LEFT JOIN catalog_items cat ON t."categoryId" = cat.id
LIMIT 10;
```

**Expected Result:** ✅ typeId and categoryId are UUIDs, names resolved from catalog_items

**Actual Result:**
- [ ] PASS - Correct references
- [ ] FAIL - NULLs or invalid IDs
- [ ] NOT TESTED

---

### 4.2 Unique Constraint: User Cannot Create Duplicate Categories

**Test Case:** Verify unique constraint prevents duplicate slug for same user

**Steps:**
```sql
-- Try to create duplicate category for same user
INSERT INTO catalog_items (
  id, catalog_type, name, slug, "isSystem", "userId"
)
VALUES (
  gen_random_uuid(),
  'transaction_category',
  'Food',
  'food',
  false,
  (SELECT id FROM users LIMIT 1)
);
```

**Expected Result:** ❌ Error: "A category with this name already exists" (duplicate key violation)

**Actual Result:**
- [ ] PASS - Error thrown
- [ ] FAIL - Duplicate created
- [ ] NOT TESTED

---

## 5. Performance Tests

### 5.1 Tree Building Performance

**Test Case:** Verify tree building doesn't timeout with all categories

**Steps:**
1. Navigate to `/dashboard/settings/categories`
2. Measure page load time
3. Verify tree renders completely

**Expected Result:** ✅ Page loads in < 2 seconds, all categories visible

**Actual Result:**
- [ ] PASS - Fast load
- [ ] FAIL - Timeout or slow (> 3s)
- [ ] NOT TESTED

---

### 5.2 Cascading Select Performance

**Test Case:** Verify category dropdown loads quickly when parent changes

**Steps:**
1. Navigate to `/dashboard/finance/new`
2. Change Type from Income → Expense → Income rapidly
3. Verify Category dropdown updates without lag

**Expected Result:** ✅ Dropdown updates in < 500ms

**Actual Result:**
- [ ] PASS - Fast updates
- [ ] FAIL - Noticeable lag
- [ ] NOT TESTED

---

## 6. Edge Cases

### 6.1 Empty Parent Creates Root-Level Category

**Test Case:** Creating category without parent creates level 0

**Steps:**
```sql
INSERT INTO catalog_items (
  id, catalog_type, name, slug, "parentId", "isSystem", "userId"
)
VALUES (
  gen_random_uuid(),
  'transaction_category',
  'Root Test',
  'root-test',
  NULL,
  false,
  (SELECT id FROM users LIMIT 1)
);

SELECT level FROM catalog_items WHERE slug = 'root-test';
```

**Expected Result:** ✅ level = 0

**Actual Result:**
- [ ] PASS - Correct level
- [ ] FAIL - Incorrect level or error
- [ ] NOT TESTED

---

### 6.2 Deleting Parent Cascade Blocked

**Test Case:** Verify deleting parent with children is prevented

**Steps:**
```sql
-- Try to delete Income (which has children)
DELETE FROM catalog_items WHERE name = 'Income';
```

**Expected Result:** ❌ Error: Foreign key violation (children exist) OR soft delete only

**Actual Result:**
- [ ] PASS - Deletion prevented
- [ ] FAIL - Parent and children deleted
- [ ] NOT TESTED

---

## Summary

**Total Tests:** 31
**Passed:** ___
**Failed:** ___
**Not Tested:** ___

**Critical Failures:** (List any blocking issues)
-

**Notes:**
-

---

**Sign-off:**
- Tester: _______________
- Date: _______________
- Build Version: _______________
