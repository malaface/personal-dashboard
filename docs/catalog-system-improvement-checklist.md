# Checklist: Mejoras al Sistema de Catálogos

> **⚠️ DOCUMENTO OBSOLETO**
>
> Este checklist ha sido **consolidado** en el nuevo documento maestro:
> **`/home/badfaceserverlap/personal-dashboard/docs/catalog-system-implementation-guide.md`**
>
> Por favor, usa el nuevo documento que incluye:
> - ✅ Reglas de compatibilidad (Next.js 16 + React 19)
> - ✅ Estado actual verificado (14% completado)
> - ✅ Instrucciones paso a paso optimizadas para agentes LLM
> - ✅ Prevención de errores comunes
>
> **Fecha de consolidación**: 2025-12-15

---

**Proyecto**: Personal Dashboard - Catalog System Improvements
**Fecha inicio**: 2025-12-15
**Estimación**: 11 días
**Versión**: 1.0 (OBSOLETA - ver documento consolidado arriba)

---

## 📋 ÍNDICE DE PROGRESO

- [ ] **FASE 1**: Smart Combobox (Días 1-3) - 8/22 tareas
- [ ] **FASE 2**: Templates & Rutinas (Días 4-7) - 0/19 tareas
- [ ] **FASE 3**: Analytics & Visualización (Días 8-11) - 0/16 tareas

**Progreso total**: 8/57 tareas completadas (14%)

---

## 🎯 FASE 1: SMART COMBOBOX (Días 1-3)

### 1.1 Backend - API de Búsqueda ✅

- [x] **Crear** `code/app/api/catalog/search/route.ts`
  - [x] Implementar GET handler con query params (q, catalogType, parentId, limit, offset)
  - [x] Full-text search en name, description, slug
  - [x] Ranking por relevancia (exact match > contains)
  - [x] Incluir breadcrumbs (parent path)
  - [x] Paginación (default limit: 20)
  - [x] Test: TypeScript compilation exitosa + Build exitoso

- [x] **Modificar** `code/app/api/catalog/route.ts`
  - [x] Mejorar POST para validar duplicados (mismo slug + catalogType + userId) - Ya implementado en mutations.ts
  - [x] Auto-generar slug si no se provee - Ya implementado
  - [x] Retornar item completo con relaciones (parent, children) - Implementado

### 1.2 Backend - Extensión de Tipos

- [ ] **Modificar** `code/lib/catalog/types.ts`
  - [ ] Agregar CatalogTypes para Nutrition: `meal_type`, `food_category`, `unit_type`, `nutrition_goal_type`
  - [ ] Agregar CatalogTypes para Family: `relationship_type`, `event_category`, `reminder_category`, `activity_type`, `social_circle`
  - [ ] Extender interface `CatalogItem` si es necesario
  - [ ] Agregar interface `ComboboxSearchResult` con campo `match`

### 1.3 Backend - Seeds

- [ ] **Crear** `code/prisma/seeds/catalog-items-nutrition.ts`
  - [ ] Seed `meal_type`: Main Meals (Breakfast, Lunch, Dinner), Snacks, Workout Nutrition
  - [ ] Seed `food_category`: Protein Sources > Animal/Plant, Carbs, Vegetables, Fruits, Fats
  - [ ] Seed `unit_type`: Weight (grams, oz), Volume (ml, cups), Pieces
  - [ ] Seed `nutrition_goal_type`: Weight Loss, Muscle Gain, Maintenance, Performance
  - [ ] Test: `npx tsx prisma/seeds/catalog-items-nutrition.ts`

- [ ] **Crear** `code/prisma/seeds/catalog-items-family.ts`
  - [ ] Seed `relationship_type`: Immediate Family, Extended Family, Friends
  - [ ] Seed `event_category`: Celebrations, Holidays, Gatherings
  - [ ] Seed `reminder_category`: Communication, Gifts, Tasks, Health & Wellness
  - [ ] Seed `activity_type`: In-Person, Phone, Video Call, Message
  - [ ] Seed `social_circle`: Familia Cercana, Familia Extendida, Amigos, Trabajo, Networking
  - [ ] Test: `npx tsx prisma/seeds/catalog-items-family.ts`

### 1.4 Frontend - Hooks

