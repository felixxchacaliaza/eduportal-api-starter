import { Router } from 'express';
import { TeacherAssignmentController } from '../controllers/teacher-assignment.controller.js';

export const teacherAssignmentRoutes = Router();

teacherAssignmentRoutes.get('/', TeacherAssignmentController.getAll);
teacherAssignmentRoutes.post('/', TeacherAssignmentController.create);
teacherAssignmentRoutes.delete('/:id', TeacherAssignmentController.delete);
