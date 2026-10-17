import { Router } from 'express';
import { GradeSectionController } from '../controllers/grade-section.controller.js';

export const gradeSectionRoutes: Router = Router();

// 1. Listar todas las asignaciones de salón (grados y secciones)
gradeSectionRoutes.get('/', GradeSectionController.getGradeSections);

// 2. Obtener un salón por ID
gradeSectionRoutes.get('/:id', GradeSectionController.getGradeSectionById);

// 3. Crear una nueva asignación de salón
gradeSectionRoutes.post('/', GradeSectionController.createGradeSection);

// 4. Actualizar un salón
gradeSectionRoutes.put('/:id', GradeSectionController.updateGradeSection);
