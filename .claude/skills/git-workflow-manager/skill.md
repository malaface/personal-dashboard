# git-workflow-manager

---
**version**: 1.0.0
**last_updated**: 2025-12-09
**category**: Infrastructure & DevOps
**priority**: CRÍTICA
**dependencies**: git, gh (GitHub CLI)
---

## 📖 Overview

Complete Git workflow management for the docker-contenedores project, including submodule handling, Git Flow strategy, commit templates, PR creation, and emergency rollback procedures.

---

## 🎯 When to Invoke This Skill

**Auto-invoke when detecting**:
- Keywords: commit, branch, PR, merge, push, pull, rollback, git, github
- Commands: git add, git commit, git push, git checkout, gh pr
- Phrases: "hacer un commit", "create branch", "merge to develop"

**Manual invoke when**:
- Creating commits or branches
- Making pull requests
- Emergency rollbacks needed
- Git operations on submodules

---

## 📦 Versions

- **Git**: `2.x` or higher
- **GitHub CLI (gh)**: `2.x` or higher

---

## 🚨 Critical Rules (NEVER Break)

### Repository Structure

1. ❌ **NUNCA trabajar en el repo principal cuando cambias código del submodule**
   ```bash
   # ✅ BIEN - trabajo en submodule
   cd /home/badfaceserverlap/docker/contenedores
   git add projects/ai-platform/docker-compose.yml

   # ❌ MAL - trabajo desde repo padre
   cd /home/badfaceserverlap/docker
   git add contenedores/projects/ai-platform/docker-compose.yml
   ```

2. ❌ **NUNCA usar `git add .`**
   - Siempre stage archivos específicos
   - Previene commits accidentales

3. ❌ **NUNCA hacer commit sin testing**
   ```bash
   # SIEMPRE correr antes de commit
   bash shared/scripts/health-check.sh
   ```

4. ❌ **NUNCA push directo a main**
   - main solo recibe merges desde develop
   - Usar PRs para cambios importantes

5. ❌ **NUNCA olvidar configurar identidad de git**
   ```bash
   git config user.name "Claude Code"
   git config user.email "noreply@anthropic.com"
   ```

6. ❌ **NUNCA usar `--force` sin extrema precaución**
   - Solo en rollbacks de emergencia
   - Confirmar 3 veces antes de ejecutar

7. ✅ **SIEMPRE pull antes de empezar trabajo**
8. ✅ **SIEMPRE verificar branch actual** (`git branch --show-current`)
9. ✅ **SIEMPRE escribir mensajes de commit descriptivos**
10. ✅ **SIEMPRE usar el formato de commit estándar**

---

## 📚 Repository Structure

```
/home/badfaceserverlap/docker/           # Main repo (no remote, local only)
└── contenedores/                        # Submodule (THIS IS WHERE YOU WORK)
    ├── Remote: github.com/malaface/docker-contenedores.git
    ├── Current branch: develop
    └── All code changes happen here
```

**Key Points**:
- Main repo: Local only, no remote
- Submodule: Has GitHub remote (where commits go)
- **ALWAYS navigate to submodule first**: `cd /home/badfaceserverlap/docker/contenedores`

---

## 🌟 Git Flow Strategy

### Branches

- **`main`** - Production-ready, stable releases only
  - Protected branch
  - Only receives merges from develop via PR
  - Tagged releases (v1.0, v1.1, etc.)

- **`develop`** - Default development branch (CURRENT)
  - Integration branch
  - All features merge here first
  - Stable solutions commit directly here

- **`feature/*`** - New features and experiments
  - Branch from develop
  - Merge back to develop via PR
  - Delete after merge

- **`hotfix/*`** - Emergency fixes
  - Branch from main
  - Merge to both main AND develop
  - For critical production issues

---

## 📋 Workflows

### Standard Workflow (Direct to Develop)

**For stable, tested changes:**

```bash
# 1. Navigate to submodule
cd /home/badfaceserverlap/docker/contenedores
pwd && git branch --show-current  # Verify: should show "develop"

# 2. Pull latest changes
git pull origin develop

# 3. Check status
git status

# 4. Make your changes...
# (edit files, test changes)

# 5. Run health check (MANDATORY)
bash shared/scripts/health-check.sh

# 6. Configure git identity
git config user.name "Claude Code"
git config user.email "noreply@anthropic.com"

# 7. Stage specific files only
git add projects/ai-platform/docker-compose.yml
git add shared/monitoring/prometheus.yml

# 8. Verify staged changes
git status
git diff --staged

# 9. Commit with detailed message
git commit -m "Stable solution: Brief description

Technical Details:
- What was changed
- Why it was changed
- Impact/results
- Testing performed

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# 10. Push to remote
git push origin develop

# 11. Verify push
git log --oneline -5
gh repo view  # Optional: verify on GitHub
```

---

### Feature Branch Workflow

