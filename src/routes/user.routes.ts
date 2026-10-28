import { Router } from 'express';
import { UserController } from '../controllers/user.controller.js';

export const userRoutes = Router();

userRoutes.get('/', UserController.getAll);
userRoutes.get('/:id', UserController.getById);
userRoutes.post('/', UserController.create);
userRoutes.put('/:id', UserController.update);
userRoutes.patch('/:id/toggle', UserController.toggle);
