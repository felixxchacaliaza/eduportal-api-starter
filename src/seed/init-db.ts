import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { applyMongoValidation } from '../config/mongo-validation.js';
import { AreaModel } from '../models/area.model.js';
import { SubjectModel } from '../models/subject.model.js';
import { LevelModel } from '../models/level.model.js';
import { GradeModel } from '../models/grade.model.js';
import { SectionModel } from '../models/section.model.js';
import { ClassroomModel } from '../models/classroom.model.js';
import { RuleModel } from '../models/rule.model.js';
import { AcademicYearModel } from '../models/academic-year.model.js';
import { GradeSectionModel } from '../models/grade-section.model.js';
import { GradeSubjectModel } from '../models/grade-subject.model.js';

import { seedAreas } from './areas.seed.js';
import { seedSubjects } from './subjects.seed.js';
import { seedLevels } from './levels.seed.js';
import { seedGrades } from './grades.seed.js';
import { seedSections } from './sections.seed.js';
import { seedClassrooms } from './classrooms.seed.js';
import { seedRules } from './rules.seed.js';
import { seedAcademicYears } from './academic-years.seed.js';
import { seedGradeSections } from './grade-sections.seed.js';
import { seedGradeSubjects } from './grade-subjects.seed.js';

async function initDatabase(): Promise<void> {
  const shouldReset = process.argv.includes('--reset');

  console.log('═════════════════════════════════════════════════════════════');
  console.log(`🗄️  INICIALIZADOR DE BASE DE DATOS: eduportalangular`);
  console.log(`🔧 Modo: ${shouldReset ? 'REINICIO COMPLETO (--reset)' : 'CREACIÓN / SEMBRADO POR DEFECTO'}`);
  console.log('═════════════════════════════════════════════════════════════');

  await mongoose.connect(env.MONGODB_URI);
  console.log(`✅ Conectado a: ${env.MONGODB_URI}\n`);

  if (shouldReset) {
    console.log('🧹 Limpiando todas las colecciones existentes para recrear desde cero...');
    await Promise.all([
      GradeSubjectModel.deleteMany({}),
      GradeSectionModel.deleteMany({}),
      SubjectModel.deleteMany({}),
      AreaModel.deleteMany({}),
      GradeModel.deleteMany({}),
      LevelModel.deleteMany({}),
      SectionModel.deleteMany({}),
      ClassroomModel.deleteMany({}),
      RuleModel.deleteMany({}),
      AcademicYearModel.deleteMany({})
    ]);
    console.log('✅ Colecciones limpiadas.\n');
  }

  // 1. Aplicar reglas $jsonSchema en MongoDB
  console.log('🛡️  Aplicando validadores $jsonSchema en MongoDB...');
  await applyMongoValidation();
  console.log('');

  // 2. Ejecutar seeds en orden estricto de dependencias relacionales
  console.log('🌱 Ejecutando sembrado de datos por defecto en orden jerárquico...');
  await seedAreas();
  await seedSubjects();
  await seedLevels();
  await seedGrades();
  await seedSections();
  await seedClassrooms();
  await seedRules();
  await seedAcademicYears();
  await seedGradeSections();
  await seedGradeSubjects();

  // 3. Sincronizar índices únicos y compuestos de Mongoose
  await Promise.all([
    AreaModel.syncIndexes(),
    SubjectModel.syncIndexes(),
    LevelModel.syncIndexes(),
    GradeModel.syncIndexes(),
    SectionModel.syncIndexes(),
    ClassroomModel.syncIndexes(),
    RuleModel.syncIndexes(),
    AcademicYearModel.syncIndexes(),
    GradeSectionModel.syncIndexes(),
    GradeSubjectModel.syncIndexes()
  ]);

  // 4. Resumen final de documentos en la base de datos
  const summary = [
    { coleccion: 'areas', total: await AreaModel.countDocuments() },
    { coleccion: 'subjects', total: await SubjectModel.countDocuments() },
    { coleccion: 'levels', total: await LevelModel.countDocuments() },
    { coleccion: 'grades', total: await GradeModel.countDocuments() },
    { coleccion: 'sections', total: await SectionModel.countDocuments() },
    { coleccion: 'classrooms', total: await ClassroomModel.countDocuments() },
    { coleccion: 'rules', total: await RuleModel.countDocuments() },
    { coleccion: 'academic_years', total: await AcademicYearModel.countDocuments() },
    { coleccion: 'grade_sections', total: await GradeSectionModel.countDocuments() },
    { coleccion: 'grade_subjects', total: await GradeSubjectModel.countDocuments() }
  ];

  console.log('\n📊 Resumen final de la base de datos eduportalangular:');
  console.table(summary);

  await mongoose.disconnect();
  console.log('✅ Base de datos lista.');
}

initDatabase().catch((err) => {
  console.error('❌ Error al inicializar la base de datos:', err);
  process.exit(1);
});
