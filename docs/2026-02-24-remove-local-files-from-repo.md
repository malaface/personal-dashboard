# Reporte: Eliminación de archivos locales del repositorio

**Fecha:** 2026-02-24
**PR:** https://github.com/malaface/personal-dashboard/pull/9
**Branch:** `chore/remove-claude-github-from-tracking`

## Problema

Los archivos de configuración local de Claude Code (`.claude/`, `CLAUDE.md`) y los workflows de GitHub (`.github/`) estaban siendo trackeados en el repositorio remoto. Estos archivos son específicos del entorno de desarrollo local y no deben estar en el repo.

## Solución

1. **`git rm --cached`** — Se removieron los archivos del tracking de git sin borrarlos del disco local:
   - `.claude/skills/backend/skill.md`
   - `.claude/skills/frontend/skill.md`
   - `.claude/skills/git-workflow/skill.md`
   - `.github/workflows/claude.yml`
   - `CLAUDE.md`
   - `CLAUDE.md.backup-20251209`

2. **`.gitignore` actualizado** — Se reemplazaron las reglas parciales de `.claude/` por reglas completas:
   ```
   .claude/
   CLAUDE.md
   CLAUDE.md.backup-*
   .github/
   ```

## Verificación

- Los archivos siguen existiendo localmente tras el `git rm --cached`
- El `.gitignore` impide que se vuelvan a agregar al tracking
- El repositorio remoto ya no contiene estos archivos tras el merge
