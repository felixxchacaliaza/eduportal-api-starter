import { Request, Response } from 'express';
import { TeacherModel } from '../models/teacher.model.js';
import { StudentModel } from '../models/student.model.js';
import { PersonModel } from '../models/person.model.js';
import { AreaModel } from '../models/area.model.js';

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
      let { person, area, academicDegree, contractedHours, code, enabled } = req.body;

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
          message: 'Incompatibilidad de rol: Una persona registrada como Alumno activo no puede ser Docente del colegio'
        });
        return;
      }

      if (!area) {
        const defaultArea = await AreaModel.findOne();
        if (defaultArea) area = defaultArea._id;
      }

      if (!code) {
        const teacherCount = await TeacherModel.countDocuments();
        code = `TEA-${String(teacherCount + 1).padStart(3, '0')}`;
      }

      const data = await TeacherModel.create({
        code,
        person,
        area,
        academicDegree: academicDegree || 'LICENCIADO',
        contractedHours: contractedHours ? Number(contractedHours) : 30,
        enabled: enabled !== undefined ? enabled : true
      });
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
