# supabase-integration-patterns

---
**version**: 1.0.0
**last_updated**: 2025-12-09
**category**: Backend Stack
**priority**: CRÍTICA
**dependencies**: @supabase/supabase-js@2.39.0, @supabase/ssr@0.1.0
---

## 📖 Overview

Complete Supabase integration patterns for Next.js 15, covering SSR authentication, database queries, RLS policies, real-time subscriptions, storage, and edge functions.

---

## 🎯 When to Invoke This Skill

**Auto-invoke when detecting**:
- Keywords: Supabase, auth, SSR, RLS policy, real-time, storage, supabase.from
- Code: createServerClient, createBrowserClient, auth.getSession
- Phrases: "login user", "fetch from database", "create RLS policy"

---

## 📦 Versions

- **Supabase JS**: `2.39.0`
- **@supabase/ssr**: `0.1.0` (Next.js SSR helpers)
- **@supabase/auth-helpers-nextjs**: `0.8.7`
- **PostgreSQL**: `15.1` (Supabase managed)

---

## 🚨 Critical Rules (NEVER Break)

1. ❌ **NUNCA usar createClient directamente sin helpers SSR**
2. ❌ **NUNCA exponer service_role_key en el cliente**
3. ❌ **NUNCA crear tablas sin RLS habilitado**
4. ❌ **NUNCA usar auth.uid() sin verificar NULL**
5. ❌ **NUNCA ignorar errores de Supabase**
6. ❌ **NUNCA hacer queries en loops (N+1)**
7. ✅ **SIEMPRE usar TypeScript types generados**
8. ✅ **SIEMPRE verificar auth en middleware**
9. ✅ **SIEMPRE usar cookie() helpers en Next.js 15**
10. ✅ **SIEMPRE implementar refresh token en cliente**

---

## 📚 Authentication Patterns

### Server Component Auth

\`\`\`typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}
\`\`\`

### Client Component Auth

\`\`\`typescript
// lib/supabase/client.ts
'use client'

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
\`\`\`

---

## 🔐 RLS Policies

### Enable RLS

\`\`\`sql
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

-- Policy for SELECT
CREATE POLICY "Users can view own workouts"
  ON workouts FOR SELECT
  USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

-- Policy for INSERT
CREATE POLICY "Users can create own workouts"
  ON workouts FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());
\`\`\`

---

## 📖 Additional Resources

- Supabase Docs: https://supabase.com/docs
- Next.js Integration: https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
