# backend

---
**version**: 2.0.0
**last_updated**: 2026-02-18
**category**: Backend Stack
**priority**: CRÍTICA
**dependencies**: prisma@5.22.0, postgresql@15, next-auth@5.x, zod@4
**database**:
  container: dashboard-postgres
  port: 5434 (host) → 5432 (container)
  database: dashboard
  user: dashboard_user
  network: dashboard_internal
  tables: 31
  migrations: 13 aplicadas
---

## 🎯 Cuando invocar esta skill

**Auto-invocar con keywords:** `prisma`, `migration`, `Server Action`, `API route`, `NextAuth`, `requireAuth`, `DATABASE_URL`, `schema.prisma`, `userId`, `audit log`, `n8n`, `Flowise`, `Qdrant`, `Redis`, `seed`, `backup`, `restore`, `pg_dump`

---

## 🚨 Reglas Críticas (NUNCA romper)

1. ❌ **NUNCA consultar DB sin `userId` del session** — aislamiento de usuarios es obligatorio
2. ❌ **NUNCA `prisma db push` en producción** — usar siempre `prisma migrate deploy`
3. ❌ **NUNCA crear múltiples instancias de PrismaClient** — usar singleton de `lib/db/prisma.ts`
4. ❌ **NUNCA modificar `schema.prisma` sin crear migration** — `npx prisma migrate dev --name nombre`
5. ❌ **NUNCA olvidar `npx prisma generate`** después de cambios de schema
6. ❌ **NUNCA exponer `DATABASE_URL` en Client Components**
7. ❌ **NUNCA operaciones multi-step sin transacción** — usar `prisma.$transaction()`
8. ❌ **NUNCA ignorar errores Prisma** — manejar P2002 (unique), P2025 (not found)
9. ✅ **SIEMPRE validar con Zod en servidor** antes de tocar la DB
10. ✅ **SIEMPRE hacer backup antes de migrations en producción**

---

## 📦 Stack de datos

| Servicio | Puerto | Uso |
|---------|--------|-----|
| PostgreSQL 15 | 5434 (host) | Base de datos principal |
| Prisma 5.22.0 | — | ORM |
| NextAuth.js 5.x | — | Autenticación |
| Redis 7.2 | 6379 | Cache/sessions |
| n8n | 5678 | Automatización/webhooks |
| Flowise | 3001 | AI chatflows |
| Qdrant | 6333 | Vector DB |

---

## 🗄️ Schema — 31 tablas

```
Auth (4):           users, accounts, sessions, verification_tokens
Gym (7):            workouts, exercises, exercise_sets, workout_progress,
                    workout_templates, workout_template_exercises, cardio_sessions
Finance (6):        transactions, investments, budgets, transaction_audit,
                    financial_accounts, credit_cards
Nutrition (5):      meals, food_items, nutrition_goals, meal_templates, meal_template_items
Family (4):         family_members, time_logs, events, reminders
Shared (5):         profiles, notifications, catalog_items, audit_logs, ai_credentials
```

**Migrations aplicadas:** 13
```
20251210191349_initial_schema
20251214203208_add_audit_logs_and_security
20251215180650_add_catalog_items
20251215233631_add_gym_catalog_references
20251216051702_add_templates_system
20251216173046_add_family_catalog_references
20251216173324_add_analytics_indexes
20260106182121_add_ai_credentials
20260214180405_add_weight_unit_and_currency
20260214225453_add_financial_accounts_and_credit_cards
20260215030833_add_event_recurrence
20260215032509_add_multi_mode_training
20260218174808_add_exercise_sets
```

---

## 🔑 Autenticación (NextAuth.js)

### requireAuth helper

```typescript
// lib/auth/utils.ts
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function requireAuth() {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')
  return session
}

export async function verifyOwnership(resourceUserId: string) {
  const session = await requireAuth()
  if (resourceUserId !== session.user.id) {
    throw new Error('Forbidden')
  }
  return session
}
```

### Uso en Server Components y Actions

```typescript
// En Server Component
const session = await requireAuth()
const userId = session.user.id

// En Server Action
'use server'
export async function deleteWorkout(id: string) {
  const session = await requireAuth()
  // Verificar ownership SIEMPRE
  const workout = await prisma.workout.findUnique({
    where: { id, userId: session.user.id }  // ← SIEMPRE userId en WHERE
  })
  if (!workout) throw new Error('Not found')
  await prisma.workout.delete({ where: { id } })
}
```

---

## 🗃️ Prisma — Operaciones CRUD

### Singleton (importar siempre desde aquí)

```typescript
import { prisma } from '@/lib/db/prisma'
```

### Queries con aislamiento de usuario

