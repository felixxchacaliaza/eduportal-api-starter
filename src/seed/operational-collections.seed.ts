import mongoose from 'mongoose';
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
import { GradeSectionModel } from '../models/grade-section.model.js';
import { AreaModel } from '../models/area.model.js';
import { SubjectModel } from '../models/subject.model.js';
import { GradeSubjectModel } from '../models/grade-subject.model.js';

export async function seedOperationalCollections(): Promise<void> {
  console.log('  👥 Sembrando Padrón de Personas y Catálogo de Cargos...');

  // 1. CARGOS / PUESTOS (positions)
  const positionsData = [
    { code: 'POS-001', name: 'DIRECTOR GENERAL', department: 'DIRECCION', description: 'Máxima autoridad ejecutiva del plantel' },
    { code: 'POS-002', name: 'SUBDIRECTOR ACADÉMICO', department: 'DIRECCION', description: 'Coordinador general pedagógico' },
    { code: 'POS-003', name: 'SECRETARIA ACADÉMICA', department: 'ADMINISTRACION', description: 'Gestión de expedientes y trámites MINEDU' },
    { code: 'POS-004', name: 'PSICÓLOGO EDUCATIVO', department: 'PSICOPEDAGOGIA', description: 'Atención psicológica y convivencia escolar' },
    { code: 'POS-005', name: 'AUXILIAR DE EDUCACIÓN', department: 'CONVIVENCIA', description: 'Control de asistencia y disciplina escolar' },
    { code: 'POS-006', name: 'CONSERJE', department: 'SERVICIOS_GENERALES', description: 'Mantenimiento preventivo y portería' },
    { code: 'POS-007', name: 'PERSONAL DE LIMPIEZA', department: 'SERVICIOS_GENERALES', description: 'Higiene y mantenimiento de aulas' }
  ];

  for (const pos of positionsData) {
    await PositionModel.findOneAndUpdate({ code: pos.code }, pos, { upsert: true, new: true });
  }

  const posDirector = await PositionModel.findOne({ code: 'POS-001' });
  const posSecretaria = await PositionModel.findOne({ code: 'POS-003' });
  const posPsicologo = await PositionModel.findOne({ code: 'POS-004' });
  const posAuxiliar = await PositionModel.findOne({ code: 'POS-005' });
  const posConserje = await PositionModel.findOne({ code: 'POS-006' });

  // 2. PADRÓN DE PERSONAS (persons) - 25 Personas
  const personsData = [
    // Directivos y Administrativos
    { code: 'PER-001', dni: '10293847', firstName: 'Félix', lastName: 'Chacaliaza Flores', gender: 'M', personalEmail: 'root@eduportal.edu.pe', phone: '998877665', address: 'Av. Arequipa 1250, Lima' },
    { code: 'PER-002', dni: '20394857', firstName: 'Roberto', lastName: 'Mendoza Ramos', gender: 'M', personalEmail: 'roberto.mendoza@eduportal.edu.pe', phone: '987654321', address: 'Calle Los Olivos 234, Lince' },
    { code: 'PER-003', dni: '30495867', firstName: 'María', lastName: 'Salazar Castro', gender: 'F', personalEmail: 'maria.salazar@eduportal.edu.pe', phone: '976543210', address: 'Jr. Huancavelica 542, Lima' },
    { code: 'PER-004', dni: '40596878', firstName: 'Jorge', lastName: 'Navarro Silva', gender: 'M', personalEmail: 'jorge.navarro@eduportal.edu.pe', phone: '965432109', address: 'Av. Larco 820, Miraflores' },
    { code: 'PER-005', dni: '50697889', firstName: 'Carmen', lastName: 'Vega Prado', gender: 'F', personalEmail: 'carmen.vega@eduportal.edu.pe', phone: '954321098', address: 'Av. Brasil 1420, Jesús María' },
    { code: 'PER-006', dni: '60798890', firstName: 'Manuel', lastName: 'Quispe Soto', gender: 'M', personalEmail: 'manuel.quispe@eduportal.edu.pe', phone: '943210987', address: 'Jr. Junín 330, Rímac' },

    // Profesores
    { code: 'PER-007', dni: '70899901', firstName: 'Carlos', lastName: 'Valdivia Herrera', gender: 'M', personalEmail: 'carlos.valdivia@eduportal.edu.pe', phone: '932109876', address: 'Calle Schell 450, Miraflores' },
    { code: 'PER-008', dni: '80900012', firstName: 'Patricia', lastName: 'Guerrero Alva', gender: 'F', personalEmail: 'patricia.guerrero@eduportal.edu.pe', phone: '921098765', address: 'Av. Salaverry 1800, San Isidro' },
    { code: 'PER-009', dni: '91011123', firstName: 'Hugo', lastName: 'Paredes Cárdenas', gender: 'M', personalEmail: 'hugo.paredes@eduportal.edu.pe', phone: '910987654', address: 'Av. Universitaria 2200, San Miguel' },
    { code: 'PER-010', dni: '12122234', firstName: 'Rosa', lastName: 'Montero Chávez', gender: 'F', personalEmail: 'rosa.montero@eduportal.edu.pe', phone: '909876543', address: 'Av. Colonial 1100, Bellavista' },
    { code: 'PER-011', dni: '23233345', firstName: 'Eduardo', lastName: 'Campos Luna', gender: 'M', personalEmail: 'eduardo.campos@eduportal.edu.pe', phone: '998765432', address: 'Jr. Ayacucho 410, Magdalena' },

    // Padres / Apoderados
    { code: 'PER-012', dni: '34344456', firstName: 'Fernando', lastName: 'Rosas Medina', gender: 'M', personalEmail: 'fernando.rosas@gmail.com', phone: '987123456', address: 'Av. Pardo 650, Miraflores' },
    { code: 'PER-013', dni: '45455567', firstName: 'Lucía', lastName: 'Gómez Vidal', gender: 'F', personalEmail: 'lucia.gomez@gmail.com', phone: '976234567', address: 'Av. Pardo 650, Miraflores' },
    { code: 'PER-014', dni: '56566678', firstName: 'Walter', lastName: 'Benítez Cruz', gender: 'M', personalEmail: 'walter.benitez@gmail.com', phone: '965345678', address: 'Calle Manco Cápac 120, Surco' },
    { code: 'PER-015', dni: '67677789', firstName: 'Elena', lastName: 'Ortiz Rivas', gender: 'F', personalEmail: 'elena.ortiz@gmail.com', phone: '954456789', address: 'Calle Tarata 340, Miraflores' },

    // Alumnos
    { code: 'PER-016', dni: '78788890', firstName: 'Diego', lastName: 'Rosas Gómez', gender: 'M', personalEmail: 'diego.rosas@student.eduportal.edu.pe', phone: '943567890', address: 'Av. Pardo 650, Miraflores' },
    { code: 'PER-017', dni: '89899901', firstName: 'Camila', lastName: 'Rosas Gómez', gender: 'F', personalEmail: 'camila.rosas@student.eduportal.edu.pe', phone: '932678901', address: 'Av. Pardo 650, Miraflores' },
    { code: 'PER-018', dni: '90900012', firstName: 'Sebastián', lastName: 'Benítez Flores', gender: 'M', personalEmail: 'sebastian.benitez@student.eduportal.edu.pe', phone: '921789012', address: 'Calle Manco Cápac 120, Surco' },
    { code: 'PER-019', dni: '11112233', firstName: 'Valeria', lastName: 'Ortiz Morales', gender: 'F', personalEmail: 'valeria.ortiz@student.eduportal.edu.pe', phone: '910890123', address: 'Calle Tarata 340, Miraflores' },
    { code: 'PER-020', dni: '22223344', firstName: 'Mateo', lastName: 'Paredes Guzmán', gender: 'M', personalEmail: 'mateo.paredes@student.eduportal.edu.pe', phone: '909901234', address: 'Av. La Marina 1500, San Miguel' }
  ];

  for (const p of personsData) {
    await PersonModel.findOneAndUpdate({ code: p.code }, p, { upsert: true, new: true });
  }

  // 3. TRABAJADORES (workers)
  const perDirector = await PersonModel.findOne({ code: 'PER-002' });
  const perSecretaria = await PersonModel.findOne({ code: 'PER-003' });
  const perPsicologo = await PersonModel.findOne({ code: 'PER-004' });
  const perAuxiliar = await PersonModel.findOne({ code: 'PER-005' });
  const perConserje = await PersonModel.findOne({ code: 'PER-006' });

  const workersData = [
    { code: 'WRK-001', person: perDirector?._id, position: posDirector?._id, shift: 'COMPLETO' },
    { code: 'WRK-002', person: perSecretaria?._id, position: posSecretaria?._id, shift: 'MAÑANA' },
    { code: 'WRK-003', person: perPsicologo?._id, position: posPsicologo?._id, shift: 'COMPLETO' },
    { code: 'WRK-004', person: perAuxiliar?._id, position: posAuxiliar?._id, shift: 'MAÑANA' },
    { code: 'WRK-005', person: perConserje?._id, position: posConserje?._id, shift: 'TARDE' }
  ];

  for (const w of workersData) {
    if (w.person && w.position) {
      await WorkerModel.findOneAndUpdate({ code: w.code }, w, { upsert: true, new: true });
    }
  }

  // 4. PROFESORES (teachers)
  const areas = await AreaModel.find();
  const areaCiencias = areas[0]?._id;
  const areaHumanidades = areas[1]?._id || areaCiencias;

  const perProf1 = await PersonModel.findOne({ code: 'PER-007' });
  const perProf2 = await PersonModel.findOne({ code: 'PER-008' });
  const perProf3 = await PersonModel.findOne({ code: 'PER-009' });
  const perProf4 = await PersonModel.findOne({ code: 'PER-010' });
  const perProf5 = await PersonModel.findOne({ code: 'PER-011' });

  const teachersData = [
    { code: 'TEA-001', person: perProf1?._id, area: areaCiencias, academicDegree: 'LICENCIADO', contractedHours: 30, assignedHours: 12 },
    { code: 'TEA-002', person: perProf2?._id, area: areaHumanidades, academicDegree: 'MAGISTER', contractedHours: 30, assignedHours: 10 },
    { code: 'TEA-003', person: perProf3?._id, area: areaCiencias, academicDegree: 'LICENCIADO', contractedHours: 24, assignedHours: 8 },
    { code: 'TEA-004', person: perProf4?._id, area: areaHumanidades, academicDegree: 'PROFESOR_TITULADO', contractedHours: 30, assignedHours: 10 },
    { code: 'TEA-005', person: perProf5?._id, area: areaCiencias, academicDegree: 'DOCTOR', contractedHours: 30, assignedHours: 8 }
  ];

  for (const t of teachersData) {
    if (t.person && t.area) {
      await TeacherModel.findOneAndUpdate({ code: t.code }, t, { upsert: true, new: true });
    }
  }

  // Asignar tutores a salones grade_sections
  const teacher1 = await TeacherModel.findOne({ code: 'TEA-001' });
  const teacher2 = await TeacherModel.findOne({ code: 'TEA-002' });
  const salones = await GradeSectionModel.find();
  if (salones.length > 0 && teacher1) {
    salones[0].tutor = teacher1._id as any;
    await salones[0].save();
  }
  if (salones.length > 1 && teacher2) {
    salones[1].tutor = teacher2._id as any;
    await salones[1].save();
  }

  // 5. ESTUDIANTES Y APODERADOS (students)
  const perPapa1 = await PersonModel.findOne({ code: 'PER-012' });
  const perMama1 = await PersonModel.findOne({ code: 'PER-013' });
  const perPapa2 = await PersonModel.findOne({ code: 'PER-014' });
  const perMama3 = await PersonModel.findOne({ code: 'PER-015' });

  const perAlum1 = await PersonModel.findOne({ code: 'PER-016' });
  const perAlum2 = await PersonModel.findOne({ code: 'PER-017' });
  const perAlum3 = await PersonModel.findOne({ code: 'PER-018' });
  const perAlum4 = await PersonModel.findOne({ code: 'PER-019' });
  const perAlum5 = await PersonModel.findOne({ code: 'PER-020' });

  const studentsData = [
    {
      code: 'STU-001',
      person: perAlum1?._id,
      guardians: [
        { person: perPapa1?._id, relationship: 'PADRE', isPrimary: true },
        { person: perMama1?._id, relationship: 'MADRE', isPrimary: false }
      ],
      entryYear: '2025'
    },
    {
      code: 'STU-002',
      person: perAlum2?._id,
      guardians: [
        { person: perPapa1?._id, relationship: 'PADRE', isPrimary: false },
        { person: perMama1?._id, relationship: 'MADRE', isPrimary: true }
      ],
      entryYear: '2025'
    },
    {
      code: 'STU-003',
      person: perAlum3?._id,
      guardians: [
        { person: perPapa2?._id, relationship: 'PADRE', isPrimary: true }
      ],
      entryYear: '2026'
    },
    {
      code: 'STU-004',
      person: perAlum4?._id,
      guardians: [
        { person: perMama3?._id, relationship: 'MADRE', isPrimary: true }
      ],
      entryYear: '2026'
    },
    {
      code: 'STU-005',
      person: perAlum5?._id,
      guardians: [
        { person: perProf3?._id, relationship: 'PADRE', isPrimary: true } // Demuestra compatibilidad: un profesor puede ser apoderado
      ],
      entryYear: '2026'
    }
  ];

  for (const st of studentsData) {
    if (st.person) {
      await StudentModel.findOneAndUpdate({ code: st.code }, st, { upsert: true, new: true });
    }
  }

  // 6. MENÚ LATERAL DINÁMICO (menus)
  console.log('  🔐 Sembrando Menús Dinámicos, Perfiles RBAC y Super Usuario...');

  // Grupos Principales y Raíces
  const rootMenus = [
    { code: 'MEN-001', key: 'DASHBOARD', label: 'Panel de Control', icon: 'dashboard', path: '/dashboard', parent: null, order: 1 },
    { code: 'MEN-002', key: 'STUDENTS', label: 'Estudiantes', icon: 'school', path: '/alumnos', parent: null, order: 2 },
    { code: 'MEN-003', key: 'STAFF', label: 'Personal Escolar', icon: 'people', path: '/personal', parent: null, order: 3 },
    { code: 'MEN-004', key: 'GROUP_ACADEMIC', label: 'Gestión Académica', icon: 'class', path: null, parent: null, order: 4 },
    { code: 'MEN-005', key: 'EVALUATIONS', label: 'Calificaciones', icon: 'grade', path: '/notas', parent: null, order: 5 },
    { code: 'MEN-006', key: 'ATTENDANCES', label: 'Asistencia Diaria', icon: 'event_available', path: '/asistencia', parent: null, order: 6 },
    { code: 'MEN-007', key: 'INCIDENTS', label: 'Convivencia y Psicología', icon: 'psychology', path: '/incidencias', parent: null, order: 7 },
    { code: 'MEN-008', key: 'PAYMENTS', label: 'Pensiones y Cobranzas', icon: 'payments', path: '/pensiones', parent: null, order: 8 },
    { code: 'MEN-009', key: 'GROUP_MAINTENANCE', label: 'Mantenimiento', icon: 'settings', path: null, parent: null, order: 9 },
    { code: 'MEN-010', key: 'GROUP_SECURITY', label: 'Seguridad y Acceso', icon: 'shield', path: null, parent: null, order: 10 }
  ];

  for (const m of rootMenus) {
    await MenuModel.findOneAndUpdate({ code: m.code }, m, { upsert: true, new: true });
  }

  const groupAcademic = await MenuModel.findOne({ code: 'MEN-004' });
  const groupMaintenance = await MenuModel.findOne({ code: 'MEN-009' });
  const groupSecurity = await MenuModel.findOne({ code: 'MEN-010' });

  // Submenús Hijos
  const subMenus = [
    // Submenús de Gestión Académica
    { code: 'MEN-011', key: 'GRADE_SECTIONS', label: 'Salones y Secciones', icon: 'meeting_room', path: '/grados-secciones', parent: groupAcademic?._id, order: 1 },
    { code: 'MEN-012', key: 'GRADE_SUBJECTS', label: 'Malla Curricular', icon: 'account_tree', path: '/grados-asignaturas', parent: groupAcademic?._id, order: 2 },
    { code: 'MEN-013', key: 'SUBJECTS', label: 'Catálogo de Asignaturas', icon: 'menu_book', path: '/asignaturas', parent: groupAcademic?._id, order: 3 },

    // Submenús de Mantenimiento
    { code: 'MEN-014', key: 'LEVELS', label: 'Niveles Educativos', icon: 'stairs', path: '/niveles', parent: groupMaintenance?._id, order: 1 },
    { code: 'MEN-015', key: 'AREAS', label: 'Áreas Curriculares', icon: 'category', path: '/areas', parent: groupMaintenance?._id, order: 2 },
    { code: 'MEN-016', key: 'POSITIONS', label: 'Cargos Institucionales', icon: 'work', path: '/cargos', parent: groupMaintenance?._id, order: 3 },

    // Submenús de Seguridad
    { code: 'MEN-017', key: 'USERS', label: 'Cuentas de Acceso', icon: 'manage_accounts', path: '/usuarios', parent: groupSecurity?._id, order: 1 },
    { code: 'MEN-018', key: 'PROFILES', label: 'Perfiles y Permisos RBAC', icon: 'admin_panel_settings', path: '/perfiles', parent: groupSecurity?._id, order: 2 }
  ];

  for (const sm of subMenus) {
    if (sm.parent) {
      await MenuModel.findOneAndUpdate({ code: sm.code }, sm, { upsert: true, new: true });
    }
  }

  // 7. PERFILES RBAC (profiles)
  const allMenuList = await MenuModel.find();
  const menuStudents = allMenuList.find(m => m.key === 'STUDENTS');
  const menuEvals = allMenuList.find(m => m.key === 'EVALUATIONS');
  const menuAtt = allMenuList.find(m => m.key === 'ATTENDANCES');

  const profilesData = [
    {
      code: 'PRF-001',
      name: 'SUPER USUARIO',
      description: 'Acceso total omnipotente a todos los módulos y opciones',
      isSuperAdmin: true,
      isSystem: true,
      permissions: []
    },
    {
      code: 'PRF-002',
      name: 'DIRECTOR GENERAL',
      description: 'Gestión ejecutiva completa del plantel',
      isSuperAdmin: false,
      isSystem: true,
      permissions: allMenuList.map(m => ({ menu: m._id, accessLevel: 'FULL' }))
    },
    {
      code: 'PRF-003',
      name: 'DOCENTE DE AULA',
      description: 'Registro de calificaciones y asistencia de sus salones',
      isSuperAdmin: false,
      isSystem: true,
      permissions: [
        { menu: menuEvals?._id, accessLevel: 'FULL' },
        { menu: menuAtt?._id, accessLevel: 'FULL' },
        { menu: menuStudents?._id, accessLevel: 'READ_ONLY' }
      ].filter(p => p.menu)
    }
  ];

  for (const prof of profilesData) {
    await ProfileModel.findOneAndUpdate({ code: prof.code }, prof, { upsert: true, new: true });
  }

  const profSuper = await ProfileModel.findOne({ code: 'PRF-001' });
  const profDirector = await ProfileModel.findOne({ code: 'PRF-002' });
  const profDocente = await ProfileModel.findOne({ code: 'PRF-003' });

  // 8. CUENTAS DE USUARIO (users)
  const perSuper = await PersonModel.findOne({ code: 'PER-001' }); // Felix
  const perDir = await PersonModel.findOne({ code: 'PER-002' });
  const perDoc = await PersonModel.findOne({ code: 'PER-007' });

  const usersData = [
    {
      code: 'USR-001',
      person: perSuper?._id,
      profile: profSuper?._id,
      email: 'root@eduportal.edu.pe',
      password: 'Admin123*',
      isProtected: true
    },
    {
      code: 'USR-002',
      person: perDir?._id,
      profile: profDirector?._id,
      email: 'director@eduportal.edu.pe',
      password: 'Director123*',
      isProtected: false
    },
    {
      code: 'USR-003',
      person: perDoc?._id,
      profile: profDocente?._id,
      email: 'docente@eduportal.edu.pe',
      password: 'Docente123*',
      isProtected: false
    }
  ];

  for (const u of usersData) {
    if (u.person && u.profile) {
      const existingUser = await UserModel.findOne({ code: u.code });
      if (existingUser) {
        existingUser.email = u.email;
        existingUser.password = u.password;
        await existingUser.save();
      } else {
        await UserModel.create(u);
      }
    }
  }

  // 9. MATRÍCULAS ESCOLARES (enrollments)
  console.log('  🎓 Sembrando Matrículas, Evaluaciones, Asistencias y Pensiones...');
  const st1 = await StudentModel.findOne({ code: 'STU-001' });
  const st2 = await StudentModel.findOne({ code: 'STU-002' });
  const st3 = await StudentModel.findOne({ code: 'STU-003' });
  const salon1 = salones[0]?._id;
  const salon2 = salones[1]?._id || salon1;

  const enrollmentsData = [
    { code: 'MAT-001', student: st1?._id, gradeSection: salon1, academicYear: '2026', enrollmentType: 'REGULAR', status: 'MATRICULADO' },
    { code: 'MAT-002', student: st2?._id, gradeSection: salon1, academicYear: '2026', enrollmentType: 'REGULAR', status: 'MATRICULADO' },
    { code: 'MAT-003', student: st3?._id, gradeSection: salon2, academicYear: '2026', enrollmentType: 'INGRESANTE', status: 'MATRICULADO' }
  ];

  for (const enr of enrollmentsData) {
    if (enr.student && enr.gradeSection) {
      await EnrollmentModel.findOneAndUpdate({ code: enr.code }, enr, { upsert: true, new: true });
    }
  }

  // Actualizar enrolledStudents en salones
  if (salones[0]) {
    salones[0].enrolledStudents = 2;
    await salones[0].save();
  }
  if (salones[1]) {
    salones[1].enrolledStudents = 1;
    await salones[1].save();
  }

  // 10. ASIGNACIONES DOCENTES (teacher_assignments)
  const materias = await SubjectModel.find();
  const mat1 = materias[0]?._id;
  const mat2 = materias[1]?._id || mat1;

  const assignmentsData = [
    { code: 'TAS-001', teacher: teacher1?._id, gradeSection: salon1, subject: mat1, academicYear: '2026', weeklyHours: 4 },
    { code: 'TAS-002', teacher: teacher2?._id, gradeSection: salon1, subject: mat2, academicYear: '2026', weeklyHours: 3 }
  ];

  for (const asg of assignmentsData) {
    if (asg.teacher && asg.gradeSection && asg.subject) {
      await TeacherAssignmentModel.findOneAndUpdate({ code: asg.code }, asg, { upsert: true, new: true });
    }
  }

  const asg1 = await TeacherAssignmentModel.findOne({ code: 'TAS-001' });

  // 11. HORARIOS (schedules)
  if (asg1 && teacher1 && salon1 && mat1) {
    const schedulesData = [
      { code: 'SCH-001', teacherAssignment: asg1._id, gradeSection: salon1, subject: mat1, teacher: teacher1._id, academicYear: '2026', dayOfWeek: 'LUNES', startTime: '08:00', endTime: '09:30' },
      { code: 'SCH-002', teacherAssignment: asg1._id, gradeSection: salon1, subject: mat1, teacher: teacher1._id, academicYear: '2026', dayOfWeek: 'MIERCOLES', startTime: '08:00', endTime: '09:30' }
    ];
    for (const sc of schedulesData) {
      await ScheduleModel.findOneAndUpdate({ code: sc.code }, sc, { upsert: true, new: true });
    }
  }

  // 12. CALIFICACIONES DINÁMICAS (evaluations)
  const matEnr1 = await EnrollmentModel.findOne({ code: 'MAT-001' });
  const matEnr2 = await EnrollmentModel.findOne({ code: 'MAT-002' });

  const evalsData = [
    {
      code: 'EVA-001',
      enrollment: matEnr1?._id,
      student: st1?._id,
      subject: mat1,
      gradeSection: salon1,
      teacher: teacher1?._id,
      academicYear: '2026',
      periods: [
        { period: 1, score: 16 },
        { period: 2, score: 18 },
        { period: 3, score: null },
        { period: 4, score: null }
      ],
      finalAverage: 17,
      status: 'EN_CURSO',
      observation: 'Excelente desempeño en bimestres calificados'
    },
    {
      code: 'EVA-002',
      enrollment: matEnr2?._id,
      student: st2?._id,
      subject: mat1,
      gradeSection: salon1,
      teacher: teacher1?._id,
      academicYear: '2026',
      periods: [
        { period: 1, score: 14 },
        { period: 2, score: 15 },
        { period: 3, score: null },
        { period: 4, score: null }
      ],
      finalAverage: 15,
      status: 'EN_CURSO',
      observation: 'Participación activa'
    }
  ];

  for (const ev of evalsData) {
    if (ev.enrollment && ev.student && ev.subject) {
      await EvaluationModel.findOneAndUpdate({ code: ev.code }, ev, { upsert: true, new: true });
    }
  }

  // 13. ASISTENCIAS (attendances)
  const today = new Date();
  const attendancesData = [
    { code: 'ATT-001', student: st1?._id, gradeSection: salon1, academicYear: '2026', date: today, status: 'PRESENTE', observation: 'Puntual', registeredBy: perAuxiliar?._id },
    { code: 'ATT-002', student: st2?._id, gradeSection: salon1, academicYear: '2026', date: today, status: 'TARDANZA', observation: 'Ingreso 8:15 am', registeredBy: perAuxiliar?._id }
  ];

  for (const at of attendancesData) {
    if (at.student && at.gradeSection && at.registeredBy) {
      await AttendanceModel.findOneAndUpdate({ code: at.code }, at, { upsert: true, new: true });
    }
  }

  // 14. INCIDENCIAS Y PSICOLOGÍA (incidents)
  const incidentsData = [
    {
      code: 'INC-001',
      student: st1?._id,
      gradeSection: salon1,
      academicYear: '2026',
      reportedBy: perPsicologo?._id,
      type: 'ATENCION_PSICOLOGICA',
      severity: 'LEVE',
      title: 'Orientación vocacional y hábitos de estudio',
      description: 'El alumno solicita pautas de organización horaria y técnicas de concentración.',
      actionTaken: 'Se entrega planificador semanal y se agenda seguimiento quincenal.',
      status: 'EN_SEGUIMIENTO'
    },
    {
      code: 'INC-002',
      student: st2?._id,
      gradeSection: salon1,
      academicYear: '2026',
      reportedBy: perAuxiliar?._id,
      type: 'MERITO',
      severity: 'LEVE',
      title: 'Felicitación por apoyo solidario en olimpiadas',
      description: 'La alumna colaboró activamente en la organización de la delegación de su salón.',
      actionTaken: 'Reconocimiento en formación escolar.',
      status: 'CERRADA'
    }
  ];

  for (const inc of incidentsData) {
    if (inc.student && inc.gradeSection && inc.reportedBy) {
      await IncidentModel.findOneAndUpdate({ code: inc.code }, inc, { upsert: true, new: true });
    }
  }

  // 15. CRONOGRAMA DE PENSIONES (tuition_payments)
  const pensionMonths = [
    'PENSION_MARZO', 'PENSION_ABRIL', 'PENSION_MAYO', 'PENSION_JUNIO', 'PENSION_JULIO',
    'PENSION_AGOSTO', 'PENSION_SETIEMBRE', 'PENSION_OCTUBRE', 'PENSION_NOVIEMBRE', 'PENSION_DICIEMBRE'
  ] as const;

  let payIndex = 1;
  const paymentsList: any[] = [];

  // Matrícula y pensiones para Alumno 1
  if (st1 && matEnr1) {
    paymentsList.push({
      code: `PAY-${String(payIndex++).padStart(3, '0')}`,
      student: st1._id,
      enrollment: matEnr1._id,
      academicYear: '2026',
      concept: 'MATRICULA',
      amount: 350.0,
      dueDate: new Date('2026-02-15'),
      paidDate: new Date('2026-02-10'),
      paymentMethod: 'TRANSFERENCIA',
      status: 'PAGADO'
    });

    for (let m = 0; m < 10; m++) {
      const isPaid = m < 2; // Marzo y Abril pagados
      const monthNum = m + 3;
      paymentsList.push({
        code: `PAY-${String(payIndex++).padStart(3, '0')}`,
        student: st1._id,
        enrollment: matEnr1._id,
        academicYear: '2026',
        concept: pensionMonths[m],
        amount: 350.0,
        dueDate: new Date(`2026-${String(monthNum).padStart(2, '0')}-05`),
        paidDate: isPaid ? new Date(`2026-${String(monthNum).padStart(2, '0')}-03`) : null,
        paymentMethod: isPaid ? 'YAPE_PLIN' : null,
        status: isPaid ? 'PAGADO' : 'PENDIENTE'
      });
    }
  }

  for (const pay of paymentsList) {
    await TuitionPaymentModel.findOneAndUpdate({ code: pay.code }, pay, { upsert: true, new: true });
  }

  console.log('  ✅ Las 15 colecciones operativas quedaron sembradas con éxito.');
}
