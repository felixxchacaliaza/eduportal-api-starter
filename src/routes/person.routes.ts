import { Router } from 'express';
import { PersonController } from '../controllers/person.controller.js';

export const personRoutes = Router();

personRoutes.get('/', PersonController.getAll);
personRoutes.get('/check-dni/:dni', PersonController.checkDni);
personRoutes.get('/:id', PersonController.getById);
personRoutes.post('/', PersonController.create);
personRoutes.put('/:id', PersonController.update);
personRoutes.patch('/:id/toggle', PersonController.toggle);
