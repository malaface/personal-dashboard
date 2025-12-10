# nextjs-app-router-patterns

---
**version**: 1.0.0
**last_updated**: 2025-12-09
**category**: Frontend Stack
**priority**: CRÍTICA
**dependencies**: next@15.0.3, react@18.3.1, typescript@5.3.3
---

## 📖 Overview

Complete Next.js 15 App Router patterns covering Server Components, Client Components, Server Actions, routing, caching strategies, and performance optimization for the Personal Dashboard project.

---

## 🎯 When to Invoke This Skill

**Auto-invoke when detecting**:
- Keywords: Server Component, Client Component, route handler, middleware, Server Action
- Code: 'use client', 'use server', app/, page.tsx, layout.tsx
- Phrases: "Next.js component", "API route", "fetch data", "form submission"

**Manual invoke when**:
- Creating new pages or components
- Implementing data fetching
- Building forms with Server Actions
- Optimizing performance
- Troubleshooting rendering issues

---

## 📦 Versions

- **Next.js**: `15.0.3` (latest stable)
- **React**: `18.3.1`
- **TypeScript**: `5.3.3`
- **Zod**: `3.22.4` (validation)

---

## 🚨 Critical Rules (NEVER Break)

### Server vs Client Components

1. ❌ **NUNCA usar 'use client' a menos que sea absolutamente necesario**
   ```typescript
   // ❌ MAL - no necesitas 'use client' solo para mostrar data
   'use client'
   export default function UserProfile({ user }) {
     return <div>{user.name}</div>
   }

   // ✅ BIEN - Server Component por defecto
   export default function UserProfile({ user }) {
     return <div>{user.name}</div>
   }
   ```

   **Solo usa 'use client' para**:
   - Event handlers (onClick, onChange, etc.)
   - React hooks (useState, useEffect, etc.)
   - Browser APIs (localStorage, window, etc.)
   - Third-party libraries que usan hooks

2. ❌ **NUNCA importar Server Components en Client Components**
   ```typescript
   // ❌ MAL
   'use client'
   import ServerComponent from './ServerComponent' // No funciona

   // ✅ BIEN - pasar como children
   // layout.tsx (Server Component)
   export default function Layout({ children }) {
     return (
       <div>
         <ClientSidebar>
           {children} {/* Server Component pasado como children */}
         </ClientSidebar>
       </div>
     )
   }
   ```

3. ❌ **NUNCA usar variables de entorno secretas en Client Components**
   ```typescript
   // ❌ MAL - expone secreto al cliente
   'use client'
   const apiKey = process.env.SECRET_API_KEY

   // ✅ BIEN - solo en Server Component o API Route
   // app/api/data/route.ts
   const apiKey = process.env.SECRET_API_KEY
   ```

4. ❌ **NUNCA olvidar 'use server' en Server Actions**
   ```typescript
   // ❌ MAL - no funcionará
   async function submitForm(data) {
     await db.insert(data)
   }

   // ✅ BIEN
   'use server'
   async function submitForm(data) {
     await db.insert(data)
   }
   ```

5. ❌ **NUNCA usar localStorage/sessionStorage en Server Components**
   ```typescript
   // ❌ MAL - error en servidor
   export default function Page() {
     const token = localStorage.getItem('token')
   }

   // ✅ BIEN - en Client Component
   'use client'
   export default function Page() {
     const token = localStorage.getItem('token')
   }
   ```

6. ❌ **NUNCA hacer fetch sin considerar caching**
   ```typescript
   // ❌ MAL - cachea por defecto (puede servir data vieja)
   const data = await fetch('https://api.example.com/data')

   // ✅ BIEN - especifica estrategia
   // Para data dinámica (siempre fresca)
   const data = await fetch(url, { cache: 'no-store' })

   // Para ISR (revalida cada hora)
   const data = await fetch(url, { next: { revalidate: 3600 } })

   // Para data estática (cachea indefinidamente)
   const data = await fetch(url, { cache: 'force-cache' })
   ```

7. ✅ **SIEMPRE usar Suspense boundaries** para async components
8. ✅ **SIEMPRE tipar props con TypeScript** (no `any`)
9. ✅ **SIEMPRE usar Zod** para validación de datos externos
10. ✅ **SIEMPRE usar streaming** para mejorar perceived performance

---

## 📚 Server Components

### Basic Server Component

```typescript
// app/dashboard/page.tsx
import { getWorkouts } from '@/lib/api/workouts'

// Server Component por defecto
export default async function DashboardPage() {
  // Fetch data directamente en el componente
  const workouts = await getWorkouts()

  return (
    <div>
      <h1>Dashboard</h1>
      {workouts.map(workout => (
        <WorkoutCard key={workout.id} workout={workout} />
      ))}
    </div>
  )
}
```

### Parallel Data Fetching

