# Plan: Sistema Mejorado de Catálogos con Smart Combobox

> **⚠️ DOCUMENTO OBSOLETO**
>
> Este plan ha sido **consolidado y optimizado** en el nuevo documento maestro:
> **`/home/badfaceserverlap/personal-dashboard/docs/catalog-system-implementation-guide.md`**
>
> Por favor, usa el nuevo documento que incluye:
> - ✅ Reglas críticas de compatibilidad (evita errores con Next.js 16 + React 19)
> - ✅ Estado real verificado del código (14% completado, no 100%)
> - ✅ Instrucciones concisas y directas optimizadas para agentes LLM
> - ✅ Código completo listo para copiar/pegar
>
> **Fecha de consolidación**: 2025-12-15

---

**Objetivo**: Rediseñar el sistema de catálogos para todos los módulos (Gym, Finance, Nutrition, Family) con búsqueda en tiempo real, creación inline, templates pre-cargables y visualizaciones analytics.

**Alcance**: Implementación completa en 3 fases (Smart Combobox + Templates + Analytics)

**Módulos afectados**: Gym Training, Finance & Investment, Nutrition Tracker, Family CRM

---

## 📋 RESUMEN EJECUTIVO

### Estado Actual
- ✅ Sistema de CatalogItems implementado en Gym y Finance
- ✅ CategorySelector básico (select dropdown sin búsqueda)
- ✅ React Hook Form instalado pero sin usar
- ❌ No hay búsqueda en tiempo real
- ❌ No hay creación inline de categorías
- ❌ No hay templates/rutinas pre-cargables
- ❌ No hay analytics/visualización

### Cambios Propuestos

**1. Smart Combobox Component**
- Reemplazar CategorySelector con componente searchable
- Búsqueda en BD con debouncing (300ms)
- Creación inline con modal dialog
- Integración completa con React Hook Form

**2. Lógica Específica por Módulo**
- **Gym**: Rutinas pre-cargables (workout templates)
- **Finance**: Gráfico de allocation por asset class
- **Nutrition**: Plantillas de comidas (meal templates)
- **Family**: Analytics de tiempo por círculo social

**3. Analytics Dashboard**
- Página /dashboard/analytics con Recharts
- 4+ gráficos interactivos
- Data agregada por categorías de catálogo

---

## 🎯 FASE 1: SMART COMBOBOX (Días 1-3)

### Objetivos
- [x] Componente SmartCombobox reemplaza CategorySelector
- [x] Búsqueda en tiempo real en BD
- [x] Creación inline con modal
- [x] Integración con React Hook Form

### 1.1 Backend - API de Búsqueda

**Archivo nuevo**: `code/app/api/catalog/search/route.ts`

```typescript
// GET /api/catalog/search?q=term&catalogType=exercise_category&parentId=xxx&limit=20
export async function GET(request: NextRequest)
```

**Características**:
- Full-text search en name, description, slug
- Ranking por relevancia (exact match > contains)
- Breadcrumbs (parent path)
- Paginación (limit/offset)
- Debouncing en cliente (300ms)

**Modificar**: `code/app/api/catalog/route.ts`
- Mejorar POST para validar duplicados
- Retornar item completo con relaciones

### 1.2 Frontend - Hooks

**Archivo nuevo**: `code/components/catalog/hooks/useComboboxSearch.ts`

```typescript
export function useComboboxSearch(
  catalogType: CatalogType,
  options: {
    debounceMs?: number
    minLength?: number
    parentId?: string | null
    enableCache?: boolean
  }
): {
  query: string
  results: ComboboxSearchResult[]
  loading: boolean
  error: string | null
  hasMore: boolean
  search: (query: string) => void
  clearCache: () => void
}
```

**Funcionalidades**:
- Debouncing con lodash.debounce
- AbortController para cancelar requests previas
- Cache local con Map (opcional)
- Min search length: 2 caracteres

**Archivo nuevo**: `code/components/catalog/hooks/useComboboxCache.ts`
- Cache client-side con Map
- TTL 5 minutos (opcional)
- Invalidación manual

### 1.3 Frontend - Componentes

**Archivo nuevo**: `code/components/catalog/SmartCombobox.tsx`

