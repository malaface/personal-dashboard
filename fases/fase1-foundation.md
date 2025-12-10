# Fase 1: Foundation - PostgreSQL + NextAuth (Weeks 1-2)

**Status:** 📋 PENDIENTE
**Duración Estimada:** 21-28 horas (3-4 días completos)
**Prerrequisito:** Fase 0 ✅ Completada
**Arquitectura:** PostgreSQL + NextAuth.js + Prisma (NO Supabase)

---

## 📋 Resumen Ejecutivo

**CAMBIO ARQUITECTÓNICO IMPORTANTE:**

Esta fase implementa una arquitectura simplificada basada en **PostgreSQL + NextAuth.js + Prisma** en lugar de Supabase.

**Razón del Cambio:**
- Reducir complejidad (3 containers vs 18 containers de Supabase)
- Control total sobre autenticación y base de datos
- Type-safety completo con Prisma
- Eliminar errores de Supabase Auth schema
- Mejor debugging y mantenimiento

**Plan Completo:** `/home/badfaceserverlap/.claude/plans/golden-floating-robin.md`

---

## 🎯 Objetivos de la Fase

Establecer infraestructura completa del dashboard con PostgreSQL aislado, autenticación NextAuth, y validar con módulo CRUD completo.

### Phase A: Docker Infrastructure (2-3 horas)
- Crear docker-compose.yml con PostgreSQL (5433) + Redis
- Generar passwords seguros
- Validar aislamiento de containers
- Confirmar zero impact en Supabase existente

### Phase B: Next.js + Prisma Setup (3-4 horas)
- Inicializar Next.js 15 con TypeScript
- Configurar Prisma ORM
- Crear schema completo (20 tablas)
- Correr migraciones iniciales

### Phase C: NextAuth.js Implementation (4-5 horas)
- Configurar CredentialsProvider
- Implementar bcrypt password hashing
- Crear registro y login
- Middleware para route protection

### Phase D: Dashboard Layout (3-4 horas)
- Layout con sidebar navigation
- Header con user dropdown
- Logout functionality
- Navegación entre módulos

### Phase E: CRUD Module Example (4-5 horas)
- Implementar módulo Gym completo
- Server Components + Server Actions
- Validar authorization patterns (RLS equivalent)
- Testing multi-user isolation

### Phase F: Dockerization (2-3 horas)
- Crear Dockerfile para Next.js
- Build production image
- Iniciar stack completo

### Phase G: Validation & Testing (3-4 horas)
- Health checks completos
- Validar zero impact en Supabase
- Testing auth flows
- Confirmar authorization

---

## ✅ Pre-Requisitos (VALIDAR ANTES DE EMPEZAR)

### 1. Infrastructure Checklist

```bash
# Ejecutar estos comandos para validar:

# ✓ Fase 0 completada
ls -lh shared/backups/ai-platform/manual-pre-dashboard-phase0/
# Resultado esperado: Backup existe (2.4GB)

# ✓ Puerto 5433 disponible (nuevo PostgreSQL)
lsof -i :5433
# Resultado esperado: Sin output (puerto libre)

# ✓ Puerto 3003 disponible (dashboard)
lsof -i :3003
# Resultado esperado: Sin output (puerto libre)

# ✓ Supabase funcionando (NO tocar)
curl http://localhost:8000/auth/v1/health
# Resultado esperado: {"status":"ok"}

# ✓ PostgreSQL existentes (NO tocar)
docker ps | grep postgres
# Resultado esperado: supabase-db, localai-postgres-1 (healthy)

# ✓ AI Platform services
docker ps | grep -E "(n8n|flowise|qdrant|redis)"
# Resultado esperado: 4 containers running

# ✓ Redes Docker existentes
docker network ls | grep -E "(localai_default|monitoring)"
# Resultado esperado: 2 redes
```

### 2. Git Status Checklist

```bash
cd /home/badfaceserverlap/docker/contenedores
git status
# Phase 0 debe estar commiteado

git log --oneline -5
# Debe incluir: fix AlertManager, cleanup postgres, Phase 0
```

### 3. Health Check

```bash
bash shared/scripts/health-check.sh
# Resultado esperado: Todos los servicios UP (excepto ai-platform-postgres-1 removido)
```

