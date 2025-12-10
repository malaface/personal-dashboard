# database-management

---
**version**: 1.0.0
**last_updated**: 2025-12-09
**category**: Infrastructure & DevOps
**priority**: CRÍTICA
**dependencies**: docker, postgresql-client, redis-cli, qdrant-client
---

## 📖 Overview

Comprehensive database management skill covering PostgreSQL backup/restore, migrations, health monitoring, and operations for Redis, Qdrant, and Neo4j databases.

**Critical**: This skill was referenced in CLAUDE.md but didn't exist - now implemented.

---

## 🎯 When to Invoke This Skill

**Auto-invoke when detecting**:
- Keywords: backup, restore, migration, PostgreSQL, database, pg_dump, psql
- Commands: pg_dump, pg_restore, psql, docker exec *-db
- Phrases: "database health", "migration needed", "backup failed"

**Manual invoke when**:
- Planning database schema changes
- Troubleshooting database connection issues
- Optimizing database performance
- Setting up automated backups
- Migrating PostgreSQL versions

---

## 📦 Versions

- **PostgreSQL**: `15.1` (Supabase managed version)
- **PostgreSQL Client**: `15.x`
- **Redis**: `7.2.3`
- **Qdrant**: `1.7.4`
- **Neo4j**: `5.x` (if applicable)

---

## 🚨 Critical Rules (NEVER Break)

### PostgreSQL

1. ❌ **NUNCA hacer backup sin verificar espacio en disco**
   ```bash
   # Verificar espacio disponible primero
   df -h /home/badfaceserverlap/docker/contenedores/shared/backups
   ```

2. ❌ **NUNCA correr migrations sin backup previo**
   ```bash
   # SIEMPRE hacer backup antes de migrar
   bash shared/scripts/backup-ai-platform.sh manual-pre-migration-$(date +%Y%m%d)
   ```

3. ❌ **NUNCA usar `DROP DATABASE` sin confirmar 3 veces**
   - Verificar que es el database correcto
   - Verificar que hay backup reciente
   - Confirmar con usuario

4. ❌ **NUNCA ignorar errores de `pg_dump`**
   ```bash
   # Verificar exit code
   pg_dump -U postgres db_name > backup.sql
   if [ $? -ne 0 ]; then
       echo "Backup failed!"
       exit 1
   fi
   ```

5. ❌ **NUNCA restaurar sin verificar la versión de PostgreSQL**
   ```bash
   # Verificar versión source y target
   docker exec supabase-db psql -U postgres -c "SELECT version();"
   ```

6. ❌ **NUNCA olvidar las transacciones para operaciones múltiples**
   ```sql
   BEGIN;
   -- operaciones aquí
   COMMIT;
   -- En caso de error: ROLLBACK;
   ```

7. ✅ **SIEMPRE usar `-F c` (custom format) para pg_dump** (permite restore parcial)
8. ✅ **SIEMPRE verificar integrity después de restore** (row counts, constraints)
9. ✅ **SIEMPRE documentar cambios de schema** en migration files
10. ✅ **SIEMPRE mantener retention policy** (7 daily + 4 weekly + 3 monthly)

### Redis

1. ❌ **NUNCA usar Redis para datos críticos sin persistence**
   - Configurar RDB o AOF si es necesario

2. ❌ **NUNCA hacer FLUSHALL en producción** sin confirmar
   ```bash
   # Esto borra TODA la data
   redis-cli FLUSHALL
   ```

3. ✅ **SIEMPRE configurar TTL** para keys temporales
4. ✅ **SIEMPRE monitorear memoria** (maxmemory-policy)

### Qdrant

1. ❌ **NUNCA borrar collections sin backup de embeddings**
2. ✅ **SIEMPRE verificar dimensiones** antes de crear collections
3. ✅ **SIEMPRE usar snapshots** para backups de Qdrant

---

## 📚 Content

### 1. PostgreSQL Backup Procedures

#### Manual Backup

```bash
# Navigate to main directory
cd /home/badfaceserverlap/docker/contenedores

# Full backup of AI Platform (PostgreSQL + n8n + volumes)
bash shared/scripts/backup-ai-platform.sh manual-$(date +%Y%m%d)

# PostgreSQL-only backup (custom format)
docker exec supabase-db pg_dumpall -U postgres -F c > backup-$(date +%Y%m%d).dump

# PostgreSQL-only backup (SQL format)
docker exec supabase-db pg_dumpall -U postgres > backup-$(date +%Y%m%d).sql

# Specific database backup
docker exec supabase-db pg_dump -U postgres -F c database_name > db-backup.dump
```

#### Automated Backups

