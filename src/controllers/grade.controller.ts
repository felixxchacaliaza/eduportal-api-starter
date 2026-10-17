import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { GradeModel } from '../models/grade.model.js';
import { LevelModel } from '../models/level.model.js';

/**
 * Calcula automáticamente el siguiente código correlativo de grado (prefijo GRA)
 * Ejemplos: si no hay ninguno -> GRA-001; si ya existe GRA-001 -> GRA-002
 */
async function generateNextGradeCode(): Promise<string> {
  const prefix = 'GRA';
  const regex = new RegExp(`^${prefix}-\\d{3}$`);

  const existing = await GradeModel.find({ code: regex }).select('code');

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

export class GradeController {
  /**
   * 1. Listar todos los grados
   * GET /api/grades
   */
  public static async getGrades(_req: Request, res: Response): Promise<void> {
    try {
      const grades = await GradeModel.find()
        .populate('level')
        .sort({ name: 1 });

      res.status(200).json({
        success: true,
        count: grades.length,
        data: grades
      });
    } catch (error) {
      console.error('Error al listar grados:', error);
      res.status(500).json({
        success: false,
        message: 'Error al consultar los grados'
      });
    }
  }

  /**
   * 2. Listar grado por ID
   * GET /api/grades/:id
   */
  public static async getGradeById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({
          success: false,
          message: `El ID "${id}" no es un ObjectId válido de MongoDB`
        });
        return;
      }

      const grade = await GradeModel.findById(id).populate('level');

      if (!grade) {
        res.status(404).json({
          success: false,
          message: `Grado con ID ${id} no encontrado`
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: grade
      });
    } catch (error) {
      console.error('Error al buscar grado:', error);
      res.status(500).json({
        success: false,
        message: 'Error al buscar el grado solicitado'
      });
    }
  }

  /**
   * 3. Crear grado
   * POST /api/grades
   * Body:
   * {
   *   "name": 1,
   *   "description": "1° de Secundaria",
   *   "level": "6ad07171647e731123821c39"
   * }
   */
  public static async createGrade(req: Request, res: Response): Promise<void> {
    try {
      let { code, name, description, level, enabled } = req.body;

      // Validación de Name numérico
      if (name === undefined || name === null || isNaN(Number(name))) {
        res.status(400).json({
          success: false,
          message: 'El número del grado (name: 1, 2, 3...) es obligatorio y debe ser numérico'
        });
        return;
      }

      const numericName = Number(name);
      if (numericName < 1) {
        res.status(400).json({
          success: false,
          message: 'El número del grado debe ser mayor o igual a 1'
        });
        return;
      }

      // Validación de Description (ej: "1° de Secundaria")
      if (!description || !String(description).trim()) {
        res.status(400).json({
          success: false,
          message: 'La descripción del grado (description: "1° de Secundaria") es obligatoria'
        });
        return;
      }

      const cleanDescription = String(description).trim();

      // Validación de Level (ObjectId)
      if (!level) {
        res.status(400).json({
          success: false,
          message: 'El nivel educativo (level) es obligatorio'
        });
        return;
      }

      if (!mongoose.Types.ObjectId.isValid(level)) {
        res.status(400).json({
          success: false,
          message: `El ID del nivel "${level}" no es un ObjectId válido de MongoDB`
        });
        return;
      }

      const levelExists = await LevelModel.findById(level);
      if (!levelExists) {
        res.status(404).json({
          success: false,
          message: `El nivel con ID "${level}" no existe en el sistema`
        });
        return;
      }

      // Autogeneración del código si no se envía
      if (!code || !String(code).trim()) {
        code = await generateNextGradeCode();
      } else {
        code = String(code).toUpperCase().trim();
        const codeRegex = /^[A-Z]{3}-\d{3}$/;
        if (!codeRegex.test(code)) {
          res.status(400).json({
            success: false,
            message: 'El código debe tener exactamente 7 caracteres con formato AAA-000 (ej: GRA-001)'
          });
          return;
        }
      }

      // Validar unicidad del código
      const existingCode = await GradeModel.findOne({ code });
      if (existingCode) {
        res.status(409).json({
          success: false,
          message: `Ya existe un grado con el código "${code}"`
        });
        return;
      }

      // enabled por defecto siempre es true
      const isEnabled = typeof enabled === 'boolean' ? enabled : true;

      const newGrade = new GradeModel({
        code,
        name: numericName,
        description: cleanDescription,
        level,
        enabled: isEnabled
      });

      await newGrade.save();
      await newGrade.populate('level');

      res.status(201).json({
        success: true,
        message: `Grado ${numericName} - ${cleanDescription} (${code}) registrado con éxito`,
        data: newGrade
      });
    } catch (error: any) {
      console.error('Error al registrar grado:', error);
      if (error.code === 11000) {
        res.status(409).json({
          success: false,
          message: 'El código ya se encuentra registrado'
        });
        return;
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Error al registrar el grado'
      });
    }
  }

  /**
   * 4. Editar grado
   * PUT /api/grades/:id
   */
  public static async updateGrade(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { code, name, description, level, enabled } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({
          success: false,
          message: `El ID "${id}" no es un ObjectId válido de MongoDB`
        });
        return;
      }

      const updates: Record<string, any> = {};

      if (name !== undefined) {
        if (isNaN(Number(name)) || Number(name) < 1) {
          res.status(400).json({
            success: false,
            message: 'El número del grado debe ser numérico mayor o igual a 1'
          });
          return;
        }
        updates.name = Number(name);
      }

      if (description && String(description).trim()) {
        updates.description = String(description).trim();
      }

      if (enabled !== undefined) {
        updates.enabled = Boolean(enabled);
      }

      if (level) {
        if (!mongoose.Types.ObjectId.isValid(level)) {
          res.status(400).json({
            success: false,
            message: `El ID del nivel "${level}" no es un ObjectId válido de MongoDB`
          });
          return;
        }

        const levelExists = await LevelModel.findById(level);
        if (!levelExists) {
          res.status(404).json({
            success: false,
            message: `El nivel con ID "${level}" no existe`
          });
          return;
        }
        updates.level = level;
      }

      if (code && String(code).trim()) {
        const cleanCode = String(code).toUpperCase().trim();
        const codeRegex = /^[A-Z]{3}-\d{3}$/;
        if (!codeRegex.test(cleanCode)) {
          res.status(400).json({
            success: false,
            message: 'El código debe tener exactamente 7 caracteres con formato AAA-000 (ej: GRA-001)'
          });
          return;
        }

        const existingCode = await GradeModel.findOne({ code: cleanCode, _id: { $ne: id } });
        if (existingCode) {
          res.status(409).json({
            success: false,
            message: `El código "${cleanCode}" ya está en uso por otro grado`
          });
          return;
        }
        updates.code = cleanCode;
      }

      const updated = await GradeModel.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true
      }).populate('level');

      if (!updated) {
        res.status(404).json({
          success: false,
          message: `Grado con ID ${id} no encontrado`
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Grado actualizado con éxito',
        data: updated
      });
    } catch (error: any) {
      console.error('Error al actualizar grado:', error);
      if (error.code === 11000) {
        res.status(409).json({
          success: false,
          message: 'El código ya se encuentra registrado'
        });
        return;
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Error al actualizar el grado'
      });
    }
  }
}