---

## 🚀 Prompt de Inicio para Nueva Conversación

**Copia este texto al iniciar Fase 1 en una conversación nueva:**

```
Hola, voy a iniciar Fase 1 del proyecto Personal Dashboard.

CONTEXTO DEL PROYECTO:
- Dashboard personal multi-usuario para gestión de gym, finanzas, nutrición y familia
- Fase 0 completada (seguridad y infraestructura)
- Decisión arquitectónica: PostgreSQL + NextAuth + Prisma (NO Supabase)

ARQUITECTURA:
- PostgreSQL 15 (puerto 5433, aislado)
- Redis 7 (sessions & rate limiting)
- Next.js 15 (App Router, TypeScript)
- NextAuth.js v5 (CredentialsProvider, JWT sessions)
- Prisma ORM (20 tablas: 4 auth + 16 dashboard)

IMPORTANTE:
- Zero impact en Supabase existente (puerto 5432, NO tocar)
- PostgreSQL nuevo en puerto 5433
- Docker-compose separado en personal-dashboard-project/

Por favor lee:
- @fases/fase1-foundation.md (este archivo)
- @/home/badfaceserverlap/.claude/plans/golden-floating-robin.md (plan completo)

Valida pre-requisitos antes de empezar.
```

---

## 📝 Phase A: Docker Infrastructure Setup (2-3 horas)

### Objetivo

Levantar PostgreSQL (5433) y Redis aislados, sin afectar infraestructura existente.

### 1.1 Crear docker-compose.yml

**Archivo:** `projects/personal-dashboard-project/docker-compose.yml`

```yaml
version: '3.8'

name: personal-dashboard

volumes:
  dashboard_postgres_data:
    driver: local
  dashboard_redis_data:
    driver: local

networks:
  dashboard_internal:
    driver: bridge
  # External networks para integración AI Platform
  localai_default:
    external: true
  monitoring:
    external: true
    name: monitoring_monitoring

services:
  # PostgreSQL 15 - Base de datos aislada
  dashboard-db:
    image: postgres:15-alpine
    container_name: dashboard-postgres
    restart: unless-stopped
    ports:
      - "5433:5432"
    environment:
      POSTGRES_DB: dashboard
      POSTGRES_USER: dashboard_user
      POSTGRES_PASSWORD: ${DASHBOARD_DB_PASSWORD}
      PGDATA: /var/lib/postgresql/data/pgdata
      TZ: America/Mexico_City
    volumes:
      - dashboard_postgres_data:/var/lib/postgresql/data
    networks:
      - dashboard_internal
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U dashboard_user -d dashboard"]
      interval: 10s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

  # Redis para sessions y rate limiting
  dashboard-redis:
    image: redis:7-alpine
    container_name: dashboard-redis
    restart: unless-stopped
    command: redis-server --requirepass ${DASHBOARD_REDIS_PASSWORD} --maxmemory 128mb --maxmemory-policy allkeys-lru
    volumes:
      - dashboard_redis_data:/data
    networks:
      - dashboard_internal
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    deploy:
      resources:
        limits:
          memory: 256M
        reservations:
          memory: 128M

  # Next.js Dashboard (Phase F - Dockerization)
  # Descomentar después de Phase E
  # nextjs-dashboard:
  #   build:
  #     context: ./code
  #     dockerfile: Dockerfile
  #   container_name: nextjs-dashboard
  #   restart: unless-stopped
  #   ports:
  #     - "3003:3000"
  #   environment:
  #     NODE_ENV: production
  #     PORT: 3000
  #     DATABASE_URL: postgresql://dashboard_user:${DASHBOARD_DB_PASSWORD}@dashboard-db:5432/dashboard
  #     NEXTAUTH_URL: http://localhost:3003
  #     NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
  #     REDIS_URL: redis://:${DASHBOARD_REDIS_PASSWORD}@dashboard-redis:6379
  #     # AI Platform integration
  #     N8N_BASE_URL: http://n8n:5678
  #     FLOWISE_BASE_URL: http://flowise:3001
  #     QDRANT_URL: http://qdrant:6333
  #   depends_on:
  #     dashboard-db:
  #       condition: service_healthy
  #     dashboard-redis:
  #       condition: service_healthy
  #   networks:
  #     - dashboard_internal
  #     - localai_default
  #     - monitoring
  #   healthcheck:
  #     test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/health"]
  #     interval: 30s
  #     timeout: 10s
  #     retries: 3
  #     start_period: 60s
```

