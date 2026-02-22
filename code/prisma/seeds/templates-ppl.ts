import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper to find catalog items
async function getCatalog() {
  const find = async (type: string, slug: string) => {
    const item = await prisma.catalogItem.findFirst({
      where: { catalogType: type, slug }
    })
    return item?.id ?? null
  }

  return {
    // Exercise categories
    ex: {
      benchPress: await find('exercise_category', 'bench-press'),
      inclinePress: await find('exercise_category', 'incline-press'),
      cableCrossover: await find('exercise_category', 'cable-crossover'),
      dumbbellFlyes: await find('exercise_category', 'dumbbell-flyes'),
      pushUps: await find('exercise_category', 'push-ups'),
      tricepDips: await find('exercise_category', 'tricep-dips'),
      skullCrushers: await find('exercise_category', 'skull-crushers'),
      overheadExtension: await find('exercise_category', 'overhead-extension'),
      latPulldown: await find('exercise_category', 'lat-pulldown'),
      pullUps: await find('exercise_category', 'pull-ups'),
      barbellRows: await find('exercise_category', 'barbell-rows'),
      bicepsCurls: await find('exercise_category', 'biceps-curls'),
      hammerCurls: await find('exercise_category', 'hammer-curls'),
      deadlift: await find('exercise_category', 'deadlift'),
      squat: await find('exercise_category', 'squat'),
      lunges: await find('exercise_category', 'lunges'),
      legCurls: await find('exercise_category', 'leg-curls'),
      calfRaises: await find('exercise_category', 'calf-raises'),
      overheadPress: await find('exercise_category', 'overhead-press'),
      lateralRaises: await find('exercise_category', 'lateral-raises'),
      frontRaises: await find('exercise_category', 'front-raises'),
      legPress: await find('exercise_category', 'leg-press'),
      shrugs: await find('exercise_category', 'shrugs'),
      tBarRow: await find('exercise_category', 't-bar-row'),
    },
    // Muscle groups
    mg: {
      chest: await find('muscle_group', 'chest-muscle'),
      triceps: await find('muscle_group', 'triceps-muscle'),
      back: await find('muscle_group', 'back-muscle'),
      biceps: await find('muscle_group', 'biceps-muscle'),
      lowerBody: await find('muscle_group', 'lower-body'),
      shoulders: await find('muscle_group', 'shoulders-muscle'),
      hamstrings: await find('muscle_group', 'hamstrings'),
      calves: await find('muscle_group', 'calves'),
      glutes: await find('muscle_group', 'glutes'),
      quads: await find('muscle_group', 'quads'),
      core: await find('muscle_group', 'core'),
    },
    // Equipment
    eq: {
      dumbbell: await find('equipment_type', 'dumbbell'),
      cable: await find('equipment_type', 'cable-machine'),
      bodyweight: await find('equipment_type', 'bodyweight'),
      barbell: await find('equipment_type', 'barbell'),
      ezBar: await find('equipment_type', 'ez-bar'),
      pullUpBar: await find('equipment_type', 'pull-up-bar'),
      machines: await find('equipment_type', 'machines'),
      noEquipment: await find('equipment_type', 'no-equipment'),
    }
  }
}

