import { Request, Response } from 'express';
import { StudentModel } from '../models/student.model.js';
import { WorkerModel } from '../models/worker.model.js';
import { TeacherModel } from '../models/teacher.model.js';

export class StudentController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { search, enabled } = req.query;
      const data = await StudentModel.find()
        .populate('person')
        .populate('guardians.person')
        .sort({ 'person.lastName': 1 });

      let filtered = data;
      if (enabled !== undefined) {
        const isEnabled = enabled === 'true';
        filtered = filtered.filter((s: any) => s.enabled === isEnabled);
      }
      if (search) {
        const term = String(search).toLowerCase().trim();
        filtered = filtered.filter((s: any) => {
          const p = s.person as any;
          return (
            s.code.toLowerCase().includes(term) ||
            p?.dni?.includes(term) ||
            p?.firstName?.toLowerCase().includes(term) ||
            p?.lastName?.toLowerCase().includes(term)
          );
        });
      }

      res.status(200).json({ success: true, count: filtered.length, data: filtered });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const data = await StudentModel.findById(req.params.id)
        .populate('person')
        .populate('guardians.person');
      if (!data) {
        res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
        return;
      }
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { person, guardians } = req.body;

      // RN-ACT-01: No puede ser personal ni docente
      const isWorker = await WorkerModel.findOne({ person, enabled: true });
      const isTeacher = await TeacherModel.findOne({ person, enabled: true });
      if (isWorker || isTeacher) {
        res.status(400).json({
          success: false,
          message: 'Incompatibilidad de rol: Una persona registrada como Personal del colegio no puede registrarse como Alumno'
        });
        return;
      }

      // RN-ACT-02: Validar apoderados
      if (Array.isArray(guardians)) {
        for (const g of guardians) {
          if (String(g.person) === String(person)) {
            res.status(400).json({
              success: false,
              message: 'Regla de negocio: El alumno no puede ser su propio apoderado'
            });
            return;
          }
        }
      }

      const data = await StudentModel.create(req.body);
      const populated = await StudentModel.findById(data.id).populate('person').populate('guardians.person');
      res.status(201).json({ success: true, message: 'Estudiante registrado', data: populated });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { person, guardians } = req.body;
      if (Array.isArray(guardians) && person) {
        for (const g of guardians) {
          if (String(g.person) === String(person)) {
            res.status(400).json({
              success: false,
              message: 'Regla de negocio: El alumno no puede ser su propio apoderado'
            });
            return;
          }
        }
      }

      const data = await StudentModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        .populate('person')
        .populate('guardians.person');
      if (!data) {
        res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
        return;
      }
      res.status(200).json({ success: true, message: 'Estudiante actualizado', data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async toggle(req: Request, res: Response): Promise<void> {
    try {
      const item = await StudentModel.findById(req.params.id);
      if (!item) {
        res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
        return;
      }
      item.enabled = !item.enabled;
      await item.save();
      res.status(200).json({ success: true, message: 'Estado actualizado', data: item });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
