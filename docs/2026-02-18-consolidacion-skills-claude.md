# Consolidación de Skills y Actualización de CLAUDE.md

**Fecha:** 2026-02-18
**Categoría:** Mantenimiento / Context Optimization
**Branch:** feature/github-actions-branch-workflow

---

## Problema

El sistema de skills tenía 14 skills dispersas (5,119+ líneas) con los siguientes problemas:
- Contenido redundante entre skills relacionadas (nextjs + react-ui, postgres + postgresql-advanced)
- Referencias a tecnologías que el proyecto **no usa** (Supabase en múltiples skills)
- Skills de AI Platform irrelevantes para este proyecto (database-management, docker-operations)
- CLAUDE.md desactualizado: versiones incorrectas (Next.js 15→16, React 18→19), referenciando 14 skills
- Tabla de schema desactualizada (indicaba 23 tablas, el proyecto tiene 31)
- Fases desactualizadas (el app está construido y funcionando)

---

## Causa Raíz

El sistema de skills fue creado en fases tempranas del proyecto (Dic 2025) y nunca actualizado a medida que el proyecto evolucionó. Las skills fueron copiadas parcialmente de otro proyecto (AI Platform) sin limpiar referencias irrelevantes.

---

## Solución Implementada

### 1. Consolidación de 14 skills → 3 skills

| Skill eliminada | Reemplazada por |
|----------------|-----------------|
| nextjs-app-router-patterns | `frontend` |
| react-ui-component-library | `frontend` |
| dashboard-postgres-operations | `backend` |
| postgresql-advanced-patterns | `backend` |
| ai-services-integration | `backend` |
| dashboard-schema-reference | `backend` (inline) |
| dashboard-dev-workflow | Eliminada (obsoleta) |
| database-management | Eliminada (AI Platform, irrelevante) |
| docker-operations | Eliminada (AI Platform, irrelevante) |
| supabase-integration-patterns | Eliminada (proyecto no usa Supabase) |
| troubleshooting-guide | Eliminada (contenido integrado en skills) |
| service-port-reference | Eliminada (tabla en CLAUDE.md) |
| monitoring-operations | Eliminada (AI Platform, irrelevante) |
| git-workflow-manager | `git-workflow` (reescrita para este proyecto) |

### 2. Nuevas skills creadas

**`.claude/skills/frontend/skill.md`**
- Next.js 16.0.8 + React 19.2.1 patterns
- Server vs Client Components con ejemplos reales
- shadcn/ui, react-hook-form + Zod
- TailwindCSS mobile-first + dark mode
- Caching, loading/error states, recharts
- Layout del Dashboard (DashboardShell, Sidebar, MobileBottomNav)

**`.claude/skills/backend/skill.md`**
- Schema real: 31 tablas, 13 migrations
- Prisma CRUD con aislamiento de usuario (siempre userId)
- NextAuth.js: requireAuth(), verifyOwnership()
- Migrations dev vs deploy, rollback
- Backup & Restore procedures
- AI Services: n8n, Flowise, Qdrant, Redis
- Audit logging, Zod validation, env vars

**`.claude/skills/git-workflow/skill.md`**
- Feature branch workflow completo
- Conventional commits con Co-Authored-By correcto
- GitHub CLI commands
- Pasos obligatorios post-resolución (reporte + commit)
- Semantic versioning strategy

### 3. CLAUDE.md reescrito

- Reducido de ~450 líneas a ~130 líneas (~71% reducción)
- Versiones corregidas: Next.js 16.0.8, React 19.2.1
- Tabla de skills actualizada a 3
- Schema actualizado: 31 tablas, 13 migrations
- Eliminadas referencias a Supabase
- Eliminadas secciones de fases (obsoletas)
- Estructura de archivos real del proyecto

---

## Archivos Modificados

- `CLAUDE.md` — Reescrito completo (450 → 130 líneas)
- `.claude/skills/frontend/skill.md` — Creado (nuevo)
- `.claude/skills/backend/skill.md` — Creado (nuevo)
- `.claude/skills/git-workflow/skill.md` — Creado (nuevo)
- `.claude/skills/nextjs-app-router-patterns/` — Eliminado
- `.claude/skills/react-ui-component-library/` — Eliminado
- `.claude/skills/dashboard-postgres-operations/` — Eliminado
- `.claude/skills/postgresql-advanced-patterns/` — Eliminado
- `.claude/skills/ai-services-integration/` — Eliminado
- `.claude/skills/database-management/` — Eliminado
- `.claude/skills/docker-operations/` — Eliminado
- `.claude/skills/supabase-integration-patterns/` — Eliminado
- `.claude/skills/dashboard-dev-workflow/` — Eliminado
- `.claude/skills/dashboard-schema-reference/` — Eliminado
- `.claude/skills/troubleshooting-guide/` — Eliminado
- `.claude/skills/service-port-reference/` — Eliminado
- `.claude/skills/monitoring-operations/` — Eliminado
- `.claude/skills/git-workflow-manager/` — Eliminado

---

## Verificación

- ✅ Solo 3 skills en `.claude/skills/`: `frontend`, `backend`, `git-workflow`
- ✅ CLAUDE.md con versiones correctas (Next.js 16.0.8, React 19.2.1)
- ✅ Schema count correcto: 31 tablas (verificado contra DB real)
- ✅ Migrations count correcto: 13 (verificado contra `_prisma_migrations`)
- ✅ Sin referencias a Supabase en ningún archivo
- ✅ Sin skills de AI Platform (database-management, docker-operations)

---

## Beneficios

- **Reducción de contexto:** De 14 skills a 3 skills enfocadas
- **Precisión:** Versiones y schema reflejan la realidad actual del proyecto
- **Sin confusión:** Eliminadas tecnologías que el proyecto no usa (Supabase)
- **Mantenibilidad:** 3 archivos vs 14 para actualizar cuando cambie el proyecto
- **Trigger coverage:** Keywords cubren todos los casos de uso comunes

---

## Lecciones Aprendidas

- Las skills deben actualizarse con cada migración/cambio de schema importante
- Las versiones en CLAUDE.md deben verificarse contra `package.json` real
- No copiar skills de otros proyectos sin limpiar tecnologías irrelevantes
- Mantener un único source of truth para la estructura del schema (en `backend` skill)
