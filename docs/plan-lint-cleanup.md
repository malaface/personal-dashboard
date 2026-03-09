# Plan: Limpieza de 77 Errores + 19 Warnings de Lint

**Fecha:** 2026-03-09
**Branch sugerido:** `fix/lint-cleanup`
**Impacto:** 0 cambios funcionales — solo tipado y limpieza

---

## Resumen de Errores

| Regla | Tipo | Cantidad | Fix |
| ----- | ---- | -------- | --- |
| `@typescript-eslint/no-explicit-any` | error | 73 | Reemplazar `catch (error: any)` → `catch (error: unknown)` + tipar correctamente |
| `@typescript-eslint/no-unused-vars` | warning | 12 | Eliminar o prefijar con `_` |
| `@typescript-eslint/no-require-imports` | error | 1 | Cambiar `require()` → `import()` |
| `react-hooks/exhaustive-deps` | warning | 4 | Agregar dependencias faltantes o `useCallback` |
| unused eslint-disable directive | warning | 1 | Eliminar directiva innecesaria |

**Total: 77 errores + 19 warnings = 96 issues en 48 archivos**

---

## Fase 1: `catch (error: any)` — 39 archivos, ~55 errores

El patrón más repetido. Todos los `catch (error: any)` deben cambiar a `catch (error: unknown)` con `error instanceof Error` para acceder a `.message`.

### Batch 1A: Server Actions (4 archivos, ~12 errores)

- [ ] `app/dashboard/finance/accounts/actions.ts` — 3 catch blocks
- [ ] `app/dashboard/finance/cards/actions.ts` — 3 catch blocks
- [ ] `app/dashboard/family/actions.ts` — 3 catch blocks
- [ ] `app/dashboard/workouts/actions.ts` — 3 catch blocks

**Patrón a aplicar:**

```typescript
// ANTES
} catch (error: any) {
  return { success: false, error: error.message || "Error" }
}

// DESPUÉS
} catch (error: unknown) {
  return { success: false, error: error instanceof Error ? error.message : "Error" }
}
```

### Batch 1B: API Routes (11 archivos, ~22 errores)

- [ ] `app/api/ai/chat/route.ts` — 8 errors (varios any en params y catch)
- [ ] `app/api/ai/credentials/route.ts` — 3 errors
- [ ] `app/api/ai/credentials/[id]/route.ts` — 4 errors
- [ ] `app/api/auth/forgot-password/route.ts` — 2 errors
- [ ] `app/api/auth/resend-verification/route.ts` — 2 errors
- [ ] `app/api/auth/reset-password/route.ts` — 2 errors
- [ ] `app/api/backup/export/route.ts` — 1 error
- [ ] `app/api/backup/import/route.ts` — 1 error
- [ ] `app/api/backup/preview/route.ts` — 1 error
- [ ] `app/api/exercises/[exerciseTypeId]/last/route.ts` — 1 error
- [ ] `app/api/exercises/history/route.ts` — 1 error

### Batch 1C: Client Components con catch (8 archivos, ~8 errores)

- [ ] `app/forgot-password/ForgotPasswordForm.tsx` — 1 error
- [ ] `app/reset-password/ResetPasswordForm.tsx` — 1 error
- [ ] `components/settings/AddCredentialModal.tsx` — 1 error
- [ ] `components/settings/BackupManager.tsx` — 3 errors
- [ ] `components/templates/MealTemplateManager.tsx` — 1 error
- [ ] `components/templates/WorkoutTemplateManager.tsx` — 1 error
- [ ] `components/family/EventForm.tsx` — 1 error
- [ ] `components/nutrition/CollapsibleFoodCard.tsx` — 1 error

### Batch 1D: API Routes con catch (5 archivos, ~5 errores)

- [ ] `app/api/exercises/recent/route.ts` — 1 error
- [ ] `app/api/transactions/recent-categories/route.ts` — 1 error
- [ ] `app/api/workouts/cardio-progress/route.ts` — 1 error
- [ ] `components/finance/TransactionList.tsx` — 1 error
- [ ] `components/finance/TransactionForm.tsx` — 1 error

---

## Fase 2: `any` en tipos explícitos — 7 archivos, ~18 errores

Estos NO son catch blocks, sino declaraciones de tipos que usan `any` directamente.

### Batch 2A: Lib files

- [ ] `lib/ai/types.ts` — 11 errores (interfaces con `any[]` y `Record<string, any>`)
  - Cambiar `any[]` → tipos específicos o `unknown[]`
  - Cambiar `Record<string, any>` → `Record<string, unknown>`
- [ ] `lib/ai/n8n-client.ts` — 1 error
- [ ] `lib/ai/rate-limit.ts` — 1 error
- [ ] `lib/backup/export.ts` — 1 error (+ 1 unused eslint-disable)

### Batch 2B: Components con any en tipos

- [ ] `components/workouts/WorkoutForm.tsx` — 3 errors (params tipados como any)
- [ ] `components/workouts/GeneralOverview.tsx` — 2 errors
- [ ] `components/settings/AICredentialsManager.tsx` — 3 errors

