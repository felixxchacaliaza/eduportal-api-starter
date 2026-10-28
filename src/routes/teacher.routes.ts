import { Router } from 'express';
import { TeacherController } from '../controllers/teacher.controller.js';

export const teacherRoutes = Router();

teacherRoutes.get('/', TeacherController.getAll);
teacherRoutes.get('/:id', TeacherController.getById);
teacherRoutes.post('/', TeacherController.create);
teacherRoutes.put('/:id', TeacherController.update);
teacherRoutes.patch('/:id/toggle', TeacherController.toggle);
