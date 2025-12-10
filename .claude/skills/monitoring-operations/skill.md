# monitoring-operations

---
**version**: 1.0.0
**last_updated**: 2025-12-09
**category**: Support
**priority**: BAJA
---

## 📖 Overview

Monitoring operations for Prometheus, Grafana, and AlertManager.

---

## 📊 Dashboards

**Grafana**: http://localhost:3002 (admin/admin123)
**Prometheus**: http://localhost:9090
**AlertManager**: http://localhost:9093

---

## 🔍 Common Queries

### Prometheus
\`\`\`promql
# Container CPU usage
rate(container_cpu_usage_seconds_total[5m])

# Memory usage
container_memory_usage_bytes
\`\`\`

### Management
\`\`\`bash
cd shared/monitoring
docker-compose -f docker-compose.monitoring.yml up -d
\`\`\`
