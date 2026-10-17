import { Router } from 'express';
import { GradeController } from '../controllers/grade.controller.js';

export const gradeRoutes = Router();

// 1. Listar todos los grados (ordenados por order y con level poblado)
gradeRoutes.get('/', GradeController.getGrades);

// 2. Listar grado por ID
gradeRoutes.get('/:id', GradeController.getGradeById);

// 3. Crear grado
gradeRoutes.post('/', GradeController.createGrade);

// 4. Editar grado
gradeRoutes.put('/:id', GradeController.updateGrade);
