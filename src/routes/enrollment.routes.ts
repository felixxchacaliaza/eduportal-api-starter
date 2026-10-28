import { Router } from 'express';
import { EnrollmentController } from '../controllers/enrollment.controller.js';

export const enrollmentRoutes = Router();

enrollmentRoutes.get('/', EnrollmentController.getAll);
enrollmentRoutes.get('/by-section/:sectionId', EnrollmentController.getBySection);
enrollmentRoutes.post('/', EnrollmentController.create);
enrollmentRoutes.patch('/:id/status', EnrollmentController.updateStatus);
enrollmentRoutes.patch('/:id/section', EnrollmentController.changeSection);
