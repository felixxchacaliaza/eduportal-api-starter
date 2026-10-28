import { Request, Response } from 'express';
import { WorkerModel } from '../models/worker.model.js';
import { StudentModel } from '../models/student.model.js';

export class WorkerController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const data = await WorkerModel.find()
        .populate('person')
        .populate('position')
        .sort({ 'person.lastName': 1 });
      res.status(200).json({ success: true, count: data.length, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const data = await WorkerModel.findById(req.params.id).populate('person').populate('position');
      if (!data) {
        res.status(404).json({ success: false, message: 'Trabajador no encontrado' });
        return;
      }
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { person } = req.body;
      // RN-ACT-01: No puede ser alumno activo
      const isStudent = await StudentModel.findOne({ person, enabled: true });
      if (isStudent) {
        res.status(400).json({
          success: false,
          message: 'Incompatibilidad de rol: Una persona registrada como Alumno activo no puede ser Trabajador del colegio'
        });
        return;
      }

      const data = await WorkerModel.create(req.body);
      const populated = await WorkerModel.findById(data.id).populate('person').populate('position');
      res.status(201).json({ success: true, message: 'Trabajador registrado', data: populated });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const data = await WorkerModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        .populate('person')
        .populate('position');
      if (!data) {
        res.status(404).json({ success: false, message: 'Trabajador no encontrado' });
        return;
      }
      res.status(200).json({ success: true, message: 'Trabajador actualizado', data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async toggle(req: Request, res: Response): Promise<void> {
    try {
      const item = await WorkerModel.findById(req.params.id);
      if (!item) {
        res.status(404).json({ success: false, message: 'Trabajador no encontrado' });
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
