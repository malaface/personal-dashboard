# Personal Dashboard - CLAUDE.md

This file provides guidance to Claude Code when working with the Personal Dashboard project.

## 📋 Project Overview

**Personal Dashboard** - Multi-user management system for tracking gym training, finances & investments, nutrition, and family CRM with AI integration.

**Technology Stack:**
- **Frontend:** Next.js 15.0.3 (App Router) + React 18.3.1 + TypeScript 5.3.3
- **UI:** TailwindCSS 3.4.1 + shadcn/ui (Radix UI 1.0.0)
- **Backend:** Supabase JS 2.39.0 (Auth, PostgreSQL 15.1, Realtime, Storage)
- **AI Services:** n8n 1.19.4 + Flowise 1.4.12 + Qdrant 1.7.4 + Redis 7.2.3
- **Deployment:** Docker Compose (port 3003)

**Current Status:**
- **Phase 0:** ✅ COMPLETED (Security Hardening & Infrastructure)
- **Phase 1:** 📋 PENDING (Foundation - Next.js setup, auth, database schema)

See `fases/fase0-completado.md` for completed work.

---

## 🎯 Skills System

**This project uses a modular skills system** to reduce context and load knowledge on-demand.

**Skills Location:** `.claude/skills/` (local to this project)

**Total Skills:** 13 (3,781 lines of documentation)
**Context Saved:** ~32,000 tokens loaded only when needed

### Quick Skill Reference

| When you need to... | Invoke Skill | Trigger Keywords |
|---------------------|--------------|------------------|
| Work with Next.js | `nextjs-app-router-patterns` | Server Component, Client Component, route handler, middleware |
| Build UI components | `react-ui-component-library` | shadcn, form, Tailwind, dark mode, accessibility |
| Implement auth | `supabase-integration-patterns` | auth, SSR, RLS policy, real-time |
| Optimize queries | `postgresql-advanced-patterns` | optimization, index, CTE, full-text search |
| Database operations | `database-management` | backup, restore, migration, health check |
| Phase workflows | `dashboard-dev-workflow` | Phase 1, Phase 2, testing, deployment |
| Schema reference | `dashboard-schema-reference` | workouts, transactions, meals, family_members |
| Git operations | `git-workflow-manager` | commit, branch, PR, rollback |
| AI integration | `ai-services-integration` | n8n, Flowise, Qdrant, Redis, vector search |
| Troubleshooting | `troubleshooting-guide` | error, failure, issue, not working |

**Auto-Invocation:** Skills load automatically when keywords are detected.

**Manual Invocation:** Mention skill name explicitly:
```
"Use nextjs-app-router-patterns skill to help me create this component"
"Invoke database-management skill for backup procedures"
```

---

## 🚀 Development Workflow

### Starting a New Phase

**ALWAYS follow this workflow:**

1. **Read the phase guide** in `fases/faseN-*.md`
2. **Validate pre-requisites** using provided commands
3. **Create backup** before changes (if Phase 0+)
4. **Follow checklist** step-by-step
5. **Run validation** after each major task
6. **Commit using git-workflow-manager skill**

### Common Development Commands

**Navigate to project:**
```bash
cd /home/badfaceserverlap/docker/contenedores/projects/personal-dashboard-project
```

**Next.js development (Phase 1+):**
```bash
cd code
npm install          # Install dependencies
npm run dev          # Development mode (port 3000)
npm run build        # Build for production
npm start            # Production server
npx tsc --noEmit     # Type checking
npm run lint         # Lint code
```

**Infrastructure health check (ALWAYS before commits):**
```bash
cd /home/badfaceserverlap/docker/contenedores
bash shared/scripts/health-check.sh
```

**Database operations:**
```bash
# Connect to PostgreSQL
docker exec -it supabase-db psql -U postgres

# Run migration
docker exec -i supabase-db psql -U postgres < supabase/migrations/XXX_migration.sql

# Check tables and RLS
docker exec -i supabase-db psql -U postgres -c "\dt public.*"
docker exec -i supabase-db psql -U postgres -c "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';"
```

---

## 🔧 Service Configuration

### Port Mapping

| Service | Port | Access URL |
|---------|------|------------|
| **Dashboard** | 3003 → 3000 | http://localhost:3003 (Docker) or :3000 (dev) |
| **Supabase Kong** | 8000 | http://localhost:8000 (Auth, DB, Realtime, Storage) |
| **n8n** | 5678 | http://localhost:5678 (Automation) |
| **Flowise** | 3001 | http://localhost:3001 (AI Chatflows) |
| **Qdrant** | 6333 | http://localhost:6333 (Vector DB API) |
| **Redis** | 6379 | localhost:6379 (Cache) |
| **PostgreSQL** | 5432 | localhost:5432 (Direct DB) |

### Test Credentials

