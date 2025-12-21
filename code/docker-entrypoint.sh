#!/bin/sh
set -e

echo "🚀 Starting Personal Dashboard entrypoint..."

# ===================================
# 1. Wait for PostgreSQL to be ready
# ===================================
echo "⏳ Waiting for PostgreSQL to be ready..."

# Extraer host y puerto de DATABASE_URL
# Formato: postgresql://user:pass@host:port/dbname
DB_HOST=$(echo $DATABASE_URL | sed -n 's/.*@\([^:]*\):.*/\1/p')
DB_PORT=$(echo $DATABASE_URL | sed -n 's/.*:\([0-9]*\)\/.*/\1/p')

# Fallback a valores por defecto si no se pudo extraer
DB_HOST=${DB_HOST:-"supabase-db"}
DB_PORT=${DB_PORT:-"5432"}

MAX_RETRIES=30
RETRY_COUNT=0

until nc -z $DB_HOST $DB_PORT > /dev/null 2>&1 || [ $RETRY_COUNT -eq $MAX_RETRIES ]; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  echo "   Attempt $RETRY_COUNT/$MAX_RETRIES - PostgreSQL not ready yet..."
  sleep 2
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
  echo "❌ PostgreSQL connection failed after $MAX_RETRIES attempts"
  exit 1
fi

echo "✅ PostgreSQL is ready!"

# ===================================
# 2. Run Prisma Migrations
# ===================================
echo "📦 Running Prisma migrations..."

cd /app

if prisma migrate deploy; then
  echo "✅ Migrations applied successfully"
else
  echo "❌ Migration failed"
  exit 1
fi

# ===================================
# 4. Run Seeds (if database is empty)
# ===================================
echo "🌱 Running database seeds (if needed)..."

if node /app/prisma/seeds/run-seeds.js; then
  echo "✅ Seeds check completed"
else
  echo "⚠️  Seeds failed (non-critical, continuing...)"
fi

# ===================================
# 5. Start Application
# ===================================
echo "🎉 Starting Next.js server..."
echo "   Environment: $NODE_ENV"
echo "   Port: $PORT"

# Ejecutar el comando pasado como argumentos (default: node server.js)
exec "$@"
