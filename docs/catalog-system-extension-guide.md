# Catalog System Extension Guide: Gym, Nutrition & Family Modules

**Version:** 1.0
**Date:** 2025-12-15
**Author:** Based on Finance Module Implementation
**Purpose:** Step-by-step guide to extend CatalogItems to Gym, Nutrition, and Family CRM modules

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Critical Rules & Lessons Learned](#critical-rules--lessons-learned)
4. [Module-Specific Catalog Designs](#module-specific-catalog-designs)
5. [Step-by-Step Implementation Process](#step-by-step-implementation-process)
6. [Common Pitfalls & Solutions](#common-pitfalls--solutions)
7. [Testing Checklist Template](#testing-checklist-template)
8. [Validation Checklist](#validation-checklist)

---

## Overview

### What You're Building

A **nested category system** for each module (Gym, Nutrition, Family) that replaces hardcoded strings with database-backed CatalogItems, enabling:

- **3-level hierarchy** for organization (e.g., Exercise Type → Muscle Group → Specific Exercise)
- **System + User categories** (system-defined + user customization)
- **Referential integrity** (no orphaned data, cascade validation)
- **Reusable components** (CategorySelector, CategoryTree, CategoryManager)

### Modules to Extend

| Module | Primary Models | Catalog Types Needed |
|--------|---------------|---------------------|
| **Gym Training** | Workouts, Exercises | `exercise_category`, `equipment_type`, `muscle_group` |
| **Nutrition** | Meals, FoodItems | `meal_type`, `food_category`, `nutrition_goal_type` |
| **Family CRM** | FamilyMembers, Events, Reminders | `relationship_type`, `event_category`, `reminder_category` |

---

## Prerequisites

### Before You Start

✅ **Read these documents first:**
1. `docs/catalog-system-implementation-report.md` - Complete Finance implementation
2. `docs/catalog-system-testing-checklist.md` - Testing patterns

✅ **Verify Finance module is working:**
```bash
# 1. Check migrations applied
npx prisma db push

# 2. Check seeds ran
docker exec -i supabase-db psql -U postgres -c "SELECT COUNT(*) FROM catalog_items WHERE \"isSystem\" = true;"
# Should return 31

# 3. Test cascading in UI
# Navigate to /dashboard/finance/new
# Verify Type → Category cascading works
```

✅ **Understand the existing schema:**
```typescript
// lib/catalog/types.ts
export type CatalogType =
  | "transaction_category"
  | "investment_type"
  | "budget_category"
  // Add new types here
```

---

## Critical Rules & Lessons Learned

### 🔴 RULE 1: Always Use Null-Safe Types

**❌ WRONG:**
```typescript
interface WorkoutFormProps {
  workout?: {
    typeId: string  // Will break when upgrading from legacy
    categoryId: string
  }
}
```

**✅ CORRECT:**
```typescript
interface WorkoutFormProps {
  workout?: {
    typeId?: string | null  // Support null for legacy data
    categoryId?: string | null
    // Keep legacy fields during transition
    type?: string | null
    category?: string | null
  }
}
```

**Why:** During migration, you'll have a transition period where both old (string) and new (UUID) fields coexist. TypeScript must accept null to prevent build errors.

---

### 🔴 RULE 2: Quote Column Names with Mixed Case in SQL

**❌ WRONG:**
```sql
CREATE OR REPLACE FUNCTION validate_catalog_item_depth()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.parentId IS NOT NULL THEN  -- Will fail: column "parentid" doesn't exist
    SELECT level INTO parent_level FROM catalog_items WHERE id = NEW.parentId;
  END IF;
END;
$$ LANGUAGE plpgsql;
```

**✅ CORRECT:**
```sql
CREATE OR REPLACE FUNCTION validate_catalog_item_depth()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW."parentId" IS NOT NULL THEN  -- Quoted for camelCase
    SELECT level INTO parent_level FROM catalog_items WHERE id = NEW."parentId";
  END IF;
END;
$$ LANGUAGE plpgsql;
```

**Why:** PostgreSQL lowercases unquoted identifiers. Prisma uses camelCase (`parentId`), so you MUST quote in raw SQL.

**Affected columns:** `parentId`, `isSystem`, `userId`, `isActive`, `createdAt`, `updatedAt`

---

### 🔴 RULE 3: Next.js 16 - Params are Promises

**❌ WRONG:**
```typescript
// app/api/catalog/[id]/route.ts
type RouteContext = {
  params: { id: string }  // Old Next.js 15 syntax
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { id } = params  // Will cause TypeScript error
}
```

**✅ CORRECT:**
```typescript
type RouteContext = {
  params: Promise<{ id: string }>  // Next.js 16 requires Promise
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const { id } = await params  // Must await
}
```

**Why:** Next.js 16 changed dynamic route params to be async. Always await params in route handlers.

---

### 🔴 RULE 4: Validate Slug Auto-Generation

**❌ WRONG:**
```typescript
// Passing slug as optional without fallback
const result = await createCatalogItem({
  ...validatedData,
  slug: validatedData.slug  // Could be undefined
})
```

**✅ CORRECT:**
```typescript
// Always generate slug if not provided
const slug = validatedData.slug || validatedData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')

const result = await createCatalogItem({
  ...validatedData,
  slug  // Never undefined
})
```

**Why:** `createCatalogItem` expects `slug: string`, not `string | undefined`. Always provide a fallback.

---

### 🔴 RULE 5: Update Audit Types for New Actions

**❌ WRONG:**
```typescript
// lib/audit/logger.ts - Forgetting to add new types
export type AuditAction =
  | "WORKOUT_CREATED"
  | "WORKOUT_UPDATED"
  | "WORKOUT_DELETED"
  // Missing EXERCISE_CREATED, etc.
```

**✅ CORRECT:**
```typescript
export type AuditAction =
  | "WORKOUT_CREATED"
  | "WORKOUT_UPDATED"
  | "WORKOUT_DELETED"
  | "EXERCISE_CREATED"      // Add all CRUD actions
  | "EXERCISE_UPDATED"
  | "EXERCISE_DELETED"
  | "MEAL_CREATED"
  // ... etc for all entities
```

**Why:** TypeScript will error if you try to log an action type that doesn't exist. Update this BEFORE writing server actions.

---

### 🔴 RULE 6: Always Read Files Before Editing

**❌ WRONG:**
```typescript
// Trying to edit without reading first
await Edit({
  file_path: "/path/to/file.tsx",
  old_string: "some text",
  new_string: "new text"
})
```

**✅ CORRECT:**
```typescript
// Read file first to see exact content
const content = await Read({ file_path: "/path/to/file.tsx" })

// Then edit with EXACT text from read output
await Edit({
  file_path: "/path/to/file.tsx",
  old_string: "exact line from read output",
  new_string: "new text"
})
```

**Why:** The Edit tool requires exact string matches. Reading first ensures you have the exact indentation and spacing.

---

### 🔴 RULE 7: Check for Existing Forms Before Creating

**❌ WRONG:**
```bash
# Blindly creating forms without checking
touch components/gym/WorkoutForm.tsx
```

**✅ CORRECT:**
```bash
# Check if form already exists
ls components/gym/WorkoutForm.tsx

# Search for any existing references
grep -r "WorkoutForm" components/
grep -r "WorkoutForm" app/

# Only create if truly doesn't exist
```

**Why:** Some forms may already exist with hardcoded categories. You need to MODIFY them, not create new ones.

---

### 🔴 RULE 8: Cascading Requires ParentId Parameter

**❌ WRONG:**
```tsx
// Without parentId, shows all categories
<CategorySelector
  catalogType="exercise_category"
  value={categoryId}
  onChange={setCategoryId}
/>
```

**✅ CORRECT:**
```tsx
// With parentId, shows only children of selected parent
<CategorySelector
  catalogType="exercise_category"
  value={categoryId}
  onChange={setCategoryId}
  parentId={muscleGroupId}  // Cascading filter
  placeholder={muscleGroupId ? "Select exercise" : "Select muscle group first"}
  disabled={!muscleGroupId}  // Disable until parent selected
/>
```

**Why:** Cascading selects require filtering by `parentId` in the API query.

---

### 🔴 RULE 9: Seed Data Structure Matters

**❌ WRONG:**
```typescript
// Flat structure loses hierarchy
const exercises = [
  { name: "Bench Press" },
  { name: "Squat" },
  { name: "Deadlift" }
]
```

**✅ CORRECT:**
```typescript
// Nested structure preserves parent-child relationships
const exercises: CatalogSeed[] = [
  {
    name: "Strength Training",  // Level 0 (root)
    slug: "strength-training",
    children: [
      {
        name: "Chest",  // Level 1
        slug: "chest",
        children: [
          { name: "Bench Press", slug: "bench-press" },  // Level 2
          { name: "Dumbbell Flyes", slug: "dumbbell-flyes" }
        ]
      },
      {
        name: "Legs",  // Level 1
        slug: "legs",
        children: [
          { name: "Squat", slug: "squat" },  // Level 2
          { name: "Leg Press", slug: "leg-press" }
        ]
      }
    ]
  }
]
```

**Why:** The seed function `seedCatalogItems()` uses recursion to build parent-child relationships from nested objects.

---

### 🔴 RULE 10: Build Before Commit

**❌ WRONG:**
```bash
git add .
git commit -m "Added gym categories"
# Oops, TypeScript errors!
```

**✅ CORRECT:**
```bash
# 1. Type check
npx tsc --noEmit

# 2. Build
npm run build

# 3. Only commit if successful
git add [specific files]
git commit -m "message"
```

**Why:** TypeScript errors may not show in dev mode. Always verify production build succeeds.

---

## Module-Specific Catalog Designs

### 1. Gym Training Module

#### Current State Analysis

**Existing Tables:**
```sql
-- workouts table
CREATE TABLE workouts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  date TIMESTAMP NOT NULL,
  duration INTEGER,  -- minutes
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- exercises table
CREATE TABLE exercises (
  id TEXT PRIMARY KEY,
  workout_id TEXT REFERENCES workouts(id),
  name TEXT NOT NULL,  -- "Bench Press", "Squat", etc. (HARDCODED)
  sets INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  weight FLOAT,
  rest_seconds INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- workout_progress table (metrics)
CREATE TABLE workout_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  exercise_name TEXT NOT NULL,  -- HARDCODED reference
  max_weight FLOAT,
  max_reps INTEGER,
  recorded_at TIMESTAMP DEFAULT NOW()
);
```

**Problems to Fix:**
- `exercises.name` is a hardcoded string
- `workout_progress.exercise_name` is a hardcoded string
- No categorization of exercises (Strength, Cardio, Flexibility, etc.)
- No equipment tracking
- No muscle group tracking

---

#### Proposed Catalog Structure

**New CatalogTypes:**
1. `exercise_category` - Strength, Cardio, Flexibility, Sports
2. `muscle_group` - Chest, Back, Legs, Shoulders, Arms, Core
3. `equipment_type` - Barbell, Dumbbell, Bodyweight, Machine, Cables

**Hierarchy Example:**

```
exercise_category (level 0)
├── Strength Training (level 1)
│   ├── Chest (level 2)
│   │   ├── Bench Press (level 3)
│   │   ├── Dumbbell Flyes (level 3)
│   │   └── Push-ups (level 3)
│   ├── Back (level 2)
│   │   ├── Deadlift (level 3)
│   │   ├── Pull-ups (level 3)
│   │   └── Rows (level 3)
│   └── Legs (level 2)
│       ├── Squat (level 3)
│       ├── Leg Press (level 3)
│       └── Lunges (level 3)
├── Cardio (level 1)
│   ├── Running (level 2)
│   ├── Cycling (level 2)
│   └── Swimming (level 2)
└── Flexibility (level 1)
    ├── Yoga (level 2)
    └── Stretching (level 2)

equipment_type (level 0)
├── Free Weights (level 1)
│   ├── Barbell (level 2)
│   ├── Dumbbell (level 2)
│   └── Kettlebell (level 2)
├── Machines (level 1)
│   ├── Cable Machine (level 2)
│   ├── Smith Machine (level 2)
│   └── Leg Press Machine (level 2)
└── Bodyweight (level 1)

muscle_group (level 0)
├── Upper Body (level 1)
│   ├── Chest (level 2)
│   ├── Back (level 2)
│   ├── Shoulders (level 2)
│   └── Arms (level 2)
│       ├── Biceps (level 3)
│       └── Triceps (level 3)
└── Lower Body (level 1)
    ├── Quads (level 2)
    ├── Hamstrings (level 2)
    ├── Glutes (level 2)
    └── Calves (level 2)
```

---

#### Schema Changes

**Add to exercises table:**
```sql
-- Migration: Add CatalogItem references
ALTER TABLE exercises
  ADD COLUMN exercise_type_id TEXT REFERENCES catalog_items(id),
  ADD COLUMN muscle_group_id TEXT REFERENCES catalog_items(id),
  ADD COLUMN equipment_id TEXT REFERENCES catalog_items(id);

-- Create indexes
CREATE INDEX idx_exercises_exercise_type ON exercises(exercise_type_id);
CREATE INDEX idx_exercises_muscle_group ON exercises(muscle_group_id);
CREATE INDEX idx_exercises_equipment ON exercises(equipment_id);
```

**Add to workout_progress table:**
```sql
-- Migration: Replace exercise_name with catalog reference
ALTER TABLE workout_progress
  ADD COLUMN exercise_id TEXT REFERENCES catalog_items(id);

-- Eventually remove exercise_name after migration
-- ALTER TABLE workout_progress DROP COLUMN exercise_name;
```

---

#### Seed Data Template

**File:** `prisma/seeds/catalog-items-gym.ts`

```typescript
import { prisma } from "@/lib/db/prisma"

interface CatalogSeed {
  name: string
  slug: string
  icon?: string
  color?: string
  description?: string
  children?: CatalogSeed[]
}

const exerciseCategories: CatalogSeed[] = [
  {
    name: "Strength Training",
    slug: "strength-training",
    icon: "💪",
    color: "#EF4444",
    description: "Resistance and weight training exercises",
    children: [
      {
        name: "Chest",
        slug: "chest",
        icon: "🏋️",
        description: "Pectoral muscle exercises",
        children: [
          { name: "Bench Press", slug: "bench-press", description: "Barbell bench press" },
          { name: "Dumbbell Flyes", slug: "dumbbell-flyes" },
          { name: "Push-ups", slug: "push-ups" },
          { name: "Incline Press", slug: "incline-press" }
        ]
      },
      {
        name: "Back",
        slug: "back",
        icon: "🦵",
        description: "Back muscle exercises",
        children: [
          { name: "Deadlift", slug: "deadlift" },
          { name: "Pull-ups", slug: "pull-ups" },
          { name: "Barbell Rows", slug: "barbell-rows" },
          { name: "Lat Pulldown", slug: "lat-pulldown" }
        ]
      },
      {
        name: "Legs",
        slug: "legs",
        icon: "🦿",
        description: "Lower body exercises",
        children: [
          { name: "Squat", slug: "squat" },
          { name: "Leg Press", slug: "leg-press" },
          { name: "Lunges", slug: "lunges" },
          { name: "Leg Curls", slug: "leg-curls" }
        ]
      },
      {
        name: "Shoulders",
        slug: "shoulders",
        icon: "💪",
        children: [
          { name: "Overhead Press", slug: "overhead-press" },
          { name: "Lateral Raises", slug: "lateral-raises" },
          { name: "Front Raises", slug: "front-raises" }
        ]
      },
      {
        name: "Arms",
        slug: "arms",
        children: [
          {
            name: "Biceps",
            slug: "biceps",
            children: [
              { name: "Barbell Curls", slug: "barbell-curls" },
              { name: "Hammer Curls", slug: "hammer-curls" }
            ]
          },
          {
            name: "Triceps",
            slug: "triceps",
            children: [
              { name: "Tricep Dips", slug: "tricep-dips" },
              { name: "Overhead Extension", slug: "overhead-extension" }
            ]
          }
        ]
      }
    ]
  },
  {
    name: "Cardio",
    slug: "cardio",
    icon: "🏃",
    color: "#10B981",
    description: "Cardiovascular exercises",
    children: [
      { name: "Running", slug: "running", icon: "🏃‍♂️" },
      { name: "Cycling", slug: "cycling", icon: "🚴" },
      { name: "Swimming", slug: "swimming", icon: "🏊" },
      { name: "Rowing", slug: "rowing" },
      { name: "Jump Rope", slug: "jump-rope" }
    ]
  },
  {
    name: "Flexibility",
    slug: "flexibility",
    icon: "🧘",
    color: "#8B5CF6",
    description: "Stretching and mobility exercises",
    children: [
      { name: "Yoga", slug: "yoga" },
      { name: "Dynamic Stretching", slug: "dynamic-stretching" },
      { name: "Static Stretching", slug: "static-stretching" },
      { name: "Foam Rolling", slug: "foam-rolling" }
    ]
  },
  {
    name: "Sports",
    slug: "sports",
    icon: "⚽",
    color: "#F59E0B",
    children: [
      { name: "Basketball", slug: "basketball" },
      { name: "Soccer", slug: "soccer" },
      { name: "Tennis", slug: "tennis" },
      { name: "Martial Arts", slug: "martial-arts" }
    ]
  }
]

const equipmentTypes: CatalogSeed[] = [
  {
    name: "Free Weights",
    slug: "free-weights",
    children: [
      { name: "Barbell", slug: "barbell" },
      { name: "Dumbbell", slug: "dumbbell" },
      { name: "Kettlebell", slug: "kettlebell" },
      { name: "EZ Bar", slug: "ez-bar" }
    ]
  },
  {
    name: "Machines",
    slug: "machines",
    children: [
      { name: "Cable Machine", slug: "cable-machine" },
      { name: "Smith Machine", slug: "smith-machine" },
      { name: "Leg Press Machine", slug: "leg-press-machine" },
      { name: "Lat Pulldown Machine", slug: "lat-pulldown-machine" }
    ]
  },
  {
    name: "Bodyweight",
    slug: "bodyweight",
    children: [
      { name: "No Equipment", slug: "no-equipment" },
      { name: "Pull-up Bar", slug: "pull-up-bar" },
      { name: "Dip Station", slug: "dip-station" }
    ]
  },
  {
    name: "Cardio Equipment",
    slug: "cardio-equipment",
    children: [
      { name: "Treadmill", slug: "treadmill" },
      { name: "Stationary Bike", slug: "stationary-bike" },
      { name: "Rowing Machine", slug: "rowing-machine" },
      { name: "Elliptical", slug: "elliptical" }
    ]
  }
]

const muscleGroups: CatalogSeed[] = [
  {
    name: "Upper Body",
    slug: "upper-body",
    children: [
      { name: "Chest", slug: "chest-muscle" },
      { name: "Back", slug: "back-muscle" },
      { name: "Shoulders", slug: "shoulders-muscle" },
      {
        name: "Arms",
        slug: "arms-muscle",
        children: [
          { name: "Biceps", slug: "biceps-muscle" },
          { name: "Triceps", slug: "triceps-muscle" },
          { name: "Forearms", slug: "forearms-muscle" }
        ]
      }
    ]
  },
  {
    name: "Lower Body",
    slug: "lower-body",
    children: [
      { name: "Quadriceps", slug: "quads" },
      { name: "Hamstrings", slug: "hamstrings" },
      { name: "Glutes", slug: "glutes" },
      { name: "Calves", slug: "calves" },
      { name: "Hip Flexors", slug: "hip-flexors" }
    ]
  },
  {
    name: "Core",
    slug: "core",
    children: [
      { name: "Abs", slug: "abs" },
      { name: "Obliques", slug: "obliques" },
      { name: "Lower Back", slug: "lower-back" }
    ]
  }
]

async function seedCatalogItems(
  catalogType: string,
  items: CatalogSeed[],
  parentId: string | null = null,
  level: number = 0
) {
  for (const item of items) {
    const catalogItem = await prisma.catalogItem.create({
      data: {
        catalogType,
        name: item.name,
        slug: item.slug,
        description: item.description,
        icon: item.icon,
        color: item.color,
        parentId,
        level,
        isSystem: true,
        userId: null,
        sortOrder: 0,
      }
    })

    if (item.children && item.children.length > 0) {
      await seedCatalogItems(catalogType, item.children, catalogItem.id, level + 1)
    }
  }
}

export async function seedGymCatalogs() {
  console.log("\n🏋️ Seeding Gym Exercise Categories...")
  await seedCatalogItems("exercise_category", exerciseCategories)

  console.log("\n🛠️ Seeding Equipment Types...")
  await seedCatalogItems("equipment_type", equipmentTypes)

  console.log("\n💪 Seeding Muscle Groups...")
  await seedCatalogItems("muscle_group", muscleGroups)

  console.log("\n✅ Gym catalogs seeded successfully!")
}

// Run if called directly
if (require.main === module) {
  seedGymCatalogs()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}
```

---

### 2. Nutrition Module

#### Current State Analysis

**Existing Tables:**
```sql
-- meals table
CREATE TABLE meals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  meal_type TEXT NOT NULL,  -- "breakfast" | "lunch" | "dinner" | "snack" (HARDCODED)
  date TIMESTAMP NOT NULL,
  calories INTEGER,
  protein FLOAT,
  carbs FLOAT,
  fats FLOAT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- food_items table
CREATE TABLE food_items (
  id TEXT PRIMARY KEY,
  meal_id TEXT REFERENCES meals(id),
  name TEXT NOT NULL,  -- "Chicken Breast", "Rice", etc. (HARDCODED)
  quantity FLOAT NOT NULL,
  unit TEXT NOT NULL,  -- "grams", "cups", etc. (HARDCODED)
  calories INTEGER,
  protein FLOAT,
  carbs FLOAT,
  fats FLOAT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- nutrition_goals table
CREATE TABLE nutrition_goals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  goal_type TEXT NOT NULL,  -- "weight_loss" | "muscle_gain" | "maintenance" (HARDCODED)
  target_calories INTEGER,
  target_protein FLOAT,
  target_carbs FLOAT,
  target_fats FLOAT,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Problems to Fix:**
- `meals.meal_type` is hardcoded enum
- `food_items.name` is hardcoded string
- `food_items.unit` is hardcoded string
- `nutrition_goals.goal_type` is hardcoded string
- No food categorization (Protein, Carbs, Vegetables, etc.)

---

#### Proposed Catalog Structure

**New CatalogTypes:**
1. `meal_type` - Breakfast, Lunch, Dinner, Snack, Pre-Workout, Post-Workout
2. `food_category` - Protein, Carbs, Vegetables, Fruits, Dairy, Fats
3. `unit_type` - grams, oz, cups, tbsp, pieces
4. `nutrition_goal_type` - Weight Loss, Muscle Gain, Maintenance, Performance

**Hierarchy Example:**

```
meal_type (level 0)
├── Main Meals (level 1)
│   ├── Breakfast (level 2)
│   ├── Lunch (level 2)
│   └── Dinner (level 2)
├── Snacks (level 1)
│   ├── Morning Snack (level 2)
│   ├── Afternoon Snack (level 2)
│   └── Evening Snack (level 2)
└── Workout Nutrition (level 1)
    ├── Pre-Workout (level 2)
    ├── Intra-Workout (level 2)
    └── Post-Workout (level 2)

food_category (level 0)
├── Protein Sources (level 1)
│   ├── Animal Protein (level 2)
│   │   ├── Chicken (level 3)
│   │   ├── Beef (level 3)
│   │   ├── Fish (level 3)
│   │   └── Eggs (level 3)
│   └── Plant Protein (level 2)
│       ├── Tofu (level 3)
│       ├── Lentils (level 3)
│       └── Beans (level 3)
├── Carbohydrates (level 1)
│   ├── Grains (level 2)
│   │   ├── Rice (level 3)
│   │   ├── Pasta (level 3)
│   │   └── Bread (level 3)
│   └── Tubers (level 2)
│       ├── Potato (level 3)
│       └── Sweet Potato (level 3)
├── Vegetables (level 1)
│   ├── Leafy Greens (level 2)
│   │   ├── Spinach (level 3)
│   │   └── Kale (level 3)
│   └── Cruciferous (level 2)
│       ├── Broccoli (level 3)
│       └── Cauliflower (level 3)
├── Fruits (level 1)
│   ├── Berries (level 2)
│   └── Citrus (level 2)
└── Healthy Fats (level 1)
    ├── Nuts (level 2)
    ├── Seeds (level 2)
    └── Oils (level 2)
```

---

#### Schema Changes

```sql
-- Migration: Add CatalogItem references
ALTER TABLE meals
  ADD COLUMN meal_type_id TEXT REFERENCES catalog_items(id);

ALTER TABLE food_items
  ADD COLUMN food_category_id TEXT REFERENCES catalog_items(id),
  ADD COLUMN unit_type_id TEXT REFERENCES catalog_items(id);

ALTER TABLE nutrition_goals
  ADD COLUMN goal_type_id TEXT REFERENCES catalog_items(id);

-- Create indexes
CREATE INDEX idx_meals_meal_type ON meals(meal_type_id);
CREATE INDEX idx_food_items_category ON food_items(food_category_id);
CREATE INDEX idx_nutrition_goals_type ON nutrition_goals(goal_type_id);
```

---

### 3. Family CRM Module

#### Current State Analysis

**Existing Tables:**
```sql
-- family_members table
CREATE TABLE family_members (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,  -- "parent" | "sibling" | "child" | "spouse" (HARDCODED)
  birthday TIMESTAMP,
  email TEXT,
  phone TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- events table
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  family_member_id TEXT REFERENCES family_members(id),
  title TEXT NOT NULL,
  event_type TEXT NOT NULL,  -- "birthday" | "anniversary" | "reunion" (HARDCODED)
  date TIMESTAMP NOT NULL,
  location TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- reminders table
CREATE TABLE reminders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  family_member_id TEXT REFERENCES family_members(id),
  title TEXT NOT NULL,
  reminder_type TEXT NOT NULL,  -- "call" | "gift" | "visit" | "task" (HARDCODED)
  due_date TIMESTAMP NOT NULL,
  priority TEXT,  -- "low" | "medium" | "high" (HARDCODED)
  is_completed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- time_logs table
CREATE TABLE time_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  family_member_id TEXT REFERENCES family_members(id),
  activity_type TEXT NOT NULL,  -- "call" | "visit" | "video_call" (HARDCODED)
  duration INTEGER,  -- minutes
  date TIMESTAMP NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

#### Proposed Catalog Structure

**New CatalogTypes:**
1. `relationship_type` - Immediate Family, Extended Family, Friends
2. `event_category` - Birthdays, Anniversaries, Holidays, Reunions
3. `reminder_category` - Communication, Gifts, Tasks, Health
4. `activity_type` - In-Person, Phone, Video Call, Message

**Hierarchy Example:**

```
relationship_type (level 0)
├── Immediate Family (level 1)
│   ├── Parents (level 2)
│   │   ├── Mother (level 3)
│   │   └── Father (level 3)
│   ├── Siblings (level 2)
│   │   ├── Brother (level 3)
│   │   └── Sister (level 3)
│   ├── Children (level 2)
│   │   ├── Son (level 3)
│   │   └── Daughter (level 3)
│   └── Spouse (level 2)
│       ├── Wife (level 3)
│       └── Husband (level 3)
├── Extended Family (level 1)
│   ├── Grandparents (level 2)
│   ├── Aunts & Uncles (level 2)
│   └── Cousins (level 2)
└── Friends (level 1)
    ├── Close Friends (level 2)
    └── Acquaintances (level 2)

event_category (level 0)
├── Celebrations (level 1)
│   ├── Birthdays (level 2)
│   ├── Anniversaries (level 2)
│   │   ├── Wedding Anniversary (level 3)
│   │   └── Dating Anniversary (level 3)
│   └── Graduations (level 2)
├── Holidays (level 1)
│   ├── Christmas (level 2)
│   ├── Thanksgiving (level 2)
│   └── New Year (level 2)
└── Gatherings (level 1)
    ├── Family Reunions (level 2)
    ├── Dinners (level 2)
    └── Outings (level 2)

reminder_category (level 0)
├── Communication (level 1)
│   ├── Call (level 2)
│   ├── Video Call (level 2)
│   └── Send Message (level 2)
├── Gifts (level 1)
│   ├── Birthday Gift (level 2)
│   ├── Holiday Gift (level 2)
│   └── Thank You Gift (level 2)
├── Tasks (level 1)
│   ├── Visit (level 2)
│   ├── Help with Errands (level 2)
│   └── Check-in (level 2)
└── Health & Wellness (level 1)
    ├── Medical Appointment (level 2)
    └── Medication Reminder (level 2)
```

---

## Step-by-Step Implementation Process

### Phase 1: Backend Foundation (Days 1-2)

#### Step 1.1: Update CatalogType Enum

**File:** `lib/catalog/types.ts`

```typescript
export type CatalogType =
  // Finance (already done)
  | "transaction_category"
  | "investment_type"
  | "budget_category"

  // Gym (NEW)
  | "exercise_category"
  | "equipment_type"
  | "muscle_group"

  // Nutrition (NEW)
  | "meal_type"
  | "food_category"
  | "unit_type"
  | "nutrition_goal_type"

  // Family (NEW)
  | "relationship_type"
  | "event_category"
  | "reminder_category"
  | "activity_type"
```

---

#### Step 1.2: Create Seed File

**Choose your module and create:**
- `prisma/seeds/catalog-items-gym.ts` OR
- `prisma/seeds/catalog-items-nutrition.ts` OR
- `prisma/seeds/catalog-items-family.ts`

**Copy structure from Finance seed:**
```typescript
// 1. Copy prisma/seeds/catalog-items.ts
// 2. Rename function to seedGymCatalogs() / seedNutritionCatalogs() / seedFamilyCatalogs()
// 3. Replace data with your module's hierarchy
// 4. Update catalogType strings
```

**CRITICAL: Test seed data structure**
```bash
# Dry run - print without saving
npx tsx prisma/seeds/catalog-items-gym.ts --dry-run

# Check for errors:
# - Verify 3 levels max
# - Verify all slugs are kebab-case
# - Verify no duplicate slugs
```

---

#### Step 1.3: Create Migration for New FK Columns

**File:** `prisma/migrations/YYYYMMDDHHMMSS_add_gym_catalog_fks/migration.sql`

**Template:**
```sql
-- Add catalog references to [MODULE] tables

-- Table: exercises (GYM example)
ALTER TABLE exercises
  ADD COLUMN exercise_type_id TEXT,
  ADD COLUMN muscle_group_id TEXT,
  ADD COLUMN equipment_id TEXT;

-- Add foreign keys
ALTER TABLE exercises
  ADD CONSTRAINT fk_exercise_type
    FOREIGN KEY (exercise_type_id)
    REFERENCES catalog_items(id)
    ON DELETE RESTRICT;

ALTER TABLE exercises
  ADD CONSTRAINT fk_muscle_group
    FOREIGN KEY (muscle_group_id)
    REFERENCES catalog_items(id)
    ON DELETE RESTRICT;

ALTER TABLE exercises
  ADD CONSTRAINT fk_equipment
    FOREIGN KEY (equipment_id)
    REFERENCES catalog_items(id)
    ON DELETE RESTRICT;

-- Create indexes
CREATE INDEX idx_exercises_exercise_type ON exercises(exercise_type_id);
CREATE INDEX idx_exercises_muscle_group ON exercises(muscle_group_id);
CREATE INDEX idx_exercises_equipment ON exercises(equipment_id);

-- NOTE: Keep legacy 'name' column for now (backward compatibility)
-- Will be removed in cleanup migration
```

**Run migration:**
```bash
npx prisma migrate dev --name add_gym_catalog_fks
```

---

#### Step 1.4: Update Prisma Schema

**File:** `prisma/schema.prisma`

**Add relations to your module's models:**

```prisma
model Exercise {
  id        String   @id @default(cuid())
  workoutId String

  // Legacy field (nullable during transition)
  name      String?

  // NEW: CatalogItem references
  exerciseTypeId  String?  @map("exercise_type_id")
  muscleGroupId   String?  @map("muscle_group_id")
  equipmentId     String?  @map("equipment_id")

  sets      Int
  reps      Int
  weight    Float?

  // Relations
  workout          Workout      @relation(fields: [workoutId], references: [id], onDelete: Cascade)
  exerciseType     CatalogItem? @relation("ExerciseType", fields: [exerciseTypeId], references: [id])
  muscleGroup      CatalogItem? @relation("MuscleGroup", fields: [muscleGroupId], references: [id])
  equipment        CatalogItem? @relation("Equipment", fields: [equipmentId], references: [id])

  @@map("exercises")
}

// Add to CatalogItem model:
model CatalogItem {
  // ... existing fields ...

  // NEW: Gym relations
  exercisesAsType       Exercise[] @relation("ExerciseType")
  exercisesAsMuscleGroup Exercise[] @relation("MuscleGroup")
  exercisesAsEquipment   Exercise[] @relation("Equipment")
}
```

**Regenerate Prisma client:**
```bash
npx prisma generate
```

---

#### Step 1.5: Run Seed

```bash
# Execute seed
npx tsx prisma/seeds/catalog-items-gym.ts

# Verify seeded data
docker exec -i supabase-db psql -U postgres -c "
  SELECT catalog_type, level, COUNT(*)
  FROM catalog_items
  WHERE catalog_type IN ('exercise_category', 'equipment_type', 'muscle_group')
  GROUP BY catalog_type, level
  ORDER BY catalog_type, level;
"

# Expected output example:
# catalog_type      | level | count
# exercise_category | 0     | 1
# exercise_category | 1     | 4
# exercise_category | 2     | 10
# exercise_category | 3     | 30
```

---

### Phase 2: Backend Logic (Days 3-4)

#### Step 2.1: Update Validation Schemas

**File:** `lib/validations/gym.ts` (create if doesn't exist)

```typescript
import { z } from "zod"

// Legacy Exercise Schema (for backward compatibility)
export const ExerciseSchemaLegacy = z.object({
  name: z.string().min(2, "Exercise name is required").max(100),
  sets: z.number().int().positive("Sets must be positive"),
  reps: z.number().int().positive("Reps must be positive"),
  weight: z.number().positive().optional(),
  restSeconds: z.number().int().positive().optional(),
  notes: z.string().max(500).optional(),
})

// NEW: Exercise Schema (using CatalogItems)
export const ExerciseSchema = z.object({
  exerciseTypeId: z.string().cuid("Invalid exercise type ID"),
  muscleGroupId: z.string().cuid("Invalid muscle group ID").optional(),
  equipmentId: z.string().cuid("Invalid equipment ID").optional(),
  sets: z.number().int().positive("Sets must be positive"),
  reps: z.number().int().positive("Reps must be positive"),
  weight: z.number().positive().optional(),
  restSeconds: z.number().int().positive().optional(),
  notes: z.string().max(500).optional(),
})

export const WorkoutSchema = z.object({
  name: z.string().min(2, "Workout name is required").max(100),
  date: z.string().or(z.date()),
  duration: z.number().int().positive().optional(),
  notes: z.string().max(1000).optional(),
})

export type ExerciseInput = z.infer<typeof ExerciseSchema>
export type WorkoutInput = z.infer<typeof WorkoutSchema>
```

---

#### Step 2.2: Create/Update Server Actions

**File:** `app/dashboard/workouts/actions.ts`

```typescript
"use server"

import { revalidatePath } from "next/cache"
import { requireAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/db/prisma"
import { WorkoutSchema, ExerciseSchema } from "@/lib/validations/gym"
import { createAuditLog } from "@/lib/audit/logger"
import { getCatalogItemById } from "@/lib/catalog/queries"

export async function createWorkout(formData: FormData) {
  try {
    const user = await requireAuth()

    const rawData = {
      name: formData.get("name"),
      date: formData.get("date"),
      duration: formData.get("duration") ? parseInt(formData.get("duration") as string) : undefined,
      notes: formData.get("notes") || undefined,
    }

    const validatedData = WorkoutSchema.parse(rawData)

    const workout = await prisma.workout.create({
      data: {
        userId: user.id,
        name: validatedData.name,
        date: new Date(validatedData.date),
        duration: validatedData.duration,
        notes: validatedData.notes,
      }
    })

    await createAuditLog({
      userId: user.id,
      action: "WORKOUT_CREATED",
      metadata: { workoutId: workout.id, name: workout.name },
    })

    revalidatePath("/dashboard/workouts")

    return { success: true, workout }
  } catch (error: any) {
    console.error("Create workout error:", error)
    return { success: false, error: error.message || "Failed to create workout" }
  }
}

export async function createExercise(workoutId: string, formData: FormData) {
  try {
    const user = await requireAuth()

    // Verify workout ownership
    const workout = await prisma.workout.findFirst({
      where: { id: workoutId, userId: user.id }
    })

    if (!workout) {
      return { success: false, error: "Workout not found or access denied" }
    }

    const rawData = {
      exerciseTypeId: formData.get("exerciseTypeId"),
      muscleGroupId: formData.get("muscleGroupId") || undefined,
      equipmentId: formData.get("equipmentId") || undefined,
      sets: parseInt(formData.get("sets") as string),
      reps: parseInt(formData.get("reps") as string),
      weight: formData.get("weight") ? parseFloat(formData.get("weight") as string) : undefined,
      restSeconds: formData.get("restSeconds") ? parseInt(formData.get("restSeconds") as string) : undefined,
      notes: formData.get("notes") || undefined,
    }

    const validatedData = ExerciseSchema.parse(rawData)

    // Validate catalog item ownership
    const exerciseType = await getCatalogItemById(validatedData.exerciseTypeId, user.id)
    if (!exerciseType) {
      return { success: false, error: "Invalid exercise type" }
    }

    // Validate optional catalog items
    if (validatedData.muscleGroupId) {
      const muscleGroup = await getCatalogItemById(validatedData.muscleGroupId, user.id)
      if (!muscleGroup) {
        return { success: false, error: "Invalid muscle group" }
      }
    }

    if (validatedData.equipmentId) {
      const equipment = await getCatalogItemById(validatedData.equipmentId, user.id)
      if (!equipment) {
        return { success: false, error: "Invalid equipment" }
      }
    }

    const exercise = await prisma.exercise.create({
      data: {
        workoutId,
        exerciseTypeId: validatedData.exerciseTypeId,
        muscleGroupId: validatedData.muscleGroupId,
        equipmentId: validatedData.equipmentId,
        sets: validatedData.sets,
        reps: validatedData.reps,
        weight: validatedData.weight,
        restSeconds: validatedData.restSeconds,
        notes: validatedData.notes,
      },
      include: {
        exerciseType: true,
        muscleGroup: true,
        equipment: true,
      }
    })

    await createAuditLog({
      userId: user.id,
      action: "EXERCISE_CREATED",
      metadata: {
        exerciseId: exercise.id,
        workoutId,
        exerciseTypeId: exercise.exerciseTypeId,
      },
    })

    revalidatePath(`/dashboard/workouts/${workoutId}`)

    return { success: true, exercise }
  } catch (error: any) {
    console.error("Create exercise error:", error)
    return { success: false, error: error.message || "Failed to create exercise" }
  }
}

// Similar for updateWorkout, updateExercise, deleteWorkout, deleteExercise
```

---

#### Step 2.3: Update Audit Types

**File:** `lib/audit/logger.ts`

```typescript
export type AuditAction =
  // ... existing types ...

  // GYM (NEW)
  | "WORKOUT_CREATED"
  | "WORKOUT_UPDATED"
  | "WORKOUT_DELETED"
  | "EXERCISE_CREATED"
  | "EXERCISE_UPDATED"
  | "EXERCISE_DELETED"

  // NUTRITION (NEW - add when implementing)
  | "MEAL_CREATED"
  | "MEAL_UPDATED"
  | "MEAL_DELETED"
  | "FOOD_ITEM_CREATED"
  | "FOOD_ITEM_UPDATED"
  | "FOOD_ITEM_DELETED"

  // FAMILY (NEW - add when implementing)
  | "FAMILY_MEMBER_CREATED"
  | "FAMILY_MEMBER_UPDATED"
  | "FAMILY_MEMBER_DELETED"
  | "EVENT_CREATED"
  | "EVENT_UPDATED"
  | "EVENT_DELETED"
  | "REMINDER_CREATED"
  | "REMINDER_UPDATED"
  | "REMINDER_DELETED"
```

---

### Phase 3: Frontend Components (Days 5-7)

#### Step 3.1: Check for Existing Forms

**CRITICAL: Don't create new forms if they already exist!**

```bash
# Check for existing forms
ls components/gym/
ls components/nutrition/
ls components/family/

# Search for form references
grep -r "WorkoutForm" components/ app/
grep -r "ExerciseForm" components/ app/
grep -r "MealForm" components/ app/
```

**If form EXISTS → MODIFY it**
**If form DOESN'T exist → CREATE it**

---

#### Step 3.2: Create/Modify Exercise Form

**File:** `components/gym/ExerciseForm.tsx`

```typescript
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createExercise, updateExercise } from "@/app/dashboard/workouts/actions"
import CategorySelector from "@/components/catalog/CategorySelector"

interface ExerciseFormProps {
  workoutId: string
  exercise?: {
    id: string
    exerciseTypeId?: string | null
    muscleGroupId?: string | null
    equipmentId?: string | null
    // Legacy field for backward compatibility
    name?: string | null
    sets: number
    reps: number
    weight?: number | null
    restSeconds?: number | null
    notes?: string | null
  }
  onCancel?: () => void
}

export default function ExerciseForm({ workoutId, exercise, onCancel }: ExerciseFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [exerciseTypeId, setExerciseTypeId] = useState(exercise?.exerciseTypeId || "")
  const [muscleGroupId, setMuscleGroupId] = useState(exercise?.muscleGroupId || "")
  const [equipmentId, setEquipmentId] = useState(exercise?.equipmentId || "")
  const [sets, setSets] = useState(exercise?.sets?.toString() || "")
  const [reps, setReps] = useState(exercise?.reps?.toString() || "")
  const [weight, setWeight] = useState(exercise?.weight?.toString() || "")
  const [restSeconds, setRestSeconds] = useState(exercise?.restSeconds?.toString() || "")
  const [notes, setNotes] = useState(exercise?.notes || "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("exerciseTypeId", exerciseTypeId)
      if (muscleGroupId) formData.append("muscleGroupId", muscleGroupId)
      if (equipmentId) formData.append("equipmentId", equipmentId)
      formData.append("sets", sets)
      formData.append("reps", reps)
      if (weight) formData.append("weight", weight)
      if (restSeconds) formData.append("restSeconds", restSeconds)
      if (notes) formData.append("notes", notes)

      const result = exercise
        ? await updateExercise(exercise.id, formData)
        : await createExercise(workoutId, formData)

      if (result.success) {
        router.push(`/dashboard/workouts/${workoutId}`)
        router.refresh()
      } else {
        setError(result.error || "Something went wrong")
      }
    } catch (err: any) {
      setError(err.message || "Failed to save exercise")
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
        <h3 className="text-lg font-semibold">Exercise Details</h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Exercise Type *
          </label>
          <CategorySelector
            catalogType="exercise_category"
            value={exerciseTypeId}
            onChange={(id) => setExerciseTypeId(id)}
            placeholder="Select exercise (Bench Press, Squat, etc.)"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Choose the specific exercise you performed
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Muscle Group (Optional)
            </label>
            <CategorySelector
              catalogType="muscle_group"
              value={muscleGroupId}
              onChange={(id) => setMuscleGroupId(id)}
              placeholder="Select muscle group"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Equipment (Optional)
            </label>
            <CategorySelector
              catalogType="equipment_type"
              value={equipmentId}
              onChange={(id) => setEquipmentId(id)}
              placeholder="Select equipment"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sets *
            </label>
            <input
              type="number"
              value={sets}
              onChange={(e) => setSets(e.target.value)}
              required
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reps *
            </label>
            <input
              type="number"
              value={reps}
              onChange={(e) => setReps(e.target.value)}
              required
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weight (lbs)
            </label>
            <input
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              min="0"
              step="0.5"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rest Period (seconds)
          </label>
          <input
            type="number"
            value={restSeconds}
            onChange={(e) => setRestSeconds(e.target.value)}
            min="0"
            step="5"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="60"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            maxLength={500}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Form notes, difficulty, etc..."
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : exercise ? "Update Exercise" : "Add Exercise"}
        </button>
      </div>
    </form>
  )
}
```

---

#### Step 3.3: Add Category Manager Tab

**File:** `app/dashboard/settings/categories/page.tsx`

**Modify to add Gym tab:**

```typescript
import { requireAuth } from "@/lib/auth/utils"
import { getUserCatalogItems } from "@/lib/catalog/queries"
import { buildCatalogTree } from "@/lib/catalog/utils"
import CategoryManager from "@/components/settings/CategoryManager"

export default async function CategoriesSettingsPage() {
  const user = await requireAuth()

  // Fetch all catalog items
  const [
    transactionCategories,
    investmentTypes,
    exerciseCategories,  // NEW
    equipmentTypes,      // NEW
    muscleGroups         // NEW
  ] = await Promise.all([
    getUserCatalogItems(user.id, "transaction_category"),
    getUserCatalogItems(user.id, "investment_type"),
    getUserCatalogItems(user.id, "exercise_category"),  // NEW
    getUserCatalogItems(user.id, "equipment_type"),      // NEW
    getUserCatalogItems(user.id, "muscle_group"),        // NEW
  ])

  // Build trees
  const transactionTree = buildCatalogTree(transactionCategories)
  const investmentTree = buildCatalogTree(investmentTypes)
  const exerciseTree = buildCatalogTree(exerciseCategories)      // NEW
  const equipmentTree = buildCatalogTree(equipmentTypes)        // NEW
  const muscleGroupTree = buildCatalogTree(muscleGroups)        // NEW

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
          // NEW: Pass gym data
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
```

**File:** `components/settings/CategoryManager.tsx`

**Add new tab:**

```typescript
interface CategoryManagerProps {
  // Existing
  transactionCategories: any[]
  transactionTree: CatalogTreeNode[]
  investmentTypes: any[]
  investmentTree: CatalogTreeNode[]

  // NEW: Gym
  exerciseCategories?: any[]
  exerciseTree?: CatalogTreeNode[]
  equipmentTypes?: any[]
  equipmentTree?: CatalogTreeNode[]
  muscleGroups?: any[]
  muscleGroupTree?: CatalogTreeNode[]
}

type TabType = "transactions" | "investments" | "exercises" | "equipment" | "muscles"

// In render:
<nav className="flex space-x-8">
  {/* Existing tabs */}
  <button onClick={() => setActiveTab("transactions")}>
    Transaction Categories
  </button>
  <button onClick={() => setActiveTab("investments")}>
    Investment Types
  </button>

  {/* NEW tabs */}
  {exerciseCategories && (
    <button onClick={() => setActiveTab("exercises")}>
      Exercise Categories
    </button>
  )}
  {equipmentTypes && (
    <button onClick={() => setActiveTab("equipment")}>
      Equipment Types
    </button>
  )}
  {muscleGroups && (
    <button onClick={() => setActiveTab("muscles")}>
      Muscle Groups
    </button>
  )}
</nav>

{/* Update currentTree logic */}
const currentTree =
  activeTab === "transactions" ? transactionTree :
  activeTab === "investments" ? investmentTree :
  activeTab === "exercises" ? exerciseTree :
  activeTab === "equipment" ? equipmentTree :
  activeTab === "muscles" ? muscleGroupTree :
  []
```

---

### Phase 4: Testing (Day 8)

#### Step 4.1: Create Module-Specific Test Checklist

**File:** `docs/catalog-system-gym-testing-checklist.md`

**Copy template from:** `docs/catalog-system-testing-checklist.md`

**Modify tests for your module:**
- Replace "transaction" with "exercise"
- Replace "investment" with "workout"
- Update field names
- Update validation logic

**Example test case:**

```markdown
### 3.1 ExerciseForm: Cascading Category Selection

**Test Case:** Exercise Type selector works

**Steps:**
1. Navigate to `/dashboard/workouts/[id]/add-exercise`
2. Open "Exercise Type" dropdown
3. Select "Strength Training → Chest → Bench Press"
4. Verify exercise type is saved correctly

**Expected Result:** ✅ Exercise created with exerciseTypeId referencing "Bench Press"

**Actual Result:**
- [ ] PASS
- [ ] FAIL
- [ ] NOT TESTED
```

---

#### Step 4.2: Database Validation Tests

```sql
-- Test 1: Verify gym catalogs seeded
SELECT catalog_type, level, "isSystem", COUNT(*)
FROM catalog_items
WHERE catalog_type IN ('exercise_category', 'equipment_type', 'muscle_group')
GROUP BY catalog_type, level, "isSystem"
ORDER BY catalog_type, level;

-- Expected: System categories at levels 0-3

-- Test 2: Verify exercises reference catalog items
SELECT e.id, e.name, e.exercise_type_id,
       ct.name AS exercise_type_name,
       mg.name AS muscle_group_name,
       eq.name AS equipment_name
FROM exercises e
LEFT JOIN catalog_items ct ON e.exercise_type_id = ct.id
LEFT JOIN catalog_items mg ON e.muscle_group_id = mg.id
LEFT JOIN catalog_items eq ON e.equipment_id = eq.id
LIMIT 10;

-- Expected: exercise_type_id populated, names resolved
```

---

### Phase 5: Documentation & Commit (Day 9)

#### Step 5.1: Create Implementation Report

**File:** `docs/catalog-system-gym-implementation-report.md`

**Template:** Copy from `docs/catalog-system-implementation-report.md`

**Update sections:**
- Executive Summary (Gym stats)
- Catalog designs (exercise hierarchy)
- Files created/modified
- Seed data counts
- Test results

---

#### Step 5.2: Build & Health Check

```bash
# 1. Type check
npx tsc --noEmit

# 2. Build
npm run build

# 3. Health check
cd /home/badfaceserverlap/docker/contenedores
bash shared/scripts/health-check.sh
```

**Only proceed if all pass!**

---

#### Step 5.3: Create Commit

```bash
# Stage files (SPECIFIC FILES, NOT git add .)
git add \
  lib/catalog/types.ts \
  prisma/schema.prisma \
  prisma/migrations/YYYYMMDDHHMMSS_add_gym_catalog_fks/ \
  prisma/seeds/catalog-items-gym.ts \
  lib/validations/gym.ts \
  lib/audit/logger.ts \
  app/dashboard/workouts/actions.ts \
  components/gym/ExerciseForm.tsx \
  app/dashboard/settings/categories/page.tsx \
  components/settings/CategoryManager.tsx \
  docs/catalog-system-gym-implementation-report.md \
  docs/catalog-system-gym-testing-checklist.md

# Commit with detailed message
git commit -m "$(cat <<'EOF'
feat: Implement nested categories for Gym Training module

## Overview
Implemented 3-level nested category system for Gym module, replacing
hardcoded exercise names with CatalogItems database structure.

## Catalog Types Added
- exercise_category (Strength, Cardio, Flexibility, Sports)
- equipment_type (Free Weights, Machines, Bodyweight, Cardio Equipment)
- muscle_group (Upper Body, Lower Body, Core)

## Schema Changes
- exercises table: Added exercise_type_id, muscle_group_id, equipment_id
- workout_progress table: Added exercise_id
- Created indexes for performance

## Seed Data
- 60+ exercise categories (3 levels)
- 15+ equipment types
- 12+ muscle groups
- Total: ~87 system catalog items

## Components Created
- components/gym/ExerciseForm.tsx - with CategorySelector
- Updated CategoryManager with Gym tabs

## Build Status
✅ TypeScript: 0 errors
✅ Next.js Build: Success
✅ Health Check: Passed

---

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

---

## Common Pitfalls & Solutions

### Pitfall 1: Forgetting to Await Params (Next.js 16)

**Error:**
```
Type 'Promise<{ id: string }>' is not assignable to type '{ id: string }'
```

**Solution:**
Always await params in route handlers:
```typescript
export async function GET(request: NextRequest, { params }: RouteContext) {
  const { id } = await params  // ← Must await
}
```

---

### Pitfall 2: Column Name Quoting in SQL

**Error:**
```
ERROR: column "parentid" does not exist
```

**Solution:**
Quote camelCase column names:
```sql
SELECT "parentId" FROM catalog_items  -- ✅ Correct
SELECT parentId FROM catalog_items    -- ❌ Wrong
```

---

### Pitfall 3: Null Type Mismatches

**Error:**
```
Type 'null' is not assignable to type 'string | undefined'
```

**Solution:**
Always use `| null` in interfaces during migration:
```typescript
interface Exercise {
  exerciseTypeId?: string | null  // ✅ Correct
  name?: string | null
}
```

---

### Pitfall 4: Missing Slug in createCatalogItem

**Error:**
```
Argument of type '{ slug?: string | undefined }' is not assignable to parameter of type '{ slug: string }'
```

**Solution:**
Always generate slug fallback:
```typescript
const slug = validatedData.slug || validatedData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
const result = await createCatalogItem({ ...validatedData, slug })
```

---

### Pitfall 5: Forgetting to Update Audit Types

**Error:**
```
Type '"EXERCISE_CREATED"' is not assignable to type 'AuditAction'
```

**Solution:**
Update `lib/audit/logger.ts` BEFORE writing server actions:
```typescript
export type AuditAction =
  | "EXERCISE_CREATED"  // ← Add first
  | "EXERCISE_UPDATED"
  | "EXERCISE_DELETED"
```

---

### Pitfall 6: Creating Forms That Already Exist

**Mistake:**
```bash
touch components/gym/WorkoutForm.tsx  # Form already exists!
```

**Solution:**
Always check first:
```bash
ls components/gym/
grep -r "WorkoutForm" components/ app/
# If found → MODIFY existing file
# If not found → CREATE new file
```

---

### Pitfall 7: Not Testing Cascading

**Mistake:**
Assuming cascading works without testing.

**Solution:**
Always test cascading manually:
1. Select parent category
2. Verify child dropdown updates
3. Verify disabled state when parent is empty

---

### Pitfall 8: Seed Data with Wrong Levels

**Mistake:**
```typescript
// This creates 4 levels! (0 → 1 → 2 → 3 → 4)
{
  name: "Strength",
  children: [
    {
      name: "Chest",
      children: [
        {
          name: "Compound",
          children: [
            { name: "Bench Press" }  // ← Level 4!
          ]
        }
      ]
    }
  ]
}
```

**Solution:**
Count levels carefully (max 3 children deep):
```typescript
{
  name: "Strength",  // Level 0
  children: [
    {
      name: "Chest",  // Level 1
      children: [
        { name: "Bench Press" }  // Level 2 (max for this structure)
      ]
    }
  ]
}
```

---

### Pitfall 9: Not Building Before Commit

**Mistake:**
```bash
git commit -m "message"
git push
# Deploy breaks with TypeScript errors!
```

**Solution:**
Always build before commit:
```bash
npm run build  # Must pass
git commit -m "message"
```

---

### Pitfall 10: Using git add .

**Mistake:**
```bash
git add .  # Adds unwanted files!
```

**Solution:**
Stage specific files:
```bash
git add lib/catalog/types.ts prisma/schema.prisma components/gym/ExerciseForm.tsx
```

---

## Testing Checklist Template

**Use this checklist for EVERY module you implement:**

### Pre-Implementation
- [ ] Read Finance implementation report completely
- [ ] Understand existing Finance module code
- [ ] Finance catalog system is working locally
- [ ] Identified all hardcoded strings in target module
- [ ] Designed 3-level catalog hierarchy on paper

### Phase 1: Backend Foundation
- [ ] Updated `lib/catalog/types.ts` with new CatalogType
- [ ] Created seed file with correct hierarchy (max 3 levels)
- [ ] Dry-run tested seed data structure
- [ ] Created migration for new FK columns
- [ ] Migration uses quoted column names (`"parentId"`, `"isSystem"`, etc.)
- [ ] Updated Prisma schema with relations
- [ ] Regenerated Prisma client (`npx prisma generate`)
- [ ] Applied migration (`npx prisma migrate dev`)
- [ ] Ran seed successfully
- [ ] Verified seed data in database (correct counts, levels)

### Phase 2: Backend Logic
- [ ] Created/updated validation schemas (Zod)
- [ ] Created/updated server actions with catalog validation
- [ ] Added audit log types to `lib/audit/logger.ts`
- [ ] Tested server actions return correct data structure
- [ ] Verified ownership checks work (users can't access others' categories)

### Phase 3: Frontend Components
- [ ] Checked for existing forms (don't recreate!)
- [ ] Created/modified form with CategorySelector
- [ ] Tested cascading selects (parent → child filtering)
- [ ] Tested disabled state (child disabled until parent selected)
- [ ] Updated CategoryManager with new tabs
- [ ] Verified read-only system categories
- [ ] Verified user categories can be edited/deleted

### Phase 4: Testing
- [ ] Created module-specific testing checklist
- [ ] Ran database validation queries (verify seed data)
- [ ] Manually tested form submission (create, update, delete)
- [ ] Tested cascading in UI (parent change updates children)
- [ ] Tested Category Manager (create, edit, delete custom categories)
- [ ] Attempted to edit system category (should fail)
- [ ] Attempted to delete category with references (should fail)

### Phase 5: Build & Commit
- [ ] TypeScript check passed (`npx tsc --noEmit`)
- [ ] Build successful (`npm run build`)
- [ ] Health check passed
- [ ] Created implementation report
- [ ] Staged specific files (NOT `git add .`)
- [ ] Created detailed commit message
- [ ] Commit includes Co-Authored-By line

---

## Validation Checklist

**Run these validations after EVERY phase:**

### After Phase 1 (Backend Foundation)

```bash
# 1. Verify migration applied
npx prisma migrate status

# 2. Verify seed data
docker exec -i supabase-db psql -U postgres -c "
  SELECT catalog_type, level, COUNT(*)
  FROM catalog_items
  WHERE catalog_type IN ('YOUR_CATALOG_TYPE_HERE')
  GROUP BY catalog_type, level
  ORDER BY catalog_type, level;
"

# 3. Verify Prisma client generated
ls node_modules/.prisma/client/
# Should contain updated types
```

### After Phase 2 (Backend Logic)

```bash
# 1. TypeScript check
npx tsc --noEmit
# Must pass with 0 errors

# 2. Test server action manually
# Create a test file: test-action.ts
import { createExercise } from "@/app/dashboard/workouts/actions"

const testData = new FormData()
testData.append("exerciseTypeId", "VALID_CATALOG_ITEM_ID")
testData.append("sets", "3")
testData.append("reps", "10")

const result = await createExercise("WORKOUT_ID", testData)
console.log(result)
# Should return { success: true, exercise: {...} }
```

### After Phase 3 (Frontend Components)

```bash
# 1. Start dev server
npm run dev

# 2. Navigate to form
# http://localhost:3000/dashboard/workouts/[id]/add-exercise

# 3. Manual UI tests:
# - Open exercise type dropdown (should load categories)
# - Select a category (form should update)
# - Submit form (should create exercise)
# - Check database (exercise should have exerciseTypeId)

# 4. Navigate to Category Manager
# http://localhost:3000/dashboard/settings/categories

# 5. Manual UI tests:
# - Switch to Exercise tab (should show exercise categories)
# - Expand tree (should show hierarchy)
# - Try to edit system category (should be read-only)
# - Create custom category (should succeed)
# - Delete custom category (should succeed)
```

### Before Commit

```bash
# 1. MANDATORY: Build
npm run build
# Must succeed with 0 errors

# 2. MANDATORY: Health check
cd /home/badfaceserverlap/docker/contenedores
bash shared/scripts/health-check.sh
# Should pass (or show expected warnings)

# 3. Review changes
git status
git diff

# 4. Stage specific files
git add [list specific files]

# 5. Review staged changes
git diff --staged
```

---

## Quick Reference: Module Comparison

| Aspect | Finance (Done) | Gym | Nutrition | Family |
|--------|---------------|-----|-----------|--------|
| **Catalog Types** | 3 | 3 | 4 | 4 |
| **Total Categories** | 31 | ~87 | ~60 | ~40 |
| **Max Hierarchy** | 3 levels | 3 levels | 3 levels | 3 levels |
| **Main Form** | TransactionForm | ExerciseForm | MealForm | FamilyMemberForm |
| **Cascading?** | Yes (Type→Category) | No | Yes (MealType→Food) | No |
| **Complexity** | Medium | Medium | High | Low |

---

## Summary: Key Takeaways

### ✅ DO:
1. **Always read files before editing** (to get exact text)
2. **Quote camelCase columns in SQL** (`"parentId"`, `"isSystem"`)
3. **Await params in Next.js 16** route handlers
4. **Use null-safe types** (`string | null`) during migration
5. **Generate slug fallbacks** before calling createCatalogItem
6. **Update audit types FIRST** before writing server actions
7. **Check for existing forms** before creating new ones
8. **Test cascading manually** in UI
9. **Build before every commit** (`npm run build`)
10. **Stage specific files** (never `git add .`)

### ❌ DON'T:
1. **Don't skip type checking** (always run `npx tsc --noEmit`)
2. **Don't create 4+ levels** (max is 3)
3. **Don't hardcode catalog types** (use CatalogType enum)
4. **Don't forget indexes** on FK columns
5. **Don't skip seed data validation** (dry-run first)
6. **Don't assume forms don't exist** (always check)
7. **Don't commit without building** (prevents TypeScript errors in production)
8. **Don't use `git add .`** (stage specific files)
9. **Don't skip health checks** before commit
10. **Don't forget backward compatibility** (keep legacy fields nullable)

---

## Next Steps

**Choose your module and follow this guide sequentially:**

1. **Gym Training** → Start with exercise_category (easiest, no cascading)
2. **Nutrition** → More complex, has cascading (MealType → FoodCategory)
3. **Family CRM** → Simplest, minimal hierarchy

**Estimated timeline per module:**
- **Phase 1-2 (Backend):** 2-3 days
- **Phase 3 (Frontend):** 2-3 days
- **Phase 4 (Testing):** 1 day
- **Phase 5 (Docs/Commit):** 1 day

**Total per module:** ~7-8 days

---

**Good luck! Remember: When in doubt, refer back to the Finance implementation as the reference example.** 🚀

---

**Document Version:** 1.0
**Last Updated:** 2025-12-15
**Tested on:** Finance Module (Complete ✅)
**Ready for:** Gym, Nutrition, Family modules
