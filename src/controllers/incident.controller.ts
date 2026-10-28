import { Request, Response } from 'express';
import { IncidentModel } from '../models/incident.model.js';

export class IncidentController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { student, academicYear } = req.query;
      const filter: any = {};
      if (student) filter.student = student;
      if (academicYear) filter.academicYear = academicYear;

      const data = await IncidentModel.find(filter)
        .populate({ path: 'student', populate: 'person' })
        .populate('reportedBy')
        .populate({ path: 'gradeSection', populate: ['grade', 'section'] })
        .sort({ incidentDate: -1 });

      res.status(200).json({ success: true, count: data.length, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getByStudent(req: Request, res: Response): Promise<void> {
    try {
      const data = await IncidentModel.find({ student: req.params.studentId })
        .populate('reportedBy')
        .sort({ incidentDate: -1 });
      res.status(200).json({ success: true, count: data.length, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const data = await IncidentModel.create(req.body);
      res.status(201).json({ success: true, message: 'Incidencia registrada', data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status, actionTaken } = req.body;
      const data = await IncidentModel.findByIdAndUpdate(
        req.params.id,
        { status, actionTaken },
        { new: true, runValidators: true }
      );
      if (!data) {
        res.status(404).json({ success: false, message: 'Incidencia no encontrada' });
        return;
      }
      res.status(200).json({ success: true, message: 'Incidencia actualizada', data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}
