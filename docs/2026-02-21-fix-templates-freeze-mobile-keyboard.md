# Fix: Templates se congelan + Espacio negro teclado movil

**Fecha:** 2026-02-21
**Estado:** Resuelto
**Branch:** fix/templates-freeze-mobile-keyboard

---

## Bug 1: Templates se congelan y producen error al cargar

### Causa raiz

1. **Sin paginacion:** `getWorkoutTemplates()` y `getMealTemplates()` traian TODOS los registros sin limite (`take`), causando queries pesadas a medida que crecen los datos.
2. **Double-fetch redundante:** Los selectores (`WorkoutTemplateSelector`, `MealTemplateSelector`) ya tenian todos los datos del template en memoria al hacer el fetch inicial, pero al seleccionar uno, hacian un segundo `GET /[id]/load` que re-ejecutaba la query completa con todos los `include`.
3. **Re-fetch completo despues de cada operacion:** Despues de guardar o eliminar un template, se llamaba `fetchTemplates()` completo en vez de actualizar el state local.

### Solucion aplicada

#### 1. Paginacion en queries (`take: 50` por defecto)
- **`code/lib/templates/workout-queries.ts`** — `getWorkoutTemplates()` ahora acepta `take` y `skip`, retorna `{ templates, total }`.
- **`code/lib/templates/meal-queries.ts`** — `getMealTemplates()` igual.
- **`code/app/api/templates/workouts/route.ts`** — Parsea `take`/`skip` de query params, cap en 100.
- **`code/app/api/templates/meals/route.ts`** — Igual.

#### 2. Eliminacion del double-fetch en selectores
- **`code/components/templates/WorkoutTemplateSelector.tsx`** — `handleSelect()` ahora transforma los datos del template en memoria directamente, sin llamar a `/load`.
- **`code/components/templates/MealTemplateSelector.tsx`** — Igual.

#### 3. Actualizacion local del state (evita re-fetch)
- **`code/components/templates/WorkoutTemplateManager.tsx`** — Despues de save, actualiza el array local. Despues de delete, filtra el array local. Loading state inicial en `true`.
- **`code/components/templates/MealTemplateManager.tsx`** — Igual.

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `code/lib/templates/workout-queries.ts` | Paginacion (take/skip), retorna { templates, total } |
| `code/lib/templates/meal-queries.ts` | Paginacion (take/skip), retorna { templates, total } |
| `code/app/api/templates/workouts/route.ts` | Parsea take/skip, pasa a query |
| `code/app/api/templates/meals/route.ts` | Parsea take/skip, pasa a query |
| `code/components/templates/WorkoutTemplateSelector.tsx` | Elimina double-fetch, usa datos locales |
| `code/components/templates/MealTemplateSelector.tsx` | Elimina double-fetch, usa datos locales |
| `code/components/templates/WorkoutTemplateManager.tsx` | State update local post-save/delete |
| `code/components/templates/MealTemplateManager.tsx` | State update local post-save/delete |
| `code/components/workouts/WorkoutForm.tsx` | Fix infinite loop en handleTemplateLoad |

#### 4. Fix loop infinito en WorkoutForm.handleTemplateLoad (causa raiz principal)
- **`code/components/workouts/WorkoutForm.tsx`** — El `handleTemplateLoad` usaba `while (fields.length > 0) { remove(0) }` que es un **loop infinito** porque `fields.length` no se actualiza sincronamente en react-hook-form. Luego usaba `append()` individual por cada ejercicio, causando N re-renders. Reemplazado por `replace()` que hace todo en una sola operacion atomica.

---

## Bug 2: Espacio negro al abrir teclado en movil

### Causa raiz

En moviles, `100vh` (`h-screen`) incluye el area detras de la barra del navegador y NO se actualiza cuando el teclado aparece. Esto causa:

1. El layout mantiene su altura completa mientras el viewport visible se reduce
2. `MobileBottomNav` (fixed bottom-0) queda "detras" del teclado
3. Se genera un espacio vacio (negro) entre el contenido y el bottom nav

### Solucion aplicada

#### 1. `h-screen` → `h-dvh`
- **`code/app/dashboard/layout.tsx`** — `h-dvh` (dynamic viewport height) se ajusta automaticamente cuando el teclado abre/cierra.

#### 2. Viewport metadata con `interactiveWidget`
- **`code/app/layout.tsx`** — Agregado `export const viewport: Viewport = { interactiveWidget: 'resizes-content' }`. Esto indica al navegador que redimensione el contenido cuando el teclado aparece.

#### 3. Ocultar MobileBottomNav con teclado abierto
- **`code/components/dashboard/MobileBottomNav.tsx`** — Hook `useKeyboardVisible()` detecta el teclado usando `window.visualViewport`. Si viewport height < 75% de innerHeight, el nav se oculta completamente.

#### 4. Padding bottom dinamico
- **`code/components/dashboard/DashboardShell.tsx`** — Mismo hook `useKeyboardVisible()`. Cuando teclado abierto: `pb-2`, cerrado: `pb-20`.

### Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `code/app/dashboard/layout.tsx` | `h-screen` → `h-dvh` |
| `code/app/layout.tsx` | `viewport` export con `interactiveWidget: 'resizes-content'` |
| `code/components/dashboard/MobileBottomNav.tsx` | Hook deteccion teclado, oculta nav |
| `code/components/dashboard/DashboardShell.tsx` | Hook deteccion teclado, padding dinamico |

---

## Verificacion

- `npx tsc --noEmit` — Sin errores
- `npm run lint` — Sin errores nuevos
- `npm run build` — Build exitoso
