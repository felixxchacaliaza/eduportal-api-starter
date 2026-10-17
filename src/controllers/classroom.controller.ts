import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { ClassroomModel } from '../models/classroom.model.js';

/**
 * Calcula automáticamente el siguiente código correlativo de aula (prefijo AUL)
 * Ejemplos: si no hay ninguno -> AUL-001; si ya existe AUL-001 -> AUL-002
 */
async function generateNextClassroomCode(): Promise<string> {
  const prefix = 'AUL';
  const regex = new RegExp(`^${prefix}-\\d{3}$`);

  const existing = await ClassroomModel.find({ code: regex }).select('code');

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

export class ClassroomController {
  /**
   * 1. Listar todas las aulas
   * GET /api/classrooms
   */
  public static async getClassrooms(_req: Request, res: Response): Promise<void> {
    try {
      const classrooms = await ClassroomModel.find().sort({ name: 1 });

      res.status(200).json({
        success: true,
        count: classrooms.length,
        data: classrooms
      });
    } catch (error) {
      console.error('Error al listar aulas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al consultar las aulas'
      });
    }
  }

  /**
   * 2. Listar aula por ID
   * GET /api/classrooms/:id
   */
  public static async getClassroomById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({
          success: false,
          message: `El ID "${id}" no es un ObjectId válido de MongoDB`
        });
        return;
      }

      const classroom = await ClassroomModel.findById(id);

      if (!classroom) {
        res.status(404).json({
          success: false,
          message: `Aula con ID ${id} no encontrada`
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: classroom
      });
    } catch (error) {
      console.error('Error al buscar aula:', error);
      res.status(500).json({
        success: false,
        message: 'Error al buscar el aula solicitada'
      });
    }
  }

  /**
   * 3. Crear aula
   * POST /api/classrooms
   * Body:
   * {
   *   "name": "101",
   *   "capacity": 35,
   *   "description": "Aula 101 con proyector"
   * }
   */
  public static async createClassroom(req: Request, res: Response): Promise<void> {
    try {
      let { code, name, capacity, description, enabled } = req.body;

      // Validación de Name (formato 3 dígitos: 101, 102, 201...)
      if (name === undefined || name === null || !String(name).trim()) {
        res.status(400).json({
          success: false,
          message: 'El número/nombre del aula es obligatorio (formato de 3 dígitos, ej: 101, 102, 201)'
        });
        return;
      }

      const cleanName = String(name).trim();
      const nameRegex = /^\d{3}$/;
      if (!nameRegex.test(cleanName)) {
        res.status(400).json({
          success: false,
          message: 'El nombre del aula debe tener formato de 3 dígitos numéricos donde el primer dígito indica el piso (ej: 101, 102, 201, 301)'
        });
        return;
      }

      // Validar unicidad del nombre
      const existingName = await ClassroomModel.findOne({ name: cleanName });
      if (existingName) {
        res.status(409).json({
          success: false,
          message: `Ya existe un aula registrada con el número "${cleanName}"`
        });
        return;
      }

      // Validación de Capacity
      if (capacity === undefined || capacity === null || isNaN(Number(capacity))) {
        res.status(400).json({
          success: false,
          message: 'La capacidad del aula es obligatoria y debe ser un valor numérico'
        });
        return;
      }

      const numericCapacity = Number(capacity);
      if (numericCapacity < 1) {
        res.status(400).json({
          success: false,
          message: 'La capacidad del aula debe ser de al menos 1 alumno'
        });
        return;
      }

      // Autogeneración del código si no se envía
      if (!code || !String(code).trim()) {
        code = await generateNextClassroomCode();
      } else {
        code = String(code).toUpperCase().trim();
        const codeRegex = /^[A-Z]{3}-\d{3}$/;
        if (!codeRegex.test(code)) {
          res.status(400).json({
            success: false,
            message: 'El código debe tener exactamente 7 caracteres con formato AAA-000 (ej: AUL-001)'
          });
          return;
        }
      }

      // Validar unicidad del código
      const existingCode = await ClassroomModel.findOne({ code });
      if (existingCode) {
        res.status(409).json({
          success: false,
          message: `Ya existe un aula con el código "${code}"`
        });
        return;
      }

      // enabled por defecto siempre es true
      const isEnabled = typeof enabled === 'boolean' ? enabled : true;

      // Descripción limpia
      const cleanDescription = description && String(description).trim()
        ? String(description).trim()
        : `Aula ${cleanName}`;

      const newClassroom = new ClassroomModel({
        code,
        name: cleanName,
        capacity: numericCapacity,
        description: cleanDescription,
        enabled: isEnabled
      });

      await newClassroom.save();

      res.status(201).json({
        success: true,
        message: `Aula ${cleanName} (${code}) registrada con éxito`,
        data: newClassroom
      });
    } catch (error: any) {
      console.error('Error al registrar aula:', error);
      if (error.code === 11000) {
        res.status(409).json({
          success: false,
          message: 'El código o número de aula ya se encuentra registrado'
        });
        return;
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Error al registrar el aula'
      });
    }
  }

  /**
   * 4. Editar aula
   * PUT /api/classrooms/:id
   */
  public static async updateClassroom(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { code, name, capacity, description, enabled } = req.body;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({
          success: false,
          message: `El ID "${id}" no es un ObjectId válido de MongoDB`
        });
        return;
      }

      const updates: Record<string, any> = {};

      if (name !== undefined) {
        const cleanName = String(name).trim();
        const nameRegex = /^\d{3}$/;
        if (!nameRegex.test(cleanName)) {
          res.status(400).json({
            success: false,
            message: 'El nombre del aula debe tener formato de 3 dígitos (ej: 101, 102, 201)'
          });
          return;
        }

        const existingName = await ClassroomModel.findOne({ name: cleanName, _id: { $ne: id } });
        if (existingName) {
          res.status(409).json({
            success: false,
            message: `El número de aula "${cleanName}" ya está registrado en otra aula`
          });
          return;
        }
        updates.name = cleanName;
      }

      if (capacity !== undefined) {
        const numericCapacity = Number(capacity);
        if (isNaN(numericCapacity) || numericCapacity < 1) {
          res.status(400).json({
            success: false,
            message: 'La capacidad debe ser un número entero mayor o igual a 1'
          });
          return;
        }
        updates.capacity = numericCapacity;
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
            message: 'El código debe tener exactamente 7 caracteres con formato AAA-000 (ej: AUL-001)'
          });
          return;
        }

        const existingCode = await ClassroomModel.findOne({ code: cleanCode, _id: { $ne: id } });
        if (existingCode) {
          res.status(409).json({
            success: false,
            message: `El código "${cleanCode}" ya está en uso por otra aula`
          });
          return;
        }
        updates.code = cleanCode;
      }

      const updated = await ClassroomModel.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true
      });

      if (!updated) {
        res.status(404).json({
          success: false,
          message: `Aula con ID ${id} no encontrada`
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Aula actualizada con éxito',
        data: updated
      });
    } catch (error: any) {
      console.error('Error al actualizar aula:', error);
      if (error.code === 11000) {
        res.status(409).json({
          success: false,
          message: 'El código o número de aula ya se encuentra registrado'
        });
        return;
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Error al actualizar el aula'
      });
    }
  }
}