```typescript
// Fetch múltiples recursos en paralelo
export default async function Page() {
  // Ejecutan en paralelo (no secuencial)
  const [workouts, meals, transactions] = await Promise.all([
    getWorkouts(),
    getMeals(),
    getTransactions()
  ])

  return (
    <div>
      <WorkoutsSection data={workouts} />
      <MealsSection data={meals} />
      <TransactionsSection data={transactions} />
    </div>
  )
}
```

### Streaming with Suspense

```typescript
// app/dashboard/page.tsx
import { Suspense } from 'react'

export default function Page() {
  return (
    <div>
      <h1>Dashboard</h1>

      {/* Muestra loading mientras carga */}
      <Suspense fallback={<WorkoutsSkeleton />}>
        <WorkoutsAsync />
      </Suspense>

      <Suspense fallback={<MealsSkeleton />}>
        <MealsAsync />
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

## 📱 Client Components

### When to Use 'use client'

```typescript
// ✅ Para interactividad
'use client'
import { useState } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}

// ✅ Para hooks
'use client'
import { useEffect } from 'react'

export default function Analytics() {
  useEffect(() => {
    // Track page view
  }, [])
  return <div>...</div>
}

// ✅ Para browser APIs
'use client'
export default function ThemeToggle() {
  const toggleTheme = () => {
    localStorage.setItem('theme', 'dark')
  }
  return <button onClick={toggleTheme}>Toggle</button>
}
```

### Combining Server and Client

```typescript
// app/workouts/page.tsx (Server Component)
import { getWorkouts } from '@/lib/api'
import WorkoutList from '@/components/WorkoutList' // Client Component

export default async function WorkoutsPage() {
  const workouts = await getWorkouts() // Fetch en servidor

  return (
    <div>
      <h1>Workouts</h1>
      {/* Pasar data a Client Component */}
      <WorkoutList workouts={workouts} />
    </div>
  )
}

// components/WorkoutList.tsx (Client Component)
'use client'
import { useState } from 'react'

export default function WorkoutList({ workouts }) {
  const [filter, setFilter] = useState('')

  const filtered = workouts.filter(w =>
    w.name.includes(filter)
  )

  return (
    <div>
      <input
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      {filtered.map(workout => (
        <div key={workout.id}>{workout.name}</div>
      ))}
    </div>
  )
}
```

---

## 🎬 Server Actions

### Basic Server Action

```typescript
// app/workouts/actions.ts
'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

export async function createWorkout(formData: FormData) {
  const name = formData.get('name') as string
  const exercises = formData.get('exercises') as string

  // Server-side validation
  if (!name || !exercises) {
    return { error: 'Missing fields' }
  }

  // Insert to database
  await db.insert('workouts', { name, exercises })

  // Revalidate cache
  revalidatePath('/workouts')

  return { success: true }
}
```

### Using Server Action in Form

```typescript
// app/workouts/new/page.tsx
import { createWorkout } from '../actions'

export default function NewWorkoutPage() {
  return (
    <form action={createWorkout}>
      <input name="name" placeholder="Workout name" required />
      <textarea name="exercises" placeholder="Exercises" required />
      <button type="submit">Create Workout</button>
    </form>
  )
}
```

### Progressive Enhancement with useFormState

```typescript
// components/WorkoutForm.tsx
'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { createWorkout } from '@/app/workouts/actions'

export default function WorkoutForm() {
  const [state, formAction] = useFormState(createWorkout, null)

  return (
    <form action={formAction}>
      <input name="name" placeholder="Workout name" required />
      <textarea name="exercises" required />

      <SubmitButton />

      {state?.error && <p className="error">{state.error}</p>}
      {state?.success && <p className="success">Created!</p>}
    </form>
  )
}

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Creating...' : 'Create Workout'}
    </button>
  )
}
```

### Server Action with Validation (Zod)

```typescript
// app/workouts/actions.ts
'use server'

import { z } from 'zod'

const WorkoutSchema = z.object({
  name: z.string().min(3).max(100),
  exercises: z.array(z.object({
    name: z.string(),
    sets: z.number().min(1).max(10),
    reps: z.number().min(1).max(100)
  }))
})

export async function createWorkout(data: unknown) {
  // Validate with Zod
  const parsed = WorkoutSchema.safeParse(data)

  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }

  // Data is now type-safe
  const { name, exercises } = parsed.data

  await db.insert('workouts', { name, exercises })
  revalidatePath('/workouts')

  return { success: true }
}
```

---

## 🛣️ Routing & Layouts

### File Structure

```
app/
├── layout.tsx          # Root layout
├── page.tsx            # Home page (/)
├── dashboard/
│   ├── layout.tsx      # Dashboard layout
│   ├── page.tsx        # /dashboard
│   ├── workouts/
│   │   ├── page.tsx    # /dashboard/workouts
│   │   └── [id]/
│   │       └── page.tsx # /dashboard/workouts/123
│   └── meals/
│       └── page.tsx    # /dashboard/meals
└── api/
    └── workouts/
        └── route.ts    # API route
