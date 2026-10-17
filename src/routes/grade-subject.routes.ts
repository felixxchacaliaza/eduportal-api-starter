import { Router } from 'express';
import { GradeSubjectController } from '../controllers/grade-subject.controller.js';

export const gradeSubjectRoutes: Router = Router();

// 1. Listar la malla curricular de asignaturas por grado (permite filtro ?grade=...&academicYear=...)
gradeSubjectRoutes.get('/', GradeSubjectController.getGradeSubjects);

// 2. Obtener una asignación curricular por ID
gradeSubjectRoutes.get('/:id', GradeSubjectController.getGradeSubjectById);

// 3. Asignar una materia a un grado escolar (valida límite de 40 horas MINEDU)
gradeSubjectRoutes.post('/', GradeSubjectController.createGradeSubject);

// 4. Actualizar asignación curricular (editar horas o estado)
gradeSubjectRoutes.put('/:id', GradeSubjectController.updateGradeSubject);
