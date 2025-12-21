# Cloudflare Tunnel Setup Guide - Personal Dashboard

**Date:** 2025-12-21
**Purpose:** Expose Personal Dashboard to Internet via Cloudflare Tunnel
**Status:** Ready for Configuration

---

## 📋 Overview

Este proyecto está configurado para usar **Cloudflare Tunnel (cloudflared)** para exponer la aplicación de forma segura sin abrir puertos en el firewall.

### Ventajas de Cloudflare Tunnel

- ✅ **Sin puertos abiertos** - No necesitas configurar firewall
- ✅ **SSL automático** - HTTPS gratis de Cloudflare
- ✅ **DDoS protection** - Protección incluida
- ✅ **Sin IP pública** - Tu servidor permanece oculto
- ✅ **Múltiples servicios** - Exponer dashboard, n8n, Flowise, etc.
- ✅ **Gratis** - Plan gratuito de Cloudflare

---

## 🎯 Estado Actual

### ✅ Completado

- [x] Dashboard desplegado en Docker (puerto 3003)
- [x] PostgreSQL dedicado (puerto 5435)
- [x] Health checks funcionando
- [x] Migraciones aplicadas (7)
- [x] Catálogo seeded (76 items)
- [x] Configuración de Cloudflare Tunnel preparada
- [x] Docker Compose configurado

### ⏳ Pendiente (Requiere tu Acción)

- [ ] Cuenta de Cloudflare (gratis)
- [ ] Dominio en Cloudflare
- [ ] Instalar cloudflared CLI
- [ ] Crear tunnel en Cloudflare
- [ ] Obtener credenciales del tunnel
- [ ] Actualizar configuración con tu dominio
- [ ] Iniciar tunnel

---

## 🚀 Guía de Configuración

### Paso 1: Requisitos Previos

#### 1.1 Cuenta de Cloudflare

Si no tienes cuenta:
1. Ir a https://dash.cloudflare.com/sign-up
2. Crear cuenta gratuita
3. Verificar email

#### 1.2 Dominio en Cloudflare

**Opción A: Tienes un dominio**
1. Ir a Cloudflare Dashboard
2. "Add a Site"
3. Ingresar tu dominio
4. Seguir instrucciones para cambiar nameservers
5. Esperar propagación DNS (~24 horas max)

**Opción B: No tienes dominio**
1. Comprar dominio (ej: Namecheap, GoDaddy, etc.)
2. Seguir Opción A

**Opción C: Usar subdominio de Cloudflare (Testing)**
Cloudflare asigna subdominios temporales para testing:
- Formato: `tunnel-name.cfargotunnel.com`
- Gratis pero no personalizable

---

### Paso 2: Instalación de cloudflared

#### 2.1 Instalar cloudflared en tu servidor

```bash
# Descargar cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb

# Instalar
sudo dpkg -i cloudflared-linux-amd64.deb

# Verificar instalación
cloudflared --version
```

Salida esperada:
```
cloudflared version 2024.x.x
```

---

### Paso 3: Autenticación con Cloudflare

```bash
# Autenticar con tu cuenta de Cloudflare
cloudflared tunnel login
```

Esto abrirá un navegador:
1. Selecciona tu dominio
2. Autoriza cloudflared
3. Se descargará un certificado a `~/.cloudflared/cert.pem`

**Verificación:**
```bash
ls -la ~/.cloudflared/cert.pem
```

---

### Paso 4: Crear el Tunnel

```bash
# Crear tunnel con nombre descriptivo
cloudflared tunnel create personal-dashboard
```

**Salida esperada:**
```
Tunnel credentials written to /home/user/.cloudflared/TUNNEL_ID.json
Created tunnel personal-dashboard with id TUNNEL_ID
```

**IMPORTANTE:** Guarda el `TUNNEL_ID`, lo necesitarás después.

---

### Paso 5: Copiar Credenciales al Proyecto

```bash
# Copiar archivo de credenciales al directorio del proyecto
cp ~/.cloudflared/TUNNEL_ID.json \
   /home/badfaceserverlap/personal-dashboard/code/cloudflared-credentials.json

# Verificar
ls -la /home/badfaceserverlap/personal-dashboard/code/cloudflared-credentials.json
```