```typescript
interface SmartComboboxProps {
  catalogType: CatalogType
  value: string | string[]
  onChange: (value: string | string[]) => void

  // RHF Integration
  name?: string
  control?: Control<any>
  rules?: RegisterOptions

  // Search & Filter
  searchable?: boolean
  minSearchLength?: number
  debounceMs?: number
  parentId?: string | null

  // Create Inline
  allowCreate?: boolean
  createInParent?: string
  onCreateSuccess?: (item: CatalogItem) => void

  // UI/UX
  placeholder?: string
  emptyMessage?: string
  multiSelect?: boolean
  showIcons?: boolean
  showBreadcrumbs?: boolean

  // Validation
  required?: boolean
  disabled?: boolean
  error?: string

  className?: string
}
```

**Archivo nuevo**: `code/components/catalog/ComboboxOption.tsx`
- Renderizar item individual con highlight
- Iconos y breadcrumbs
- Keyboard navigation

**Archivo nuevo**: `code/components/catalog/ComboboxCreateDialog.tsx`
- Modal para creación inline
- Formulario: name, parentId, icon, color, description
- Validación con Zod
- Submit a /api/catalog (POST)

### 1.4 Integración con React Hook Form

**Modificar**: `code/components/workouts/WorkoutForm.tsx`
- Migrar de useState a useForm de react-hook-form
- Reemplazar CategorySelector con SmartCombobox + Controller
- 3 campos: exerciseTypeId, muscleGroupId, equipmentId

**Modificar**: `code/components/finance/TransactionForm.tsx`
- Migrar a react-hook-form
- SmartCombobox con cascading (Type → Category)

**Modificar**: `code/components/finance/InvestmentForm.tsx`
- Migrar a react-hook-form
- SmartCombobox para investment type

### 1.5 Extensión de CatalogTypes

**Modificar**: `code/lib/catalog/types.ts`

```typescript
export type CatalogType =
  // Finance
  | 'transaction_category'
  | 'investment_type'
  | 'budget_category'

  // Gym Training
  | 'exercise_category'
  | 'equipment_type'
  | 'muscle_group'

  // Nutrition (NUEVO)
  | 'meal_type'
  | 'food_category'
  | 'unit_type'
  | 'nutrition_goal_type'

  // Family CRM (NUEVO)
  | 'relationship_type'
  | 'event_category'
  | 'reminder_category'
  | 'activity_type'
  | 'social_circle'
```

### 1.6 Seeds para Nutrition y Family

**Archivo nuevo**: `code/prisma/seeds/catalog-items-nutrition.ts`
- meal_type: Main Meals > Breakfast/Lunch/Dinner, Snacks, Workout Nutrition
- food_category: Protein Sources > Animal/Plant, Carbs, Vegetables, Fruits, Fats
- unit_type: Weight > grams/oz, Volume > ml/cups, Pieces
- nutrition_goal_type: Weight Loss, Muscle Gain, Maintenance, Performance

**Archivo nuevo**: `code/prisma/seeds/catalog-items-family.ts`
- relationship_type: Immediate Family, Extended Family, Friends
- event_category: Celebrations > Birthdays/Anniversaries, Holidays, Gatherings
- reminder_category: Communication, Gifts, Tasks, Health & Wellness
- activity_type: In-Person, Phone, Video Call, Message
- social_circle: Family Cercana, Familia Extendida, Amigos, Trabajo, Networking

### 1.7 Testing Fase 1

**Test E2E manual**:
- [ ] Búsqueda en SmartCombobox retorna resultados
- [ ] Búsqueda sin resultados muestra mensaje
- [ ] Crear nuevo item inline funciona
- [ ] Item creado aparece inmediatamente en lista
- [ ] Debouncing funciona (no request por cada letra)
- [ ] AbortController cancela requests anteriores
- [ ] Integración RHF sin errores
- [ ] Validaciones de RHF muestran errores
- [ ] Keyboard navigation (arrow keys, enter, escape)

**Criterios de éxito Fase 1**:
- ✅ SmartCombobox funciona en 3 módulos (Gym, Finance, Nutrition)
- ✅ Búsqueda < 500ms
- ✅ Creación inline sin refresh
- ✅ React Hook Form integrado
- ✅ Accesibilidad con teclado

