# Fase 2: Core Modules (Weeks 3-6)

**Status:** ⏳ PENDIENTE
**Duración Estimada:** 4 semanas (160-200 horas)
**Prerrequisito:** Fase 1 ✅ Completada
**Arquitectura:** PostgreSQL + NextAuth.js + Prisma (NO Supabase)

---

## 🏗️ Contexto Arquitectónico

**IMPORTANTE:** Esta fase asume que Fase 1 se implementó con **PostgreSQL + NextAuth + Prisma**.

**Stack Tecnológico:**
- **Base de Datos:** PostgreSQL 15 (puerto 5433, aislado)
- **Autenticación:** NextAuth.js v5 (CredentialsProvider, JWT sessions)
- **ORM:** Prisma Client (type-safe queries)
- **UI:** Next.js 15 App Router + Server Components + Server Actions
- **Validación:** Zod schemas

**Diferencias vs Documentación Original:**
- ❌ NO usar `createClient` de Supabase
- ❌ NO usar RLS policies (se implementa en código)
- ✅ Usar `prisma.workout.findMany({ where: { userId: user.id } })`
- ✅ Usar `requireAuth()` de NextAuth en lugar de `supabase.auth.getUser()`
- ✅ Todas las queries DEBEN filtrar por `userId` (RLS equivalent)

**Referencia Completa:**
- Plan de migración: `/home/badfaceserverlap/.claude/plans/golden-floating-robin.md`
- Fase 1: `fases/fase1-foundation.md` (implementación PostgreSQL + NextAuth)

---

## 📋 Objetivos de la Fase

Implementar los 4 módulos principales del dashboard con formularios interactivos y operaciones CRUD completas.

### Semana 3 - Gym Training Tracker
- Formulario de workouts con gestión de ejercicios
- Lista de workouts con filtros y búsqueda
- Gráficos de progreso (peso máximo, volumen total)
- Operaciones CRUD completas

### Semana 4 - Finance & Investment Tracker
- Formulario de transacciones con categorías
- Dashboard financiero con resumen mensual
- Gestión de inversiones y portfolios
- Gráficos de gastos e ingresos

### Semana 5 - Nutrition Tracker
- Formulario de comidas y food items
- Calculadora de macros
- Seguimiento de metas nutricionales
- Gráficos de progreso nutricional

### Semana 6 - Family CRM
- Gestión de miembros familiares
- Time tracking y actividades
- Recordatorios y eventos
- Calendario familiar

---

## ✅ Pre-Requisitos (VALIDAR ANTES DE EMPEZAR)

```bash
# 1. Fase 1 completada
ls -l projects/personal-dashboard-project/code/app/dashboard
# Debe existir layout.tsx y page.tsx

# 2. PostgreSQL corriendo en puerto 5433
docker ps | grep dashboard-postgres
# Esperado: dashboard-postgres (healthy)

# 3. Base de datos con schema completo (20 tablas)
psql -h localhost -p 5433 -U dashboard_user -d dashboard -c "\dt" | wc -l
# Debe mostrar 20+ tablas (4 auth + 16 dashboard)

# 4. Verificar tablas principales
psql -h localhost -p 5433 -U dashboard_user -d dashboard -c "
  SELECT tablename FROM pg_tables
  WHERE schemaname = 'public'
  ORDER BY tablename;
"
# Esperado: users, workouts, exercises, transactions, meals, etc.

# 5. Next.js corriendo en development
cd projects/personal-dashboard-project/code
npm run dev
# http://localhost:3000 debe retornar HTML

# 6. Login funcional
# Navegar a http://localhost:3000/login y probar con:
# Email: test@dashboard.com (o el usuario creado en Fase 1)
# Password: password123

# 7. Dashboard protegido por auth
curl -I http://localhost:3000/dashboard
# Esperado: 307 redirect a /login (sin auth)
```

---

## 🚀 Prompt de Inicio para Nueva Conversación

```
Hola, voy a iniciar Fase 2 del proyecto Personal Dashboard (Core Modules).

CONTEXTO:
- Fase 0 (Seguridad) y Fase 1 (Foundation) completadas
- Arquitectura: PostgreSQL + NextAuth + Prisma (NO Supabase)
- Next.js 15 corriendo con autenticación NextAuth funcionando
- PostgreSQL 15 en puerto 5433 con 20 tablas (Prisma schema)
- Usuario de prueba: test@dashboard.com

STACK TECNOLÓGICO:
- PostgreSQL 15 (puerto 5433)
- NextAuth.js v5 (CredentialsProvider, JWT sessions)
- Prisma ORM (type-safe queries)
- Next.js 15 (App Router, Server Components, Server Actions)

OBJETIVO FASE 2:
Implementar los 4 módulos principales con formularios CRUD:
- Semana 3: Gym Training Tracker
- Semana 4: Finance & Investment Tracker
- Semana 5: Nutrition Tracker
- Semana 6: Family CRM

IMPORTANTE:
- Todas las queries usan Prisma Client
- Autenticación con requireAuth() de NextAuth
- Implementar RLS equivalent: SIEMPRE filtrar por userId
- NO usar Supabase clients

Por favor lee:
- @fases/fase2-core-modules.md (este archivo)
- @fases/fase1-foundation.md (arquitectura y setup)
- @/home/badfaceserverlap/.claude/plans/golden-floating-robin.md (plan completo)

Valida los pre-requisitos antes de empezar.
```

