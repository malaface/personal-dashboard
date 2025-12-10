# Fase 5: Post-Launch (Optional)

**Status:** ⏳ PENDIENTE (OPCIONAL)
**Duración Estimada:** Variable (según features seleccionadas)
**Prerrequisito:** Fase 4 ✅ Completada
**Arquitectura:** PostgreSQL + NextAuth.js + Prisma (NO Supabase)

---

## 🏗️ Contexto Arquitectónico

**IMPORTANTE:** Esta fase asume arquitectura **PostgreSQL + NextAuth + Prisma**.

**Base Architecture:**
- **Database:** PostgreSQL 15 (puerto 5433 en desarrollo)
- **Auth:** NextAuth.js v5 (JWT sessions)
- **ORM:** Prisma Client
- **Deployment:** Docker containers (dashboard-postgres, nextjs-dashboard)

**Post-Launch Considerations:**
- **Email:** n8n workflows con SMTP (NO Supabase email templates)
- **Push Notifications:** PWA Service Worker (NO Supabase Realtime)
- **Multi-tenancy:** Implementar en código con Prisma (NO RLS de Supabase)
- **API pública:** Next.js API routes con JWT auth (NO Supabase PostgREST)

**Referencias:**
- Fase 1: `fases/fase1-foundation.md` (arquitectura base)
- Fase 3: `fases/fase3-ai-integration.md` (n8n workflows)
- Plan completo: `/home/badfaceserverlap/.claude/plans/golden-floating-robin.md`

---

## 📋 Objetivos de la Fase

Mejoras y características adicionales para implementar según necesidad después del lanzamiento en producción.

### Features Opcionales:
1. Email notifications vía n8n
2. Push notifications (PWA)
3. Multi-tenancy / Organizaciones
4. Mobile app (React Native)
5. Internationalization (i18n)
6. Advanced analytics
7. Data migration tools
8. Backup encryption
9. Advanced AI features
10. API pública

---

## 🚀 Prompt de Inicio para Nueva Conversación

```
Hola, voy a iniciar Fase 5 del proyecto Personal Dashboard (Post-Launch Features).

CONTEXTO:
- Fases 0-4 completadas
- Dashboard en producción y funcionando
- Arquitectura: PostgreSQL + NextAuth + Prisma (NO Supabase)
- Stack: Next.js 15, NextAuth.js, Prisma, PostgreSQL 15

OBJETIVO FASE 5 (OPCIONAL):
Implementar features adicionales según necesidad:
- Email notifications vía n8n + SMTP
- Push notifications (PWA)
- Multi-tenancy con Prisma
- Advanced AI features
- API pública con JWT auth

IMPORTANTE:
- Todas las features usan PostgreSQL + Prisma (NO Supabase)
- Email via n8n workflows (NO Supabase email templates)
- Push notifications con Service Worker (NO Supabase Realtime)
- Multi-tenancy en código (NO RLS de Supabase)

Por favor lee:
- @fases/fase5-post-launch.md (este archivo)
- @fases/fase1-foundation.md (arquitectura base)
- @fases/fase3-ai-integration.md (n8n workflows)
- @/home/badfaceserverlap/.claude/plans/golden-floating-robin.md (plan completo)

Selecciona features a implementar antes de empezar.
```

---

## 🚀 Feature 1: Email Notifications

### Implementación:

**1. n8n workflow:** `email-notifications`
- Trigger: Poll notifications table cada 5 minutos
- Filter: unread notifications con email_sent = false
- Get user email
- Send email via SMTP
- Update notification.email_sent = true

**2. Agregar columna a tabla:**
```sql
ALTER TABLE public.notifications
ADD COLUMN email_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN email_sent_at TIMESTAMP;
```

**3. SMTP config en n8n:**
```javascript
{
  "host": "smtp.gmail.com",
  "port": 587,
  "secure": false,
  "auth": {
    "user": process.env.EMAIL_USER,
    "pass": process.env.EMAIL_APP_PASSWORD
  }
}
```

---

## 🚀 Feature 2: Push Notifications (PWA)

### Implementación:

**1. Service Worker:** `public/sw.js`
```javascript
self.addEventListener('push', function(event) {
  const data = event.data.json()

  const options = {
    body: data.message,
    icon: '/icon-192.png',
    badge: '/badge.png',
    data: {
      url: data.action_url
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

self.addEventListener('notificationclick', function(event) {
  event.notification.close()
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  )
})
```

**2. Subscribe client:** `lib/push-notifications.ts`
```typescript
export async function subscribeToPush() {
  if (!('serviceWorker' in navigator)) return

  const registration = await navigator.serviceWorker.ready

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  })

  // Save subscription to database
  await fetch('/api/notifications/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(subscription)
  })
}
```