---

### Paso 6: Configurar DNS en Cloudflare

#### 6.1 Vía CLI (Recomendado)

```bash
# Crear registro DNS para el dashboard
cloudflared tunnel route dns personal-dashboard dashboard.tudominio.com
```

**Reemplaza `tudominio.com` con tu dominio real**

#### 6.2 Vía Cloudflare Dashboard (Alternativa)

1. Ir a Cloudflare Dashboard → Tu dominio → DNS
2. Add record:
   - Type: `CNAME`
   - Name: `dashboard` (o el subdominio que quieras)
   - Target: `TUNNEL_ID.cfargotunnel.com`
   - Proxy status: ✅ Proxied (naranja)
3. Save

---

### Paso 7: Actualizar Configuración del Proyecto

#### 7.1 Editar cloudflare-tunnel-config.yml

```bash
cd /home/badfaceserverlap/personal-dashboard/code

# Editar archivo de configuración
nano cloudflare-tunnel-config.yml
```

**Actualizar estas líneas:**

```yaml
# ANTES (línea 3):
# tunnel: <TUNNEL_ID>

# DESPUÉS:
tunnel: TU_TUNNEL_ID_AQUI

# ANTES (línea 4):
# credentials-file: /etc/cloudflared/credentials.json

# DESPUÉS:
credentials-file: /etc/cloudflared/credentials.json

# ANTES (línea 9):
  - hostname: dashboard.yourdomain.com

# DESPUÉS:
  - hostname: dashboard.tudominio.com  # Tu dominio real
```

**Ejemplo completo:**
```yaml
tunnel: 12345678-1234-1234-1234-123456789abc
credentials-file: /etc/cloudflared/credentials.json

ingress:
  - hostname: dashboard.malacaran8n.uk
    service: http://personal-dashboard:3000
    originRequest:
      noTLSVerify: true
      connectTimeout: 30s

  - service: http_status:404

loglevel: info
metrics: 0.0.0.0:9199
```

#### 7.2 Actualizar Variables de Entorno

```bash
# Editar docker-compose.production.yml
nano docker-compose.production.yml
```

**Cambiar la variable NEXTAUTH_URL:**

```yaml
# ANTES (línea 33):
NEXTAUTH_URL: "http://localhost:3003"

# DESPUÉS:
NEXTAUTH_URL: "https://dashboard.tudominio.com"
```

**O mejor aún, generar un nuevo NEXTAUTH_SECRET:**

```bash
# Generar nuevo secret para producción
openssl rand -base64 32
```

Copiar el resultado y actualizar en docker-compose.production.yml:
```yaml
NEXTAUTH_SECRET: "TU_NUEVO_SECRET_AQUI"
```

---

### Paso 8: Iniciar el Tunnel

#### 8.1 Iniciar todo el stack con Cloudflare Tunnel

```bash
cd /home/badfaceserverlap/personal-dashboard/code

# Detener stack actual (si está corriendo)
docker-compose -f docker-compose.production.yml down

# Iniciar con Cloudflare Tunnel
docker-compose \
  -f docker-compose.production.yml \
  -f docker-compose.cloudflare.yml \
  up -d
```

**Verificar que todos los servicios estén UP:**
```bash
docker-compose \
  -f docker-compose.production.yml \
  -f docker-compose.cloudflare.yml \
  ps
```

Deberías ver:
```
NAME                   STATUS
dashboard-db           Up (healthy)
personal-dashboard     Up
cloudflared-dashboard  Up (healthy)
```

---

### Paso 9: Verificación

#### 9.1 Verificar Tunnel Conectado

```bash
# Ver logs del tunnel
docker logs cloudflared-dashboard -f
```

**Salida esperada:**
```
2024-12-21 INFO Connection registered connIndex=0 location=IAD
2024-12-21 INFO Connection registered connIndex=1 location=DFW
2024-12-21 INFO Connection registered connIndex=2 location=ORD
2024-12-21 INFO Connection registered connIndex=3 location=ATL
```

Si ves esas conexiones, ¡el tunnel está activo! 🎉

#### 9.2 Verificar Dashboard Accesible

```bash
# Desde tu navegador, visita:
https://dashboard.tudominio.com
```