### 1.2 Generar Passwords

```bash
cd projects/personal-dashboard-project

# Generar 3 passwords seguros
openssl rand -base64 32  # Para DASHBOARD_DB_PASSWORD
openssl rand -base64 32  # Para DASHBOARD_REDIS_PASSWORD
openssl rand -base64 32  # Para NEXTAUTH_SECRET
```

### 1.3 Crear .env

**Archivo:** `projects/personal-dashboard-project/.env`

```bash
# Dashboard Database
DASHBOARD_DB_PASSWORD=<password-generado-1>

# Dashboard Redis
DASHBOARD_REDIS_PASSWORD=<password-generado-2>

# NextAuth.js
NEXTAUTH_SECRET=<password-generado-3>

# AI Platform Integration (copiar de ../ai-platform/.env)
N8N_API_TOKEN=8f604ace9ed5b11a486cba72338874b98d6effce2e7eac90d5173aa94d9fc076
FLOWISE_USERNAME=malaface03
FLOWISE_PASSWORD=My_badface*03
QDRANT_API_KEY=d06abab773da23dadb49d2a3bc0a46bef210f9b8c2a37339654b3b5034bccc94
```

### 1.4 Iniciar Containers

```bash
cd projects/personal-dashboard-project

# Iniciar solo PostgreSQL y Redis (nextjs-dashboard comentado)
docker-compose up -d dashboard-db dashboard-redis

# Verificar logs
docker logs dashboard-postgres
docker logs dashboard-redis

# Confirmar healthy
docker ps | grep dashboard
# Esperado: dashboard-postgres, dashboard-redis (healthy)
```

### 1.5 Validar PostgreSQL

```bash
# Test conexión
psql -h localhost -p 5433 -U dashboard_user -d dashboard -c "SELECT 1;"
# Esperado: retorna 1

# Confirmar puerto correcto
lsof -i :5433
# Esperado: dashboard-postgres

# Confirmar Supabase NO afectado
lsof -i :5432
# Esperado: supabase-pooler

curl http://localhost:8000/auth/v1/health
# Esperado: {"status":"ok"}
```

### 1.6 Validar Redis

```bash
# Test conexión (usar password del .env)
docker exec -it dashboard-redis redis-cli -a <DASHBOARD_REDIS_PASSWORD> ping
# Esperado: PONG

# Test set/get
docker exec -it dashboard-redis redis-cli -a <DASHBOARD_REDIS_PASSWORD> SET test "hello"
docker exec -it dashboard-redis redis-cli -a <DASHBOARD_REDIS_PASSWORD> GET test
# Esperado: "hello"
```

### Checklist Phase A

- [ ] docker-compose.yml creado
- [ ] 3 passwords generados
- [ ] .env creado con passwords
- [ ] dashboard-postgres running y healthy
- [ ] dashboard-redis running y healthy
- [ ] Conexión PostgreSQL (5433) confirmada
- [ ] Conexión Redis confirmada
- [ ] Supabase (5432) NO afectado
- [ ] Networks creadas: dashboard_internal

---

## 📝 Phase B: Next.js + Prisma Setup (3-4 horas)

### Objetivo

Inicializar proyecto Next.js 15 con Prisma ORM y crear schema completo.

### 2.1 Inicializar Next.js

```bash
cd projects/personal-dashboard-project

# Crear proyecto Next.js 15
npx create-next-app@latest code --typescript --tailwind --app --src-dir --import-alias "@/*"

# Opciones:
# ✓ TypeScript: Yes
# ✓ ESLint: Yes
# ✓ Tailwind CSS: Yes
# ✓ `src/` directory: No (usar app/ directamente)
# ✓ App Router: Yes
# ✓ Import alias: @/*
```

### 2.2 Instalar Dependencias

```bash
cd code

# Core dependencies
npm install next-auth@beta @auth/prisma-adapter @prisma/client bcryptjs zod react-hook-form @hookform/resolvers ioredis

# Dev dependencies
npm install prisma @types/bcryptjs -D
```