```

### Root Layout

```typescript
// app/layout.tsx
export default function RootLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <nav>Global navigation</nav>
        {children}
        <footer>Global footer</footer>
      </body>
    </html>
  )
}
```

### Nested Layout

```typescript
// app/dashboard/layout.tsx
export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dashboard">
      <aside>
        <DashboardSidebar />
      </aside>
      <main>{children}</main>
    </div>
  )
}
```

### Dynamic Routes

```typescript
// app/workouts/[id]/page.tsx
interface Props {
  params: { id: string }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function WorkoutPage({ params }: Props) {
  const workout = await getWorkout(params.id)

  return <div>{workout.name}</div>
}

// Generate static params for SSG
export async function generateStaticParams() {
  const workouts = await getWorkouts()
  return workouts.map(w => ({ id: w.id.toString() }))
}
```

---

## 🔌 Route Handlers (API Routes)

### GET Handler

```typescript
// app/api/workouts/route.ts
import { NextResponse } from 'next/server'
import { getWorkouts } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  const workouts = await getWorkouts(userId)

  return NextResponse.json({ workouts })
}
```

### POST Handler with Validation

```typescript
// app/api/workouts/route.ts
import { NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  name: z.string().min(3),
  exercises: z.array(z.object({ name: z.string() }))
})

export async function POST(request: Request) {
  const body = await request.json()

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error },
      { status: 400 }
    )
  }

  const workout = await createWorkout(parsed.data)

  return NextResponse.json({ workout }, { status: 201 })
}
```

### Dynamic Route Handler

```typescript
// app/api/workouts/[id]/route.ts
interface Context {
  params: { id: string }
}

export async function GET(
  request: Request,
  { params }: Context
) {
  const workout = await getWorkout(params.id)

  if (!workout) {
    return NextResponse.json(
      { error: 'Not found' },
      { status: 404 }
    )
  }

  return NextResponse.json({ workout })
}

export async function DELETE(
  request: Request,
  { params }: Context
) {
  await deleteWorkout(params.id)
  return new NextResponse(null, { status: 204 })
}
```

---

## 🔐 Middleware

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createServerClient(request, response)

  // Check authentication
  const { data: { session } } = await supabase.auth.getSession()

  // Protect /dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/:path*',
  ]
}
```

---

## ⚡ Caching Strategies

### Force Dynamic (No Cache)

```typescript
// Opt out of caching for entire route
export const dynamic = 'force-dynamic'

// Or per-fetch
const data = await fetch(url, { cache: 'no-store' })
```

### ISR (Incremental Static Regeneration)

```typescript
// Revalidate every hour
export const revalidate = 3600

// Or per-fetch
const data = await fetch(url, { next: { revalidate: 3600 } })
```

### On-Demand Revalidation

```typescript
import { revalidatePath, revalidateTag } from 'next/cache'

// Revalidate specific path
revalidatePath('/workouts')
revalidatePath('/workouts/[id]', 'page')

// Revalidate by tag
revalidateTag('workouts')
```

### Using Cache Tags

```typescript
// Fetch with tags
const data = await fetch(url, {
  next: { tags: ['workouts', `workout-${id}`] }
})

// Revalidate all workouts
revalidateTag('workouts')

// Revalidate specific workout
revalidateTag(`workout-${id}`)
```

---

## 🎨 Loading & Error States

### loading.tsx

```typescript
// app/dashboard/loading.tsx
export default function Loading() {
  return <div>Loading dashboard...</div>
}

// Or with skeleton
export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="h-32 bg-gray-200 rounded animate-pulse" />
      <div className="h-32 bg-gray-200 rounded animate-pulse" />
    </div>
  )
}
```

### error.tsx

```typescript
// app/dashboard/error.tsx
'use client'

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

### not-found.tsx

```typescript
// app/dashboard/not-found.tsx
export default function NotFound() {
  return (
    <div>
      <h2>404 - Not Found</h2>
      <p>Could not find the requested resource</p>
    </div>
  )
}
```

---

## 📊 Metadata & SEO

### Static Metadata

```typescript
// app/dashboard/page.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard | Personal Tracker',
  description: 'Track your workouts, meals, and finances',
}

export default function Page() {
  return <div>Dashboard</div>
}
```

### Dynamic Metadata

```typescript
// app/workouts/[id]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const workout = await getWorkout(params.id)

  return {
    title: workout.name,
    description: `Workout details for ${workout.name}`,
  }
}
```

---

## 🔗 Related Skills

- `react-ui-component-library` - UI components and styling
- `supabase-integration-patterns` - Data fetching with Supabase
- `dashboard-dev-workflow` - Development workflow

---

## 📖 Additional Resources

- Next.js 15 Docs: https://nextjs.org/docs
- App Router: https://nextjs.org/docs/app
- Server Actions: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions
