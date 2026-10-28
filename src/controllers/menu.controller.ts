import { Request, Response } from 'express';
import { MenuModel } from '../models/menu.model.js';

export class MenuController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const data = await MenuModel.find().sort({ order: 1 });
      res.status(200).json({ success: true, count: data.length, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getTree(req: Request, res: Response): Promise<void> {
    try {
      const all = await MenuModel.find({ enabled: true }).sort({ order: 1 });
      const roots = all.filter(m => !m.parent);
      const tree = roots.map(root => ({
        id: root.id,
        code: root.code,
        key: root.key,
        label: root.label,
        icon: root.icon,
        path: root.path,
        order: root.order,
        children: all.filter(m => m.parent?.toString() === root.id)
      }));
      res.status(200).json({ success: true, data: tree });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const data = await MenuModel.findById(req.params.id);
      if (!data) {
        res.status(404).json({ success: false, message: 'Menú no encontrado' });
        return;
      }
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const data = await MenuModel.create(req.body);
      res.status(201).json({ success: true, message: 'Menú creado', data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
    try {
      const data = await MenuModel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
      if (!data) {
        res.status(404).json({ success: false, message: 'Menú no encontrado' });
        return;
      }
      res.status(200).json({ success: true, message: 'Menú actualizado', data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async toggle(req: Request, res: Response): Promise<void> {
    try {
      const item = await MenuModel.findById(req.params.id);
      if (!item) {
        res.status(404).json({ success: false, message: 'Menú no encontrado' });
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
