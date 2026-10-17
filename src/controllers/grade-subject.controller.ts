import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { GradeSubjectModel } from '../models/grade-subject.model.js';
import { GradeModel } from '../models/grade.model.js';
import { SubjectModel } from '../models/subject.model.js';
import { RuleModel } from '../models/rule.model.js';
import { getRuleActiveValue } from './rule.controller.js';
import { isYearClosed, getActiveAcademicYear, validateYearAvailability } from './academic-year.controller.js';

/**
 * Calcula automáticamente el siguiente código correlativo de asignación curricular (prefijo GSB)
 * Ejemplos: si no hay ninguno -> GSB-001; si ya existe GSB-001 -> GSB-002
 */
async function generateNextGradeSubjectCode(): Promise<string> {
  const prefix = 'GSB';
  const regex = new RegExp(`^${prefix}-\\d{3}$`);

  const existing = await GradeSubjectModel.find({ code: regex }).select('code');

  let maxNumber = 0;
  for (const item of existing) {
    const parts = item.code.split('-');
    const currentNum = parseInt(parts[1], 10);
    if (!isNaN(currentNum) && currentNum > maxNumber) {
      maxNumber = currentNum;
    }
  }

  const nextNumberPadded = String(maxNumber + 1).padStart(3, '0');
  return `${prefix}-${nextNumberPadded}`;
}

export class GradeSubjectController {
  /**
   * 1. Listar la malla curricular de asignaturas por grado
   * GET /api/grade-subjects?grade=...&academicYear=2026
   */
  public static async getGradeSubjects(req: Request, res: Response): Promise<void> {
    try {
      const { grade, academicYear, enabled } = req.query;
      const filter: Record<string, any> = {};

      if (grade && mongoose.Types.ObjectId.isValid(String(grade))) {
        filter.grade = grade;
      }

      if (academicYear) {
        filter.academicYear = String(academicYear).trim();
      }

      if (enabled !== undefined) {
        filter.enabled = enabled === 'true';
      }

      const gradeSubjects = await GradeSubjectModel.find(filter)
        .populate({
          path: 'grade',
          populate: { path: 'level' }
        })
        .populate({
          path: 'subject',
          populate: { path: 'area' }
        })
        .sort({ academicYear: -1, code: 1 });

      res.status(200).json({
        success: true,
        count: gradeSubjects.length,
        data: gradeSubjects
      });
    } catch (error) {
      console.error('Error al listar asignaturas por grado (grade_subjects):', error);
      res.status(500).json({
        success: false,
        message: 'Error al consultar la malla curricular por grado'
      });
    }
  }