---

## 🏋️ FASE 2: TEMPLATES & RUTINAS (Días 4-7)

### Objetivos
- [x] Workout templates para Gym
- [x] Meal templates para Nutrition
- [x] Pre-cargar formularios desde templates
- [x] CRUD completo para templates

### 2.1 Schema Extensions

**Migración**: `code/prisma/migrations/YYYYMMDDHHMMSS_add_templates_system/migration.sql`

**Nuevas tablas**:

```sql
-- Workout Templates
CREATE TABLE workout_templates (
  id VARCHAR(30) PRIMARY KEY,
  user_id VARCHAR(30) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  category VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE template_exercises (
  id VARCHAR(30) PRIMARY KEY,
  template_id VARCHAR(30) NOT NULL REFERENCES workout_templates(id) ON DELETE CASCADE,
  exercise_type_id VARCHAR(30) NOT NULL REFERENCES catalog_items(id) ON DELETE RESTRICT,
  muscle_group_id VARCHAR(30) REFERENCES catalog_items(id) ON DELETE RESTRICT,
  equipment_id VARCHAR(30) REFERENCES catalog_items(id) ON DELETE RESTRICT,
  sets INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  weight DOUBLE PRECISION,
  rest_seconds INTEGER,
  notes TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Meal Templates
CREATE TABLE meal_templates (
  id VARCHAR(30) PRIMARY KEY,
  user_id VARCHAR(30) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  meal_type VARCHAR(20) NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  total_calories DOUBLE PRECISION,
  total_protein DOUBLE PRECISION,
  total_carbs DOUBLE PRECISION,
  total_fats DOUBLE PRECISION,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE template_food_items (
  id VARCHAR(30) PRIMARY KEY,
  template_id VARCHAR(30) NOT NULL REFERENCES meal_templates(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  quantity DOUBLE PRECISION NOT NULL,
  unit VARCHAR(20) NOT NULL,
  calories DOUBLE PRECISION,
  protein DOUBLE PRECISION,
  carbs DOUBLE PRECISION,
  fats DOUBLE PRECISION,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_workout_templates_user_public ON workout_templates(user_id, is_public);
CREATE INDEX idx_template_exercises_template ON template_exercises(template_id);
CREATE INDEX idx_meal_templates_user_type_public ON meal_templates(user_id, meal_type, is_public);
CREATE INDEX idx_template_food_items_template ON template_food_items(template_id);

-- Trigger para calcular macros automáticamente
CREATE OR REPLACE FUNCTION calculate_meal_template_macros()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE meal_templates
  SET
    total_calories = (SELECT COALESCE(SUM(calories), 0) FROM template_food_items WHERE template_id = NEW.template_id),
    total_protein = (SELECT COALESCE(SUM(protein), 0) FROM template_food_items WHERE template_id = NEW.template_id),
    total_carbs = (SELECT COALESCE(SUM(carbs), 0) FROM template_food_items WHERE template_id = NEW.template_id),
    total_fats = (SELECT COALESCE(SUM(fats), 0) FROM template_food_items WHERE template_id = NEW.template_id),
    updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.template_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_meal_template_macros
AFTER INSERT OR UPDATE OR DELETE ON template_food_items
FOR EACH ROW
EXECUTE FUNCTION calculate_meal_template_macros();
```

**Modificar**: `code/prisma/schema.prisma`
- Agregar modelos WorkoutTemplate, TemplateExercise, MealTemplate, TemplateFoodItem
- Agregar relaciones en CatalogItem
- Agregar relaciones en User

### 2.2 Backend - Queries & Mutations

**Archivo nuevo**: `code/lib/templates/workout-queries.ts`

```typescript
export async function getUserWorkoutTemplates(userId: string, includePublic = true)
export async function getWorkoutTemplateById(id: string, userId: string)
export async function createWorkoutTemplate(data: any, userId: string)
export async function updateWorkoutTemplate(id: string, data: any, userId: string)
export async function deleteWorkoutTemplate(id: string, userId: string)
export async function loadWorkoutFromTemplate(templateId: string, userId: string)
```

