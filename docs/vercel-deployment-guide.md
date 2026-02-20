# Vercel Deployment Guide - Personal Dashboard

**Date:** 2025-12-21
**Project:** Personal Dashboard Next.js Application
**Status:** Configuration Ready

---

## 🚨 Important Configuration

### Root Directory Setting

**CRITICAL:** El proyecto Next.js está dentro del directorio `code/`, NO en la raíz del repositorio.

En Vercel UI, debes configurar:

```
Root Directory: code
```

### Paso a Paso en Vercel UI

1. **Import Git Repository**
   - Ir a https://vercel.com/new
   - Conectar el repositorio de GitHub/GitLab
   - Seleccionar el repositorio `personal-dashboard`

2. **Configure Project**

   **Framework Preset:** Next.js (se detectará automáticamente)

   **Root Directory:** `code` ⚠️ **CRÍTICO**

   ![Root Directory Configuration](https://vercel.com/docs/concepts/projects/overview#root-directory)

   - Click en "Edit" al lado de "Root Directory"
   - Escribir: `code`
   - Click "Continue"

3. **Build & Development Settings**

   Vercel debería auto-detectar:
   ```
   Framework Preset:     Next.js
   Build Command:        npm run build
   Output Directory:     .next (auto-detected)
   Install Command:      npm install
   Development Command:  npm run dev
   ```

4. **Environment Variables** ⚠️ **REQUERIDO**

   Agregar las siguientes variables de entorno:

   ```bash
   # Database (PostgreSQL en Vercel o externo)
   DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

   # NextAuth
   NEXTAUTH_URL="https://your-domain.vercel.app"
   NEXTAUTH_SECRET="[generar con: openssl rand -base64 32]"

   # Redis (opcional - Upstash Redis recomendado)
   REDIS_URL="redis://default:password@host:port"

   # AI Platform Integration (opcional)
   N8N_BASE_URL="https://your-n8n-instance.com"
   FLOWISE_BASE_URL="https://your-flowise-instance.com"
   QDRANT_URL="https://your-qdrant-instance.com"
   QDRANT_API_KEY="your-api-key"
   N8N_API_TOKEN="your-token"

   # Email Service (Resend)
   RESEND_API_KEY="re_xxxxxxxxxxxx"
   RESEND_FROM_EMAIL="noreply@yourdomain.com"

   # Node Environment
   NODE_ENV="production"
   ```

5. **Deploy**
   - Click en "Deploy"
   - Esperar a que complete el build (~2-3 minutos)

---

## 📊 Database Configuration for Vercel

### Option 1: Vercel Postgres (Recomendado para production)

1. En Vercel Dashboard → Tu proyecto → Storage tab
2. Click "Create Database"
3. Seleccionar "Postgres"
4. Vercel automáticamente agregará `DATABASE_URL` a tus variables de entorno
5. Ejecutar migraciones:
   ```bash
   # Desde local
   npx prisma migrate deploy --schema=./code/prisma/schema.prisma
   ```

### Option 2: PostgreSQL Externo (Neon, Supabase, Railway, etc.)

1. Crear base de datos PostgreSQL en el servicio elegido
2. Copiar la connection string
3. Agregar a Vercel como variable de entorno `DATABASE_URL`
4. Ejecutar migraciones desde local o CI/CD

### Option 3: Usar Database Actual (desarrollo)

Si quieres usar tu PostgreSQL local/Docker para testing en Vercel:

1. Usar ngrok o Cloudflare Tunnel para exponer tu PostgreSQL
   ```bash
   # Con ngrok
   ngrok tcp 5435
   ```

2. Actualizar DATABASE_URL en Vercel:
   ```
   postgresql://dashboard_user:PASSWORD@tcp-tunnel-url:port/dashboard
   ```

⚠️ **NO RECOMENDADO PARA PRODUCTION**

---

## 🔧 Build Configuration Details

### vercel.json

El archivo `vercel.json` en la raíz configura:

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

**Nota:** Los comandos se ejecutarán DENTRO del directorio `code/` debido al Root Directory setting.

### next.config.ts

Configurado para detectar Vercel automáticamente:

```typescript
output: process.env.VERCEL ? undefined : 'standalone',
```

- En Vercel: usa el output por defecto (optimizado para Vercel)
- En Docker: usa `standalone` para contenedores

---

## 🚀 Post-Deployment Steps

### 1. Ejecutar Migraciones

Después del primer deploy:

```bash
# Opción A: Desde tu máquina local
cd code
DATABASE_URL="tu-vercel-database-url" npx prisma migrate deploy

# Opción B: Agregar al Build Command en Vercel
Build Command: npm run build && npx prisma migrate deploy
```

### 2. Seed Database (Opcional)

```bash
cd code
DATABASE_URL="tu-vercel-database-url" npm run prisma:seed
```

O crear un script de seed automático en `package.json`:

```json
"postbuild": "prisma migrate deploy"
```

### 3. Verificar Health Endpoint

```bash
curl https://your-app.vercel.app/api/health
```

Debería retornar:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "checks": {
    "database": { "status": "healthy" }
  }
}
```

### 4. Configurar Custom Domain (Opcional)

1. Ir a Project Settings → Domains
2. Agregar tu dominio personalizado
3. Seguir instrucciones para configurar DNS
4. Actualizar `NEXTAUTH_URL` con el nuevo dominio

---

## ⚠️ Troubleshooting

### Error: "No Next.js version detected"

**Causa:** Root Directory no configurado correctamente

**Solución:**
1. Ir a Project Settings → General
2. En "Root Directory" → Edit
3. Escribir: `code`
4. Save
5. Redeploy desde Deployments tab

### Error: "Prisma Client not found"

**Causa:** Prisma generate no se ejecutó durante el build

**Solución:**
1. Verificar que `package.json` tenga:
   ```json
   "build": "prisma generate && next build"
   ```
2. Redeploy

### Error: "Database connection failed"

**Causa:** DATABASE_URL no configurado o incorrecto

**Solución:**
1. Verificar Environment Variables en Vercel UI
2. Asegurar que DATABASE_URL esté en formato correcto:
   ```
   postgresql://user:password@host:port/database?sslmode=require
   ```
3. Si usas Vercel Postgres, verificar que esté conectado al proyecto

### Build Timeout

**Causa:** Dependencies muy pesadas o build muy lento

**Solución:**
1. Verificar que `node_modules` NO esté en git (usar .gitignore)
2. Considerar usar Vercel Pro para builds más largos
3. Optimizar dependencies en package.json

### "Module not found" en runtime

**Causa:** Dependency en devDependencies que debería estar en dependencies

**Solución:**
1. Mover la dependency correcta:
   ```bash
   npm install <package> --save-prod
   npm uninstall <package> --save-dev
   ```
2. Commit y push

---

## 🔐 Security Checklist for Production

### Before Going Live

- [ ] Configurar todas las Environment Variables
- [ ] Generar nuevo NEXTAUTH_SECRET para production
- [ ] Configurar DATABASE_URL con SSL (`?sslmode=require`)
- [ ] Verificar que `.env.local` esté en `.gitignore`
- [ ] Revisar que no haya secrets en el código
- [ ] Configurar CORS headers si es necesario
- [ ] Habilitar Vercel Authentication para proteger preview deployments
- [ ] Configurar dominios permitidos en NextAuth
- [ ] Revisar Rate Limiting para API routes
- [ ] Configurar Web Analytics (Vercel Analytics)

### Recommended Vercel Settings

1. **Deployment Protection**
   - Settings → Deployment Protection
   - Enable "Password Protection" para preview deployments

2. **Environment Variables**
   - Separar variables por ambiente:
     - Production
     - Preview
     - Development

3. **Security Headers**
   - Ya configurados en `next.config.ts`
   - Verificar con: https://securityheaders.com

---

## 📊 Monitoring & Analytics

### Vercel Analytics

1. Ir a Analytics tab en el proyecto
2. Click "Enable Analytics"
3. Gratis para hobby projects, pagado para Pro

### Vercel Speed Insights

1. Ir a Speed Insights tab
2. Click "Enable Speed Insights"
3. Instalar package (opcional):
   ```bash
   npm install @vercel/speed-insights
   ```

### Custom Metrics

El proyecto ya expone métricas en `/api/metrics` (Prometheus format).

Para visualizarlas:
- Integrar con Grafana Cloud
- Usar Vercel Log Drains
- Configurar alertas personalizadas

---

## 🌐 Domain Configuration

### Vercel Domain

Por defecto obtendrás:
```
your-project.vercel.app
your-project-git-branch.vercel.app (preview deployments)
```

### Custom Domain

1. **Add Domain**
   - Project Settings → Domains
   - Add Domain: `yourdomain.com`

2. **Configure DNS**
   - Opción A (Recomendado): Usar Vercel Nameservers
   - Opción B: Agregar A/CNAME records manualmente

3. **SSL Certificate**
   - Vercel automáticamente provisiona SSL con Let's Encrypt
   - Esperar ~1 minuto para propagación

4. **Update Environment Variables**
   ```bash
   NEXTAUTH_URL="https://yourdomain.com"
   ```

---

## 🔄 CI/CD Workflow

### Automatic Deployments

Vercel automáticamente deploya:
- **Production:** Commits a `main` branch
- **Preview:** Commits a cualquier otra branch (ej: `develop`)

### Git Integration

Configurado en `vercel.json`:
```json
"git": {
  "deploymentEnabled": {
    "main": true,
    "develop": true
  }
}
```

### Manual Deploy

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd /home/badfaceserverlap/personal-dashboard/code
vercel --prod
```

