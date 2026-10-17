import { Router } from 'express';
import { ClassroomController } from '../controllers/classroom.controller.js';

export const classroomRoutes: Router = Router();

// 1. Listar todas las aulas
classroomRoutes.get('/', ClassroomController.getClassrooms);

// 2. Obtener un aula por ID
classroomRoutes.get('/:id', ClassroomController.getClassroomById);

// 3. Crear una nueva aula
classroomRoutes.post('/', ClassroomController.createClassroom);

// 4. Actualizar un aula
classroomRoutes.put('/:id', ClassroomController.updateClassroom);
