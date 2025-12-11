# Fase 2: Seguridad Avanzada y Auditoría

**Fecha de creación:** 2025-12-10
**Estado:** PENDIENTE (para implementar después de Fase 1)
**Prioridad:** Alta (requisito para producción)
**Tiempo estimado:** 8-12 horas

---

## 📋 Resumen Ejecutivo

Esta fase implementa dos características críticas de seguridad que NO fueron incluidas en Fase 1:

1. **Email Verification** - Verificación de correos electrónicos reales
2. **Audit Logs** - Registro de actividades para seguridad y debugging

**⚠️ IMPORTANTE:** Fase 1 usa auto-verificación de emails (solo para desarrollo). En producción, **DEBES** implementar esta fase.

---

## 🎯 Objetivos

### 1. Email Verification
- ✅ Validar que emails son reales y accesibles
- ✅ Prevenir spam accounts y emails inventados
- ✅ Implementar flujo de confirmación con tokens
- ✅ Envío de emails con Resend (3000/mes gratis)

### 2. Audit Logs
- ✅ Registrar intentos de login (exitosos y fallidos)
- ✅ Track registro de nuevos usuarios
- ✅ Registrar cambios de password
- ✅ Monitorear actividad sospechosa
- ✅ Debugging y análisis de seguridad

---

## 📊 Cambios en el Schema de Prisma

### Agregar tabla `audit_logs`

```prisma
model AuditLog {
  id        String   @id @default(cuid())
  userId    String?  // Nullable para login fallidos
  action    String   // LOGIN, LOGOUT, REGISTER, PASSWORD_CHANGE, LOGIN_FAILED
  ipAddress String?
  userAgent String?
  metadata  Json?    // Información adicional contextual
  createdAt DateTime @default(now())

  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([userId, createdAt])
  @@index([action, createdAt])
  @@index([ipAddress, createdAt])
  @@map("audit_logs")
}
```

### Actualizar tabla `users`

La tabla `users` ya tiene el campo `emailVerified`, solo necesitamos:

```prisma
// En model User, agregar relación:
model User {
  // ... campos existentes

  auditLogs AuditLog[]  // ← Agregar esta línea

  // ... resto del schema
}
```

---

## 🔐 Parte 1: Email Verification

### 1.1 Setup de Resend

**Pasos:**

1. **Crear cuenta en Resend:** https://resend.com
2. **Obtener API Key**
3. **Verificar dominio** (opcional, usar @resend.dev gratis)

**Instalar dependencia:**
```bash
npm install resend
```

**Agregar a `.env.local`:**
```bash
RESEND_API_KEY="re_xxxxxxxxxxxx"
RESEND_FROM_EMAIL="noreply@yourdomain.com"  # o usar noreply@resend.dev
```

### 1.2 Crear servicio de email

**Archivo:** `lib/email/resend.ts`

```typescript
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: 'Verify your email address',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .button {
                display: inline-block;
                padding: 12px 24px;
                background-color: #3b82f6;
                color: white;
                text-decoration: none;
                border-radius: 6px;
                margin: 20px 0;
              }
              .footer { margin-top: 40px; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>Welcome to Personal Dashboard!</h2>
              <p>Thank you for registering. Please verify your email address by clicking the button below:</p>

              <a href="${verifyUrl}" class="button">Verify Email Address</a>

              <p>Or copy and paste this link into your browser:</p>
              <p>${verifyUrl}</p>

              <p>This link will expire in 24 hours.</p>

              <div class="footer">
                <p>If you didn't create an account, you can safely ignore this email.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    return { success: true }
  } catch (error: any) {
    console.error('Send email error:', error)
    return { success: false, error: error.message }
  }
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`

  try {
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL!,
      to: email,
      subject: 'Reset your password',
      html: `
        <!DOCTYPE html>
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>Password Reset Request</h2>
            <p>Click the link below to reset your password:</p>
            <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 6px;">
              Reset Password
            </a>
            <p>This link expires in 1 hour.</p>
            <p>If you didn't request this, ignore this email.</p>
          </body>
        </html>
      `,
    })

    return { success: true }
  } catch (error: any) {
    console.error('Send password reset email error:', error)
    return { success: false, error: error.message }
  }
}
```

### 1.3 Actualizar registro de usuarios

**Archivo:** `lib/auth/utils.ts` (modificar función `registerUser`)

```typescript
import { hash } from "bcryptjs"
import { prisma } from "@/lib/db/prisma"
import { sendVerificationEmail } from "@/lib/email/resend"
import crypto from "crypto"