- [ ] **Crear** `code/components/catalog/hooks/useComboboxSearch.ts`
  - [ ] Implementar estado (query, results, loading, error, hasMore)
  - [ ] Implementar debouncing (300ms default)
  - [ ] AbortController para cancelar requests previas
  - [ ] Cache local con Map (opcional)
  - [ ] Min search length: 2 caracteres
  - [ ] Función `search(query: string)`
  - [ ] Función `clearCache()`

- [ ] **Crear** `code/components/catalog/hooks/useComboboxCache.ts` (opcional)
  - [ ] Cache client-side con Map
  - [ ] TTL 5 minutos
  - [ ] Invalidación manual

### 1.5 Frontend - Componentes Core

- [ ] **Crear** `code/components/catalog/SmartCombobox.tsx` ⭐ CRÍTICO
  - [ ] Interface `SmartComboboxProps` completa (ver plan)
  - [ ] Input de búsqueda con debouncing
  - [ ] Dropdown con resultados
  - [ ] Loading states, empty states, error states
  - [ ] Keyboard navigation (arrow keys, enter, escape)
  - [ ] Accessibility (ARIA labels, roles)
  - [ ] Integración con React Hook Form (Controller)
  - [ ] Botón "Create new" cuando allowCreate=true

- [ ] **Crear** `code/components/catalog/ComboboxOption.tsx`
  - [ ] Renderizar item individual con highlight de búsqueda
  - [ ] Mostrar breadcrumb (opcional)
  - [ ] Iconos y colores
  - [ ] Hover/focus states

- [ ] **Crear** `code/components/catalog/ComboboxCreateDialog.tsx`
  - [ ] Modal Dialog (shadcn/ui)
  - [ ] Formulario: name, parentId, icon, description, color
  - [ ] Validación con Zod
  - [ ] Submit a /api/catalog (POST)
  - [ ] Callback onSuccess para actualizar lista

### 1.6 Frontend - Migración de Formularios a RHF

- [ ] **Modificar** `code/components/workouts/WorkoutForm.tsx`
  - [ ] Instalar `useForm` de react-hook-form
  - [ ] Migrar todos los useState a useForm
  - [ ] Reemplazar 3 CategorySelector con SmartCombobox:
    - [ ] exerciseTypeId (con Controller)
    - [ ] muscleGroupId (con Controller)
    - [ ] equipmentId (con Controller)
  - [ ] Test: Crear workout y verificar que guarda correctamente

- [ ] **Modificar** `code/components/finance/TransactionForm.tsx`
  - [ ] Migrar a react-hook-form
  - [ ] SmartCombobox para typeId (transaction type)
  - [ ] SmartCombobox para categoryId con cascading (parentId = typeId)
  - [ ] Test: Crear transacción

- [ ] **Modificar** `code/components/finance/InvestmentForm.tsx`
  - [ ] Migrar a react-hook-form
  - [ ] SmartCombobox para typeId (investment type)
  - [ ] Test: Crear inversión

- [ ] **Modificar** `code/components/nutrition/MealForm.tsx`
  - [ ] Migrar a react-hook-form
  - [ ] SmartCombobox para meal_type
  - [ ] SmartCombobox para food_category en cada food item
  - [ ] Test: Crear meal

- [ ] **Modificar** `code/components/family/FamilyMemberForm.tsx`
  - [ ] Migrar a react-hook-form
  - [ ] SmartCombobox para relationship_type
  - [ ] Test: Crear family member

### 1.7 Testing Fase 1

- [ ] **Test funcional del SmartCombobox**:
  - [ ] Búsqueda retorna resultados correctos
  - [ ] Búsqueda sin resultados muestra mensaje apropiado
  - [ ] Crear nuevo item inline funciona
  - [ ] Item creado aparece inmediatamente en lista (sin refresh)
  - [ ] Debouncing funciona (no hace request por cada letra)
  - [ ] AbortController cancela requests anteriores
  - [ ] Cache funciona (resultados instantáneos en cache hits)

- [ ] **Test de integración RHF**:
  - [ ] Validaciones muestran errores correctamente
  - [ ] Submit funciona con valores del combobox
  - [ ] Reset form limpia combobox
  - [ ] setValue programático actualiza combobox

- [ ] **Test de accesibilidad**:
  - [ ] Navegación con teclado (Tab, Arrow keys, Enter, Escape)
  - [ ] Screen reader friendly (ARIA labels)
  - [ ] Focus trap en modal de creación

