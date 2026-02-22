# Personal Dashboard

Sistema de gestión personal multi-usuario: entrenamiento gym, finanzas, nutrición y CRM familiar con integración de IA.

**Repo:** https://github.com/malaface/personal-dashboard (privado)

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | Next.js 16 (App Router) + React 19 + TypeScript 5 |
| UI | TailwindCSS 3.4 + shadcn/ui (Radix UI) |
| Backend | Prisma 5.22 + PostgreSQL 15 + NextAuth.js 5.x |
| AI | n8n + Flowise + Qdrant + Redis |
| Deploy | Docker Compose con profiles |

## Módulos

- **Gym** — Seguimiento de entrenamientos, ejercicios, templates
- **Finance** — Gestión financiera, cuentas, tarjetas
- **Nutrition** — Control nutricional, registro de comidas, templates
- **Family CRM** — Contactos familiares, eventos, calendario

---

## Requisitos previos

- Docker y Docker Compose v2
- Node.js 18+ y npm
- Git
- `make` (viene preinstalado en Linux/macOS)

## Inicio rápido

### 1. Clonar y configurar variables de entorno

```bash
git clone git@github.com:malaface/personal-dashboard.git
cd personal-dashboard

# Crear archivo .env en la raíz con las variables de Docker Compose
cp .env.example .env  # o crearla manualmente

# Crear archivo .env.local en code/ para desarrollo
cp code/.env.example code/.env.local  # o crearla manualmente
```

Variables necesarias en `.env` (raíz):

```
DASHBOARD_DB_PASSWORD=...
DASHBOARD_REDIS_PASSWORD=...
NEXTAUTH_SECRET=...
RESEND_API_KEY=...
RESEND_FROM_EMAIL=...
```

Variables necesarias en `code/.env.local`:

```
DATABASE_URL="postgresql://dashboard_user:PASSWORD@localhost:5434/dashboard"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."
REDIS_URL="redis://:PASSWORD@localhost:6379"
```

### 2. Levantar servicios (desarrollo)

```bash
# Levantar solo DB + Redis
make dev

# Instalar dependencias y correr la app
cd code
npm install
npx prisma generate
npx prisma migrate deploy
npm run dev
```

La app estará en **http://localhost:3000**.

### 3. Levantar servicios (producción)

```bash
# Levantar todo el stack: DB + Redis + App
make prod

# O si necesitas reconstruir la imagen de la app
make prod-build
```

La app estará en **http://localhost:3003**.

---

## Docker Compose Profiles

El proyecto usa **Docker Compose profiles** para separar entornos sin duplicar configuración:

| Comando | Qué levanta | Cuándo usar |
|---------|-------------|-------------|
| `make dev` | PostgreSQL + Redis | Desarrollo local (app con `npm run dev`) |
| `make prod` | PostgreSQL + Redis + App | Producción |
| `make prod-build` | Todo + rebuild de imagen | Deploy con cambios de código |
| `make down` | Detiene todo | Siempre (incluye la app con `--profile app`) |

### Todos los comandos disponibles

```bash
# Flujo de actualización
make down         # Detener todos los contenedores
make pull         # git pull + npm install
make up           # DB → migraciones → rebuild → arrancar todo

# Desarrollo
make dev          # Solo DB + Redis (app con npm run dev)

# Producción (manual)
make prod         # Levantar todo sin rebuild
make prod-build   # Levantar todo con rebuild de la app

# Utilidades
make status       # Ver estado de contenedores
make logs         # Logs de todos los servicios
make logs-app     # Logs solo de la app
make db-shell     # Shell interactivo de PostgreSQL
make backup       # Backup de la DB → backups/
```

---

## Puertos

| Servicio | Puerto | URL | Entorno |
|---------|--------|-----|---------|
| Dashboard (Docker) | 3003 → 3000 | http://localhost:3003 | prod |
| Dashboard (dev) | 3000 | http://localhost:3000 | dev |
| PostgreSQL | 5434 → 5432 | localhost:5434 | ambos |
| Redis | 6379 | localhost:6379 | ambos |
| n8n | 5678 | http://localhost:5678 | externo |
| Flowise | 3001 | http://localhost:3001 | externo |
| Qdrant | 6333 | http://localhost:6333 | externo |

---

## Actualizar la aplicación

Tres comandos, siempre en el mismo orden:

```bash
make down    # 1. Detener todo
make pull    # 2. Traer cambios + instalar dependencias
make up      # 3. Levantar DB → migrar → rebuild → arrancar app
```

`make up` se encarga de todo automáticamente:
1. Levanta PostgreSQL + Redis
2. Espera a que la DB esté healthy
3. Ejecuta `prisma generate` + `prisma migrate deploy`
4. Reconstruye la imagen de la app y la levanta

Si quieres hacer backup antes de actualizar (recomendado cuando hay migraciones):

```bash
make backup  # antes de make down
```

---

## Estructura del proyecto

```
personal-dashboard/
├── README.md
├── CLAUDE.md                    # Instrucciones para Claude Code
├── Makefile                     # Shortcuts de Docker Compose
├── docker-compose.yml           # DB + Redis + App (con profiles)
├── code/                        # Next.js app
│   ├── app/                     # App Router (pages, layouts, API routes)
│   │   ├── (auth)/              # /login, /register
│   │   └── dashboard/           # /dashboard + módulos
│   ├── components/
│   │   ├── ui/                  # shadcn/ui (editables)
│   │   ├── layout/              # Shell, Sidebar, MobileBottomNav
│   │   ├── gym/ finance/ nutrition/ family/
│   │   └── templates/           # MealTemplateManager, WorkoutTemplateManager
│   ├── lib/
│   │   ├── db/prisma.ts         # Prisma singleton
│   │   ├── auth/                # requireAuth(), verifyOwnership()
│   │   ├── audit/logger.ts      # logAudit()
│   │   └── validations/         # Zod schemas
│   ├── prisma/
│   │   ├── schema.prisma        # 31 tablas
│   │   └── migrations/          # Migraciones aplicadas
│   └── Dockerfile               # Build de producción
├── docs/                        # Reportes y documentación
└── backups/                     # Backups de DB
```

---

## Git workflow

```bash
# Crear branch desde develop
git checkout develop && git pull origin develop
git checkout -b "feature/nombre"

# Hacer cambios, luego pre-commit checks
cd code
npm run build && npm run lint && npx tsc --noEmit

# Stage específico + commit
git add code/path/to/file.tsx
git commit -m "feat: descripción"

# Push + PR
git push -u origin "feature/nombre"
gh pr create --base develop --title "feat: Descripción" --body "..."
```

**Convención de branches:** `feature/`, `fix/`, `refactor/`, `docs/`, `chore/`, `hotfix/`
