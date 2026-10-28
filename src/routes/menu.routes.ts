import { Router } from 'express';
import { MenuController } from '../controllers/menu.controller.js';

export const menuRoutes = Router();

menuRoutes.get('/', MenuController.getAll);
menuRoutes.get('/tree', MenuController.getTree);
menuRoutes.get('/:id', MenuController.getById);
menuRoutes.post('/', MenuController.create);
menuRoutes.put('/:id', MenuController.update);
menuRoutes.patch('/:id/toggle', MenuController.toggle);
