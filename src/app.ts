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