Deberías ver la página de login del dashboard.

#### 9.3 Verificar Health Endpoint

```bash
curl https://dashboard.tudominio.com/api/health
```

**Respuesta esperada:**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-21T...",
  "checks": {
    "database": { "status": "healthy", "latency": 17 }
  }
}
```

#### 9.4 Verificar SSL

En tu navegador:
1. Ir a https://dashboard.tudominio.com
2. Click en el candado 🔒 en la barra de direcciones
3. Verificar certificado válido de Cloudflare

---

## 🔧 Configuración Avanzada (Opcional)

### Exponer Múltiples Servicios

Si quieres exponer n8n, Flowise, etc.:

#### Editar cloudflare-tunnel-config.yml:

```yaml
ingress:
  # Dashboard
  - hostname: dashboard.tudominio.com
    service: http://personal-dashboard:3000

  # n8n Automation
  - hostname: n8n.tudominio.com
    service: http://n8n:5678
    originRequest:
      noTLSVerify: true

  # Flowise Chatbot Builder
  - hostname: flowise.tudominio.com
    service: http://flowise:3000
    originRequest:
      noTLSVerify: true

  # Grafana Monitoring
  - hostname: grafana.tudominio.com
    service: http://grafana:3000
    originRequest:
      noTLSVerify: true

  - service: http_status:404
```

#### Crear DNS para cada servicio:

```bash
cloudflared tunnel route dns personal-dashboard n8n.tudominio.com
cloudflared tunnel route dns personal-dashboard flowise.tudominio.com
cloudflared tunnel route dns personal-dashboard grafana.tudominio.com
```

#### Reiniciar tunnel:

```bash
docker-compose \
  -f docker-compose.production.yml \
  -f docker-compose.cloudflare.yml \
  restart cloudflared
```

---

## 🛠️ Comandos Útiles

### Ver Logs

```bash
# Dashboard
docker logs personal-dashboard -f

# Database
docker logs dashboard-db -f

# Cloudflare Tunnel
docker logs cloudflared-dashboard -f

# Todos
docker-compose -f docker-compose.production.yml -f docker-compose.cloudflare.yml logs -f
```

### Reiniciar Servicios

```bash
# Reiniciar solo dashboard
docker-compose -f docker-compose.production.yml restart dashboard

# Reiniciar solo tunnel
docker-compose -f docker-compose.cloudflare.yml restart cloudflared

# Reiniciar todo
docker-compose -f docker-compose.production.yml -f docker-compose.cloudflare.yml restart
```

### Detener Todo

```bash
docker-compose \
  -f docker-compose.production.yml \
  -f docker-compose.cloudflare.yml \
  down
```

### Ver Tunnels Activos

```bash
# Listar todos tus tunnels
cloudflared tunnel list
```

### Ver Conexiones del Tunnel

```bash
cloudflared tunnel info personal-dashboard
```

---

## 🔐 Seguridad

### Configuración de Cloudflare

1. **Habilitar Web Application Firewall (WAF)**
   - Cloudflare Dashboard → Security → WAF
   - Enable WAF Managed Rules

2. **Configurar Rate Limiting**
   - Security → WAF → Rate limiting rules
   - Ejemplo: 100 requests/min por IP

3. **Habilitar Bot Protection**
   - Security → Bots
   - Enable Bot Fight Mode (gratis)

4. **Configurar Access Policies (Opcional)**
   - Zero Trust → Access → Applications
   - Agregar authentication layer

### Actualizar Secrets

**IMPORTANTE:** Genera nuevos secrets para producción:

```bash
# Generar NEXTAUTH_SECRET
openssl rand -base64 32

# Generar nueva password de PostgreSQL (si quieres cambiarla)
openssl rand -base64 32
```

Actualiza en `docker-compose.production.yml`.

---

## 📊 Monitoring

### Métricas de Cloudflare Tunnel

El tunnel expone métricas en el puerto 9199:

```bash
# Ver métricas
curl http://localhost:9199/metrics
```

### Integrar con Prometheus

Si quieres monitear el tunnel con tu Prometheus:

```yaml
# Agregar a prometheus.yml
scrape_configs:
  - job_name: 'cloudflared'
    static_configs:
      - targets: ['cloudflared-dashboard:9199']
