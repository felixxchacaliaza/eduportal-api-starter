import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { subjectRoutes } from './routes/subject.routes.js';
import { areaRoutes } from './routes/area.routes.js';
import { levelRoutes } from './routes/level.routes.js';
import { gradeRoutes } from './routes/grade.routes.js';
import { sectionRoutes } from './routes/section.routes.js';
import { classroomRoutes } from './routes/classroom.routes.js';
import { ruleRoutes } from './routes/rule.routes.js';
import { academicYearRoutes } from './routes/academic-year.routes.js';
import { gradeSectionRoutes } from './routes/grade-section.routes.js';
import { gradeSubjectRoutes } from './routes/grade-subject.routes.js';
import { authRoutes } from './routes/auth.routes.js';
import { personRoutes } from './routes/person.routes.js';
import { positionRoutes } from './routes/position.routes.js';
import { workerRoutes } from './routes/worker.routes.js';
import { teacherRoutes } from './routes/teacher.routes.js';
import { studentRoutes } from './routes/student.routes.js';
import { menuRoutes } from './routes/menu.routes.js';
import { profileRoutes } from './routes/profile.routes.js';
import { userRoutes } from './routes/user.routes.js';
import { enrollmentRoutes } from './routes/enrollment.routes.js';
import { teacherAssignmentRoutes } from './routes/teacher-assignment.routes.js';
import { scheduleRoutes } from './routes/schedule.routes.js';
import { evaluationRoutes } from './routes/evaluation.routes.js';
import { attendanceRoutes } from './routes/attendance.routes.js';
import { incidentRoutes } from './routes/incident.routes.js';
import { tuitionPaymentRoutes } from './routes/tuition-payment.routes.js';

export const app: Application = express();

// Middlewares globales
app.use(
  cors({
    origin: (requestOrigin, callback) => {
      // Permitir herramientas locales (Postman, curl) o llamadas sin cabecera origin:
      if (!requestOrigin) return callback(null, true);

      // Permitir localhost o 127.0.0.1 en cualquier puerto durante desarrollo:
      if (/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(requestOrigin)) {
        return callback(null, true);
      }

      if (requestOrigin === env.CORS_ORIGIN) {
        return callback(null, true);
      }

      callback(new Error('Bloqueado por política CORS'));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Endpoint de diagnóstico
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    database: 'eduportalangular',
    timestamp: new Date().toISOString()
  });
});

// Rutas de los módulos
app.use('/api/areas', areaRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/levels', levelRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/rules', ruleRoutes);
app.use('/api/academic-years', academicYearRoutes);
app.use('/api/grade-sections', gradeSectionRoutes);
app.use('/api/grade-subjects', gradeSubjectRoutes);

// Nuevas 16 rutas para completar las 25 colecciones y seguridad
app.use('/api/auth', authRoutes);
app.use('/api/persons', personRoutes);
app.use('/api/positions', positionRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/users', userRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/teacher-assignments', teacherAssignmentRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/attendances', attendanceRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/tuition-payments', tuitionPaymentRoutes);

// Manejador 404
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
});

// Manejador global de errores
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('💥 Error inesperado:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: err.message
  });
});