### 2.3 Inicializar Prisma

```bash
cd code
npx prisma init

# Resultado: crea prisma/schema.prisma y .env
```

### 2.4 Configurar DATABASE_URL

**Archivo:** `code/.env.local`

```bash
# PostgreSQL Connection (puerto 5433 para desarrollo)
DATABASE_URL="postgresql://dashboard_user:<DASHBOARD_DB_PASSWORD>@localhost:5433/dashboard"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<NEXTAUTH_SECRET>"

# Redis
REDIS_URL="redis://:<DASHBOARD_REDIS_PASSWORD>@localhost:6379"

# AI Platform Integration (localhost durante desarrollo)
N8N_BASE_URL="http://localhost:5678"
FLOWISE_BASE_URL="http://localhost:3001"
QDRANT_URL="http://localhost:6333"
QDRANT_API_KEY="d06abab773da23dadb49d2a3bc0a46bef210f9b8c2a37339654b3b5034bccc94"
N8N_API_TOKEN="8f604ace9ed5b11a486cba72338874b98d6effce2e7eac90d5173aa94d9fc076"
```

### 2.5 Crear Prisma Schema Completo

**Archivo:** `code/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// AUTHENTICATION TABLES (NextAuth.js)
// ============================================

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  password      String
  image         String?
  role          Role      @default(USER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  accounts      Account[]
  sessions      Session[]
  profile       Profile?
  workouts      Workout[]
  transactions  Transaction[]
  investments   Investment[]
  budgets       Budget[]
  meals         Meal[]
  nutritionGoals NutritionGoal[]
  familyMembers FamilyMember[]
  timeLogs      TimeLog[]
  events        Event[]
  reminders     Reminder[]
  notifications Notification[]

  @@map("users")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

enum Role {
  USER
  ADMIN
}

// ============================================
// PROFILE MODULE
// ============================================

model Profile {
  id        String   @id @default(cuid())
  userId    String   @unique
  bio       String?
  birthday  DateTime?
  phone     String?
  country   String?
  city      String?
  timezone  String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("profiles")
}

// ============================================
// GYM TRAINING MODULE
// ============================================

model Workout {
  id        String     @id @default(cuid())
  userId    String
  name      String
  date      DateTime   @default(now())
  duration  Int?       // minutes
  notes     String?
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt

  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  exercises Exercise[]

  @@index([userId, date])
  @@map("workouts")
}

model Exercise {
  id          String   @id @default(cuid())
  workoutId   String
  name        String
  sets        Int
  reps        Int
  weight      Float?   // kg
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  workout  Workout          @relation(fields: [workoutId], references: [id], onDelete: Cascade)
  progress WorkoutProgress[]

  @@index([workoutId])
  @@map("exercises")
}

model WorkoutProgress {
  id         String   @id @default(cuid())
  exerciseId String
  date       DateTime @default(now())
  sets       Int
  reps       Int
  weight     Float    // kg
  volume     Float    // sets * reps * weight
  createdAt  DateTime @default(now())

  exercise Exercise @relation(fields: [exerciseId], references: [id], onDelete: Cascade)

  @@index([exerciseId, date])
  @@map("workout_progress")
}

// ============================================
// FINANCE MODULE
// ============================================

model Transaction {
  id          String        @id @default(cuid())
  userId      String
  type        String        // 'income' | 'expense'
  amount      Float
  category    String
  description String?
  date        DateTime      @default(now())
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  user   User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  audits TransactionAudit[]

  @@index([userId, date])
  @@index([userId, category])
  @@map("transactions")
}

model TransactionAudit {
  id            String   @id @default(cuid())
  transactionId String
  action        AuditAction
  oldValue      Json?
  newValue      Json?
  changedAt     DateTime @default(now())

  transaction Transaction @relation(fields: [transactionId], references: [id], onDelete: Cascade)

  @@index([transactionId])
  @@map("transaction_audit")
}

enum AuditAction {
  CREATE
  UPDATE
  DELETE
}

model Investment {
  id           String   @id @default(cuid())
  userId       String
  name         String
  type         String   // 'stock' | 'crypto' | 'bond' | 'real_estate'
  amount       Float
  currentValue Float?
  purchaseDate DateTime
  notes        String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("investments")
}

model Budget {
  id        String   @id @default(cuid())
  userId    String
  category  String
  limit     Float
  month     DateTime // YYYY-MM-01
  spent     Float    @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, category, month])
  @@index([userId, month])
  @@map("budgets")
}

// ============================================
// NUTRITION MODULE
// ============================================

model Meal {
  id        String    @id @default(cuid())
  userId    String
  name      String
  mealType  MealType
  date      DateTime  @default(now())
  notes     String?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  user      User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  foodItems FoodItem[]

  @@index([userId, date])
  @@map("meals")
}

enum MealType {
  BREAKFAST
  LUNCH
  DINNER
  SNACK
}

model FoodItem {
  id          String   @id @default(cuid())
  mealId      String
  name        String
  quantity    Float
  unit        String   // g, ml, oz, cup, etc.
  calories    Float?
  protein     Float?   // grams
  carbs       Float?   // grams
  fats        Float?   // grams
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  meal Meal @relation(fields: [mealId], references: [id], onDelete: Cascade)

  @@index([mealId])
  @@map("food_items")
}

model NutritionGoal {
  id        String   @id @default(cuid())
  userId    String
  calories  Float
  protein   Float    // grams
  carbs     Float    // grams
  fats      Float    // grams
  date      DateTime @unique @default(now())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("nutrition_goals")
}

// ============================================
// FAMILY CRM MODULE
// ============================================

model FamilyMember {
  id          String   @id @default(cuid())
  userId      String
  name        String
  relationship String
  birthday    DateTime?
  email       String?
  phone       String?
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user     User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  timeLogs TimeLog[]
  events   Event[]

  @@index([userId])
  @@map("family_members")
}

model TimeLog {
  id             String   @id @default(cuid())
  userId         String
  familyMemberId String?
  activity       String
  duration       Int      // minutes
  date           DateTime @default(now())
  notes          String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  familyMember FamilyMember? @relation(fields: [familyMemberId], references: [id], onDelete: SetNull)

  @@index([userId, date])
  @@map("time_logs")
}

model Event {
  id             String   @id @default(cuid())
  userId         String
  familyMemberId String?
  title          String
  description    String?
  date           DateTime
  location       String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  user         User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  familyMember FamilyMember? @relation(fields: [familyMemberId], references: [id], onDelete: SetNull)

  @@index([userId, date])
  @@map("events")
}

model Reminder {
  id        String    @id @default(cuid())
  userId    String
  title     String
  description String?
  dueDate   DateTime
  priority  Priority  @default(MEDIUM)
  completed Boolean   @default(false)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, dueDate])
  @@map("reminders")
}

enum Priority {
  LOW
  MEDIUM
  HIGH
}

// ============================================
// SHARED TABLES
// ============================================

model Notification {
  id        String             @id @default(cuid())
  userId    String
  type      NotificationType
  title     String
  message   String
  read      Boolean            @default(false)
  createdAt DateTime           @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, read])
  @@map("notifications")
}

enum NotificationType {
  INFO
  WARNING
  ERROR
  SUCCESS
}
```