- [ ] **Build & Deploy**:
  - [ ] `npm run build` sin errores
  - [ ] `npx tsc --noEmit` sin errores
  - [ ] Test en navegador (Chrome, Firefox, Safari)
  - [ ] Test responsive (móvil, tablet)

**✅ Criterios de completitud Fase 1**:
- SmartCombobox funciona en al menos 3 módulos
- Búsqueda < 500ms
- Creación inline sin refresh de página
- React Hook Form integrado
- Accesibilidad con teclado funcional

---

## 🏋️ FASE 2: TEMPLATES & RUTINAS (Días 4-7)

### 2.1 Schema - Nuevas Tablas

- [ ] **Crear** migración `code/prisma/migrations/YYYYMMDDHHMMSS_add_templates_system/migration.sql`
  - [ ] Crear tabla `workout_templates` (id, user_id, name, description, is_public, category)
  - [ ] Crear tabla `template_exercises` (id, template_id, exercise_type_id, muscle_group_id, equipment_id, sets, reps, weight, rest_seconds, notes, sort_order)
  - [ ] Crear tabla `meal_templates` (id, user_id, name, meal_type, description, is_public, total_calories, total_protein, total_carbs, total_fats)
  - [ ] Crear tabla `template_food_items` (id, template_id, name, quantity, unit, calories, protein, carbs, fats, sort_order)
  - [ ] Crear índices: workout_templates(user_id, is_public), template_exercises(template_id), meal_templates(user_id, meal_type, is_public), template_food_items(template_id)
  - [ ] Crear trigger `calculate_meal_template_macros()` para auto-calcular macros
  - [ ] Test: `npx prisma migrate dev --name add_templates_system`

- [ ] **Modificar** `code/prisma/schema.prisma`
  - [ ] Agregar modelo `WorkoutTemplate`
  - [ ] Agregar modelo `TemplateExercise`
  - [ ] Agregar modelo `MealTemplate`
  - [ ] Agregar modelo `TemplateFoodItem`
  - [ ] Agregar relaciones en `CatalogItem` (templateExercisesAsType, etc.)
  - [ ] Agregar relaciones en `User` (workoutTemplates, mealTemplates)
  - [ ] Test: `npx prisma generate`

### 2.2 Backend - Validaciones

- [ ] **Crear** `code/lib/validations/templates.ts`
  - [ ] Schema `WorkoutTemplateSchema` (name, description, isPublic, exercises array)
  - [ ] Schema `MealTemplateSchema` (name, mealType, description, isPublic, foodItems array)
  - [ ] Schema `TemplateExerciseSchema`
  - [ ] Schema `TemplateFoodItemSchema`

### 2.3 Backend - Queries

- [ ] **Crear** `code/lib/templates/workout-queries.ts`
  - [ ] `getUserWorkoutTemplates(userId, includePublic)`: Listar templates
  - [ ] `getWorkoutTemplateById(id, userId)`: Obtener template específico
  - [ ] `createWorkoutTemplate(data, userId)`: Crear template
  - [ ] `updateWorkoutTemplate(id, data, userId)`: Actualizar template
  - [ ] `deleteWorkoutTemplate(id, userId)`: Eliminar template (validar ownership)
  - [ ] `loadWorkoutFromTemplate(templateId, userId)`: Retornar exercises para pre-fill
  - [ ] Test unitario para cada función

- [ ] **Crear** `code/lib/templates/meal-queries.ts`
  - [ ] `getUserMealTemplates(userId, includePublic)`
  - [ ] `getMealTemplateById(id, userId)`
  - [ ] `createMealTemplate(data, userId)`
  - [ ] `updateMealTemplate(id, data, userId)`
  - [ ] `deleteMealTemplate(id, userId)`
  - [ ] `loadMealFromTemplate(templateId, userId)`
  - [ ] Test unitario para cada función

### 2.4 Backend - API Routes

- [ ] **Crear** `code/app/api/templates/workouts/route.ts`
  - [ ] GET: Listar templates (user + public)
  - [ ] POST: Crear template (validar con Zod, llamar createWorkoutTemplate)
  - [ ] Test: `curl http://localhost:3000/api/templates/workouts`

- [ ] **Crear** `code/app/api/templates/workouts/[id]/route.ts`
  - [ ] GET: Obtener template específico
  - [ ] PUT: Actualizar template (validar ownership)
  - [ ] DELETE: Eliminar template (validar ownership, validar no tiene workouts asociados)
  - [ ] Test: `curl http://localhost:3000/api/templates/workouts/[id]`