**Created in Phase 0:**
- **Email:** malacaram807@gmail.com
- **Password:** My_badface27

### Environment Variables

**Dashboard-specific:** `code/.env.local`
```bash
NEXT_PUBLIC_SUPABASE_URL=http://localhost:8000
NEXT_PUBLIC_SUPABASE_ANON_KEY=[from AI Platform .env]
SUPABASE_SERVICE_ROLE_KEY=[from AI Platform .env]
```

**Master config:** `../ai-platform/.env` (all service credentials)

---

## 📊 Database Schema

**16 Tables across 4 modules + shared:**

### 1. Gym Training Module
- `workouts` - Workout sessions
- `exercises` - Individual exercises
- `workout_progress` - Progress tracking

### 2. Finance Module
- `transactions` - Income/expense tracking
- `investments` - Portfolio management
- `budgets` - Monthly limits
- `transaction_audit` - Audit trail

### 3. Nutrition Module
- `meals` - Meal entries (breakfast/lunch/dinner/snack)
- `food_items` - Individual foods
- `nutrition_goals` - Daily targets

### 4. Family CRM Module
- `family_members` - Member profiles
- `time_logs` - Time tracking
- `events` - Important dates
- `reminders` - Task reminders

### 5. Shared Tables
- `profiles` - Extended user profiles
- `notifications` - In-app notifications

**All tables have RLS (Row Level Security) enabled** - users only access their own data.

**For detailed schema:** Invoke `dashboard-schema-reference` skill

---

## 🔒 Security & Best Practices

### Critical Rules (NEVER break these)

**Next.js:**
- ❌ Never use `'use client'` unless absolutely necessary (interactivity)
- ❌ Never import Server Components in Client Components
- ❌ Never expose secrets in Client Components (use Server Components/API Routes)
- ✅ Always use Suspense boundaries for async Server Components

**Supabase:**
- ❌ Never use `createClient` without SSR helpers (`lib/supabase/server.ts` or `client.ts`)
- ❌ Never expose `service_role_key` in client code
- ❌ Never create tables without RLS enabled
- ✅ Always verify `auth.uid()` is NOT NULL in RLS policies

**PostgreSQL:**
- ❌ Never create tables without primary key
- ❌ Never forget indexes on foreign keys
- ❌ Never use `SELECT *` in production
- ✅ Always use transactions for multi-step operations

**Git:**
- ❌ Never use `git add .` (stage specific files only)
- ❌ Never commit without running health-check.sh
- ❌ Never push directly to main branch
- ✅ Always work from submodule directory: `/home/badfaceserverlap/docker/contenedores`

**Git Versioning with Tags:**

Cuando el proyecto alcance versiones estables, utilizar Git tags para marcar esos puntos específicos:

**Semantic Versioning Strategy:**

- **v0.x (Pre-release versions):**
  - Comenzar con `v0.1` cuando tengamos algo funcional básico
  - Incrementar progresivamente: `v0.2`, `v0.3`, etc.
  - Usar para features completadas pero aún en desarrollo activo
  - Ejemplo: `v0.1` - Auth + Basic CRUD functional

- **v1.0 (First Major Release):**
  - ⚠️ SOLO cuando demos un cambio MUY RADICAL que amerite dar ese salto
  - Ejemplos que ameritan v1.0:
    - Aplicación completamente funcional con todos los módulos
    - Primera versión production-ready
    - Breaking changes fundamentales en arquitectura
  - **NO usar v1.0 para features individuales**

- **v2.0, v3.0, etc. (Major Versions):**
  - Aplicar la misma lógica que v1.0
  - Solo para cambios radicales/breaking changes mayores
  - Ejemplos:
    - Migración de framework (Next.js 15 → 16)
    - Cambio de arquitectura completa
    - Refactor masivo que rompe compatibilidad

**Comandos para crear tags:**

```bash
# Crear tag para versión estable
git tag -a v0.1 -m "feat: First functional version - Auth & Registration working"

# Push tag al repositorio
git push origin v0.1

# Listar todos los tags
git tag -l

# Ver detalles de un tag específico
git show v0.1

# Crear tag para versión actual (post-commit)
git tag -a v0.1 [commit-hash] -m "Message"
```

**Criterios para crear un tag:**

✅ Crear tag cuando:
- Feature mayor completada y testeada
- Health checks pasando
- Build exitoso sin errores
- Funcionalidad verificada manualmente
- Documentación actualizada

❌ NO crear tag cuando:
- Cambio menor o fix pequeño
- Feature a medias
- Tests fallando
- Errores conocidos sin resolver

**Current Version Status:**
- **Latest stable tag:** (Pending - será v0.1 cuando auth esté completo)
- **Next milestone:** v0.1 - Authentication + Basic User Management

**For comprehensive rules:** Invoke respective skill (e.g., `nextjs-app-router-patterns`)