Automated daily backups run at **3:00 AM** via cron:

```bash
# Check automated backup status
systemctl status backup-ai-platform.timer

# View backup retention
ls -lh shared/backups/

# Retention policy:
# - Daily: 7 days
# - Weekly: 4 weeks
# - Monthly: 3 months
```

#### Backup Verification

```bash
# Verify backup file integrity
pg_restore --list backup.dump | head -20

# Check backup size
ls -lh backup.dump

# Test restore to temporary database (dry-run)
docker exec -i supabase-db createdb -U postgres test_restore
docker exec -i supabase-db pg_restore -U postgres -d test_restore backup.dump
docker exec -i supabase-db dropdb -U postgres test_restore
```

---

### 2. PostgreSQL Restore Procedures

#### Full Restore

```bash
cd /home/badfaceserverlap/docker/contenedores

# Stop services first
cd projects/ai-platform && docker-compose -p localai down

# Restore from backup
bash shared/scripts/restore-ai-platform.sh latest

# Or restore specific backup
bash shared/scripts/restore-ai-platform.sh backup-20251209

# Restart services
python start_services.py --profile cpu
```

#### Partial Restore (Specific Database)

```bash
# Drop and recreate database
docker exec -i supabase-db psql -U postgres -c "DROP DATABASE IF EXISTS db_name;"
docker exec -i supabase-db psql -U postgres -c "CREATE DATABASE db_name;"

# Restore from dump
docker exec -i supabase-db pg_restore -U postgres -d db_name < backup.dump

# Verify restore
docker exec -i supabase-db psql -U postgres -d db_name -c "\dt"
```

#### Restore Verification

```bash
# Check row counts
docker exec -i supabase-db psql -U postgres -d db_name -c "
  SELECT schemaname, tablename,
         (SELECT count(*) FROM schemaname.tablename) as row_count
  FROM pg_tables
  WHERE schemaname = 'public'
  ORDER BY tablename;
"

# Verify constraints
docker exec -i supabase-db psql -U postgres -d db_name -c "\d+ table_name"

# Check RLS policies
docker exec -i supabase-db psql -U postgres -d db_name -c "
  SELECT tablename, rowsecurity
  FROM pg_tables
  WHERE schemaname = 'public';
"
```

---

### 3. PostgreSQL Migrations

#### Version Upgrade Workflow

```bash
# Check if migration is needed
bash shared/scripts/postgres-migration-helper.sh check

# Run migration wizard (interactive)
bash shared/scripts/postgres-migration-helper.sh migrate

# Manual migration steps (if needed):
# 1. Backup current database
bash shared/scripts/backup-ai-platform.sh manual-pre-migration-$(date +%Y%m%d)

# 2. Stop services
cd projects/ai-platform && docker-compose -p localai down

# 3. Update docker-compose.yml with new PostgreSQL version
# 4. Start with new version
docker-compose -p localai up -d supabase-db

# 5. Verify version
docker exec supabase-db psql -U postgres -c "SELECT version();"

# 6. Restore data if needed
# 7. Test services
python start_services.py --profile cpu
```

#### Schema Migrations

```bash
# Create migration file
cat > migrations/$(date +%Y%m%d_%H%M%S)_description.sql <<'EOF'
-- Migration: Description
-- Date: $(date)

BEGIN;

-- Your changes here
ALTER TABLE users ADD COLUMN new_field VARCHAR(255);

COMMIT;
EOF

# Apply migration
docker exec -i supabase-db psql -U postgres -f migrations/file.sql

# Verify migration
docker exec -i supabase-db psql -U postgres -c "\d+ table_name"
```

---

### 4. Database Health Monitoring

#### Connection Health

```bash
# Check if PostgreSQL is accepting connections
docker exec supabase-db pg_isready -U postgres

# View active connections
docker exec -i supabase-db psql -U postgres -c "
  SELECT count(*), state
  FROM pg_stat_activity
  WHERE datname = 'postgres'
  GROUP BY state;
"

# Kill idle connections (if needed)
docker exec -i supabase-db psql -U postgres -c "
  SELECT pg_terminate_backend(pid)
  FROM pg_stat_activity
  WHERE state = 'idle'
    AND state_change < now() - interval '1 hour';
"
```

#### Performance Monitoring

