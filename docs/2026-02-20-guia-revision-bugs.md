# Guia de Revision - Bugs Pendientes

**Fecha:** 2026-02-20
**Estado:** Pendiente de revision
**Base de datos:** Contenedor `dashboard-postgres` | DB: `dashboard` | Puerto: `5434→5432`

---

## Bug 1: Templates se congelan y producen error al cargar

### Sintomas
- La pagina se congela al intentar cargar templates (workouts o meals)
- Despues del congelamiento, muestra error y expulsa al usuario

### Archivos a revisar

| Archivo | Motivo |
|---------|--------|
| `code/components/templates/WorkoutTemplateManager.tsx` | Fetch inicial en `useEffect` |
| `code/components/templates/MealTemplateManager.tsx` | Fetch inicial en `useEffect` |
| `code/components/templates/WorkoutTemplateSelector.tsx` | Double-fetch al seleccionar template |
| `code/components/templates/MealTemplateSelector.tsx` | Double-fetch al seleccionar template |
| `code/app/api/templates/workouts/route.ts` | API route - query a DB |
| `code/app/api/templates/meals/route.ts` | API route - query a DB |
| `code/lib/templates/workout-queries.ts` | Queries de Prisma |
| `code/lib/templates/meal-queries.ts` | Queries de Prisma |

### Posibles causas identificadas

1. **Sin paginacion**: `getWorkoutTemplates` y `getMealTemplates` traen TODOS los templates publicos sin limite (`take`). A medida que crecen los datos, la query se vuelve mas pesada.

2. **Double-fetch redundante**: Al seleccionar un template, se hace un segundo `GET /[id]/load` que re-ejecuta la query completa con todos los `include` (exerciseType, muscleGroup, equipment), aunque los datos ya estan en el state del componente.

3. **Sin cache compartido**: `WorkoutTemplateManager` y `WorkoutTemplateSelector` ambos hacen fetch independiente al mismo endpoint. Si ambos estan en la misma pagina, se duplica la peticion.

4. **Re-fetch completo despues de cada operacion**: Despues de guardar o eliminar un template, se llama `fetchTemplates()` completo en vez de actualizar el state local.

5. **Posible problema de conexion a DB**: Verificar que el contenedor `dashboard-postgres` esta respondiendo correctamente y que no hay timeouts.

### Plan de accion

- [ ] Verificar logs del contenedor: `make logs` y `docker logs dashboard-postgres`
- [ ] Probar conexion directa a DB: `make db-shell` → `\dt` para listar tablas
- [ ] Agregar paginacion a las queries de templates
- [ ] Eliminar el double-fetch en los selectores
- [ ] Agregar manejo de errores mas robusto (try/catch con mensajes al usuario)
- [ ] Evaluar agregar `loading` states visibles mientras se cargan los templates

---

## Bug 2: Espacio negro al abrir teclado en movil

### Sintomas
- Al abrir el teclado en el celular para escribir, aparece un espacio/bloque negro
- El espacio negro tiene las mismas dimensiones que el teclado
- Permite desplazar hacia abajo mostrando ese espacio negro
- La interfaz queda descolocada

### Archivos a revisar

| Archivo | Linea | Problema |
|---------|-------|----------|
| `code/app/dashboard/layout.tsx` | L12 | `h-screen` usa `100vh` que NO se ajusta cuando el teclado abre |
| `code/app/layout.tsx` | — | No exporta `viewport` metadata, falta `interactive-widget` |
| `code/components/dashboard/DashboardShell.tsx` | L34 | `pb-20` es padding fijo que no responde al teclado |
| `code/components/dashboard/MobileBottomNav.tsx` | L16 | `fixed bottom-0` no se ajusta con el teclado |
| `code/app/globals.css` | L64-68 | `safe-area-bottom` solo maneja notch, no teclado |

### Causa raiz

En moviles, `100vh` incluye el area detras de la barra del navegador y NO se actualiza cuando el teclado aparece. Esto causa que:

1. El layout mantiene su altura completa mientras el viewport visible se reduce
2. `MobileBottomNav` (fixed bottom-0) queda "detras" del teclado
3. Se genera un espacio vacio (negro) entre el contenido visible y la posicion original del bottom nav

### Solucion propuesta

1. **Cambiar `h-screen` por `h-dvh`** en `dashboard/layout.tsx`
   - `dvh` = dynamic viewport height, se ajusta cuando el teclado abre/cierra

2. **Agregar viewport metadata** en `app/layout.tsx`:
   ```typescript
   export const viewport: Viewport = {
     interactiveWidget: 'resizes-content',
   }
   ```

3. **Ocultar `MobileBottomNav` cuando el teclado esta abierto**
   - Detectar con `visualViewport` API o con un listener de resize
   - Alternativamente, usar CSS `@media (hover: none)` combinado con focus-within

4. **Reemplazar `pb-20` fijo** por padding dinamico que responda al estado del teclado

### Plan de accion

- [ ] Verificar soporte de `dvh` en los navegadores objetivo
- [ ] Agregar `viewport` export en `app/layout.tsx`
- [ ] Cambiar `h-screen` → `h-dvh` en `dashboard/layout.tsx`
- [ ] Implementar deteccion de teclado para ocultar/ajustar `MobileBottomNav`
- [ ] Probar en dispositivos Android e iOS reales

---

## Verificaciones previas (hacer primero)

```bash
# 1. Estado de contenedores
make status

# 2. Logs de la base de datos
docker logs dashboard-postgres --tail 50

# 3. Logs de la app
make logs-app

# 4. Conexion a DB
make db-shell
# Dentro de psql:
\dt                          -- listar tablas
SELECT count(*) FROM "WorkoutTemplate";
SELECT count(*) FROM "MealTemplate";

# 5. Memoria del contenedor
docker stats dashboard-postgres --no-stream
```

---

**Prioridad sugerida:**
1. Primero resolver Bug 1 (templates) — afecta funcionalidad core
2. Despues Bug 2 (teclado movil) — afecta UX en movil
