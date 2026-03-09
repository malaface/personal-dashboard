# Reporte: Limpieza Completa de Lint — 54 Errores + 17 Warnings

**Fecha:** 2026-03-09
**Branch:** `fix/lint-cleanup`
**Impacto:** 0 cambios funcionales — solo tipado, limpieza y correcciones de lint

---

## Resultado

| Métrica | Antes | Después |
|---------|-------|---------|
| Errores ESLint | 54 | 0 |
| Warnings ESLint | 17 | 0 |
| Errores TypeScript | 0 | 0 |
| Build | ✅ | ✅ |

---

## Cambios por Categoría

### 1. `catch (error: any)` → `catch (error: unknown)` (~25 archivos)

Patrón aplicado en todos los catch blocks:
```typescript
// Antes
catch (error: any) {
  return { error: error.message }
}

// Después
catch (error: unknown) {
  return { error: error instanceof Error ? error.message : "Error" }
}
```

**Archivos afectados:**
- API routes: `ai/chat`, `ai/credentials`, `ai/credentials/[id]`, `auth/forgot-password`, `auth/resend-verification`, `auth/reset-password`, `backup/export`, `backup/import`, `backup/preview`, `exercises/[id]/last`, `exercises/history`
- Components: `FinancialAccountForm`, `CreditCardForm`, `AICredentialsManager` (3 catch blocks), `CyclingForm`, `RunningForm`, `SwimmingForm`
- Lib: `n8n-client.ts`, `rate-limit.ts`

### 2. `as any` → Tipos Específicos (~15 ubicaciones)

| Archivo | Antes | Después |
|---------|-------|---------|
| `ai/credentials/route.ts` | `cred.provider as any` | `cred.provider as AIProvider` |
| `ai/credentials/[id]/route.ts` | `updated.provider as any` | `updated.provider as AIProvider` |
| `ai/chat/route.ts` | `'AI_CHAT_REQUEST' as any` | `'AI_CHAT_REQUEST'` (tipo agregado a AuditAction) |
| `ai/chat/route.ts` | `(moduleData as any).dataPoints` | `'dataPoints' in moduleData ? moduleData.dataPoints : 0` |
| `exercises/recent/route.ts` | `(error as any).digest` | `(error as { digest?: string }).digest` |
| `transactions/recent-categories` | `(error as any).digest` | `(error as { digest?: string }).digest` |
| `TransactionForm.tsx` | `useState<any>(null)` | `useState<{ slug?: string; name?: string } \| null>(null)` |
| `MealTemplateManager.tsx` | `val as any` | `val as "BREAKFAST" \| "LUNCH" \| "DINNER" \| "SNACK"` |
| `WorkoutTemplateManager.tsx` | `val as any` | `val as "BEGINNER" \| "INTERMEDIATE" \| "ADVANCED"` |
| `workouts/actions.ts` | `.map((exercise: any)` | `.map((exercise)` (tipo inferido) |

### 3. `lib/ai/types.ts` — Interfaces con `any` (10 errores)

Todas las interfaces `WorkoutsData`, `FinanceData`, `NutritionData`, `FamilyData` actualizadas:
- `any[]` → `Record<string, unknown>[]`
- `Record<string, any>` → `Record<string, Record<string, unknown>>`
- `any | null` → `Record<string, unknown> | null`

### 4. Variables No Usadas (12 warnings)

| Archivo | Variable | Acción |
|---------|----------|--------|
| `TransactionList.tsx` | `getTypeName` | Eliminada |
| `TransactionForm.tsx` | `fetchTypeItem` | Refactorizada (IIFE) |
| `FamilyDashboard.tsx` | `upcomingCount`, `monthFromNow` | Prefijada `_upcomingCount`, eliminada `monthFromNow` |
| `AICredentialsManager.tsx` | `userId` | Renombrada `_userId` |
| `BackupManager.tsx` | `err` | Renombrada `_err` |
| `CollapsibleFoodCard.tsx` | `field` | Renombrada `_field` |
| `CollapsibleExerciseCard.tsx` | `field` | Renombrada `_field` |
| `GeneralOverview.tsx` | `Link` import | Eliminada |
| `WorkoutForm.tsx` | `exerciseName` | Renombrada `_exerciseName` |
| `credentials/route.ts` | `request` | Renombrada `_request` |

### 5. `react-hooks/exhaustive-deps` (4 warnings)

Dependencias faltantes agregadas a `useEffect`:
- `FinanceProgressChart.tsx` → `onRecords`
- `NutritionProgressChart.tsx` → `onRecords`
- `ExerciseHistory.tsx` → `onLastPerformanceLoaded`
- `ExerciseProgressChart.tsx` → `onPersonalRecords`

### 6. Otros

- `tailwind.config.ts`: `require()` → eslint-disable comment
- `lib/backup/export.ts`: eslint-disable movido a la línea correcta
- `lib/backup/import.ts`: import `BackupExport` no usado eliminado
- `lib/audit/logger.ts`: tipos `AI_CHAT_REQUEST` y `AI_CHAT_ERROR` agregados a `AuditAction`
- `workouts/actions.ts`: `setDetails?.length` → `setDetails && setDetails.length` (fix strict TS)

---

## Verificación

```bash
npm run lint        # ✅ 0 errores, 0 warnings
npx tsc --noEmit    # ✅ 0 errores
npm run build       # ✅ Build exitoso
```
