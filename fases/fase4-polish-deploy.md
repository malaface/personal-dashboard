# Fase 4: Polish & Deploy (Weeks 9-10)

**Status:** ⏳ PENDIENTE
**Duración Estimada:** 2 semanas (80-100 horas)
**Prerrequisito:** Fase 3 ✅ Completada
**Arquitectura:** PostgreSQL + NextAuth.js + Prisma (NO Supabase)

---

## 🏗️ Contexto Arquitectónico

**IMPORTANTE:** Esta fase asume arquitectura **PostgreSQL + NextAuth + Prisma**.

**Deployment Considerations:**
- **Database:** PostgreSQL 15 (puerto 5433 en desarrollo, variable en producción)
- **Auth:** NextAuth.js (JWT sessions, variables de entorno críticas)
- **Docker:** Standalone Next.js container (nextjs-dashboard)
- **Secrets:** DATABASE_URL, NEXTAUTH_SECRET en .env
- **AI Services:** n8n, Flowise, Qdrant (URLs configurables)

**Testing Stack:**
- Vitest (unit tests)
- Playwright (E2E tests)
- Prisma Client Mock (database mocking)

**Referencias:**
- Fase 1: `fases/fase1-foundation.md` (Docker setup, Dockerfile)
- Plan completo: `/home/badfaceserverlap/.claude/plans/golden-floating-robin.md`

---

## 📋 Objetivos de la Fase

Refinar UI/UX, implementar testing, optimizar performance y preparar para deployment en producción.

### Semana 9 - UX/UI Refinement & Features
- Diseño responsive mobile-first
- Dark mode toggle
- Animaciones y transiciones
- Loading states y skeletons
- Error boundaries mejorados
- Export de datos (CSV, PDF)
- In-app notifications
- Progressive Web App (PWA)

### Semana 10 - Testing & Production
- Unit tests (Vitest)
- Integration tests
- E2E tests (Playwright)
- Performance optimization
- Security audit
- Backup automation
- Grafana dashboard
- Production deployment

---

## ✅ Pre-Requisitos (VALIDAR ANTES DE EMPEZAR)

```bash
# 1. Fase 3 completada - AI integrations funcionando
ls -l projects/personal-dashboard-project/code/app/api/n8n/
ls -l projects/personal-dashboard-project/code/components/chat/
# Deben existir API routes y chatbot

# 2. Todos los módulos funcionando (con auth)
# Login primero: http://localhost:3000/login
curl -I http://localhost:3000/dashboard/workouts
curl -I http://localhost:3000/dashboard/finance
curl -I http://localhost:3000/dashboard/nutrition
curl -I http://localhost:3000/dashboard/family
# Sin auth: 307 redirect, con auth: 200 OK

# 3. AI integrations funcionando
curl http://localhost:3000/api/flowise/chat \
  -X POST -H "Content-Type: application/json" \
  -H "Cookie: ..." \
  -d '{"question":"test"}'
# Debe retornar respuesta del chatbot

# 4. PostgreSQL con datos de prueba
psql -h localhost -p 5433 -U dashboard_user -d dashboard -c "
  SELECT
    (SELECT COUNT(*) FROM workouts) as workouts,
    (SELECT COUNT(*) FROM transactions) as transactions,
    (SELECT COUNT(*) FROM meals) as meals;
"
# Debe tener datos en todas las tablas

# 5. Docker containers healthy
docker ps | grep -E "(dashboard-postgres|dashboard-redis|nextjs-dashboard)"
# Esperado: 3 containers (postgres, redis, y opcionalmente nextjs si ya dockerizado)
```

---

## 🚀 Prompt de Inicio para Nueva Conversación

```
Hola, voy a iniciar Fase 4 del proyecto Personal Dashboard (Polish & Deploy).

CONTEXTO:
- Fases 0-3 completadas
- Arquitectura: PostgreSQL + NextAuth + Prisma (NO Supabase)
- Dashboard completamente funcional con 4 módulos
- AI integration con n8n, Flowise y Qdrant funcionando
- Listo para refinamiento y producción

STACK:
- Next.js 15 + NextAuth.js + Prisma
- PostgreSQL 15 (puerto 5433)
- Docker containers: dashboard-postgres, dashboard-redis, nextjs-dashboard

OBJETIVO FASE 4:
- Semana 9: UI/UX refinement, PWA, exports, responsive design, dark mode
- Semana 10: Testing (Vitest, Playwright), optimización, security audit, deployment

IMPORTANTE:
- Testing debe mockear Prisma Client
- Deployment usa standalone Next.js container
- Variables críticas: DATABASE_URL, NEXTAUTH_SECRET

Por favor lee:
- @fases/fase4-polish-deploy.md (este archivo)
- @fases/fase1-foundation.md (Docker setup, Dockerfile)
- @/home/badfaceserverlap/.claude/plans/golden-floating-robin.md (plan completo)

Valida pre-requisitos antes de empezar.
```

