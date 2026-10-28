import { Request, Response } from 'express';
import { WorkerModel } from '../models/worker.model.js';
import { StudentModel } from '../models/student.model.js';
import { PersonModel } from '../models/person.model.js';
import { PositionModel } from '../models/position.model.js';

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
      let { person, position, shift, hireDate, code, enabled } = req.body;

      if (!person && req.body.dni) {
        let p = await PersonModel.findOne({ dni: String(req.body.dni).trim() });
        if (!p) {
          const personCount = await PersonModel.countDocuments();
          const nextPersonCode = `PER-${String(personCount + 1).padStart(3, '0')}`;
          p = await PersonModel.create({
            code: nextPersonCode,
            dni: String(req.body.dni).trim(),
            firstName: String(req.body.firstName).trim(),
            lastName: String(req.body.lastName).trim(),
            gender: req.body.gender || 'M',
            personalEmail: req.body.personalEmail ? String(req.body.personalEmail).trim() : `${req.body.dni}@eduportal.pe`,
            phone: req.body.phone ? String(req.body.phone).trim() : '',
            address: req.body.address ? String(req.body.address).trim() : '',
            enabled: true
          });
        }
        person = p._id;
      }

      const isStudent = await StudentModel.findOne({ person, enabled: true });
      if (isStudent) {
        res.status(400).json({
          success: false,
          message: 'Incompatibilidad de rol: Una persona registrada como Alumno activo no puede ser Trabajador del colegio'
        });
        return;
      }

      if (!position) {
        const defaultPos = await PositionModel.findOne();
        if (defaultPos) position = defaultPos._id;
      }

      if (!code) {
        const workerCount = await WorkerModel.countDocuments();
        code = `WRK-${String(workerCount + 1).padStart(3, '0')}`;
      }

      const data = await WorkerModel.create({
        code,
        person,
        position,
        shift: shift || 'COMPLETO',
        hireDate: hireDate || new Date(),
        enabled: enabled !== undefined ? enabled : true
      });
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