**Archivo nuevo**: `code/lib/templates/meal-queries.ts`
- Misma estructura para meal templates

**Archivo nuevo**: `code/lib/validations/templates.ts`

```typescript
export const WorkoutTemplateSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  category: z.string().max(50).optional(),
  isPublic: z.boolean().default(false),
  exercises: z.array(z.object({
    exerciseTypeId: z.string().cuid(),
    muscleGroupId: z.string().cuid().optional().nullable(),
    equipmentId: z.string().cuid().optional().nullable(),
    sets: z.number().int().min(1).max(20),
    reps: z.number().int().min(1).max(100),
    weight: z.number().min(0).optional().nullable(),
    restSeconds: z.number().int().min(0).max(600).optional().nullable(),
    notes: z.string().max(200).optional().nullable(),
    sortOrder: z.number().int().min(0).default(0)
  })).min(1)
})

export const MealTemplateSchema = z.object({
  name: z.string().min(3).max(100),
  mealType: z.enum(['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']),
  description: z.string().max(500).optional(),
  isPublic: z.boolean().default(false),
  foodItems: z.array(z.object({
    name: z.string().min(1).max(100),
    quantity: z.number().min(0),
    unit: z.string().min(1).max(20),
    calories: z.number().min(0).optional().nullable(),
    protein: z.number().min(0).optional().nullable(),
    carbs: z.number().min(0).optional().nullable(),
    fats: z.number().min(0).optional().nullable(),
    sortOrder: z.number().int().min(0).default(0)
  })).min(1)
})
```

### 2.3 Backend - API Routes

**Archivo nuevo**: `code/app/api/templates/workouts/route.ts`
- GET: Listar templates (user + public)
- POST: Crear template

**Archivo nuevo**: `code/app/api/templates/workouts/[id]/route.ts`
- GET: Obtener template
- PUT: Actualizar template
- DELETE: Eliminar template

**Archivo nuevo**: `code/app/api/templates/workouts/[id]/load/route.ts`
- GET: Cargar ejercicios del template para pre-fill

**Archivo nuevo**: `code/app/api/templates/meals/route.ts`
**Archivo nuevo**: `code/app/api/templates/meals/[id]/route.ts`
**Archivo nuevo**: `code/app/api/templates/meals/[id]/load/route.ts`

### 2.4 Frontend - Componentes de Templates

**Archivo nuevo**: `code/components/templates/WorkoutTemplateSelector.tsx`
- Dropdown de templates disponibles
- Preview de ejercicios
- Botón "Load Template"

**Archivo nuevo**: `code/components/templates/WorkoutTemplateManager.tsx`
- Lista de templates del usuario
- CRUD UI (create/edit/delete)
- Toggle public/private

**Archivo nuevo**: `code/components/templates/MealTemplateSelector.tsx`
**Archivo nuevo**: `code/components/templates/MealTemplateManager.tsx`

### 2.5 Integración con Formularios

**Modificar**: `code/components/workouts/WorkoutForm.tsx`

```typescript
// Agregar arriba del formulario
<WorkoutTemplateSelector
  onLoadTemplate={async (templateId) => {
    const response = await fetch(`/api/templates/workouts/${templateId}/load`)
    const { exercises } = await response.json()
    form.setValue('exercises', exercises) // Pre-fill con RHF
  }}
/>
```

**Modificar**: `code/components/nutrition/MealForm.tsx`
- Similar integración

### 2.6 Páginas de Gestión

**Archivo nuevo**: `code/app/dashboard/templates/workouts/page.tsx`
- Server Component
- Fetch templates del usuario
- Renderizar WorkoutTemplateManager

**Archivo nuevo**: `code/app/dashboard/templates/meals/page.tsx`

### 2.7 Seeds de Templates Públicos

**Archivo nuevo**: `code/prisma/seeds/templates-public.ts`

