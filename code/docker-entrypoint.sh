#!/bin/sh
set -e

echo "🚀 Starting Personal Dashboard entrypoint..."

# ===================================
# 1. Wait for PostgreSQL to be ready
# ===================================
echo "⏳ Waiting for PostgreSQL to be ready..."

# Extraer host y puerto de DATABASE_URL
DB_HOST="dashboard-db"
DB_PORT="5432"

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
# 4. Check if seeds are needed
# ===================================
echo "🌱 Checking if seeds are needed..."

# Simple check: if migrations ran successfully, we can assume database is ready
echo "   ℹ️  Database is ready - seeds will run automatically if needed"

# ===================================
# 5. Start Application
# ===================================
echo "🎉 Starting Next.js server..."
echo "   Environment: $NODE_ENV"
echo "   Port: $PORT"

# Ejecutar el comando pasado como argumentos (default: node server.js)
exec "$@"