- [ ] **Crear** `code/app/api/templates/workouts/[id]/load/route.ts`
  - [ ] GET: Cargar ejercicios del template para pre-fill
  - [ ] Retornar array de exercises con valores sugeridos
  - [ ] Test: `curl http://localhost:3000/api/templates/workouts/[id]/load`

- [ ] **Crear** `code/app/api/templates/meals/route.ts`
  - [ ] GET: Listar meal templates
  - [ ] POST: Crear meal template

- [ ] **Crear** `code/app/api/templates/meals/[id]/route.ts`
  - [ ] GET, PUT, DELETE similares a workout templates

- [ ] **Crear** `code/app/api/templates/meals/[id]/load/route.ts`
  - [ ] GET: Cargar food items del template

### 2.5 Frontend - Componentes de Templates

- [ ] **Crear** `code/components/templates/WorkoutTemplateSelector.tsx`
  - [ ] Dropdown de templates disponibles (fetch de /api/templates/workouts)
  - [ ] Preview de ejercicios al hover (tooltip o popover)
  - [ ] Botón "Load Template" que llama onLoadTemplate callback
  - [ ] Estado loading mientras carga

- [ ] **Crear** `code/components/templates/WorkoutTemplateManager.tsx`
  - [ ] Lista de templates del usuario
  - [ ] Botón "Create New Template"
  - [ ] Cada template con botones Edit/Delete/Toggle Public
  - [ ] Modal para crear/editar con formulario completo
  - [ ] Drag-and-drop para ordenar ejercicios (opcional)

- [ ] **Crear** `code/components/templates/MealTemplateSelector.tsx`
  - [ ] Similar a WorkoutTemplateSelector
  - [ ] Mostrar macros totales en preview

- [ ] **Crear** `code/components/templates/MealTemplateManager.tsx`
  - [ ] Similar a WorkoutTemplateManager
  - [ ] Mostrar macros calculados

### 2.6 Frontend - Integración con Formularios

- [ ] **Modificar** `code/components/workouts/WorkoutForm.tsx`
  - [ ] Agregar `<WorkoutTemplateSelector>` arriba del formulario
  - [ ] Implementar callback `onLoadTemplate`:
    ```typescript
    const handleLoadTemplate = async (templateId: string) => {
      const response = await fetch(`/api/templates/workouts/${templateId}/load`)
      const { exercises } = await response.json()
      form.setValue('exercises', exercises) // Pre-fill con RHF
    }
    ```
  - [ ] Test: Seleccionar template → verificar que ejercicios se pre-cargan
  - [ ] Usuario puede modificar valores pre-cargados antes de submit

- [ ] **Modificar** `code/components/nutrition/MealForm.tsx`
  - [ ] Agregar `<MealTemplateSelector>`
  - [ ] Implementar callback similar
  - [ ] Test: Cargar template → verificar food items y macros

### 2.7 Frontend - Páginas de Gestión

- [ ] **Crear** `code/app/dashboard/templates/workouts/page.tsx`
  - [ ] Server Component
  - [ ] Fetch templates del usuario con `getUserWorkoutTemplates()`
  - [ ] Renderizar `<WorkoutTemplateManager>` con templates
  - [ ] Breadcrumb: Dashboard > Templates > Workouts

- [ ] **Crear** `code/app/dashboard/templates/meals/page.tsx`
  - [ ] Similar estructura
  - [ ] Fetch meal templates
  - [ ] Renderizar `<MealTemplateManager>`

### 2.8 Seeds - Templates Públicos

- [ ] **Crear** `code/prisma/seeds/templates-public.ts`
  - [ ] Crear 3 workout templates públicos:
    - [ ] "Push Day - Hypertrophy" (Bench Press, Overhead Press, Tricep Dips, etc.)
    - [ ] "Pull Day - Strength" (Deadlift, Pull-ups, Rows, etc.)
    - [ ] "Leg Day - Volume" (Squat, Leg Press, Lunges, etc.)
  - [ ] Crear 3 meal templates públicos:
    - [ ] "Keto Breakfast" (Eggs, Bacon, Avocado)
    - [ ] "Post-Workout Meal" (Chicken, Rice, Vegetables)
    - [ ] "Light Dinner" (Salad, Grilled Fish, Olive Oil)
  - [ ] Test: `npx tsx prisma/seeds/templates-public.ts`
  - [ ] Verificar en BD: `SELECT COUNT(*) FROM workout_templates WHERE is_public = true;`

