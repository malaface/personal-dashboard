# ===================================
# Stage 1: Dependencies (Production Only)
# ===================================
FROM node:20-alpine AS deps

# Instalar dependencias mínimas del sistema
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copiar archivos de configuración
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Instalar SOLO dependencias de producción
RUN npm ci --omit=dev && \
    npm cache clean --force

# Generar Prisma Client (binaries específicos: linux-musl-openssl-3.0.x)
RUN npx prisma generate

# ===================================
# Stage 2: Builder
# ===================================
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Copiar archivos necesarios para build
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Instalar TODAS las dependencias (dev + prod) para el build
RUN npm ci && \
    npm cache clean --force

# Generar Prisma Client
RUN npx prisma generate

# Copiar código fuente
COPY . .

# Variables de entorno de build
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js (genera .next/standalone con solo deps necesarias)
RUN npm run build

# ===================================
# Stage 3: Runner (Production - OPTIMIZED)
# ===================================
FROM node:20-alpine AS runner

# Instalar SOLO herramientas runtime necesarias
RUN apk add --no-cache openssl curl && \
    rm -rf /var/cache/apk/*

WORKDIR /app

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Variables de entorno
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Copiar SOLO archivos públicos necesarios
COPY --from=builder /app/public ./public

# Copiar output standalone (Next.js ya incluye deps mínimas)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copiar Prisma schema, migraciones y seeds
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Copiar SOLO Prisma Client desde deps (binaries optimizados)
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=deps --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Instalar SOLO Prisma CLI (sin dependencias pesadas)
RUN npm install --global --no-save prisma@5.22.0 && \
    npm cache clean --force

# Copiar script de entrypoint
COPY --chown=nextjs:nodejs docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Cambiar a usuario no-root
USER nextjs

# Exponer puerto
EXPOSE 3000

# Health check optimizado
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Entrypoint y comando
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "server.js"]
