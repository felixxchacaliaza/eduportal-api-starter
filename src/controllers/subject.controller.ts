import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { SubjectModel } from '../models/subject.model.js';
import { AreaModel } from '../models/area.model.js';

/**
 * Normaliza las 3 primeras letras del nombre (elimina tildes y caracteres especiales)
 * Ejemplos: "Matemática" -> "MAT", "Comunicación" -> "COM", "Humanidades" -> "HUM"
 */
function extractPrefix(name: string): string {
  const normalized = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quita tildes
    .replace(/[^a-zA-Z]/g, '')       // Solo letras
    .toUpperCase();

  return normalized.substring(0, 3).padEnd(3, 'X');
}

/**
 * Calcula automáticamente el siguiente código correlativo de 3 dígitos
 * Si no existe ninguno -> MAT-001; si ya existe MAT-001 -> MAT-002
 */
async function generateNextCode(name: string): Promise<string> {
  const prefix = extractPrefix(name);
  const regex = new RegExp(`^${prefix}-\\d{3}$`);

  const existing = await SubjectModel.find({ code: regex }).select('code');

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

export class SubjectController {
  /**
   * 1. Listar todas las asignaturas
   * GET /api/subjects
   */
  public static async getSubjects(_req: Request, res: Response): Promise<void> {
    try {
      const subjects = await SubjectModel.find()
        .populate('area')
        .sort({ code: 1 });

      res.status(200).json({
        success: true,
        count: subjects.length,
        data: subjects
      });
    } catch (error) {
      console.error('Error al listar asignaturas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al consultar las asignaturas'
      });
    }
  }

  /**
   * 2. Listar asignatura por ID
   * GET /api/subjects/:id
   */
  public static async getSubjectById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({
          success: false,
          message: `El ID "${id}" no es un ObjectId válido de MongoDB`
        });
        return;
      }

      const subject = await SubjectModel.findById(id).populate('area');

      if (!subject) {
        res.status(404).json({
          success: false,
          message: `Asignatura con ID ${id} no encontrada`
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: subject
      });
    } catch (error) {
      console.error('Error al buscar asignatura:', error);
      res.status(500).json({
        success: false,
        message: 'Error al buscar la asignatura solicitada'
      });
    }
  }

  /**
   * 3. Crear asignatura
   * POST /api/subjects
   * Body:
   * {
   *   "name": "Matemática",
   *   "description": "Curso general",
   *   "area": "6ad063e8e607cd81d4bf3280",
   *   "weeklyHours": 5,
   *   "enabled": true
   * }
   * Nota: "code" se autogenera si no se envía.
   */
  public static async createSubject(req: Request, res: Response): Promise<void> {
    try {
      let { code, name, description, area, areaId, category, categoryId, weeklyHours, enabled } = req.body;

      // Validación de Nombre
      if (!name || !String(name).trim()) {
        res.status(400).json({
          success: false,
          message: 'El nombre de la asignatura es obligatorio'
        });
        return;
      }

      const cleanName = String(name).trim();

      // Validación de Área Curricular (acepta area, areaId, o compatibilidad con category/categoryId)
      const targetArea = area || areaId || category || categoryId;
      if (!targetArea) {
        res.status(400).json({
          success: false,
          message: 'El área curricular (area) es obligatoria'
        });
        return;
      }

      if (!mongoose.Types.ObjectId.isValid(targetArea)) {
        res.status(400).json({
          success: false,
          message: `El ID de área "${targetArea}" no es un ObjectId válido de MongoDB`
        });
        return;
      }

      const areaExists = await AreaModel.findById(targetArea);
      if (!areaExists) {
        res.status(404).json({
          success: false,
          message: `El área curricular con ID "${targetArea}" no existe en el sistema`
        });
        return;
      }

      // Validación de weeklyHours
      if (weeklyHours === undefined || weeklyHours === null || isNaN(Number(weeklyHours))) {
        res.status(400).json({
          success: false,
          message: 'Las horas semanales (weeklyHours) deben ser un número válido'
        });
        return;
      }

      const parsedWeeklyHours = Number(weeklyHours);
      if (parsedWeeklyHours < 1) {
        res.status(400).json({
          success: false,
          message: 'Las horas semanales (weeklyHours) deben ser al menos 1'
        });
        return;
      }

      // Autogeneración del código si no se envía
      if (!code || !String(code).trim()) {
        code = await generateNextCode(cleanName);
      } else {
        code = String(code).toUpperCase().trim();
      }

      // Validar formato estricto: 3 letras en mayúscula + guión + 3 dígitos numéricos
      const codeRegex = /^[A-Z]{3}-\d{3}$/;
      if (!codeRegex.test(code)) {
        res.status(400).json({
          success: false,
          message: `El código "${code}" es inválido. Debe tener 3 letras en mayúscula, un guión y 3 dígitos (ej: MAT-001, HUM-001)`
        });
        return;
      }

      // Validar unicidad del código
      const existing = await SubjectModel.findOne({ code });
      if (existing) {
        res.status(409).json({
          success: false,
          message: `El código "${code}" ya está registrado en la base de datos`
        });
        return;
      }

      // enabled por defecto siempre es true
      const isEnabled = typeof enabled === 'boolean' ? enabled : true;

      const newSubject = new SubjectModel({
        code,
        name: cleanName,
        description: description ? String(description).trim() : '',
        area: targetArea,
        weeklyHours: parsedWeeklyHours,
        enabled: isEnabled
      });

      await newSubject.save();

      // Devolver con los datos del área asociada
      await newSubject.populate('area');

      res.status(201).json({
        success: true,
        message: `Asignatura "${cleanName}" (${code}) registrada con éxito`,
        data: newSubject
      });
    } catch (error: any) {
      console.error('Error al registrar asignatura:', error);
      if (error.code === 11000) {
        res.status(409).json({
          success: false,
          message: 'El código de la asignatura ya está registrado'
        });
        return;
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Error al registrar la asignatura'
      });
    }
  }

  /**
   * 4. Editar asignatura
   * PUT /api/subjects/:id
   */
  public static async updateSubject(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { code, name, description, area, areaId, category, categoryId, weeklyHours, enabled } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({
          success: false,
          message: `El ID "${id}" no es un ObjectId válido de MongoDB`
        });
        return;
      }

      const updates: Record<string, any> = {};

      if (name && String(name).trim()) {
        updates.name = String(name).trim();
      }

      if (description !== undefined) {
        updates.description = String(description).trim();
      }

      if (enabled !== undefined) {
        updates.enabled = Boolean(enabled);
      }

      if (weeklyHours !== undefined) {
        if (isNaN(Number(weeklyHours)) || Number(weeklyHours) < 1) {
          res.status(400).json({
            success: false,
            message: 'Las horas semanales (weeklyHours) deben ser un número mayor o igual a 1'
          });
          return;
        }
        updates.weeklyHours = Number(weeklyHours);
      }

      const targetArea = area || areaId || category || categoryId;
      if (targetArea) {
        if (!mongoose.Types.ObjectId.isValid(targetArea)) {
          res.status(400).json({
            success: false,
            message: `El ID de área "${targetArea}" no es un ObjectId válido de MongoDB`
          });
          return;
        }

        const areaExists = await AreaModel.findById(targetArea);
        if (!areaExists) {
          res.status(404).json({
            success: false,
            message: `El área curricular con ID "${targetArea}" no existe`
          });
          return;
        }
        updates.area = targetArea;
      }

      if (code && String(code).trim()) {
        const cleanCode = String(code).toUpperCase().trim();
        const codeRegex = /^[A-Z]{3}-\d{3}$/;
        if (!codeRegex.test(cleanCode)) {
          res.status(400).json({
            success: false,
            message: `El código "${cleanCode}" es inválido. Debe tener 3 letras en mayúscula, un guión y 3 dígitos (ej: MAT-001, HUM-001)`
          });
          return;
        }

        const existing = await SubjectModel.findOne({ code: cleanCode, _id: { $ne: id } });
        if (existing) {
          res.status(409).json({
            success: false,
            message: `El código "${cleanCode}" ya está en uso por otra asignatura`
          });
          return;
        }
        updates.code = cleanCode;
      }

      const updated = await SubjectModel.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true
      }).populate('area');

      if (!updated) {
        res.status(404).json({
          success: false,
          message: `Asignatura con ID ${id} no encontrada`
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Asignatura actualizada con éxito',
        data: updated
      });
    } catch (error: any) {
      console.error('Error al actualizar asignatura:', error);
      if (error.code === 11000) {
        res.status(409).json({
          success: false,
          message: 'El código ya está en uso'
        });
        return;
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Error al actualizar la asignatura'
      });
    }
  }
}