### 2.6 Correr Primera Migración

```bash
cd code

# Generar migración inicial
npx prisma migrate dev --name initial_schema

# Resultado esperado:
# - Archivo de migración creado
# - 20 tablas creadas en PostgreSQL
# - Prisma Client generado

# Verificar tablas creadas
psql -h localhost -p 5433 -U dashboard_user -d dashboard -c "\dt"
# Esperado: 20 tablas listadas
```

### 2.7 Abrir Prisma Studio

```bash
cd code
npx prisma studio

# Abre UI en http://localhost:5555
# Verificar que todas las tablas aparecen
```

### Checklist Phase B

- [ ] Next.js 15 inicializado
- [ ] Dependencias instaladas (next-auth, prisma, bcryptjs, zod, etc.)
- [ ] Prisma inicializado
- [ ] .env.local configurado con DATABASE_URL
- [ ] Schema completo (20 tablas) creado
- [ ] Migración inicial corrida exitosamente
- [ ] 20 tablas creadas en PostgreSQL (5433)
- [ ] Prisma Studio abre correctamente

---

## 📝 Phase C: NextAuth.js Implementation (4-5 horas)

### Objetivo

Implementar autenticación completa con NextAuth.js usando CredentialsProvider.

### 3.1 Crear Prisma Client Singleton

