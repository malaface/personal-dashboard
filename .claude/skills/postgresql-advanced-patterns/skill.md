# postgresql-advanced-patterns

---
**version**: 1.0.0
**last_updated**: 2025-12-09
**category**: Backend Stack
**priority**: ALTA
**dependencies**: PostgreSQL 15.1
---

## 📖 Overview

Advanced PostgreSQL patterns for query optimization, indexing, full-text search, and complex SQL operations.

---

## 🎯 When to Invoke This Skill

**Auto-invoke when detecting**:
- Keywords: query optimization, index, CTE, full-text search, EXPLAIN
- Performance issues with database queries

---

## 📦 Versions

- **PostgreSQL**: `15.1` (Supabase managed)
- **Extensions**: pg_trgm, uuid-ossp, pgcrypto

---

## 🚨 Critical Rules

1. ❌ **NUNCA crear tablas sin primary key**
2. ❌ **NUNCA olvidar indexes en foreign keys**
3. ❌ **NUNCA usar SELECT * en producción**
4. ✅ **SIEMPRE usar transacciones para operaciones múltiples**
5. ✅ **SIEMPRE añadir constraints para integridad**

---

## 📖 Additional Resources

- PostgreSQL Docs: https://www.postgresql.org/docs/15/