export async function registerUser(email: string, password: string, name: string) {
  // Check if user exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    throw new Error("User already exists")
  }

  // Hash password
  const hashedPassword = await hash(password, 12)

  // Create user WITHOUT email verification
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      emailVerified: null, // ← NO auto-verificar
    }
  })

  // Generate verification token
  const token = crypto.randomBytes(32).toString('hex')
  const hashedToken = await hash(token, 10)

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: hashedToken,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
    }
  })

  // Send verification email
  await sendVerificationEmail(email, token)

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  }
}
```

### 1.4 Crear endpoint de verificación

**Archivo:** `app/api/auth/verify-email/route.ts`

```typescript
import { NextRequest, NextResponse } from "next/server"
import { compare } from "bcryptjs"
import { prisma } from "@/lib/db/prisma"

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token")

  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 })
  }

  try {
    // Find all verification tokens
    const verificationTokens = await prisma.verificationToken.findMany()

    let verificationRecord = null
    for (const record of verificationTokens) {
      const isValid = await compare(token, record.token)
      if (isValid) {
        verificationRecord = record
        break
      }
    }

    if (!verificationRecord) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 })
    }

    // Check expiration
    if (new Date() > verificationRecord.expires) {
      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: verificationRecord.identifier,
            token: verificationRecord.token,
          },
        },
      })
      return NextResponse.json({ error: "Token expired" }, { status: 400 })
    }

    // Update user email verification
    await prisma.user.update({
      where: { email: verificationRecord.identifier },
      data: { emailVerified: new Date() },
    })

    // Delete verification token
    await prisma.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: verificationRecord.identifier,
          token: verificationRecord.token,
        },
      },
    })

    // Redirect to login with success message
    return NextResponse.redirect(new URL("/login?verified=true", request.url))
  } catch (error: any) {
    console.error("Email verification error:", error)
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    )
  }
}
```

### 1.5 Actualizar NextAuth para requerir verificación

**Archivo:** `lib/auth/config.ts` (modificar authorize callback)

```typescript
async authorize(credentials) {
  if (!credentials?.email || !credentials?.password) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { email: credentials.email as string }
  })

  if (!user || !user.password) {
    return null
  }

  const isPasswordValid = await compare(credentials.password as string, user.password)

  if (!isPasswordValid) {
    return null
  }

  // ← NUEVO: Verificar email antes de permitir login
  if (!user.emailVerified) {
    throw new Error("Please verify your email before logging in")
  }

  return {
    id: user.id,
    email: user.email!,
    name: user.name,
    role: user.role,
  }
}
```

---

## 📊 Parte 2: Audit Logs

### 2.1 Migración de Prisma

**Comando:**
```bash
npx prisma migrate dev --name add_audit_logs
```

### 2.2 Crear servicio de audit logging

**Archivo:** `lib/audit/logger.ts`

```typescript
import { prisma } from "@/lib/db/prisma"
import { headers } from "next/headers"

export type AuditAction =
  | "LOGIN"
  | "LOGIN_FAILED"
  | "LOGOUT"
  | "REGISTER"
  | "PASSWORD_CHANGE"
  | "EMAIL_VERIFIED"
  | "WORKOUT_CREATED"
  | "WORKOUT_UPDATED"
  | "WORKOUT_DELETED"

interface AuditLogData {
  userId?: string
  action: AuditAction
  metadata?: Record<string, any>
}

export async function createAuditLog({ userId, action, metadata }: AuditLogData) {
  try {
    const headersList = headers()
    const ipAddress = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || null
    const userAgent = headersList.get("user-agent") || null

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        ipAddress,
        userAgent,
        metadata: metadata || {},
      },
    })

    console.log(`[AUDIT] ${action}`, { userId, ipAddress, metadata })
  } catch (error) {
    console.error("Failed to create audit log:", error)
    // Don't throw - audit logging shouldn't break app flow
  }
}