**3. Server-side push:** `lib/send-push.ts`
```typescript
import webpush from 'web-push'

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function sendPushNotification(userId: string, payload: any) {
  // Get user's push subscriptions
  const { data: subscriptions } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('user_id', userId)

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(sub.subscription, JSON.stringify(payload))
    } catch (error) {
      console.error('Push notification error:', error)
    }
  }
}
```

---

## 🚀 Feature 3: Multi-Tenancy / Organizaciones

### Schema:

```sql
-- Organizations table
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Organization members
CREATE TABLE public.organization_members (
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  joined_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (organization_id, user_id)
);

-- Add organization_id to existing tables
ALTER TABLE public.workouts ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.transactions ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.meals ADD COLUMN organization_id UUID REFERENCES public.organizations(id);
ALTER TABLE public.family_members ADD COLUMN organization_id UUID REFERENCES public.organizations(id);

-- RLS policies for organization data
CREATE POLICY "Members can view org data"
  ON public.workouts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_id = workouts.organization_id
        AND user_id = auth.uid()
    )
  );

-- Similar policies for other tables...
```

---

## 🚀 Feature 4: Mobile App (React Native)

### Setup:

```bash
# Initialize React Native project
npx react-native init PersonalDashboardMobile
cd PersonalDashboardMobile

# Install dependencies
npm install @supabase/supabase-js
npm install @react-navigation/native @react-navigation/stack
npm install react-native-reanimated react-native-gesture-handler
npm install react-native-chart-kit
```

### Reutilizar lógica:

**1. API client:** `src/lib/api.ts`
```typescript
const API_URL = 'http://192.168.1.100:3003' // Local network

export async function getWorkouts(token: string) {
  const response = await fetch(`${API_URL}/api/workouts`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  return response.json()
}

// Similar functions for other modules...
```

**2. Auth screen:** `src/screens/LoginScreen.tsx`
```typescript
import { supabase } from '../lib/supabase'

export function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (data.session) {
      navigation.navigate('Dashboard')
    }
  }

  return (
    // React Native UI components
  )
}
```

---

## 🚀 Feature 5: Internationalization (i18n)

### Implementación:

**1. Install:**
```bash
npm install next-i18next react-i18next i18next
```

**2. Config:** `next-i18next.config.js`
```javascript
module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'fr'],
  }
}
```

**3. Translations:** `public/locales/es/common.json`
```json
{
  "dashboard": {
    "title": "Panel de Control",
    "gym": "Gimnasio",
    "finance": "Finanzas",
    "nutrition": "Nutrición",
    "family": "Familia"
  },
  "workouts": {
    "title": "Entrenamientos",
    "add": "Agregar Entrenamiento",
    "name": "Nombre",
    "date": "Fecha",
    "duration": "Duración (minutos)"
  }
}
```

**4. Usage:**
```typescript
import { useTranslation } from 'next-i18next'

export default function GymPage() {
  const { t } = useTranslation('common')

  return (
    <div>
      <h1>{t('workouts.title')}</h1>
      <button>{t('workouts.add')}</button>
    </div>
  )
}
```

---

## 🚀 Feature 6: Advanced Analytics

### Implementation:

**1. Analytics dashboard:** `app/(dashboard)/dashboard/analytics/page.tsx`
```typescript
import { LineChart, BarChart, PieChart } from 'recharts'

export default async function AnalyticsPage() {
  const data = await getAnalyticsData()

  return (
    <div className="space-y-8">
      <section>
        <h2>Workout Trends (6 months)</h2>
        <LineChart data={data.workoutTrends} />
      </section>

      <section>
        <h2>Spending by Category</h2>
        <PieChart data={data.spendingByCategory} />
      </section>

      <section>
        <h2>Nutrition Progress</h2>
        <BarChart data={data.nutritionProgress} />
      </section>

      <section>
        <h2>Family Time Distribution</h2>
        <PieChart data={data.familyTime} />
      </section>
    </div>
  )
}
```

**2. Analytics queries:** `actions/analytics.actions.ts`
```typescript
'use server'

export async function getAnalyticsData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Workout trends
  const { data: workoutTrends } = await supabase.rpc('get_workout_trends', {
    p_user_id: user.id,
    p_months: 6
  })

  // Spending by category
  const { data: spendingByCategory } = await supabase.rpc('get_spending_by_category', {
    p_user_id: user.id,
    p_year: new Date().getFullYear()
  })

  return {
    workoutTrends,
    spendingByCategory,
    // ... more analytics
  }
}
```

**3. Database functions:**
```sql
CREATE OR REPLACE FUNCTION get_workout_trends(p_user_id UUID, p_months INTEGER)
RETURNS TABLE(month DATE, workout_count INTEGER, avg_duration INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE_TRUNC('month', date)::DATE AS month,
    COUNT(*)::INTEGER AS workout_count,
    AVG(duration_minutes)::INTEGER AS avg_duration
  FROM public.workouts
  WHERE user_id = p_user_id
    AND date >= NOW() - INTERVAL '1 month' * p_months
  GROUP BY DATE_TRUNC('month', date)
  ORDER BY month;
END;
$$ LANGUAGE plpgsql;
```

