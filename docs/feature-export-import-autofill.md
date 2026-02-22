# Feature Report: Export/Import + Auto-Fill de Entrenamientos

**Fecha:** 2025-01-27
**Estado:** Implementado
**Branch:** feature/github-actions-branch-workflow

---

## Resumen

Se implementaron dos mejoras principales al personal-dashboard:

1. **Export/Import de Datos** - Sistema de backup y restauración de datos del usuario
2. **Auto-Fill de Entrenamientos** - Muestra datos del último entrenamiento similar y permite auto-rellenar

---

## Feature 1: Export/Import de Datos

### Descripción

Sistema completo de backup que permite a los usuarios:
- Exportar todos sus datos en formato JSON
- Importar backups previos (modo merge o replace)
- Preview antes de importar para verificar contenido

### Archivos Creados

| Archivo | Descripción |
|---------|-------------|
| `lib/backup/types.ts` | Tipos TypeScript para el sistema de backup |
| `lib/backup/schemas.ts` | Schemas Zod para validación de backups |
| `lib/backup/export.ts` | Lógica de exportación de datos |
| `lib/backup/import.ts` | Lógica de importación y validación |
| `app/api/backup/export/route.ts` | API endpoint GET para descargar backup |
| `app/api/backup/preview/route.ts` | API endpoint POST para preview de import |
| `app/api/backup/import/route.ts` | API endpoint POST para importar datos |
| `components/settings/BackupManager.tsx` | UI para gestionar backups |

### Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `app/dashboard/settings/page.tsx` | Integración del BackupManager |
| `lib/audit/logger.ts` | Nuevos tipos de audit: DATA_EXPORTED, DATA_IMPORTED |

### Estructura del Backup (JSON)

```json
{
  "meta": {
    "version": "1.0.0",
    "exportDate": "2025-01-27T10:00:00Z",
    "userId": "cuid...",
    "userEmail": "user@example.com",
    "modules": ["profile", "workouts", "finance", "nutrition", "family", "catalog"]
  },
  "data": {
    "profile": { ... },
    "workouts": [ ... ],
    "workoutTemplates": [ ... ],
    "transactions": [ ... ],
    "investments": [ ... ],
    "budgets": [ ... ],
    "meals": [ ... ],
    "nutritionGoals": [ ... ],
    "mealTemplates": [ ... ],
    "familyMembers": [ ... ],
    "timeLogs": [ ... ],
    "events": [ ... ],
    "reminders": [ ... ],
    "catalogItems": [ ... ]
  }
}
```

### Modos de Importación

1. **Merge (por defecto)**: Agrega datos sin borrar los existentes
2. **Replace**: Borra todos los datos existentes antes de importar

### Seguridad

- Solo se exportan datos del usuario autenticado
- IDs se regeneran al importar (nuevos CUIDs)
- No se importa el userId del backup (siempre se usa el usuario actual)
- Validación estricta con Zod schemas
- Límite de archivo: 10MB
- Audit logging de todas las operaciones

---

## Feature 2: Auto-Fill de Entrenamientos

### Descripción

Sistema que muestra el historial de rendimiento para cada ejercicio:
- Muestra la última vez que se realizó el ejercicio
- Indica cambios de volumen (mejora/disminución)
- Muestra Personal Records (PRs)
- Botón para auto-rellenar con valores anteriores

### Archivos Creados

| Archivo | Descripción |
|---------|-------------|
| `lib/workouts/history.ts` | Queries de historial de ejercicios |
| `lib/workouts/progress.ts` | Cálculos de PRs y comparaciones |
| `app/api/exercises/history/route.ts` | API para historial de ejercicio |
| `app/api/exercises/[exerciseTypeId]/last/route.ts` | API para última performance |
| `components/workouts/ExerciseHistory.tsx` | Componente de historial en formulario |

### Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `components/workouts/WorkoutForm.tsx` | Integración de ExerciseHistory |

### Personal Records Tracked

1. **Peso Máximo**: Mayor peso utilizado en el ejercicio
2. **Volumen Máximo**: Mayor volumen total (sets × reps × weight)
3. **Reps Máximas**: Mayor número de repeticiones

### Indicadores Visuales

- **Flecha verde (↑)**: Mejora respecto a última sesión
- **Flecha roja (↓)**: Disminución respecto a última sesión
- **Badge amarillo**: Nuevo Personal Record

---

## APIs Creadas

### Backup APIs

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/backup/export` | GET | Descarga backup JSON |
| `/api/backup/preview` | POST | Preview de import (validación) |
| `/api/backup/import` | POST | Importar datos |

### Exercise APIs

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/exercises/[exerciseTypeId]/last` | GET | Última performance + PRs |
| `/api/exercises/history` | GET | Historial de un ejercicio |

---

## Dependencias Agregadas

- `@paralleldrive/cuid2`: Para generación de IDs únicos durante import

---

## Testing Manual

### Export/Import

1. [x] Exportar todos los módulos - JSON válido generado
2. [x] Build pasa correctamente
3. [ ] Importar en modo "merge" - datos se agregan
4. [ ] Importar en modo "replace" - datos se reemplazan
5. [ ] Importar archivo inválido - error amigable

### Auto-Fill

1. [x] Build pasa correctamente
2. [ ] Crear workout con ejercicio existente - muestra última vez
3. [ ] Botón "Usar estos valores" auto-rellena
4. [ ] Indicador de progreso funciona

---

## Próximos Pasos (Opcional)

1. **Gráficos de Progreso**: Implementar visualización con Recharts
2. **Rate Limiting**: Agregar límites de uso a las APIs de backup
3. **Sugerencias Inteligentes**: Sugerir incrementos basados en progreso

---

## Notas de Implementación

- El export serializa todas las fechas a ISO strings para compatibilidad JSON
- El import usa transacciones atómicas para garantizar consistencia
- Los CatalogItems de sistema (isSystem: true) no se importan
- El componente ExerciseHistory usa watch() de react-hook-form para reactivity
