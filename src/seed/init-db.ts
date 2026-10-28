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

// Nuevas 15 colecciones
import { PersonModel } from '../models/person.model.js';
import { PositionModel } from '../models/position.model.js';
import { WorkerModel } from '../models/worker.model.js';
import { TeacherModel } from '../models/teacher.model.js';
import { StudentModel } from '../models/student.model.js';
import { MenuModel } from '../models/menu.model.js';
import { ProfileModel } from '../models/profile.model.js';
import { UserModel } from '../models/user.model.js';
import { EnrollmentModel } from '../models/enrollment.model.js';
import { TeacherAssignmentModel } from '../models/teacher-assignment.model.js';
import { ScheduleModel } from '../models/schedule.model.js';
import { EvaluationModel } from '../models/evaluation.model.js';
import { AttendanceModel } from '../models/attendance.model.js';
import { IncidentModel } from '../models/incident.model.js';
import { TuitionPaymentModel } from '../models/tuition-payment.model.js';

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
import { seedOperationalCollections } from './operational-collections.seed.js';

async function initDatabase(): Promise<void> {
  const shouldReset = process.argv.includes('--reset');

  console.log('═════════════════════════════════════════════════════════════');
  console.log(`🗄️  INICIALIZADOR DE BASE DE DATOS: eduportalangular (25 Colecciones)`);
  console.log(`🔧 Modo: ${shouldReset ? 'REINICIO COMPLETO (--reset)' : 'CREACIÓN / SEMBRADO POR DEFECTO'}`);
  console.log('═════════════════════════════════════════════════════════════');

  await mongoose.connect(env.MONGODB_URI);
  console.log(`✅ Conectado a: ${env.MONGODB_URI}\n`);

  if (shouldReset) {
    console.log('🧹 Limpiando todas las 25 colecciones existentes para recrear desde cero...');
    await Promise.all([
      TuitionPaymentModel.deleteMany({}),
      IncidentModel.deleteMany({}),
      AttendanceModel.deleteMany({}),
      EvaluationModel.deleteMany({}),
      ScheduleModel.deleteMany({}),
      TeacherAssignmentModel.deleteMany({}),
      EnrollmentModel.deleteMany({}),
      UserModel.deleteMany({}),
      ProfileModel.deleteMany({}),
      MenuModel.deleteMany({}),
      StudentModel.deleteMany({}),
      TeacherModel.deleteMany({}),
      WorkerModel.deleteMany({}),
      PositionModel.deleteMany({}),
      PersonModel.deleteMany({}),
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
    console.log('✅ 25 Colecciones limpiadas.\n');
  }

  // 1. Aplicar reglas $jsonSchema en MongoDB
  console.log('🛡️  Aplicando validadores $jsonSchema en MongoDB...');
  await applyMongoValidation();
  console.log('');

  // 2. Ejecutar seeds en orden estricto de dependencias relacionales
  console.log('🌱 Ejecutando sembrado de datos en orden jerárquico...');
  console.log('--- Fase Estructural Básica ---');
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

  console.log('--- Fase Operativa, Personas, Seguridad & Transacciones ---');
  await seedOperationalCollections();

  // 3. Sincronizar índices únicos y compuestos de Mongoose
  console.log('⚡ Sincronizando índices en las 25 colecciones...');
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
    GradeSubjectModel.syncIndexes(),
    PersonModel.syncIndexes(),
    PositionModel.syncIndexes(),
    WorkerModel.syncIndexes(),
    TeacherModel.syncIndexes(),
    StudentModel.syncIndexes(),
    MenuModel.syncIndexes(),
    ProfileModel.syncIndexes(),
    UserModel.syncIndexes(),
    EnrollmentModel.syncIndexes(),
    TeacherAssignmentModel.syncIndexes(),
    ScheduleModel.syncIndexes(),
    EvaluationModel.syncIndexes(),
    AttendanceModel.syncIndexes(),
    IncidentModel.syncIndexes(),
    TuitionPaymentModel.syncIndexes()
  ]);

  // 4. Resumen final de documentos en la base de datos
  const summary = [
    { coleccion: 'academic_years', total: await AcademicYearModel.countDocuments() },
    { coleccion: 'levels', total: await LevelModel.countDocuments() },
    { coleccion: 'grades', total: await GradeModel.countDocuments() },
    { coleccion: 'sections', total: await SectionModel.countDocuments() },
    { coleccion: 'classrooms', total: await ClassroomModel.countDocuments() },
    { coleccion: 'rules', total: await RuleModel.countDocuments() },
    { coleccion: 'areas', total: await AreaModel.countDocuments() },
    { coleccion: 'subjects', total: await SubjectModel.countDocuments() },
    { coleccion: 'grade_sections', total: await GradeSectionModel.countDocuments() },
    { coleccion: 'grade_subjects', total: await GradeSubjectModel.countDocuments() },
    { coleccion: 'positions', total: await PositionModel.countDocuments() },
    { coleccion: 'persons', total: await PersonModel.countDocuments() },
    { coleccion: 'workers', total: await WorkerModel.countDocuments() },
    { coleccion: 'teachers', total: await TeacherModel.countDocuments() },
    { coleccion: 'students', total: await StudentModel.countDocuments() },
    { coleccion: 'menus', total: await MenuModel.countDocuments() },
    { coleccion: 'profiles', total: await ProfileModel.countDocuments() },
    { coleccion: 'users', total: await UserModel.countDocuments() },
    { coleccion: 'enrollments', total: await EnrollmentModel.countDocuments() },
    { coleccion: 'teacher_assignments', total: await TeacherAssignmentModel.countDocuments() },
    { coleccion: 'schedules', total: await ScheduleModel.countDocuments() },
    { coleccion: 'evaluations', total: await EvaluationModel.countDocuments() },
    { coleccion: 'attendances', total: await AttendanceModel.countDocuments() },
    { coleccion: 'incidents', total: await IncidentModel.countDocuments() },
    { coleccion: 'tuition_payments', total: await TuitionPaymentModel.countDocuments() }
  ];

  console.log('\n📊 Resumen final de la base de datos eduportalangular (25 Colecciones):');
  console.table(summary);

  await mongoose.disconnect();
  console.log('✅ Base de datos lista con las 25 colecciones.');
}

initDatabase().catch((err) => {
  console.error('❌ Error al inicializar la base de datos:', err);
  process.exit(1);
});