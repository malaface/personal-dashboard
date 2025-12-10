# docker-operations

---
**version**: 1.0.0
**last_updated**: 2025-12-09
**category**: Infrastructure & DevOps
**priority**: CRÍTICA
**dependencies**: docker, docker-compose
---

## 📖 Overview

Complete Docker container operations for AI Platform and Monitoring stack, including service management, health checks, logs analysis, network troubleshooting, and port mapping reference.

---

## 🎯 When to Invoke This Skill

**Auto-invoke when detecting**:
- Keywords: docker, container, service, logs, restart, up, down, ps
- Commands: docker-compose, docker ps, docker logs, docker exec
- Phrases: "start services", "restart container", "check logs"

**Manual invoke when**:
- Starting/stopping services
- Troubleshooting container issues
- Checking service health
- Analyzing logs

---

## 📦 Versions

- **Docker**: `24.x` or higher
- **Docker Compose**: `2.x` or higher (v2 syntax)

---

## 🚨 Critical Rules (NEVER Break)

1. ❌ **NUNCA usar `docker system prune -a` sin backup**
   - Elimina TODAS las imágenes no usadas
   - Puede romper el stack completo

2. ❌ **NUNCA eliminar volúmenes sin confirmar 3 veces**
   ```bash
   # Esto borra DATA permanentemente
   docker volume rm volume_name
   ```

3. ❌ **NUNCA hacer `docker-compose down -v` en producción**
   - `-v` elimina volúmenes (DATA LOSS)
   - Usar solo `docker-compose down`

4. ❌ **NUNCA modificar archivos en volúmenes directamente**
   - Usar docker exec para modificar configs
   - O mapear volúmenes correctamente

5. ❌ **NUNCA exponer puertos sin firewall**
   - Usar solo localhost binding: `127.0.0.1:port:port`
   - O configurar firewall apropiado

6. ✅ **SIEMPRE verificar health antes de commits**
7. ✅ **SIEMPRE usar project names** (`-p localai`)
8. ✅ **SIEMPRE revisar logs después de cambios**
9. ✅ **SIEMPRE hacer backup antes de cambios mayores**
10. ✅ **SIEMPRE usar `docker-compose config`** para validar YAML

---

## 📚 AI Platform Management

### Service Overview

**AI Platform** (`-p localai`):
- n8n (5678) - Workflow automation
- Flowise (3001) - AI chatflows
- Open WebUI (8080) - LLM interface
- Supabase Kong (8000) - API gateway
- Supabase DB (5432) - PostgreSQL
- Redis (6379) - Caching
- Qdrant (6333, 6334) - Vector database
- SearXNG (8081) - Meta search

### Starting Services

```bash
cd /home/badfaceserverlap/docker/contenedores/projects/ai-platform

# Start with CPU profile (default)
python start_services.py --profile cpu

# Start with NVIDIA GPU support
python start_services.py --profile gpu-nvidia

# Start in production mode
python start_services.py --environment public

# Manual start (if script not available)
docker-compose -p localai -f docker-compose.yml --profile cpu up -d
```

### Stopping Services

```bash
cd /home/badfaceserverlap/docker/contenedores/projects/ai-platform

# Stop all services (keeps data)
docker-compose -p localai down

# Stop specific service
docker-compose -p localai stop n8n

# Stop and remove orphan containers
docker-compose -p localai down --remove-orphans
```

### Restarting Services

```bash
# Restart all AI Platform services
docker-compose -p localai restart

# Restart specific service
docker-compose -p localai restart flowise

# Hard restart (down + up)
docker-compose -p localai down && python start_services.py --profile cpu
```

---

## 📊 Monitoring Stack Management

### Service Overview

**Monitoring**:
- Prometheus (9090) - Metrics collection
- Grafana (3002) - Visualization (admin/admin123)
- AlertManager (9093) - Alerting
- Node Exporter (9100) - System metrics
- cAdvisor (8082) - Container metrics
- Blackbox Exporter (9115) - HTTP probes

### Starting Monitoring