---

## 📝 Semana 9: UX/UI Refinement & Features

### Task 1: Responsive Design Mobile-First

**Componentes a actualizar:**

**1. Sidebar responsive:**
```typescript
// components/layout/Sidebar.tsx
'use client'

import { useState } from 'react'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { Menu, X } from 'lucide-react'

export default function Sidebar() {
  const isMobile = useMediaQuery('(max-width: 768px)')
  const [isOpen, setIsOpen] = useState(!isMobile)

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:static
        inset-y-0 left-0
        z-50 w-64
        bg-gray-900 text-white
        transform transition-transform duration-300
        ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
      `}>
        {/* Sidebar content */}
      </aside>

      {/* Mobile menu button */}
      {isMobile && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed bottom-4 right-4 z-30 p-3 rounded-full bg-blue-600 text-white shadow-lg"
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      )}
    </>
  )
}
```

**2. Custom hook:** `hooks/useMediaQuery.ts`
```typescript
import { useState, useEffect } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    setMatches(media.matches)

    const listener = () => setMatches(media.matches)
    media.addEventListener('change', listener)

    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}
```

### Task 2: Dark Mode

**1. Theme provider:** `components/providers/ThemeProvider.tsx`
```typescript
'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Theme = 'light' | 'dark'

const ThemeContext = createContext<{
  theme: Theme
  toggleTheme: () => void
}>({
  theme: 'light',
  toggleTheme: () => {}
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme
    if (stored) setTheme(stored)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
```

**2. Actualizar `tailwind.config.js`:**
```javascript
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0f172a',
          card: '#1e293b',
          border: '#334155'
        }
      }
    }
  }
}
```

### Task 3: Loading States & Skeletons

**Component:** `components/ui/Skeleton.tsx`
```typescript
export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
  )
}

export function WorkoutCardSkeleton() {
  return (
    <div className="border rounded-lg p-4 space-y-3">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  )
}
```

**Uso en página:**
```typescript
import { Suspense } from 'react'
import { WorkoutCardSkeleton } from '@/components/ui/Skeleton'

export default function GymPage() {
  return (
    <Suspense fallback={<WorkoutCardSkeleton />}>
      <WorkoutList />
    </Suspense>
  )
}
```

### Task 4: Export de Datos

**Component:** `components/modules/finance/ExportButton.tsx`
```typescript
'use client'

import { Download } from 'lucide-react'
import { useState } from 'react'

export default function ExportButton() {
  const [loading, setLoading] = useState(false)

  const exportCSV = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/export/transactions')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={exportCSV}
      disabled={loading}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
    >
      <Download size={20} />
      {loading ? 'Exporting...' : 'Export CSV'}
    </button>
  )
}
```

**API Route:** `app/api/export/transactions/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { stringify } from 'csv-stringify/sync'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: transactions } = await supabase
    .from('transactions')
    .select('date, amount, category, subcategory, description, tags')
    .eq('user_id', user.id)
    .is('deleted_at', null)
    .order('date', { ascending: false })

  const csv = stringify(transactions, {
    header: true,
    columns: ['date', 'amount', 'category', 'subcategory', 'description', 'tags']
  })

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="transactions-${new Date().toISOString()}.csv"`
    }
  })
}
```

### Task 5: Progressive Web App (PWA)

**1. Instalar dependencias:**
```bash
npm install next-pwa
```

**2. Configurar PWA:** `next.config.js`
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development'
})

