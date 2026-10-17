import { Router } from 'express';
import { AreaController } from '../controllers/area.controller.js';

export const areaRoutes = Router();

// 1. Listar todas las áreas curriculares
areaRoutes.get('/', AreaController.getAreas);

// 2. Obtener área curricular por ID o por CODE (ej: /api/areas/CIE-001)
areaRoutes.get('/:id', AreaController.getAreaById);

// 3. Crear área curricular (código autogenerado con 3 primeras letras ej: ROB-001)
areaRoutes.post('/', AreaController.createArea);

// 4. Editar área curricular
areaRoutes.put('/:id', AreaController.updateArea);
