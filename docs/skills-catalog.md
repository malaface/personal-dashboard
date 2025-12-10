# Skills Catalog - Personal Dashboard Project

**Created**: 2025-12-09
**Version**: 1.0.0
**Total Skills**: 13
**Project**: Personal Dashboard

---

## 📖 Overview

This document catalogs all available skills for the Personal Dashboard project. Skills are modular knowledge bases that reduce context consumption by loading only when needed.

**Location**: `.claude/skills/` (local to this project)

---

## 📊 Impact Summary

| Metric | Before Skills | After Skills | Improvement |
|--------|--------------|--------------|-------------|
| **Initial Context** | ~41,000 tokens | ~8,800 tokens | **-78%** |
| **Skills On-Demand** | N/A | ~69,500 tokens | Available when needed |
| **Context Liberated** | N/A | **32,200 tokens** | For actual work |

**Key Benefits:**
- ⚡ Faster conversation startup
- 🎯 Focused context on current task
- 📚 Comprehensive documentation available on-demand
- 🔄 Easy to maintain and update

---

## 🎯 Complete Skills List

### Frontend Stack (Critical for Development)

#### 1. `nextjs-app-router-patterns` 🚨 CRÍTICO
**Version**: 1.0.0
**Size**: 787 lines (largest skill)
**Dependencies**: next@15.0.3, react@18.3.1, typescript@5.3.3

**Purpose**: Next.js 15 App Router patterns, Server/Client Components, Server Actions

**When to Invoke**:
- Keywords: Server Component, Client Component, route handler, Server Action, middleware
- Code: `'use client'`, `'use server'`, `app/`, `page.tsx`
- Operations: Creating pages, data fetching, forms

**Key Features**:
- ✅ Server vs Client Components patterns
- ✅ Server Actions for forms
- ✅ Routing & Layouts (parallel routes, intercepting routes)
- ✅ API Route Handlers
- ✅ Middleware patterns
- ✅ Caching strategies (ISR, force-dynamic)
- ✅ Performance optimization

**Critical Rules**:
- ❌ NUNCA usar `'use client'` innecesariamente
- ❌ NUNCA importar Server Components en Client Components
- ❌ NUNCA exponer secretos en Client Components
- ❌ NUNCA olvidar `'use server'` en Server Actions
- ✅ SIEMPRE usar Suspense para async components
- ✅ SIEMPRE tipar con TypeScript

---

#### 2. `react-ui-component-library` ALTA
**Version**: 1.0.0
**Size**: 710 lines
**Dependencies**: shadcn/ui, tailwindcss@3.4.1, radix-ui@1.0.0

**Purpose**: UI components with shadcn/ui, TailwindCSS, forms, accessibility

**When to Invoke**:
- Keywords: shadcn, form, Tailwind, dark mode, accessibility
- Operations: Creating components, forms, styling, theming

**Key Features**:
- ✅ shadcn/ui setup & customization
- ✅ TailwindCSS configuration
- ✅ Forms with react-hook-form + Zod
- ✅ Dark mode implementation
- ✅ Responsive design patterns
- ✅ Accessibility (ARIA, keyboard navigation)

**Critical Rules**:
- ❌ NUNCA modificar shadcn en node_modules
- ❌ NUNCA usar clases sin `cn()`
- ❌ NUNCA olvidar dark mode classes
- ❌ NUNCA usar colores hardcodeados
- ✅ SIEMPRE usar CVA para variantes
- ✅ SIEMPRE incluir ARIA labels

---

### Backend Stack (Critical for Data Layer)

#### 3. `supabase-integration-patterns` 🚨 CRÍTICO
**Version**: 1.0.0
**Size**: 117 lines
**Dependencies**: @supabase/supabase-js@2.39.0, @supabase/ssr@0.1.0

**Purpose**: Supabase integration for Next.js 15 (SSR auth, queries, RLS)

**When to Invoke**:
- Keywords: Supabase, auth, SSR, RLS policy, real-time
- Operations: Authentication, database queries, RLS setup

**Critical Rules**:
- ❌ NUNCA usar createClient sin SSR helpers
- ❌ NUNCA exponer service_role_key en cliente
- ❌ NUNCA crear tablas sin RLS
- ❌ NUNCA usar auth.uid() sin verificar NULL
- ✅ SIEMPRE usar TypeScript types generados

---

#### 4. `postgresql-advanced-patterns` ALTA
**Version**: 1.0.0
**Size**: 44 lines
**Dependencies**: PostgreSQL 15.1

**Purpose**: Advanced PostgreSQL patterns (optimization, indexes, advanced SQL)

**When to Invoke**:
- Keywords: query optimization, index, CTE, full-text search
- Operations: Optimizing slow queries, designing schema

**Critical Rules**:
- ❌ NUNCA crear tablas sin primary key
- ❌ NUNCA olvidar indexes en foreign keys
- ❌ NUNCA usar SELECT * en producción
- ✅ SIEMPRE usar transacciones
- ✅ SIEMPRE añadir constraints

