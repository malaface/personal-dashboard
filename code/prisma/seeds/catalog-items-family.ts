import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function seedFamilyCatalog() {
  // relationship_type
  await prisma.catalogItem.createMany({
    data: [
      { catalogType: 'relationship_type', name: 'Immediate Family', slug: 'immediate-family', level: 0, isSystem: true, sortOrder: 1, isActive: true },
      { catalogType: 'relationship_type', name: 'Extended Family', slug: 'extended-family', level: 0, isSystem: true, sortOrder: 2, isActive: true },
      { catalogType: 'relationship_type', name: 'Friends', slug: 'friends', level: 0, isSystem: true, sortOrder: 3, isActive: true }
    ]
  })

  // event_category
  const celebrations = await prisma.catalogItem.create({
    data: { catalogType: 'event_category', name: 'Celebrations', slug: 'celebrations', level: 0, isSystem: true, sortOrder: 1, isActive: true }
  })

  await prisma.catalogItem.createMany({
    data: [
      { catalogType: 'event_category', name: 'Birthdays', slug: 'birthdays', parentId: celebrations.id, level: 1, isSystem: true, sortOrder: 1, isActive: true },
      { catalogType: 'event_category', name: 'Anniversaries', slug: 'anniversaries', parentId: celebrations.id, level: 1, isSystem: true, sortOrder: 2, isActive: true },
      { catalogType: 'event_category', name: 'Holidays', slug: 'holidays', level: 0, isSystem: true, sortOrder: 2, isActive: true },
      { catalogType: 'event_category', name: 'Gatherings', slug: 'gatherings', level: 0, isSystem: true, sortOrder: 3, isActive: true }
    ]
  })

  // reminder_category
  await prisma.catalogItem.createMany({
    data: [
      { catalogType: 'reminder_category', name: 'Communication', slug: 'communication', level: 0, isSystem: true, sortOrder: 1, isActive: true },
      { catalogType: 'reminder_category', name: 'Gifts', slug: 'gifts', level: 0, isSystem: true, sortOrder: 2, isActive: true },
      { catalogType: 'reminder_category', name: 'Tasks', slug: 'tasks', level: 0, isSystem: true, sortOrder: 3, isActive: true },
      { catalogType: 'reminder_category', name: 'Health & Wellness', slug: 'health-wellness', level: 0, isSystem: true, sortOrder: 4, isActive: true }
    ]
  })

  // activity_type
  await prisma.catalogItem.createMany({
    data: [
      { catalogType: 'activity_type', name: 'In-Person', slug: 'in-person', level: 0, isSystem: true, sortOrder: 1, isActive: true },
      { catalogType: 'activity_type', name: 'Phone Call', slug: 'phone-call', level: 0, isSystem: true, sortOrder: 2, isActive: true },
      { catalogType: 'activity_type', name: 'Video Call', slug: 'video-call', level: 0, isSystem: true, sortOrder: 3, isActive: true },
      { catalogType: 'activity_type', name: 'Message', slug: 'message', level: 0, isSystem: true, sortOrder: 4, isActive: true }
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
