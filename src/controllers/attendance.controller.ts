import { Request, Response } from 'express';
import { AttendanceModel } from '../models/attendance.model.js';

export class AttendanceController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { gradeSection, student, academicYear, status } = req.query;
      const filter: any = {};
      if (gradeSection) filter.gradeSection = gradeSection;
      if (student) filter.student = student;
      if (academicYear) filter.academicYear = academicYear;
      if (status) filter.status = status;

      const data = await AttendanceModel.find(filter)
        .populate({ path: 'student', populate: 'person' })
        .populate('registeredBy')
        .sort({ date: -1 });

      res.status(200).json({ success: true, count: data.length, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const data = await AttendanceModel.findById(req.params.id)
        .populate({ path: 'student', populate: 'person' })
        .populate('registeredBy');
      if (!data) {
        res.status(404).json({ success: false, message: 'Asistencia no encontrada' });
        return;
      }
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getBySectionAndDate(req: Request, res: Response): Promise<void> {
    try {
      const { gradeSection, date } = req.query;
      if (!gradeSection || !date) {
        res.status(400).json({ success: false, message: 'gradeSection y date requeridos' });
        return;
      }

      const parsedDate = new Date(String(date));
      const startOfDay = new Date(parsedDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(parsedDate.setHours(23, 59, 59, 999));

      const data = await AttendanceModel.find({
        gradeSection,
        date: { $gte: startOfDay, $lte: endOfDay }
      })
        .populate({ path: 'student', populate: 'person' })
        .populate('registeredBy');

      res.status(200).json({ success: true, count: data.length, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async bulkRegister(req: Request, res: Response): Promise<void> {
    try {
      const { attendances, registeredBy, date, gradeSection, academicYear } = req.body;
      if (!Array.isArray(attendances)) {
        res.status(400).json({ success: false, message: 'Se esperaba un arreglo attendances' });
        return;
      }

      const results: any[] = [];
      const attendanceDate = new Date(date);

      for (let i = 0; i < attendances.length; i++) {
        const item = attendances[i];
        const code = item.code || `ATT-${String(i + 1).padStart(3, '0')}`;
        const query = { student: item.student, date: attendanceDate };
        const update = {
          code,
          gradeSection,
          academicYear,
          status: item.status || 'PRESENTE',
          observation: item.observation || '',
          registeredBy,
          enabled: true
        };
        const record = await AttendanceModel.findOneAndUpdate(query, update, { upsert: true, new: true });
        results.push(record);
      }

      res.status(200).json({
        success: true,
        message: `${results.length} asistencias registradas`,
        data: results
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}
