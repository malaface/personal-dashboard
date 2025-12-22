# dashboard-postgres-operations

---
**version**: 1.0.0
**last_updated**: 2025-12-21
**category**: Infrastructure & DevOps
**priority**: CRÍTICA
**dependencies**: docker, postgresql-client-15, prisma-cli (5.22.0), ts-node, @prisma/client (5.22.0)
**related_skills**: database-management (AI Platform), postgresql-advanced-patterns, docker-operations, dashboard-dev-workflow
**database_info**:
  - container: dashboard-postgres
  - port: 5434 (external) → 5432 (internal)
  - database: dashboard
  - user: dashboard_user
  - network: dashboard_internal
  - tables: 23
  - migrations: 7+ applied
---

## 📖 Overview

Comprehensive PostgreSQL + Prisma ORM management skill specifically for the **Personal Dashboard** project. This skill covers database operations, migrations, performance tuning, and monitoring for the dashboard's PostgreSQL 15 instance running on port 5434.

**What This Skill Covers:**
- Backup and restore procedures using pg_dump/pg_restore
- Prisma migrations lifecycle (dev, deploy, rollback, schema sync)
- Performance optimization (query tuning, indexes, VACUUM, connection pooling)
- Monitoring and debugging (pg_stat_activity, locks, slow queries)

**What Makes This Different from `database-management` Skill:**
- **This skill:** Dashboard-specific (port 5434, Prisma ORM, `dashboard_user`)
- **database-management:** AI Platform generic (port 5432, Supabase, `postgres` user)

**Key Architecture:**
- **ORM:** Prisma 5.22.0 (NOT Supabase)
- **Authentication:** NextAuth.js (NOT Supabase Auth)
- **Database:** PostgreSQL 15 (Alpine) in Docker
- **Schema:** 23 tables across 4 modules (Gym, Finance, Nutrition, Family)
- **Isolation:** User data isolated via `userId` foreign keys with CASCADE delete

---

## 🎯 When to Invoke This Skill

**Auto-invoke when detecting keywords:**
- `prisma` or `npx prisma`
- `dashboard-postgres` or `dashboard-db` container
- `port 5434` or `5434:5432`
- `migration` (in dashboard context)
- `seed` or `seeding` (dashboard catalog data)
- `DATABASE_URL` (Prisma connection string)
- `schema.prisma` (Prisma schema file)
- `dashboard database` or `dashboard DB`
- `@prisma/client` or `PrismaClient`

**Auto-invoke when detecting code patterns:**
```typescript
import { prisma } from '@/lib/db/prisma'
npx prisma migrate dev
npx prisma generate
DATABASE_URL="postgresql://dashboard_user..."
```

**Auto-invoke when detecting phrases:**
- "backup dashboard database"
- "create prisma migration"
- "optimize prisma query"
- "check migration status"
- "run seed scripts"
- "dashboard database connection"

**Manual invoke when:**
- Planning database schema changes for dashboard
- Troubleshooting Prisma migrations
- Optimizing dashboard queries
- Setting up backup automation for dashboard DB
- Investigating database performance issues
- Managing Prisma Client generation

**When NOT to use this skill:**
- AI Platform database operations → Use `database-management` instead
- Supabase operations → Use `database-management` instead
- Generic PostgreSQL theory → Use `postgresql-advanced-patterns` instead
- Container management → Use `docker-operations` instead

---

## 📦 Versions & Dependencies

**Database Stack:**
- **PostgreSQL**: 15.x (Alpine Docker image)
- **Prisma**: 5.22.0
- **@prisma/client**: 5.22.0
- **@auth/prisma-adapter**: 2.11.1 (NextAuth.js integration)

**Supporting Tools:**
- **Docker**: Dashboard container (`dashboard-postgres`)
- **PostgreSQL Client**: 15.x (for pg_dump, pg_restore, psql)
- **ts-node**: For TypeScript seed scripts
- **Node.js**: 18+ (for Prisma CLI)

**Database Configuration:**
- **Container Name:** `dashboard-postgres`
- **Port Mapping:** 5434:5432 (host:container)
- **Database Name:** `dashboard`
- **User:** `dashboard_user`
- **Password:** Environment variable `${DASHBOARD_DB_PASSWORD}`
- **Network:** `dashboard_internal` (isolated bridge network)
- **Data Volume:** `dashboard_postgres_data`
- **Timezone:** America/Mexico_City

**Connection String Format:**
```bash
# Development
DATABASE_URL="postgresql://dashboard_user:PASSWORD@localhost:5434/dashboard"

# Production (Docker internal)
DATABASE_URL="postgresql://dashboard_user:PASSWORD@dashboard-postgres:5432/dashboard"
```

---

## 🚨 Critical Rules (NEVER Break)

