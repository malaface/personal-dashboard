# Guía de Migración Completa a shadcn/ui

**Proyecto:** Personal Dashboard
**Inicio:** 2026-02-18
**Estado:** En progreso

> **Cómo usar esta guía:** Cambia `[ ]` por `[x]` al completar cada paso.
> Los pasos dentro de cada fase son independientes — puedes hacerlos en cualquier orden dentro de la fase.

---

## Estado Actual

| Componente | Estado |
|------------|--------|
| `Button` | ✅ instalado |
| `Input` | ✅ instalado |
| `Label` | ✅ instalado |
| `Select` | ✅ instalado |
| `Dialog` | ✅ instalado |
| `Card` | ✅ instalado |
| `Badge` | ✅ instalado |
| `Tabs` | ✅ instalado |
| `Sheet` | ✅ instalado |
| `Textarea` | ❌ no instalado |
| `Checkbox` | ❌ no instalado |
| `Accordion` | ❌ no instalado |
| `AddCredentialModal` | ✅ migrado |
| `MobileDrawer` | ✅ migrado |
| `PasswordInput` | ✅ migrado |
| `@headlessui/react` | ✅ sin imports (pendiente uninstall) |

---

## FASE 1 — Limpieza rápida
> Prerequisito: Ninguno. Hacer primero.

- [ ] **1.1 Desinstalar @headlessui/react**
  No quedan imports en el codebase. Ejecutar:
  ```bash
  cd /home/badfaceserverlap/personal-dashboard/code
  npm uninstall @headlessui/react
  npm run build   # verificar que no rompe nada
  ```

- [ ] **1.2 Instalar componentes shadcn faltantes**
  Ejecutar desde `code/`:
  ```bash
  npx shadcn@latest add textarea checkbox accordion
  ```
  Esto crea:
  - `components/ui/textarea.tsx`
  - `components/ui/checkbox.tsx`
  - `components/ui/accordion.tsx`

---

## FASE 2 — Módulo Auth
> Archivos: `components/auth/`

- [ ] **2.1 `LoginForm.tsx`**
  Reemplazar:
  - 2 `<input>` nativos → `<Input>` shadcn
  - Botón submit → `<Button>` shadcn
  - `<label>` → `<Label>` shadcn

- [ ] **2.2 `RegisterForm.tsx`**
  Reemplazar:
  - 4 `<input>` nativos → `<Input>` shadcn
  - Botones → `<Button>` shadcn
  - `<label>` → `<Label>` shadcn

  Verificar build después de esta fase:
  ```bash
  npx tsc --noEmit
  ```

---

## FASE 3 — Módulo Settings
> Archivos: `components/settings/`

- [ ] **3.1 `ProfileForm.tsx`**
  Reemplazar:
  - 8 `<input>`/`<textarea>` nativos → `<Input>`/`<Textarea>` shadcn
  - Botón submit → `<Button>` shadcn
  - `<label>` → `<Label>` shadcn

- [ ] **3.2 `CategoryManager.tsx`**
  Reemplazar:
  - 5+ `<input>`/`<select>`/`<textarea>` → shadcn equivalentes
  - `<select>` → `<Select>` shadcn (Radix)
  - Botones → `<Button>` shadcn

- [ ] **3.3 `BackupManager.tsx`**
  Reemplazar:
  - 1 `<input>` (file input — puede quedarse nativo si es `type="file"`) → verificar si aplica
  - Botones de acción → `<Button>` shadcn

---

## FASE 4 — Módulo Workouts
> Archivos: `components/workouts/`
> Este módulo es el más complejo.

- [ ] **4.1 `WorkoutForm.tsx`**
  Reemplazar:
  - 3 `<input>`/`<textarea>`/`<select>` nativos → shadcn
  - Botones del form → `<Button>` shadcn
  - Secciones card manual → `<Card>` shadcn

- [ ] **4.2 `CollapsibleExerciseCard.tsx`**
  Es el componente más denso (10+ inputs):
  - Todos los `<input>` de series/reps/peso → `<Input>` shadcn
  - 2 `<select>` (tipo ejercicio) → `<Select>` shadcn
  - Botones de acción (añadir serie, eliminar) → `<Button>` shadcn

- [ ] **4.3 `WorkoutModeTabs.tsx`**
  Actualmente usa botones manuales como tabs:
  - Reemplazar implementación manual → `<Tabs>` shadcn (ya instalado)

- [ ] **4.4 Formularios cardio**
  Tres archivos con estructura similar:
  - [ ] `cardio/RunningForm.tsx` — inputs de distancia/tiempo → `<Input>` shadcn
  - [ ] `cardio/CyclingForm.tsx` — inputs de distancia/tiempo → `<Input>` shadcn
  - [ ] `cardio/SwimmingForm.tsx` — inputs de distancia/tiempo → `<Input>` shadcn

- [ ] **4.5 `progress/ProgressFilters.tsx`**
  - `<input>`/`<select>` de filtros → shadcn

---

## FASE 5 — Módulo Nutrition
> Archivos: `components/nutrition/`

