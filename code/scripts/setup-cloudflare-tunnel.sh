#!/bin/bash

# Cloudflare Tunnel Setup Helper Script
# This script helps configure Cloudflare Tunnel for Personal Dashboard

set -e

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Personal Dashboard - Cloudflare Tunnel Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if cloudflared is installed
if ! command -v cloudflared &> /dev/null; then
    echo "❌ cloudflared no está instalado"
    echo ""
    echo "Instalación:"
    echo "  wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb"
    echo "  sudo dpkg -i cloudflared-linux-amd64.deb"
    echo ""
    exit 1
fi

echo "✅ cloudflared está instalado ($(cloudflared --version))"
echo ""

# Check if authenticated
if [ ! -f ~/.cloudflared/cert.pem ]; then
    echo "❌ No estás autenticado con Cloudflare"
    echo ""
    echo "Ejecuta:"
    echo "  cloudflared tunnel login"
    echo ""
    exit 1
fi

echo "✅ Autenticado con Cloudflare"
echo ""

# List existing tunnels
echo "📋 Tunnels existentes:"
cloudflared tunnel list
echo ""

# Ask if user wants to create a new tunnel
read -p "¿Crear un nuevo tunnel? (y/n): " CREATE_TUNNEL

if [[ "$CREATE_TUNNEL" == "y" || "$CREATE_TUNNEL" == "Y" ]]; then
    read -p "Nombre del tunnel [personal-dashboard]: " TUNNEL_NAME
    TUNNEL_NAME=${TUNNEL_NAME:-personal-dashboard}

    echo "Creando tunnel '$TUNNEL_NAME'..."
    cloudflared tunnel create "$TUNNEL_NAME"

    # Get tunnel ID
    TUNNEL_ID=$(cloudflared tunnel list | grep "$TUNNEL_NAME" | awk '{print $1}')
    echo ""
    echo "✅ Tunnel creado con ID: $TUNNEL_ID"
    echo ""
else
    read -p "Ingresa el ID del tunnel existente: " TUNNEL_ID
fi

# Ask for domain
read -p "Ingresa tu dominio (ej: dashboard.tudominio.com): " DOMAIN

if [ -z "$DOMAIN" ]; then
    echo "❌ Dominio requerido"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Configuración"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Tunnel ID: $TUNNEL_ID"
echo "  Dominio:   $DOMAIN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Copy credentials
CRED_FILE=~/.cloudflared/${TUNNEL_ID}.json
PROJECT_DIR="/home/badfaceserverlap/personal-dashboard/code"

if [ -f "$CRED_FILE" ]; then
    echo "📋 Copiando credenciales..."
    cp "$CRED_FILE" "$PROJECT_DIR/cloudflared-credentials.json"
    echo "✅ Credenciales copiadas"
else
    echo "❌ Archivo de credenciales no encontrado: $CRED_FILE"
    exit 1
fi

# Update cloudflare-tunnel-config.yml
echo ""
echo "📝 Actualizando cloudflare-tunnel-config.yml..."

CONFIG_FILE="$PROJECT_DIR/cloudflare-tunnel-config.yml"

# Backup original
cp "$CONFIG_FILE" "$CONFIG_FILE.backup"

# Update tunnel ID
sed -i "s/# tunnel: <TUNNEL_ID>/tunnel: $TUNNEL_ID/" "$CONFIG_FILE"

# Update credentials file
sed -i "s|# credentials-file: /etc/cloudflared/credentials.json|credentials-file: /etc/cloudflared/credentials.json|" "$CONFIG_FILE"

# Update hostname
sed -i "s|dashboard.yourdomain.com|$DOMAIN|" "$CONFIG_FILE"

echo "✅ Configuración actualizada"

# Configure DNS
echo ""
read -p "¿Configurar DNS automáticamente? (y/n): " CONFIGURE_DNS

if [[ "$CONFIGURE_DNS" == "y" || "$CONFIGURE_DNS" == "Y" ]]; then
    echo "Configurando DNS..."
    cloudflared tunnel route dns "$TUNNEL_ID" "$DOMAIN"
    echo "✅ DNS configurado"
fi

# Generate new NEXTAUTH_SECRET
echo ""
echo "🔐 Generando nuevo NEXTAUTH_SECRET..."
NEW_SECRET=$(openssl rand -base64 32)
echo "✅ Nuevo secret generado"

# Update docker-compose.production.yml
echo ""
echo "📝 Actualizando docker-compose.production.yml..."
DOCKER_COMPOSE="$PROJECT_DIR/docker-compose.production.yml"

# Backup original
cp "$DOCKER_COMPOSE" "$DOCKER_COMPOSE.backup"

# Update NEXTAUTH_URL
sed -i "s|NEXTAUTH_URL: \"http://localhost:3003\"|NEXTAUTH_URL: \"https://$DOMAIN\"|" "$DOCKER_COMPOSE"

# Update NEXTAUTH_SECRET
sed -i "s|NEXTAUTH_SECRET: \"QLyBcsLeH0WURxp9/uhBlipxG8ipVutArstCXY1dL3g=\"|NEXTAUTH_SECRET: \"$NEW_SECRET\"|" "$DOCKER_COMPOSE"

echo "✅ docker-compose.production.yml actualizado"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Configuración Completa"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Resumen:"
echo "  • Credenciales copiadas"
echo "  • cloudflare-tunnel-config.yml actualizado"
echo "  • DNS configurado (si seleccionaste)"
echo "  • docker-compose.production.yml actualizado"
echo "  • Nuevo NEXTAUTH_SECRET generado"
echo ""
echo "🚀 Siguiente paso:"
echo ""
echo "  cd $PROJECT_DIR"
echo "  docker-compose -f docker-compose.production.yml -f docker-compose.cloudflare.yml up -d"
echo ""
echo "🌐 Tu dashboard estará disponible en:"
echo "  https://$DOMAIN"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