### Prisma Migrations

**1. ❌ NUNCA ejecutar migrations sin backup previo**
```bash
# SIEMPRE hacer backup ANTES de migrar
cd /home/badfaceserverlap/personal-dashboard
docker exec dashboard-postgres pg_dump -U dashboard_user -Fc dashboard > \
  backups/pre-migration-$(date +%Y%m%d-%H%M%S).dump

# Verificar que el backup existe y tiene tamaño > 0
ls -lh backups/pre-migration-*.dump
```

**2. ❌ NUNCA usar `prisma db push` en producción**
- `prisma db push` ignora migration history y puede perder datos
- Solo usar en desarrollo para prototipado rápido
```bash
# ❌ MAL en producción
npx prisma db push

# ✅ BIEN en producción
npx prisma migrate deploy
```

**3. ❌ NUNCA modificar schema.prisma sin crear migration**
```bash
# Después de modificar code/prisma/schema.prisma
cd /home/badfaceserverlap/personal-dashboard/code
npx prisma migrate dev --name descripcion_del_cambio

# Esto crea:
# - prisma/migrations/YYYYMMDDHHMMSS_descripcion_del_cambio/migration.sql
# - Actualiza migration history en la DB
```

**4. ❌ NUNCA usar `prisma migrate reset` en producción**
- Esto BORRA toda la data, elimina la DB y recrea desde cero
- Solo para desarrollo local o testing
```bash
# ❌ NUNCA en producción
npx prisma migrate reset

# ✅ Solo en desarrollo
npx prisma migrate reset --skip-seed  # Resetear sin seeds
```

**5. ❌ NUNCA olvidar `npx prisma generate` después de schema changes**
```bash
# Secuencia correcta después de modificar schema
cd /home/badfaceserverlap/personal-dashboard/code
npx prisma migrate dev --name add_user_field
npx prisma generate  # ← CRÍTICO: Regenera Prisma Client

# En CI/CD o producción
npx prisma generate
npx prisma migrate deploy
```

### PostgreSQL Operations

**6. ❌ NUNCA hacer operaciones masivas sin transacciones**
```typescript
// ❌ MAL - sin transacción, falla parcial deja DB inconsistente
await prisma.transaction.deleteMany({ where: { userId } })
await prisma.budget.deleteMany({ where: { userId } })
await prisma.workout.deleteMany({ where: { userId } })

// ✅ BIEN - con transacción, todo o nada
await prisma.$transaction([
  prisma.transaction.deleteMany({ where: { userId } }),
  prisma.budget.deleteMany({ where: { userId } }),
  prisma.workout.deleteMany({ where: { userId } })
])

// ✅ MEJOR - con transaction callback (puede hacer lógica compleja)
await prisma.$transaction(async (tx) => {
  const user = await tx.user.findUnique({ where: { id: userId } })
  if (!user) throw new Error('User not found')

  await tx.transaction.deleteMany({ where: { userId } })
  await tx.budget.deleteMany({ where: { userId } })
  await tx.user.delete({ where: { id: userId } })
})
```

**7. ❌ NUNCA exponer DATABASE_URL en Client Components**
```typescript
// ❌ MAL - en Client Component
'use client'
const dbUrl = process.env.DATABASE_URL  // Expuesto en el navegador!

// ✅ BIEN - solo en Server Components o API Routes
// app/api/users/route.ts
import { prisma } from '@/lib/db/prisma'
export async function GET() {
  const users = await prisma.user.findMany()  // Server-side only
  return Response.json(users)
}
```

**8. ❌ NUNCA ignorar errores de Prisma Client**
```typescript
try {
  await prisma.user.create({ data: { email: 'test@example.com' } })
} catch (error) {
  // Prisma error codes: https://www.prisma.io/docs/reference/api-reference/error-reference
  if (error.code === 'P2002') {
    // Unique constraint violation
    return { error: 'Email already exists' }
  }
  if (error.code === 'P2025') {
    // Record not found
    return { error: 'User not found' }
  }
  throw error  // Re-throw unknown errors
}
```

### Best Practices

**9. ✅ SIEMPRE usar Prisma Client singleton pattern**
```typescript
// ✅ BIEN - importar desde singleton
import { prisma } from '@/lib/db/prisma'  // code/lib/db/prisma.ts

// ❌ MAL - crear múltiples instancias
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()  // Agota connection pool!
```

**10. ✅ SIEMPRE verificar migration status antes de deploy**
```bash
cd /home/badfaceserverlap/personal-dashboard/code
npx prisma migrate status

# Output esperado:
# Database schema is up to date!
#
# No pending migrations
```