**Archivo:** `code/lib/db/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### 3.2 Crear NextAuth Config

**Archivo:** `code/lib/auth/config.ts`

```typescript
import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { compare } from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) {
          return null
        }

        const isValid = await compare(credentials.password as string, user.password)

        if (!isValid) {
          return null
        }

        // Check if email is verified (optional)
        if (!user.emailVerified) {
          throw new Error('Email not verified. Please verify your email.')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
})
```

### 3.3 Crear Auth Utils

**Archivo:** `code/lib/auth/utils.ts`

```typescript
'use server'

import { auth } from './config'
import { prisma } from '@/lib/db/prisma'
import { hash } from 'bcryptjs'
import { redirect } from 'next/navigation'

/**
 * Get current user or redirect to login
 */
export async function requireAuth() {
  const session = await auth()

  if (!session || !session.user) {
    redirect('/login')
  }

  return session.user
}

/**
 * Register new user
 */
export async function registerUser(email: string, password: string, name: string) {
  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  })

  if (existingUser) {
    throw new Error('User already exists')
  }

  // Hash password
  const hashedPassword = await hash(password, 12)

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      emailVerified: new Date(), // Auto-verify for now
    },
  })

  return user
}

/**
 * Verify user owns resource
 */
export async function verifyOwnership(resourceUserId: string) {
  const user = await requireAuth()

  if (user.id !== resourceUserId) {
    throw new Error('Unauthorized: You do not own this resource')
  }

  return true
}
```

### 3.4 Crear Authorization Patterns

**Archivo:** `code/lib/auth/authorization.ts`

```typescript
'use server'

import { requireAuth } from './utils'
import { prisma } from '@/lib/db/prisma'

/**
 * Get user's workout (RLS equivalent)
 */
export async function getUserWorkout(workoutId: string) {
  const user = await requireAuth()

  const workout = await prisma.workout.findFirst({
    where: {
      id: workoutId,
      userId: user.id, // ← RLS equivalent: only get if user owns it
    },
    include: {
      exercises: true,
    },
  })

  if (!workout) {
    throw new Error('Workout not found or unauthorized')
  }

  return workout
}

/**
 * Get user's transactions (RLS equivalent)
 */
export async function getUserTransactions(startDate?: Date, endDate?: Date) {
  const user = await requireAuth()

  const transactions = await prisma.transaction.findMany({
    where: {
      userId: user.id, // ← RLS equivalent
      ...(startDate && endDate
        ? {
            date: {
              gte: startDate,
              lte: endDate,
            },
          }
        : {}),
    },
    orderBy: {
      date: 'desc',
    },
  })

  return transactions
}

/**
 * Template for secure queries - ALWAYS filter by userId
 */
export async function secureQueryTemplate() {
  const user = await requireAuth()

  // ALWAYS include userId in where clause
  const data = await prisma.workout.findMany({
    where: {
      userId: user.id, // ← CRITICAL: Never forget this
    },
  })

  return data
}
```

### 3.5 Crear Middleware

**Archivo:** `code/middleware.ts`

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth/config'

// Routes that require authentication
const protectedRoutes = ['/dashboard']

// Routes that redirect to dashboard if authenticated
const authRoutes = ['/login', '/register']

export async function middleware(request: NextRequest) {
  const session = await auth()
  const { pathname } = request.nextUrl

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAuthRoute = authRoutes.includes(pathname)

  // Redirect to login if accessing protected route without auth
  if (isProtectedRoute && !session) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect to dashboard if authenticated and accessing auth routes
  if (isAuthRoute && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

### 3.6 Crear API Route Handler

**Archivo:** `code/app/api/auth/[...nextauth]/route.ts`

```typescript
import { handlers } from '@/lib/auth/config'

export const { GET, POST } = handlers
```

### 3.7 Crear Login Page

**Archivo:** `code/app/login/page.tsx`

```typescript
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/config'
import LoginForm from '@/components/auth/LoginForm'