---

### Infrastructure & DevOps (Critical for Operations)

#### 5. `database-management` 🚨 CRÍTICO
**Version**: 1.0.0
**Size**: 672 lines
**Dependencies**: docker, postgresql-client, redis-cli, qdrant-client

**Purpose**: PostgreSQL backup/restore, migrations (17→18), health monitoring, Redis/Qdrant operations

**When to Invoke**:
- Keywords: backup, restore, migration, PostgreSQL, database
- Operations: Backup creation, database migrations, health checks
- Troubleshooting: Database connection issues, performance problems

**Key Features**:
- ✅ Automated & manual backups
- ✅ PostgreSQL version upgrades
- ✅ Health monitoring queries
- ✅ Redis & Qdrant operations
- ✅ Query optimization

**Critical Rules**:
- ❌ NUNCA hacer backup sin verificar espacio
- ❌ NUNCA correr migrations sin backup
- ❌ NUNCA usar DROP DATABASE sin confirmar 3 veces
- ✅ SIEMPRE verificar exit code de pg_dump
- ✅ SIEMPRE mantener retention policy

---

#### 6. `git-workflow-manager` 🚨 CRÍTICO
**Version**: 1.0.0
**Size**: 678 lines
**Dependencies**: git, gh (GitHub CLI)

**Purpose**: Complete Git workflow for submodule repository with Git Flow strategy

**When to Invoke**:
- Keywords: commit, branch, PR, merge, push, rollback
- Operations: Creating commits, branches, pull requests
- Emergency: Rollback procedures

**Key Features**:
- ✅ Submodule workflow complete
- ✅ Git Flow (main/develop/feature/hotfix)
- ✅ Commit templates
- ✅ PR creation automation
- ✅ Emergency rollback procedures

**Critical Rules**:
- ❌ NUNCA trabajar fuera del submodule
- ❌ NUNCA usar `git add .`
- ❌ NUNCA commit sin testing
- ❌ NUNCA push directo a main
- ✅ SIEMPRE configurar git identity

---

#### 7. `docker-operations` 🚨 CRÍTICO
**Version**: 1.0.0
**Size**: 561 lines
**Dependencies**: docker, docker-compose

**Purpose**: Container operations for AI Platform and Monitoring stack

**When to Invoke**:
- Keywords: docker, container, service, logs, restart
- Operations: Start/stop services, check health, analyze logs
- Troubleshooting: Container issues, network problems

**Key Features**:
- ✅ AI Platform management (n8n, Flowise, Supabase, etc.)
- ✅ Monitoring stack operations
- ✅ Health checks & resource monitoring
- ✅ Logs analysis
- ✅ Network troubleshooting

**Critical Rules**:
- ❌ NUNCA usar `docker system prune -a` sin backup
- ❌ NUNCA eliminar volúmenes sin confirmar
- ❌ NUNCA hacer `docker-compose down -v` en producción
- ✅ SIEMPRE verificar health antes de commits
- ✅ SIEMPRE usar project names

---

### Dashboard Project (Specific to this project)

#### 8. `dashboard-dev-workflow` MEDIA
**Version**: 1.0.0
**Size**: 41 lines

**Purpose**: Development workflow for Personal Dashboard (phases 0-5)

**When to Invoke**:
- Starting new phase of dashboard development
- Running tests and validation
- Deployment procedures

---

#### 9. `dashboard-schema-reference` MEDIA
**Version**: 1.0.0
**Size**: 35 lines

**Purpose**: Database schema for 16 tables (Gym, Finance, Nutrition, Family CRM)

**When to Invoke**:
- Working with database schema
- Creating queries
- Setting up RLS policies

**Schema Modules**:
- Gym Training: workouts, exercises, workout_progress
- Finance: transactions, investments, budgets, transaction_audit
- Nutrition: meals, food_items, nutrition_goals
- Family CRM: family_members, time_logs, events, reminders
- Shared: profiles, notifications

---

### AI Integration (Phase 3)

#### 10. `ai-services-integration` MEDIA
**Version**: 1.0.0
**Size**: 31 lines (smallest skill)
**Dependencies**: n8n@1.19.4, flowise@1.4.12, qdrant@1.7.4, redis@7.2.3

**Purpose**: Integration patterns for n8n, Flowise, Qdrant, Redis

**When to Invoke**:
- Implementing AI features (Phase 3)
- Integrating n8n workflows
- Vector search with Qdrant
- Caching with Redis

**Critical Rules**:
- ❌ NUNCA exponer n8n tokens en cliente
- ❌ NUNCA crear Qdrant collections sin dimensiones correctas
- ❌ NUNCA cachear sin TTL en Redis
- ✅ SIEMPRE implementar rate limiting
- ✅ SIEMPRE sanitizar input antes de LLMs

---

### Support (Troubleshooting & Reference)

#### 11. `troubleshooting-guide` BAJA
**Version**: 1.0.0
**Size**: 34 lines