**11. ✅ SIEMPRE usar named migrations**
```bash
# ✅ BIEN - descriptive name
npx prisma migrate dev --name add_user_preferences_table
npx prisma migrate dev --name add_workout_templates_system

# ❌ MAL - nombre genérico o sin nombre
npx prisma migrate dev  # Genera timestamp genérico
```

**12. ✅ SIEMPRE ejecutar seeds después de fresh migrations**
```bash
# Después de reset o nueva instalación
cd /home/badfaceserverlap/personal-dashboard/code
npx prisma migrate deploy
npm run prisma:seed  # Ejecuta seeds para catalog items

# Verifica que seed funcionó
docker exec dashboard-postgres psql -U dashboard_user -d dashboard -c \
  "SELECT COUNT(*) FROM catalog_items WHERE is_system = true;"
# Debe retornar > 100 (system catalog items)
```

---

## 📚 SECTION 1: Backups & Restore

### 1.1 Manual Backup Operations

#### Full Database Backup (Recommended Format)

```bash
cd /home/badfaceserverlap/personal-dashboard

# Custom format (-Fc) - mejor opción (permite restore parcial, comprimido)
docker exec dashboard-postgres pg_dump -U dashboard_user -Fc dashboard > \
  backups/dashboard-$(date +%Y%m%d-%H%M%S).dump

# Verificar que el backup se creó correctamente
ls -lh backups/dashboard-*.dump

# Backup con timestamp legible
docker exec dashboard-postgres pg_dump -U dashboard_user -Fc dashboard > \
  backups/dashboard-$(date +%Y-%m-%d_%H-%M-%S).dump
```

#### Schema-Only Backup (For Documentation)

```bash
# Solo estructura (sin datos) - útil para comparar schemas
docker exec dashboard-postgres pg_dump -U dashboard_user --schema-only dashboard > \
  backups/schema-only-$(date +%Y%m%d).sql

# Ver el contenido
head -50 backups/schema-only-*.sql
```

#### Data-Only Backup

```bash
# Solo datos (sin estructura) - útil para testing
docker exec dashboard-postgres pg_dump -U dashboard_user --data-only dashboard > \
  backups/data-only-$(date +%Y%m%d).sql
```

#### Specific Table Backup

```bash
# Backup de una tabla específica
docker exec dashboard-postgres pg_dump -U dashboard_user -t workouts dashboard > \
  backups/workouts-backup-$(date +%Y%m%d).sql

# Múltiples tablas
docker exec dashboard-postgres pg_dump -U dashboard_user \
  -t workouts -t exercises -t workout_progress dashboard > \
  backups/gym-module-backup-$(date +%Y%m%d).sql
```

#### Backup Verification

```bash
# Listar contenido del backup (custom format)
pg_restore --list backups/dashboard-20251221.dump | head -30

# Verificar tamaño (debe ser > 0)
ls -lh backups/dashboard-20251221.dump

# Ver metadata
pg_restore --schema-only backups/dashboard-20251221.dump | head -50
```

### 1.2 Automated Backups

#### Daily Backup Script

```bash
# Crear script de backup automatizado
cat > /home/badfaceserverlap/personal-dashboard/scripts/backup-daily.sh <<'EOF'
#!/bin/bash
set -e

BACKUP_DIR="/home/badfaceserverlap/personal-dashboard/backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
CONTAINER="dashboard-postgres"
DB_USER="dashboard_user"
DB_NAME="dashboard"

# Crear directorio si no existe
mkdir -p "$BACKUP_DIR"

# Backup
echo "Starting backup: $TIMESTAMP"
docker exec $CONTAINER pg_dump -U $DB_USER -Fc $DB_NAME > \
  "$BACKUP_DIR/dashboard-$TIMESTAMP.dump"

# Verificar
if [ $? -eq 0 ]; then
  echo "Backup completed: dashboard-$TIMESTAMP.dump"
  ls -lh "$BACKUP_DIR/dashboard-$TIMESTAMP.dump"
else
  echo "Backup FAILED!"
  exit 1
fi

# Cleanup: Mantener solo últimos 7 días
find "$BACKUP_DIR" -name "dashboard-*.dump" -mtime +7 -delete
echo "Old backups cleaned (>7 days)"
EOF

chmod +x /home/badfaceserverlap/personal-dashboard/scripts/backup-daily.sh
```

#### Setup Cron Job

```bash
# Editar crontab
crontab -e

# Agregar línea para backup diario a las 3:00 AM
0 3 * * * /home/badfaceserverlap/personal-dashboard/scripts/backup-daily.sh >> /home/badfaceserverlap/personal-dashboard/logs/backup.log 2>&1
```

#### Backup Retention Strategy

```
Daily: 7 backups (últimos 7 días)
Weekly: 4 backups (últimos 4 domingos)
Monthly: 3 backups (últimos 3 meses)
```

