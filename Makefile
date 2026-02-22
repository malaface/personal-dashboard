.PHONY: dev prod prod-build down up pull logs logs-app db-shell backup status

# ─── Flujo de actualización: make down → make pull → make up ───

# Detener todo (--profile app asegura que también detenga la app)
down:
	docker compose --profile app down

# Traer últimos cambios + instalar dependencias si cambiaron
pull:
	git pull origin main
	cd code && npm install --prefer-offline

# Levantar DB, aplicar migraciones, rebuild y arrancar todo
up:
	@echo "→ Levantando DB + Redis..."
	docker compose up -d
	@echo "→ Esperando a que la DB esté lista..."
	@until docker exec dashboard-postgres pg_isready -U dashboard_user -d dashboard > /dev/null 2>&1; do sleep 1; done
	@echo "→ Aplicando migraciones..."
	cd code && npx prisma generate && npx prisma migrate deploy
	@echo "→ Reconstruyendo y levantando app..."
	docker compose --profile app up -d --build nextjs-dashboard
	@echo "✓ Todo listo — app en http://localhost:3003"

# ─── Desarrollo ───

# Solo DB + Redis (la app corre con npm run dev)
dev:
	docker compose up -d

# ─── Producción (manual) ───

# Todo el stack sin rebuild
prod:
	docker compose --profile app up -d

# Todo el stack con rebuild de la imagen
prod-build:
	docker compose --profile app up -d --build nextjs-dashboard

# ─── Utilidades ───

# Logs de todos los servicios
logs:
	docker compose --profile app logs -f

# Logs solo de la app
logs-app:
	docker compose logs -f nextjs-dashboard

# Shell de PostgreSQL
db-shell:
	docker exec -it dashboard-postgres psql -U dashboard_user -d dashboard

# Backup de la base de datos
backup:
	docker exec dashboard-postgres pg_dump -U dashboard_user -Fc dashboard > backups/dashboard-$$(date +%Y%m%d).dump

# Estado de los contenedores
status:
	docker compose --profile app ps
