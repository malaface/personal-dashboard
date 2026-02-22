# Docker Compose Profiles — Simplificación del Deploy

**Fecha:** 2026-02-19
**Branch:** `feature/github-actions-branch-workflow`

## Problema

El `docker-compose.yml` levantaba todos los servicios (DB + Redis + App) sin distinción entre entornos. En desarrollo solo se necesitan DB + Redis (la app corre con `npm run dev`), pero no había forma de levantar solo la infraestructura sin la app.

## Solución: Docker Compose Profiles

Se implementaron **profiles** de Docker Compose para separar los servicios por entorno sin duplicar archivos de configuración.

### Cambios realizados

| Archivo | Cambio |
|---------|--------|
| `docker-compose.yml` | Agregado `profiles: ["app"]` al servicio `nextjs-dashboard`, eliminado `version: '3.8'` (deprecated en Compose v2) |
| `Makefile` | Creado con targets: `dev`, `prod`, `prod-build`, `down`, `logs`, `logs-app`, `db-shell`, `backup`, `status` |
| `CLAUDE.md` | Actualizada sección de comandos y puertos con los nuevos `make` targets |

### Comportamiento

| Comando | Servicios | Uso |
|---------|-----------|-----|
| `make dev` | DB + Redis | Desarrollo local (app con `npm run dev`) |
| `make prod` | DB + Redis + App | Producción |
| `make prod-build` | DB + Redis + App (rebuild) | Deploy con cambios en la imagen |
| `make down` | Detiene todo | Usa `--profile app` para incluir la app |

### Por qué profiles y no archivos separados

- **Un solo archivo** de configuración — no hay duplicación de DB/Redis entre `docker-compose.dev.yml` y `docker-compose.prod.yml`
- **Una sola línea** (`profiles: ["app"]`) es todo el cambio necesario
- **Compatible hacia atrás** — `docker compose up -d` sigue funcionando, solo que ahora excluye la app automáticamente
- **`make down`** usa `--profile app` para asegurar que también detenga la app si estaba corriendo

### Verificación

1. `make dev` → solo `dashboard-postgres` y `dashboard-redis` corren
2. `cd code && npm run dev` → app funciona en `localhost:3000` conectando a DB en puerto 5434
3. `make down && make prod-build` → los 3 contenedores corren, app responde en `localhost:3003`
4. `make down` → todo se detiene limpiamente