### 1.3 Restore Procedures

#### Full Database Restore

```bash
cd /home/badfaceserverlap/personal-dashboard

# PASO 1: Detener aplicación (evita conexiones activas)
docker-compose stop nextjs-dashboard

# PASO 2: Eliminar conexiones activas
docker exec dashboard-postgres psql -U dashboard_user -d postgres -c \
  "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='dashboard';"

# PASO 3: Drop y recrear database
docker exec dashboard-postgres psql -U dashboard_user -d postgres -c "DROP DATABASE IF EXISTS dashboard;"
docker exec dashboard-postgres psql -U dashboard_user -d postgres -c "CREATE DATABASE dashboard OWNER dashboard_user;"

# PASO 4: Restaurar desde backup
docker exec -i dashboard-postgres pg_restore -U dashboard_user -d dashboard < backups/dashboard-20251221.dump

# PASO 5: Verificar restore
docker exec dashboard-postgres psql -U dashboard_user -d dashboard -c "\dt"
docker exec dashboard-postgres psql -U dashboard_user -d dashboard -c "SELECT COUNT(*) FROM users;"

# PASO 6: Reiniciar aplicación
docker-compose start nextjs-dashboard
```

#### Schema-Only Restore

```bash
# Restaurar solo estructura
docker exec -i dashboard-postgres psql -U dashboard_user -d dashboard < backups/schema-only.sql
```

#### Specific Table Restore

```bash
# Restaurar tabla específica (sobreescribe data existente)
docker exec -i dashboard-postgres psql -U dashboard_user -d dashboard < backups/workouts-backup.sql
```

#### Point-in-Time Recovery (PITR) Setup

**Nota:** Requiere configuración de WAL archiving (avanzado)

```bash
# Configurar WAL archiving en docker-compose.yml
# Agregar en servicio dashboard-postgres:
#   command: >
#     postgres
#     -c wal_level=replica
#     -c archive_mode=on
#     -c archive_command='cp %p /var/lib/postgresql/wal_archive/%f'
#   volumes:
#     - ./wal_archive:/var/lib/postgresql/wal_archive

# Luego, PITR permite restaurar a timestamp específico
```

### 1.4 Post-Restore Verification

```bash
# Verificar conteo de tablas
docker exec dashboard-postgres psql -U dashboard_user -d dashboard -c "\dt" | wc -l
# Debe mostrar 23+ tablas

# Verificar conteo de rows en tablas principales
docker exec dashboard-postgres psql -U dashboard_user -d dashboard -c "
  SELECT
    schemaname,
    tablename,
    (SELECT count(*) FROM (SELECT 1 FROM dashboard.public.users LIMIT 1000) t) as row_count
  FROM pg_tables
  WHERE schemaname = 'public'
  ORDER BY tablename;
"

# Verificar constraints
docker exec dashboard-postgres psql -U dashboard_user -d dashboard -c "\d+ users"

# Verificar migration history
docker exec dashboard-postgres psql -U dashboard_user -d dashboard -c "SELECT * FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 5;"

# Regenerar Prisma Client (por si acaso)
cd /home/badfaceserverlap/personal-dashboard/code
npx prisma generate
```

---

## 📚 SECTION 2: Prisma Migrations

### 2.1 Migration Development Workflow

#### Creating a New Migration

```bash
cd /home/badfaceserverlap/personal-dashboard/code

# Modificar prisma/schema.prisma primero
# Ejemplo: Agregar campo 'bio' a Profile

# Crear migration
npx prisma migrate dev --name add_bio_to_profile

# Proceso automático:
# 1. Prisma genera SQL en prisma/migrations/YYYYMMDDHHMMSS_add_bio_to_profile/migration.sql
# 2. Aplica migration a DB
# 3. Regenera Prisma Client
# 4. Actualiza _prisma_migrations table
```

#### Migration File Anatomy

```sql
-- Migration: 20251221120000_add_bio_to_profile/migration.sql

-- AlterTable
ALTER TABLE "profiles" ADD COLUMN "bio" TEXT;
```

#### Reviewing Migration Before Applying

```bash
# Crear migration sin aplicar (--create-only)
npx prisma migrate dev --name add_feature --create-only

# Revisar SQL generado
cat prisma/migrations/$(ls -t prisma/migrations | head -1)/migration.sql

# Si está bien, aplicar manualmente
npx prisma migrate dev
```

### 2.2 Production Migration Deployment

#### Pre-Deployment Checklist

```bash
# 1. Backup de producción
docker exec dashboard-postgres pg_dump -U dashboard_user -Fc dashboard > \
  backups/prod-pre-deploy-$(date +%Y%m%d-%H%M%S).dump

# 2. Verificar pending migrations
npx prisma migrate status

# 3. Test migration en staging/dev primero
npx prisma migrate dev  # En dev

# 4. Review migration files
ls -la prisma/migrations/
```

