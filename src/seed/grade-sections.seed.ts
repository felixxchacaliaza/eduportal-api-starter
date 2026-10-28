import mongoose from 'mongoose';
import { GradeSectionModel } from '../models/grade-section.model.js';
import { GradeModel } from '../models/grade.model.js';
import { SectionModel } from '../models/section.model.js';
import { ClassroomModel } from '../models/classroom.model.js';
import { env } from '../config/env.js';

export async function seedGradeSections(): Promise<void> {
  const count = await GradeSectionModel.countDocuments();
  if (count > 0) {
    console.log(`ℹ️ [Seed] Ya existen ${count} salones (grade_sections) en la base de datos.`);
    return;
  }

  // Cargar grados, secciones y aulas requeridas
  const [grades, secA, secB, c101, c102, c201, c202, c301, c302] = await Promise.all([
    GradeModel.find({ code: { $in: ['GRA-001', 'GRA-002', 'GRA-003', 'GRA-004', 'GRA-005'] } }).sort({ name: 1 }),
    SectionModel.findOne({ name: 'A' }),
    SectionModel.findOne({ name: 'B' }),
    ClassroomModel.findOne({ name: '101' }),
    ClassroomModel.findOne({ name: '102' }),
    ClassroomModel.findOne({ name: '201' }),
    ClassroomModel.findOne({ name: '202' }),
    ClassroomModel.findOne({ name: '301' }),
    ClassroomModel.findOne({ name: '302' })
  ]);

  if (grades.length < 5 || !secA || !secB || !c101 || !c102 || !c201 || !c202 || !c301 || !c302) {
    console.warn('⚠️ [Seed] Faltan grados, secciones o aulas para sembrar grade_sections. Ejecuta primero sus semillas.');
    return;
  }

  const initialGradeSections = [
    // 1° de Secundaria (Turno Mañana)
    { code: 'GSE-001', grade: grades[0]._id, section: secA._id, classroom: c101._id, academicYear: '2026', shift: 'MAÑANA', maxCapacity: 30, enrolledStudents: 0, enabled: true },
    { code: 'GSE-002', grade: grades[0]._id, section: secB._id, classroom: c102._id, academicYear: '2026', shift: 'MAÑANA', maxCapacity: 30, enrolledStudents: 0, enabled: true },

    // 2° de Secundaria (Turno Mañana)
    { code: 'GSE-003', grade: grades[1]._id, section: secA._id, classroom: c201._id, academicYear: '2026', shift: 'MAÑANA', maxCapacity: 30, enrolledStudents: 0, enabled: true },
    { code: 'GSE-004', grade: grades[1]._id, section: secB._id, classroom: c202._id, academicYear: '2026', shift: 'MAÑANA', maxCapacity: 30, enrolledStudents: 0, enabled: true },

    // 3° de Secundaria (Turno Mañana)
    { code: 'GSE-005', grade: grades[2]._id, section: secA._id, classroom: c301._id, academicYear: '2026', shift: 'MAÑANA', maxCapacity: 30, enrolledStudents: 0, enabled: true },
    { code: 'GSE-006', grade: grades[2]._id, section: secB._id, classroom: c302._id, academicYear: '2026', shift: 'MAÑANA', maxCapacity: 30, enrolledStudents: 0, enabled: true },

    // 4° de Secundaria (Turno Tarde - Comparte aulas 101 y 102 sin colisión)
    { code: 'GSE-007', grade: grades[3]._id, section: secA._id, classroom: c101._id, academicYear: '2026', shift: 'TARDE', maxCapacity: 30, enrolledStudents: 0, enabled: true },
    { code: 'GSE-008', grade: grades[3]._id, section: secB._id, classroom: c102._id, academicYear: '2026', shift: 'TARDE', maxCapacity: 30, enrolledStudents: 0, enabled: true },

    // 5° de Secundaria (Turno Tarde - Comparte aulas 201 y 202 sin colisión)
    { code: 'GSE-009', grade: grades[4]._id, section: secA._id, classroom: c201._id, academicYear: '2026', shift: 'TARDE', maxCapacity: 30, enrolledStudents: 0, enabled: true },
    { code: 'GSE-010', grade: grades[4]._id, section: secB._id, classroom: c202._id, academicYear: '2026', shift: 'TARDE', maxCapacity: 30, enrolledStudents: 0, enabled: true }
  ];

  console.log('🌱 [Seed] Registrando los 10 salones oficiales (grade_sections) para 2026...');
  await GradeSectionModel.insertMany(initialGradeSections);
  console.log('✅ [Seed] 10 salones registrados correctamente (GSE-001 a GSE-010).');
}

// Ejecución directa si se invoca por comando
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('grade-sections.seed.ts')) {
  (async () => {
    try {
      await mongoose.connect(env.MONGODB_URI);
      console.log('🔗 Conectado a MongoDB para sembrado de grade_sections');
      await GradeSectionModel.deleteMany({});
      console.log('🧹 Colección grade_sections limpiada');
      await seedGradeSections();
      const all = await GradeSectionModel.find()
        .populate({ path: 'grade', select: 'name description' })
        .populate({ path: 'section', select: 'name' })
        .populate({ path: 'classroom', select: 'name capacity' });
      console.log('Salones en MongoDB:', JSON.stringify(all, null, 2));
      await mongoose.disconnect();
      process.exit(0);
    } catch (err) {
      console.error('❌ Error en el sembrado de grade_sections:', err);
      process.exit(1);
    }
  })();
}