- [ ] **5.1 `MealForm.tsx`**
  Reemplazar:
  - 3 `<input>`/`<select>` nativos → shadcn
  - `<select>` de tipo de comida → `<Select>` shadcn
  - Botones → `<Button>` shadcn
  - Secciones card → `<Card>` shadcn

- [ ] **5.2 `CollapsibleFoodCard.tsx`**
  - 7 `<input>` de nutrientes → `<Input>` shadcn
  - 1 `<select>` → `<Select>` shadcn
  - Botones de acción → `<Button>` shadcn

- [ ] **5.3 `progress/NutritionFilters.tsx`**
  - 3 `<input>`/`<select>` → shadcn

---

## FASE 6 — Módulo Finance
> Archivos: `components/finance/`

- [ ] **6.1 `TransactionForm.tsx`**
  - 4 `<input>`/`<select>` nativos → shadcn
  - `<select>` de moneda/categoría → `<Select>` shadcn
  - 6 botones → `<Button>` shadcn

- [ ] **6.2 `BudgetForm.tsx`**
  - 2 `<input>` → `<Input>` shadcn
  - Botones → `<Button>` shadcn

- [ ] **6.3 `InvestmentForm.tsx`**
  - 4 `<input>` → `<Input>` shadcn
  - Botones → `<Button>` shadcn

- [ ] **6.4 `cards/CreditCardForm.tsx`**
  - Inputs nativos → shadcn

- [ ] **6.5 `accounts/FinancialAccountForm.tsx`**
  - Inputs nativos → shadcn

- [ ] **6.6 `progress/FinanceFilters.tsx`**
  - 2 `<input>`/`<select>` → shadcn

---

## FASE 7 — Módulo Family
> Archivos: `components/family/`

- [ ] **7.1 `FamilyMemberForm.tsx`**
  - 6 `<input>`/`<textarea>` → shadcn
  - Botones → `<Button>` shadcn

- [ ] **7.2 `EventForm.tsx`**
  - 5 `<input>`/`<select>`/`<textarea>` nativos → shadcn
  - `<select>` de recurrencia → `<Select>` shadcn
  - Botones → `<Button>` shadcn

- [ ] **7.3 `EventList.tsx`**
  - 1 `<input>` de búsqueda → `<Input>` shadcn

---

## FASE 8 — Módulo Catalog
> Archivos: `components/catalog/`

- [ ] **8.1 `SmartCombobox.tsx`**
  - `<input>` de búsqueda → `<Input>` shadcn
  - Botones → `<Button>` shadcn

- [ ] **8.2 `CategorySelector.tsx`**
  - Inputs nativos → shadcn

- [ ] **8.3 `ComboboxCreateDialog.tsx`**
  - Inputs del form → `<Input>` shadcn
  - Botones → `<Button>` shadcn

---

## FASE 9 — Módulo Templates
> Archivos: `components/templates/`

- [ ] **9.1 `MealTemplateManager.tsx`**
  - Inputs/botones nativos → shadcn

- [ ] **9.2 `WorkoutTemplateManager.tsx`**
  - Inputs/botones nativos → shadcn

---

## FASE 10 — Cards en páginas dashboard
> Reemplazar `div` con clases manuales de card por `<Card>` shadcn

- [ ] **10.1 Identificar páginas con más card divs**
  Buscar el patrón:
  ```bash
  grep -rl "bg-white dark:bg-gray-800 rounded" app/dashboard/
  ```
  Listar y priorizar.

- [ ] **10.2 Migrar cards en páginas de alto impacto visual**
  Candidatos: `dashboard/page.tsx`, páginas de listado de módulos.

---

## FASE 11 — Collapsibles → shadcn Accordion (opcional)
> `CollapsibleExerciseCard` y `CollapsibleFoodCard` usan estado + CSS grid custom.
> Esta fase es opcional — la implementación actual funciona bien.

- [ ] **11.1 Evaluar si vale migrar a `<Accordion>` shadcn**
  Considerar que el diseño actual tiene lógica de reordenamiento/eliminación integrada.
  Si se decide migrar:
  - `CollapsibleExerciseCard.tsx` → usar `AccordionItem` + mantener lógica de negocio
  - `CollapsibleFoodCard.tsx` → igual

---

## Verificación Final

Al completar todas las fases:

- [ ] `npm run build` sin errores
- [ ] `npx tsc --noEmit` sin errores
- [ ] Probar en mobile (drawer, modals, formularios)
- [ ] Verificar dark mode en todos los componentes migrados
- [ ] Confirmar que `@headlessui/react` ya no está en `node_modules`

---

## Resumen de comandos útiles

```bash
# Desde code/
cd /home/badfaceserverlap/personal-dashboard/code

# Instalar componente shadcn nuevo
npx shadcn@latest add <nombre>

# Verificar TypeScript
npx tsc --noEmit

# Build completo
npm run build

# Ver qué archivos aún tienen inputs nativos
grep -rl "<input\|<select\|<textarea" components/ --include="*.tsx" | grep -v "components/ui/"
```

---

**Última actualización:** 2026-02-18
**Fases completadas:** 0 / 11
**Componentes migrados:** 3 / ~35
