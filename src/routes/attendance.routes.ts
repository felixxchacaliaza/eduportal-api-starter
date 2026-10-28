import { Router } from 'express';
import { AttendanceController } from '../controllers/attendance.controller.js';

export const attendanceRoutes = Router();

attendanceRoutes.get('/', AttendanceController.getAll);
attendanceRoutes.get('/by-section-date', AttendanceController.getBySectionAndDate);
attendanceRoutes.get('/:id', AttendanceController.getById);
attendanceRoutes.post('/bulk-register', AttendanceController.bulkRegister);
