import { Request, Response } from 'express';
import { TeacherAssignmentModel } from '../models/teacher-assignment.model.js';
import { TeacherModel } from '../models/teacher.model.js';

export class TeacherAssignmentController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { academicYear, teacher, gradeSection } = req.query;
      const filter: any = {};
      if (academicYear) filter.academicYear = academicYear;
      if (teacher) filter.teacher = teacher;
      if (gradeSection) filter.gradeSection = gradeSection;

      const data = await TeacherAssignmentModel.find(filter)
        .populate({
          path: 'teacher',
          populate: ['person', 'area']
        })
        .populate({
          path: 'gradeSection',
          populate: ['grade', 'section', 'classroom']
        })
        .populate('subject');
      res.status(200).json({ success: true, count: data.length, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { teacher, weeklyHours, academicYear } = req.body;

      // RN-DOC-02: Control de horas contratadas
      const teacherDoc = await TeacherModel.findById(teacher);
      if (!teacherDoc) {
        res.status(404).json({ success: false, message: 'Docente no encontrado' });
        return;
      }

      const currentAssignments = await TeacherAssignmentModel.find({ teacher, academicYear, enabled: true });
      const currentHours = currentAssignments.reduce((sum, a) => sum + (a.weeklyHours || 0), 0);
      const newTotal = currentHours + Number(weeklyHours || 0);

      if (newTotal > teacherDoc.contractedHours) {
        res.status(400).json({
          success: false,
          message: `Tope de horas excedido: El docente tiene contratadas ${teacherDoc.contractedHours}h, tiene asignadas ${currentHours}h e intenta agregar ${weeklyHours}h (Total: ${newTotal}h)`
        });
        return;
      }

      const data = await TeacherAssignmentModel.create(req.body);

      // Actualizar horas asignadas en Teacher
      teacherDoc.assignedHours = newTotal;
      await teacherDoc.save();

      res.status(201).json({ success: true, message: 'Asignación creada', data });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const data = await TeacherAssignmentModel.findByIdAndDelete(req.params.id);
      if (!data) {
        res.status(404).json({ success: false, message: 'Asignación no encontrada' });
        return;
      }

      // Restar horas del docente
      const teacherDoc = await TeacherModel.findById(data.teacher);
      if (teacherDoc) {
        teacherDoc.assignedHours = Math.max(0, teacherDoc.assignedHours - data.weeklyHours);
        await teacherDoc.save();
      }

      res.status(200).json({ success: true, message: 'Asignación eliminada' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}
