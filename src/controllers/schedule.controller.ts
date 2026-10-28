import { Request, Response } from 'express';
import { ScheduleModel } from '../models/schedule.model.js';

export class ScheduleController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { academicYear, gradeSection, teacher } = req.query;
      const filter: any = {};
      if (academicYear) filter.academicYear = academicYear;
      if (gradeSection) filter.gradeSection = gradeSection;
      if (teacher) filter.teacher = teacher;

      const data = await ScheduleModel.find(filter)
        .populate('subject')
        .populate({ path: 'teacher', populate: 'person' })
        .populate({ path: 'gradeSection', populate: ['grade', 'section', 'classroom'] })
        .sort({ dayOfWeek: 1, startTime: 1 });
      res.status(200).json({ success: true, count: data.length, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const data = await ScheduleModel.findById(req.params.id)
        .populate('subject')
        .populate({ path: 'teacher', populate: 'person' })
        .populate({ path: 'gradeSection', populate: ['grade', 'section', 'classroom'] });
      if (!data) {
        res.status(404).json({ success: false, message: 'Horario no encontrado' });
        return;
      }
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getBySection(req: Request, res: Response): Promise<void> {
    try {
      const data = await ScheduleModel.find({ gradeSection: req.params.sectionId, enabled: true })
        .populate('subject')
        .populate({ path: 'teacher', populate: 'person' })
        .sort({ dayOfWeek: 1, startTime: 1 });
      res.status(200).json({ success: true, count: data.length, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getByTeacher(req: Request, res: Response): Promise<void> {
    try {
      const data = await ScheduleModel.find({ teacher: req.params.teacherId, enabled: true })
        .populate('subject')
        .populate({ path: 'gradeSection', populate: ['grade', 'section', 'classroom'] })
        .sort({ dayOfWeek: 1, startTime: 1 });
      res.status(200).json({ success: true, count: data.length, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { teacher, gradeSection, dayOfWeek, startTime, endTime, academicYear } = req.body;

      // RN-DOC-03: Prevenir cruces de horario
      // 1. Docente en dos salones al mismo tiempo
      const teacherConflict = await ScheduleModel.findOne({
        teacher,
        dayOfWeek,
        academicYear,
        enabled: true,
        $or: [
          { startTime: { $lt: endTime, $gte: startTime } },
          { endTime: { $gt: startTime, $lte: endTime } }
        ]
      });
      if (teacherConflict) {
        res.status(400).json({
          success: false,
          message: 'Cruce de horario: El docente ya tiene una clase asignada en ese bloque horario'
        });
        return;
      }

      // 2. Salón con dos materias al mismo tiempo
      const sectionConflict = await ScheduleModel.findOne({
        gradeSection,
        dayOfWeek,
        academicYear,
        enabled: true,
        $or: [
          { startTime: { $lt: endTime, $gte: startTime } },
          { endTime: { $gt: startTime, $lte: endTime } }
        ]
      });
      if (sectionConflict) {
        res.status(400).json({
          success: false,
          message: 'Cruce de horario: El salón ya tiene una materia asignada en ese bloque horario'
        });
        return;
      }

      const data = await ScheduleModel.create(req.body);
      res.status(201).json({ success: true, message: 'Horario creado', data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const data = await ScheduleModel.findByIdAndDelete(req.params.id);
      if (!data) {
        res.status(404).json({ success: false, message: 'Horario no encontrado' });
        return;
      }
      res.status(200).json({ success: true, message: 'Horario eliminado' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