#### Deploying to Production

```bash
cd /home/badfaceserverlap/personal-dashboard/code

# Generar Prisma Client
npx prisma generate

# Deploy migrations (NO corre seeds, NO crea new migrations)
npx prisma migrate deploy

# Output esperado:
# Applying migration `20251221120000_add_bio_to_profile`
# The following migration have been applied:
# migrations/
#   └─ 20251221120000_add_bio_to_profile/
#     └─ migration.sql
# All migrations have been successfully applied.
```

#### Post-Deployment Verification

```bash
# Verificar migration status
npx prisma migrate status
# Output: Database schema is up to date!

# Verificar schema
docker exec dashboard-postgres psql -U dashboard_user -d dashboard -c "\d+ profiles"

# Test query con nuevo campo
docker exec dashboard-postgres psql -U dashboard_user -d dashboard -c \
  "SELECT id, user_id, bio FROM profiles LIMIT 1;"
```

### 2.3 Handling Failed Migrations

#### Scenario: Migration Failed Mid-Execution

```bash
# Si migration falló, Prisma marca como "failed" en _prisma_migrations

# Ver migrations fallidas
docker exec dashboard-postgres psql -U dashboard_user -d dashboard -c \
  "SELECT * FROM _prisma_migrations WHERE finished_at IS NULL;"

# Resolver manualmente:
# 1. Revisar qué parte del SQL falló
cat prisma/migrations/FAILED_MIGRATION/migration.sql

# 2. Fix el issue en DB manualmente (si es posible)
docker exec -it dashboard-postgres psql -U dashboard_user -d dashboard
# Ejecutar comandos SQL para fix manual

# 3. Marcar migration como resuelta
npx prisma migrate resolve --applied MIGRATION_NAME
# O como rollback
npx prisma migrate resolve --rolled-back MIGRATION_NAME
```

### 2.4 Rollback Strategies

**Nota:** Prisma no tiene rollback automático. Requiere crear nueva migration.

#### Manual Rollback via New Migration

```bash
# Ejemplo: Rollback de "add_bio_to_profile"

# Crear migration inversa
npx prisma migrate dev --name remove_bio_from_profile --create-only

# Editar manualmente el SQL
cat > prisma/migrations/$(ls -t prisma/migrations | head -1)/migration.sql <<'EOF'
-- AlterTable (reverting add_bio_to_profile)
ALTER TABLE "profiles" DROP COLUMN "bio";
EOF

# Aplicar
npx prisma migrate dev
```

#### Rollback via Database Restore

```bash
# Opción más segura para rollbacks grandes
docker-compose stop nextjs-dashboard
docker exec -i dashboard-postgres pg_restore -U dashboard_user -d dashboard < backups/pre-migration.dump
docker-compose start nextjs-dashboard
```

### 2.5 Schema Synchronization

#### Detect Schema Drift

```bash
# Comparar Prisma schema vs DB actual
npx prisma db pull  # Introspect DB → genera schema.prisma temporal

# Ver diferencias
diff prisma/schema.prisma prisma/schema.prisma.new

# Generar migration para sync
npx prisma migrate diff --from-schema-datamodel prisma/schema.prisma \
  --to-schema-datasource prisma/schema.prisma --script > drift-fix.sql
```

#### Push Schema Without Migrations (Dev Only!)

```bash
# ❌ NUNCA en producción
npx prisma db push

# Solo para:
# - Prototipado rápido en dev
# - Testing local
# - No mantiene migration history
```

### 2.6 Prisma Generate

#### When to Run

```bash
# Regenerar Prisma Client cuando:
# - Cambias schema.prisma
# - Instalas dependencies en nuevo environment
# - Cambias generator config
# - Después de git pull con schema changes

cd /home/badfaceserverlap/personal-dashboard/code
npx prisma generate

# Output:
# ✔ Generated Prisma Client (5.22.0) to ./node_modules/@prisma/client
```

#### Binary Targets for Docker

```prisma
// prisma/schema.prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "linux-musl-openssl-3.0.x"]  // Alpine Docker
}
```

### 2.7 Seed Operations

#### Running Seeds

```bash
cd /home/badfaceserverlap/personal-dashboard/code

# Ejecutar todos los seeds
npm run prisma:seed

# Output esperado:
# Seeding catalog items...
# ✓ Finance categories (50 items)
# ✓ Gym exercise types (30 items)
# ✓ Nutrition categories (25 items)
# ✓ Family relationship types (15 items)
# Seed completed!
```

#### Seed File Structure

