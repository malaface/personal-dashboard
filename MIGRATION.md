# Migration Notes

## Original Location
- **Old Path:** `/home/badfaceserverlap/docker/contenedores/projects/personal-dashboard-project/`
- **Old Repository:** docker-contenedores (submodule)
- **Migration Date:** 2025-12-10

## New Location
- **New Path:** `/home/badfaceserverlap/personal-dashboard/`
- **New Repository:** personal-dashboard (independent)
- **GitHub:** https://github.com/malaface/personal-dashboard (private)

## Infrastructure Dependencies

This project optionally integrates with existing infrastructure:

### Required Services (when deployed)
- PostgreSQL 5433 (separate instance)
- Redis (separate instance for sessions)

### Optional AI Platform Integration
- n8n (port 5678) - Workflow automation
- Flowise (port 3001) - Chatflow builder
- Qdrant (port 6333/6334) - Vector database
- Redis (port 6379) - Shared cache

### Monitoring Integration (optional)
- Prometheus (port 9090)
- Grafana (port 3002)

**Note:** All AI Platform integrations are optional. The dashboard can run standalone with just PostgreSQL + Redis.

## Development Status
- Phase 0: ✅ COMPLETED (Security Hardening)
- Phase 1-5: 📋 PENDING (See /fases/ directory)