**Purpose**: Troubleshooting common issues (ports, database, services, RLS)

**When to Invoke**:
- Errors, failures, issues
- Service not working
- Debugging needed

**Covers**:
- Port conflicts resolution
- Database connection issues
- Service failures
- RLS policy errors

---

#### 12. `service-port-reference` BAJA
**Version**: 1.0.0
**Size**: 32 lines

**Purpose**: Complete port mapping reference for all services

**When to Invoke**:
- Service configuration
- Troubleshooting connections
- Checking port availability

---

#### 13. `monitoring-operations` BAJA
**Version**: 1.0.0
**Size**: 39 lines

**Purpose**: Monitoring operations (Prometheus, Grafana, AlertManager)

**When to Invoke**:
- Monitoring setup
- Metrics analysis
- Dashboard configuration

---

## 🎯 Skill Invocation Matrix

| Task Type | Skill to Invoke | Trigger Keywords | Versiones |
|-----------|----------------|------------------|--------------|
| **Next.js dev** | `nextjs-app-router-patterns` | Server Component, route handler | Next.js 15.0.3 |
| **UI components** | `react-ui-component-library` | shadcn, form, Tailwind | TailwindCSS 3.4.1 |
| **Supabase** | `supabase-integration-patterns` | auth, SSR, RLS | Supabase JS 2.39.0 |
| **PostgreSQL** | `postgresql-advanced-patterns` | optimization, index | PostgreSQL 15.1 |
| **Database ops** | `database-management` | backup, restore, migration | PostgreSQL 15.1 |
| **Git operations** | `git-workflow-manager` | commit, branch, PR, merge | Git 2.x, gh CLI |
| **Docker ops** | `docker-operations` | container, service, logs | Docker 24.x |
| **Dashboard dev** | `dashboard-dev-workflow` | phase, testing | N/A |
| **Schema** | `dashboard-schema-reference` | workouts, transactions | N/A |
| **AI integration** | `ai-services-integration` | n8n, Qdrant, Redis | n8n 1.19.4 |
| **Debugging** | `troubleshooting-guide` | error, failure | N/A |

---

## 🔧 Usage Guidelines

### Auto-Invocation

Skills are automatically invoked when Claude Code detects trigger keywords:

- "Server Component" → `nextjs-app-router-patterns`
- "RLS policy" → `supabase-integration-patterns`
- "commit" → `git-workflow-manager`
- "backup" → `database-management`

### Manual Invocation

To manually invoke a skill, mention it in your request:

```
"Use the nextjs-app-router-patterns skill to help me create this page"
"Invoke database-management skill for backup procedures"
"Show me the dashboard-schema-reference skill"
```

---

## 📈 Statistics

**Total Skills**: 13
**Total Lines**: 3,781 lines
**Average Size**: 291 lines/skill
**Largest Skill**: `nextjs-app-router-patterns` (787 lines)
**Smallest Skill**: `ai-services-integration` (31 lines)

**By Category**:
- **Frontend Stack**: 2 skills (1,497 lines) - Next.js + React patterns
- **Backend Stack**: 2 skills (161 lines) - Supabase + PostgreSQL
- **Infrastructure**: 3 skills (1,911 lines) - Database + Git + Docker
- **Dashboard Project**: 2 skills (76 lines) - Workflow + Schema
- **AI Integration**: 1 skill (31 lines) - n8n, Flowise, Qdrant, Redis
- **Support**: 3 skills (105 lines) - Troubleshooting + Monitoring

---

## 📝 Maintenance

### Updating Skills

1. Navigate to skill: `.claude/skills/[skill-name]/`
2. Edit `skill.md`
3. Update version number and last_updated date
4. Test skill invocation
5. Commit changes with `git-workflow-manager` skill

### Creating New Skills

1. Create directory: `.claude/skills/[new-skill]/`
2. Create `skill.md` with standard template
3. Include version, dependencies, purpose, rules
4. Update this catalog
5. Update CLAUDE.md references

---

## 🔗 Related Documentation

- **Project CLAUDE.md**: `../CLAUDE.md` (main guidance file)
- **Phase Guides**: `../fases/` (phase-by-phase implementation)
- **Implementation Guide**: `../../docs/guia-implementacion-dashboard.md`
- **Parent CLAUDE.md**: `../../CLAUDE.md` (infrastructure workflow)

---

## 🚀 Future Enhancements (Planned)

Potential future skills to consider:
- `testing-patterns` - Unit tests, integration tests, E2E with Playwright
- `performance-optimization` - Lighthouse, Web Vitals, bundle analysis
- `deployment-automation` - Docker build, CI/CD, environment management
- `api-design-patterns` - REST API patterns, error handling, validation
- `state-management-patterns` - Zustand, React Context, Server State

---

**Last Updated**: 2025-12-09
**Maintained By**: Claude Code
**Version**: 1.0.0
**Project**: Personal Dashboard

**Context Optimization**: Active (-78% initial context)
