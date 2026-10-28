import { Router } from 'express';
import { TuitionPaymentController } from '../controllers/tuition-payment.controller.js';

export const tuitionPaymentRoutes = Router();

export { tuitionPaymentRoutes as tuitionPaymentRoutesDefault };
tuitionPaymentRoutes.get('/', TuitionPaymentController.getAll);
tuitionPaymentRoutes.get('/kpis-summary', TuitionPaymentController.getKpis);
tuitionPaymentRoutes.get('/by-student/:studentId', TuitionPaymentController.getByStudent);
tuitionPaymentRoutes.get('/:id', TuitionPaymentController.getById);
tuitionPaymentRoutes.post('/pay/:id', TuitionPaymentController.pay);