export default async function LoginPage() {
  const session = await auth()

  // Redirect if already authenticated
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Personal Dashboard
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your dashboard
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
```

### 3.8 Crear Login Form Component

**Archivo:** `code/components/auth/LoginForm.tsx`

```typescript
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid email or password')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-4 rounded-md shadow-sm">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
      >
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  )
}
```

### 3.9 Crear Register Page

**Archivo:** `code/app/register/page.tsx`

```typescript
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/config'
import RegisterForm from '@/components/auth/RegisterForm'

export default async function RegisterPage() {
  const session = await auth()

  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Register for your Personal Dashboard
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
```

### 3.10 Crear Register Form Component

**Archivo:** `code/components/auth/RegisterForm.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { registerUser } from '@/lib/auth/utils'

export default function RegisterForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await registerUser(email, password, name)
      router.push('/login?registered=true')
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Must be at least 8 characters
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50"
      >
        {loading ? 'Creating account...' : 'Create account'}
      </button>

      <div className="text-center text-sm">
        <span className="text-gray-600">Already have an account? </span>
        <a href="/login" className="font-medium text-blue-600 hover:text-blue-500">
          Sign in
        </a>
      </div>
    </form>
  )
}
```

### 3.11 Test Authentication

```bash
cd code
npm run dev

# Test flujo completo:
# 1. Navegar a http://localhost:3000/register
# 2. Crear usuario: test@dashboard.com / password123 / Test User
# 3. Navegar a http://localhost:3000/login
# 4. Login con credenciales
# 5. Debe redirigir a /dashboard (aunque todavía no existe)
# 6. Verificar usuario en DB:
psql -h localhost -p 5433 -U dashboard_user -d dashboard -c "SELECT id, email, name FROM users;"
```

### Checklist Phase C

- [ ] Prisma client singleton creado
- [ ] NextAuth config completo (CredentialsProvider)
- [ ] Auth utils creados (requireAuth, registerUser, verifyOwnership)
- [ ] Authorization patterns creados (getUserWorkout, getUserTransactions)
- [ ] Middleware configurado (route protection)
- [ ] API route handler creado
- [ ] Login page y form creados
- [ ] Register page y form creados
- [ ] Test usuario creado exitosamente
- [ ] Test login funciona correctamente
- [ ] Usuario verificado en PostgreSQL

---

## 📝 Phase D: Dashboard Layout (3-4 horas)

### Objetivo

Crear layout del dashboard con sidebar, header, y navegación.

### 4.1 Crear Dashboard Layout

**Archivo:** `code/app/dashboard/layout.tsx`

```typescript
import { requireAuth } from '@/lib/auth/utils'
import Sidebar from '@/components/dashboard/Sidebar'
import Header from '@/components/dashboard/Header'

export default async function DashboardLayout({
  children,
}: {
  children: React.Node
}) {
  // Require authentication
  const user = await requireAuth()

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header user={user} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

### 4.2 Crear Sidebar Component

**Archivo:** `code/components/dashboard/Sidebar.tsx`

```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  ChartBarIcon,
  CreditCardIcon,
  CakeIcon,
  UsersIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Gym Training', href: '/dashboard/workouts', icon: ChartBarIcon },
  { name: 'Finance', href: '/dashboard/finance', icon: CreditCardIcon },
  { name: 'Nutrition', href: '/dashboard/nutrition', icon: CakeIcon },
  { name: 'Family', href: '/dashboard/family', icon: UsersIcon },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex w-64 flex-col border-r border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                group flex items-center rounded-md px-3 py-2 text-sm font-medium
                ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <item.icon
                className={`
                  mr-3 h-5 w-5 flex-shrink-0
                  ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}
                `}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
```

### 4.3 Crear Header Component

**Archivo:** `code/components/dashboard/Header.tsx`