```bash
# View slow queries (>1 second)
docker exec -i supabase-db psql -U postgres -c "
  SELECT query, calls, total_time, mean_time
  FROM pg_stat_statements
  WHERE mean_time > 1000
  ORDER BY total_time DESC
  LIMIT 10;
"

# Check database size
docker exec -i supabase-db psql -U postgres -c "
  SELECT pg_database.datname,
         pg_size_pretty(pg_database_size(pg_database.datname)) as size
  FROM pg_database
  ORDER BY pg_database_size(pg_database.datname) DESC;
"

# Check table sizes
docker exec -i supabase-db psql -U postgres -c "
  SELECT schemaname, tablename,
         pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
  FROM pg_tables
  WHERE schemaname = 'public'
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
  LIMIT 20;
"

# Check index usage
docker exec -i supabase-db psql -U postgres -c "
  SELECT schemaname, tablename, indexname, idx_scan
  FROM pg_stat_user_indexes
  WHERE idx_scan = 0
  ORDER BY schemaname, tablename;
"
```

#### Vacuum and Maintenance

```bash
# Manual VACUUM (frees up space)
docker exec -i supabase-db psql -U postgres -c "VACUUM VERBOSE ANALYZE;"

# VACUUM specific table
docker exec -i supabase-db psql -U postgres -c "VACUUM VERBOSE ANALYZE table_name;"

# VACUUM FULL (more aggressive, locks table)
docker exec -i supabase-db psql -U postgres -c "VACUUM FULL VERBOSE ANALYZE table_name;"

# Check bloat
docker exec -i supabase-db psql -U postgres -c "
  SELECT schemaname, tablename,
         pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
         n_live_tup, n_dead_tup
  FROM pg_stat_user_tables
  ORDER BY n_dead_tup DESC
  LIMIT 10;
"
```

---

### 5. Redis Operations

#### Connection and Health

```bash
# Connect to Redis
docker exec -it supabase-redis redis-cli

# Ping test
redis-cli PING  # Should return PONG

# Get info
redis-cli INFO

# Monitor commands in real-time
redis-cli MONITOR

# Check memory usage
redis-cli INFO memory
```

#### Key Management

```bash
# List all keys (CAREFUL in production - can be slow)
redis-cli KEYS '*'

# Count keys
redis-cli DBSIZE

# Get key info
redis-cli TYPE key_name
redis-cli TTL key_name

# Delete key
redis-cli DEL key_name

# Set key with TTL
redis-cli SETEX key_name 3600 "value"  # 1 hour TTL
```

#### Backup and Restore

```bash
# Trigger manual snapshot
redis-cli BGSAVE

# Check last save time
redis-cli LASTSAVE

# Backup RDB file
cp /var/lib/redis/dump.rdb /backup/redis-backup-$(date +%Y%m%d).rdb

# Restore (stop Redis first)
docker-compose stop redis
cp /backup/redis-backup.rdb /var/lib/redis/dump.rdb
docker-compose start redis
```

---

### 6. Qdrant Operations

#### Collection Management

```bash
# List collections
curl http://localhost:6333/collections

# Get collection info
curl http://localhost:6333/collections/collection_name

# Create collection
curl -X PUT http://localhost:6333/collections/collection_name \
  -H 'Content-Type: application/json' \
  -d '{
    "vectors": {
      "size": 1536,
      "distance": "Cosine"
    }
  }'

# Delete collection
curl -X DELETE http://localhost:6333/collections/collection_name
```

#### Backup and Snapshots

```bash
# Create snapshot
curl -X POST http://localhost:6333/collections/collection_name/snapshots

# List snapshots
curl http://localhost:6333/collections/collection_name/snapshots

# Download snapshot
curl http://localhost:6333/collections/collection_name/snapshots/snapshot_name \
  -o snapshot.tar.gz

# Restore from snapshot
curl -X PUT http://localhost:6333/collections/collection_name \
  -F 'snapshot=@snapshot.tar.gz'
```

---

### 7. Query Optimization

#### Finding Slow Queries

```bash
# Enable pg_stat_statements (if not enabled)
docker exec -i supabase-db psql -U postgres -c "
  CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
"

# Reset statistics
docker exec -i supabase-db psql -U postgres -c "
  SELECT pg_stat_statements_reset();
"

# Find slow queries
docker exec -i supabase-db psql -U postgres -c "
  SELECT
    substring(query, 1, 100) as short_query,
    calls,
    total_time,
    mean_time,
    max_time
  FROM pg_stat_statements
  ORDER BY mean_time DESC
  LIMIT 20;
"
```

#### Index Optimization

```bash
# Find missing indexes
docker exec -i supabase-db psql -U postgres -c "
  SELECT
    schemaname, tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
    seq_scan, seq_tup_read,
    idx_scan, idx_tup_fetch
  FROM pg_stat_user_tables
  WHERE seq_scan > idx_scan
  ORDER BY seq_scan DESC
  LIMIT 10;
"

# Create index
docker exec -i supabase-db psql -U postgres -c "
  CREATE INDEX CONCURRENTLY idx_name ON table_name(column_name);
"

# Check index size
docker exec -i supabase-db psql -U postgres -c "
  SELECT schemaname, tablename, indexname,
         pg_size_pretty(pg_relation_size(indexrelid)) as index_size
  FROM pg_stat_user_indexes
  ORDER BY pg_relation_size(indexrelid) DESC
  LIMIT 10;
"
```