---

## 🚀 Feature 7: Data Migration Tools

### Implementation:

**Script:** `scripts/migrate-from-csv.ts`
```typescript
import fs from 'fs'
import csv from 'csv-parser'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function migrateTransactions(filePath: string, userId: string) {
  const transactions: any[] = []

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        transactions.push({
          user_id: userId,
          date: new Date(row.date).toISOString(),
          amount: parseFloat(row.amount),
          category: row.category,
          subcategory: row.subcategory || null,
          description: row.description || null,
          tags: row.tags ? row.tags.split(',') : []
        })
      })
      .on('end', async () => {
        // Batch insert in chunks of 100
        for (let i = 0; i < transactions.length; i += 100) {
          const chunk = transactions.slice(i, i + 100)

          const { error } = await supabase
            .from('transactions')
            .insert(chunk)

          if (error) {
            console.error(`Error at batch ${i}:`, error)
            reject(error)
            return
          }

          console.log(`Migrated ${i + chunk.length}/${transactions.length}`)
        }

        resolve(transactions.length)
      })
  })
}

// Usage:
// node scripts/migrate-from-csv.ts --file=data/transactions.csv --user=uuid
```

---

## 🚀 Feature 8: Backup Encryption

### Implementation:

**Script:** `shared/scripts/backup-dashboard-encrypted.sh`
```bash
#!/bin/bash
set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="shared/backups/dashboard"
BACKUP_NAME="dashboard_${TIMESTAMP}"

# Create backup directory
mkdir -p "${BACKUP_DIR}"

# Backup database
docker exec supabase-db pg_dump -U postgres \
  --table='public.workouts' \
  --table='public.transactions' \
  --table='public.meals' \
  --table='public.family_members' \
  --format=custom \
  --file="/tmp/${BACKUP_NAME}.dump"

# Copy from container
docker cp supabase-db:/tmp/${BACKUP_NAME}.dump "${BACKUP_DIR}/${BACKUP_NAME}.dump"

# Encrypt with GPG
gpg --symmetric --cipher-algo AES256 \
  --passphrase="${BACKUP_ENCRYPTION_KEY}" \
  --batch --yes \
  "${BACKUP_DIR}/${BACKUP_NAME}.dump"

# Remove unencrypted
rm "${BACKUP_DIR}/${BACKUP_NAME}.dump"

# Cleanup old encrypted backups (keep last 30 days)
find "${BACKUP_DIR}" -name "*.dump.gpg" -mtime +30 -delete

echo "✅ Encrypted backup created: ${BACKUP_NAME}.dump.gpg"
```

**Restore:**
```bash
#!/bin/bash
BACKUP_FILE=$1

# Decrypt
gpg --decrypt --passphrase="${BACKUP_ENCRYPTION_KEY}" \
  --batch --yes \
  "${BACKUP_FILE}" > /tmp/dashboard_restore.dump

# Restore
docker exec -i supabase-db pg_restore -U postgres \
  --clean --if-exists \
  /tmp/dashboard_restore.dump

rm /tmp/dashboard_restore.dump
echo "✅ Restore complete"
```

---

## 🚀 Feature 9: Advanced AI Features

### 1. Predictive Analytics

**n8n workflow:** `predict-workout-performance`
- Input: user workout history
- Process: Train simple ML model (linear regression)
- Output: Predicted max weight for next month

### 2. Smart Recommendations

**API Route:** `app/api/ai/recommendations/route.ts`
```typescript
export async function POST(request: NextRequest) {
  const { module } = await request.json()

  // Get user data
  const userData = await getUserDataForAI(user.id, module)

  // Call Flowise with context
  const response = await fetch(`${process.env.FLOWISE_BASE_URL}/api/v1/prediction/${chatflowId}`, {
    method: 'POST',
    body: JSON.stringify({
      question: `Based on my ${module} data, what are your top 3 recommendations?`,
      overrideConfig: {
        context: JSON.stringify(userData)
      }
    })
  })

  return NextResponse.json(await response.json())
}
```

### 3. Voice Commands (experimental)

```typescript
'use client'

import { useEffect, useState } from 'react'

export function VoiceCommands() {
  const [listening, setListening] = useState(false)

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) return

    const recognition = new webkitSpeechRecognition()
    recognition.continuous = true
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript

      // Parse commands
      if (transcript.includes('add workout')) {
        handleAddWorkout()
      } else if (transcript.includes('show finance')) {
        router.push('/dashboard/finance')
      }
    }

    if (listening) recognition.start()
    else recognition.stop()

    return () => recognition.stop()
  }, [listening])

  return (
    <button onClick={() => setListening(!listening)}>
      {listening ? 'Stop' : 'Start'} Voice Commands
    </button>
  )
}
```

