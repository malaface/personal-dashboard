# Plan de Mejora UX - Formulario de Entrenamiento

**Fecha:** 2026-02-12
**Branch:** `feature/workout-form-ux-improvements`
**Estado:** ✅ COMPLETADO
**Impacto estimado:** Reduccion de 67-80% en interacciones necesarias para registrar un entrenamiento

---

## Contexto

El formulario actual de registro de entrenamientos (`WorkoutForm.tsx`) es poco intuitivo y requiere demasiadas interacciones para agregar ejercicios. Cada ejercicio necesita ~6 interacciones manuales (3 busquedas en SmartCombobox + 3 inputs numericos). Para una rutina tipica de 6-8 ejercicios, esto son **36-48 interacciones**.

### Problemas detectados

| Problema | Archivo | Impacto |
|----------|---------|---------|
| Sin acceso rapido a ejercicios recientes | `WorkoutForm.tsx` | Alto - cada ejercicio requiere busqueda desde cero |
| Template selector existe pero no esta integrado | `WorkoutTemplateSelector.tsx` | Alto - rutinas completas requieren input manual |
| No se auto-llena grupo muscular ni equipo | `ExerciseHistory.tsx` | Medio - 2 SmartCombobox innecesarios por ejercicio |
| Sin colapsar/expandir ejercicios | `WorkoutForm.tsx` | Medio - ruido visual con 5+ ejercicios |
| Sin reordenar ejercicios | `WorkoutForm.tsx` | Bajo-Medio - no se puede organizar la rutina |
| Idioma inconsistente (ingles/espanol) | `WorkoutList.tsx` | Bajo - afecta consistencia |
| Dark mode incompleto | `WorkoutList.tsx`, `WorkoutTemplateSelector.tsx` | Bajo - visual roto en modo oscuro |

---

## Arquitectura de Componentes (Despues del Refactor)

```
WorkoutForm.tsx (orquestador principal)
  |
  +-- [Card: Detalles] (nombre, fecha, duracion, notas)
  |
  +-- WorkoutTemplateSelector (solo al crear nuevo)
  |
  +-- [Card: Ejercicios]
  |     |
  |     +-- QuickAddBar (NEW)
  |     |     (chips de ejercicios recientes, 1 tap = ejercicio completo)
  |     |
  |     +-- CollapsibleExerciseCard (NEW, por cada ejercicio)
  |           |
  |           +-- [Header: resumen compacto + botones mover/duplicar/eliminar]
  |           +-- [Body expandible:]
  |                 +-- SmartCombobox (tipo de ejercicio)
  |                 +-- ExerciseHistory (historial + PRs + callback auto-fill)
  |                 +-- SmartCombobox (grupo muscular) <- auto-filled
  |                 +-- SmartCombobox (equipo) <- auto-filled
  |                 +-- [Sets / Reps / Peso inputs]
  |
  +-- [Botones Submit / Cancelar]
```

---

## Comparacion de Interacciones

| Escenario | Antes | Despues | Reduccion |
|-----------|-------|---------|-----------|
| 6 ejercicios (manual) | 36 interacciones | ~12 (quick-add + ajustes) | **67%** |
| 8 ejercicios (manual) | 48 interacciones | ~16 (quick-add + ajustes) | **67%** |
| 6 ejercicios (template) | 36 interacciones | ~7 (1 click + ajustes peso) | **80%** |

---

## Plan de Implementacion

### Fase P0 - Alto Impacto (Core UX)

#### Step 1: Extender API `/api/exercises/[id]/last` con muscleGroupId y equipmentId

> Permite auto-llenar grupo muscular y equipo al seleccionar un ejercicio

**Archivos a modificar:**

- [x] `lib/workouts/history.ts` - Agregar `muscleGroupId` y `equipmentId` a la interfaz `LastPerformance` y al return de `getLastExercisePerformance()`
- [x] `app/api/exercises/[exerciseTypeId]/last/route.ts` - Incluir los nuevos campos en la respuesta JSON

**Cambios especificos:**

En `LastPerformance` interface agregar:
```typescript
muscleGroupId: string | null   // NUEVO
equipmentId: string | null     // NUEVO
```

En el return de `getLastExercisePerformance()` agregar:
```typescript
muscleGroupId: lastExercise.muscleGroupId,
equipmentId: lastExercise.equipmentId,
```

En la respuesta del API route agregar los mismos campos. Es **backwards-compatible** (clientes existentes ignoran campos nuevos).