### 2.9 Testing Fase 2

- [ ] **Test CRUD de templates**:
  - [ ] Crear workout template con 3 ejercicios → guardado correctamente
  - [ ] Editar template → cambios persisten
  - [ ] Eliminar template → confirmación + eliminación
  - [ ] Toggle public → flag actualiza correctamente
  - [ ] Templates públicos visibles para otros usuarios
  - [ ] Templates privados solo visibles para owner

- [ ] **Test de pre-carga**:
  - [ ] Seleccionar template en WorkoutForm → ejercicios se cargan
  - [ ] Modificar valores pre-cargados → workout guarda valores modificados
  - [ ] Seleccionar template en MealForm → food items se cargan
  - [ ] Macros calculados correctamente (trigger)

- [ ] **Test de permisos**:
  - [ ] Intentar editar template de otro usuario → error 403
  - [ ] Intentar eliminar template público de otro → error 403
  - [ ] Templates públicos: solo owner puede editar/eliminar

**✅ Criterios de completitud Fase 2**:
- Templates CRUD completo y funcional
- Pre-fill de formularios funciona sin errores
- Templates públicos visibles y compartibles
- Macros auto-calculados en meal templates (trigger funciona)
- Permisos correctos (owner vs viewer)

---

## 📊 FASE 3: ANALYTICS & VISUALIZACIÓN (Días 8-11)

### 3.1 Schema - Family Catalog References

- [ ] **Crear** migración `code/prisma/migrations/YYYYMMDDHHMMSS_add_family_catalog_references/migration.sql`
  - [ ] `ALTER TABLE family_members ADD COLUMN relationship_id VARCHAR(30) REFERENCES catalog_items(id)`
  - [ ] `ALTER TABLE events ADD COLUMN event_category_id VARCHAR(30) REFERENCES catalog_items(id)`
  - [ ] `ALTER TABLE reminders ADD COLUMN reminder_category_id VARCHAR(30) REFERENCES catalog_items(id)`
  - [ ] `ALTER TABLE time_logs ADD COLUMN activity_type_id VARCHAR(30) REFERENCES catalog_items(id)`
  - [ ] `ALTER TABLE time_logs ADD COLUMN social_circle_id VARCHAR(30) REFERENCES catalog_items(id)`
  - [ ] Crear índices: family_members(relationship_id), events(event_category_id), reminders(reminder_category_id), time_logs(user_id, social_circle_id, date)
  - [ ] Test: `npx prisma migrate dev --name add_family_catalog_references`

- [ ] **Modificar** `code/prisma/schema.prisma`
  - [ ] Agregar campos de catálogo a `FamilyMember`, `Event`, `Reminder`, `TimeLog`
  - [ ] Agregar relaciones en `CatalogItem`
  - [ ] Mantener campos legacy (relationship, event_type, etc.) como nullable
  - [ ] Test: `npx prisma generate`

### 3.2 Schema - Analytics Indexes

- [ ] **Crear** migración `code/prisma/migrations/YYYYMMDDHHMMSS_add_analytics_indexes/migration.sql`
  - [ ] Finance: `CREATE INDEX idx_investments_analytics ON investments(user_id, type_id) INCLUDE (current_value, amount);`
  - [ ] Gym: `CREATE INDEX idx_exercises_analytics ON exercises(workout_id, exercise_type_id, sets, reps, weight);`
  - [ ] Gym: `CREATE INDEX idx_workouts_user_date ON workouts(user_id, date);`
  - [ ] Nutrition: `CREATE INDEX idx_meals_user_date_type ON meals(user_id, date, meal_type);`
  - [ ] Nutrition: `CREATE INDEX idx_food_items_meal ON food_items(meal_id);`
  - [ ] Family: `CREATE INDEX idx_time_logs_analytics ON time_logs(user_id, social_circle_id, date, duration);`
  - [ ] Test: `npx prisma migrate dev --name add_analytics_indexes`

### 3.3 Backend - Queries de Agregación

