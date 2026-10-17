import { Router } from 'express';
import { SectionController } from '../controllers/section.controller.js';

export const sectionRoutes: Router = Router();

// 1. Listar todas las secciones
sectionRoutes.get('/', SectionController.getSections);

// 2. Obtener una sección por ID
sectionRoutes.get('/:id', SectionController.getSectionById);

// 3. Crear una nueva sección
sectionRoutes.post('/', SectionController.createSection);

// 4. Actualizar una sección
sectionRoutes.put('/:id', SectionController.updateSection);