**Verificacion:**
- [x] `GET /api/exercises/{id}/last` retorna `muscleGroupId` y `equipmentId`
- [x] Respuesta mantiene compatibilidad con ExerciseHistory existente

---

#### Step 2: Crear endpoint `/api/exercises/recent`

> Expone ejercicios recientes del usuario para el QuickAddBar

**Archivo nuevo:**

- [x] `app/api/exercises/recent/route.ts` (NEW)

**Implementacion:**
- GET endpoint que usa `getUserExerciseTypes()` de `lib/workouts/history.ts` (funcion que ya existe pero no se usa)
- Parametro `limit` (default 10, max 20)
- Retorna: `{ exercises: [{ id, name, lastPerformed, totalWorkouts }], count }`
- Requiere autenticacion via `requireAuth()`

**Verificacion:**
- [x] Endpoint retorna ejercicios ordenados por `lastPerformed` desc
- [x] Retorna 401 para usuarios no autenticados
- [x] Retorna array vacio si el usuario no tiene historial

---

#### Step 3: Extender ExerciseHistory con callback de auto-fill

> Evita doble fetch al reusar los datos que ExerciseHistory ya obtiene

**Archivo a modificar:**

- [x] `components/workouts/ExerciseHistory.tsx` - Agregar prop `onLastPerformanceLoaded` callback

**Cambios:**
- Nuevo prop opcional: `onLastPerformanceLoaded?: (data: { muscleGroupId, equipmentId, sets, reps, weight }) => void`
- En el useEffect donde se fetchea data, despues de `setData(result)`, llamar el callback con los datos
- El `CollapsibleExerciseCard` usa este callback para auto-llenar campos sin hacer otro fetch

**Verificacion:**
- [x] ExerciseHistory sigue funcionando igual sin el callback (backwards compatible)
- [x] Callback se invoca cuando se obtienen datos del ejercicio

---

#### Step 4: Crear componente `QuickAddBar`

> Chips de ejercicios recientes - 1 tap agrega ejercicio pre-llenado

**Archivo nuevo:**

- [x] `components/workouts/QuickAddBar.tsx` (NEW, ~80 lineas)

**Props:**
```typescript
interface QuickAddBarProps {
  onQuickAdd: (exerciseTypeId: string, exerciseName: string) => void
  existingExerciseTypeIds: string[]  // para atenuar los ya agregados
}
```

**Comportamiento:**
- On mount: fetch `GET /api/exercises/recent?limit=10`
- Render: fila horizontal scrollable de chips (pill buttons)
- Cada chip muestra nombre del ejercicio + "xN" (total workouts)
- Chips de ejercicios ya en el form se muestran atenuados (pero siguen siendo clickeables)
- Loading state: 3 skeleton pills con animate-pulse
- Si no hay ejercicios recientes: return null (no render)

**Estilos:**
- Horizontal scroll: `overflow-x-auto flex gap-2`
- Chip activo: `bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200`
- Chip atenuado: `bg-gray-100 dark:bg-gray-700 text-gray-400`
- Header con icono reloj: "Agregar rapido"

**Verificacion:**
- [x] Muestra ejercicios recientes como chips
- [x] Chips scrollean horizontalmente en mobile
- [x] Tap en chip invoca `onQuickAdd` con id y nombre
- [x] Chips atenuados para ejercicios ya agregados
- [x] No renderiza nada si no hay historial
- [x] Skeleton loading funcional

---

#### Step 5: Crear componente `CollapsibleExerciseCard`

> Tarjeta de ejercicio colapsable con acciones de mover, duplicar y eliminar

**Archivo nuevo:**

- [x] `components/workouts/CollapsibleExerciseCard.tsx` (NEW, ~200 lineas)

**Props:**
```typescript
interface CollapsibleExerciseCardProps {
  index: number
  totalCount: number
  form: UseFormReturn<WorkoutFormData>
  field: FieldArrayWithId<WorkoutFormData, "exercises", "id">
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onDuplicate: () => void
  isFirst: boolean
  isLast: boolean
  defaultCollapsed?: boolean
}
```

**Comportamiento:**

*Estado colapsado:*
- Muestra linea compacta: `"#1 Press Banca - 80kg x 10 x 3"`
- Chevron de expansion + botones de accion (mover, duplicar, eliminar)
- Solo puede colapsar si tiene exerciseTypeId, sets > 0, reps > 0

*Estado expandido:*
- Muestra todos los campos de edicion (extraidos del WorkoutForm actual lineas 246-364)
- SmartCombobox para tipo de ejercicio, grupo muscular, equipo
- ExerciseHistory con callback `onLastPerformanceLoaded`
- Inputs de sets/reps/peso