- [ ] **Crear** `code/lib/analytics/queries.ts`
  - [ ] `getPortfolioAllocation(userId)`: Finance allocation por asset class
    - [ ] Agrupar inversiones por parent category (typeItem.parent)
    - [ ] Calcular totalValue, percentage, count
    - [ ] Ordenar por totalValue descendente
    - [ ] Test con mock data
  - [ ] `getVolumeByExerciseType(userId, startDate, endDate, groupBy)`: Gym volume
    - [ ] Calcular volume = sets × reps × weight
    - [ ] Agrupar por exercise type y período (day/week/month)
    - [ ] Helper `formatDateByGrouping(date, groupBy)`
    - [ ] Test con mock data
  - [ ] `getTimeByCircle(userId, startDate, endDate)`: Family time
    - [ ] Agrupar time_logs por social_circle_id
    - [ ] Sumar duration (minutos)
    - [ ] Calcular percentage del total
    - [ ] Test con mock data
  - [ ] `getMacrosByMealType(userId, startDate, endDate)`: Nutrition macros
    - [ ] Agrupar meals por meal_type y fecha
    - [ ] Sumar protein, carbs, fats, calories de food_items
    - [ ] Test con mock data

### 3.4 Backend - API Endpoints

- [ ] **Crear** `code/app/api/analytics/portfolio-allocation/route.ts`
  - [ ] GET handler
  - [ ] Auth check con `requireAuth()`
  - [ ] Llamar `getPortfolioAllocation(user.id)`
  - [ ] Retornar JSON con data
  - [ ] Test: `curl http://localhost:3000/api/analytics/portfolio-allocation`

- [ ] **Crear** `code/app/api/analytics/gym-volume/route.ts`
  - [ ] GET handler con query params (startDate, endDate, groupBy)
  - [ ] Validar dates
  - [ ] Llamar `getVolumeByExerciseType()`
  - [ ] Test: `curl "http://localhost:3000/api/analytics/gym-volume?startDate=2025-01-01&endDate=2025-12-31&groupBy=week"`

- [ ] **Crear** `code/app/api/analytics/family-time/route.ts`
  - [ ] GET handler con query params (startDate, endDate)
  - [ ] Llamar `getTimeByCircle()`
  - [ ] Test: `curl "http://localhost:3000/api/analytics/family-time?startDate=2025-01-01&endDate=2025-12-31"`

- [ ] **Crear** `code/app/api/analytics/nutrition-macros/route.ts`
  - [ ] GET handler con query params (startDate, endDate)
  - [ ] Llamar `getMacrosByMealType()`
  - [ ] Test: `curl "http://localhost:3000/api/analytics/nutrition-macros?startDate=2025-01-01&endDate=2025-12-31"`

### 3.5 Frontend - Instalar Recharts

- [ ] **Instalar dependencias**:
  - [ ] `npm install recharts`
  - [ ] `npm install --save-dev @types/recharts` (si es necesario)
  - [ ] Verificar package.json
  - [ ] Test: `npm run build` sin errores

### 3.6 Frontend - Componentes de Charts

- [ ] **Crear** `code/components/analytics/FinanceAllocationChart.tsx`
  - [ ] Client Component (`'use client'`)
  - [ ] useState para data
  - [ ] useEffect para fetch `/api/analytics/portfolio-allocation`
  - [ ] PieChart de Recharts con Pie, Cell, Tooltip, Legend
  - [ ] Colores dinámicos desde `categoryColor` o default
  - [ ] Label con `categoryName: percentage%`
  - [ ] Loading skeleton
  - [ ] Error state

- [ ] **Crear** `code/components/analytics/GymVolumeChart.tsx`
  - [ ] Client Component
  - [ ] useState para data y groupBy
  - [ ] useEffect para fetch `/api/analytics/gym-volume?groupBy={groupBy}`
  - [ ] LineChart multi-series (una línea por exercise type)
  - [ ] Selector de groupBy (day/week/month)
  - [ ] Helper `transformForMultiLine()` para Recharts format
  - [ ] XAxis: date, YAxis: volume (kg)
  - [ ] Legend automático

- [ ] **Crear** `code/components/analytics/FamilyTimeChart.tsx`
  - [ ] Client Component
  - [ ] BarChart horizontal
  - [ ] Barras por círculo social
  - [ ] Valor: total horas (duration / 60)
  - [ ] Tooltip con formato de horas

- [ ] **Crear** `code/components/analytics/NutritionMacrosChart.tsx`
  - [ ] Client Component
  - [ ] BarChart stacked
  - [ ] Stacks: protein (azul), carbs (verde), fats (naranja)
  - [ ] XAxis: date, YAxis: gramos
  - [ ] Legend con nombres claros

### 3.7 Frontend - Página de Analytics