```typescript
// Siempre userId en WHERE
const workouts = await prisma.workout.findMany({
  where: { userId: session.user.id },
  include: { exercises: { include: { sets: true } } },
  orderBy: { date: 'desc' },
  take: 20
})

// Con paginación cursor-based
const workouts = await prisma.workout.findMany({
  where: { userId: session.user.id },
  take: 20,
  skip: lastId ? 1 : 0,
  cursor: lastId ? { id: lastId } : undefined,
  orderBy: { date: 'desc' }
})

// NUNCA sin userId
// ❌ prisma.workout.findMany()  — expone datos de todos los usuarios
```

### Transacciones (obligatorio para multi-step)

```typescript
// Transacción simple (array)
await prisma.$transaction([
  prisma.workout.deleteMany({ where: { userId } }),
  prisma.exercise.deleteMany({ where: { userId } })
])

// Transacción con lógica compleja (callback — preferir)
await prisma.$transaction(async (tx) => {
  const user = await tx.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error('User not found')

  await tx.workout.deleteMany({ where: { userId } })
  await tx.profile.delete({ where: { userId } })
  await tx.user.delete({ where: { id: userId } })
})
```

### Manejo de errores Prisma

```typescript
import { Prisma } from '@prisma/client'

try {
  await prisma.user.create({ data: { email } })
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') return { error: 'Email ya existe' }
    if (error.code === 'P2025') return { error: 'Registro no encontrado' }
  }
  throw error
}
```

---

## 🔄 Migrations

### Desarrollo

```bash
cd /home/badfaceserverlap/personal-dashboard/code

# 1. Modificar prisma/schema.prisma
# 2. Crear y aplicar migration
npx prisma migrate dev --name descripcion_del_cambio

# Revisar SQL antes de aplicar
npx prisma migrate dev --name nombre --create-only
cat prisma/migrations/$(ls -t prisma/migrations | head -1)/migration.sql
# Si OK, aplicar:
npx prisma migrate dev

# Regenerar cliente (automático con migrate dev, manual si solo cambió config)
npx prisma generate
```

### Producción

```bash
# SIEMPRE backup primero
docker exec dashboard-postgres pg_dump -U dashboard_user -Fc dashboard > \
  /home/badfaceserverlap/personal-dashboard/backups/pre-migration-$(date +%Y%m%d-%H%M%S).dump

# Verificar
npx prisma migrate status

# Aplicar (solo deploya, no crea nuevas migrations)
npx prisma generate && npx prisma migrate deploy
```

### Rollback

```bash
# Prisma no tiene rollback automático
# Opción 1: Nueva migration inversa
npx prisma migrate dev --name revert_change --create-only
# Editar SQL manualmente, luego aplicar

# Opción 2 (más seguro): Restore desde backup
docker-compose stop nextjs-dashboard
docker exec -i dashboard-postgres pg_restore -U dashboard_user -d dashboard < backups/pre-migration.dump
docker-compose start nextjs-dashboard
```

### Seeds

```bash
cd /home/badfaceserverlap/personal-dashboard/code
npm run prisma:seed

# Verificar
docker exec dashboard-postgres psql -U dashboard_user -d dashboard -c \
  "SELECT catalog_type, COUNT(*) FROM catalog_items WHERE is_system = true GROUP BY catalog_type;"
```

---

## 🗄️ PostgreSQL — Acceso directo

```bash
# Shell interactivo
docker exec -it dashboard-postgres psql -U dashboard_user -d dashboard

# Comandos útiles dentro de psql
\dt                    # Listar tablas
\d+ workouts           # Estructura de tabla
SELECT version();      # Versión PostgreSQL

# Comandos comunes sin shell interactivo
docker exec dashboard-postgres psql -U dashboard_user -d dashboard -c "SELECT COUNT(*) FROM users;"
docker exec dashboard-postgres psql -U dashboard_user -d dashboard -c "\dt"

# Connectivity check
docker exec dashboard-postgres pg_isready -U dashboard_user
docker logs dashboard-postgres --tail 50
```

---

## 💾 Backup & Restore

```bash
# Backup completo (custom format, comprimido)
docker exec dashboard-postgres pg_dump -U dashboard_user -Fc dashboard > \
  /home/badfaceserverlap/personal-dashboard/backups/dashboard-$(date +%Y%m%d-%H%M%S).dump

# Restore completo
docker-compose stop nextjs-dashboard
docker exec dashboard-postgres psql -U dashboard_user -d postgres -c \
  "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='dashboard';"
docker exec dashboard-postgres psql -U dashboard_user -d postgres -c "DROP DATABASE IF EXISTS dashboard;"
docker exec dashboard-postgres psql -U dashboard_user -d postgres -c "CREATE DATABASE dashboard OWNER dashboard_user;"
docker exec -i dashboard-postgres pg_restore -U dashboard_user -d dashboard < backups/dashboard-YYYYMMDD.dump
docker-compose start nextjs-dashboard

# Verificar post-restore
npx prisma migrate status
docker exec dashboard-postgres psql -U dashboard_user -d dashboard -c "SELECT COUNT(*) FROM users;"
```