```bash
cd /home/badfaceserverlap/docker/contenedores/shared/monitoring

# Start monitoring stack
docker-compose -f docker-compose.monitoring.yml up -d

# Verify all services
docker ps | grep -E "(prometheus|grafana|alertmanager)"
```

### Accessing Dashboards

```bash
# Grafana
http://localhost:3002
# Login: admin / admin123

# Prometheus
http://localhost:9090

# AlertManager
http://localhost:9093

# cAdvisor
http://localhost:8082
```

---

## 🔍 Container Health Checks

### View Running Containers

```bash
# All containers
docker ps

# AI Platform containers only
docker ps --filter "label=com.docker.compose.project=localai"

# Monitoring containers
docker ps | grep -E "(prometheus|grafana|alertmanager)"

# Show all (including stopped)
docker ps -a

# With custom format
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
```

### Health Status

```bash
# Check specific container health
docker inspect --format='{{.State.Health.Status}}' container_name

# View health check logs
docker inspect --format='{{range .State.Health.Log}}{{.Output}}{{end}}' container_name

# All unhealthy containers
docker ps --filter "health=unhealthy"
```

### Resource Usage

```bash
# Real-time resource usage
docker stats

# Specific containers
docker stats n8n flowise supabase-db

# One-time snapshot
docker stats --no-stream

# With custom format
docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
```

---

## 📋 Logs Analysis

### Viewing Logs

```bash
# Follow logs (real-time)
docker logs -f container_name

# Last 100 lines
docker logs --tail 100 container_name

# Since specific time
docker logs --since 1h container_name
docker logs --since "2025-12-09T10:00:00" container_name

# With timestamps
docker logs -t container_name

# All AI Platform logs
docker-compose -p localai logs -f

# Specific service logs
docker-compose -p localai logs -f n8n
```

### Searching Logs

```bash
# Search for errors
docker logs container_name 2>&1 | grep -i error

# Search for specific pattern
docker logs container_name 2>&1 | grep "connection refused"

# Count errors
docker logs container_name 2>&1 | grep -c "ERROR"

# Save logs to file
docker logs container_name > /tmp/container.log 2>&1
```

---

## 🔧 Container Operations

### Executing Commands

```bash
# Interactive shell
docker exec -it container_name /bin/bash
docker exec -it container_name /bin/sh  # If bash not available

# Run command
docker exec container_name ls -la /app

# As specific user
docker exec -u root container_name whoami

# PostgreSQL commands
docker exec -it supabase-db psql -U postgres

# Redis commands
docker exec -it supabase-redis redis-cli
```

### Copying Files

```bash
# Copy from container to host
docker cp container_name:/path/in/container /path/on/host

# Copy from host to container
docker cp /path/on/host container_name:/path/in/container

# Example: backup n8n workflows
docker cp n8n:/home/node/.n8n/workflows/ ./n8n-backup/
```

### Inspecting Containers

```bash
# Full inspect
docker inspect container_name

# Specific field
docker inspect --format='{{.NetworkSettings.IPAddress}}' container_name
docker inspect --format='{{.Config.Env}}' container_name
docker inspect --format='{{.Mounts}}' container_name
```

---

## 🌐 Network Operations

### Network Overview

**Networks**:
- `localai_default` - AI Platform services
- `monitoring` - Monitoring stack

### Network Commands

```bash
# List networks
docker network ls

# Inspect network
docker network inspect localai_default

# Connect container to network
docker network connect network_name container_name

# Disconnect
docker network disconnect network_name container_name

# View container's networks
docker inspect --format='{{range $k, $v := .NetworkSettings.Networks}}{{$k}} {{end}}' container_name
```

### Port Mapping

```bash
# View all port mappings
docker ps --format "table {{.Names}}\t{{.Ports}}"

# Specific container ports
docker port container_name

# Test port connectivity
curl -I http://localhost:3001  # Flowise
curl -I http://localhost:5678  # n8n
```

---

## 📦 Volume Management

### Volume Operations

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect volume_name

# Check volume size
docker system df -v

# Prune unused volumes (CAREFUL - data loss!)
docker volume prune  # Asks confirmation
```

### Backup Volumes

```bash
# Backup specific volume
docker run --rm -v volume_name:/data -v $(pwd):/backup \
  alpine tar czf /backup/volume-backup.tar.gz /data

