# Fix: Espacio negro en teclado movil + Actualizacion de iconos

**Fecha:** 2026-03-05
**Branch:** `fix/mobile-keyboard-blackspace-icons`
**Archivos modificados:** 5

---

## Problema

1. **Espacio/franja negra al abrir teclado movil** — El dashboard mostraba un espacio negro cuando se abria el teclado virtual en inputs. A veces persistia hasta recargar la pagina.
2. **Iconos incorrectos en workout tabs** — Natacion, Correr y Ciclismo usaban SVGs genericos (reloj, globo) que no representaban la actividad.
3. **Sin iconos en finance tabs** — Las tabs de finanzas no tenian iconos visuales.

## Causa raiz (bug del teclado)

- `interactiveWidget: 'resizes-content'` en el viewport meta causaba que el browser redimensionara el contenido al abrir el teclado, generando un layout shift con fondo negro visible.
- El hook `useKeyboardVisible` solo escuchaba `resize` en `visualViewport`. Si el teclado se cerraba por swipe (iOS), el estado quedaba en `true` y el `MobileBottomNav` no reaparecia.
- Sin `overflow-hidden` en el contenedor raiz, el contenido podia desbordarse.

## Solucion

### Parte 1: Fix del espacio negro

| Archivo | Cambio |
|---------|--------|
| `code/app/layout.tsx` | `interactiveWidget: 'resizes-content'` → `'overlays-content'` |
| `code/app/dashboard/layout.tsx` | Agregado `overflow-hidden` al contenedor flex |
| `code/lib/hooks/useKeyboardVisible.ts` | Listener `scroll` en visualViewport + `focusin`/`focusout` como fallback + delay 300ms + cleanup de timeouts |

### Parte 2: Iconos de workout (lucide-react)

| Modo | Antes | Despues |
|------|-------|---------|
| General | Grid SVG inline | `LayoutGrid` |
| Gimnasio | Barbell SVG inline | `Dumbbell` |
| Natacion | Clock SVG (incorrecto) | `Waves` |
| Correr | Globe SVG (incorrecto) | `Footprints` |
| Ciclismo | Clock SVG (incorrecto) | `Bike` |

### Parte 3: Iconos de finance (@heroicons/react)

| Tab | Icono |
|-----|-------|
| Transacciones | `ArrowsRightLeftIcon` |
| Cuentas | `WalletIcon` |
| Tarjetas | `CreditCardIcon` |
| Progreso | `ChartBarIcon` |

## Verificacion

- Build: OK
- Lint: Sin errores nuevos
- TypeScript: OK (`tsc --noEmit` limpio)