```typescript
'use client'

import { useState } from 'react'
import { signOut } from 'next-auth/react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

interface HeaderProps {
  user: {
    name?: string | null
    email?: string | null
  }
}

export default function Header({ user }: HeaderProps) {
  const [showDropdown, setShowDropdown] = useState(false)

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/login' })
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      {/* Search or Breadcrumbs (placeholder) */}
      <div className="flex-1">
        <p className="text-sm text-gray-500">Welcome back, {user.name || 'User'}!</p>
      </div>

      {/* User Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center space-x-2 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
            {user.name?.charAt(0) || 'U'}
          </div>
          <span>{user.name}</span>
          <ChevronDownIcon className="h-4 w-4 text-gray-400" />
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="py-1">
              <div className="px-4 py-2 text-sm text-gray-700 border-b">
                {user.email}
              </div>
              <button
                onClick={handleSignOut}
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
```

### 4.4 Crear Dashboard Home Page

**Archivo:** `code/app/dashboard/page.tsx`

```typescript
import { requireAuth } from '@/lib/auth/utils'
import { prisma } from '@/lib/db/prisma'

export default async function DashboardPage() {
  const user = await requireAuth()

  // Get counts for each module
  const [workoutCount, transactionCount, mealCount, familyMemberCount] = await Promise.all([
    prisma.workout.count({ where: { userId: user.id } }),
    prisma.transaction.count({ where: { userId: user.id } }),
    prisma.meal.count({ where: { userId: user.id } }),
    prisma.familyMember.count({ where: { userId: user.id } }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Overview of your activities
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Workouts */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Workouts</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{workoutCount}</p>
            </div>
            <div className="rounded-full bg-blue-100 p-3">
              <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Transactions</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{transactionCount}</p>
            </div>
            <div className="rounded-full bg-green-100 p-3">
              <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Meals */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Meals</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{mealCount}</p>
            </div>
            <div className="rounded-full bg-yellow-100 p-3">
              <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
        </div>

        {/* Family Members */}
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Family Members</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900">{familyMemberCount}</p>
            </div>
            <div className="rounded-full bg-purple-100 p-3">
              <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <a
            href="/dashboard/workouts"
            className="rounded-md border border-gray-300 p-4 text-center hover:bg-gray-50"
          >
            <p className="text-sm font-medium text-gray-900">Add Workout</p>
          </a>
          <a
            href="/dashboard/finance"
            className="rounded-md border border-gray-300 p-4 text-center hover:bg-gray-50"
          >
            <p className="text-sm font-medium text-gray-900">Add Transaction</p>
          </a>
          <a
            href="/dashboard/nutrition"
            className="rounded-md border border-gray-300 p-4 text-center hover:bg-gray-50"
          >
            <p className="text-sm font-medium text-gray-900">Add Meal</p>
          </a>
          <a
            href="/dashboard/family"
            className="rounded-md border border-gray-300 p-4 text-center hover:bg-gray-50"
          >
            <p className="text-sm font-medium text-gray-900">Add Event</p>
          </a>
        </div>
      </div>
    </div>
  )
}
```

### 4.5 Install Heroicons

```bash
cd code
npm install @heroicons/react
```

### 4.6 Test Dashboard

```bash
cd code
npm run dev

# Test flujo:
# 1. Login con test@dashboard.com
# 2. Debe redirigir a /dashboard
# 3. Ver sidebar con navegación
# 4. Ver header con usuario y dropdown
# 5. Click en dropdown → Sign out
# 6. Debe redirigir a /login
```

### Checklist Phase D

- [ ] Dashboard layout creado con sidebar y header
- [ ] Sidebar component con navegación
- [ ] Header component con user dropdown
- [ ] Dashboard home page con stats
- [ ] Heroicons instalados
- [ ] Login redirect funciona
- [ ] Logout funciona correctamente
- [ ] Middleware protege /dashboard correctamente

---

*[Continúa en siguiente mensaje con Phase E, F, G]*

---

## 🔗 Referencias Clave

**Plan Completo:**
- `/home/badfaceserverlap/.claude/plans/golden-floating-robin.md`

**Arquitectura:**
- PostgreSQL 15 (puerto 5433, aislado)
- NextAuth.js v5 (CredentialsProvider, JWT sessions)
- Prisma ORM (20 tablas: 4 auth + 16 dashboard)

**Zero Impact:**
- Supabase (5432) - NO TOCAR
- AI Platform services - NO TOCAR

---

**Última Actualización:** 2025-12-09
**Estado:** Fase 1 actualizada con PostgreSQL + NextAuth
**Estimación:** 21-28 horas (3-4 días completos)