async function seedPPLTemplates() {
  console.log('🏋️ Seeding PPL (Push/Pull/Legs) templates...')

  const c = await getCatalog()

  // ============================================
  // TEMPLATE 1: Empuje - Pecho y Tríceps 1
  // ============================================
  await prisma.workoutTemplate.create({
    data: {
      userId: null,
      name: 'Empuje - Pecho y Tríceps 1',
      description: 'Rutina de empuje enfocada en pecho y tríceps. Variante 1 con press inclinado, crossover y press francés.',
      isPublic: true,
      difficulty: 'INTERMEDIATE',
      tags: ['ppl', 'empuje', 'pecho', 'triceps', 'hipertrofia'],
      exercises: {
        create: [
          {
            exerciseTypeId: null,
            muscleGroupId: c.mg.shoulders,
            equipmentId: c.eq.noEquipment,
            sets: 2,
            reps: 15,
            notes: 'Calentamiento: Rotación Externa con Banda (series submaximales)',
            sortOrder: 0
          },
          {
            exerciseTypeId: c.ex.inclinePress,
            muscleGroupId: c.mg.chest,
            equipmentId: c.eq.dumbbell,
            sets: 4,
            reps: 10,
            notes: 'Press de Banca Inclinado con Mancuernas',
            sortOrder: 1
          },
          {
            exerciseTypeId: c.ex.cableCrossover,
            muscleGroupId: c.mg.chest,
            equipmentId: c.eq.cable,
            sets: 3,
            reps: 12,
            notes: 'Crossover en Cable (inclinado hacia atrás)',
            sortOrder: 2
          },
          {
            exerciseTypeId: c.ex.dumbbellFlyes,
            muscleGroupId: c.mg.chest,
            equipmentId: c.eq.dumbbell,
            sets: 3,
            reps: 10,
            notes: 'Fly con Mancuernas en el suelo (descendentes excéntricas)',
            sortOrder: 3
          },
          {
            exerciseTypeId: c.ex.pushUps,
            muscleGroupId: c.mg.chest,
            equipmentId: c.eq.bodyweight,
            sets: 3,
            reps: 12,
            notes: 'Escalera de Flexiones (Déficit 1 y Media)',
            sortOrder: 4
          },
          {
            exerciseTypeId: c.ex.tricepDips,
            muscleGroupId: c.mg.triceps,
            equipmentId: c.eq.bodyweight,
            sets: 3,
            reps: 12,
            notes: 'Fondos con Peso Corporal (con parciales)',
            sortOrder: 5
          },
          {
            exerciseTypeId: c.ex.skullCrushers,
            muscleGroupId: c.mg.triceps,
            equipmentId: c.eq.ezBar,
            sets: 3,
            reps: 10,
            notes: 'Press Francés con Barra Z (énfasis cabeza larga)',
            sortOrder: 6
          },
          {
            exerciseTypeId: c.ex.overheadExtension,
            muscleGroupId: c.mg.triceps,
            equipmentId: c.eq.dumbbell,
            sets: 3,
            reps: 12,
            notes: 'Extensiones de Tríceps por encima de la cabeza (a dos manos)',
            sortOrder: 7
          },
          {
            exerciseTypeId: c.ex.overheadExtension,
            muscleGroupId: c.mg.triceps,
            equipmentId: c.eq.cable,
            sets: 3,
            reps: 15,
            notes: 'Extensiones de Tríceps en Polea Alta con Cuerda',
            sortOrder: 8
          },
          {
            exerciseTypeId: null,
            muscleGroupId: c.mg.triceps,
            equipmentId: c.eq.dumbbell,
            sets: 3,
            reps: 12,
            notes: 'Patada de Tríceps con Mancuerna (por brazo)',
            sortOrder: 9
          }
        ]
      }
    }
  })

  // ============================================
  // TEMPLATE 2: Tracción - Espalda y Bíceps 1
  // ============================================
  await prisma.workoutTemplate.create({
    data: {
      userId: null,
      name: 'Tracción - Espalda y Bíceps 1',
      description: 'Rutina de tracción enfocada en espalda y bíceps. Variante 1 con remo sentado, jalón estrecho y curl estricto.',
      isPublic: true,
      difficulty: 'INTERMEDIATE',
      tags: ['ppl', 'traccion', 'espalda', 'biceps', 'hipertrofia'],
      exercises: {
        create: [
          {
            exerciseTypeId: c.ex.latPulldown,
            muscleGroupId: c.mg.back,
            equipmentId: c.eq.cable,
            sets: 2,
            reps: 15,
            notes: 'Calentamiento: Preparador de Jalón de Escápulas',
            sortOrder: 0
          },
          {
            exerciseTypeId: c.ex.barbellRows,
            muscleGroupId: c.mg.back,
            equipmentId: c.eq.cable,
            sets: 4,
            reps: 10,
            notes: 'Remo con Cable Sentado (Codos Anchos)',
            sortOrder: 1
          },
          {
            exerciseTypeId: c.ex.latPulldown,
            muscleGroupId: c.mg.back,
            equipmentId: c.eq.cable,
            sets: 4,
            reps: 10,
            notes: 'Jalón de Dorsales Tradicional (Agarre Estrecho)',
            sortOrder: 2
          },
          {
            exerciseTypeId: null,
            muscleGroupId: c.mg.back,
            equipmentId: c.eq.cable,
            sets: 3,
            reps: 12,
            notes: 'Empuje Abajo con Brazos Rectos (Pullover en polea)',
            sortOrder: 3
          },
          {
            exerciseTypeId: null,
            muscleGroupId: c.mg.back,
            equipmentId: c.eq.dumbbell,
            sets: 3,
            reps: 10,
            notes: 'Pullover con Mancuerna de Una y Media Repetición',
            sortOrder: 4
          },
          {
            exerciseTypeId: c.ex.pullUps,
            muscleGroupId: c.mg.back,
            equipmentId: c.eq.pullUpBar,
            sets: 3,
            reps: 8,
            notes: 'Dominada con Peso Corporal o Banda',
            sortOrder: 5
          },
          {
            exerciseTypeId: c.ex.bicepsCurls,
            muscleGroupId: c.mg.biceps,
            equipmentId: c.eq.barbell,
            sets: 3,
            reps: 10,
            notes: 'Curl de Bíceps estricto con barra (seguido de curl con trampa)',
            sortOrder: 6
          },
          {
            exerciseTypeId: c.ex.hammerCurls,
            muscleGroupId: c.mg.biceps,
            equipmentId: c.eq.dumbbell,
            sets: 3,
            reps: 12,
            notes: 'Curl de Martillo cruzado con mancuernas',
            sortOrder: 7
          },
          {
            exerciseTypeId: c.ex.bicepsCurls,
            muscleGroupId: c.mg.biceps,
            equipmentId: c.eq.cable,
            sets: 3,
            reps: 12,
            notes: 'Curl de Arrastre (Drag Curl) con cable',
            sortOrder: 8
          },
          {
            exerciseTypeId: c.ex.latPulldown,
            muscleGroupId: c.mg.biceps,
            equipmentId: c.eq.cable,
            sets: 3,
            reps: 10,
            notes: 'Jalón Menzer (Serie trampa)',
            sortOrder: 9
          }
        ]
      }
    }
  })

  // ============================================
  // TEMPLATE 3: Pierna y Hombro 1
  // ============================================
  await prisma.workoutTemplate.create({
    data: {
      userId: null,
      name: 'Pierna y Hombro 1',
      description: 'Rutina combinada de pierna y hombro. Variante 1 con peso muerto, sentadilla frontal y press militar.',
      isPublic: true,
      difficulty: 'INTERMEDIATE',
      tags: ['ppl', 'pierna', 'hombros', 'compuesto', 'hipertrofia'],
      exercises: {
        create: [
          {
            exerciseTypeId: null,
            muscleGroupId: c.mg.glutes,
            equipmentId: c.eq.bodyweight,
            sets: 2,
            reps: 15,
            notes: 'Calentamiento: Hiperextensión Inversa (activación sin fatiga)',
            sortOrder: 0
          },
          {
            exerciseTypeId: c.ex.deadlift,
            muscleGroupId: c.mg.hamstrings,
            equipmentId: c.eq.barbell,
            sets: 4,
            reps: 6,
            notes: 'Peso Muerto (Barra o Barra Hexagonal) al 80% del 1RM',
            sortOrder: 1
          },
          {
            exerciseTypeId: c.ex.squat,
            muscleGroupId: c.mg.quads,
            equipmentId: c.eq.barbell,
            sets: 4,
            reps: 8,
            notes: 'Sentadilla Frontal con Barra',
            sortOrder: 2
          },
          {
            exerciseTypeId: c.ex.lunges,
            muscleGroupId: c.mg.quads,
            equipmentId: c.eq.dumbbell,
            sets: 3,
            reps: 10,
            notes: 'Zancada Inversa Alterna con Mancuernas',
            sortOrder: 3
          },
          {
            exerciseTypeId: c.ex.legCurls,
            muscleGroupId: c.mg.hamstrings,
            equipmentId: c.eq.bodyweight,
            sets: 3,
            reps: 12,
            notes: 'Curl de Isquiotibiales (con deslizadores y puente)',
            sortOrder: 4
          },
          {
            exerciseTypeId: c.ex.calfRaises,
            muscleGroupId: c.mg.calves,
            equipmentId: c.eq.bodyweight,
            sets: 4,
            reps: 15,
            notes: 'Elevación de Talones de pie',
            sortOrder: 5
          },
          {
            exerciseTypeId: c.ex.overheadPress,
            muscleGroupId: c.mg.shoulders,
            equipmentId: c.eq.dumbbell,
            sets: 4,
            reps: 10,
            notes: 'Press Militar con Mancuernas (Sentado o de pie)',
            sortOrder: 6
          },
          {
            exerciseTypeId: c.ex.lateralRaises,
            muscleGroupId: c.mg.shoulders,
            equipmentId: c.eq.dumbbell,
            sets: 3,
            reps: 15,
            notes: 'Elevaciones Laterales (Énfasis Deltoides Medios)',
            sortOrder: 7
          },
          {
            exerciseTypeId: null,
            muscleGroupId: c.mg.shoulders,
            equipmentId: c.eq.cable,
            sets: 3,
            reps: 15,
            notes: 'Face Pulls con cuerda en polea alta',
            sortOrder: 8
          },
          {
            exerciseTypeId: c.ex.overheadPress,
            muscleGroupId: c.mg.shoulders,
            equipmentId: c.eq.barbell,
            sets: 3,
            reps: 8,
            notes: 'Press de Hombros con Barra',
            sortOrder: 9
          }
        ]
      }
    }
  })

  // ============================================
  // TEMPLATE 4: Empuje - Pecho y Tríceps 2
  // ============================================
  await prisma.workoutTemplate.create({
    data: {
      userId: null,
      name: 'Empuje - Pecho y Tríceps 2',
      description: 'Rutina de empuje enfocada en pecho y tríceps. Variante 2 con press plano, crossover alto-bajo y press agarre cerrado.',
      isPublic: true,
      difficulty: 'INTERMEDIATE',
      tags: ['ppl', 'empuje', 'pecho', 'triceps', 'hipertrofia'],
      exercises: {
        create: [
          {
            exerciseTypeId: null,
            muscleGroupId: c.mg.shoulders,
            equipmentId: c.eq.noEquipment,
            sets: 2,
            reps: 15,
            notes: 'Calentamiento: Separación con Banda (series submaximales)',
            sortOrder: 0
          },
          {
            exerciseTypeId: c.ex.benchPress,
            muscleGroupId: c.mg.chest,
            equipmentId: c.eq.dumbbell,
            sets: 4,
            reps: 10,
            notes: 'Press de Banca Plana con Mancuernas',
            sortOrder: 1
          },
          {
            exerciseTypeId: c.ex.cableCrossover,
            muscleGroupId: c.mg.chest,
            equipmentId: c.eq.cable,
            sets: 3,
            reps: 12,
            notes: 'Crossover de Arriba a Abajo en Polea',
            sortOrder: 2
          },
          {
            exerciseTypeId: c.ex.inclinePress,
            muscleGroupId: c.mg.chest,
            equipmentId: c.eq.cable,
            sets: 3,
            reps: 12,
            notes: 'Press de Cable Inclinado (Cruzando manos al final)',
            sortOrder: 3
          },
          {
            exerciseTypeId: c.ex.tricepDips,
            muscleGroupId: c.mg.chest,
            equipmentId: c.eq.bodyweight,
            sets: 3,
            reps: 10,
            notes: 'Escalera de Fondos (Retención en posición inferior)',
            sortOrder: 4
          },
          {
            exerciseTypeId: c.ex.pushUps,
            muscleGroupId: c.mg.chest,
            equipmentId: c.eq.bodyweight,
            sets: 3,
            reps: 15,
            notes: 'Flexión de "Patio de Prisión" (Rango limitado y rápidas)',
            sortOrder: 5
          },
          {
            exerciseTypeId: c.ex.benchPress,
            muscleGroupId: c.mg.triceps,
            equipmentId: c.eq.barbell,
            sets: 4,
            reps: 8,
            notes: 'Press de Banca con Agarre Cerrado (Tríceps)',
            sortOrder: 6
          },
          {
            exerciseTypeId: c.ex.overheadExtension,
            muscleGroupId: c.mg.triceps,
            equipmentId: c.eq.machines,
            sets: 3,
            reps: 12,
            notes: 'Extensiones de Tríceps en Máquina o Press Down',
            sortOrder: 7
          },
          {
            exerciseTypeId: c.ex.tricepDips,
            muscleGroupId: c.mg.triceps,
            equipmentId: c.eq.bodyweight,
            sets: 3,
            reps: 15,
            notes: 'Dips (Fondos) en Banca',
            sortOrder: 8
          },
          {
            exerciseTypeId: c.ex.overheadExtension,
            muscleGroupId: c.mg.triceps,
            equipmentId: c.eq.cable,
            sets: 3,
            reps: 12,
            notes: 'Extensiones de Tríceps con Cable por Encima de la Cabeza',
            sortOrder: 9
          }
        ]
      }
    }
  })

  // ============================================
  // TEMPLATE 5: Tracción - Espalda y Bíceps 2
  // ============================================
  await prisma.workoutTemplate.create({
    data: {
      userId: null,
      name: 'Tracción - Espalda y Bíceps 2',
      description: 'Rutina de tracción enfocada en espalda y bíceps. Variante 2 con remo con barra, jalón amplio y curl araña.',
      isPublic: true,
      difficulty: 'INTERMEDIATE',
      tags: ['ppl', 'traccion', 'espalda', 'biceps', 'hipertrofia'],
      exercises: {
        create: [
          {
            exerciseTypeId: null,
            muscleGroupId: c.mg.shoulders,
            equipmentId: c.eq.cable,
            sets: 2,
            reps: 15,
            notes: 'Calentamiento: Preparador de Jalones a la Cara (2 series deliberadas)',
            sortOrder: 0
          },
          {
            exerciseTypeId: c.ex.barbellRows,
            muscleGroupId: c.mg.back,
            equipmentId: c.eq.barbell,
            sets: 4,
            reps: 8,
            notes: 'Remo con Barra o Remo con Apoyo',
            sortOrder: 1
          },
          {
            exerciseTypeId: c.ex.latPulldown,
            muscleGroupId: c.mg.back,
            equipmentId: c.eq.cable,
            sets: 4,
            reps: 10,
            notes: 'Jalón con Agarre Amplio',
            sortOrder: 2
          },
          {
            exerciseTypeId: null,
            muscleGroupId: c.mg.back,
            equipmentId: c.eq.dumbbell,
            sets: 3,
            reps: 12,
            notes: 'Jalón Alto con Mancuernas',
            sortOrder: 3
          },
          {
            exerciseTypeId: c.ex.barbellRows,
            muscleGroupId: c.mg.back,
            equipmentId: c.eq.cable,
            sets: 3,
            reps: 10,
            notes: 'Remo con Cable Alto de Una y Media Repeticiones',
            sortOrder: 4
          },
          {
            exerciseTypeId: null,
            muscleGroupId: c.mg.back,
            equipmentId: c.eq.bodyweight,
            sets: 3,
            reps: 10,
            notes: 'Remo Invertido',
            sortOrder: 5
          },
          {
            exerciseTypeId: c.ex.pullUps,
            muscleGroupId: c.mg.biceps,
            equipmentId: c.eq.pullUpBar,
            sets: 3,
            reps: 8,
            notes: 'Dominadas Supinas (Agarre cerrado) seguidas de excéntricas',
            sortOrder: 6
          },
          {
            exerciseTypeId: c.ex.bicepsCurls,
            muscleGroupId: c.mg.biceps,
            equipmentId: c.eq.dumbbell,
            sets: 3,
            reps: 12,
            notes: 'Curl Araña con Mancuernas',
            sortOrder: 7
          },
          {
            exerciseTypeId: c.ex.bicepsCurls,
            muscleGroupId: c.mg.biceps,
            equipmentId: c.eq.dumbbell,
            sets: 3,
            reps: 10,
            notes: 'Curl Inclinado con Mancuernas',
            sortOrder: 8
          },
          {
            exerciseTypeId: c.ex.bicepsCurls,
            muscleGroupId: c.mg.biceps,
            equipmentId: c.eq.dumbbell,
            sets: 3,
            reps: 12,
            notes: 'Curl de Bíceps de pie con Mancuernas (Serie trampa)',
            sortOrder: 9
          }
        ]
      }
    }
  })

  // ============================================
  // TEMPLATE 6: Pierna y Hombro 2
  // ============================================
  await prisma.workoutTemplate.create({
    data: {
      userId: null,
      name: 'Pierna y Hombro 2',
      description: 'Rutina combinada de pierna y hombro. Variante 2 con sentadilla con barra, hip thrust y press Arnold.',
      isPublic: true,
      difficulty: 'INTERMEDIATE',
      tags: ['ppl', 'pierna', 'hombros', 'compuesto', 'hipertrofia'],
      exercises: {
        create: [
          {
            exerciseTypeId: c.ex.squat,
            muscleGroupId: c.mg.quads,
            equipmentId: c.eq.noEquipment,
            sets: 2,
            reps: 15,
            notes: 'Calentamiento: Sentadilla con banda por encima de la cabeza (Enfoque en postura)',
            sortOrder: 0
          },
          {
            exerciseTypeId: c.ex.squat,
            muscleGroupId: c.mg.quads,
            equipmentId: c.eq.barbell,
            sets: 5,
            reps: 5,
            notes: 'Sentadilla con Barra (Series de aproximación + Series de trabajo al 70-90%)',
            sortOrder: 1
          },
          {
            exerciseTypeId: null,
            muscleGroupId: c.mg.glutes,
            equipmentId: c.eq.barbell,
            sets: 4,
            reps: 10,
            notes: 'Empuje de Cadera (Hip Thrust) con Barra',
            sortOrder: 2
          },
          {
            exerciseTypeId: c.ex.legPress,
            muscleGroupId: c.mg.quads,
            equipmentId: c.eq.dumbbell,
            sets: 3,
            reps: 12,
            notes: 'Sentadilla Española con Mancuerna (o extensión de piernas)',
            sortOrder: 3
          },
          {
            exerciseTypeId: c.ex.legCurls,
            muscleGroupId: c.mg.hamstrings,
            equipmentId: c.eq.bodyweight,
            sets: 3,
            reps: 10,
            notes: 'Elevación de Glúteo-Isquiotibial (GHR) o alternativa casera',
            sortOrder: 4
          },
          {
            exerciseTypeId: c.ex.calfRaises,
            muscleGroupId: c.mg.calves,
            equipmentId: c.eq.machines,
            sets: 4,
            reps: 15,
            notes: 'Elevación de Talones Sentado',
            sortOrder: 5
          },
          {
            exerciseTypeId: c.ex.overheadPress,
            muscleGroupId: c.mg.shoulders,
            equipmentId: c.eq.machines,
            sets: 4,
            reps: 10,
            notes: 'Press de Hombros en Máquina (o Press Arnold)',
            sortOrder: 6
          },
          {
            exerciseTypeId: c.ex.frontRaises,
            muscleGroupId: c.mg.shoulders,
            equipmentId: c.eq.dumbbell,
            sets: 3,
            reps: 12,
            notes: 'Elevaciones Frontales con Mancuernas',
            sortOrder: 7
          },
          {
            exerciseTypeId: c.ex.shrugs,
            muscleGroupId: c.mg.shoulders,
            equipmentId: c.eq.barbell,
            sets: 3,
            reps: 12,
            notes: 'Remo al Mentón con Barra o Mancuernas',
            sortOrder: 8
          },
          {
            exerciseTypeId: c.ex.lateralRaises,
            muscleGroupId: c.mg.shoulders,
            equipmentId: c.eq.cable,
            sets: 3,
            reps: 15,
            notes: 'Elevaciones Laterales en Polea Baja',
            sortOrder: 9
          }
        ]
      }
    }
  })

  console.log(`✅ Created 6 PPL workout templates`)
  console.log('\n📊 Summary:')
  console.log('   - Empuje - Pecho y Tríceps 1 (10 ejercicios)')
  console.log('   - Tracción - Espalda y Bíceps 1 (10 ejercicios)')
  console.log('   - Pierna y Hombro 1 (10 ejercicios)')
  console.log('   - Empuje - Pecho y Tríceps 2 (10 ejercicios)')
  console.log('   - Tracción - Espalda y Bíceps 2 (10 ejercicios)')
  console.log('   - Pierna y Hombro 2 (10 ejercicios)')
}

seedPPLTemplates()
  .catch((error) => {
    console.error('❌ Error seeding PPL templates:', error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
