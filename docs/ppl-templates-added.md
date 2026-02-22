# Reporte: Templates PPL (Push/Pull/Legs) Agregados

**Fecha:** 2026-02-20
**Tipo:** Feature - Seed Data

## Resumen

Se agregaron 6 workout templates públicos con la rutina PPL (Push/Pull/Legs) completa de 6 días, cada uno con 10 ejercicios (1 calentamiento + 9 ejercicios principales).

## Templates Creados

| Template | Grupo Muscular | Ejercicios | Dificultad |
|----------|---------------|------------|------------|
| Empuje - Pecho y Tríceps 1 | Pecho + Tríceps | 10 | INTERMEDIATE |
| Tracción - Espalda y Bíceps 1 | Espalda + Bíceps | 10 | INTERMEDIATE |
| Pierna y Hombro 1 | Pierna + Hombro | 10 | INTERMEDIATE |
| Empuje - Pecho y Tríceps 2 | Pecho + Tríceps | 10 | INTERMEDIATE |
| Tracción - Espalda y Bíceps 2 | Espalda + Bíceps | 10 | INTERMEDIATE |
| Pierna y Hombro 2 | Pierna + Hombro | 10 | INTERMEDIATE |

## Detalle por Template

### Empuje - Pecho y Tríceps 1
- Calentamiento: Rotación Externa con Banda
- Press de Banca Inclinado con Mancuernas
- Crossover en Cable (inclinado hacia atrás)
- Fly con Mancuernas en el suelo (descendentes excéntricas)
- Escalera de Flexiones (Déficit 1 y Media)
- Fondos con Peso Corporal (con parciales)
- Press Francés con Barra Z (énfasis cabeza larga)
- Extensiones de Tríceps por encima de la cabeza (a dos manos)
- Extensiones de Tríceps en Polea Alta con Cuerda
- Patada de Tríceps con Mancuerna (por brazo)

### Tracción - Espalda y Bíceps 1
- Calentamiento: Preparador de Jalón de Escápulas
- Remo con Cable Sentado (Codos Anchos)
- Jalón de Dorsales Tradicional (Agarre Estrecho)
- Empuje Abajo con Brazos Rectos (Pullover en polea)
- Pullover con Mancuerna de Una y Media Repetición
- Dominada con Peso Corporal o Banda
- Curl de Bíceps estricto con barra (seguido de curl con trampa)
- Curl de Martillo cruzado con mancuernas
- Curl de Arrastre (Drag Curl) con cable
- Jalón Menzer (Serie trampa)

### Pierna y Hombro 1
- Calentamiento: Hiperextensión Inversa (activación sin fatiga)
- Peso Muerto (Barra o Hexagonal) al 80% del 1RM
- Sentadilla Frontal con Barra
- Zancada Inversa Alterna con Mancuernas
- Curl de Isquiotibiales (con deslizadores y puente)
- Elevación de Talones de pie
- Press Militar con Mancuernas
- Elevaciones Laterales (Énfasis Deltoides Medios)
- Face Pulls con cuerda en polea alta
- Press de Hombros con Barra

### Empuje - Pecho y Tríceps 2
- Calentamiento: Separación con Banda
- Press de Banca Plana con Mancuernas
- Crossover de Arriba a Abajo en Polea
- Press de Cable Inclinado (Cruzando manos al final)
- Escalera de Fondos (Retención en posición inferior)
- Flexión de "Patio de Prisión" (Rango limitado y rápidas)
- Press de Banca con Agarre Cerrado (Tríceps)
- Extensiones de Tríceps en Máquina o Press Down
- Dips (Fondos) en Banca
- Extensiones de Tríceps con Cable por Encima de la Cabeza

### Tracción - Espalda y Bíceps 2
- Calentamiento: Preparador de Jalones a la Cara
- Remo con Barra o Remo con Apoyo
- Jalón con Agarre Amplio
- Jalón Alto con Mancuernas
- Remo con Cable Alto de Una y Media Repeticiones
- Remo Invertido
- Dominadas Supinas (Agarre cerrado) seguidas de excéntricas
- Curl Araña con Mancuernas
- Curl Inclinado con Mancuernas
- Curl de Bíceps de pie con Mancuernas (Serie trampa)

### Pierna y Hombro 2
- Calentamiento: Sentadilla con banda por encima de la cabeza
- Sentadilla con Barra (Series de aproximación + trabajo al 70-90%)
- Empuje de Cadera (Hip Thrust) con Barra
- Sentadilla Española con Mancuerna (o extensión de piernas)
- Elevación de Glúteo-Isquiotibial (GHR)
- Elevación de Talones Sentado
- Press de Hombros en Máquina (o Press Arnold)
- Elevaciones Frontales con Mancuernas
- Remo al Mentón con Barra o Mancuernas
- Elevaciones Laterales en Polea Baja

## Implementación

- **Archivo seed:** `code/prisma/seeds/templates-ppl.ts`
- **Tipo:** Templates públicos (`isPublic: true`, `userId: null`)
- **Tags:** Todos etiquetados con `ppl` para fácil filtrado
- **Catálogo:** Mapeados a CatalogItems existentes (exercise_category, muscle_group, equipment_type)
- **Notas:** Cada ejercicio incluye descripción detallada en el campo `notes`

## Verificación

```sql
SELECT name, difficulty, tags, COUNT(exercises)
FROM workout_templates
WHERE 'ppl' = ANY(tags);
-- 6 templates, 60 ejercicios total
```
