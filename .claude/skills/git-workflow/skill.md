# git-workflow

---
**version**: 2.0.0
**last_updated**: 2026-02-18
**category**: Git & GitHub
**priority**: CRÍTICA
**dependencies**: git, gh (GitHub CLI)
---

## 🎯 Cuando invocar esta skill

**Auto-invocar con keywords:** `commit`, `branch`, `PR`, `push`, `merge`, `git`, `github`, `tag`, `release`, `hacer commit`, `crear branch`, `pull request`

---

## 🚨 Reglas Críticas (NUNCA romper)

1. ❌ **NUNCA commit directo a `main` o `develop`** — siempre feature branches
2. ❌ **NUNCA usar `git add .`** — stage archivos específicos siempre
3. ❌ **NUNCA push sin build + lint + tsc previo**
4. ❌ **NUNCA usar `--force` en branches compartidos** sin confirmación explícita
5. ✅ **SIEMPRE usar GitHub CLI (`gh`)** para PRs, issues, releases
6. ✅ **SIEMPRE conventional commits** con Co-Authored-By
7. ✅ **SIEMPRE al resolver un problema:** 1) Reporte en `docs/` 2) Commit

---

## 🌿 Branch Naming

| Prefijo | Propósito | Ejemplo |
|---------|-----------|---------|
| `feature/` | Nueva funcionalidad | `feature/add-dark-mode` |
| `fix/` | Corrección de bug | `fix/auth-redirect-loop` |
| `refactor/` | Refactorización | `refactor/optimize-queries` |
| `docs/` | Solo documentación | `docs/update-readme` |
| `chore/` | Mantenimiento | `chore/update-dependencies` |
| `hotfix/` | Fix crítico en producción | `hotfix/security-patch` |

---

## 📋 Workflow Completo

### Feature branch (flujo estándar)

```bash
# 1. Partir de develop actualizado
git checkout develop && git pull origin develop

# 2. Crear feature branch
git checkout -b "feature/nombre-descriptivo"

# 3. Hacer cambios...

# 4. Pre-commit checks (TODOS obligatorios)
cd /home/badfaceserverlap/personal-dashboard/code
npm run build        # ← DEBE pasar sin errores
npm run lint         # ← DEBE pasar
npx tsc --noEmit     # ← DEBE pasar sin errores TypeScript

# 5. Stage archivos específicos (NUNCA git add .)
git add code/app/dashboard/gym/page.tsx
git add code/components/gym/WorkoutForm.tsx

# 6. Verificar staged
git status && git diff --staged

# 7. Commit con formato convencional
git commit -m "$(cat <<'EOF'
feat: descripción breve en imperativo

- Detalle 1
- Detalle 2

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"

# 8. Push y crear PR
git push -u origin "feature/nombre-descriptivo"
gh pr create --base develop \
  --title "feat: Descripción" \
  --body "$(cat <<'EOF'
## Summary
- Qué hace este PR
- Por qué es necesario

## Test plan
- [ ] Build sin errores
- [ ] Lint pasa
- [ ] TypeScript sin errores
- [ ] Testing manual completado
- [ ] Sin conflictos con develop

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

### Hotfix (fix crítico en producción)

```bash
# Desde main
git checkout main && git pull origin main
git checkout -b "hotfix/descripcion-critica"

# Fix + checks
npm run build && npm run lint && npx tsc --noEmit

git add [archivos-específicos]
git commit -m "hotfix: descripción del fix crítico

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"

git push -u origin "hotfix/descripcion-critica"
gh pr create --base main --title "HOTFIX: Descripción" --body "..."

# Después del merge a main, también merge a develop
git checkout develop
git merge hotfix/descripcion-critica
git push origin develop
git branch -d "hotfix/descripcion-critica"
```

### Cleanup post-merge

```bash
git checkout develop && git pull origin develop
git branch -d "feature/nombre-descriptivo"
```

---

## 📝 Formato de Commits (Conventional Commits)

### Tipos

| Tipo | Uso |
|------|-----|
| `feat` | Nueva funcionalidad |
| `fix` | Corrección de bug |
| `refactor` | Refactorización sin cambio funcional |
| `docs` | Solo documentación |
| `chore` | Mantenimiento, dependencias |
| `hotfix` | Fix crítico en producción |
| `style` | Cambios de estilo/formato |
| `test` | Agregar o corregir tests |

### Template

```bash
git commit -m "$(cat <<'EOF'
tipo: descripción breve en imperativo (max 50 chars)

