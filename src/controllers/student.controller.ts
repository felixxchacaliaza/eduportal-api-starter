import { Request, Response } from 'express';
import { StudentModel } from '../models/student.model.js';
import { PersonModel } from '../models/person.model.js';
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
      let { person, guardians, code, entryYear, enabled } = req.body;

      // 1. Resolver o crear la Persona del Alumno si se enviaron datos civiles directos (DNI, nombres, etc.)
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
            personalEmail: String(req.body.personalEmail).trim(),
            phone: req.body.phone ? String(req.body.phone).trim() : '',
            address: req.body.address ? String(req.body.address).trim() : '',
            enabled: true
          });
        }
        person = p._id;
      }

      if (!person) {
        res.status(400).json({
          success: false,
          message: 'La persona vinculada o los datos civiles del estudiante son obligatorios'
        });
        return;
      }

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

      // 2. Resolver o crear la Persona para cada Apoderado y validar que no sea el mismo alumno
      const resolvedGuardians: any[] = [];
      if (Array.isArray(guardians)) {
        for (const g of guardians) {
          let guardianPersonId = g.person;
          if (!guardianPersonId && g.dni) {
            let gp = await PersonModel.findOne({ dni: String(g.dni).trim() });
            if (!gp) {
              const personCount = await PersonModel.countDocuments();
              const nextPersonCode = `PER-${String(personCount + 1).padStart(3, '0')}`;
              gp = await PersonModel.create({
                code: nextPersonCode,
                dni: String(g.dni).trim(),
                firstName: String(g.firstName).trim(),
                lastName: String(g.lastName).trim(),
                gender: g.gender || 'M',
                personalEmail: g.email ? String(g.email).trim() : `${g.dni}@eduportal.pe`,
                phone: g.phone ? String(g.phone).trim() : '',
                enabled: true
              });
            }
            guardianPersonId = gp._id;
          }

          // RN-ACT-02: Validar apoderados con comprobación segura de IDs válidos
          if (guardianPersonId && person && String(guardianPersonId) === String(person)) {
            res.status(400).json({
              success: false,
              message: 'Regla de negocio: El alumno no puede ser su propio apoderado'
            });
            return;
          }

          if (guardianPersonId) {
            resolvedGuardians.push({
              person: guardianPersonId,
              relationship: g.relationship || 'PADRE',
              isPrimary: Boolean(g.isPrimary)
            });
          }
        }
      }

      // 3. Generar código correlativo STU-XXX si no se especificó
      if (!code) {
        const studentCount = await StudentModel.countDocuments();
        code = `STU-${String(studentCount + 1).padStart(3, '0')}`;
      }

      const data = await StudentModel.create({
        code,
        person,
        guardians: resolvedGuardians,
        entryYear: entryYear || '2026',
        enabled: enabled !== undefined ? enabled : true
      });

      const populated = await StudentModel.findById(data.id)
        .populate('person')
        .populate('guardians.person');

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
          if (g.person && person && String(g.person) === String(person)) {
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