---

## 🧪 Testing & Validation

**Before EVERY commit:**

1. **Health check (MANDATORY):**
   ```bash
   cd /home/badfaceserverlap/docker/contenedores
   bash shared/scripts/health-check.sh
   ```

2. **Build check:**
   ```bash
   cd code
   npm run build  # Must complete without errors
   ```

3. **Authentication test:**
   ```bash
   curl -X POST http://localhost:8000/auth/v1/token?grant_type=password \
     -H "Content-Type: application/json" \
     -H "apikey: ${ANON_KEY}" \
     -d '{"email":"malacaram807@gmail.com","password":"My_badface27"}'
   ```

4. **Database connectivity:**
   ```bash
   docker exec -i supabase-db psql -U postgres -c "SELECT COUNT(*) FROM auth.users;"
   ```

---

## 📁 Project Structure

```
personal-dashboard-project/
├── .claude/
│   └── skills/              # 13 skills (3,781 lines)
│       ├── nextjs-app-router-patterns/
│       ├── react-ui-component-library/
│       ├── supabase-integration-patterns/
│       ├── postgresql-advanced-patterns/
│       ├── database-management/
│       ├── git-workflow-manager/
│       ├── docker-operations/
│       ├── dashboard-dev-workflow/
│       ├── dashboard-schema-reference/
│       ├── ai-services-integration/
│       ├── troubleshooting-guide/
│       ├── service-port-reference/
│       └── monitoring-operations/
├── CLAUDE.md                # This file
├── README.md                # Project status
├── fases/                   # Phase guides (0-5)
│   ├── fase0-completado.md  # ✅ Security (DONE)
│   ├── fase1-foundation.md  # 📋 Next.js + Auth (PENDING)
│   └── ...
├── code/                    # Next.js app (Phase 1+)
│   ├── app/                 # App Router
│   ├── lib/                 # Utils & Supabase clients
│   ├── components/          # React components
│   └── supabase/migrations/ # DB migrations
├── docs/                    # Documentation
└── backups/                 # Dashboard backups
```

---

## 🔥 Quick Troubleshooting

**Port conflicts:**
```bash
netstat -tuln | grep 3003
lsof -ti:3003 | xargs kill -9
```

**Database connection issues:**
```bash
docker ps | grep supabase-db
docker logs supabase-db --tail 50
docker-compose restart supabase-db kong
```

**Next.js module errors:**
```bash
rm -rf .next
rm -rf node_modules package-lock.json
npm install
```

**For comprehensive troubleshooting:** Invoke `troubleshooting-guide` skill

---

## 🎯 Success Criteria

**Dashboard is considered "working" when:**

- ✅ Next.js runs without errors (port 3000 dev, 3003 Docker)
- ✅ User can login with test credentials
- ✅ All 4 modules (Gym, Finance, Nutrition, Family) functional
- ✅ CRUD operations work for all entities
- ✅ RLS policies prevent unauthorized access
- ✅ AI features provide suggestions
- ✅ Prometheus metrics exposed
- ✅ All health checks pass

---

## 📚 Important References

**Planning & Documentation:**
- Phase plan: `.claude/plans/quizzical-knitting-knuth.md` (if exists)
- Implementation guide: `../../docs/guia-implementacion-dashboard.md`
- Phase 0 report: `../../docs/phase0-security-hardening-report.md`
- Skills catalog: `../../docs/skills-catalog.md`

**Infrastructure:**
- Main repo: `/home/badfaceserverlap/docker/contenedores/`
- AI Platform: `../ai-platform/`
- Monitoring: `../../shared/monitoring/`
- Scripts: `../../shared/scripts/`

**Git Workflow:**
- Parent CLAUDE.md: `../../CLAUDE.md` (infrastructure git workflow)
- Use `git-workflow-manager` skill for all git operations

---

## 🚨 Critical Reminders

1. **ALWAYS validate pre-requisites** before starting a phase
2. **NEVER skip health checks** before committing
3. **ALWAYS use specific file staging** (never `git add .`)
4. **READ the phase guide completely** before starting work
5. **TEST authentication flows** after any auth changes
6. **BACKUP before major changes** (Phase 0+)
7. **INVOKE APPROPRIATE SKILL** for detailed guidance

---

**🎨 Skills-Driven Development:**

This project uses **on-demand skills loading** to:
- Reduce initial context by 78% (41K → 8.8K tokens)
- Provide 69.5K tokens of documentation when needed
- Maintain focus on current work
- Scale without context bloat

**For ANY task, check the skill reference table above and invoke the appropriate skill.**

---

**Last Updated:** 2025-12-14
**Skills Version:** 1.0.0
**Context Optimization:** Active (-78% initial context)
**Git Versioning:** Implemented (Semantic Tags v0.x → v1.0+)
