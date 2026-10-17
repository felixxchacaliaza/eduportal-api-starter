import { Router } from 'express';
import { RuleController } from '../controllers/rule.controller.js';

export const ruleRoutes: Router = Router();

// 1. Listar todas las reglas
ruleRoutes.get('/', RuleController.getRules);

// 2. Obtener una regla por ID o por KEY (ej: /api/rules/CURRENT_ACADEMIC_YEAR)
ruleRoutes.get('/:id', RuleController.getRuleById);

// 3. Crear una nueva regla
ruleRoutes.post('/', RuleController.createRule);

// 4. Actualizar una regla por ID o por KEY
ruleRoutes.put('/:id', RuleController.updateRule);