```typescript
// 3 workout templates públicos
const publicWorkouts = [
  {
    name: "Push Day - Hypertrophy",
    category: "Strength Training",
    exercises: [
      { type: "Bench Press", sets: 4, reps: 8-10 },
      { type: "Overhead Press", sets: 3, reps: 10-12 },
      // ...
    ]
  },
  {
    name: "Pull Day - Strength",
    exercises: [...]
  },
  {
    name: "Leg Day - Volume",
    exercises: [...]
  }
]

// 3 meal templates públicos
const publicMeals = [
  {
    name: "Keto Breakfast",
    mealType: "BREAKFAST",
    foodItems: [
      { name: "Eggs", quantity: 3, unit: "pieces", protein: 18, fats: 15 },
      { name: "Bacon", quantity: 3, unit: "strips", protein: 9, fats: 12 },
      // ...
    ]
  },
  // ...
]
```

### 2.8 Testing Fase 2

**Test E2E**:
- [ ] Crear workout template con 3 ejercicios
- [ ] Template se guarda correctamente
- [ ] Cargar template en WorkoutForm
- [ ] Verificar ejercicios pre-cargados
- [ ] Modificar valores y crear workout
- [ ] Template público visible para otros usuarios
- [ ] Template privado solo visible para owner
- [ ] Crear meal template con macros
- [ ] Macros calculados automáticamente (trigger)
- [ ] Cargar en MealForm

**Criterios de éxito Fase 2**:
- ✅ Templates CRUD completo
- ✅ Pre-fill funciona sin errores
- ✅ Templates públicos compartibles
- ✅ Macros auto-calculados (meals)

---

## 📊 FASE 3: ANALYTICS & VISUALIZACIÓN (Días 8-11)

### Objetivos
- [x] Queries de agregación para todos los módulos
- [x] API endpoints de analytics
- [x] Componentes Recharts
- [x] Dashboard de analytics

### 3.1 Schema Extensions para Family Analytics

**Migración**: `code/prisma/migrations/YYYYMMDDHHMMSS_add_family_catalog_references/migration.sql`

```sql
-- Agregar referencias de catálogo a Family tables
ALTER TABLE family_members
  ADD COLUMN relationship_id VARCHAR(30) REFERENCES catalog_items(id) ON DELETE RESTRICT;

ALTER TABLE events
  ADD COLUMN event_category_id VARCHAR(30) REFERENCES catalog_items(id) ON DELETE RESTRICT;

ALTER TABLE reminders
  ADD COLUMN reminder_category_id VARCHAR(30) REFERENCES catalog_items(id) ON DELETE RESTRICT;

ALTER TABLE time_logs
  ADD COLUMN activity_type_id VARCHAR(30) REFERENCES catalog_items(id) ON DELETE RESTRICT,
  ADD COLUMN social_circle_id VARCHAR(30) REFERENCES catalog_items(id) ON DELETE RESTRICT;

-- Índices para analytics
CREATE INDEX idx_family_members_relationship ON family_members(relationship_id);
CREATE INDEX idx_events_category ON events(event_category_id);
CREATE INDEX idx_reminders_category ON reminders(reminder_category_id);
CREATE INDEX idx_time_logs_circle_date ON time_logs(user_id, social_circle_id, date);

-- Mantener campos legacy como nullable durante transición
-- relationship, event_type, reminder_type, activity quedan como VARCHAR nullable
```

**Modificar**: `code/prisma/schema.prisma`
- Agregar campos de catálogo a FamilyMember, Event, Reminder, TimeLog
- Agregar relaciones en CatalogItem

### 3.2 Backend - Queries de Agregación

**Archivo nuevo**: `code/lib/analytics/queries.ts`

```typescript
/**
 * FINANCE: Portfolio Allocation by Asset Class
 */
export async function getPortfolioAllocation(userId: string): Promise<{
  categoryId: string
  categoryName: string
  categoryIcon?: string
  categoryColor?: string
  totalValue: number
  percentage: number
  investments: number
}[]>

/**
 * GYM: Volume Load by Exercise Type (over time)
 */
export async function getVolumeByExerciseType(
  userId: string,
  startDate: Date,
  endDate: Date,
  groupBy: 'day' | 'week' | 'month'
): Promise<{
  exerciseTypeId: string
  exerciseTypeName: string
  data: Array<{ date: string; volume: number; workouts: number }>
}[]>

/**
 * FAMILY: Time Spent by Social Circle
 */
export async function getTimeByCircle(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  circleId: string
  circleName: string
  circleIcon?: string
  totalMinutes: number
  percentage: number
  interactions: number
}[]>

/**
 * NUTRITION: Macros Distribution by Meal Type
 */
export async function getMacrosByMealType(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<{
  mealType: MealType
  data: Array<{
    date: string
    protein: number
    carbs: number
    fats: number
    calories: number
  }>
}[]>
```

