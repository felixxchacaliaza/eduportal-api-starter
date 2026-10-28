import { Router } from 'express';
import { PositionController } from '../controllers/position.controller.js';

export const positionRoutes = Router();

positionRoutes.get('/', PositionController.getAll);
positionRoutes.get('/:id', PositionController.getById);
positionRoutes.post('/', PositionController.create);
positionRoutes.put('/:id', PositionController.update);
positionRoutes.patch('/:id/toggle', PositionController.toggle);