---

## 📝 Semana 3: Gym Training Tracker

### Archivos a crear:

**1. Server Actions:**
- `actions/gym.actions.ts` - addWorkout, updateWorkout, deleteWorkout, getWorkouts, getWorkoutProgress

**2. Zod Schemas:**
- `lib/validators/gym.ts` - workoutSchema, exerciseSchema

**3. Páginas:**
- `app/(dashboard)/dashboard/gym/page.tsx` - Vista principal con lista
- `app/(dashboard)/dashboard/gym/new/page.tsx` - Formulario nuevo workout
- `app/(dashboard)/dashboard/gym/[id]/page.tsx` - Detalle y edición

**4. Componentes:**
- `components/modules/gym/WorkoutForm.tsx` - Formulario con ejercicios dinámicos
- `components/modules/gym/WorkoutCard.tsx` - Card para lista
- `components/modules/gym/ProgressChart.tsx` - Gráfico con Recharts
- `components/modules/gym/ExerciseList.tsx` - Lista de ejercicios editable

### Funcionalidad Core:
- ✅ Crear workout con múltiples ejercicios
- ✅ Editar workout existente
- ✅ Eliminar workout
- ✅ Ver historial de workouts
- ✅ Gráfico de progreso (peso máximo por ejercicio)
- ✅ Filtrar por fecha y nombre

---

## 📝 Semana 4: Finance & Investment Tracker

### Archivos a crear:

**1. Server Actions:**
- `actions/finance.actions.ts` - addTransaction, updateTransaction, deleteTransaction, getTransactions, getMonthlySummary
- `actions/investments.actions.ts` - addInvestment, updateInvestment, deleteInvestment, getPortfolio

**2. Zod Schemas:**
- `lib/validators/finance.ts` - transactionSchema, investmentSchema, budgetSchema

**3. Páginas:**
- `app/(dashboard)/dashboard/finance/page.tsx` - Dashboard financiero
- `app/(dashboard)/dashboard/finance/transactions/page.tsx` - Lista de transacciones
- `app/(dashboard)/dashboard/finance/investments/page.tsx` - Portfolio de inversiones
- `app/(dashboard)/dashboard/finance/budgets/page.tsx` - Gestión de presupuestos

**4. Componentes:**
- `components/modules/finance/TransactionForm.tsx`
- `components/modules/finance/MonthlySummaryChart.tsx` - Gráfico de resumen
- `components/modules/finance/CategoryBreakdown.tsx` - Pie chart de categorías
- `components/modules/finance/InvestmentCard.tsx`
- `components/modules/finance/ExportButton.tsx` - Exportar a CSV

### Funcionalidad Core:
- ✅ CRUD transacciones con categorías y tags
- ✅ Soft delete para transacciones (deleted_at)
- ✅ Dashboard con resumen mensual
- ✅ Gráficos de ingresos vs gastos
- ✅ Gestión de inversiones con ROI
- ✅ Presupuestos mensuales por categoría
- ✅ Exportar transacciones a CSV

---

## 📝 Semana 5: Nutrition Tracker

### Archivos a crear:

**1. Server Actions:**
- `actions/nutrition.actions.ts` - addMeal, updateMeal, deleteMeal, getMeals, getDailySummary, updateNutritionGoals

**2. Zod Schemas:**
- `lib/validators/nutrition.ts` - mealSchema, foodItemSchema, nutritionGoalsSchema

**3. Páginas:**
- `app/(dashboard)/dashboard/nutrition/page.tsx` - Vista diaria con macros
- `app/(dashboard)/dashboard/nutrition/meals/page.tsx` - Historial de comidas
- `app/(dashboard)/dashboard/nutrition/goals/page.tsx` - Configurar metas

**4. Componentes:**
- `components/modules/nutrition/MealForm.tsx`
- `components/modules/nutrition/FoodItemForm.tsx`
- `components/modules/nutrition/MacrosSummary.tsx`
- `components/modules/nutrition/DailyProgressChart.tsx`
- `components/modules/nutrition/NutritionGoalsForm.tsx`

### Funcionalidad Core:
- ✅ Registrar comidas con múltiples food items
- ✅ Calcular calorías y macros automáticamente
- ✅ Comparar con metas nutricionales diarias
- ✅ Gráficos de progreso semanal
- ✅ Filtrar por tipo de comida (breakfast, lunch, dinner, snack)

---

## 📝 Semana 6: Family CRM

### Archivos a crear:

