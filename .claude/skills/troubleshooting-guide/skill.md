# troubleshooting-guide

---
**version**: 1.0.0
**last_updated**: 2025-12-09
**category**: Support
**priority**: BAJA
---

## 📖 Overview

Comprehensive troubleshooting guide for common issues: port conflicts, database errors, service failures, RLS policy errors.

---

## 🔧 Common Issues

### Port Conflicts
\`\`\`bash
netstat -tuln | grep PORT
lsof -ti:PORT | xargs kill -9
\`\`\`

### Database Connection
\`\`\`bash
docker ps | grep supabase-db
docker logs supabase-db --tail 50
\`\`\`

### Service Failures
\`\`\`bash
docker logs container_name
docker-compose restart service_name
\`\`\`
