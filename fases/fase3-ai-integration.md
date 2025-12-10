# Fase 3: AI Integration (Weeks 7-8)

**Status:** ⏳ PENDIENTE
**Duración Estimada:** 2 semanas (80-100 horas)
**Prerrequisito:** Fase 2 ✅ Completada
**Arquitectura:** PostgreSQL + NextAuth.js + Prisma + AI Services

---

## 🏗️ Contexto Arquitectónico

**IMPORTANTE:** Esta fase asume arquitectura **PostgreSQL + NextAuth + Prisma**.

**AI Services Stack:**
- **n8n:** Automation workflows (puerto 5678)
- **Flowise:** AI Chatflows (puerto 3001)
- **Qdrant:** Vector database (puerto 6333)
- **Redis:** Caching (puerto 6379)

**Integración con Dashboard:**
- **Auth:** NextAuth.js (NO Supabase Auth)
- **Database:** PostgreSQL + Prisma (NO Supabase DB)
- **API Routes:** Next.js API routes con NextAuth session
- **Tokens:** N8N_API_TOKEN, QDRANT_API_KEY (desde .env)

**Diferencias vs Documentación Original:**
- ❌ NO usar Supabase createClient
- ✅ Usar `requireAuth()` para autenticación
- ✅ Usar Prisma para queries de datos
- ✅ API routes usan NextAuth session

**Referencia:**
- Fase 1: `fases/fase1-foundation.md` (PostgreSQL + NextAuth setup)
- Plan completo: `/home/badfaceserverlap/.claude/plans/golden-floating-robin.md`

---

## 📋 Objetivos de la Fase

Integrar servicios de AI para análisis inteligente de datos, chatbot asistente y búsqueda vectorial.

### Semana 7 - n8n Workflows
- Crear workflows para análisis de progreso de gym
- Workflow para recordatorios de finanzas
- Workflow para sugerencias nutricionales
- Workflow para recordatorios familiares
- Autenticación con N8N_API_TOKEN

### Semana 8 - Flowise Chatbot & Qdrant Search
- Integrar Flowise chatflow como asistente personal
- Implementar búsqueda vectorial con Qdrant
- Indexar workouts, transactions y meals en Qdrant
- Chat interface en el dashboard

---

## ✅ Pre-Requisitos (VALIDAR ANTES DE EMPEZAR)

```bash
# 1. Fase 2 completada - 4 módulos funcionando
ls -l projects/personal-dashboard-project/code/app/dashboard/
# Debe tener: layout.tsx, page.tsx, workouts/, finance/, nutrition/, family/

# 2. n8n accesible
curl -I http://localhost:5678
# Debe retornar HTTP 200 (o redirect)

# 3. Flowise accesible con auth
curl -I -u malaface03:My_badface*03 http://localhost:3001
# Debe retornar HTTP 200

# 4. Qdrant accesible con API key
curl -H "api-key: d06abab773da23dadb49d2a3bc0a46bef210f9b8c2a37339654b3b5034bccc94" \
  http://localhost:6333/collections
# Debe retornar JSON con lista de colecciones

# 5. Redis accesible
docker exec -it dashboard-redis redis-cli -a <REDIS_PASSWORD> ping
# Esperado: PONG

# 6. Tokens configurados en .env
cd projects/personal-dashboard-project/code
grep -E "N8N_BASE_URL|FLOWISE_BASE_URL|QDRANT_URL|QDRANT_API_KEY|N8N_API_TOKEN" .env.local
# Debe mostrar todas las variables

# 7. PostgreSQL con datos de prueba
psql -h localhost -p 5433 -U dashboard_user -d dashboard -c "
  SELECT
    (SELECT COUNT(*) FROM workouts) as workouts,
    (SELECT COUNT(*) FROM transactions) as transactions,
    (SELECT COUNT(*) FROM meals) as meals;
"
# Esperado: al menos algunos registros en cada tabla
```

---

## 🚀 Prompt de Inicio para Nueva Conversación

```
Hola, voy a iniciar Fase 3 del proyecto Personal Dashboard (AI Integration).

CONTEXTO:
- Fases 0, 1 y 2 completadas
- Arquitectura: PostgreSQL + NextAuth + Prisma (NO Supabase)
- 4 módulos funcionando: Gym, Finance, Nutrition, Family
- PostgreSQL en puerto 5433 con datos de prueba
- Servicios AI disponibles: n8n (5678), Flowise (3001), Qdrant (6333), Redis (6379)

STACK TECNOLÓGICO:
- Dashboard: Next.js 15 + NextAuth + Prisma
- AI Services: n8n 1.19.4, Flowise 1.4.12, Qdrant 1.7.4, Redis 7.2.3
- Auth: NextAuth.js (JWT sessions)
- Database: PostgreSQL 15 (puerto 5433)

OBJETIVO FASE 3:
- Semana 7: Crear n8n workflows para análisis y recordatorios
- Semana 8: Integrar Flowise chatbot y Qdrant vector search

IMPORTANTE:
- API routes usan requireAuth() de NextAuth
- Queries usan Prisma Client (NO Supabase)
- Tokens en .env.local: N8N_API_TOKEN, QDRANT_API_KEY

Por favor lee:
- @fases/fase3-ai-integration.md (este archivo)
- @fases/fase1-foundation.md (arquitectura base)
- @/home/badfaceserverlap/.claude/plans/golden-floating-robin.md (plan completo)

Valida pre-requisitos antes de empezar.
```

