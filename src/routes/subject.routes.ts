import { Router } from 'express';
import { SubjectController } from '../controllers/subject.controller.js';

export const subjectRoutes = Router();

// 1. Listar todos
subjectRoutes.get('/', SubjectController.getSubjects);

// 2. Listar por ID
subjectRoutes.get('/:id', SubjectController.getSubjectById);

// 3. Crear
subjectRoutes.post('/', SubjectController.createSubject);

// 4. Editar
subjectRoutes.put('/:id', SubjectController.updateSubject);
