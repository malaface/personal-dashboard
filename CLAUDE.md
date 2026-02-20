# Personal Dashboard — CLAUDE.md

## Project Overview

Multi-user personal management system: gym training, finances, nutrition, and family CRM with AI integration.

**Stack:**
- **Frontend:** Next.js 16.0.8 (App Router) + React 19.2.1 + TypeScript 5
- **UI:** TailwindCSS 3.4 + shadcn/ui (Radix UI) instalado + @heroicons/react (`@headlessui/react` puede removerse una vez todos sus usos sean migrados)
- **Backend:** Prisma 5.22.0 + PostgreSQL 15 + NextAuth.js 5.x
- **AI:** n8n + Flowise + Qdrant + Redis
- **Deployment:** Docker Compose con profiles (dev: DB+Redis, prod: stack completo en port 3003)

**Estado actual:** App construida y funcional. Módulos activos: Gym, Finance, Nutrition, Family CRM.

---

## Skills (cargar bajo demanda)

| Skill | Trigger keywords |
|-------|-----------------|
| `frontend` | `'use client'`, `page.tsx`, `layout.tsx`, `Server Component`, `Client Component`, `shadcn`, `form`, `Tailwind`, `component`, `middleware`, `useForm` |
| `backend` | `prisma`, `migration`, `Server Action`, `API route`, `NextAuth`, `requireAuth`, `DATABASE_URL`, `schema.prisma`, `userId`, `audit log`, `n8n`, `Flowise`, `Qdrant`, `Redis`, `backup` |
| `git-workflow` | `commit`, `branch`, `PR`, `push`, `merge`, `git`, `github`, `tag`, `release` |

---

## Service Ports

| Servicio | Puerto | URL | Entorno |
|---------|--------|-----|---------|
| Dashboard (Docker) | 3003 → 3000 | http://localhost:3003 | prod (`make prod`) |
| Dashboard (dev) | 3000 | http://localhost:3000 | dev (`npm run dev`) |
| PostgreSQL | 5434 → 5432 | localhost:5434 | ambos |
| Redis | 6379 | localhost:6379 | ambos |
| n8n | 5678 | http://localhost:5678 | externo |
| Flowise | 3001 | http://localhost:3001 | externo |
| Qdrant | 6333 | http://localhost:6333 | externo |

---

## File Structure

```
personal-dashboard/
├── CLAUDE.md
├── code/                        # Next.js app
│   ├── app/                     # App Router (pages, layouts, API routes)
│   │   ├── (auth)/              # /login, /register
│   │   └── dashboard/           # /dashboard + módulos
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components (editables)
│   │   ├── layout/              # DashboardShell, Sidebar, MobileBottomNav
│   │   ├── gym/ finance/ nutrition/ family/
│   ├── lib/
│   │   ├── db/prisma.ts         # Prisma singleton (siempre importar de aquí)
│   │   ├── auth/                # requireAuth(), verifyOwnership()
│   │   ├── audit/logger.ts      # logAudit()
│   │   └── validations/         # Zod schemas
│   └── prisma/
│       ├── schema.prisma        # 31 tablas
│       ├── migrations/          # 13 migrations aplicadas
│       └── seeds/               # Catalog items
├── docs/                        # Reportes y documentación
└── backups/                     # DB backups
```

---

## Common Commands

```bash
# Docker (desde la raíz del proyecto)
make down                             # Detener todos los contenedores
make pull                             # git pull + npm install
make up                               # DB → migraciones → rebuild → arrancar todo
make dev                              # Solo DB + Redis (desarrollo)
make prod                             # Todo el stack sin rebuild
make prod-build                       # Todo el stack con rebuild
make status                           # Ver estado de contenedores
make logs                             # Logs de todos los servicios
make logs-app                         # Logs solo de la app
make db-shell                         # Shell de PostgreSQL
make backup                           # Backup de la DB

# Desarrollo (desde code/)
cd /home/badfaceserverlap/personal-dashboard/code
npm run dev                           # Dev server :3000
npm run build                         # Build producción
npm run lint                          # Lint
npx tsc --noEmit                      # TypeScript check

# Prisma (desde code/)
npx prisma migrate dev --name nombre  # Nueva migration (dev)
npx prisma migrate deploy             # Aplicar migrations (prod)
npx prisma migrate status             # Ver estado
npx prisma generate                   # Regenerar Prisma Client
npm run prisma:seed                   # Seeds
```

---

## Critical Rules

### Next.js
- ❌ NUNCA `'use client'` sin necesidad real (event handlers, hooks, browser APIs)
- ❌ NUNCA importar Server Components en Client Components — pasar como `children`
- ❌ NUNCA exponer secrets en Client Components
- ✅ SIEMPRE Suspense boundaries en async Server Components

### Prisma & DB
- ❌ NUNCA `prisma db push` en producción — usar `migrate deploy`
- ❌ NUNCA múltiples instancias de PrismaClient — usar `lib/db/prisma.ts`
- ❌ NUNCA queries sin `userId` del session — aislamiento de usuarios obligatorio
- ❌ NUNCA operaciones multi-step sin `prisma.$transaction()`
- ✅ SIEMPRE `npx prisma generate` después de cambios de schema
- ✅ SIEMPRE backup antes de migrations en producción

### Git
- ❌ NUNCA commit directo a `main` o `develop`
- ❌ NUNCA `git add .` — stage archivos específicos
- ✅ SIEMPRE feature branches
- ✅ SIEMPRE build + lint + tsc antes de commit
- ✅ SIEMPRE usar `gh` CLI para PRs e issues

---

## Git Workflow (resumen)

```bash
# 1. Crear branch desde develop
git checkout develop && git pull origin develop
git checkout -b "feature/nombre"

# 2. Pre-commit checks
npm run build && npm run lint && npx tsc --noEmit

# 3. Stage específico + commit
git add code/path/to/file.tsx
git commit -m "feat: descripción

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"

# 4. PR
git push -u origin "feature/nombre"
gh pr create --base develop --title "feat: Descripción" --body "..."
```

**Branch naming:** `feature/`, `fix/`, `refactor/`, `docs/`, `chore/`, `hotfix/`

**Al resolver un problema (OBLIGATORIO):**
1. Crear reporte en `docs/YYYY-MM-DD-descripcion.md`
2. Hacer commit al repositorio

---

## Environment Variables

```bash
# code/.env.local (desarrollo)
DATABASE_URL="postgresql://dashboard_user:PASSWORD@localhost:5434/dashboard"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."
RESEND_API_KEY="..."
REDIS_URL="redis://:PASSWORD@localhost:6379"
N8N_BASE_URL="http://localhost:5678"
FLOWISE_BASE_URL="http://localhost:3001"
QDRANT_URL="http://localhost:6333"
QDRANT_API_KEY="..."

# code/.env.production
DATABASE_URL="postgresql://dashboard_user:PASSWORD@dashboard-postgres:5432/dashboard"
NEXTAUTH_URL="https://dashboard.malacaran8n.uk"
```

---

**Last Updated:** 2026-02-19
**Skills:** 3 consolidadas (frontend, backend, git-workflow)
**DB:** 31 tablas, 13 migrations, Prisma 5.22.0 + PostgreSQL 15
**shadcn/ui:** instalado — Button, Input, Label, Select, Dialog, Card, Badge, Tabs, Sheet en `components/ui/`
