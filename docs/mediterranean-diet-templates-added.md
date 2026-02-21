# Reporte: Templates Dieta Mediterránea Agregados

**Fecha:** 2026-02-20
**Tipo:** Feature - Seed Data (Nutrición)

## Resumen

Se agregaron 15 meal templates públicos con planes diarios completos de dieta mediterránea orientada a microbiota saludable. Cada template incluye los 5 tiempos de comida del día.

## Estructura

- **15 opciones** de plan diario completo
- **5 comidas por opción:** Desayuno, Colación AM, Comida, Colación PM, Cena
- **75 items totales** en la base de datos
- **mealType:** `null` (cubre todos los tipos de comida)
- **Tags:** `mediterranea`, `microbiota`, `plan-diario`, `saludable`

## Opciones Creadas

| Opción | Desayuno | Comida Principal | Cena |
|--------|----------|-----------------|------|
| 1 | Yogur griego con arándanos y nueces | Salmón con quinoa y espárragos | Ensalada espinacas, feta y granada |
| 2 | Tostada integral con aguacate y huevo | Lentejas guisadas con cúrcuma | Pollo al limón con brócoli |
| 3 | Avena reposada con leche de avena | Atún sellado con garbanzos | Tortilla de champiñones |
| 4 | Pan de centeno con tomate y AOVE | Berenjenas rellenas | Sopa minestrone |
| 5 | Batido de kéfir y espinacas | Bacalao al horno | Ensalada rúcula y mozzarella |
| 6 | Huevos revueltos con espinacas | Pasta integral con pesto | Sardinas con ensalada de col |
| 7 | Pudín de chía con frambuesas | Pollo con alcachofas | Crema de calabaza |
| 8 | Pan integral con ricota y miel | Dorada a la sal | Revuelto de ajos tiernos y gambas |
| 9 | Tortita de avena con frutos rojos | Garbanzos con espinacas y bacalao | Pavo con calabacín asado |
| 10 | Tostada masa madre con hummus | Risotto de cebada con setas | Brochetas verduras y halloumi |
| 11 | Yogur con granola casera y papaya | Conejo al ajillo | Ensalada de lentejas frías |
| 12 | Omelet de claras con pimientos | Pescado blanco al papillote | Salpicón de marisco |
| 13 | Porridge de centeno | Estofado de pavo | Crema de berros |
| 14 | Requesón con higos y AOVE | Couscous integral con cordero | Tostada centeno con anchoas |
| 15 | Pan masa madre con pavo | Mejillones con quinoa | Gazpacho o salmorejo |

## Implementación

- **Archivo seed:** `code/prisma/seeds/templates-mediterranean.ts`
- **Tipo:** Templates públicos (`isPublic: true`, `userId: null`)
- **Formato items:** Cada item incluye emoji identificador del tiempo de comida
- **Objetivo:** Microbiota saludable - dieta mediterránea

## Verificación

```sql
SELECT name, COUNT(items)
FROM meal_templates mt
JOIN meal_template_items mti ON mt.id = mti."templateId"
WHERE 'mediterranea' = ANY(tags)
GROUP BY mt.id;
-- 15 templates, 75 items total
```