---

## 📝 Semana 7: n8n Workflows

### Workflows a Crear en n8n:

**1. Gym Progress Analyzer** (`analyze-workout-progress`)
- **Trigger:** Webhook POST
- **Input:** user_id, exercise_name, period (week/month)
- **Process:**
  - Query workout_progress table
  - Calcular tendencias (peso máximo, volumen)
  - Generar recomendaciones de progreso
- **Output:** JSON con análisis y recomendaciones

**2. Finance Budget Alert** (`finance-budget-alert`)
- **Trigger:** Scheduled (diariamente)
- **Process:**
  - Query transactions del mes actual
  - Comparar con budgets
  - Identificar categorías cerca del límite (>80%)
  - Crear notification en tabla notifications
- **Output:** Notificaciones creadas

**3. Nutrition Suggestions** (`nutrition-suggestions`)
- **Trigger:** Webhook POST
- **Input:** user_id, date
- **Process:**
  - Query meals del día
  - Comparar con nutrition_goals
  - Calcular macros faltantes
  - Generar sugerencias de comidas
- **Output:** JSON con sugerencias

**4. Family Reminders** (`family-reminders`)
- **Trigger:** Scheduled (diariamente)
- **Process:**
  - Query events próximos (7 días)
  - Query reminders pendientes
  - Crear notifications
  - Alertar cumpleaños próximos
- **Output:** Notifications creadas

### API Routes del Dashboard para n8n:

**Archivos a crear:**

**1. `app/api/n8n/analyze-workout/route.ts`:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { exercise_name, period } = await request.json()

  // Call n8n webhook
  const response = await fetch('http://n8n:5678/webhook/analyze-workout-progress', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.N8N_API_TOKEN}`
    },
    body: JSON.stringify({
      user_id: user.id,
      exercise_name,
      period
    })
  })

  const analysis = await response.json()
  return NextResponse.json(analysis)
}
```

**2. `app/api/n8n/nutrition-suggestions/route.ts`** - Similar pattern

**3. `app/api/n8n/trigger-budget-check/route.ts`** - Trigger manual de workflow

### Validar Semana 7:
```bash
# Test webhook de n8n
curl -X POST http://localhost:3000/api/n8n/analyze-workout \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=..." \
  -d '{"exercise_name":"Bench Press","period":"month"}'
# Debe retornar análisis de progreso
```

---

## 📝 Semana 8: Flowise Chatbot & Qdrant Search

### 1. Configurar Qdrant Collections

**Script de inicialización:** `scripts/init-qdrant-collections.ts`

```typescript
import { QdrantClient } from '@qdrant/js-client-rest'

const client = new QdrantClient({
  url: 'http://qdrant:6333',
  apiKey: process.env.QDRANT_API_KEY
})

async function initCollections() {
  // Collection for workouts
  await client.createCollection('workouts', {
    vectors: {
      size: 384, // all-MiniLM-L6-v2 embedding size
      distance: 'Cosine'
    }
  })

  // Collection for transactions
  await client.createCollection('transactions', {
    vectors: {
      size: 384,
      distance: 'Cosine'
    }
  })

  // Collection for meals
  await client.createCollection('meals', {
    vectors: {
      size: 384,
      distance: 'Cosine'
    }
  })

  console.log('Collections created successfully')
}

initCollections()
```

### 2. Indexar Datos en Qdrant

**Server Action:** `actions/qdrant.actions.ts`

```typescript
'use server'

import { QdrantClient } from '@qdrant/js-client-rest'
import { createClient } from '@/lib/supabase/server'

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL!,
  apiKey: process.env.QDRANT_API_KEY!
})

export async function indexWorkout(workoutId: string) {
  const supabase = await createClient()

  // Get workout with exercises
  const { data: workout } = await supabase
    .from('workouts')
    .select('*, exercises(*)')
    .eq('id', workoutId)
    .single()

  if (!workout) return { error: 'Workout not found' }

  // Generate embedding (using n8n workflow or local model)
  const text = `Workout: ${workout.name}. Exercises: ${workout.exercises.map(e => e.name).join(', ')}`
  const embedding = await generateEmbedding(text)

  // Index in Qdrant
  await qdrant.upsert('workouts', {
    wait: true,
    points: [
      {
        id: workoutId,
        vector: embedding,
        payload: {
          user_id: workout.user_id,
          name: workout.name,
          date: workout.date,
          exercises: workout.exercises
        }
      }
    ]
  })

  return { success: true }
}

async function generateEmbedding(text: string): Promise<number[]> {
  // Call n8n workflow for embedding generation
  const response = await fetch('http://n8n:5678/webhook/generate-embedding', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.N8N_API_TOKEN}`
    },
    body: JSON.stringify({ text })
  })

  const { embedding } = await response.json()
  return embedding
}
```

### 3. Integrar Flowise Chatbot

**Component:** `components/chat/FloiwseChatbot.tsx`

```typescript
'use client'

