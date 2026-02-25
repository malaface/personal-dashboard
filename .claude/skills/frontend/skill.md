# frontend

---
**version**: 2.0.0
**last_updated**: 2026-02-18
**category**: Frontend Stack
**priority**: CRÍTICA
**dependencies**: next@16.0.8, react@19.2.1, typescript@5, tailwindcss@3.4, react-hook-form@7, zod@4
---

## 🎯 Cuando invocar esta skill

**Auto-invocar con keywords:** `'use client'`, `page.tsx`, `layout.tsx`, `Server Component`, `Client Component`, `shadcn`, `form`, `Tailwind`, `component`, `middleware`, `route handler`, `useForm`, `useState`, `className`

---

## 🚨 Reglas Críticas (NUNCA romper)

1. ❌ **NUNCA usar `'use client'` sin necesidad** — Solo cuando hay: event handlers, React hooks, browser APIs, third-party libs con hooks
2. ❌ **NUNCA importar Server Components dentro de Client Components** — pasar como `children` prop
3. ❌ **NUNCA exponer secrets/env vars en Client Components** — solo Server Components o API Routes
4. ❌ **NUNCA olvidar `'use server'` en Server Actions**
5. ❌ **NUNCA usar colores hardcodeados** — usar theme tokens: `text-foreground`, `bg-background`
6. ❌ **NUNCA crear forms sin react-hook-form + Zod**
7. ❌ **NUNCA usar clases conflictivas sin `cn()`** — `import { cn } from '@/lib/utils'`
8. ✅ **SIEMPRE mobile-first**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
9. ✅ **SIEMPRE dark mode classes**: `bg-white dark:bg-gray-900`
10. ✅ **SIEMPRE Suspense boundaries** en async Server Components

---

## 📦 Versiones actuales

| Package | Version |
|---------|---------|
| Next.js | 16.0.8 |
| React | 19.2.1 |
| TypeScript | ^5.9.3 |
| TailwindCSS | ^4.2.0 |
| react-hook-form | ^7.71.1 |
| Zod | ^4.3.6 |
| recharts | ^3.7.0 |

---

## 🏗️ Estructura del proyecto

```
code/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home (/)
│   ├── (auth)/             # Auth group: /login, /register
│   └── dashboard/
│       ├── layout.tsx      # Dashboard layout (DashboardShell)
│       ├── page.tsx        # /dashboard
│       ├── gym/page.tsx    # /dashboard/gym
│       ├── finance/page.tsx
│       ├── nutrition/page.tsx
│       └── family/page.tsx
├── components/
│   ├── ui/                 # shadcn/ui (editable, no en node_modules)
│   ├── layout/             # DashboardShell, Sidebar, MobileBottomNav
│   ├── gym/                # Feature components: WorkoutForm, WorkoutList...
│   ├── finance/
│   ├── nutrition/
│   └── family/
└── lib/
    ├── utils.ts            # cn() utility
    └── validations/        # Zod schemas compartidos
```

**Naming:** Componentes en PascalCase (`WorkoutForm.tsx`), hooks en camelCase (`useWorkouts.ts`)

---

## ⚛️ Server vs Client Components

### Server Component (default — preferir siempre)

```typescript
// app/dashboard/gym/page.tsx
import { prisma } from '@/lib/db/prisma'
import { requireAuth } from '@/lib/auth/utils'

export default async function GymPage() {
  const session = await requireAuth()
  const workouts = await prisma.workout.findMany({
    where: { userId: session.user.id },
    orderBy: { date: 'desc' },
    take: 10
  })
  return <WorkoutList workouts={workouts} />
}
```

### Client Component (solo cuando necesario)

```typescript
// components/gym/WorkoutForm.tsx
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { workoutSchema } from '@/lib/validations/gym'

export function WorkoutForm() {
  const form = useForm({ resolver: zodResolver(workoutSchema) })
  // ...
}
```

### Patrón composición (Server parent + Client child)

```typescript
// app/dashboard/gym/page.tsx (Server)
export default async function GymPage() {
  const workouts = await getWorkouts()  // fetch en servidor
  return (
    <div>
      <WorkoutList workouts={workouts} />  {/* puede ser Server */}
      <WorkoutForm />                       {/* Client: tiene estado */}
    </div>
  )
}
```

### Streaming con Suspense

```typescript
import { Suspense } from 'react'
import { WorkoutsSkeleton } from '@/components/skeletons'

export default function Page() {
  return (
    <div>
      <Suspense fallback={<WorkoutsSkeleton />}>
        <WorkoutsAsync />
      </Suspense>
    </div>
  )
}

async function WorkoutsAsync() {
  const workouts = await getWorkouts()
  return <WorkoutsList workouts={workouts} />
}
```

---

## 🎬 Server Actions

### Patrón completo

