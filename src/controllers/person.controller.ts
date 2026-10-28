import { Request, Response } from 'express';
import { PersonModel } from '../models/person.model.js';

export class PersonController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { search, enabled } = req.query;
      const filter: any = {};
      if (enabled !== undefined) filter.enabled = enabled === 'true';
      if (search) {
        filter.$or = [
          { dni: new RegExp(String(search).trim(), 'i') },
          { firstName: new RegExp(String(search).trim(), 'i') },
          { lastName: new RegExp(String(search).trim(), 'i') },
          { personalEmail: new RegExp(String(search).trim(), 'i') }
        ];
      }
      const data = await PersonModel.find(filter).sort({ lastName: 1, firstName: 1 });
      res.status(200).json({ success: true, count: data.length, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const data = await PersonModel.findById(req.params.id);
      if (!data) {
        res.status(404).json({ success: false, message: 'Persona no encontrada' });
        return;
      }
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async checkDni(req: Request, res: Response): Promise<void> {
    try {
      const { dni } = req.params;
      const person = await PersonModel.findOne({ dni });
      res.status(200).json({
        success: true,
        exists: !!person,
        data: person || null
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const data = await PersonModel.create(req.body);
      res.status(201).json({ success: true, message: 'Persona creada exitosamente', data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const data = await PersonModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!data) {
        res.status(404).json({ success: false, message: 'Persona no encontrada' });
        return;
      }
      res.status(200).json({ success: true, message: 'Persona actualizada', data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async toggle(req: Request, res: Response): Promise<void> {
    try {
      const person = await PersonModel.findById(req.params.id);
      if (!person) {
        res.status(404).json({ success: false, message: 'Persona no encontrada' });
        return;
      }
      person.enabled = !person.enabled;
      await person.save();
      res.status(200).json({ success: true, message: 'Estado actualizado', data: person });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