---

## 📝 Useful Commands

### Local Development

```bash
cd code
npm run dev
# Opens: http://localhost:3000
```

### Build Locally (simula Vercel build)

```bash
cd code
npm run build
npm run start
```

### Prisma Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
DATABASE_URL="your-vercel-db-url" npx prisma migrate deploy

# Open Prisma Studio
DATABASE_URL="your-vercel-db-url" npx prisma studio
```

### Vercel CLI Commands

```bash
# Link project
vercel link

# Pull environment variables
vercel env pull .env.local

# View logs
vercel logs

# List deployments
vercel ls

# Promote deployment to production
vercel promote <deployment-url>
```

---

## 📚 Additional Resources

- [Vercel Next.js Documentation](https://vercel.com/docs/frameworks/nextjs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [NextAuth.js with Vercel](https://next-auth.js.org/deployment)

---

## ✅ Quick Checklist

### Initial Setup
- [ ] Configure Root Directory: `code`
- [ ] Add all environment variables
- [ ] Connect database (Vercel Postgres or external)
- [ ] Deploy

### Post-Deployment
- [ ] Run database migrations
- [ ] Seed database (optional)
- [ ] Test health endpoint
- [ ] Verify login flow works
- [ ] Test all modules (Gym, Finance, Nutrition, Family)

### Production Hardening
- [ ] Configure custom domain
- [ ] Enable Vercel Analytics
- [ ] Set up monitoring/alerts
- [ ] Configure rate limiting
- [ ] Review security headers
- [ ] Enable deployment protection

---

**Last Updated:** 2025-12-21
**Vercel Configuration:** Ready
**Next Step:** Configure Root Directory en Vercel UI
