import { Router } from 'express';
import { AcademicYearController } from '../controllers/academic-year.controller.js';

export const academicYearRoutes = Router();

// 1. Listar todos los años lectivos
academicYearRoutes.get('/', AcademicYearController.getAcademicYears);

// 2. Obtener año lectivo por ID, código o año
academicYearRoutes.get('/:id', AcademicYearController.getAcademicYearById);

// 3. Crear y aperturar nuevo año lectivo
academicYearRoutes.post('/', AcademicYearController.createAcademicYear);

// 4. Actualizar año lectivo y gestionar transiciones de estado
academicYearRoutes.put('/:id', AcademicYearController.updateAcademicYear);
