import { Request, Response } from 'express';
import { TuitionPaymentModel } from '../models/tuition-payment.model.js';

export class TuitionPaymentController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { academicYear, status, concept } = req.query;
      const filter: any = {};
      if (academicYear) filter.academicYear = academicYear;
      if (status) filter.status = status;
      if (concept) filter.concept = concept;

      const data = await TuitionPaymentModel.find(filter)
        .populate({
          path: 'student',
          populate: { path: 'person' }
        })
        .sort({ dueDate: 1 });
      res.status(200).json({ success: true, count: data.length, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const data = await TuitionPaymentModel.findById(req.params.id)
        .populate({
          path: 'student',
          populate: { path: 'person' }
        });
      if (!data) {
        res.status(404).json({ success: false, message: 'Pago no encontrado' });
        return;
      }
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getByStudent(req: Request, res: Response): Promise<void> {
    try {
      const { academicYear } = req.query;
      const filter: any = { student: req.params.studentId };
      if (academicYear) filter.academicYear = academicYear;

      const data = await TuitionPaymentModel.find(filter).sort({ dueDate: 1 });
      res.status(200).json({ success: true, count: data.length, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async pay(req: Request, res: Response): Promise<void> {
    try {
      const { paymentMethod, paidDate } = req.body;
      const payment = await TuitionPaymentModel.findById(req.params.id);
      if (!payment) {
        res.status(404).json({ success: false, message: 'Pago no encontrado' });
        return;
      }

      payment.status = 'PAGADO';
      payment.paidDate = paidDate ? new Date(paidDate) : new Date();
      payment.paymentMethod = paymentMethod || 'TRANSFERENCIA';
      await payment.save();

      res.status(200).json({ success: true, message: 'Pago registrado exitosamente', data: payment });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async getKpis(req: Request, res: Response): Promise<void> {
    try {
      const { academicYear } = req.query;
      const filter: any = {};
      if (academicYear) filter.academicYear = academicYear;

      const all = await TuitionPaymentModel.find(filter);
      const totalAmount = all.reduce((sum, p) => sum + (p.amount || 0), 0);
      const paidPayments = all.filter(p => p.status === 'PAGADO');
      const paidAmount = paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const pendingPayments = all.filter(p => p.status === 'PENDIENTE');
      const pendingAmount = pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      const overduePayments = all.filter(p => p.status === 'VENCIDO');

      res.status(200).json({
        success: true,
        data: {
          totalCount: all.length,
          totalAmount,
          paidCount: paidPayments.length,
          paidAmount,
          pendingCount: pendingPayments.length,
          pendingAmount,
          overdueCount: overduePayments.length
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
