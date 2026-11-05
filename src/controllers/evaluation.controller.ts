import { Request, Response } from 'express';
import { EvaluationModel } from '../models/evaluation.model.js';
import { RuleModel } from '../models/rule.model.js';
import { EnrollmentModel } from '../models/enrollment.model.js';
import { TeacherAssignmentModel } from '../models/teacher-assignment.model.js';
import { GradeSectionModel } from '../models/grade-section.model.js';

export class EvaluationController {
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const { gradeSection, subject, student, academicYear } = req.query;
      const filter: any = {};
      if (gradeSection) filter.gradeSection = gradeSection;
      if (subject) filter.subject = subject;
      if (student) filter.student = student;
      if (academicYear) filter.academicYear = academicYear;

      const data = await EvaluationModel.find(filter)
        .populate({
          path: 'student',
          populate: 'person'
        })
        .populate('subject')
        .populate({ path: 'teacher', populate: 'person' });

      res.status(200).json({ success: true, count: data.length, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const data = await EvaluationModel.findById(req.params.id)
        .populate({
          path: 'student',
          populate: 'person'
        })
        .populate('subject')
        .populate({ path: 'teacher', populate: 'person' });
      if (!data) {
        res.status(404).json({ success: false, message: 'Evaluación no encontrada' });
        return;
      }
      res.status(200).json({ success: true, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async getMatrix(req: Request, res: Response): Promise<void> {
    try {
      const { gradeSection, subject, academicYear } = req.query;
      const filter: any = {};
      if (gradeSection) filter.gradeSection = gradeSection;
      if (subject) filter.subject = subject;
      if (academicYear) filter.academicYear = academicYear;

      // 1. Obtener todas las matrículas activas del salón
      if (gradeSection) {
        const enrollments = await EnrollmentModel.find({
          gradeSection,
          status: 'MATRICULADO',
          ...(academicYear ? { academicYear } : {})
        }).populate({
          path: 'student',
          populate: 'person'
        });

        // 2. Obtener la regla de periodos para inicializar periodos en blanco
        const rulePeriods = await RuleModel.findOne({ code: 'RUL-004' });
        const periodsConfig = rulePeriods?.value?.periods || [
          { period: 1 }, { period: 2 }, { period: 3 }, { period: 4 }
        ];

        // 3. Obtener docente asignado (o tutor del salón)
        let teacherId: any = null;
        if (subject) {
          const assignment = await TeacherAssignmentModel.findOne({ gradeSection, subject });
          if (assignment?.teacher) teacherId = assignment.teacher;
        }
        if (!teacherId) {
          const gs = await GradeSectionModel.findById(gradeSection);
          if (gs?.tutor) teacherId = gs.tutor;
        }

        // 4. Asegurar que cada alumno matriculado tenga su acta de evaluación
        for (const enr of enrollments) {
          if (!enr.student) continue;
          const studentId = (enr.student as any)._id || enr.student;
          const existing = await EvaluationModel.findOne({
            gradeSection,
            subject: subject || null,
            student: studentId,
            ...(academicYear ? { academicYear } : {})
          });

          if (!existing && subject) {
            const count = await EvaluationModel.countDocuments();
            const code = 'EVA-' + String(count + 1).padStart(3, '0');
            await EvaluationModel.create({
              code,
              academicYear: academicYear || enr.academicYear || '2026',
              enrollment: enr._id,
              student: studentId,
              gradeSection,
              subject,
              teacher: teacherId,
              periods: periodsConfig.map((p: any) => ({ period: p.period, score: null })),
              finalAverage: null,
              status: 'EN_CURSO',
              enabled: true
            });
          }
        }
      }

      const data = await EvaluationModel.find(filter)
        .populate({
          path: 'student',
          populate: 'person'
        })
        .populate('subject')
        .populate('teacher')
        .sort({ 'student.person.lastName': 1 });

      res.status(200).json({ success: true, count: data.length, data });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async bulkUpdate(req: Request, res: Response): Promise<void> {
    try {
      const { evaluations } = req.body;
      if (!Array.isArray(evaluations)) {
        res.status(400).json({ success: false, message: 'Se esperaba un arreglo de evaluaciones' });
        return;
      }

      // Consultar regla RUL-004 de periodos para verificar candados isOpen
      const rulePeriods = await RuleModel.findOne({ code: 'RUL-004' });
      const periodsConfig = rulePeriods?.value?.periods || [];

      const updatedResults: any[] = [];

      for (const item of evaluations) {
        const evalDoc = await EvaluationModel.findById(item.id);
        if (!evalDoc) continue;

        if (Array.isArray(item.periods)) {
          for (const p of item.periods) {
            // Verificar si el periodo está abierto
            const configP = periodsConfig.find((cfg: any) => cfg.period === p.period);
            if (configP && configP.isOpen === false) {
              // Periodo cerrado: no se permite mutar a menos que mantenga la nota original
              continue;
            }

            const target = evalDoc.periods.find(ep => ep.period === p.period);
            if (target) {
              target.score = p.score !== undefined ? p.score : target.score;
            } else {
              evalDoc.periods.push({ period: p.period, score: p.score });
            }
          }
        }

        // Recalcular promedio vigesimal si hay notas
        const scores = evalDoc.periods.map(p => p.score).filter(s => s !== null && s !== undefined) as number[];
        if (scores.length > 0) {
          const sum = scores.reduce((a, b) => a + b, 0);
          evalDoc.finalAverage = Math.round(sum / evalDoc.periods.length);
          evalDoc.status = evalDoc.finalAverage >= 11 ? 'APROBADO' : 'DESAPROBADO';
        }

        if (item.observation !== undefined) {
          evalDoc.observation = item.observation;
        }

        await evalDoc.save();
        updatedResults.push(evalDoc);
      }

      res.status(200).json({
        success: true,
        message: `${updatedResults.length} evaluaciones actualizadas`,
        data: updatedResults
      });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message });
    }
  }
}
