import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { SectionModel } from '../models/section.model.js';

/**
 * Calcula automáticamente el siguiente código correlativo de sección (prefijo SEC)
 * Ejemplos: si no hay ninguno -> SEC-001; si ya existe SEC-001 -> SEC-002
 */
async function generateNextSectionCode(): Promise<string> {
  const prefix = 'SEC';
  const regex = new RegExp(`^${prefix}-\\d{3}$`);

  const existing = await SectionModel.find({ code: regex }).select('code');

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

export class SectionController {
  /**
   * 1. Listar todas las secciones
   * GET /api/sections
   */
  public static async getSections(_req: Request, res: Response): Promise<void> {
    try {
      const sections = await SectionModel.find().sort({ name: 1 });

      res.status(200).json({
        success: true,
        count: sections.length,
        data: sections
      });
    } catch (error) {
      console.error('Error al listar secciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error al consultar las secciones'
      });
    }
  }

  /**
   * 2. Listar sección por ID
   * GET /api/sections/:id
   */
  public static async getSectionById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({
          success: false,
          message: `El ID "${id}" no es un ObjectId válido de MongoDB`
        });
        return;
      }

      const section = await SectionModel.findById(id);

      if (!section) {
        res.status(404).json({
          success: false,
          message: `Sección con ID ${id} no encontrada`
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: section
      });
    } catch (error) {
      console.error('Error al buscar sección:', error);
      res.status(500).json({
        success: false,
        message: 'Error al buscar la sección solicitada'
      });
    }
  }

  /**
   * 3. Crear sección
   * POST /api/sections
   * Body:
   * {
   *   "name": "A",
   *   "description": "Sección A"
   * }
   */
  public static async createSection(req: Request, res: Response): Promise<void> {
    try {
      let { code, name, description, enabled } = req.body;

      // Validación de Name (1 a 3 letras del alfabeto)
      if (!name || typeof name !== 'string' || !name.trim()) {
        res.status(400).json({
          success: false,
          message: 'El nombre de la sección es obligatorio (ej: A, B, AA, AB, ABC)'
        });
        return;
      }

      const cleanName = name.trim().toUpperCase();
      const nameRegex = /^[A-Z]{1,3}$/;
      if (!nameRegex.test(cleanName)) {
        res.status(400).json({
          success: false,
          message: 'El nombre de la sección debe contener exclusivamente de 1 a 3 letras mayúsculas del alfabeto (ej: A, B, Z, AA, AB, ABC)'
        });
        return;
      }

      // Validar unicidad del nombre
      const existingName = await SectionModel.findOne({ name: cleanName });
      if (existingName) {
        res.status(409).json({
          success: false,
          message: `Ya existe una sección con el nombre "${cleanName}"`
        });
        return;
      }

      // Autogeneración del código si no se envía
      if (!code || !String(code).trim()) {
        code = await generateNextSectionCode();
      } else {
        code = String(code).toUpperCase().trim();
        const codeRegex = /^[A-Z]{3}-\d{3}$/;
        if (!codeRegex.test(code)) {
          res.status(400).json({
            success: false,
            message: 'El código debe tener exactamente 7 caracteres con formato AAA-000 (ej: SEC-001)'
          });
          return;
        }
      }

      // Validar unicidad del código
      const existingCode = await SectionModel.findOne({ code });
      if (existingCode) {
        res.status(409).json({
          success: false,
          message: `Ya existe una sección con el código "${code}"`
        });
        return;
      }

      // enabled por defecto siempre es true
      const isEnabled = typeof enabled === 'boolean' ? enabled : true;

      // Descripción limpia
      const cleanDescription = description && String(description).trim()
        ? String(description).trim()
        : `Sección ${cleanName}`;

      const newSection = new SectionModel({
        code,
        name: cleanName,
        description: cleanDescription,
        enabled: isEnabled
      });

      await newSection.save();

      res.status(201).json({
        success: true,
        message: `Sección ${cleanName} (${code}) registrada con éxito`,
        data: newSection
      });
    } catch (error: any) {
      console.error('Error al registrar sección:', error);
      if (error.code === 11000) {
        res.status(409).json({
          success: false,
          message: 'El código o nombre ya se encuentra registrado'
        });
        return;
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Error al registrar la sección'
      });
    }
  }

  /**
   * 4. Editar sección
   * PUT /api/sections/:id
   */
  public static async updateSection(req: Request, res: Response): Promise<void> {
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

      if (name !== undefined) {
        const cleanName = String(name).trim().toUpperCase();
        const nameRegex = /^[A-Z]{1,3}$/;
        if (!nameRegex.test(cleanName)) {
          res.status(400).json({
            success: false,
            message: 'El nombre de la sección debe contener de 1 a 3 letras mayúsculas (ej: A, B, AA, AB, ABC)'
          });
          return;
        }

        const existingName = await SectionModel.findOne({ name: cleanName, _id: { $ne: id } });
        if (existingName) {
          res.status(409).json({
            success: false,
            message: `El nombre "${cleanName}" ya está registrado en otra sección`
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
            message: 'El código debe tener exactamente 7 caracteres con formato AAA-000 (ej: SEC-001)'
          });
          return;
        }

        const existingCode = await SectionModel.findOne({ code: cleanCode, _id: { $ne: id } });
        if (existingCode) {
          res.status(409).json({
            success: false,
            message: `El código "${cleanCode}" ya está en uso por otra sección`
          });
          return;
        }
        updates.code = cleanCode;
      }

      const updated = await SectionModel.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true
      });

      if (!updated) {
        res.status(404).json({
          success: false,
          message: `Sección con ID ${id} no encontrada`
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Sección actualizada con éxito',
        data: updated
      });
    } catch (error: any) {
      console.error('Error al actualizar sección:', error);
      if (error.code === 11000) {
        res.status(409).json({
          success: false,
          message: 'El código o nombre ya se encuentra registrado'
        });
        return;
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Error al actualizar la sección'
      });
    }
  }
}