export async function getUserAuditLogs(userId: string, limit: number = 50) {
  return prisma.auditLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

export async function getRecentFailedLogins(limit: number = 100) {
  return prisma.auditLog.findMany({
    where: {
      action: 'LOGIN_FAILED',
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}
```

### 2.3 Integrar audit logging en NextAuth

**Archivo:** `lib/auth/config.ts` (modificar callbacks)

```typescript
import { createAuditLog } from "@/lib/audit/logger"

// En el authorize callback:
async authorize(credentials) {
  if (!credentials?.email || !credentials?.password) {
    await createAuditLog({
      action: "LOGIN_FAILED",
      metadata: { reason: "missing_credentials", email: credentials?.email },
    })
    return null
  }

  const user = await prisma.user.findUnique({
    where: { email: credentials.email as string }
  })

  if (!user || !user.password) {
    await createAuditLog({
      action: "LOGIN_FAILED",
      metadata: { reason: "user_not_found", email: credentials.email },
    })
    return null
  }

  const isPasswordValid = await compare(credentials.password as string, user.password)

  if (!isPasswordValid) {
    await createAuditLog({
      userId: user.id,
      action: "LOGIN_FAILED",
      metadata: { reason: "invalid_password", email: credentials.email },
    })
    return null
  }

  if (!user.emailVerified) {
    await createAuditLog({
      userId: user.id,
      action: "LOGIN_FAILED",
      metadata: { reason: "email_not_verified", email: credentials.email },
    })
    throw new Error("Please verify your email before logging in")
  }

  // ✅ Login exitoso
  await createAuditLog({
    userId: user.id,
    action: "LOGIN",
    metadata: { email: credentials.email },
  })

  return {
    id: user.id,
    email: user.email!,
    name: user.name,
    role: user.role,
  }
}
```

### 2.4 Audit logging en registro

**Archivo:** `lib/auth/utils.ts` (en registerUser)

```typescript
import { createAuditLog } from "@/lib/audit/logger"

export async function registerUser(email: string, password: string, name: string) {
  // ... código existente de registro

  // Al final, después de crear el usuario:
  await createAuditLog({
    userId: user.id,
    action: "REGISTER",
    metadata: { email, name },
  })

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  }
}
```

### 2.5 Audit logging en verificación de email

**Archivo:** `app/api/auth/verify-email/route.ts`

```typescript
import { createAuditLog } from "@/lib/audit/logger"

// Después de verificar el email:
await createAuditLog({
  userId: user.id,
  action: "EMAIL_VERIFIED",
  metadata: { email: verificationRecord.identifier },
})
```

### 2.6 Dashboard de audit logs (Admin)

**Archivo:** `app/dashboard/admin/audit-logs/page.tsx`

```typescript
import { requireAuth } from "@/lib/auth/utils"
import { prisma } from "@/lib/db/prisma"
import { redirect } from "next/navigation"

export default async function AuditLogsPage() {
  const user = await requireAuth()

  // Solo admins pueden ver logs
  if (user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const logs = await prisma.auditLog.findMany({
    include: { user: { select: { email: true, name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Audit Logs</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.map((log) => (
              <tr key={log.id} className={
                log.action === "LOGIN_FAILED" ? "bg-red-50" : ""
              }>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {log.user?.email || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    log.action === "LOGIN" ? "bg-green-100 text-green-800" :
                    log.action === "LOGIN_FAILED" ? "bg-red-100 text-red-800" :
                    log.action === "REGISTER" ? "bg-blue-100 text-blue-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {log.ipAddress || "N/A"}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {JSON.stringify(log.metadata)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

---

## 🧪 Testing y Validación

### Test 1: Email Verification

**Flujo completo:**
```bash
# 1. Registrar usuario
POST /api/auth/register
Body: { email: "test@example.com", password: "pass123", name: "Test" }

# 2. Verificar email NO se auto-verifica
SELECT emailVerified FROM users WHERE email='test@example.com';
# Esperado: NULL

# 3. Verificar token creado
SELECT * FROM verification_tokens WHERE identifier='test@example.com';
# Esperado: 1 registro con expires futuro

# 4. Intentar login ANTES de verificar
POST /api/auth/signin
# Esperado: Error "Please verify your email"

# 5. Click en link de verificación (check email)
GET /api/auth/verify-email?token=xxxxxx

# 6. Verificar email ahora está verificado
SELECT emailVerified FROM users WHERE email='test@example.com';
# Esperado: timestamp actual

# 7. Login ahora debe funcionar
POST /api/auth/signin
# Esperado: Success + redirect a /dashboard
```

### Test 2: Audit Logs

**Verificaciones:**
```sql
-- Ver logs de login fallidos
SELECT * FROM audit_logs WHERE action = 'LOGIN_FAILED' ORDER BY created_at DESC LIMIT 10;

-- Ver registros de nuevos usuarios
SELECT * FROM audit_logs WHERE action = 'REGISTER' ORDER BY created_at DESC;

-- Actividad de un usuario específico
SELECT * FROM audit_logs WHERE user_id = 'cmj0e8nl30000132ngd1euy9e' ORDER BY created_at DESC;

-- Intentos de login desde misma IP
SELECT ip_address, COUNT(*) as attempts
FROM audit_logs
WHERE action = 'LOGIN_FAILED'
AND created_at >= NOW() - INTERVAL '1 hour'
GROUP BY ip_address
HAVING COUNT(*) > 5;
```

---

## 🔒 Seguridad Adicional (Opcional)

### Rate Limiting

**Instalar:**
```bash
npm install @upstash/ratelimit @upstash/redis
```

**Implementar:**
```typescript
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "1 m"), // 5 requests per minute
})

// En login:
const { success } = await ratelimit.limit(ipAddress)
if (!success) {
  return NextResponse.json({ error: "Too many attempts" }, { status: 429 })
}
```

### 2FA (Two-Factor Authentication)

Usar `speakeasy` para TOTP:
```bash
npm install speakeasy qrcode
```

---

## 📊 Métricas de Éxito

**Al completar Fase 2:**

✅ Solo usuarios con emails verificados pueden hacer login
✅ Emails de verificación se envían automáticamente
✅ Tokens de verificación expiran en 24 horas
✅ Todos los logins (exitosos y fallidos) se registran
✅ Dashboard de admin muestra audit logs
✅ IP addresses y user agents se capturan
✅ Actividad sospechosa es visible en logs

---

## ⏭️ Próximos Pasos

**Después de implementar Fase 2:**

1. **Fase 3:** Implementar módulos restantes (Finance, Nutrition, Family)
2. **Fase 4:** AI Integration (n8n, Flowise, Qdrant)
3. **Fase 5:** Monitoring con Prometheus + Grafana
4. **Fase 6:** Deploy a producción

---

**Documentación creada:** 2025-12-10
**Para implementar:** Después de completar Fase 1
**Prioridad:** Alta para producción