---

## 🚀 Feature 10: API Pública

### Implementation:

**1. API Keys table:**
```sql
CREATE TABLE public.api_keys (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  last_used_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_api_keys_user ON public.api_keys(user_id);
CREATE INDEX idx_api_keys_hash ON public.api_keys(key_hash);
```

**2. API middleware:** `app/api/v1/middleware.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function validateAPIKey(request: NextRequest) {
  const apiKey = request.headers.get('X-API-Key')

  if (!apiKey) {
    return NextResponse.json({ error: 'API key required' }, { status: 401 })
  }

  const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex')

  const { data: apiKeyData } = await supabase
    .from('api_keys')
    .select('user_id, expires_at')
    .eq('key_hash', keyHash)
    .single()

  if (!apiKeyData) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
  }

  if (apiKeyData.expires_at && new Date(apiKeyData.expires_at) < new Date()) {
    return NextResponse.json({ error: 'API key expired' }, { status: 401 })
  }

  // Update last_used_at
  await supabase
    .from('api_keys')
    .update({ last_used_at: new Date().toISOString() })
    .eq('key_hash', keyHash)

  return apiKeyData.user_id
}
```

**3. Public API endpoints:**
```typescript
// app/api/v1/workouts/route.ts
export async function GET(request: NextRequest) {
  const userId = await validateAPIKey(request)
  if (userId instanceof NextResponse) return userId

  const { data } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(50)

  return NextResponse.json({ data })
}

export async function POST(request: NextRequest) {
  const userId = await validateAPIKey(request)
  if (userId instanceof NextResponse) return userId

  const body = await request.json()

  // Validate with Zod
  const validation = workoutSchema.safeParse(body)
  if (!validation.success) {
    return NextResponse.json({ error: validation.error }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('workouts')
    .insert({ ...validation.data, user_id: userId })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data })
}
```

**4. API documentation:** `app/api-docs/page.tsx`
```typescript
export default function APIDocsPage() {
  return (
    <div className="prose">
      <h1>Personal Dashboard API</h1>

      <h2>Authentication</h2>
      <p>Include your API key in the X-API-Key header:</p>
      <pre>X-API-Key: your_api_key_here</pre>

      <h2>Endpoints</h2>

      <h3>GET /api/v1/workouts</h3>
      <p>Get your workouts</p>
      <pre>{`curl -H "X-API-Key: YOUR_KEY" http://localhost:3003/api/v1/workouts`}</pre>

      <h3>POST /api/v1/workouts</h3>
      <p>Create a workout</p>
      <pre>{`
curl -X POST \\
  -H "X-API-Key: YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"name":"Test","date":"2025-12-09T10:00:00Z"}' \\
  http://localhost:3003/api/v1/workouts
      `}</pre>
    </div>
  )
}
```

---

## 📊 Feature Priority Matrix

| Feature | Value | Effort | Priority |
|---------|-------|--------|----------|
| Email notifications | HIGH | LOW | 🟢 HIGH |
| Push notifications | MEDIUM | MEDIUM | 🟡 MEDIUM |
| Multi-tenancy | HIGH | HIGH | 🟡 MEDIUM |
| Mobile app | HIGH | VERY HIGH | 🔴 LOW |
| i18n | MEDIUM | MEDIUM | 🟡 MEDIUM |
| Advanced analytics | HIGH | MEDIUM | 🟢 HIGH |
| Data migration | MEDIUM | LOW | 🟡 MEDIUM |
| Backup encryption | HIGH | LOW | 🟢 HIGH |
| Advanced AI | MEDIUM | HIGH | 🔴 LOW |
| Public API | LOW | MEDIUM | 🔴 LOW |

---

## ✅ Recomendaciones

**Implementar primero:**
1. ✅ Email notifications (quick win)
2. ✅ Backup encryption (seguridad)
3. ✅ Advanced analytics (valor inmediato)
4. ✅ Data migration tools (utilidad)

**Implementar después:**
5. Push notifications
6. i18n (si hay usuarios internacionales)
7. Multi-tenancy (si hay demanda familiar)

**Evaluar necesidad:**
8. Mobile app (solo si hay alta demanda)
9. Advanced AI features (experimental)
10. Public API (solo si hay uso externo)

---

## 📚 Referencias

- **React Native:** https://reactnative.dev/
- **Web Push:** https://web.dev/push-notifications/
- **i18next:** https://www.i18next.com/
- **GPG Encryption:** https://gnupg.org/

---

**Fecha de creación:** 2025-12-09
**Estado:** ⏳ PENDIENTE (OPCIONAL)
**Implementar según necesidad después del lanzamiento**