- Detalle de cambio 1
- Detalle de cambio 2
- Razón del cambio

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

### Ejemplos

```bash
# Feature
git commit -m "feat: agregar modal de confirmación en delete workout

- Implementar AlertDialog de shadcn/ui
- Previene borrado accidental
- Incluye mensaje con nombre del workout

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"

# Fix
git commit -m "fix: corregir redirect tras logout en dashboard

- Auth callback devolvía a /dashboard sin session
- Cambiar redirect target a /login

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## ✅ Pre-Merge Checklist

Antes de crear PR o merge a develop/main:

- [ ] `npm run build` sin errores
- [ ] `npm run lint` pasa
- [ ] `npx tsc --noEmit` sin errores TypeScript
- [ ] Testing manual completado
- [ ] Sin conflictos con la base branch
- [ ] Archivos innecesarios no incluidos (`.env`, `node_modules`, etc.)

---

## 🏷️ Git Tags (Versioning Semántico)

### Estrategia

- **v0.x** — Pre-release, features individuales completadas
- **v1.0** — Primera versión production-ready (SOLO cuando app completamente funcional)
- **v2.0+** — Breaking changes mayores, migración de framework

### Comandos

```bash
# Crear tag
git tag -a v0.1 -m "feat: Auth + Gym module functional"
git push origin v0.1

# Listar tags
git tag -l

# Ver detalle de un tag
git show v0.1
```

### Cuándo crear un tag

✅ Crear cuando:
- Feature mayor completada y testeada
- Build exitoso sin errores
- Funcionalidad verificada manualmente

❌ NO crear cuando:
- Fix menor o cambio cosmético
- Feature incompleta
- Tests fallando

**Status actual:** Pending v0.1 (cuando Auth + módulos básicos estén completos)

---

## 📋 Pasos Obligatorios al Resolver un Problema

**SIEMPRE ejecutar estos dos pasos cuando se confirma que algo funciona:**

### 1. Crear reporte en `docs/`

```bash
# Crear archivo markdown en docs/
# Formato: docs/YYYY-MM-DD-descripcion-del-problema.md
```

**Estructura del reporte:**
```markdown
# [Título del problema resuelto]

**Fecha:** YYYY-MM-DD
**Categoría:** Bug Fix / Feature / Infrastructure

## Problema
Descripción del problema original.

## Causa Raíz
Por qué ocurría.

## Solución Implementada
Qué cambios se hicieron.

## Archivos Modificados
- `path/to/file.tsx` — descripción del cambio

## Verificación
Cómo se confirmó que funciona.

## Lecciones Aprendidas
Qué prevenir en el futuro.
```

### 2. Hacer commit al repositorio

```bash
# Stage el reporte + archivos del fix
git add docs/YYYY-MM-DD-descripcion.md
git add [otros-archivos-modificados]

git commit -m "fix: descripción del problema resuelto

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

---

## 🐙 GitHub CLI Reference

```bash
# Ver repo
gh repo view

# PRs
gh pr list
gh pr view 123
gh pr create --base develop --title "..." --body "..."
gh pr merge 123 --squash
gh pr close 123

# Issues
gh issue list
gh issue create --title "..." --body "..."
gh issue view 123
gh issue close 123

# Releases
gh release create v0.1 --title "v0.1" --notes "..."
gh release list
```

---

## 🆘 Troubleshooting

```bash
# Branch desactualizado
git pull origin develop
# O con commits locales:
git pull --rebase origin develop

# Merge conflict
git status                    # Ver archivos conflictivos
# Editar archivos (buscar <<<<<<, ======, >>>>>>)
git add [archivos-resueltos]
git commit -m "fix: resolve merge conflict"

# SSH key issue
ssh -T git@github.com
gh auth status
gh auth login    # Si necesita re-autenticación
```
