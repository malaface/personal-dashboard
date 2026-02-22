# Fix: Tabla users vacía causaba errores de foreign key

**Fecha:** 2026-02-20
**Severidad:** Alta
**Estado:** Resuelto

## Problema

La aplicación mostraba estado **unhealthy** y los logs reportaban errores continuos de foreign key constraint:

```
Foreign key constraint violated: `workouts_userId_fkey (index)`
Foreign key constraint violated: `catalog_items_userId_fkey (index)`
Key (userId)=(cmk1yix6u0003hq4kldzi5bqi) is not present in table "users".
```

## Diagnóstico

| Componente | Estado |
|-----------|--------|
| PostgreSQL | Healthy, migraciones al día (13/13) |
| Redis | Healthy |
| Next.js | Unhealthy (errores P2003 en cada request) |

### Causa raíz

La tabla `users` estaba completamente vacía (0 registros), junto con `accounts` y `sessions`. Sin embargo, el navegador mantenía un token de sesión con el `userId` antiguo (`cmk1yix6u0003hq4kldzi5bqi`), causando que cada operación (crear workout, crear catalog_item) fallara por violación de foreign key.

Los 218 `catalog_items` existentes eran items de sistema (`isSystem = true`, `userId = NULL`) y no estaban afectados.

## Solución aplicada

1. Se registró un nuevo usuario desde la interfaz web
2. Se verificó que los catalog_items existentes eran de sistema (no huérfanos)
3. Se reinició el contenedor `nextjs-dashboard` para limpiar el estado unhealthy
4. Se confirmó respuesta HTTP 307 (redirect a login) — app funcional

## Verificación

```
$ docker compose ps
dashboard-postgres   Up (healthy)
dashboard-redis      Up (healthy)
nextjs-dashboard     Up (healthy)

$ curl -s -o /dev/null -w "%{http_code}" http://localhost:3003
307
```

## Lecciones aprendidas

- Configurar backups automáticos de la DB (la carpeta `backups/` estaba vacía)
- Considerar agregar un healthcheck más específico que valide la existencia de al menos un usuario admin
- Al estar en etapa de pruebas, no hubo pérdida de datos de producción
