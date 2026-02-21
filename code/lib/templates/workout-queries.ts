import { prisma } from "@/lib/db/prisma"
import type { WorkoutTemplateWithExercisesInput, UpdateWorkoutTemplateInput } from "@/lib/validations/templates"

// ============================================
// GET WORKOUT TEMPLATES
// ============================================

export async function getWorkoutTemplates(userId: string, filters?: {
  isPublic?: boolean
  difficulty?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED"
  tags?: string[]
  search?: string
  take?: number
  skip?: number
}) {
  const where: any = {
    OR: [
      { userId, isPublic: false }, // User's private templates
      { isPublic: true }            // Public templates
    ]
  }

  if (filters?.difficulty) {
    where.difficulty = filters.difficulty
  }

  if (filters?.tags && filters.tags.length > 0) {
    where.tags = {
      hasSome: filters.tags
    }
  }

  if (filters?.search) {
    where.AND = [
      ...(where.AND || []),
      {
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } }
        ]
      }
    ]
  }

  const take = filters?.take ?? 50
  const skip = filters?.skip ?? 0

  const [templates, total] = await Promise.all([
    prisma.workoutTemplate.findMany({
      where,
      include: {
        exercises: {
          include: {
            exerciseType: true,
            muscleGroup: true,
            equipment: true
          },
          orderBy: {
            sortOrder: 'asc'
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { isPublic: 'desc' },
        { updatedAt: 'desc' }
      ],
      take,
      skip
    }),
    prisma.workoutTemplate.count({ where })
  ])

  return { templates, total }
}

// ============================================
// GET WORKOUT TEMPLATE BY ID
// ============================================

export async function getWorkoutTemplateById(id: string, userId: string) {
  const template = await prisma.workoutTemplate.findFirst({
    where: {
      id,
      OR: [
        { userId },           // User owns it
        { isPublic: true }    // Or it's public
      ]
    },
    include: {
      exercises: {
        include: {
          exerciseType: true,
          muscleGroup: true,
          equipment: true
        },
        orderBy: {
          sortOrder: 'asc'
        }
      },
      user: {
        select: {
          name: true,
          email: true
        }
      }
    }
  })

  if (!template) {
    throw new Error("Template not found or access denied")
  }

  return template
}

// ============================================
// CREATE WORKOUT TEMPLATE
// ============================================

export async function createWorkoutTemplate(
  userId: string,
  data: WorkoutTemplateWithExercisesInput
) {
  const template = await prisma.workoutTemplate.create({
    data: {
      userId,
      name: data.name,
      description: data.description || null,
      isPublic: data.isPublic,
      difficulty: data.difficulty || null,
      tags: data.tags,
      exercises: {
        create: data.exercises.map((ex, index) => ({
          exerciseTypeId: ex.exerciseTypeId || null,
          muscleGroupId: ex.muscleGroupId || null,
          equipmentId: ex.equipmentId || null,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight || null,
          notes: ex.notes || null,
          sortOrder: ex.sortOrder ?? index
        }))
      }
    },
    include: {
      exercises: {
        include: {
          exerciseType: true,
          muscleGroup: true,
          equipment: true
        },
        orderBy: {
          sortOrder: 'asc'
        }
      }
    }
  })

  return template
}

// ============================================
// UPDATE WORKOUT TEMPLATE
// ============================================

export async function updateWorkoutTemplate(
  id: string,
  userId: string,
  data: UpdateWorkoutTemplateInput
) {
  // Verify ownership
  const existing = await prisma.workoutTemplate.findFirst({
    where: { id, userId }
  })

  if (!existing) {
    throw new Error("Template not found or access denied")
  }

  // Update template
  const template = await prisma.workoutTemplate.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description || null,
      isPublic: data.isPublic,
      difficulty: data.difficulty || null,
      tags: data.tags,
      // If exercises provided, replace all
      ...(data.exercises && {
        exercises: {
          deleteMany: {}, // Delete all existing
          create: data.exercises.map((ex, index) => ({
            exerciseTypeId: ex.exerciseTypeId || null,
            muscleGroupId: ex.muscleGroupId || null,
            equipmentId: ex.equipmentId || null,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight || null,
            notes: ex.notes || null,
            sortOrder: ex.sortOrder ?? index
          }))
        }
      })
    },
    include: {
      exercises: {
        include: {
          exerciseType: true,
          muscleGroup: true,
          equipment: true
        },
        orderBy: {
          sortOrder: 'asc'
        }
      }
    }
  })

  return template
}

// ============================================
// DELETE WORKOUT TEMPLATE
// ============================================

export async function deleteWorkoutTemplate(id: string, userId: string) {
  // Verify ownership
  const existing = await prisma.workoutTemplate.findFirst({
    where: { id, userId }
  })

  if (!existing) {
    throw new Error("Template not found or access denied")
  }

  await prisma.workoutTemplate.delete({
    where: { id }
  })

  return { success: true }
}

// ============================================
// LOAD WORKOUT TEMPLATE (for creating workout)
// ============================================

export async function loadWorkoutTemplate(id: string, userId: string) {
  const template = await getWorkoutTemplateById(id, userId)

  // Transform template to workout format
  return {
    name: template.name,
    exercises: template.exercises.map(ex => ({
      exerciseTypeId: ex.exerciseTypeId,
      muscleGroupId: ex.muscleGroupId,
      equipmentId: ex.equipmentId,
      sets: ex.sets,
      reps: ex.reps,
      weight: ex.weight,
      notes: ex.notes
    }))
  }
}