### 3.3 Backend - API Endpoints

**Archivo nuevo**: `code/app/api/analytics/portfolio-allocation/route.ts`
- GET: Allocation data

**Archivo nuevo**: `code/app/api/analytics/gym-volume/route.ts`
- GET: Volume data
- Query params: startDate, endDate, groupBy

**Archivo nuevo**: `code/app/api/analytics/family-time/route.ts`
- GET: Time by circle
- Query params: startDate, endDate

**Archivo nuevo**: `code/app/api/analytics/nutrition-macros/route.ts`
- GET: Macros by meal type
- Query params: startDate, endDate

### 3.4 Frontend - Instalar Recharts

```bash
npm install recharts
npm install --save-dev @types/recharts
```

### 3.5 Frontend - Componentes de Charts

**Archivo nuevo**: `code/components/analytics/FinanceAllocationChart.tsx`

```typescript
'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

export default function FinanceAllocationChart() {
  const [data, setData] = useState<AllocationData[]>([])

  useEffect(() => {
    fetch('/api/analytics/portfolio-allocation')
      .then(res => res.json())
      .then(result => setData(result.data))
  }, [])

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="totalValue"
          nameKey="categoryName"
          label={({ categoryName, percentage }) =>
            `${categoryName}: ${percentage.toFixed(1)}%`
          }
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.categoryColor || '#3B82F6'} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => `$${value.toLocaleString()}`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
```

**Archivo nuevo**: `code/components/analytics/GymVolumeChart.tsx`
- LineChart multi-series
- Una línea por exercise type
- Selector de groupBy (day/week/month)

**Archivo nuevo**: `code/components/analytics/FamilyTimeChart.tsx`
- BarChart horizontal
- Barras por círculo social

**Archivo nuevo**: `code/components/analytics/NutritionMacrosChart.tsx`
- BarChart stacked
- Protein/Carbs/Fats por día

### 3.6 Frontend - Página de Analytics

**Archivo nuevo**: `code/app/dashboard/analytics/page.tsx`

```typescript
import { Suspense } from 'react'
import FinanceAllocationChart from '@/components/analytics/FinanceAllocationChart'
import GymVolumeChart from '@/components/analytics/GymVolumeChart'
import FamilyTimeChart from '@/components/analytics/FamilyTimeChart'
import NutritionMacrosChart from '@/components/analytics/NutritionMacrosChart'

export default async function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-gray-600">Visual insights across all modules</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<ChartSkeleton />}>
          <FinanceAllocationChart />
        </Suspense>

        <Suspense fallback={<ChartSkeleton />}>
          <GymVolumeChart />
        </Suspense>

        <Suspense fallback={<ChartSkeleton />}>
          <FamilyTimeChart />
        </Suspense>

        <Suspense fallback={<ChartSkeleton />}>
          <NutritionMacrosChart />
        </Suspense>
      </div>
    </div>
  )
}
```

### 3.7 Optimización - Índices de BD

**Migración**: `code/prisma/migrations/YYYYMMDDHHMMSS_add_analytics_indexes/migration.sql`

```sql
-- Finance analytics
CREATE INDEX idx_investments_analytics ON investments(user_id, type_id) INCLUDE (current_value, amount);

-- Gym analytics
CREATE INDEX idx_exercises_analytics ON exercises(workout_id, exercise_type_id, sets, reps, weight);
CREATE INDEX idx_workouts_user_date ON workouts(user_id, date);

-- Nutrition analytics
CREATE INDEX idx_meals_user_date_type ON meals(user_id, date, meal_type);
CREATE INDEX idx_food_items_meal ON food_items(meal_id);

-- Family analytics
CREATE INDEX idx_time_logs_analytics ON time_logs(user_id, social_circle_id, date, duration);
```

