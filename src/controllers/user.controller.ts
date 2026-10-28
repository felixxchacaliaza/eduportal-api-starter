import { Request, Response } from 'express';
import { UserModel } from '../models/user.model.js';

export class UserController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const data = await UserModel.find()
        .populate('person')
        .populate('profile')
        .sort({ 'person.lastName': 1 });
      res.status(200).json({ success: true, count: data.length, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const data = await UserModel.findById(req.params.id).populate('person').populate('profile');
      if (!data) {
        res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        return;
      }
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const data = await UserModel.create(req.body);
      const populated = await UserModel.findById(data.id).populate('person').populate('profile');
      res.status(201).json({ success: true, message: 'Usuario creado', data: populated });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const user = await UserModel.findById(req.params.id);
      if (!user) {
        res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        return;
      }

      // RN-SEG-02: Super Usuario indestructible
      if (user.isProtected && req.body.enabled === false) {
        res.status(403).json({ success: false, message: 'La cuenta raíz Super Usuario no puede ser desactivada' });
        return;
      }

      const updated = await UserModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        .populate('person')
        .populate('profile');
      res.status(200).json({ success: true, message: 'Usuario actualizado', data: updated });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async toggle(req: Request, res: Response): Promise<void> {
    try {
      const item = await UserModel.findById(req.params.id);
      if (!item) {
        res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        return;
      }

      // RN-SEG-02: Super Usuario protegido
      if (item.isProtected) {
        res.status(403).json({ success: false, message: 'La cuenta raíz Super Usuario no puede ser desactivada' });
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
