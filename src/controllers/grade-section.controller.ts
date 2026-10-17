import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { GradeSectionModel } from '../models/grade-section.model.js';
import { GradeModel } from '../models/grade.model.js';
import { SectionModel } from '../models/section.model.js';
import { ClassroomModel } from '../models/classroom.model.js';
import { RuleModel } from '../models/rule.model.js';
import { getRuleActiveValue } from './rule.controller.js';
import { isYearClosed, getActiveAcademicYear, validateYearAvailability } from './academic-year.controller.js';

/**
 * Calcula automáticamente el siguiente código correlativo de salón (prefijo GSE)
 * Ejemplos: si no hay ninguno -> GSE-001; si ya existe GSE-001 -> GSE-002
 */
async function generateNextGradeSectionCode(): Promise<string> {
  const prefix = 'GSE';
  const regex = new RegExp(`^${prefix}-\\d{3}$`);

  const existing = await GradeSectionModel.find({ code: regex }).select('code');

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

export class GradeSectionController {
  /**
   * 1. Listar todas las asignaciones de salón (grados y secciones)
   * GET /api/grade-sections
   */
  public static async getGradeSections(_req: Request, res: Response): Promise<void> {
    try {
      const gradeSections = await GradeSectionModel.find()
        .populate({
          path: 'grade',
          populate: { path: 'level' }
        })
        .populate('section')
        .populate('classroom')
        .sort({ academicYear: -1, shift: 1, code: 1 });

      res.status(200).json({
        success: true,
        count: gradeSections.length,
        data: gradeSections
      });
    } catch (error) {
      console.error('Error al listar salones (grade-sections):', error);
      res.status(500).json({
        success: false,
        message: 'Error al consultar las asignaciones de grados y secciones'
      });
    }
  }

  /**
   * 2. Listar salón por ID
   * GET /api/grade-sections/:id
   */
  public static async getGradeSectionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({
          success: false,
          message: `El ID "${id}" no es un ObjectId válido de MongoDB`
        });
        return;
      }

      const gradeSection = await GradeSectionModel.findById(id)
        .populate({
          path: 'grade',
          populate: { path: 'level' }
        })
        .populate('section')
        .populate('classroom');

      if (!gradeSection) {
        res.status(404).json({
          success: false,
          message: `Salón con ID ${id} no encontrado`
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: gradeSection
      });
    } catch (error) {
      console.error('Error al buscar salón:', error);
      res.status(500).json({
        success: false,
        message: 'Error al buscar el salón solicitado'
      });
    }
  }

  /**
   * 3. Crear salón (Asignar Grado, Sección y Aula física)
   * POST /api/grade-sections
   * Body:
   * {
   *   "grade": "...",
   *   "section": "...",
   *   "classroom": "...",
   *   "shift": "MAÑANA",
   *   "academicYear": "2026",
   *   "maxCapacity": 30
   * }
   */
  public static async createGradeSection(req: Request, res: Response): Promise<void> {
    try {
      let { code, grade, section, classroom, academicYear, shift, maxCapacity, enrolledStudents, enabled } = req.body;

      // Año lectivo por defecto si no se envía
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

      // 1. Cargar reglas institucionales vigentes para ESE año lectivo
      const [allowedShiftsValue, capacityValue] = await Promise.all([
        getRuleActiveValue('SHIFTS', academicYear),
        getRuleActiveValue('DEFAULT_ENROLLMENT_CAPACITY', academicYear)
      ]);

      // Validar y normalizar turno
      const allowedShifts: string[] = Array.isArray(allowedShiftsValue) ? allowedShiftsValue : ['MAÑANA', 'TARDE'];
      if (!shift || !String(shift).trim()) {
        shift = allowedShifts[0] || 'MAÑANA';
      } else {
        shift = String(shift).trim().toUpperCase();
      }

      if (!allowedShifts.includes(shift)) {
        res.status(400).json({
          success: false,
          message: `El turno "${shift}" no es válido para el año ${academicYear}. Turnos permitidos según rules: ${allowedShifts.join(', ')}`
        });
        return;
      }

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

      // Validación de Section
      if (!section || !mongoose.Types.ObjectId.isValid(section)) {
        res.status(400).json({
          success: false,
          message: 'El campo section es obligatorio y debe ser un ObjectId válido'
        });
        return;
      }
      const sectionDoc = await SectionModel.findById(section);
      if (!sectionDoc) {
        res.status(404).json({
          success: false,
          message: `La sección con ID "${section}" no existe`
        });
        return;
      }

      // Validación de Classroom
      if (!classroom || !mongoose.Types.ObjectId.isValid(classroom)) {
        res.status(400).json({
          success: false,
          message: 'El campo classroom es obligatorio y debe ser un ObjectId válido'
        });
        return;
      }
      const classroomDoc = await ClassroomModel.findById(classroom);
      if (!classroomDoc) {
        res.status(404).json({
          success: false,
          message: `El aula física con ID "${classroom}" no existe`
        });
        return;
      }

      // Capacidad máxima de matrículas
      let finalMaxCapacity = maxCapacity !== undefined ? Number(maxCapacity) : Number(capacityValue || 30);
      if (isNaN(finalMaxCapacity) || finalMaxCapacity < 1) {
        res.status(400).json({
          success: false,
          message: 'La capacidad de matrículas (maxCapacity) debe ser un número entero mayor o igual a 1'
        });
        return;
      }

      // Regla de Negocio: No exceder la capacidad física del aula asignada
      if (finalMaxCapacity > classroomDoc.capacity) {
        res.status(400).json({
          success: false,
          message: `La capacidad de matrículas (${finalMaxCapacity}) no puede superar el aforo físico del aula ${classroomDoc.name} (${classroomDoc.capacity} alumnos)`
        });
        return;
      }

      // Regla de Negocio: Unicidad de Grado + Sección en el mismo Año Lectivo
      const existingGradeSection = await GradeSectionModel.findOne({
        grade,
        section,
        academicYear
      });
      if (existingGradeSection) {
        res.status(409).json({
          success: false,
          message: `Ya existe el salón ${gradeDoc.description} - Sección ${sectionDoc.name} registrado para el año lectivo ${academicYear}`
        });
        return;
      }

      // Regla de Negocio: Disponibilidad de Aula física en el mismo Turno y Año
      const existingClassroomUsage = await GradeSectionModel.findOne({
        classroom,
        shift,
        academicYear
      });
      if (existingClassroomUsage) {
        res.status(409).json({
          success: false,
          message: `El aula física ${classroomDoc.name} ya está asignada a otro salón en el turno ${shift} para el año lectivo ${academicYear}`
        });
        return;
      }

      // Autogeneración de código si no se envía
      if (!code || !String(code).trim()) {
        code = await generateNextGradeSectionCode();
      } else {
        code = String(code).toUpperCase().trim();
        const codeRegex = /^[A-Z]{3}-\d{3}$/;
        if (!codeRegex.test(code)) {
          res.status(400).json({
            success: false,
            message: 'El código debe tener exactamente 7 caracteres con formato AAA-000 (ej: GSE-001)'
          });
          return;
        }
      }

      // Validar unicidad del código
      const existingCode = await GradeSectionModel.findOne({ code });
      if (existingCode) {
        res.status(409).json({
          success: false,
          message: `Ya existe un salón con el código "${code}"`
        });
        return;
      }

      const isEnabled = typeof enabled === 'boolean' ? enabled : true;

      const newGradeSection = new GradeSectionModel({
        code,
        grade,
        section,
        classroom,
        academicYear,
        shift,
        maxCapacity: finalMaxCapacity,
        enrolledStudents: typeof enrolledStudents === 'number' && enrolledStudents >= 0 ? enrolledStudents : 0,
        enabled: isEnabled
      });

      await newGradeSection.save();

      const populatedResult = await GradeSectionModel.findById(newGradeSection._id)
        .populate({
          path: 'grade',
          populate: { path: 'level' }
        })
        .populate('section')
        .populate('classroom');

      res.status(201).json({
        success: true,
        message: `Salón ${gradeDoc.description} - Sección ${sectionDoc.name} (${code}) registrado con éxito`,
        data: populatedResult
      });
    } catch (error: any) {
      console.error('Error al registrar salón:', error);
      if (error.code === 11000) {
        res.status(409).json({
          success: false,
          message: 'Ya existe un registro con los mismos parámetros únicos'
        });
        return;
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Error al registrar el salón'
      });
    }
  }

  /**
   * 4. Editar salón (cambio de aula física, turno o capacidad)
   * PUT /api/grade-sections/:id
   */
  public static async updateGradeSection(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { code, grade, section, classroom, academicYear, shift, maxCapacity, enrolledStudents, enabled } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({
          success: false,
          message: `El ID "${id}" no es un ObjectId válido de MongoDB`
        });
        return;
      }

      const current = await GradeSectionModel.findById(id);
      if (!current) {
        res.status(404).json({
          success: false,
          message: `Salón con ID ${id} no encontrado`
        });
        return;
      }

      // Bloquear edición si el salón pertenece a un año lectivo cerrado
      if (await isYearClosed(current.academicYear)) {
        res.status(403).json({
          success: false,
          message: `El año lectivo "${current.academicYear}" se encuentra CERRADO y no admite modificaciones en sus salones`
        });
        return;
      }

      const targetGradeId = grade || current.grade;
      const targetSectionId = section || current.section;
      const targetClassroomId = classroom || current.classroom;
      const targetYear = academicYear ? String(academicYear).trim() : current.academicYear;
      const targetShift = shift ? String(shift).trim().toUpperCase() : current.shift;

      // Si cambia de año lectivo, validar que el nuevo año exista y no esté cerrado
      if (academicYear && targetYear !== current.academicYear) {
        const yearCheck = await validateYearAvailability(targetYear);
        if (!yearCheck.valid) {
          res.status(yearCheck.status || 400).json({
            success: false,
            message: yearCheck.error
          });
          return;
        }
      }

      // Si cambia grado, sección o año lectivo, validar unicidad compuesta
      if (grade || section || academicYear) {
        const collision = await GradeSectionModel.findOne({
          grade: targetGradeId,
          section: targetSectionId,
          academicYear: targetYear,
          _id: { $ne: id }
        });
        if (collision) {
          res.status(409).json({
            success: false,
            message: `Ya existe esa combinación de Grado y Sección en el año lectivo ${targetYear}`
          });
          return;
        }
      }

      // Si cambia aula física, turno o año, validar que el aula no esté ocupada
      if (classroom || shift || academicYear) {
        const classroomCollision = await GradeSectionModel.findOne({
          classroom: targetClassroomId,
          shift: targetShift,
          academicYear: targetYear,
          _id: { $ne: id }
        });
        if (classroomCollision) {
          res.status(409).json({
            success: false,
            message: `El aula física seleccionada ya está ocupada en el turno ${targetShift} para el año ${targetYear}`
          });
          return;
        }
      }

      // Si se actualiza el aula o maxCapacity, verificar aforo físico
      const classroomDoc = await ClassroomModel.findById(targetClassroomId);
      if (!classroomDoc) {
        res.status(404).json({
          success: false,
          message: `El aula física no existe`
        });
        return;
      }

      const updates: Record<string, any> = {};

      if (maxCapacity !== undefined) {
        const cap = Number(maxCapacity);
        if (isNaN(cap) || cap < 1) {
          res.status(400).json({
            success: false,
            message: 'La capacidad debe ser un número entero mayor o igual a 1'
          });
          return;
        }
        if (cap < (current.enrolledStudents || 0)) {
          res.status(400).json({
            success: false,
            message: `La capacidad de vacantes (${cap}) no puede ser menor a la cantidad de alumnos ya matriculados (${current.enrolledStudents})`
          });
          return;
        }
        if (cap > classroomDoc.capacity) {
          res.status(400).json({
            success: false,
            message: `La capacidad de matrículas (${cap}) no puede superar el aforo del aula ${classroomDoc.name} (${classroomDoc.capacity})`
          });
          return;
        }
        updates.maxCapacity = cap;
      }

      if (grade) updates.grade = grade;
      if (section) updates.section = section;
      if (classroom) updates.classroom = classroom;
      if (academicYear) updates.academicYear = targetYear;
      if (shift) updates.shift = targetShift;
      if (enrolledStudents !== undefined) updates.enrolledStudents = Number(enrolledStudents);
      if (enabled !== undefined) updates.enabled = Boolean(enabled);

      if (code && String(code).trim()) {
        const cleanCode = String(code).toUpperCase().trim();
        const existingCode = await GradeSectionModel.findOne({ code: cleanCode, _id: { $ne: id } });
        if (existingCode) {
          res.status(409).json({
            success: false,
            message: `El código "${cleanCode}" ya está en uso por otro salón`
          });
          return;
        }
        updates.code = cleanCode;
      }

      const updated = await GradeSectionModel.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true
      })
        .populate({
          path: 'grade',
          populate: { path: 'level' }
        })
        .populate('section')
        .populate('classroom');

      res.status(200).json({
        success: true,
        message: 'Salón actualizado con éxito',
        data: updated
      });
    } catch (error: any) {
      console.error('Error al actualizar salón:', error);
      if (error.code === 11000) {
        res.status(409).json({
          success: false,
          message: 'Ya existe un registro con los mismos parámetros únicos'
        });
        return;
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Error al actualizar el salón'
      });
    }
  }
}
