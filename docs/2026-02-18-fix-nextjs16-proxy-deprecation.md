# Fix: Next.js 16 middleware → proxy deprecation

**Fecha:** 2026-02-18
**Estado:** Completado
**TypeScript:** ✅ Sin errores

---

## Problema

El Docker build mostraba dos warnings:

```
[baseline-browser-mapping] The data in this module is over two months old.
To ensure accurate Baseline data, please update: `npm i baseline-browser-mapping@latest -D`

⚠ The "middleware" file convention is deprecated.
Please use "proxy" instead.
Learn more: https://nextjs.org/docs/messages/middleware-to-proxy
```

---

## Causa

### 1. `middleware.ts` deprecado en Next.js 16

Next.js 16 renombró la convención de archivo `middleware.ts` → `proxy.ts`.
El motivo es eliminar la confusión con el "middleware" de Express.js y clarificar
que la función opera como un proxy de red en el Edge Runtime.

### 2. `baseline-browser-mapping` desactualizado

Dependencia transitiva (usada internamente por Next.js/Browserslist durante el build)
con datos de más de dos meses. No estaba declarada como dependencia directa en `package.json`.

---

## Cambios realizados

### `code/middleware.ts` → `code/proxy.ts`

- Archivo renombrado
- Función exportada renombrada: `middleware` → `proxy`
- Lógica de autenticación (NextAuth JWT + redirecciones) sin cambios

```diff
- export async function middleware(request: NextRequest) {
+ export async function proxy(request: NextRequest) {
```

### `code/package.json`

Agregado `baseline-browser-mapping` como devDependency para forzar la versión más reciente:

```diff
  "devDependencies": {
+   "baseline-browser-mapping": "*",
    "@types/bcryptjs": "^2.4.6",
```

---

## Verificación

```
✅ npx tsc --noEmit — sin errores de tipos
```

---

## Referencia

- [Next.js docs: middleware-to-proxy](https://nextjs.org/docs/messages/middleware-to-proxy)
- Codemod oficial: `npx @next/codemod@canary middleware-to-proxy .`
