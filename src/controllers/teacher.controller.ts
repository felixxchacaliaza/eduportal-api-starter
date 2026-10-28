import { Request, Response } from 'express';
import { TeacherModel } from '../models/teacher.model.js';
import { StudentModel } from '../models/student.model.js';

export class TeacherController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const data = await TeacherModel.find()
        .populate('person')
        .populate('area')
        .sort({ 'person.lastName': 1 });
      res.status(200).json({ success: true, count: data.length, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const data = await TeacherModel.findById(req.params.id).populate('person').populate('area');
      if (!data) {
        res.status(404).json({ success: false, message: 'Docente no encontrado' });
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
      const isStudent = await StudentModel.findOne({ person, enabled: true });
      if (isStudent) {
        res.status(400).json({
          success: false,
          message: 'Incompatibilidad de rol: Una persona registrada como Alumno activo no puede ser Docente del colegio'
        });
        return;
      }

      const data = await TeacherModel.create(req.body);
      const populated = await TeacherModel.findById(data.id).populate('person').populate('area');
      res.status(201).json({ success: true, message: 'Docente registrado', data: populated });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const data = await TeacherModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        .populate('person')
        .populate('area');
      if (!data) {
        res.status(404).json({ success: false, message: 'Docente no encontrado' });
        return;
      }
      res.status(200).json({ success: true, message: 'Docente actualizado', data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async toggle(req: Request, res: Response): Promise<void> {
    try {
      const item = await TeacherModel.findById(req.params.id);
      if (!item) {
        res.status(404).json({ success: false, message: 'Docente no encontrado' });
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
