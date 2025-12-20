# ===================================
# Stage 1: Dependencies
# ===================================
FROM node:20-alpine AS deps

# Instalar dependencias del sistema necesarias para Prisma
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copiar archivos de configuración de dependencias
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Instalar dependencias de producción y desarrollo
RUN npm ci

# Generar Prisma Client
RUN npx prisma generate

# ===================================
# Stage 2: Builder
# ===================================
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copiar node_modules desde la etapa de dependencias
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables de entorno necesarias para el build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build de Next.js (prisma generate ya se ejecutó en deps)
RUN npm run build

# ===================================
# Stage 3: Runner (Production)
# ===================================
FROM node:20-alpine AS runner

RUN apk add --no-cache curl wget openssl netcat-openbsd

WORKDIR /app

# Crear usuario no-root para seguridad
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Variables de entorno de producción
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Copiar archivos públicos
COPY --from=builder /app/public ./public

# Copiar el output standalone de Next.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copiar Prisma schema y migraciones
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Copiar node_modules para tener acceso a Prisma Client
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

# Instalar Prisma CLI globalmente como root
RUN npm install -g prisma@5.22.0

# Copiar el script de entrypoint
COPY --chown=nextjs:nodejs docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Cambiar al usuario no-root
USER nextjs

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Usar el entrypoint script
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

# Comando por defecto
CMD ["node", "server.js"]
