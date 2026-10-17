import { Request, Response } from 'express';
import { AreaModel } from '../models/area.model.js';

/**
 * Normaliza las 3 primeras letras del nombre del área (elimina tildes y caracteres especiales)
 * Ejemplos: "Ciencias" -> "CIE", "Tecnología" -> "TEC", "Artes" -> "ART"
 */
function extractAreaPrefix(name: string): string {
  const normalized = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quita tildes
    .replace(/[^a-zA-Z]/g, '')       // Solo letras
    .toUpperCase();

  return normalized.substring(0, 3).padEnd(3, 'X');
}

/**
 * Calcula automáticamente el siguiente código correlativo de 3 dígitos
 * Si no existe ningún código con el prefijo -> 001 (ej: ROB-001)
 * Si ya existe 001 -> toma 002 (ej: CIE-002)
 */
async function generateNextAreaCode(name: string): Promise<string> {
  const prefix = extractAreaPrefix(name);
  const regex = new RegExp(`^${prefix}-\\d{3}$`);

  const existing = await AreaModel.find({ code: regex }).select('code');

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

export class AreaController {
  /**
   * 1. Listar todas las áreas curriculares
   * GET /api/areas
   */
  public static async getAreas(_req: Request, res: Response): Promise<void> {
    try {
      const areas = await AreaModel.find().sort({ code: 1 });

      res.status(200).json({
        success: true,
        count: areas.length,
        data: areas
      });
    } catch (error) {
      console.error('Error al listar áreas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al consultar las áreas curriculares'
      });
    }
  }

  /**
   * 2. Obtener área curricular por ID o por CODE (ej: /api/areas/CIE-001)
   * GET /api/areas/:id
   */
  public static async getAreaById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const area = /^[A-Z]{3}-\d{3}$/i.test(id)
        ? await AreaModel.findOne({ code: id.toUpperCase() })
        : await AreaModel.findById(id);

      if (!area) {
        res.status(404).json({
          success: false,
          message: `Área curricular con identificador "${id}" no encontrada`
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: area
      });
    } catch (error) {
      console.error('Error al obtener área curricular:', error);
      res.status(500).json({
        success: false,
        message: 'Error al consultar el área curricular'
      });
    }
  }

  /**
   * 3. Crear área curricular
   * POST /api/areas
   */
  public static async createArea(req: Request, res: Response): Promise<void> {
    try {
      let { code, name, description, enabled } = req.body;

      if (!name || typeof name !== 'string' || name.trim().length < 3) {
        res.status(400).json({
          success: false,
          message: 'El nombre del área es obligatorio y debe tener al menos 3 caracteres'
        });
        return;
      }

      name = name.trim().toUpperCase();

      const existingName = await AreaModel.findOne({ name });
      if (existingName) {
        res.status(409).json({
          success: false,
          message: `Ya existe un área curricular con el nombre "${name}" (código: ${existingName.code})`
        });
        return;
      }

      if (code && typeof code === 'string' && code.trim().length > 0) {
        code = code.trim().toUpperCase();
        const codeRegex = /^[A-Z]{3}-\d{3}$/;
        if (!codeRegex.test(code)) {
          res.status(400).json({
            success: false,
            message: 'El código debe tener exactamente 7 caracteres en formato AAA-000 (ej: CIE-001, ROB-001)'
          });
          return;
        }

        const existingCode = await AreaModel.findOne({ code });
        if (existingCode) {
          res.status(409).json({
            success: false,
            message: `El código "${code}" ya está registrado por otra área curricular`
          });
          return;
        }
      } else {
        code = await generateNextAreaCode(name);
      }

      const newArea = await AreaModel.create({
        code,
        name,
        description: description ? String(description).trim() : '',
        enabled: enabled !== undefined ? Boolean(enabled) : true
      });

      res.status(201).json({
        success: true,
        message: 'Área curricular creada exitosamente',
        data: newArea
      });
    } catch (error: any) {
      console.error('Error al crear área curricular:', error);

      if (error.code === 11000) {
        const duplicateField = Object.keys(error.keyPattern || {})[0] || 'campo';
        res.status(409).json({
          success: false,
          message: `El ${duplicateField} ya se encuentra registrado`
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Error al registrar el área curricular'
      });
    }
  }

  /**
   * 4. Editar área curricular
   * PUT /api/areas/:id
   */
  public static async updateArea(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { code, name, description, enabled } = req.body;

      const current = /^[A-Z]{3}-\d{3}$/i.test(id)
        ? await AreaModel.findOne({ code: id.toUpperCase() })
        : await AreaModel.findById(id);

      if (!current) {
        res.status(404).json({
          success: false,
          message: `Área curricular con identificador "${id}" no encontrada`
        });
        return;
      }

      const updates: Record<string, any> = {};

      if (name !== undefined) {
        if (typeof name !== 'string' || name.trim().length < 3) {
          res.status(400).json({
            success: false,
            message: 'El nombre debe tener al menos 3 caracteres'
          });
          return;
        }

        const normalizedName = name.trim().toUpperCase();
        if (normalizedName !== current.name) {
          const nameCollision = await AreaModel.findOne({
            name: normalizedName,
            _id: { $ne: current._id }
          });

          if (nameCollision) {
            res.status(409).json({
              success: false,
              message: `El nombre "${normalizedName}" ya está registrado por otra área curricular`
            });
            return;
          }
        }
        updates.name = normalizedName;
      }

      if (code !== undefined) {
        if (typeof code !== 'string' || !/^[A-Z]{3}-\d{3}$/.test(code.trim().toUpperCase())) {
          res.status(400).json({
            success: false,
            message: 'El código debe tener exactamente 7 caracteres en formato AAA-000 (ej: CIE-001, ROB-001)'
          });
          return;
        }

        const normalizedCode = code.trim().toUpperCase();
        if (normalizedCode !== current.code) {
          const codeCollision = await AreaModel.findOne({
            code: normalizedCode,
            _id: { $ne: current._id }
          });

          if (codeCollision) {
            res.status(409).json({
              success: false,
              message: `El código "${normalizedCode}" ya está registrado por otra área curricular`
            });
            return;
          }
        }
        updates.code = normalizedCode;
      }

      if (description !== undefined) {
        updates.description = String(description).trim();
      }

      if (enabled !== undefined) {
        updates.enabled = Boolean(enabled);
      }

      const updatedArea = await AreaModel.findByIdAndUpdate(
        current._id,
        { $set: updates },
        { new: true, runValidators: true }
      );

      res.status(200).json({
        success: true,
        message: 'Área curricular actualizada exitosamente',
        data: updatedArea
      });
    } catch (error: any) {
      console.error('Error al actualizar área curricular:', error);

      if (error.code === 11000) {
        const duplicateField = Object.keys(error.keyPattern || {})[0] || 'campo';
        res.status(409).json({
          success: false,
          message: `El ${duplicateField} ya se encuentra registrado`
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: 'Error al actualizar el área curricular'
      });
    }
  }
}
