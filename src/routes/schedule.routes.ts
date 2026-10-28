import { Router } from 'express';
import { ScheduleController } from '../controllers/schedule.controller.js';

export const scheduleRoutes = Router();

scheduleRoutes.get('/', ScheduleController.getAll);
scheduleRoutes.get('/by-section/:sectionId', ScheduleController.getBySection);
scheduleRoutes.get('/by-teacher/:teacherId', ScheduleController.getByTeacher);
scheduleRoutes.get('/:id', ScheduleController.getById);
scheduleRoutes.post('/', ScheduleController.create);
scheduleRoutes.delete('/:id', ScheduleController.delete);
