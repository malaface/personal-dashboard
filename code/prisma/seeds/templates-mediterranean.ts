import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface DayPlan {
  opcion: number
  desayuno: string
  colacion1: string
  comida: string
  colacion2: string
  cena: string
}

const plans: DayPlan[] = [
  {
    opcion: 1,
    desayuno: 'Yogur griego con arándanos y nueces',
    colacion1: 'Manzana con crema de almendras',
    comida: 'Salmón a la plancha con quinoa y espárragos',
    colacion2: 'Hummus con bastones de zanahoria',
    cena: 'Ensalada de espinacas, queso feta y granada'
  },
  {
    opcion: 2,
    desayuno: 'Tostada integral con aguacate y huevo poché',
    colacion1: 'Puñado de pistachos',
    comida: 'Lentejas guisadas con cúrcuma y vegetales',
    colacion2: 'Kéfir natural con semillas de chía',
    cena: 'Pechuga de pollo al limón con brócoli al vapor'
  },
  {
    opcion: 3,
    desayuno: 'Avena reposada con leche de avena y fresas',
    colacion1: 'Pera con canela',
    comida: 'Atún sellado con ensalada de garbanzos y pimientos',
    colacion2: 'Aceitunas verdes y negras',
    cena: 'Tortilla de champiñones y espárragos trigueros'
  },
  {
    opcion: 4,
    desayuno: 'Pan de centeno con tomate rallado y aceite de oliva',
    colacion1: 'Un kiwi (alto en fibra prebiótica)',
    comida: 'Berenjenas rellenas de carne magra y piñones',
    colacion2: 'Yogur de cabra con semillas de lino',
    cena: 'Sopa de verduras minestrone (con legumbres)'
  },
  {
    opcion: 5,
    desayuno: 'Batido de kéfir, espinacas, plátano y jengibre',
    colacion1: 'Nueces de la India (Anacardos)',
    comida: 'Bacalao al horno con patatas y cebolla',
    colacion2: 'Apio con queso cottage',
    cena: 'Ensalada de rúcula, tomate cherry y mozzarella'
  },
  {
    opcion: 6,
    desayuno: 'Huevos revueltos con espinacas y cebollino',
    colacion1: 'Una naranja',
    comida: 'Pasta integral con pesto de albahaca y nueces',
    colacion2: 'Almendras tostadas sin sal',
    cena: 'Sardinas en conserva con ensalada de col'
  },
  {
    opcion: 7,
    desayuno: 'Pudín de chía con leche de coco y frambuesas',
    colacion1: 'Ciruelas pasas',
    comida: 'Pollo con alcachofas y arroz integral',
    colacion2: 'Guacamole con rodajas de pepino',
    cena: 'Crema de calabaza con semillas de calabaza'
  },
  {
    opcion: 8,
    desayuno: 'Pan integral con ricota y miel de abeja pura',
    colacion1: 'Edamames al vapor',
    comida: 'Dorada a la sal con ensalada de canónigos',
    colacion2: 'Yogur griego natural',
    cena: 'Revuelto de ajos tiernos y gambas'
  },
  {
    opcion: 9,
    desayuno: 'Tortita de avena y clara de huevo con frutos rojos',
    colacion1: 'Mandarina y nueces',
    comida: 'Garbanzos con espinacas y bacalao',
    colacion2: 'Una onza de chocolate negro (>85% cacao)',
    cena: 'Pavo a la plancha con calabacín asado'
  },
  {
    opcion: 10,
    desayuno: 'Tostada de masa madre con hummus y sésamo',
    colacion1: 'Media toronja (pomelo)',
    comida: 'Risotto de cebada con setas y parmesano',
    colacion2: 'Semillas de girasol',
    cena: 'Brochetas de verduras y queso halloumi'
  },
  {
    opcion: 11,
    desayuno: 'Yogur natural con granola casera y papaya',
    colacion1: 'Un puñado de bayas de Goji',
    comida: 'Conejo al ajillo con judías verdes y tomate',
    colacion2: 'Kéfir con coco rallado',
    cena: 'Ensalada de lentejas frías con pimientos'
  },
  {
    opcion: 12,
    desayuno: 'Omelet de claras con pimientos y cebolla',
    colacion1: 'Melocotón (durazno)',
    comida: 'Pescado blanco al papillote con puerros',
    colacion2: 'Nueces de Brasil (fuente de selenio)',
    cena: 'Salpicón de marisco con vinagre de manzana'
  },
  {
    opcion: 13,
    desayuno: 'Porridge de centeno con manzana rallada',
    colacion1: 'Queso fresco con orégano',
    comida: 'Estofado de pavo con zanahorias y guisantes',
    colacion2: 'Bastones de calabacín crudo',
    cena: 'Crema de berros y patata pequeña'
  },
  {
    opcion: 14,
    desayuno: 'Requesón con higos y aceite de oliva virgen',
    colacion1: 'Semillas de calabaza',
    comida: 'Couscous integral con verduras y cordero',
    colacion2: 'Compota de manzana sin azúcar',
    cena: 'Tostada de centeno con anchoas y tomate'
  },
  {
    opcion: 15,
    desayuno: 'Pan de masa madre con pavo y aceite de oliva',
    colacion1: 'Una rodaja de piña',
    comida: 'Mejillones al vapor con ensalada de quinoa',
    colacion2: 'Yogur con semillas de cáñamo',
    cena: 'Gazpacho o salmorejo tradicional'
  }
]

async function seedMediterraneanTemplates() {
  console.log('🥗 Seeding Mediterranean diet templates...')

  for (const plan of plans) {
    await prisma.mealTemplate.create({
      data: {
        userId: null,
        name: `Dieta Mediterránea - Opción ${plan.opcion}`,
        description: `Plan diario completo de dieta mediterránea para microbiota saludable. Opción ${plan.opcion} de 15. Incluye desayuno, colación matutina, comida, colación vespertina y cena.`,
        mealType: null, // Full day plan covers all meal types
        isPublic: true,
        tags: ['mediterranea', 'microbiota', 'plan-diario', 'saludable'],
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFats: 0,
        foodItems: {
          create: [
            {
              name: `🌅 Desayuno: ${plan.desayuno}`,
              quantity: 1,
              unit: 'porción',
              sortOrder: 0
            },
            {
              name: `🍎 Colación AM: ${plan.colacion1}`,
              quantity: 1,
              unit: 'porción',
              sortOrder: 1
            },
            {
              name: `🍽️ Comida: ${plan.comida}`,
              quantity: 1,
              unit: 'porción',
              sortOrder: 2
            },
            {
              name: `🥜 Colación PM: ${plan.colacion2}`,
              quantity: 1,
              unit: 'porción',
              sortOrder: 3
            },
            {
              name: `🌙 Cena: ${plan.cena}`,
              quantity: 1,
              unit: 'porción',
              sortOrder: 4
            }
          ]
        }
      }
    })
  }

  console.log(`✅ Created 15 Mediterranean diet templates`)
  console.log('\n📊 Summary:')
  console.log('   - 15 opciones de plan diario completo')
  console.log('   - 5 comidas por opción (75 items total)')
  console.log('   - Tags: mediterranea, microbiota, plan-diario, saludable')
}

seedMediterraneanTemplates()
  .catch((error) => {
    console.error('❌ Error seeding Mediterranean templates:', error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