### 3.8 Testing Fase 3

**Test E2E**:
- [ ] Navegar a /dashboard/analytics
- [ ] 4 gráficos cargan sin errores
- [ ] Finance pie chart muestra allocation correcta
- [ ] Gym line chart muestra volumen progresivo
- [ ] Family bar chart muestra tiempo por círculo
- [ ] Nutrition stacked bar muestra macros
- [ ] Crear nueva inversión → pie chart actualiza (refresh)
- [ ] Cambiar groupBy en Gym → data actualiza
- [ ] Tooltips muestran valores correctos
- [ ] Responsive en móvil

**Criterios de éxito Fase 3**:
- ✅ Todos los gráficos renderizan
- ✅ Data es precisa
- ✅ Performance < 2s carga completa
- ✅ Responsive
- ✅ Si cambio nombre categoría, gráfico actualiza (usa IDs)

---

## 📁 ARCHIVOS CRÍTICOS A CREAR/MODIFICAR

### Crear (25 archivos nuevos)

**Backend - API**:
1. `code/app/api/catalog/search/route.ts` - Búsqueda en tiempo real
2. `code/app/api/templates/workouts/route.ts` - CRUD templates
3. `code/app/api/templates/workouts/[id]/route.ts`
4. `code/app/api/templates/workouts/[id]/load/route.ts`
5. `code/app/api/templates/meals/route.ts`
6. `code/app/api/templates/meals/[id]/route.ts`
7. `code/app/api/templates/meals/[id]/load/route.ts`
8. `code/app/api/analytics/portfolio-allocation/route.ts`
9. `code/app/api/analytics/gym-volume/route.ts`
10. `code/app/api/analytics/family-time/route.ts`
11. `code/app/api/analytics/nutrition-macros/route.ts`

**Backend - Lib**:
12. `code/lib/templates/workout-queries.ts`
13. `code/lib/templates/meal-queries.ts`
14. `code/lib/validations/templates.ts`
15. `code/lib/analytics/queries.ts`

**Frontend - Components**:
16. `code/components/catalog/SmartCombobox.tsx` - ⭐ Core component
17. `code/components/catalog/ComboboxOption.tsx`
18. `code/components/catalog/ComboboxCreateDialog.tsx`
19. `code/components/catalog/hooks/useComboboxSearch.ts`
20. `code/components/catalog/hooks/useComboboxCache.ts`
21. `code/components/templates/WorkoutTemplateSelector.tsx`
22. `code/components/templates/WorkoutTemplateManager.tsx`
23. `code/components/templates/MealTemplateSelector.tsx`
24. `code/components/templates/MealTemplateManager.tsx`
25. `code/components/analytics/FinanceAllocationChart.tsx`
26. `code/components/analytics/GymVolumeChart.tsx`
27. `code/components/analytics/FamilyTimeChart.tsx`
28. `code/components/analytics/NutritionMacrosChart.tsx`

**Frontend - Pages**:
29. `code/app/dashboard/templates/workouts/page.tsx`
30. `code/app/dashboard/templates/meals/page.tsx`
31. `code/app/dashboard/analytics/page.tsx` - ⭐ Analytics dashboard

**Seeds**:
32. `code/prisma/seeds/catalog-items-nutrition.ts`
33. `code/prisma/seeds/catalog-items-family.ts`
34. `code/prisma/seeds/templates-public.ts`

### Modificar (12 archivos existentes)

1. `code/lib/catalog/types.ts` - Agregar CatalogTypes (nutrition, family)
2. `code/app/api/catalog/route.ts` - Mejorar POST
3. `code/components/workouts/WorkoutForm.tsx` - RHF + SmartCombobox + Templates
4. `code/components/finance/TransactionForm.tsx` - RHF + SmartCombobox
5. `code/components/finance/InvestmentForm.tsx` - RHF + SmartCombobox
6. `code/components/nutrition/MealForm.tsx` - RHF + SmartCombobox + Templates
7. `code/components/family/FamilyMemberForm.tsx` - SmartCombobox para relationships
8. `code/components/family/EventForm.tsx` - SmartCombobox para event categories
9. `code/components/family/ReminderForm.tsx` - SmartCombobox para reminder categories
10. `code/components/family/TimeLogForm.tsx` - SmartCombobox para social circles
11. `code/prisma/schema.prisma` - Templates + Family catalog refs
12. `code/app/dashboard/settings/categories/page.tsx` - Tabs para nutrition/family