```typescript
// prisma/seeds/main.ts
import { PrismaClient } from '@prisma/client'
import { seedCatalogItems } from './catalog-items'
import { seedGymCatalog } from './catalog-items-gym'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  await seedCatalogItems(prisma)
  await seedGymCatalog(prisma)

  console.log('Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

#### Verify Seed Data

```bash
# Verificar catalog items
docker exec dashboard-postgres psql -U dashboard_user -d dashboard -c \
  "SELECT catalog_type, COUNT(*) FROM catalog_items WHERE is_system = true GROUP BY catalog_type;"

# Output esperado:
#       catalog_type       | count
# -------------------------+-------
#  transaction_category    |    50
#  exercise_type           |    30
#  nutrition_category      |    25
#  relationship_type       |    15
```

---

## 📚 SECTION 3: Performance Tuning

### 3.1 Prisma Query Optimization

#### N+1 Query Problem

```typescript
// ❌ BAD - N+1 problem (1 query para users + N queries para workouts)
const users = await prisma.user.findMany()
for (const user of users) {
  const workouts = await prisma.workout.findMany({
    where: { userId: user.id }
  })
  console.log(`${user.name}: ${workouts.length} workouts`)
}
// 1 + N queries (si hay 100 users = 101 queries!)

// ✅ GOOD - Single query con include
const users = await prisma.user.findMany({
  include: {
    workouts: true
  }
})
users.forEach(user => {
  console.log(`${user.name}: ${user.workouts.length} workouts`)
})
// Solo 1 query!

// ✅ BETTER - Select only needed fields
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    workouts: {
      select: {
        id: true,
        name: true,
        date: true
      }
    }
  }
})
// 1 query + menos data transferida
```

#### Batch Operations

```typescript
// ❌ BAD - Multiple inserts en loop
for (const workout of workouts) {
  await prisma.workout.create({ data: workout })
}
// N queries

// ✅ GOOD - Single batch insert
const result = await prisma.workout.createMany({
  data: workouts,
  skipDuplicates: true  // Ignora errores de unique constraint
})
console.log(`Inserted ${result.count} workouts`)
// 1 query

// Batch updates
await prisma.transaction.updateMany({
  where: { userId: 'user123' },
  data: { amount: { multiply: 1.1 } }  // Incrementar 10%
})
```

#### Pagination

```typescript
// Cursor-based pagination (mejor para datasets grandes)
const workouts = await prisma.workout.findMany({
  take: 20,
  skip: 1,  // Skip cursor
  cursor: {
    id: lastWorkoutId  // ID del último workout de página anterior
  },
  orderBy: {
    date: 'desc'
  }
})

// Offset-based pagination (más simple pero slower)
const page = 2
const pageSize = 20
const workouts = await prisma.workout.findMany({
  take: pageSize,
  skip: (page - 1) * pageSize,
  orderBy: { date: 'desc' }
})
```

### 3.2 Index Management

#### Creating Indexes in Schema

```prisma
// prisma/schema.prisma

model Workout {
  id     String @id @default(cuid())
  userId String
  date   DateTime
  name   String

  @@index([userId, date])  // Composite index
  @@index([userId])        // Single column index
}

model Transaction {
  id         String @id
  userId     String
  categoryId String?
  date       DateTime

  @@index([userId, date])
  @@index([categoryId])
  @@index([userId, categoryId])  // Para filtros combinados
}
```

#### Analyzing Index Usage

```sql
-- Ver índices de una tabla
docker exec dashboard-postgres psql -U dashboard_user -d dashboard -c "\d+ workouts"

-- Ver índices no usados (candidatos para eliminar)
docker exec dashboard-postgres psql -U dashboard_user -d dashboard -c "
  SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    pg_size_pretty(pg_relation_size(indexrelid)) as index_size
  FROM pg_stat_user_indexes
  WHERE idx_scan = 0
  ORDER BY pg_relation_size(indexrelid) DESC;
"

-- Ver índices más usados
docker exec dashboard-postgres psql -U dashboard_user -d dashboard -c "
  SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
  FROM pg_stat_user_indexes
  WHERE idx_scan > 0
  ORDER BY idx_scan DESC
  LIMIT 20;
"
```

### 3.3 EXPLAIN ANALYZE

#### Running EXPLAIN on Prisma Queries

```typescript
// Activar query logging en Prisma
const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' }
  ]
})

prisma.$on('query', (e) => {
  console.log('Query: ' + e.query)
  console.log('Params: ' + e.params)
  console.log('Duration: ' + e.duration + 'ms')
})

// Ejecutar query
const workouts = await prisma.workout.findMany({
  where: { userId: 'user123' },
  include: { exercises: true }
})
```

#### Manual EXPLAIN ANALYZE

```bash
# Copiar query del log de Prisma
docker exec -it dashboard-postgres psql -U dashboard_user -d dashboard

