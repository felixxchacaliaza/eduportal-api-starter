import { Router } from 'express';
import { IncidentController } from '../controllers/incident.controller.js';

export const incidentRoutes = Router();

incidentRoutes.get('/', IncidentController.getAll);
incidentRoutes.get('/by-student/:studentId', IncidentController.getByStudent);
incidentRoutes.post('/', IncidentController.create);
incidentRoutes.patch('/:id/status', IncidentController.updateStatus);
