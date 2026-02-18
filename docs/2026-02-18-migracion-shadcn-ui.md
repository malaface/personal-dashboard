# Migración completa a shadcn/ui (Radix UI)

**Fecha:** 2026-02-18
**Estado:** Completado
**Build:** ✅ Exitoso | **TypeScript:** ✅ Sin errores

---

## Resumen

Migración completa de todos los componentes de formulario del proyecto desde HTML nativo (`<input>`, `<label>`, `<textarea>`, `<select>`, `<button>`) a componentes de shadcn/ui (`Input`, `Label`, `Textarea`, `Select`, `Button`).

---

## Cambios realizados

### FASE 1: Limpieza y nuevos componentes
- **Desinstalado:** `@headlessui/react` (sin usos restantes)
- **Instalados:** `textarea`, `checkbox`, `accordion` via `npx shadcn@latest add`
- **Corregido:** Duplicados en `tailwind.config.ts` (accordion keyframes duplicados por el CLI)

### FASE 2: Auth
- `components/auth/LoginForm.tsx` — Label, Input, Button
- `components/auth/RegisterForm.tsx` — Label, Input, Button

### FASE 3: Settings
- `components/settings/ProfileForm.tsx` — Label, Input, Textarea, Button
- `components/settings/CategoryManager.tsx` — Label, Input, Textarea, Button, Select (sentinel `_root_`)
- `components/settings/BackupManager.tsx` — Button (ghost/destructive/outline)

### FASE 4: Workouts
- `components/workouts/WorkoutForm.tsx` — Label, Input, Textarea, Button
- `components/workouts/CollapsibleExerciseCard.tsx` — Label, Input, Button (ghost size-icon)
- `components/workouts/cardio/RunningForm.tsx` — Label, Input, Textarea, Button
- `components/workouts/cardio/CyclingForm.tsx` — Label, Input, Textarea, Button
- `components/workouts/cardio/SwimmingForm.tsx` — Label, Input, Textarea, Button (native selects para poolSize/strokeType con form.register)
- `components/workouts/progress/ProgressFilters.tsx` — Label, Input, Button (size-sm), Select (sentinel `_all_`)

### FASE 5: Nutrition
- `components/nutrition/MealForm.tsx` — Label, Input, Textarea, Button, Select (watch+setValue)
- `components/nutrition/CollapsibleFoodCard.tsx` — Label, Input, Button (ghost size-icon)
- `components/nutrition/progress/NutritionFilters.tsx` — Label, Input, Button (size-sm), Select (sentinel `_all_`)

### FASE 6: Finance
- `components/finance/TransactionForm.tsx` — Label, Input, Textarea, Button, Select (currency, funding toggle buttons)
- `components/finance/BudgetForm.tsx` — Label, Input, Button
- `components/finance/InvestmentForm.tsx` — Label, Input, Textarea, Button
- `components/finance/cards/CreditCardForm.tsx` — Label, Input, Button (color swatch buttons mantenidos nativos)
- `components/finance/accounts/FinancialAccountForm.tsx` — Label, Input, Button, Select (currency); account type card buttons mantenidos nativos
- `components/finance/progress/FinanceFilters.tsx` — Label, Input, Button (size-sm), Select (sentinel `_all_`)

### FASE 7+8+9: Family, Catalog, Templates
- `components/family/FamilyMemberForm.tsx` — Label, Input, Textarea, Button
- `components/family/EventForm.tsx` — Label, Input, Textarea, Button, Select (familyMemberId, recurrenceType con sentinels `_none_`)
- `components/catalog/ComboboxCreateDialog.tsx` — Label, Input, Textarea, Button (ghost size-icon para X)
- `components/templates/MealTemplateManager.tsx` — Label, Input, Textarea, Button (native select mantenido para mealType con form.register)
- `components/templates/WorkoutTemplateManager.tsx` — Label, Input, Textarea, Button (native select mantenido para difficulty con form.register)

---

## Patrones técnicos utilizados

### 1. Migración básica
```tsx
// Antes
<label className="block text-sm font-medium text-gray-700 ...">Nombre *</label>
<input className="w-full px-3 py-2 border border-gray-300 ..." />

// Después
<Label>Nombre *</Label>
<Input className="mt-1" />
```

### 2. react-hook-form + shadcn Select
shadcn Select no es compatible con `form.register` directamente. Patrón utilizado:
```tsx
<Select
  value={form.watch("mealType")}
  onValueChange={(v) => form.setValue("mealType", v as MealFormData["mealType"])}
>
```

### 3. Sentinel values para Select vacío
shadcn `SelectItem` no acepta `value=""`. Solución:
```tsx
<Select
  value={filters.categoryId || "_all_"}
  onValueChange={(v) => updateFilter("categoryId", v === "_all_" ? "" : v)}
>
  <SelectItem value="_all_">Todas las categorias</SelectItem>
```

### 4. Button variants
| Uso | Variant |
|-----|---------|
| Acción principal | `default` |
| Cancelar / Secundario | `outline` |
| Icono de acción (edit/delete/close) | `ghost size="icon"` |
| Acción peligrosa | `destructive` |
| Toggle activo/inactivo | `default` / `outline` |

### 5. Elementos mantenidos nativos
- FAB (Floating Action Button): posicionamiento fixed + custom CSS
- Color swatch buttons en CreditCardForm: `style={{ backgroundColor }}` circular
- Account type card buttons: bordes y layout de selección custom
- native `<select>` con `form.register`: en componentes template donde shadcn Select requeriría refactor de RHF
- `<input type="color">`: sin equivalente shadcn
- `<input type="file">`: elemento oculto activado programáticamente
- `<input type="checkbox">`: mantenido nativo (integración directa con form.register)

---

## Archivos no modificados (justificación)
- `components/workouts/WorkoutModeTabs.tsx` — Navegación URL-driven con tab styling custom
- `components/catalog/SmartCombobox.tsx` — Implementación custom de combobox (trigger, dropdown, items con layout específico)
- `components/catalog/CategorySelector.tsx` — Wrapper de SmartCombobox sin elementos nativos propios

---

## Verificación final
```
✅ npm run build — exitoso (0 errores)
✅ npx tsc --noEmit — sin errores de tipos
```