# Ejecutar EXPLAIN ANALYZE
EXPLAIN ANALYZE
SELECT * FROM workouts WHERE user_id = 'user123';

# Output:
# Seq Scan on workouts  (cost=0.00..15.50 rows=1 width=100) (actual time=0.020..0.025 rows=1 loops=1)
#   Filter: (user_id = 'user123'::text)
# Planning Time: 0.100 ms
# Execution Time: 0.050 ms

# Si ves "Seq Scan" en tabla grande → Necesitas índice!
```

### 3.4 Database Maintenance

#### VACUUM Operations

```bash
# VACUUM recupera espacio de rows eliminados
docker exec dashboard-postgres psql -U dashboard_user -d dashboard -c "VACUUM VERBOSE ANALYZE;"

# VACUUM específica tabla
docker exec dashboard-postgres psql -U dashboard_user -d dashboard -c "VACUUM VERBOSE ANALYZE workouts;"

# VACUUM FULL (más agresivo, lockea tabla)
docker exec dashboard-postgres psql -U dashboard_user -d dashboard -c "VACUUM FULL VERBOSE ANALYZE transactions;"
```

#### Check Table Bloat

```bash
docker exec dashboard-postgres psql -U dashboard_user -d dashboard -c "
  SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows,
    ROUND(100 * n_dead_tup / NULLIF(n_live_tup + n_dead_tup, 0), 2) as bloat_pct
  FROM pg_stat_user_tables
  ORDER BY n_dead_tup DESC
  LIMIT 10;
"
```

### 3.5 Connection Pooling

#### Prisma Connection Pool Config

```typescript
// lib/db/prisma.ts
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

// Connection pool se configura en DATABASE_URL
// DATABASE_URL="postgresql://user:pass@localhost:5434/dashboard?connection_limit=10&pool_timeout=20"
```

#### Monitor Connections

```bash
docker exec dashboard-postgres psql -U dashboard_user -d dashboard -c "
  SELECT
    count(*) as total_connections,
    count(*) FILTER (WHERE state = 'active') as active,
    count(*) FILTER (WHERE state = 'idle') as idle
  FROM pg_stat_activity
  WHERE datname = 'dashboard';
"
```

---

## 📚 SECTION 4: Monitoring & Debugging

### 4.1 PostgreSQL Activity Monitoring

#### Active Connections

```bash
docker exec dashboard-postgres psql -U dashboard_user -d dashboard -c "
  SELECT
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query_start,
    state_change,
    LEFT(query, 60) as query_preview
  FROM pg_stat_activity
  WHERE datname = 'dashboard'
  ORDER BY query_start DESC;
"
```

#### Long-Running Queries

```bash
docker exec dashboard-postgres psql -U dashboard_user -d dashboard -c "
  SELECT
    pid,
    now() - query_start AS duration,
    state,
    query
  FROM pg_stat_activity
  WHERE state != 'idle'
    AND query_start < now() - interval '1 minute'
    AND datname = 'dashboard'
  ORDER BY duration DESC;
"
```

#### Kill Long-Running Query

```bash
# Identificar PID problemático
docker exec dashboard-postgres psql -U dashboard_user -d dashboard -c "
  SELECT pid, state, query
  FROM pg_stat_activity
  WHERE state = 'active' AND datname = 'dashboard';
"

# Terminar query (PID = 12345)
docker exec dashboard-postgres psql -U dashboard_user -d dashboard -c "SELECT pg_terminate_backend(12345);"
```

### 4.2 Lock Detection

#### View Current Locks

```bash
docker exec dashboard-postgres psql -U dashboard_user -d dashboard -c "
  SELECT
    locktype,
    relation::regclass as table_name,
    mode,
    pid,
    granted
  FROM pg_locks
  WHERE database = (SELECT oid FROM pg_database WHERE datname = 'dashboard')
    AND relation IS NOT NULL
  ORDER BY granted, relation;
"
```

#### Deadlock Detection

```bash
docker exec dashboard-postgres psql -U dashboard_user -d dashboard -c "
  SELECT
    blocked_locks.pid AS blocked_pid,
    blocked_activity.query AS blocked_query,
    blocking_locks.pid AS blocking_pid,
    blocking_activity.query AS blocking_query
  FROM pg_catalog.pg_locks blocked_locks
  JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
  JOIN pg_catalog.pg_locks blocking_locks
    ON blocking_locks.locktype = blocked_locks.locktype
    AND blocking_locks.pid != blocked_locks.pid
  JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
  WHERE NOT blocked_locks.granted;
"
```

### 4.3 Prisma Debugging

#### Enable Query Logging

```typescript
// lib/db/prisma.ts
const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' }
  ]
})

