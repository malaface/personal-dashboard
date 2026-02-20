# Personal Dashboard - Exposición via Túnel AI Platform

**Fecha:** 2026-01-19
**Estado:** Completado

## Resumen

Se expuso el Personal Dashboard públicamente a través del túnel de Cloudflare existente de AI Platform, evitando la necesidad de crear un túnel separado.

## Arquitectura Implementada

```
┌─────────────────────────────────────────────────────────────────┐
│                    LOCALAI_DEFAULT NETWORK                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  cloudflared-ai-platform ←── Cloudflare                         │
│     │                                                           │
│     ├─→ flowise:3001         (flowiseserver.malacaran8n.uk)    │
│     ├─→ n8n:5678             (n8nserver.malacaran8n.uk)        │
│     ├─→ open-webui:8080      (openwebuiserver.malacaran8n.uk)  │
│     ├─→ supabase-kong:8000   (supabaseserver.malacaran8n.uk)   │
│     └─→ personal-dashboard:3000  (dashboard.malacaran8n.uk) ← NUEVO
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## URL de Acceso

- **Dashboard:** https://dashboard.malacaran8n.uk
- **Login:** https://dashboard.malacaran8n.uk/login

## Cambios Realizados

### 1. Configuración del Túnel

**Archivo modificado:** `/home/badfaceserverlap/docker/contenedores/shared/cloudflare-tunnels/ai-platform-tunnel.yml`

Se agregó la siguiente entrada antes del catch-all:

```yaml
  # Personal Dashboard - Multi-user management system
  - hostname: dashboard.malacaran8n.uk
    service: http://personal-dashboard:3000
    originRequest:
      httpHostHeader: dashboard.malacaran8n.uk
      noTLSVerify: true
      connectTimeout: 30s
      headers:
        "X-Forwarded-Proto": "https"
        "X-Forwarded-Host": "dashboard.malacaran8n.uk"
```

### 2. Configuración DNS en Cloudflare

El hostname `dashboard.malacaran8n.uk` fue configurado en el túnel de AI Platform a través del dashboard de Cloudflare Zero Trust.

### 3. Red Docker

El contenedor `personal-dashboard` se conectó a la red `localai_default` para permitir la comunicación con `cloudflared-ai-platform`.

### 4. Stack de Producción

Se levantó el stack completo del dashboard:

```bash
cd /home/badfaceserverlap/personal-dashboard/code
docker compose -f docker-compose.production.yml up -d
```

Esto levantó:
- `dashboard-db` (PostgreSQL 15-alpine) - Puerto externo 5435
- `personal-dashboard` (Next.js) - Puerto externo 3003, interno 3000

## Verificación

### Servicios Funcionando

| URL | Estado |
|-----|--------|
| https://dashboard.malacaran8n.uk | HTTP 307 → /login |
| https://dashboard.malacaran8n.uk/login | HTTP 200 |
| https://n8nserver.malacaran8n.uk | HTTP 200 |
| https://flowiseserver.malacaran8n.uk | HTTP 200 |

### Contenedores Activos

```
personal-dashboard   Up (healthy)   0.0.0.0:3003->3000/tcp
dashboard-db         Up (healthy)   0.0.0.0:5435->5432/tcp
cloudflared-ai-platform  Up
```

## Notas Importantes

1. **No hay interferencia con PostgreSQL de AI Platform:** dashboard-db usa puerto externo 5435, completamente separado de Supabase
2. **Administración centralizada:** Todos los servicios se administran desde el túnel de AI Platform
3. **Rate limits compartidos:** El dashboard comparte límites con otros servicios del túnel

## Comandos Útiles

```bash
# Ver logs del túnel
docker logs cloudflared-ai-platform --tail 30

# Ver estado de contenedores del dashboard
docker ps | grep -E "dashboard-db|personal-dashboard"

# Reiniciar stack del dashboard
cd /home/badfaceserverlap/personal-dashboard/code
docker compose -f docker-compose.production.yml restart

# Ver logs del dashboard
docker logs personal-dashboard --tail 50
```

## Próximos Pasos

- [x] Configuración del túnel completada
- [x] DNS configurado en Cloudflare
- [x] Stack de producción funcionando
- [x] Verificación de servicios existentes
- [ ] Monitoreo de performance
- [ ] Configurar backups automáticos de dashboard-db
