import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function seedFamilyCatalog() {
  // relationship_type
  await prisma.catalogItem.createMany({
    data: [
      { catalogType: 'relationship_type', name: 'Familia Inmediata', slug: 'immediate-family', level: 0, isSystem: true, sortOrder: 1, isActive: true },
      { catalogType: 'relationship_type', name: 'Familia Extendida', slug: 'extended-family', level: 0, isSystem: true, sortOrder: 2, isActive: true },
      { catalogType: 'relationship_type', name: 'Amigos', slug: 'friends', level: 0, isSystem: true, sortOrder: 3, isActive: true }
    ]
  })

  // event_category
  const celebrations = await prisma.catalogItem.create({
    data: { catalogType: 'event_category', name: 'Celebraciones', slug: 'celebrations', level: 0, isSystem: true, sortOrder: 1, isActive: true }
  })

  await prisma.catalogItem.createMany({
    data: [
      { catalogType: 'event_category', name: 'Cumpleaños', slug: 'birthdays', parentId: celebrations.id, level: 1, isSystem: true, sortOrder: 1, isActive: true },
      { catalogType: 'event_category', name: 'Aniversarios', slug: 'anniversaries', parentId: celebrations.id, level: 1, isSystem: true, sortOrder: 2, isActive: true },
      { catalogType: 'event_category', name: 'Días Festivos', slug: 'holidays', level: 0, isSystem: true, sortOrder: 2, isActive: true },
      { catalogType: 'event_category', name: 'Reuniones', slug: 'gatherings', level: 0, isSystem: true, sortOrder: 3, isActive: true }
    ]
  })

  // reminder_category
  await prisma.catalogItem.createMany({
    data: [
      { catalogType: 'reminder_category', name: 'Comunicación', slug: 'communication', level: 0, isSystem: true, sortOrder: 1, isActive: true },
      { catalogType: 'reminder_category', name: 'Regalos', slug: 'gifts', level: 0, isSystem: true, sortOrder: 2, isActive: true },
      { catalogType: 'reminder_category', name: 'Tareas', slug: 'tasks', level: 0, isSystem: true, sortOrder: 3, isActive: true },
      { catalogType: 'reminder_category', name: 'Salud y Bienestar', slug: 'health-wellness', level: 0, isSystem: true, sortOrder: 4, isActive: true }
    ]
  })

  // activity_type
  await prisma.catalogItem.createMany({
    data: [
      { catalogType: 'activity_type', name: 'En Persona', slug: 'in-person', level: 0, isSystem: true, sortOrder: 1, isActive: true },
      { catalogType: 'activity_type', name: 'Llamada Telefónica', slug: 'phone-call', level: 0, isSystem: true, sortOrder: 2, isActive: true },
      { catalogType: 'activity_type', name: 'Videollamada', slug: 'video-call', level: 0, isSystem: true, sortOrder: 3, isActive: true },
      { catalogType: 'activity_type', name: 'Mensaje', slug: 'message', level: 0, isSystem: true, sortOrder: 4, isActive: true }
    ]
  })

  // social_circle
  await prisma.catalogItem.createMany({
    data: [
      { catalogType: 'social_circle', name: 'Familia Cercana', slug: 'familia-cercana', level: 0, isSystem: true, sortOrder: 1, isActive: true },
      { catalogType: 'social_circle', name: 'Familia Extendida', slug: 'familia-extendida', level: 0, isSystem: true, sortOrder: 2, isActive: true },
      { catalogType: 'social_circle', name: 'Amigos', slug: 'amigos', level: 0, isSystem: true, sortOrder: 3, isActive: true },
      { catalogType: 'social_circle', name: 'Trabajo', slug: 'trabajo', level: 0, isSystem: true, sortOrder: 4, isActive: true },
      { catalogType: 'social_circle', name: 'Networking', slug: 'networking', level: 0, isSystem: true, sortOrder: 5, isActive: true }
    ]
  })

  console.log('✅ Family catalog seeded')
}

seedFamilyCatalog()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