prisma.$on('query', (e) => {
  console.log(`Query: ${e.query}`)
  console.log(`Duration: ${e.duration}ms`)
})
```

#### Raw SQL Queries

```typescript
// Cuando necesitas SQL custom
const result = await prisma.$queryRaw`
  SELECT
    u.id,
    u.email,
    COUNT(w.id) as workout_count
  FROM users u
  LEFT JOIN workouts w ON w.user_id = u.id
  GROUP BY u.id
  ORDER BY workout_count DESC
  LIMIT 10;
`

// Ejecutar SQL sin retornar resultados
await prisma.$executeRaw`
  UPDATE transactions
  SET amount = amount * 1.1
  WHERE user_id = ${userId};
`
```

### 4.4 Docker Logs

#### View Container Logs

```bash
# Ver últimos 100 logs
docker logs dashboard-postgres --tail 100

# Seguir logs en tiempo real
docker logs dashboard-postgres --follow

# Filtrar por error
docker logs dashboard-postgres 2>&1 | grep ERROR
```

### 4.5 Health Checks

#### Database Connectivity

```bash
# Ping test
docker exec dashboard-postgres pg_isready -U dashboard_user

# Connection test
docker exec dashboard-postgres psql -U dashboard_user -d dashboard -c "SELECT 1;"

# Version check
docker exec dashboard-postgres psql -U dashboard_user -d dashboard -c "SELECT version();"
```

#### Migration Status

```bash
cd /home/badfaceserverlap/personal-dashboard/code
npx prisma migrate status

# Output esperado:
# Database schema is up to date!
```

### 4.6 Database Size Monitoring

#### Database Size

```bash
docker exec dashboard-postgres psql -U dashboard_user -d dashboard -c "
  SELECT pg_size_pretty(pg_database_size('dashboard')) as database_size;
"
```

#### Table Sizes

```bash
docker exec dashboard-postgres psql -U dashboard_user -d dashboard -c "
  SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as index_size
  FROM pg_tables
  WHERE schemaname = 'public'
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
  LIMIT 20;
"
```

---

## 📚 Quick Reference Commands

```bash
# === BACKUP ===
docker exec dashboard-postgres pg_dump -U dashboard_user -Fc dashboard > backup.dump

# === RESTORE ===
docker exec -i dashboard-postgres pg_restore -U dashboard_user -d dashboard < backup.dump

# === MIGRATIONS ===
cd /home/badfaceserverlap/personal-dashboard/code
npx prisma migrate dev --name migration_name     # Dev: create + apply
npx prisma migrate deploy                        # Prod: apply only
npx prisma migrate status                        # Check status
npx prisma generate                              # Regenerate client

# === SEEDS ===
npm run prisma:seed

# === MONITORING ===
docker exec dashboard-postgres psql -U dashboard_user -d dashboard -c "SELECT COUNT(*) FROM pg_stat_activity WHERE datname='dashboard';"
docker exec dashboard-postgres psql -U dashboard_user -d dashboard -c "SELECT pg_size_pretty(pg_database_size('dashboard'));"

# === LOGS ===
docker logs dashboard-postgres --tail 100 --follow

# === PSQL ACCESS ===
docker exec -it dashboard-postgres psql -U dashboard_user -d dashboard
```

---

## 🔧 Troubleshooting Common Issues

### "Migration failed" Error

```bash
# Ver migrations fallidas
docker exec dashboard-postgres psql -U dashboard_user -d dashboard -c \
  "SELECT * FROM _prisma_migrations WHERE finished_at IS NULL;"

# Resolver manualmente
npx prisma migrate resolve --applied MIGRATION_NAME
# O rollback
npx prisma migrate resolve --rolled-back MIGRATION_NAME
```

### "Prisma Client not generated"

```bash
cd /home/badfaceserverlap/personal-dashboard/code
rm -rf node_modules/.prisma
npx prisma generate
```

### "Connection pool exhausted"

```bash
# Verificar conexiones activas
docker exec dashboard-postgres psql -U dashboard_user -d dashboard -c \
  "SELECT count(*) FROM pg_stat_activity WHERE datname='dashboard';"

# Aumentar connection_limit en DATABASE_URL
# DATABASE_URL="...?connection_limit=20"
```

### "Schema drift detected"

```bash
npx prisma migrate diff --from-schema-datamodel prisma/schema.prisma \
  --to-schema-datasource prisma/schema.prisma
```

---

## 🔗 Related Skills

- **database-management** - Generic PostgreSQL operations (AI Platform)
- **postgresql-advanced-patterns** - Query optimization theory
- **docker-operations** - Container lifecycle management
- **dashboard-dev-workflow** - Phase-based development process
- **dashboard-schema-reference** - Complete schema documentation