# Restore volume
docker run --rm -v volume_name:/data -v $(pwd):/backup \
  alpine tar xzf /backup/volume-backup.tar.gz -C /data
```

---

## 🧹 Cleanup Operations

### Safe Cleanup

```bash
# Remove stopped containers
docker container prune

# Remove unused images
docker image prune

# Remove unused networks
docker network prune

# Remove unused volumes (CAREFUL!)
docker volume prune

# Combined (interactive)
docker system prune
```

### Dangerous Cleanup (Use with caution!)

```bash
# Remove ALL stopped containers, unused networks, dangling images
docker system prune -a  # Asks confirmation

# Nuclear option (removes EVERYTHING unused)
docker system prune -a --volumes  # VERY DANGEROUS
```

---

## 🚨 Troubleshooting

### Container Won't Start

```bash
# Check logs for errors
docker logs container_name

# Check if port is in use
netstat -tuln | grep port_number
lsof -i :port_number

# Check resource limits
docker stats --no-stream

# Validate docker-compose.yml
cd projects/ai-platform
docker-compose config

# Check docker daemon
systemctl status docker
```

### Container Keeps Restarting

```bash
# View restart count
docker inspect --format='{{.RestartCount}}' container_name

# View last exit code
docker inspect --format='{{.State.ExitCode}}' container_name

# Disable restart to debug
docker update --restart=no container_name

# Check logs for crash reason
docker logs --tail 500 container_name
```

### Network Issues

```bash
# Test DNS resolution
docker exec container_name nslookup google.com

# Test connectivity between containers
docker exec container1 ping container2

# Check network configuration
docker network inspect localai_default

# Restart networking
docker network disconnect localai_default container_name
docker network connect localai_default container_name
```

### Performance Issues

```bash
# Check resource usage
docker stats --no-stream

# Check disk usage
docker system df

# Check logs for bottlenecks
docker logs container_name | grep -i "slow\|timeout\|waiting"

# Limit resources (if needed)
docker update --memory="2g" --cpus="1.5" container_name
```

---

## 📊 Port Mapping Reference

### AI Platform Ports

| Service | Internal Port | External Port | Access |
|---------|--------------|---------------|--------|
| Flowise | 3000 | 3001 | http://localhost:3001 |
| n8n | 5678 | 5678 | http://localhost:5678 |
| Open WebUI | 8080 | 8080 | http://localhost:8080 |
| Supabase Kong | 8000 | 8000 | http://localhost:8000 |
| SearXNG | 8080 | 8081 | http://localhost:8081 |
| PostgreSQL | 5432 | 5432 | localhost:5432 |
| Redis | 6379 | 6379 | localhost:6379 |
| Qdrant API | 6333 | 6333 | http://localhost:6333 |
| Qdrant gRPC | 6334 | 6334 | localhost:6334 |

### Monitoring Ports

| Service | Port | Access |
|---------|------|--------|
| Grafana | 3002 | http://localhost:3002 |
| Prometheus | 9090 | http://localhost:9090 |
| AlertManager | 9093 | http://localhost:9093 |
| Node Exporter | 9100 | http://localhost:9100/metrics |
| cAdvisor | 8082 | http://localhost:8082 |
| Blackbox Exporter | 9115 | http://localhost:9115 |

---

## 🔗 Related Skills

- `database-management` - PostgreSQL operations
- `git-workflow-manager` - Commit changes to docker-compose files
- `troubleshooting-guide` - Advanced debugging

---

## ✅ Health Check Script

**MANDATORY before every commit:**

```bash
cd /home/badfaceserverlap/docker/contenedores
bash shared/scripts/health-check.sh
```

**What it checks**:
- All containers running
- No containers restarting
- All health checks passing
- All services accessible
- No port conflicts

---

## 📖 Additional Resources

- Docker Docs: https://docs.docker.com/
- Docker Compose Docs: https://docs.docker.com/compose/
- Best Practices: https://docs.docker.com/develop/dev-best-practices/
