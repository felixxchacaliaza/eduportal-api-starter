import { Request, Response } from 'express';
import { EnrollmentModel } from '../models/enrollment.model.js';
import { GradeSectionModel } from '../models/grade-section.model.js';

export class EnrollmentController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { academicYear, gradeSection } = req.query;
      const filter: any = {};
      if (academicYear) filter.academicYear = academicYear;
      if (gradeSection) filter.gradeSection = gradeSection;

      const data = await EnrollmentModel.find(filter)
        .populate({
          path: 'student',
          populate: { path: 'person' }
        })
        .populate({
          path: 'gradeSection',
          populate: ['grade', 'section', 'classroom', 'tutor']
        });
      res.status(200).json({ success: true, count: data.length, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getBySection(req: Request, res: Response): Promise<void> {
    try {
      const data = await EnrollmentModel.find({ gradeSection: req.params.sectionId, status: 'MATRICULADO' })
        .populate({
          path: 'student',
          populate: { path: 'person' }
        });
      res.status(200).json({ success: true, count: data.length, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { gradeSection, student, academicYear } = req.body;

      // RN-MAT-01 / RN-MAT-02: Control de vacantes
      const section = await GradeSectionModel.findById(gradeSection);
      if (!section) {
        res.status(404).json({ success: false, message: 'Salón no encontrado' });
        return;
      }

      if (section.enrolledStudents >= section.maxCapacity) {
        res.status(400).json({
          success: false,
          message: `Salón sin vacantes: Aforo cubierto (${section.enrolledStudents}/${section.maxCapacity})`
        });
        return;
      }

      // Validar matrícula única por año
      const existing = await EnrollmentModel.findOne({ student, academicYear });
      if (existing) {
        res.status(400).json({
          success: false,
          message: `El estudiante ya tiene una matrícula registrada para el año ${academicYear}`
        });
        return;
      }

      // 1. Generar código correlativo de matrícula MAT-XXX si no se especificó
      let code = req.body.code;
      if (!code) {
        const count = await EnrollmentModel.countDocuments();
        code = `MAT-${String(count + 1).padStart(3, '0')}`;
      }

      // 2. Normalizar status a los valores del enum (MATRICULADO, TRASLADADO, RETIRADO)
      const validStatuses = ['MATRICULADO', 'TRASLADADO', 'RETIRADO'];
      const status = validStatuses.includes(req.body.status) ? req.body.status : 'MATRICULADO';

      // 3. Normalizar enrollmentType (REGULAR, INGRESANTE, TRASLADO)
      const validTypes = ['REGULAR', 'INGRESANTE', 'TRASLADO'];
      const enrollmentType = validTypes.includes(req.body.enrollmentType) ? req.body.enrollmentType : 'REGULAR';

      const enrollment = await EnrollmentModel.create({
        ...req.body,
        code,
        status,
        enrollmentType
      });

      // Incrementar alumnos matriculados en la sección
      section.enrolledStudents += 1;
      await section.save();

      res.status(201).json({ success: true, message: 'Matrícula realizada exitosamente', data: enrollment });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }

  static async updateStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status } = req.body;
      const enrollment = await EnrollmentModel.findById(req.params.id);
      if (!enrollment) {
        res.status(404).json({ success: false, message: 'Matrícula no encontrada' });
        return;
      }

      const prevStatus = enrollment.status;
      enrollment.status = status;
      await enrollment.save();

      // Ajustar contador en salón si cambia de estado
      const section = await GradeSectionModel.findById(enrollment.gradeSection);
      if (section) {
        if (prevStatus === 'MATRICULADO' && (status === 'TRASLADADO' || status === 'RETIRADO')) {
          section.enrolledStudents = Math.max(0, section.enrolledStudents - 1);
          await section.save();
        } else if ((prevStatus === 'TRASLADADO' || prevStatus === 'RETIRADO') && status === 'MATRICULADO') {
          section.enrolledStudents += 1;
          await section.save();
        }
      }

      res.status(200).json({ success: true, message: 'Estado de matrícula actualizado', data: enrollment });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}