```

---

## 🐛 Troubleshooting

### Error: "Tunnel credentials file not found"

**Solución:**
```bash
# Verificar que el archivo existe
ls -la /home/badfaceserverlap/personal-dashboard/code/cloudflared-credentials.json

# Si no existe, copiar nuevamente
cp ~/.cloudflared/TUNNEL_ID.json \
   /home/badfaceserverlap/personal-dashboard/code/cloudflared-credentials.json
```

### Error: "Unable to reach the origin service"

**Causa:** Dashboard no está accesible desde el tunnel

**Solución:**
```bash
# Verificar que dashboard esté corriendo
docker ps | grep personal-dashboard

# Verificar que esté en la misma red
docker network inspect ai-platform_default | grep personal-dashboard
docker network inspect ai-platform_default | grep cloudflared
```

### Error: "DNS resolution failed"

**Causa:** DNS no configurado correctamente

**Solución:**
```bash
# Verificar DNS en Cloudflare Dashboard
# O crear vía CLI:
cloudflared tunnel route dns personal-dashboard dashboard.tudominio.com
```

### Tunnel desconectado aleatoriamente

**Causa:** Problemas de red o configuración

**Solución:**
```bash
# Ver logs para identificar error
docker logs cloudflared-dashboard --tail 100

# Reiniciar tunnel
docker restart cloudflared-dashboard
```

---

## 📝 Checklist de Deployment

### Pre-Deployment
- [ ] Cuenta de Cloudflare creada
- [ ] Dominio agregado a Cloudflare
- [ ] DNS propagado
- [ ] cloudflared CLI instalado
- [ ] Tunnel creado
- [ ] Credenciales copiadas

### Configuration
- [ ] cloudflare-tunnel-config.yml actualizado con TUNNEL_ID
- [ ] Hostname configurado con tu dominio
- [ ] DNS CNAME creado
- [ ] NEXTAUTH_URL actualizado en docker-compose.production.yml
- [ ] NEXTAUTH_SECRET regenerado para producción

### Deployment
- [ ] Stack iniciado con Cloudflare Tunnel
- [ ] Todos los contenedores UP y healthy
- [ ] Logs del tunnel muestran conexiones activas
- [ ] Dashboard accesible desde https://dashboard.tudominio.com
- [ ] SSL válido (candado verde)
- [ ] Login funciona correctamente

### Post-Deployment
- [ ] WAF habilitado en Cloudflare
- [ ] Rate limiting configurado
- [ ] Bot protection habilitado
- [ ] Monitoring configurado
- [ ] Backups de base de datos configurados

---

## 🎉 Resultado Final

Una vez completado, tendrás:

```
┌─────────────────────────────────────────────┐
│   Internet Users                            │
│         ↓                                   │
│   https://dashboard.tudominio.com          │
│         ↓                                   │
│   Cloudflare Network                        │
│   ├─ SSL/TLS Encryption                    │
│   ├─ DDoS Protection                        │
│   ├─ WAF                                    │
│   └─ CDN                                    │
│         ↓                                   │
│   Cloudflare Tunnel (Encrypted)            │
│         ↓                                   │
│   Tu Servidor (Sin puertos abiertos)       │
│   ├─ personal-dashboard (Docker)           │
│   ├─ dashboard-db (PostgreSQL)             │
│   ├─ redis                                  │
│   ├─ n8n                                    │
│   ├─ flowise                                │
│   └─ qdrant                                 │
└─────────────────────────────────────────────┘

✅ Acceso público seguro
✅ Sin configuración de firewall
✅ SSL gratis
✅ DDoS protection
✅ Costo: $0/mes
```

---

## 📚 Recursos Adicionales

- [Cloudflare Tunnel Documentation](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/)
- [Cloudflared GitHub](https://github.com/cloudflare/cloudflared)
- [Cloudflare Zero Trust](https://developers.cloudflare.com/cloudflare-one/)
- [Cloudflare WAF](https://developers.cloudflare.com/waf/)

---

**Last Updated:** 2025-12-21
**Status:** Ready for User Configuration
**Next Step:** Follow Paso 1-9 above
