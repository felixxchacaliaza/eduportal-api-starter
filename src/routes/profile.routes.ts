import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller.js';

export const profileRoutes = Router();

profileRoutes.get('/', ProfileController.getAll);
profileRoutes.get('/:id', ProfileController.getById);
profileRoutes.post('/', ProfileController.create);
profileRoutes.put('/:id', ProfileController.update);
profileRoutes.patch('/:id/toggle', ProfileController.toggle);
