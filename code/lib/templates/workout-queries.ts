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
}) {
  const where: Record<string, unknown> = {
    OR: [
      { userId, isPublic: false },
      { isPublic: true }
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
    const existingAnd = Array.isArray(where.AND) ? where.AND : []
    where.AND = [
      ...existingAnd,
      {
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } }
        ]
      }
    ]
  }

  const templates = await prisma.workoutTemplate.findMany({
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
      { isPublic: 'desc' }, // Public first
      { updatedAt: 'desc' }
    ]
  })

  return templates
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
