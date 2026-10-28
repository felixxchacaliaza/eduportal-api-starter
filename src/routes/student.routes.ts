import { Router } from 'express';
import { StudentController } from '../controllers/student.controller.js';

export const studentRoutes = Router();

studentRoutes.get('/', StudentController.getAll);
studentRoutes.get('/:id', StudentController.getById);
studentRoutes.post('/', StudentController.create);
studentRoutes.put('/:id', StudentController.update);
studentRoutes.patch('/:id/toggle', StudentController.toggle);
