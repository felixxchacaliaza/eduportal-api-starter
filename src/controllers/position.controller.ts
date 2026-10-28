import { Request, Response } from 'express';
import { PositionModel } from '../models/position.model.js';

export class PositionController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const data = await PositionModel.find().sort({ name: 1 });
      res.status(200).json({ success: true, count: data.length, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const data = await PositionModel.findById(req.params.id);
      if (!data) {
        res.status(404).json({ success: false, message: 'Cargo no encontrado' });
        return;
      }
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const data = await PositionModel.create(req.body);
      res.status(201).json({ success: true, message: 'Cargo creado', data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const data = await PositionModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!data) {
        res.status(404).json({ success: false, message: 'Cargo no encontrado' });
        return;
      }
      res.status(200).json({ success: true, message: 'Cargo actualizado', data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async toggle(req: Request, res: Response): Promise<void> {
    try {
      const item = await PositionModel.findById(req.params.id);
      if (!item) {
        res.status(404).json({ success: false, message: 'Cargo no encontrado' });
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