**For experimental or large changes:**

```bash
# 1. Navigate and pull latest
cd /home/badfaceserverlap/docker/contenedores
git checkout develop && git pull origin develop

# 2. Create feature branch
git checkout -b "feature/descriptive-name"

# Example: feature/add-ollama-service
# Example: feature/improve-monitoring

# 3. Make changes and test
# (edit files)
bash shared/scripts/health-check.sh

# 4. Configure git identity
git config user.name "Claude Code"
git config user.email "noreply@anthropic.com"

# 5. Commit changes
git add [specific-files]
git commit -m "feat: description

Detailed explanation of changes.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# 6. Push feature branch
git push -u origin "feature/descriptive-name"

# 7. Create Pull Request
gh pr create --base develop \
  --title "Feature: [Description]" \
  --body "## Summary
[Detailed description]

## Changes
- Change 1
- Change 2

## Testing
- [ ] health-check.sh passed
- [ ] Manual testing completed
- [ ] Documentation updated

🤖 Generated with [Claude Code](https://claude.com/claude-code)"

# 8. After PR approval, merge and cleanup
gh pr merge --squash
git checkout develop
git pull origin develop
git branch -d "feature/descriptive-name"
```

---

### Hotfix Workflow

**For critical production issues:**

```bash
# 1. Navigate to submodule
cd /home/badfaceserverlap/docker/contenedores

# 2. Branch from main
git checkout main
git pull origin main
git checkout -b "hotfix/critical-fix-name"

# 3. Make fix and test thoroughly
# (make changes)
bash shared/scripts/health-check.sh

# 4. Commit fix
git config user.name "Claude Code"
git config user.email "noreply@anthropic.com"
git add [specific-files]
git commit -m "hotfix: critical issue description

Details of fix.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# 5. Push and create PR to main
git push -u origin "hotfix/critical-fix-name"
gh pr create --base main \
  --title "HOTFIX: Critical Issue" \
  --body "## Emergency Fix
Critical issue requiring immediate merge.

## Impact
[Describe impact]

🤖 Generated with [Claude Code](https://claude.com/claude-code)"

# 6. After merge to main, also merge to develop
git checkout develop
git merge hotfix/critical-fix-name
git push origin develop
git branch -d "hotfix/critical-fix-name"
```

---

## 🚨 Emergency Rollback

**When you need to undo recent commits:**

```bash
cd /home/badfaceserverlap/docker/contenedores

# 1. Find recent stable commits
git log --oneline --grep="Stable solution" -10

# Output example:
# abc1234 Stable solution: Fixed monitoring alerts
# def5678 Stable solution: Updated n8n configuration
# ghi9012 Stable solution: Added new dashboard

# 2. Choose rollback point
# Option A: Soft reset (keeps changes, uncommits)
git reset --soft abc1234

# Option B: Hard reset (discards all changes - CAREFUL!)
git reset --hard abc1234

# 3. If already pushed, force push (USE WITH EXTREME CAUTION)
git push origin develop --force

# 4. Verify rollback
git log --oneline -5
bash shared/scripts/health-check.sh

# 5. Document incident
# Create report in docs/incidents/YYYY-MM-DD-rollback-reason.md
```

---

## 📝 Commit Message Format

### Standard Format

```
Type: Short description (max 50 chars)

Detailed explanation:
- What was changed
- Why it was changed
- Impact/results
- Testing performed

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

### Types

- **Stable solution**: Tested, ready for use
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **refactor**: Code refactoring
- **test**: Adding tests
- **chore**: Maintenance tasks
- **hotfix**: Critical production fix

### Examples

```bash
# Stable solution example
git commit -m "Stable solution: Add Redis caching layer

Technical Details:
- Added Redis container to docker-compose
- Configured rate limiting for API endpoints
- Updated environment variables
- Testing: All health checks passed

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Feature example
git commit -m "feat: Implement Ollama GPU support

Added GPU profile to docker-compose for Ollama service.
Enables NVIDIA GPU acceleration for LLM inference.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## 🔧 Git CLI Commands Reference

### Navigation & Status

```bash
# Always verify location and branch
pwd && git branch --show-current

# Check status
git status

# View recent commits
git log --oneline -10

# View changes before staging
git diff [file]

# View staged changes
git diff --staged
```

### Branch Operations

```bash
# List all branches
git branch -a

# Create and switch to new branch
git checkout -b "feature/name"

# Switch branches
git checkout branch-name

# Delete local branch
git branch -d branch-name

# Delete remote branch
git push origin --delete branch-name
```

### Staging & Committing

```bash
# Stage specific files (NEVER use 'git add .')
git add file1.txt file2.txt

# Unstage file
git reset HEAD file.txt

# Commit with message
git commit -m "message"

# Amend last commit (only if not pushed!)
git commit --amend -m "new message"
```

### Remote Operations