import { useState } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function FlowiseChatbot() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/flowise/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input })
      })

      const data = await response.json()
      const assistantMessage: Message = { role: 'assistant', content: data.text }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-white rounded-lg shadow-xl flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-bold">AI Assistant</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`rounded-lg px-4 py-2 max-w-[80%] ${
              msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && <div className="text-gray-500">Thinking...</div>}
      </div>

      <div className="p-4 border-t">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask anything..."
          className="w-full border rounded-lg px-4 py-2"
        />
      </div>
    </div>
  )
}
```

**API Route:** `app/api/flowise/chat/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { question } = await request.json()

  // Get user context (recent workouts, transactions, etc.)
  const context = await getUserContext(user.id)

  // Call Flowise
  const chatflowId = process.env.FLOWISE_CHATFLOW_ID!
  const response = await fetch(
    `${process.env.FLOWISE_BASE_URL}/api/v1/prediction/${chatflowId}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        overrideConfig: {
          sessionId: user.id,
          context: context
        }
      }),
      auth: {
        username: process.env.FLOWISE_USERNAME!,
        password: process.env.FLOWISE_PASSWORD!
      }
    }
  )

  const data = await response.json()
  return NextResponse.json(data)
}

async function getUserContext(userId: string) {
  // Query recent data to provide context to chatbot
  // ... implementation
}
```

### Validar Semana 8:
```bash
# 1. Verificar colecciones en Qdrant
curl -H "api-key: ${QDRANT_API_KEY}" http://localhost:6333/collections
# Debe mostrar: workouts, transactions, meals

# 2. Test search vectorial
curl -X POST http://localhost:3000/api/qdrant/search \
  -H "Content-Type: application/json" \
  -d '{"query":"bench press workouts","collection":"workouts"}'
# Debe retornar workouts relevantes

# 3. Test chatbot
curl -X POST http://localhost:3000/api/flowise/chat \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=..." \
  -d '{"question":"What was my total spending this month?"}'
# Debe retornar respuesta del chatbot
```

---

## ✅ Checklist de Completado de Fase 3

### Semana 7:
- [ ] 4 n8n workflows creados y probados
- [ ] API routes para n8n implementadas
- [ ] Autenticación con N8N_API_TOKEN funcionando
- [ ] Notificaciones automáticas creándose

### Semana 8:
- [ ] 3 colecciones Qdrant creadas
- [ ] Datos indexados en Qdrant
- [ ] Búsqueda vectorial funcionando
- [ ] Flowise chatbot integrado
- [ ] Chat interface en dashboard

---

## 📊 Comandos de Validación Final

```bash
# 1. Verificar n8n workflows activos
curl http://localhost:5678/rest/workflows | jq '.data[] | {name, active}'
# Debe mostrar 4 workflows activos

# 2. Verificar Qdrant collections con datos
curl -H "api-key: ${QDRANT_API_KEY}" \
  http://localhost:6333/collections/workouts | jq '.result.points_count'
# Debe mostrar count > 0

# 3. Test end-to-end de chatbot
# Abrir http://localhost:3000/dashboard
# Click en chatbot, enviar mensaje
# Debe responder con información contextual del usuario
```

---

## 🔄 Rollback de Fase 3

```bash
# Eliminar colecciones de Qdrant
curl -X DELETE -H "api-key: ${QDRANT_API_KEY}" \
  http://localhost:6333/collections/workouts

curl -X DELETE -H "api-key: ${QDRANT_API_KEY}" \
  http://localhost:6333/collections/transactions

curl -X DELETE -H "api-key: ${QDRANT_API_KEY}" \
  http://localhost:6333/collections/meals

# Desactivar workflows en n8n (via UI)
# Restaurar código desde git commit de Fase 2
```

---

## 📚 Referencias

- **Qdrant Documentation:** https://qdrant.tech/documentation/
- **Flowise Documentation:** https://docs.flowiseai.com/
- **n8n Documentation:** https://docs.n8n.io/

---

## 🎯 Próxima Fase

**Fase 4 - Polish & Deploy (Semanas 9-10):**
UI/UX refinement, testing, performance optimization y deployment a producción.

Ver: `projects/personal-dashboard-project/fases/fase4-polish-deploy.md`

---

**Fecha de creación:** 2025-12-09
**Estado:** ⏳ PENDIENTE
**Fase siguiente:** Fase 4 - Polish & Deploy
