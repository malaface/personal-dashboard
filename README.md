# Personal Dashboard - Multi-User Management System

**Proyecto:** Dashboard Personal Interactivo
**Última actualización:** 2025-12-09
**Estado:** Fase 0 ✅ COMPLETADA

---

## 📋 Descripción del Proyecto

Dashboard personal integral para gestión de actividades diarias con integración de IA y servicios backend existentes.

### Módulos Principales

1. **Gym Training Tracker** - Seguimiento de entrenamientos y progreso físico
2. **Finance & Investment Tracker** - Gestión financiera y seguimiento de inversiones
3. **Nutrition Tracker** - Control nutricional y registro de comidas
4. **Family CRM** - Gestión de tiempo familiar y eventos importantes

---

## 🏗️ Arquitectura

### Stack Tecnológico
- **Frontend:** Next.js 15 (App Router) + React 18
- **Backend:** Supabase (Auth, PostgreSQL, Realtime, Storage)
- **Styling:** TailwindCSS + shadcn/ui
- **Validation:** Zod
- **AI Integration:** n8n workflows + Flowise chatflows + Qdrant vector search
- **Monitoring:** Prometheus + Grafana
- **Deployment:** Docker Compose

### Puerto Asignado
- **Externo:** 3003
- **Interno:** 3000 (Next.js default)

### Redes Docker
- `localai_default` - Acceso a servicios de AI Platform
- `monitoring` - Integración con Prometheus/Grafana

### Servicios Integrados
- **Supabase** (Kong:8000) - Auth, Database, Realtime, Storage
- **n8n** (5678) - Automation workflows
- **Flowise** (3001) - AI Chatflows
- **Qdrant** (6333/6334) - Vector search
- **Redis** (6379) - Cache y rate limiting
- **PostgreSQL** (5432) - Database principal

---

## 📊 Estado de las Fases

| Fase | Nombre | Estado | Documentación |
|------|--------|--------|---------------|
| 0 | Security Hardening & Infrastructure | ✅ COMPLETADA | [fase0-completado.md](fases/fase0-completado.md) |
| 1 | Foundation (Weeks 1-2) | 📋 PENDIENTE | [fase1-foundation.md](fases/fase1-foundation.md) |
| 2 | Core Modules (Weeks 3-6) | ⏳ PENDIENTE | [fase2-core-modules.md](fases/fase2-core-modules.md) |
| 3 | AI Integration (Weeks 7-8) | ⏳ PENDIENTE | [fase3-ai-integration.md](fases/fase3-ai-integration.md) |
| 4 | Polish & Deploy (Weeks 9-10) | ⏳ PENDIENTE | [fase4-polish-deploy.md](fases/fase4-polish-deploy.md) |
| 5 | Post-Launch (Optional) | ⏳ PENDIENTE | [fase5-post-launch.md](fases/fase5-post-launch.md) |

---

## 🔒 Seguridad (Fase 0 - Completada)

### Cambios Implementados

| Configuración | Antes | Después | Motivo |
|--------------|-------|---------|--------|
| DISABLE_SIGNUP | false | ✅ **true** | Evitar registros públicos |
| ENABLE_EMAIL_AUTOCONFIRM | true | ✅ **false** | Verificación obligatoria |
| ENABLE_PHONE_AUTOCONFIRM | true | ✅ **false** | Verificación SMS |
| FUNCTIONS_VERIFY_JWT | false | ✅ **true** | Auth en edge functions |
| VAULT_ENC_KEY | placeholder | ✅ **generado** | Cifrado real |

### Tokens de Autenticación Generados
- ✅ **QDRANT_API_KEY** - Protección de vector database
- ✅ **N8N_API_TOKEN** - Autenticación de webhooks

---

## 🚀 Inicio Rápido

### Para Iniciar una Nueva Fase

1. **Abre el archivo de la fase** en `fases/faseN-nombre.md`
2. **Lee la sección "Pre-Requisitos"** y valida todo antes de empezar
3. **Copia el "Prompt de Inicio"** para nueva conversación con Claude
4. **Sigue el checklist paso a paso**
5. **Valida al finalizar** con los comandos de la sección final

### Comandos de Gestión

```bash
# Ver servicios activos
cd projects/personal-dashboard-project
docker-compose ps

# Ver logs del dashboard
docker-compose logs -f nextjs-dashboard

# Reiniciar dashboard
docker-compose restart nextjs-dashboard

# Detener dashboard
docker-compose down
```

---

## 📁 Estructura del Proyecto

```
projects/personal-dashboard-project/
├── README.md                    # Este archivo
├── fases/                       # Documentación de cada fase
│   ├── fase0-completado.md
│   ├── fase1-foundation.md
│   ├── fase2-core-modules.md
│   ├── fase3-ai-integration.md
│   ├── fase4-polish-deploy.md
│   └── fase5-post-launch.md
├── code/                        # Código fuente del dashboard
│   └── app/                     # Next.js application (Fase 1+)
├── docs/                        # Documentación técnica
│   └── database-schema.md       # Esquema de base de datos
└── backups/                     # Backups específicos del dashboard
```

---

## 🔗 Referencias Importantes

### Documentación del Proyecto
- **Plan Completo:** `/home/badfaceserverlap/.claude/plans/quizzical-knitting-knuth.md`
- **Guía Completa:** `/home/badfaceserverlap/docker/contenedores/docs/guia-implementacion-dashboard.md`
- **Reporte Fase 0:** `/home/badfaceserverlap/docker/contenedores/docs/phase0-security-hardening-report.md`

### Infraestructura
- **AI Platform:** `../ai-platform/`
- **Monitoring:** `../../shared/monitoring/`
- **Backups AI Platform:** `../../shared/backups/ai-platform/manual-pre-dashboard-phase0`

### Usuario Admin
- **Email:** malacaram807@gmail.com
- **Password:** My_badface27
- **Creado en:** Fase 0 (2025-12-09)

---

## 📝 Notas de Desarrollo

### Variables de Entorno
Las variables se cargan desde `../ai-platform/.env`:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- N8N_API_TOKEN
- FLOWISE_USERNAME, FLOWISE_PASSWORD
- QDRANT_API_KEY
- REDIS_URL
- DATABASE_URL

### Git Workflow
```bash
# Trabajar siempre en develop
git checkout develop

# Crear commits descriptivos
git commit -m "Stable solution: [descripción]"

# Validar antes de commit
bash shared/scripts/health-check.sh
```

---

## 🎯 Próximos Pasos

**Fase 1 - Foundation (Pendiente):**
1. Inicializar proyecto Next.js 15
2. Instalar dependencias base
3. Configurar Supabase clients
4. Crear esquema de base de datos
5. Implementar RLS policies
6. Crear páginas de autenticación
7. Construir layout y navegación

**Ver detalles completos en:** [fases/fase1-foundation.md](fases/fase1-foundation.md)

---

**Creado:** 2025-12-09
**Última actualización:** 2025-12-09
**Fase Actual:** 0 ✅ COMPLETADA