module.exports = withPWA({
  // ... existing config
})
```

**3. Crear manifest:** `public/manifest.json`
```json
{
  "name": "Personal Dashboard",
  "short_name": "Dashboard",
  "description": "Multi-user management system",
  "start_url": "/dashboard",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

**4. Actualizar layout:** `app/layout.tsx`
```typescript
export const metadata = {
  manifest: '/manifest.json',
  themeColor: '#3b82f6'
}
```

### Task 6: In-App Notifications

**Component:** `components/layout/NotificationBell.tsx`
```typescript
'use client'

import { Bell } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    // Load initial count
    loadUnreadCount()

    // Subscribe to realtime changes
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications'
      }, () => {
        loadUnreadCount()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const loadUnreadCount = async () => {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('read', false)

    setUnreadCount(count || 0)
  }

  return (
    <button className="relative">
      <Bell size={24} />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {unreadCount}
        </span>
      )}
    </button>
  )
}
```

---

## 📝 Semana 10: Testing & Production

### Task 1: Unit Tests con Vitest

**1. Instalar dependencias:**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

**2. Configurar Vitest:** `vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './test/setup.ts'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './')
    }
  }
})
```

**3. Setup file:** `test/setup.ts`
```typescript
import '@testing-library/jest-dom'
```

**4. Test ejemplo:** `actions/__tests__/gym.actions.test.ts`
```typescript
import { describe, test, expect, beforeEach } from 'vitest'
import { addWorkout } from '../gym.actions'

describe('Gym Actions', () => {
  beforeEach(() => {
    // Setup test database
  })

  test('should create workout with valid data', async () => {
    const formData = new FormData()
    formData.append('name', 'Test Workout')
    formData.append('date', new Date().toISOString())
    formData.append('duration_minutes', '60')

    const result = await addWorkout(formData)

    expect(result.error).toBeUndefined()
    expect(result.data).toHaveProperty('id')
    expect(result.data.name).toBe('Test Workout')
  })

  test('should reject negative duration', async () => {
    const formData = new FormData()
    formData.append('duration_minutes', '-10')

    const result = await addWorkout(formData)

    expect(result.error).toBeDefined()
  })
})
```

### Task 2: E2E Tests con Playwright

**1. Instalar Playwright:**
```bash
npm install -D @playwright/test
npx playwright install
```

**2. Configurar:** `playwright.config.ts`
```typescript
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure'
  },
  webServer: {
    command: 'npm run dev',
    port: 3000
  }
})
```

**3. Test ejemplo:** `e2e/auth.spec.ts`
```typescript
import { test, expect } from '@playwright/test'

test('should login successfully', async ({ page }) => {
  await page.goto('/login')

  await page.fill('input[type="email"]', 'malacaram807@gmail.com')
  await page.fill('input[type="password"]', 'My_badface27')
  await page.click('button[type="submit"]')

  await expect(page).toHaveURL('/dashboard')
  await expect(page.locator('h1')).toContainText('Dashboard')
})

test('should create workout', async ({ page }) => {
  // Login first
  await page.goto('/login')
  await page.fill('input[type="email"]', 'malacaram807@gmail.com')
  await page.fill('input[type="password"]', 'My_badface27')
  await page.click('button[type="submit"]')

  // Navigate to gym
  await page.click('a[href="/dashboard/gym"]')
  await page.click('text=New Workout')

  // Fill form
  await page.fill('input[name="name"]', 'Test Workout E2E')
  await page.fill('input[name="duration_minutes"]', '45')
  await page.click('button[type="submit"]')

  // Verify creation
  await expect(page.locator('text=Test Workout E2E')).toBeVisible()
})
```

### Task 3: Performance Optimization

**1. Lighthouse CI:**
```bash
npm install -D @lhci/cli
```

**2. Config:** `lighthouserc.js`
```javascript
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000/dashboard'],
      numberOfRuns: 3
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }]
      }
    }
  }
}
```

**3. Bundle analyzer:**
```bash
npm install -D @next/bundle-analyzer
```

```javascript
// next.config.js
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true'
})

module.exports = withBundleAnalyzer({
  // ... config
})
```

### Task 4: Security Audit

**Checklist:**
```bash
# 1. npm audit
npm audit --audit-level=moderate

# 2. Verificar variables de entorno expuestas
grep -r "process.env" app/ | grep -v "NEXT_PUBLIC"
# SERVICE_ROLE_KEY nunca debe estar en código cliente

# 3. Verificar RLS en todas las tablas
docker exec -i supabase-db psql -U postgres -c "
  SELECT tablename, rowsecurity
  FROM pg_tables
  WHERE schemaname = 'public' AND rowsecurity = false;
"
# Resultado esperado: 0 rows

# 4. Test CORS
curl -H "Origin: http://evil.com" http://localhost:3000/api/health
# No debe permitir acceso

# 5. Rate limiting test
for i in {1..100}; do
  curl http://localhost:3000/api/n8n/analyze-workout &
done
# Debe bloquear después de 10 requests
```

### Task 5: Grafana Dashboard

**Crear dashboard:** `shared/monitoring/dashboards/personal-dashboard.json`
```json
{
  "dashboard": {
    "title": "Personal Dashboard Metrics",
    "panels": [
      {
        "title": "Request Duration (p95)",
        "targets": [{
          "expr": "histogram_quantile(0.95, nextjs_http_request_duration_seconds_bucket)"
        }]
      },
      {
        "title": "Active Users",
        "targets": [{
          "expr": "count(count by (user_id) (nextjs_requests_total))"
        }]
      },
      {
        "title": "Database Queries/sec",
        "targets": [{
          "expr": "rate(pg_stat_database_xact_commit[5m])"
        }]
      },
      {
        "title": "Error Rate",
        "targets": [{
          "expr": "rate(nextjs_http_requests_total{status_code=~\"5..\"}[5m])"
        }]
      }
    ]
  }
}
```

### Task 6: Production Deployment

**1. Actualizar docker-compose para producción:**

`projects/personal-dashboard/docker-compose.prod.yml`:
```yaml
version: '3.8'

services:
  nextjs-dashboard:
    image: node:18-alpine
    container_name: nextjs-dashboard-prod
    restart: always
    working_dir: /app

    env_file:
      - ../ai-platform/.env

    ports:
      - "3003:3000"

    networks:
      - localai_default
      - monitoring

    environment:
      - NODE_ENV=production
      - TZ=America/Mexico_City
      - NEXT_PUBLIC_SUPABASE_URL=http://kong:8000
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${ANON_KEY}
      - SUPABASE_SERVICE_ROLE_KEY=${SERVICE_ROLE_KEY}

    volumes:
      - ./code/.next/standalone:/app
      - ./code/public:/app/public
      - ./code/.next/static:/app/.next/static

    command: node server.js

    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M

    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

networks:
  localai_default:
    external: true
  monitoring:
    external: true
```

**2. Build script:** `projects/personal-dashboard/build-production.sh`
```bash
#!/bin/bash
set -e

cd code

# Install dependencies
npm ci --production=false

# Build
npm run build

# Copy standalone
cp -r .next/standalone/* .next/standalone-build/

echo "Production build complete!"
```

**3. Deployment script:** `shared/scripts/deploy-dashboard.sh`
```bash
#!/bin/bash
set -e

echo "🚀 Deploying Personal Dashboard to Production..."

# 1. Backup
echo "📦 Creating backup..."
bash shared/scripts/backup-ai-platform.sh pre-dashboard-deploy

# 2. Build
echo "🔨 Building production..."
cd projects/personal-dashboard
bash build-production.sh

# 3. Stop current
echo "⏹️  Stopping current dashboard..."
docker-compose -f docker-compose.prod.yml down

# 4. Start new
echo "▶️  Starting new dashboard..."
docker-compose -f docker-compose.prod.yml up -d

# 5. Health check
echo "🔍 Waiting for health check..."
sleep 30
bash ../../shared/scripts/health-check.sh

echo "✅ Deployment complete!"
```

---

## ✅ Checklist de Completado de Fase 4

### Semana 9:
- [ ] Diseño responsive funcionando en mobile
- [ ] Dark mode toggle implementado
- [ ] Loading skeletons en todas las páginas
- [ ] Export CSV funcionando
- [ ] PWA manifest configurado
- [ ] Notificaciones in-app con realtime

### Semana 10:
- [ ] 20+ unit tests pasando
- [ ] E2E tests críticos pasando
- [ ] Lighthouse score > 90 en todas las categorías
- [ ] Security audit sin vulnerabilidades críticas
- [ ] Grafana dashboard configurado
- [ ] Production deployment exitoso

---

## 📊 Comandos de Validación Final

```bash
# 1. Run tests
npm run test
npm run test:e2e

# 2. Lighthouse
npm run build
lhci collect --url=http://localhost:3000/dashboard

# 3. Security audit
npm audit
docker exec -i supabase-db psql -U postgres -c "
  SELECT tablename FROM pg_tables
  WHERE schemaname = 'public' AND rowsecurity = false;
"

# 4. Production build
bash projects/personal-dashboard/build-production.sh

# 5. Deploy
bash shared/scripts/deploy-dashboard.sh

# 6. Verify production
curl http://localhost:3003/api/health
# Debe retornar { "status": "ok" }
```

---

## 📚 Referencias

- **Vitest:** https://vitest.dev/
- **Playwright:** https://playwright.dev/
- **Lighthouse:** https://developer.chrome.com/docs/lighthouse/
- **Next.js PWA:** https://github.com/shadowwalker/next-pwa

---

## 🎯 Próxima Fase

**Fase 5 - Post-Launch (Optional):**
Mejoras adicionales, analytics, mobile app, internacionalización.

Ver: `projects/personal-dashboard-project/fases/fase5-post-launch.md`

---

**Fecha de creación:** 2025-12-09
**Estado:** ⏳ PENDIENTE
**Fase siguiente:** Fase 5 - Post-Launch (Opcional)