**1. Server Actions:**
- `actions/family.actions.ts` - addFamilyMember, updateFamilyMember, deleteFamilyMember, addTimeLog, addEvent, addReminder

**2. Zod Schemas:**
- `lib/validators/family.ts` - familyMemberSchema, timeLogSchema, eventSchema, reminderSchema

**3. Páginas:**
- `app/(dashboard)/dashboard/family/page.tsx` - Lista de miembros
- `app/(dashboard)/dashboard/family/[id]/page.tsx` - Detalle de miembro con time logs
- `app/(dashboard)/dashboard/family/calendar/page.tsx` - Calendario de eventos
- `app/(dashboard)/dashboard/family/reminders/page.tsx` - Lista de reminders

**4. Componentes:**
- `components/modules/family/FamilyMemberCard.tsx`
- `components/modules/family/TimeLogForm.tsx`
- `components/modules/family/EventCalendar.tsx`
- `components/modules/family/ReminderList.tsx`
- `components/modules/family/BirthdayAlert.tsx`

### Funcionalidad Core:
- ✅ Gestión de miembros familiares con foto
- ✅ Registrar tiempo dedicado a cada miembro
- ✅ Calendario de eventos con recordatorios
- ✅ Lista de reminders con prioridades
- ✅ Alertas de cumpleaños próximos
- ✅ Estadísticas de tiempo familiar

---

## ✅ Checklist de Completado de Fase 2

### Semana 3:
- [ ] Módulo Gym completamente funcional
- [ ] CRUD operations funcionando
- [ ] Gráficos de progreso mostrando datos
- [ ] Formulario dinámico de ejercicios
- [ ] Tests unitarios pasando

### Semana 4:
- [ ] Módulo Finance completamente funcional
- [ ] Transacciones con categorías y tags
- [ ] Dashboard financiero con resumen
- [ ] Soft delete implementado
- [ ] Exportar a CSV funcionando

### Semana 5:
- [ ] Módulo Nutrition completamente funcional
- [ ] Cálculo automático de macros
- [ ] Comparación con metas nutricionales
- [ ] Gráficos de progreso

### Semana 6:
- [ ] Módulo Family CRM completamente funcional
- [ ] Time tracking funcionando
- [ ] Calendario de eventos
- [ ] Reminders con notificaciones

---

## 📊 Comandos de Validación Final

```bash
# 1. Verificar que todos los módulos son accesibles
curl -I http://localhost:3000/dashboard/gym
curl -I http://localhost:3000/dashboard/finance
curl -I http://localhost:3000/dashboard/nutrition
curl -I http://localhost:3000/dashboard/family
# Todos deben retornar 200 OK (después de login)

# 2. Verificar que hay datos en las tablas
docker exec -i supabase-db psql -U postgres -c "
  SELECT
    (SELECT COUNT(*) FROM public.workouts) AS workouts,
    (SELECT COUNT(*) FROM public.transactions) AS transactions,
    (SELECT COUNT(*) FROM public.meals) AS meals,
    (SELECT COUNT(*) FROM public.family_members) AS family_members;
"
# Debe mostrar conteos > 0 después de crear datos de prueba

# 3. Verificar que RLS funciona correctamente
# Intentar acceder a datos de otro usuario debe fallar
# (crear test con 2 usuarios)

# 4. Verificar performance de queries
docker exec -i supabase-db psql -U postgres -c "
  EXPLAIN ANALYZE
  SELECT * FROM public.workouts
  WHERE user_id = 'ae654fde-f767-4ae7-b4ec-4cb6815d4a3d'
  ORDER BY date DESC
  LIMIT 10;
"
# Debe usar índices y ser rápido (< 10ms)
```

---

## 🔄 Rollback de Fase 2

Si necesitas revertir:

```bash
# Eliminar datos de prueba
docker exec -i supabase-db psql -U postgres << 'EOF'
DELETE FROM public.workouts;
DELETE FROM public.transactions;
DELETE FROM public.meals;
DELETE FROM public.family_members;
EOF

# Restaurar código desde git
cd /home/badfaceserverlap/docker/contenedores
git log --oneline --grep="Fase 1" -1
# Encontrar commit de Fase 1 completada
git reset --hard [commit-hash-fase-1]
```

---

## 📚 Referencias Útiles

- **Recharts Documentation:** https://recharts.org/
- **React Hook Form:** https://react-hook-form.com/
- **Zod Validation:** https://zod.dev/
- **Date-fns:** https://date-fns.org/

---

## 🎯 Próxima Fase

**Fase 3 - AI Integration (Semanas 7-8):**
Integrar n8n workflows, Flowise chatflows y Qdrant vector search para análisis inteligente de datos.

Ver: `projects/personal-dashboard-project/fases/fase3-ai-integration.md`

---

**Fecha de creación:** 2025-12-09
**Estado:** ⏳ PENDIENTE
**Fase siguiente:** Fase 3 - AI Integration