```bash
# View remote info
git remote -v

# Pull latest changes
git pull origin develop

# Push to remote
git push origin branch-name

# Push new branch
git push -u origin branch-name

# Fetch without merge
git fetch origin
```

### Submodule Operations

```bash
# Check submodule status
git submodule status

# Update submodule pointer (from parent repo)
cd /home/badfaceserverlap/docker
git add contenedores
git commit -m "Update contenedores submodule"
```

---

## 🐙 GitHub CLI (gh) Commands

### Pull Requests

```bash
# View repository info
gh repo view

# List PRs
gh pr list

# View specific PR
gh pr view 123

# Create PR
gh pr create --base develop \
  --title "Title" \
  --body "Description"

# Merge PR (after approval)
gh pr merge 123 --squash

# Close PR
gh pr close 123
```

### Issues

```bash
# List issues
gh issue list

# Create issue
gh issue create --title "Title" --body "Description"

# View issue
gh issue view 123
```

---

## ✅ Pre-Commit Checklist

**ALWAYS complete before every commit:**

- [ ] Navigate to submodule: `cd /home/badfaceserverlap/docker/contenedores`
- [ ] Verify branch: `git branch --show-current` (should be `develop` or `feature/*`)
- [ ] Pull latest: `git pull origin develop`
- [ ] Run health check: `bash shared/scripts/health-check.sh` (MUST PASS)
- [ ] Configure git identity
- [ ] Stage ONLY modified files (NEVER `git add .`)
- [ ] Verify staged: `git status && git diff --staged`
- [ ] Write descriptive commit message (include Technical Details)
- [ ] Push to remote: `git push origin [branch]`
- [ ] Verify push: `git log --oneline -5`

---

## 🚫 Common Mistakes to Avoid

### 1. Working in wrong directory

```bash
# ❌ MAL
cd /home/badfaceserverlap/docker
git add contenedores/projects/ai-platform/file.yml

# ✅ BIEN
cd /home/badfaceserverlap/docker/contenedores
git add projects/ai-platform/file.yml
```

### 2. Using `git add .`

```bash
# ❌ MAL - stages everything, including unintended files
git add .

# ✅ BIEN - stage specific files
git add projects/ai-platform/docker-compose.yml
git add shared/monitoring/prometheus.yml
```

### 3. Committing without testing

```bash
# ❌ MAL
git add file.yml
git commit -m "changes"

# ✅ BIEN
git add file.yml
bash shared/scripts/health-check.sh  # MUST PASS
git commit -m "Stable solution: changes"
```

### 4. Vague commit messages

```bash
# ❌ MAL
git commit -m "fix"
git commit -m "updates"
git commit -m "wip"

# ✅ BIEN
git commit -m "Stable solution: Fix Prometheus scraping configuration

Technical Details:
- Updated prometheus.yml with correct targets
- Fixed port mappings for node-exporter
- Testing: All metrics visible in Grafana

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## 📖 Git Best Practices Summary

1. **Always work in submodule**: `cd /home/badfaceserverlap/docker/contenedores`
2. **Always configure git identity** before commits
3. **Always stage specific files** (never `git add .`)
4. **Always test before committing** (`health-check.sh`)
5. **Always write detailed commit messages** (include Technical Details)
6. **Always verify changes** (`git diff --staged`)
7. **Always pull before starting work** (`git pull origin develop`)
8. **Never push to main** (use PRs)
9. **Never commit without testing**
10. **Never use `--force`** unless emergency rollback

---

## 🔗 Related Skills

- `database-management` - May need commits after migrations
- `docker-operations` - Infrastructure changes need commits
- `troubleshooting-guide` - Rollback procedures

---

## 📝 Version Tags

**Current tags**:
- `v1.0-initial-stack` - Initial Docker infrastructure
- `v1.1-cloudflare-tunnels` - Cloudflare tunnels configured
- `v1.2-clean-ai-platform` - AI platform services cleaned

**Creating new tags**:
```bash
# After stable release to main
git tag -a v1.3-feature-name -m "Description"
git push origin v1.3-feature-name
```

---

## 🆘 Troubleshooting

### "Your branch is behind"

```bash
git pull origin develop
# or if you have local commits
git pull --rebase origin develop
```

### "Merge conflict"

```bash
# View conflicting files
git status

# Edit files to resolve conflicts
# Look for <<<<<<, ======, >>>>>> markers

# After resolving
git add [resolved-files]
git commit -m "Merge conflict resolved"
```

### "Permission denied (publickey)"

```bash
# Check SSH key
ssh -T git@github.com

# Or use GitHub CLI (already configured)
gh auth status
```

---

## 📚 Additional Resources

- Git Documentation: https://git-scm.com/doc
- GitHub CLI Manual: https://cli.github.com/manual/
- Git Flow Guide: https://nvie.com/posts/a-successful-git-branching-model/
