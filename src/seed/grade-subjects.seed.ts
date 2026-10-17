import mongoose from 'mongoose';
import { GradeSubjectModel } from '../models/grade-subject.model.js';
import { GradeModel } from '../models/grade.model.js';
import { SubjectModel } from '../models/subject.model.js';
import { env } from '../config/env.js';

export async function seedGradeSubjects(): Promise<void> {
  const count = await GradeSubjectModel.countDocuments();
  if (count > 0) {
    console.log(`ℹ️ [Seed] Ya existen ${count} asignaciones en la malla curricular (grade_subjects).`);
    return;
  }

  // Cargar los 5 grados de secundaria y las 7 asignaturas oficiales
  const [grades, subjects] = await Promise.all([
    GradeModel.find({ code: { $in: ['GRA-001', 'GRA-002', 'GRA-003', 'GRA-004', 'GRA-005'] } }).sort({ name: 1 }),
    SubjectModel.find().sort({ code: 1 })
  ]);

  if (grades.length < 5 || subjects.length < 7) {
    console.warn('⚠️ [Seed] Faltan grados o asignaturas para sembrar grade_subjects. Ejecuta primero sus semillas.');
    return;
  }

  const initialAssignments = [];
  let codeIndex = 1;

  for (const grade of grades) {
    for (const subject of subjects) {
      const codePadded = String(codeIndex).padStart(3, '0');
      initialAssignments.push({
        code: `GSB-${codePadded}`,
        grade: grade._id,
        subject: subject._id,
        academicYear: '2026',
        weeklyHours: subject.weeklyHours || 3,
        enabled: true
      });
      codeIndex++;
    }
  }

  console.log(`🌱 [Seed] Registrando las ${initialAssignments.length} asignaciones de malla curricular (5 grados x 7 asignaturas = 35 asignaciones)...`);
  await GradeSubjectModel.insertMany(initialAssignments);
  console.log(`✅ [Seed] ${initialAssignments.length} asignaciones curriculares registradas con éxito (GSB-001 a GSB-035). Total: 25h semanales por grado (límite MINEDU: 40h).`);
}

// Ejecución directa si se invoca por comando
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('grade-subjects.seed.ts')) {
  (async () => {
    try {
      await mongoose.connect(env.MONGODB_URI);
      console.log('🔗 Conectado a MongoDB para sembrado de grade_subjects');
      await GradeSubjectModel.deleteMany({});
      console.log('🧹 Colección grade_subjects limpiada');
      await seedGradeSubjects();
      const count = await GradeSubjectModel.countDocuments();
      console.log(`✅ Total en MongoDB: ${count} asignaciones curriculares.`);
      await mongoose.disconnect();
      process.exit(0);
    } catch (err) {
      console.error('❌ Error en el sembrado de grade_subjects:', err);
      process.exit(1);
    }
  })();
}
