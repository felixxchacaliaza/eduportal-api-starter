import { Request, Response } from 'express';
import { ProfileModel } from '../models/profile.model.js';

export class ProfileController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const data = await ProfileModel.find().populate('permissions.menu').sort({ name: 1 });
      res.status(200).json({ success: true, count: data.length, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const data = await ProfileModel.findById(req.params.id).populate('permissions.menu');
      if (!data) {
        res.status(404).json({ success: false, message: 'Perfil no encontrado' });
        return;
      }
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const data = await ProfileModel.create(req.body);
      res.status(201).json({ success: true, message: 'Perfil creado', data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const profile = await ProfileModel.findById(req.params.id);
      if (!profile) {
        res.status(404).json({ success: false, message: 'Perfil no encontrado' });
        return;
      }

      // RN-SEG-02: Super Usuario indestructible
      if (profile.isSuperAdmin && req.body.isSuperAdmin === false) {
        res.status(403).json({ success: false, message: 'No se puede degradar al Super Usuario' });
        return;
      }

      const updated = await ProfileModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        .populate('permissions.menu');
      res.status(200).json({ success: true, message: 'Perfil actualizado', data: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async toggle(req: Request, res: Response): Promise<void> {
    try {
      const item = await ProfileModel.findById(req.params.id);
      if (!item) {
        res.status(404).json({ success: false, message: 'Perfil no encontrado' });
        return;
      }

      // RN-SEG-02: Super Usuario no desactivable
      if (item.isSuperAdmin || item.isSystem) {
        res.status(403).json({ success: false, message: 'Los perfiles del sistema y Super Usuario no pueden ser desactivados' });
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
