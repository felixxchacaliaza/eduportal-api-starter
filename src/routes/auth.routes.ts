import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';

export const authRoutes = Router();

authRoutes.post('/login', AuthController.login);
authRoutes.get('/me', AuthController.me);