### Migraciones (3 nuevas)

1. `YYYYMMDDHHMMSS_add_templates_system/migration.sql` - Templates tables
2. `YYYYMMDDHHMMSS_add_family_catalog_references/migration.sql` - Family catalog refs
3. `YYYYMMDDHHMMSS_add_analytics_indexes/migration.sql` - Performance indexes

---

## ⚙️ DECISIONES DE ARQUITECTURA

### 1. Smart Combobox: Modal vs Dropdown Inline
**Decisión**: Modal Dialog (Opción A)
- ✅ Permite formulario completo (parent, icon, color)
- ✅ Mejor validación y UX
- ✅ Consistente con CategoryManager actual
- ❌ Requiere click extra

### 2. Debouncing
**Decisión**: 300ms con AbortController
- Balance entre UX y performance
- Cancela requests anteriores (evita race conditions)

### 3. Caching
**Decisión**: Client-side Map (opcional)
- Cache local por componente
- No persiste entre refreshes
- TTL 5 minutos

### 4. Templates Públicos
**Decisión**: isPublic flag
- Por defecto private
- Usuario opta-in a compartir
- Permisos: owner puede editar, otros solo ver

### 5. Analytics Caching
**Decisión**: Sin cache server-side (primera versión)
- Fetch directo a BD cada vez
- Índices para optimizar
- Opcional: Redis cache (TTL 5min) en futuro

### 6. React Hook Form
**Decisión**: Migrar todos los formularios
- Mejor manejo de estado
- Validación integrada
- Ya instalado, no usado actualmente

---

## 🚀 TIMELINE ESTIMADO

**Total**: 11 días de desarrollo

- **Días 1-3**: Fase 1 - Smart Combobox
- **Días 4-7**: Fase 2 - Templates & Rutinas
- **Días 8-11**: Fase 3 - Analytics & Visualización

**Hitos**:
- Día 3: SmartCombobox funcional en 3 módulos
- Día 7: Templates pre-cargables
- Día 11: Analytics dashboard completo

---

## 📊 MÉTRICAS DE ÉXITO

1. **Performance**:
   - Búsqueda < 500ms
   - Analytics página < 2s carga completa
   - No lag en typing (debouncing efectivo)

2. **UX**:
   - Creación inline sin refresh
   - Templates pre-cargan correctamente
   - Gráficos interactivos y responsive

3. **Data Integrity**:
   - Cambio de nombre categoría → gráfico actualiza (usa IDs)
   - Macros calculados automáticamente (trigger)
   - No datos huérfanos (foreign keys)

4. **Accesibilidad**:
   - Keyboard navigation en combobox
   - ARIA labels correctos
   - Responsive móvil

---

## 🔧 CONSIDERACIONES TÉCNICAS

### Performance
- Índices compuestos en BD para analytics
- Tree-shaking de Recharts
- Lazy loading de Dialog (code splitting)
- useMemo/useCallback para optimizar re-renders

### Seguridad
- Validación Zod en cliente y servidor
- Authorization checks (userId) en queries
- RLS policies (ya implementadas)
- Sanitización de inputs

### Escalabilidad
- Paginación en búsquedas (limit 20)
- Virtual scrolling si > 100 resultados (opcional)
- Cache strategy para analytics (futuro)
- CDN para assets (Recharts bundle)

---

## 📝 PRÓXIMOS PASOS POST-IMPLEMENTACIÓN

1. **Export Analytics** (CSV/PDF)
2. **Templates - Likes/Favorites** (community features)
3. **AI Suggestions** (usando templates populares)
4. **Mobile App** (React Native con misma API)
5. **Real-time Updates** (WebSockets para analytics)

---

**Última actualización**: 2025-12-15
**Versión del plan**: 1.0
**Aprobado por**: Usuario (implementación completa seleccionada)
