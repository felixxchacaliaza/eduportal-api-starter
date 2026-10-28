import { Router } from 'express';
import { EvaluationController } from '../controllers/evaluation.controller.js';

export const evaluationRoutes = Router();

evaluationRoutes.get('/', EvaluationController.getAll);
evaluationRoutes.get('/matrix', EvaluationController.getMatrix);
evaluationRoutes.get('/:id', EvaluationController.getById);
evaluationRoutes.put('/bulk-update', EvaluationController.bulkUpdate);