---

## 🔍 Monitoring & Debugging

```bash
# Conexiones activas
docker exec dashboard-postgres psql -U dashboard_user -d dashboard -c \
  "SELECT count(*) as total, count(*) FILTER (WHERE state='active') as active FROM pg_stat_activity WHERE datname='dashboard';"

# Queries lentas (>1 minuto)
docker exec dashboard-postgres psql -U dashboard_user -d dashboard -c \
  "SELECT pid, now()-query_start AS duration, state, LEFT(query,80) FROM pg_stat_activity WHERE state!='idle' AND query_start < now()-interval '1 minute' AND datname='dashboard';"

# Tamaño de tablas
docker exec dashboard-postgres psql -U dashboard_user -d dashboard -c \
  "SELECT tablename, pg_size_pretty(pg_total_relation_size('public.'||tablename)) as size FROM pg_tables WHERE schemaname='public' ORDER BY pg_total_relation_size('public.'||tablename) DESC LIMIT 10;"

# Migrations fallidas
docker exec dashboard-postgres psql -U dashboard_user -d dashboard -c \
  "SELECT migration_name, finished_at FROM _prisma_migrations WHERE finished_at IS NULL;"
```

---

## 🤖 AI Services

### n8n (Automatización)

```typescript
// lib/ai/n8n.ts
const N8N_URL = process.env.N8N_BASE_URL  // http://localhost:5678 (dev)

export async function triggerWorkflow(webhookPath: string, data: object) {
  const response = await fetch(`${N8N_URL}/webhook/${webhookPath}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return response.json()
}
```

### Redis (Cache)

```typescript
// lib/cache/redis.ts
import { Redis } from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

export async function getCached<T>(key: string, fetcher: () => Promise<T>, ttl = 3600): Promise<T> {
  const cached = await redis.get(key)
  if (cached) return JSON.parse(cached)

  const data = await fetcher()
  await redis.setex(key, ttl, JSON.stringify(data))  // TTL obligatorio
  return data
}
```

### Qdrant (Vector DB)

```typescript
// lib/ai/qdrant.ts
const QDRANT_URL = process.env.QDRANT_URL  // http://localhost:6333

export async function upsertVector(collectionName: string, id: string, vector: number[], payload: object) {
  await fetch(`${QDRANT_URL}/collections/${collectionName}/points`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'api-key': process.env.QDRANT_API_KEY! },
    body: JSON.stringify({ points: [{ id, vector, payload }] })
  })
}
```

### Reglas AI Services

- ❌ NUNCA exponer API tokens de n8n/Qdrant en cliente
- ❌ NUNCA cachear en Redis sin TTL
- ✅ SIEMPRE rate limiting en endpoints AI
- ✅ SIEMPRE sanitizar input antes de enviar a LLMs

---

## ✅ Validación Zod en servidor

```typescript
// lib/validations/gym.ts
import { z } from 'zod'

export const workoutSchema = z.object({
  name: z.string().min(3).max(100),
  date: z.string().datetime(),
  notes: z.string().optional(),
  exercises: z.array(z.object({
    name: z.string().min(1),
    sets: z.number().int().min(1).max(20),
    reps: z.number().int().min(1).max(100),
    weight: z.number().optional()
  })).min(1)
})

export type WorkoutInput = z.infer<typeof workoutSchema>
```

---

## 🔒 Audit Log

```typescript
// lib/audit/logger.ts
import { prisma } from '@/lib/db/prisma'

export async function logAudit(
  action: string,
  userId: string,
  metadata?: object
) {
  await prisma.auditLog.create({
    data: { action, userId, metadata: metadata ? JSON.stringify(metadata) : null }
  })
}

// Uso en Server Actions:
await logAudit('workout.created', session.user.id, { workoutId: workout.id })
await logAudit('transaction.deleted', session.user.id, { amount: tx.amount })
```

---

## 🔑 Variables de entorno

```bash
# code/.env.local (desarrollo)
DATABASE_URL="postgresql://dashboard_user:PASSWORD@localhost:5434/dashboard"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="[generated]"
RESEND_API_KEY="[para email verification]"
REDIS_URL="redis://:PASSWORD@localhost:6379"
N8N_BASE_URL="http://localhost:5678"
FLOWISE_BASE_URL="http://localhost:3001"
QDRANT_URL="http://localhost:6333"
QDRANT_API_KEY="[from AI Platform .env]"

# code/.env.production (Docker interno)
DATABASE_URL="postgresql://dashboard_user:PASSWORD@dashboard-postgres:5432/dashboard"
NEXTAUTH_URL="https://dashboard.malacaran8n.uk"
```