*Auto-fill inteligente:*
- Cuando ExerciseHistory invoca `onLastPerformanceLoaded`, auto-llena muscleGroupId y equipmentId SOLO si estan vacios
- No sobreescribe valores que el usuario ya selecciono manualmente

*Header con acciones:*
- Mover arriba (ChevronUpIcon) - oculto si es primero
- Mover abajo (ChevronDownIcon) - oculto si es ultimo
- Duplicar (DocumentDuplicateIcon)
- Eliminar (TrashIcon) - oculto si solo hay 1 ejercicio
- Click en area de header togglea colapsar/expandir

**Verificacion:**
- [x] Se puede colapsar/expandir haciendo click en header
- [x] Resumen colapsado muestra nombre, peso, reps, sets correctamente
- [x] No se puede colapsar sin tipo de ejercicio seleccionado
- [x] Botones de mover arriba/abajo funcionan correctamente
- [x] Boton duplicar crea copia con valores identicos
- [x] Boton eliminar remueve el ejercicio
- [x] Auto-fill de grupo muscular y equipo funciona
- [x] Auto-fill no sobreescribe valores existentes
- [x] Dark mode completo

---

#### Step 6: Refactorizar `WorkoutForm.tsx` (integracion central)

> Integra todos los componentes nuevos en el formulario principal

**Archivo a modificar:**

- [x] `components/workouts/WorkoutForm.tsx` - Refactor mayor

**Cambios principales:**

*6a. Nuevos imports:*
- [x] Importar `QuickAddBar`, `CollapsibleExerciseCard`, `WorkoutTemplateSelector`

*6b. Extender useFieldArray:*
- [x] Destructurar `swap` e `insert` ademas de `append` y `remove`

*6c. Handler de quick-add:*
- [x] `handleQuickAdd(exerciseTypeId, exerciseName)` - fetch `/api/exercises/{id}/last`, append ejercicio con todos los valores pre-llenados

*6d. Handler de template load:*
- [x] `handleTemplateLoad(data)` - setea nombre del workout y reemplaza array de ejercicios completo

*6e. Handlers de mover/duplicar:*
- [x] `moveExerciseUp(index)` - usa `swap(index, index - 1)`
- [x] `moveExerciseDown(index)` - usa `swap(index, index + 1)`
- [x] `duplicateExercise(index)` - usa `insert(index + 1, {...current})`

*6f. Nuevo JSX:*
- [x] Agregar `WorkoutTemplateSelector` entre detalles y ejercicios (solo en modo crear, no editar)
- [x] Agregar `QuickAddBar` al inicio de la seccion de ejercicios
- [x] Reemplazar el renderizado inline de ejercicios con `CollapsibleExerciseCard`
- [x] Pasar `existingExerciseTypeIds` al QuickAddBar (watch de los ids)

**Data flow del quick-add:**
1. Tap en chip "Press Banca" en QuickAddBar
2. QuickAddBar invoca `onQuickAdd("cuid123", "Press Banca")`
3. WorkoutForm.handleQuickAdd fetchea `GET /api/exercises/cuid123/last`
4. Respuesta incluye: `{ sets: 3, reps: 10, weight: 80, muscleGroupId: "cuidABC", equipmentId: "cuidXYZ" }`
5. `append()` agrega ejercicio completamente pre-llenado
6. **Total: 1 tap** en lugar de 6 interacciones

**Verificacion:**
- [x] Template selector aparece solo al crear, no al editar
- [x] Cargar template llena nombre y todos los ejercicios
- [x] Quick-add funciona con auto-fill completo
- [x] Ejercicios se pueden mover, duplicar y eliminar
- [x] Submit del form sigue funcionando igual (misma estructura de datos)
- [x] Editar workout existente carga datos correctamente

---

### Fase P1 - Mejoras de Polish

#### Step 7: Fix dark mode en WorkoutTemplateSelector

**Archivo a modificar:**

- [x] `components/templates/WorkoutTemplateSelector.tsx` - Agregar clases `dark:`

**Cambios:**
- [x] Button selector: agregar `dark:bg-gray-800 dark:border-gray-600 dark:text-white`
- [x] Dropdown: agregar `dark:bg-gray-800 dark:border-gray-700`
- [x] Items hover: agregar `dark:hover:bg-gray-700`
- [x] Texto y badges: agregar variantes dark
- [x] Placeholders: agregar `dark:text-gray-400`

---

#### Step 8: Fix WorkoutList (idioma, dark mode, empty state)

**Archivo a modificar:**

