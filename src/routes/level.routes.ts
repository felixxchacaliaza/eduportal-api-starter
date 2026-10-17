import { Router } from 'express';
import { LevelController } from '../controllers/level.controller.js';

export const levelRoutes = Router();

// 1. Listar todos los niveles
levelRoutes.get('/', LevelController.getLevels);

// 2. Listar nivel por ID
levelRoutes.get('/:id', LevelController.getLevelById);

// 3. Crear nivel (autogenera código con 3 primeras letras de name si no se envía)
levelRoutes.post('/', LevelController.createLevel);

// 4. Editar nivel
levelRoutes.put('/:id', LevelController.updateLevel);