### Batch 2C: Components con any en props/callbacks

- [ ] `components/finance/accounts/FinancialAccountForm.tsx` — 1 error
- [ ] `components/finance/cards/CreditCardForm.tsx` — 1 error
- [ ] `components/workouts/cardio/CyclingForm.tsx` — 1 error
- [ ] `components/workouts/cardio/RunningForm.tsx` — 1 error
- [ ] `components/workouts/cardio/SwimmingForm.tsx` — 1 error
- [ ] `components/workouts/CollapsibleExerciseCard.tsx` — 1 error
- [ ] `components/workouts/ExerciseHistory.tsx` — 1 error
- [ ] `components/finance/progress/FinanceProgressChart.tsx` — 2 errors
- [ ] `components/nutrition/progress/NutritionProgressChart.tsx` — 2 errors
- [ ] `components/workouts/progress/ExerciseProgressChart.tsx` — 3 errors

---

## Fase 3: `no-require-imports` — 1 archivo, 1 error

- [ ] `tailwind.config.ts:81` — Cambiar `require()` a `import` dinámico o `await import()`

```typescript
// ANTES
plugins: [require("@tailwindcss/forms")]

// DESPUÉS
plugins: [await import("@tailwindcss/forms")]
// O si no soporta async:
// @ts-expect-error -- tailwind config requires CJS
plugins: [require("@tailwindcss/forms")]
```

---

## Fase 4: Warnings `no-unused-vars` — 12 warnings

### Batch 4A: Variables/imports no usados

- [ ] `app/api/ai/credentials/[id]/route.ts:12` — `request` param → renombrar a `_request`
- [ ] `components/finance/TransactionForm.tsx:127` — `fetchTypeItem` → eliminar
- [ ] `components/finance/TransactionList.tsx:70` — `getTypeName` → eliminar
- [ ] `components/workouts/ExerciseHistory.tsx:5` — `Link` import → eliminar
- [ ] `components/workouts/ExerciseHistory.tsx:170` — `exerciseName` param → `_exerciseName`
- [ ] `components/family/FamilyDashboard.tsx:80` — `upcomingCount` → eliminar
- [ ] `components/family/FamilyDashboard.tsx:83` — `monthFromNow` → eliminar
- [ ] `components/settings/AICredentialsManager.tsx:124` — `err` → `_err`
- [ ] `lib/ai/rate-limit.ts:13` — `userId` param → `_userId`
- [ ] `lib/backup/import.ts:8` — `BackupExport` → eliminar import
- [ ] `components/workouts/cardio/RunningForm.tsx:52` — `field` → `_field`
- [ ] `components/workouts/cardio/SwimmingForm.tsx:80` — `field` → `_field`

### Batch 4B: `react-hooks/exhaustive-deps` (4 warnings)

- [ ] `components/finance/progress/FinanceProgressChart.tsx:95` — agregar `onRecords` a deps
- [ ] `components/nutrition/progress/NutritionProgressChart.tsx:97` — agregar `onRecords` a deps
- [ ] `components/workouts/CollapsibleExerciseCard.tsx:91` — agregar `onLastPerformanceLoaded` a deps
- [ ] `components/workouts/progress/ExerciseProgressChart.tsx:102` — agregar `onPersonalRecords` a deps

### Batch 4C: Unused eslint-disable

- [ ] `lib/backup/export.ts:80` — eliminar `// eslint-disable` innecesario

---

## Orden de Ejecución Recomendado

| Orden | Fase | Archivos | Errores | Riesgo | Tiempo est. |
| ----- | ---- | -------- | ------- | ------ | ----------- |
| 1 | 1A | 4 | ~12 | Bajo | 5 min |
| 2 | 1B | 11 | ~22 | Bajo | 10 min |
| 3 | 1C+1D | 13 | ~13 | Bajo | 10 min |
| 4 | 2A | 4 | ~14 | Medio | 15 min |
| 5 | 2B+2C | 12 | ~18 | Medio | 15 min |
| 6 | 3 | 1 | 1 | Bajo | 2 min |
| 7 | 4A+4C | 12 | 0 (warnings) | Bajo | 5 min |
| 8 | 4B | 4 | 0 (warnings) | Medio | 10 min |

**Nota sobre riesgo "Medio":** Las fases 2 y 4B requieren leer el código para entender qué tipo correcto usar en lugar de `any`, y ajustar hooks `useEffect`. No son cambios mecánicos.

---

## Verificación Final

```bash
cd /home/badfaceserverlap/personal-dashboard/code
npm run lint           # 0 errores, 0 warnings
npx tsc --noEmit       # 0 errores
npm run build          # Build exitoso
```

---

## Notas

- **Todos los cambios son de tipado** — no hay cambios funcionales
- El 76% de los errores (55/73) son el mismo patrón: `catch (error: any)` → `catch (error: unknown)`
- Los warnings de `react-hooks/exhaustive-deps` requieren más cuidado para no introducir loops infinitos
- Considerar hacer un commit por fase para facilitar rollback si algo falla