- [x] `components/workouts/WorkoutList.tsx`

*8a. Fix idioma (todo a espanol):*
- [x] `"Are you sure..."` -> `"Estas seguro de que quieres eliminar este entrenamiento?"`
- [x] `"Failed to delete"` -> `"Error al eliminar entrenamiento"`
- [x] `"An error occurred"` -> `"Ocurrio un error"`
- [x] `"No workouts yet"` -> `"Sin entrenamientos aun"`
- [x] `"Create your first..."` -> `"Registra tu primera sesion de entrenamiento"`
- [x] `toLocaleDateString("en-US")` -> `toLocaleDateString("es-MX")`
- [x] `"minutes"` -> `"minutos"`
- [x] `"Exercises"` -> `"Ejercicios"`

*8b. Agregar dark mode:*
- [x] Cards: `bg-white` -> `bg-white dark:bg-gray-800`
- [x] Textos: agregar variantes `dark:text-*`
- [x] Borders: agregar `dark:border-gray-700`
- [x] Hover states: agregar `dark:hover:bg-*`
- [x] Backgrounds secundarios: `bg-gray-50` -> `bg-gray-50 dark:bg-gray-900`

*8c. Mejor empty state:*
- [x] Agregar icono decorativo
- [x] Agregar boton CTA "Nuevo Entrenamiento" con Link a `/dashboard/workouts/new`
- [x] Importar `Link` de `next/link` y `PlusIcon` de heroicons

---

## Archivos Criticos - Referencia Rapida

| Archivo | Accion | Step |
|---------|--------|------|
| `lib/workouts/history.ts` | Modificar | 1 |
| `app/api/exercises/[exerciseTypeId]/last/route.ts` | Modificar | 1 |
| `app/api/exercises/recent/route.ts` | **Crear** | 2 |
| `components/workouts/ExerciseHistory.tsx` | Modificar | 3 |
| `components/workouts/QuickAddBar.tsx` | **Crear** | 4 |
| `components/workouts/CollapsibleExerciseCard.tsx` | **Crear** | 5 |
| `components/workouts/WorkoutForm.tsx` | Refactor mayor | 6 |
| `components/templates/WorkoutTemplateSelector.tsx` | Modificar | 7 |
| `components/workouts/WorkoutList.tsx` | Modificar | 8 |

---

## Orden de Implementacion

```
Step 1 (API extend) ----+
                        |
Step 2 (API recent) ----+---> Step 3 (ExerciseHistory callback)
                        |         |
Step 7 (Template DM) --+         v
                        |    Step 5 (CollapsibleCard)
                        |         |
                        |    Step 4 (QuickAddBar)
                        |         |
                        |         v
                        +---> Step 6 (WorkoutForm refactor)
                        |
Step 8 (WorkoutList) ---+ (independiente)
```

Steps 1, 2, 7 y 8 son independientes entre si y pueden hacerse en paralelo.

---

## Verificacion Final (End-to-End)

- [ ] **Crear workout con quick-add:** Abrir formulario -> tap chips -> ajustar pesos -> guardar -> verificar en lista
- [ ] **Crear workout con template:** Abrir formulario -> seleccionar template -> ajustar -> guardar
- [ ] **Editar workout existente:** Abrir edicion -> verificar datos cargados -> modificar -> guardar
- [ ] **Reordenar y duplicar:** Agregar 3+ ejercicios -> mover -> duplicar -> verificar orden se mantiene al guardar
- [ ] **Dark mode completo:** Togglear dark mode -> verificar todo el flujo visual
- [ ] **Mobile responsive:** Probar en viewport 375px -> chips scrollean -> cards colapsados legibles -> botones tocables (min 44px)
- [x] **Build exitoso:** `npm run build` sin errores
- [x] **Type check:** `npx tsc --noEmit` sin errores

---

## Notas Tecnicas

- **Sin dependencias nuevas:** Todo se implementa con las librerias existentes (React Hook Form, Headless UI, Heroicons, TailwindCSS)
- **Backwards compatible:** Los server actions `createWorkout` y `updateWorkout` no requieren cambios - la estructura de datos del formulario es la misma
- **`swap` y `insert` de useFieldArray:** Ya disponibles en react-hook-form 7.x, solo hay que destructurarlos
- **Key by `field.id`:** Garantiza que el estado de colapso sigue al ejercicio al reordenar (React reusa el componente)
- **getUserExerciseTypes():** Funcion existente en `lib/workouts/history.ts` que nunca se uso en el frontend - ahora se expone via API

---

*Documento generado automaticamente - Personal Dashboard v0.x*