- [ ] **Crear** `code/app/dashboard/analytics/page.tsx`
  - [ ] Server Component
  - [ ] Layout: título + descripción
  - [ ] Grid 2 columnas (lg:grid-cols-2)
  - [ ] 4 gráficos con Suspense:
    - [ ] `<FinanceAllocationChart />`
    - [ ] `<GymVolumeChart />`
    - [ ] `<FamilyTimeChart />`
    - [ ] `<NutritionMacrosChart />`
  - [ ] Skeleton loader (`<ChartSkeleton />`)
  - [ ] Sección de export (botones CSV/PDF - placeholder)
  - [ ] Breadcrumb: Dashboard > Analytics

- [ ] **Crear** `code/components/analytics/ChartSkeleton.tsx`
  - [ ] Componente de loading skeleton para charts
  - [ ] Animate pulse
  - [ ] Mismo tamaño que charts reales

### 3.8 Testing Fase 3

- [ ] **Test de endpoints**:
  - [ ] `/api/analytics/portfolio-allocation` retorna data correcta
  - [ ] `/api/analytics/gym-volume` con diferentes groupBy funciona
  - [ ] `/api/analytics/family-time` retorna data correcta
  - [ ] `/api/analytics/nutrition-macros` retorna data correcta
  - [ ] Todos los endpoints con auth (error 401 sin token)

- [ ] **Test de gráficos**:
  - [ ] Navegar a `/dashboard/analytics` → página carga sin errores
  - [ ] 4 gráficos renderizan correctamente
  - [ ] FinanceAllocationChart: pie chart con colores y porcentajes
  - [ ] GymVolumeChart: line chart con múltiples series
  - [ ] FamilyTimeChart: bar chart horizontal
  - [ ] NutritionMacrosChart: stacked bar chart
  - [ ] Tooltips muestran valores formateados correctamente
  - [ ] Legends son claras y precisas

- [ ] **Test de data accuracy**:
  - [ ] Crear nueva inversión → pie chart actualiza (con refresh)
  - [ ] Crear workout → line chart muestra nuevo data point
  - [ ] Crear time_log → bar chart actualiza
  - [ ] Crear meal → stacked bar actualiza
  - [ ] Cambiar groupBy en GymVolumeChart → data se reagrupa

- [ ] **Test de UI/UX**:
  - [ ] Performance < 2s para cargar página completa
  - [ ] Responsive en móvil (charts se adaptan)
  - [ ] Responsive en tablet
  - [ ] Loading skeletons muestran mientras carga
  - [ ] Error states si falla API

- [ ] **Test de persistencia de nombres**:
  - [ ] Cambiar nombre de categoría en settings
  - [ ] Verificar que gráfico sigue mostrando data (usa IDs, no nombres)
  - [ ] Nombre actualizado se muestra en legend/tooltip

**✅ Criterios de completitud Fase 3**:
- 4+ gráficos renderizan correctamente
- Data es precisa (verificar cálculos manualmente)
- Performance < 2s para carga completa
- Responsive en móvil y tablet
- Cambio de nombre categoría → gráfico actualiza automáticamente

---

## 🚀 DEPLOYMENT & FINALIZACIÓN

### Preparación para Deploy

- [ ] **Build final**:
  - [ ] `npm run build` sin errores
  - [ ] `npx tsc --noEmit` sin errores TypeScript
  - [ ] `npm run lint` sin warnings críticos

- [ ] **Migraciones**:
  - [ ] Todas las migraciones aplicadas en desarrollo
  - [ ] Script de rollback preparado (por si acaso)
  - [ ] Backup de BD antes de migrar en producción

- [ ] **Seeds**:
  - [ ] Todos los seeds ejecutados en desarrollo
  - [ ] Verificar counts en BD
  - [ ] Preparar seeds para producción (solo públicos)

- [ ] **Environment variables**:
  - [ ] `.env.local` actualizado
  - [ ] Variables de producción configuradas
  - [ ] Secrets no expuestos en código

### Documentación Final

- [ ] **Crear** `docs/catalog-system-improvement-summary.md`
  - [ ] Resumen ejecutivo de cambios
  - [ ] Archivos creados (con rutas)
  - [ ] Archivos modificados (con diff resumen)
  - [ ] Migraciones aplicadas
  - [ ] Nuevas funcionalidades
  - [ ] Screenshots de UI

- [ ] **Actualizar** `README.md`
  - [ ] Mencionar Smart Combobox
  - [ ] Mencionar Templates
  - [ ] Mencionar Analytics
  - [ ] Instrucciones de uso