---

### 8. Troubleshooting Common Issues

#### "Too many connections"

```bash
# Check max connections
docker exec -i supabase-db psql -U postgres -c "SHOW max_connections;"

# View current connections
docker exec -i supabase-db psql -U postgres -c "
  SELECT count(*) FROM pg_stat_activity;
"

# Kill connections to specific database
docker exec -i supabase-db psql -U postgres -c "
  SELECT pg_terminate_backend(pid)
  FROM pg_stat_activity
  WHERE datname = 'database_name';
"

# Increase max_connections (requires restart)
# Edit docker-compose.yml:
# command: postgres -c max_connections=200
```

#### "Disk full"

```bash
# Check disk usage
df -h

# Find largest tables
docker exec -i supabase-db psql -U postgres -c "
  SELECT schemaname, tablename,
         pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
  FROM pg_tables
  WHERE schemaname = 'public'
  ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
  LIMIT 10;
"

# VACUUM to reclaim space
docker exec -i supabase-db psql -U postgres -c "VACUUM FULL VERBOSE;"

# Clear old backups
find shared/backups/ -type f -mtime +30 -delete
```

#### "Lock timeout"

```bash
# Find blocking queries
docker exec -i supabase-db psql -U postgres -c "
  SELECT blocked_locks.pid AS blocked_pid,
         blocking_locks.pid AS blocking_pid,
         blocked_activity.query AS blocked_query,
         blocking_activity.query AS blocking_query
  FROM pg_catalog.pg_locks blocked_locks
  JOIN pg_catalog.pg_stat_activity blocked_activity ON blocked_activity.pid = blocked_locks.pid
  JOIN pg_catalog.pg_locks blocking_locks
    ON blocking_locks.locktype = blocked_locks.locktype
    AND blocking_locks.relation IS NOT DISTINCT FROM blocked_locks.relation
    AND blocking_locks.page IS NOT DISTINCT FROM blocked_locks.page
    AND blocking_locks.tuple IS NOT DISTINCT FROM blocked_locks.tuple
    AND blocking_locks.virtualxid IS NOT DISTINCT FROM blocked_locks.virtualxid
    AND blocking_locks.transactionid IS NOT DISTINCT FROM blocked_locks.transactionid
    AND blocking_locks.classid IS NOT DISTINCT FROM blocked_locks.classid
    AND blocking_locks.objid IS NOT DISTINCT FROM blocked_locks.objid
    AND blocking_locks.objsubid IS NOT DISTINCT FROM blocked_locks.objsubid
    AND blocking_locks.pid != blocked_locks.pid
  JOIN pg_catalog.pg_stat_activity blocking_activity ON blocking_activity.pid = blocking_locks.pid
  WHERE NOT blocked_locks.granted;
"

# Kill blocking query
docker exec -i supabase-db psql -U postgres -c "SELECT pg_terminate_backend(pid);"
```

---

## 🔗 Related Skills

- `docker-operations` - Container management
- `postgresql-advanced-patterns` - Advanced SQL queries
- `troubleshooting-guide` - General troubleshooting

---

## 📝 Maintenance Tasks Checklist

**Daily**:
- [ ] Check automated backup status
- [ ] Monitor database connections
- [ ] Review slow query log

**Weekly**:
- [ ] Verify backup integrity (restore test)
- [ ] Check database size growth
- [ ] Review unused indexes

**Monthly**:
- [ ] VACUUM ANALYZE all databases
- [ ] Review and cleanup old backups
- [ ] Update PostgreSQL statistics
- [ ] Test disaster recovery procedure

---

## 📖 Additional Resources

- PostgreSQL Docs: https://www.postgresql.org/docs/15/
- Supabase Docs: https://supabase.com/docs
- Redis Docs: https://redis.io/documentation
- Qdrant Docs: https://qdrant.tech/documentation/

---

## 🚨 Emergency Contacts

**Database corruption or data loss**:
1. Stop all services immediately
2. Restore from latest backup
3. Document incident in `/home/badfaceserverlap/docker/docs/incidents/`
4. Review backup procedures

**Need help**:
- Check incident reports: `docs/incidents/2025-10-25-postgresql-data-loss.md`
- Review guides: `docs/guides/postgres-upgrade-workflow.md`
