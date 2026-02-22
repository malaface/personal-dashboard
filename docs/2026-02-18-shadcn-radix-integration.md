# Integración shadcn/ui (Radix UI) — 2026-02-18

## Resumen

Integración incremental de shadcn/ui (Radix UI) en el proyecto. Se configuró la base completa y se migraron los componentes clave que usaban `@headlessui/react`.

---

## Cambios realizados

### 1. Dependencias instaladas

```bash
npm install tailwindcss-animate clsx tailwind-merge class-variance-authority lucide-react
```

Dependencias Radix UI instaladas automáticamente por `npx shadcn@latest add`:
- `@radix-ui/react-dialog`
- `@radix-ui/react-label`
- `@radix-ui/react-select`
- `@radix-ui/react-slot`
- `@radix-ui/react-tabs`

### 2. Archivos creados

| Archivo | Descripción |
|---------|-------------|
| `code/components.json` | Configuración shadcn/ui (style: default, baseColor: zinc, RSC: true) |
| `code/lib/utils.ts` | Función `cn()` con clsx + tailwind-merge |
| `code/components/ui/button.tsx` | shadcn Button con variantes |
| `code/components/ui/input.tsx` | shadcn Input |
| `code/components/ui/label.tsx` | shadcn Label |
| `code/components/ui/select.tsx` | shadcn Select (Radix) |
| `code/components/ui/dialog.tsx` | shadcn Dialog (Radix) |
| `code/components/ui/card.tsx` | shadcn Card |
| `code/components/ui/badge.tsx` | shadcn Badge |
| `code/components/ui/tabs.tsx` | shadcn Tabs (Radix) |
| `code/components/ui/sheet.tsx` | shadcn Sheet (Radix Dialog) |

### 3. Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `code/tailwind.config.ts` | Tema shadcn completo: colores via CSS vars, borderRadius, keyframes accordion, plugin tailwindcss-animate |
| `code/app/globals.css` | CSS variables zinc palette completo (light + dark), `@layer base` |
| `code/components/settings/AddCredentialModal.tsx` | Migrado de `@headlessui/react` Dialog → shadcn Dialog. Inputs y botones migrados a shadcn Input/Button |
| `code/components/dashboard/MobileDrawer.tsx` | Migrado de `@headlessui/react` Dialog+Transition → shadcn Sheet (side="right") |
| `code/components/ui/PasswordInput.tsx` | `<input>` nativo → shadcn `Input`, usa `cn()` para clases |
| `CLAUDE.md` | Stack UI actualizado, nota sobre @headlessui/react |

---

## Verificación

- ✅ `npm run build` — compilación exitosa (69/69 páginas estáticas generadas)
- ✅ `npx tsc --noEmit` — sin errores de TypeScript
- ⚠️ `npm run lint` — errores `@typescript-eslint/no-explicit-any` pre-existentes en todo el codebase (no introducidos por esta PR)

---

## Componentes migrados de @headlessui/react

| Componente | Antes | Después |
|------------|-------|---------|
| `AddCredentialModal.tsx` | `Dialog + Transition + TransitionChild + Dialog.Panel + Dialog.Title` | `shadcn Dialog + DialogContent + DialogHeader + DialogTitle` |
| `MobileDrawer.tsx` | `Dialog + DialogPanel + Transition + TransitionChild` | `shadcn Sheet + SheetContent + SheetHeader + SheetTitle` |
| `PasswordInput.tsx` | `<input>` nativo con clases Tailwind manuales | `shadcn Input` + `cn()` |

---

## Estado de @headlessui/react

`@headlessui/react` sigue instalado. Puede removerse en una futura PR una vez que todos sus usos en el codebase hayan sido migrados. Los tres componentes listados arriba ya no lo usan.

---

## Próximos pasos sugeridos

1. Migrar el resto de modals/dialogs que usen `@headlessui/react` (si los hay)
2. Migrar formularios a usar shadcn `Label` + `Input` consistentemente
3. Usar shadcn `Card` en las páginas de dashboard para reemplazar `div` con clases de card manual
4. Una vez todos los usos de `@headlessui/react` migren, removerlo con `npm uninstall @headlessui/react`

---

**Branch:** `feature/github-actions-branch-workflow`
**Build:** ✅ exitoso
**TypeScript:** ✅ sin errores
