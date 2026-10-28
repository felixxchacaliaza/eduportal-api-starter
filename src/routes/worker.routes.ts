import { Router } from 'express';
import { WorkerController } from '../controllers/worker.controller.js';

export const workerRoutes = Router();

workerRoutes.get('/', WorkerController.getAll);
workerRoutes.get('/:id', WorkerController.getById);
workerRoutes.post('/', WorkerController.create);
workerRoutes.put('/:id', WorkerController.update);
workerRoutes.patch('/:id/toggle', WorkerController.toggle);