- [ ] **Crear** `docs/smart-combobox-usage-guide.md`
  - [ ] Props del componente
  - [ ] Ejemplos de uso
  - [ ] Troubleshooting

### Git Commit

- [ ] **Stage files**:
  ```bash
  cd /home/badfaceserverlap/personal-dashboard/code
  git add [archivos específicos]
  ```

- [ ] **Health check**:
  ```bash
  cd /home/badfaceserverlap/docker/contenedores
  bash shared/scripts/health-check.sh
  ```

- [ ] **Commit**:
  ```bash
  git commit -m "feat: Sistema completo de catálogos mejorado

  ## Resumen
  Implementación completa del sistema de catálogos con Smart Combobox,
  Templates pre-cargables y Analytics Dashboard para todos los módulos.

  ## Fase 1: Smart Combobox
  - Componente searchable con debouncing (300ms)
  - Creación inline de categorías
  - Integración React Hook Form
  - Extensión a Nutrition y Family módulos

  ## Fase 2: Templates
  - Workout templates (públicos + privados)
  - Meal templates con macros auto-calculados
  - Pre-carga de formularios
  - CRUD completo

  ## Fase 3: Analytics
  - Dashboard con 4+ gráficos Recharts
  - Finance: Portfolio allocation
  - Gym: Volume progresivo
  - Nutrition: Macros por meal type
  - Family: Tiempo por círculo social

  ## Archivos creados: 34
  ## Archivos modificados: 12
  ## Migraciones: 3

  ## Build Status
  ✅ TypeScript: 0 errors
  ✅ Next.js Build: Success
  ✅ Health Check: Passed
  ✅ Tests: All passing

  🤖 Generated with [Claude Code](https://claude.com/claude-code)

  Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
  ```

---

## 📊 MÉTRICAS FINALES

### Performance
- [ ] Búsqueda SmartCombobox < 500ms
- [ ] Analytics página carga < 2s
- [ ] No lag en typing (debouncing efectivo)
- [ ] Gráficos interactivos sin lag

### Funcionalidad
- [ ] SmartCombobox funciona en 4+ módulos
- [ ] Templates pre-cargan correctamente
- [ ] Analytics muestra data precisa
- [ ] Creación inline funciona sin refresh

### Data Integrity
- [ ] Cambio nombre categoría → gráfico actualiza
- [ ] Macros calculados automáticamente (trigger)
- [ ] No datos huérfanos (foreign keys)
- [ ] Templates públicos visibles para todos

### Accesibilidad
- [ ] Keyboard navigation en combobox
- [ ] ARIA labels correctos
- [ ] Responsive móvil
- [ ] Screen reader friendly

---

## 🔗 REFERENCIAS

**Documentación de referencia**:
- Plan completo: `/home/badfaceserverlap/.claude/plans/reactive-nibbling-kernighan.md`
- Guía original: `/home/badfaceserverlap/personal-dashboard/docs/catalog-system-extension-guide.md`
- Finance implementation: `/home/badfaceserverlap/personal-dashboard/docs/catalog-system-final-summary.md`

**Archivos clave para revisar**:
- `code/components/catalog/CategorySelector.tsx` (componente actual a reemplazar)
- `code/lib/catalog/types.ts` (tipos de catálogo)
- `code/lib/catalog/queries.ts` (queries existentes)
- `code/prisma/schema.prisma` (schema actual)

**Comandos útiles**:
```bash
# Desarrollo
cd /home/badfaceserverlap/personal-dashboard/code
npm run dev

# Build
npm run build
npx tsc --noEmit

# Migraciones
npx prisma migrate dev
npx prisma generate

# Seeds
npx tsx prisma/seeds/catalog-items-nutrition.ts
npx tsx prisma/seeds/catalog-items-family.ts
npx tsx prisma/seeds/templates-public.ts

# Health check
cd /home/badfaceserverlap/docker/contenedores
bash shared/scripts/health-check.sh

# DB queries
docker exec -i supabase-db psql -U postgres -c "SELECT COUNT(*) FROM catalog_items;"
docker exec -i supabase-db psql -U postgres -c "SELECT COUNT(*) FROM workout_templates WHERE is_public = true;"
```

---

**Última actualización**: 2025-12-15
**Progreso**: 0/57 tareas (0%)
**Estado**: Listo para implementación
