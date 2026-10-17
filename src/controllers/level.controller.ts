import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { LevelModel } from '../models/level.model.js';

/**
 * Normaliza las 3 primeras letras del nombre del nivel educativo (elimina tildes y caracteres especiales)
 * Ejemplos: "Inicial" -> "INI", "Primaria" -> "PRI", "Secundaria" -> "SEC"
 * Si tiene menos de 3 letras, rellena con "LEV"
 */
function extractLevelPrefix(name: string): string {
  const normalized = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quita tildes
    .replace(/[^a-zA-Z]/g, '')       // Solo letras
    .toUpperCase();

  const sliced = normalized.substring(0, 3);
  if (sliced.length < 3) {
    return (sliced + 'LEV').substring(0, 3);
  }
  return sliced;
}

/**
 * Calcula automáticamente el siguiente código correlativo de 3 dígitos
 * Si no existe ninguno -> INI-001; si ya existe INI-001 -> INI-002
 */
async function generateNextLevelCode(name: string): Promise<string> {
  const prefix = extractLevelPrefix(name);
  const regex = new RegExp(`^${prefix}-\\d{3}$`);

  const existing = await LevelModel.find({ code: regex }).select('code');

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

export class LevelController {
  /**
   * 1. Listar todos los niveles
   * GET /api/levels
   */
  public static async getLevels(_req: Request, res: Response): Promise<void> {
    try {
      const levels = await LevelModel.find().sort({ code: 1 });

      res.status(200).json({
        success: true,
        count: levels.length,
        data: levels
      });
    } catch (error) {
      console.error('Error al listar niveles:', error);
      res.status(500).json({
        success: false,
        message: 'Error al consultar los niveles'
      });
    }
  }

  /**
   * 2. Listar nivel por ID
   * GET /api/levels/:id
   */
  public static async getLevelById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({
          success: false,
          message: `El ID "${id}" no es un ObjectId válido de MongoDB`
        });
        return;
      }

      const level = await LevelModel.findById(id);

      if (!level) {
        res.status(404).json({
          success: false,
          message: `Nivel con ID ${id} no encontrado`
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: level
      });
    } catch (error) {
      console.error('Error al buscar nivel:', error);
      res.status(500).json({
        success: false,
        message: 'Error al buscar el nivel solicitado'
      });
    }
  }

  /**
   * 3. Crear nivel
   * POST /api/levels
   * Body:
   * {
   *   "name": "Secundaria",
   *   "description": "Nivel de Educación Secundaria"
   * }
   * Nota: "code" se autogenera si no se envía (SEC-001).
   * "enabled" se crea por defecto en true.
   */
  public static async createLevel(req: Request, res: Response): Promise<void> {
    try {
      let { code, name, description, enabled } = req.body;

      // Validación de Nombre
      if (!name || !String(name).trim()) {
        res.status(400).json({
          success: false,
          message: 'El nombre del nivel es obligatorio'
        });
        return;
      }

      const cleanName = String(name).toUpperCase().trim();

      // Validación de longitud del nombre (1 a 100 caracteres)
      if (cleanName.length < 1 || cleanName.length > 100) {
        res.status(400).json({
          success: false,
          message: 'El nombre del nivel debe tener entre 1 y 100 caracteres'
        });
        return;
      }

      // Autogeneración del código si no se envía
      if (!code || !String(code).trim()) {
        code = await generateNextLevelCode(cleanName);
      } else {
        code = String(code).toUpperCase().trim();
        const codeRegex = /^[A-Z]{3}-\d{3}$/;
        if (!codeRegex.test(code)) {
          res.status(400).json({
            success: false,
            message: 'El código debe tener exactamente 7 caracteres con formato AAA-000 (ej: INI-001, PRI-001, SEC-001)'
          });
          return;
        }
      }

      // Validar unicidad del código
      const existingCode = await LevelModel.findOne({ code });
      if (existingCode) {
        res.status(409).json({
          success: false,
          message: `Ya existe un nivel con el código "${code}"`
        });
        return;
      }

      // Validar unicidad del nombre
      const existingName = await LevelModel.findOne({ name: cleanName });
      if (existingName) {
        res.status(409).json({
          success: false,
          message: `Ya existe un nivel con el nombre "${cleanName}"`
        });
        return;
      }

      // enabled por defecto siempre es true
      const isEnabled = typeof enabled === 'boolean' ? enabled : true;

      const newLevel = new LevelModel({
        code,
        name: cleanName,
        description: description ? String(description).trim() : '',
        enabled: isEnabled
      });

      await newLevel.save();

      res.status(201).json({
        success: true,
        message: `Nivel "${cleanName}" (${code}) registrado con éxito`,
        data: newLevel
      });
    } catch (error: any) {
      console.error('Error al registrar nivel:', error);
      if (error.code === 11000) {
        res.status(409).json({
          success: false,
          message: 'El código o el nombre ya se encuentran registrados'
        });
        return;
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Error al registrar el nivel'
      });
    }
  }

  /**
   * 4. Editar nivel
   * PUT /api/levels/:id
   */
  public static async updateLevel(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { code, name, description, enabled } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({
          success: false,
          message: `El ID "${id}" no es un ObjectId válido de MongoDB`
        });
        return;
      }

      const updates: Record<string, any> = {};

      if (name && String(name).trim()) {
        const cleanName = String(name).toUpperCase().trim();
        if (cleanName.length < 1 || cleanName.length > 100) {
          res.status(400).json({
            success: false,
            message: 'El nombre del nivel debe tener entre 1 y 100 caracteres'
          });
          return;
        }

        const existingName = await LevelModel.findOne({ name: cleanName, _id: { $ne: id } });
        if (existingName) {
          res.status(409).json({
            success: false,
            message: `El nombre "${cleanName}" ya está en uso por otro nivel`
          });
          return;
        }
        updates.name = cleanName;
      }

      if (description !== undefined) {
        updates.description = String(description).trim();
      }

      if (enabled !== undefined) {
        updates.enabled = Boolean(enabled);
      }

      if (code && String(code).trim()) {
        const cleanCode = String(code).toUpperCase().trim();
        const codeRegex = /^[A-Z]{3}-\d{3}$/;
        if (!codeRegex.test(cleanCode)) {
          res.status(400).json({
            success: false,
            message: 'El código debe tener exactamente 7 caracteres con formato AAA-000 (ej: INI-001, PRI-001, SEC-001)'
          });
          return;
        }

        const existingCode = await LevelModel.findOne({ code: cleanCode, _id: { $ne: id } });
        if (existingCode) {
          res.status(409).json({
            success: false,
            message: `El código "${cleanCode}" ya está en uso por otro nivel`
          });
          return;
        }
        updates.code = cleanCode;
      }

      const updated = await LevelModel.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true
      });

      if (!updated) {
        res.status(404).json({
          success: false,
          message: `Nivel con ID ${id} no encontrado`
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Nivel actualizado con éxito',
        data: updated
      });
    } catch (error: any) {
      console.error('Error al actualizar nivel:', error);
      if (error.code === 11000) {
        res.status(409).json({
          success: false,
          message: 'El código o el nombre ya se encuentran registrados'
        });
        return;
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Error al actualizar el nivel'
      });
    }
  }
}