```typescript
// app/dashboard/gym/actions.ts
'use server'

import { prisma } from '@/lib/db/prisma'
import { requireAuth } from '@/lib/auth/utils'
import { workoutSchema } from '@/lib/validations/gym'
import { logAudit } from '@/lib/audit/logger'
import { revalidatePath } from 'next/cache'

export async function createWorkout(data: unknown) {
  // 1. Auth
  const session = await requireAuth()

  // 2. Validate
  const parsed = workoutSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  // 3. DB (siempre userId del session, nunca del cliente)
  const workout = await prisma.workout.create({
    data: { ...parsed.data, userId: session.user.id }
  })

  // 4. Audit
  await logAudit('workout.created', session.user.id, { workoutId: workout.id })

  // 5. Revalidate
  revalidatePath('/dashboard/gym')

  return { success: true, workout }
}
```

### En formulario con useFormState

```typescript
'use client'
import { useFormState, useFormStatus } from 'react-dom'
import { createWorkout } from '../actions'

export function WorkoutForm() {
  const [state, formAction] = useFormState(createWorkout, null)

  return (
    <form action={formAction}>
      <input name="name" required />
      <SubmitButton />
      {state?.error && <p className="text-destructive">{JSON.stringify(state.error)}</p>}
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return <button disabled={pending}>{pending ? 'Guardando...' : 'Guardar'}</button>
}
```

---

## 🎨 shadcn/ui

### Agregar componentes

```bash
cd /home/badfaceserverlap/personal-dashboard/code
npx shadcn@latest add button input form card dialog select textarea badge
```

### Componentes instalados (ubicación: `components/ui/`)

Los componentes se copian a `components/ui/` y son editables directamente.

### Form con shadcn + react-hook-form + Zod

```typescript
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const schema = z.object({
  name: z.string().min(3, 'Mínimo 3 caracteres'),
  duration: z.number().min(1).max(300)
})

type FormData = z.infer<typeof schema>

export function WorkoutForm({ onSubmit }: { onSubmit: (data: FormData) => void }) {
  const form = useForm<FormData>({ resolver: zodResolver(schema) })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Nombre del workout" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Guardar</Button>
      </form>
    </Form>
  )
}
```

---

## 🎨 TailwindCSS Patterns

### Responsive mobile-first

```typescript
// Layout grid responsive
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

// Texto responsive
<h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">

// Mostrar/ocultar por breakpoint
<nav className="hidden lg:block">  {/* Solo desktop */}
<nav className="lg:hidden">        {/* Solo mobile/tablet */}
```

### Dark mode

```typescript
// Siempre incluir ambas variantes
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
<Card className="border-gray-200 dark:border-gray-700">
```

### Theme tokens (preferir sobre colores directos)

```typescript
// ✅ BIEN - tokens semánticos
className="bg-background text-foreground border-border"
className="bg-primary text-primary-foreground"
className="bg-muted text-muted-foreground"
className="text-destructive"        // Errores
className="text-success"            // Éxito (si definido)
```

---

## 🛣️ Routing Patterns

### API Routes

```typescript
// app/api/workouts/route.ts
import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth/utils'
import { prisma } from '@/lib/db/prisma'

export async function GET() {
  try {
    const session = await requireAuth()
    const workouts = await prisma.workout.findMany({
      where: { userId: session.user.id }
    })
    return NextResponse.json({ success: true, data: workouts })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: Request) {
  const session = await requireAuth()
  const body = await request.json()
  // validate + create...
  return NextResponse.json({ success: true, data: workout }, { status: 201 })
}
```

### Middleware (proteger rutas)

```typescript
// middleware.ts
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  if (!req.auth && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
})

export const config = {
  matcher: ['/dashboard/:path*', '/api/(?!auth).*']
}
```

---

## 📱 Layout del Dashboard

```
DashboardShell (app/dashboard/layout.tsx)
├── Sidebar (hidden on mobile, visible lg+)
│   ├── Nav links: Gym, Finance, Nutrition, Family
│   └── User menu
├── MobileBottomNav (visible mobile only, hidden lg)
│   └── Nav icons bottom
└── main content area
    └── {children}
```

---

## 🔄 Caching

```typescript
// Force dynamic (no cache) — para data del usuario
export const dynamic = 'force-dynamic'

// ISR — para datos semi-estáticos
export const revalidate = 3600  // 1 hora

// En Server Action después de mutación
revalidatePath('/dashboard/gym')
revalidatePath('/dashboard/gym/[id]', 'page')
revalidateTag('workouts')
```

---

## 📊 Charts (recharts)

```typescript
// components/finance/SpendingChart.tsx
'use client'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export function SpendingChart({ data }: { data: ChartData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="amount" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  )
}
```

---

## ⚠️ Loading y Error States

```typescript
// app/dashboard/gym/loading.tsx
export default function Loading() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
      ))}
    </div>
  )
}

// app/dashboard/gym/error.tsx
'use client'
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="text-center py-8">
      <p className="text-destructive">{error.message}</p>
      <button onClick={reset} className="mt-4">Reintentar</button>
    </div>
  )
}
```