  /**
   * 2. Obtener asignación curricular por ID
   * GET /api/grade-subjects/:id
   */
  public static async getGradeSubjectById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({
          success: false,
          message: `El ID "${id}" no es un ObjectId válido de MongoDB`
        });
        return;
      }

      const gradeSubject = await GradeSubjectModel.findById(id)
        .populate({
          path: 'grade',
          populate: { path: 'level' }
        })
        .populate({
          path: 'subject',
          populate: { path: 'area' }
        });

      if (!gradeSubject) {
        res.status(404).json({
          success: false,
          message: `Asignación curricular con ID ${id} no encontrada`
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: gradeSubject
      });
    } catch (error) {
      console.error('Error al buscar asignación curricular:', error);
      res.status(500).json({
        success: false,
        message: 'Error al buscar la asignación curricular solicitada'
      });
    }
  }

  /**
   * 3. Asignar una materia a un grado escolar
   * POST /api/grade-subjects
   * Body:
   * {
   *   "grade": "...",
   *   "subject": "...",
   *   "academicYear": "2026",
   *   "weeklyHours": 5
   * }
   */
  public static async createGradeSubject(req: Request, res: Response): Promise<void> {
    try {
      let { code, grade, subject, academicYear, weeklyHours, enabled } = req.body;

      // Año lectivo por defecto
      if (!academicYear || !String(academicYear).trim()) {
        const activeYear = await getActiveAcademicYear();
        academicYear = activeYear ? String(activeYear) : '2026';
      } else {
        academicYear = String(academicYear).trim();
      }

      if (!/^\d{4}$/.test(academicYear)) {
        res.status(400).json({
          success: false,
          message: 'El año lectivo debe ser un año de 4 dígitos (ej: 2026)'
        });
        return;
      }

      // Validar existencia y disponibilidad del año lectivo en academic_years
      const yearCheck = await validateYearAvailability(academicYear);
      if (!yearCheck.valid) {
        res.status(yearCheck.status || 400).json({
          success: false,
          message: yearCheck.error
        });
        return;
      }

      // Obtener límite de horas MINEDU para este año lectivo
      const maxAllowedVal = await getRuleActiveValue('MAX_WEEKLY_HOURS', academicYear);
      const maxAllowedHours = maxAllowedVal ? Number(maxAllowedVal) : 40;

      // Validación de Grade
      if (!grade || !mongoose.Types.ObjectId.isValid(grade)) {
        res.status(400).json({
          success: false,
          message: 'El campo grade es obligatorio y debe ser un ObjectId válido'
        });
        return;
      }
      const gradeDoc = await GradeModel.findById(grade);
      if (!gradeDoc) {
        res.status(404).json({
          success: false,
          message: `El grado con ID "${grade}" no existe`
        });
        return;
      }

      // Validación de Subject
      if (!subject || !mongoose.Types.ObjectId.isValid(subject)) {
        res.status(400).json({
          success: false,
          message: 'El campo subject es obligatorio y debe ser un ObjectId válido'
        });
        return;
      }
      const subjectDoc = await SubjectModel.findById(subject);
      if (!subjectDoc) {
        res.status(404).json({
          success: false,
          message: `La asignatura con ID "${subject}" no existe`
        });
        return;
      }

      // Horas semanales: si no se envía, hereda por defecto de la asignatura
      let finalWeeklyHours: number;
      if (weeklyHours !== undefined && weeklyHours !== null) {
        finalWeeklyHours = Number(weeklyHours);
        if (isNaN(finalWeeklyHours) || finalWeeklyHours < 1) {
          res.status(400).json({
            success: false,
            message: 'Las horas semanales deben ser un número entero mayor o igual a 1'
          });
          return;
        }
      } else {
        finalWeeklyHours = subjectDoc.weeklyHours || 3;
      }

      // Regla de Negocio 1: Unicidad de Curso por Grado y Año Lectivo
      const existingAssignment = await GradeSubjectModel.findOne({
        grade,
        subject,
        academicYear
      });
      if (existingAssignment) {
        res.status(409).json({
          success: false,
          message: `La asignatura "${subjectDoc.name}" ya está asignada a ${gradeDoc.description} para el año lectivo ${academicYear}`
        });
        return;
      }

      // Regla de Negocio 2: Control de Horas Semanales Máximas según MINEDU (Regla MAX_WEEKLY_HOURS = 40)
      const existingActiveAssignments = await GradeSubjectModel.find({
        grade,
        academicYear,
        enabled: true
      });
      const currentAccumulatedHours = existingActiveAssignments.reduce((acc, curr) => acc + curr.weeklyHours, 0);

      if (currentAccumulatedHours + finalWeeklyHours > maxAllowedHours) {
        res.status(400).json({
          success: false,
          message: `La carga horaria excede el límite máximo de ${maxAllowedHours} horas semanales normadas por el MINEDU para ${gradeDoc.description}. Horas acumuladas actuales: ${currentAccumulatedHours}h, intentando agregar: ${finalWeeklyHours}h (Total resultante: ${currentAccumulatedHours + finalWeeklyHours}h).`
        });
        return;
      }

      // Autogeneración de código si no se envía
      if (!code || !String(code).trim()) {
        code = await generateNextGradeSubjectCode();
      } else {
        code = String(code).toUpperCase().trim();
        const codeRegex = /^[A-Z]{3}-\d{3}$/;
        if (!codeRegex.test(code)) {
          res.status(400).json({
            success: false,
            message: 'El código debe tener exactamente 7 caracteres con formato AAA-000 (ej: GSB-001)'
          });
          return;
        }
      }

      // Validar unicidad del código
      const existingCode = await GradeSubjectModel.findOne({ code });
      if (existingCode) {
        res.status(409).json({
          success: false,
          message: `Ya existe una asignación curricular con el código "${code}"`
        });
        return;
      }

      const isEnabled = typeof enabled === 'boolean' ? enabled : true;

      const newGradeSubject = new GradeSubjectModel({
        code,
        grade,
        subject,
        academicYear,
        weeklyHours: finalWeeklyHours,
        enabled: isEnabled
      });

      await newGradeSubject.save();

      const populatedResult = await GradeSubjectModel.findById(newGradeSubject._id)
        .populate({
          path: 'grade',
          populate: { path: 'level' }
        })
        .populate({
          path: 'subject',
          populate: { path: 'area' }
        });

      res.status(201).json({
        success: true,
        message: `Asignatura ${subjectDoc.name} (${finalWeeklyHours}h) asignada con éxito a ${gradeDoc.description} (${code})`,
        data: populatedResult,
        curriculumSummary: {
          academicYear,
          gradeName: gradeDoc.description,
          previousHours: currentAccumulatedHours,
          addedHours: finalWeeklyHours,
          totalHours: currentAccumulatedHours + finalWeeklyHours,
          maxAllowedHours
        }
      });
    } catch (error: any) {
      console.error('Error al registrar asignatura en grado:', error);
      if (error.code === 11000) {
        res.status(409).json({
          success: false,
          message: 'La asignatura ya se encuentra asignada a este grado en el mismo año lectivo'
        });
        return;
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Error al asignar la materia al grado'
      });
    }
  }

  /**
   * 4. Editar asignación curricular (modificar horas semanales o estado)
   * PUT /api/grade-subjects/:id
   */
  public static async updateGradeSubject(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { code, weeklyHours, enabled } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({
          success: false,
          message: `El ID "${id}" no es un ObjectId válido de MongoDB`
        });
        return;
      }

      const current = await GradeSubjectModel.findById(id);
      if (!current) {
        res.status(404).json({
          success: false,
          message: `Asignación curricular con ID ${id} no encontrada`
        });
        return;
      }

      // Bloquear edición si pertenece a un año lectivo cerrado
      if (await isYearClosed(current.academicYear)) {
        res.status(403).json({
          success: false,
          message: `El año lectivo "${current.academicYear}" se encuentra CERRADO y no admite modificaciones en su malla curricular`
        });
        return;
      }

      const updates: Record<string, any> = {};

      if (weeklyHours !== undefined) {
        const numHours = Number(weeklyHours);
        if (isNaN(numHours) || numHours < 1) {
          res.status(400).json({
            success: false,
            message: 'Las horas semanales deben ser un número entero mayor o igual a 1'
          });
          return;
        }

        // Validar contra la regla MAX_WEEKLY_HOURS para el año del registro
        const maxAllowedVal = await getRuleActiveValue('MAX_WEEKLY_HOURS', current.academicYear);
        const maxAllowedHours = maxAllowedVal ? Number(maxAllowedVal) : 40;

        const otherAssignments = await GradeSubjectModel.find({
          grade: current.grade,
          academicYear: current.academicYear,
          enabled: true,
          _id: { $ne: id }
        });
        const otherHours = otherAssignments.reduce((acc, curr) => acc + curr.weeklyHours, 0);

        if (otherHours + numHours > maxAllowedHours) {
          res.status(400).json({
            success: false,
            message: `Actualizar a ${numHours}h superaría el límite de ${maxAllowedHours}h semanales normadas por el MINEDU (las otras materias suman ${otherHours}h, total resultante: ${otherHours + numHours}h)`
          });
          return;
        }

        updates.weeklyHours = numHours;
      }

      if (enabled !== undefined) {
        updates.enabled = Boolean(enabled);
      }

      if (code && String(code).trim()) {
        const cleanCode = String(code).toUpperCase().trim();
        const existingCode = await GradeSubjectModel.findOne({ code: cleanCode, _id: { $ne: id } });
        if (existingCode) {
          res.status(409).json({
            success: false,
            message: `El código "${cleanCode}" ya está en uso por otra asignación`
          });
          return;
        }
        updates.code = cleanCode;
      }

      const updated = await GradeSubjectModel.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true
      })
        .populate({
          path: 'grade',
          populate: { path: 'level' }
        })
        .populate({
          path: 'subject',
          populate: { path: 'area' }
        });

      res.status(200).json({
        success: true,
        message: 'Asignación curricular actualizada con éxito',
        data: updated
      });
    } catch (error: any) {
      console.error('Error al actualizar asignación curricular:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al actualizar la asignación curricular'
      });
    }
  }
}
