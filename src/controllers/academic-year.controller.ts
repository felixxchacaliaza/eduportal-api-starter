import { Request, Response } from 'express';
import mongoose from 'express';
import { AcademicYearModel, AcademicYearStatus } from '../models/academic-year.model.js';

/**
 * Función auxiliar para verificar si un año lectivo está cerrado
 */
export async function isYearClosed(year: string): Promise<boolean> {
  const academicYearDoc = await AcademicYearModel.findOne({ year: String(year).trim() });
  return academicYearDoc?.status === 'CERRADO';
}

/**
 * Valida si un año lectivo existe en el sistema y si está disponible para operaciones
 */
export async function validateYearAvailability(year: string): Promise<{ valid: boolean; error?: string; status?: number }> {
  const cleanYear = String(year).trim();
  const academicYearDoc = await AcademicYearModel.findOne({ year: cleanYear });

  if (!academicYearDoc) {
    return {
      valid: false,
      status: 400,
      error: `El año lectivo "${cleanYear}" no se encuentra registrado en el sistema. Debe aperturarlo previamente en /api/academic-years`
    };
  }

  if (academicYearDoc.status === 'CERRADO') {
    return {
      valid: false,
      status: 403,
      error: `El año lectivo "${cleanYear}" se encuentra CERRADO y no admite apertura ni modificación de registros`
    };
  }

  return { valid: true };
}

/**
 * Función auxiliar para obtener el año lectivo activo oficial
 */
export async function getActiveAcademicYear(): Promise<string | null> {
  const activeDoc = await AcademicYearModel.findOne({ status: 'ACTIVO', enabled: true });
  return activeDoc ? activeDoc.year : null;
}

/**
 * Generador automático del código secuencial AYE-001
 */
async function generateNextCode(): Promise<string> {
  const lastDoc = await AcademicYearModel.findOne({ code: /^AYE-\d{3}$/ }).sort({ code: -1 });

  if (!lastDoc || !lastDoc.code) {
    return 'AYE-001';
  }

  const currentNumber = parseInt(lastDoc.code.replace('AYE-', ''), 10);
  const nextNumber = currentNumber + 1;
  return `AYE-${String(nextNumber).padStart(3, '0')}`;
}

export class AcademicYearController {
  /**
   * 1. GET /api/academic-years - Listar todos los años lectivos
   */
  static async getAcademicYears(req: Request, res: Response): Promise<void> {
    try {
      const { status, enabled } = req.query;
      const filter: Record<string, any> = {};

      if (status && typeof status === 'string') {
        filter.status = status.toUpperCase();
      }

      if (enabled !== undefined) {
        filter.enabled = enabled === 'true';
      }

      const academicYears = await AcademicYearModel.find(filter).sort({ year: -1 });

      res.status(200).json({
        success: true,
        count: academicYears.length,
        data: academicYears
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al consultar los años lectivos',
        error: error.message
      });
    }
  }

  /**
   * 2. GET /api/academic-years/:id - Obtener año lectivo por ID, código o año
   */
  static async getAcademicYearById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      let academicYear = null;
      if (/^[0-9a-fA-F]{24}$/.test(id)) {
        academicYear = await AcademicYearModel.findById(id);
      } else if (/^AYE-\d{3}$/i.test(id)) {
        academicYear = await AcademicYearModel.findOne({ code: id.toUpperCase() });
      } else if (/^\d{4}$/.test(id)) {
        academicYear = await AcademicYearModel.findOne({ year: id });
      }

      if (!academicYear) {
        res.status(404).json({
          success: false,
          message: `Año lectivo con identificador "${id}" no encontrado`
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: academicYear
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al consultar el año lectivo',
        error: error.message
      });
    }
  }

  /**
   * 3. POST /api/academic-years - Crear y aperturar nuevo año lectivo
   */
  static async createAcademicYear(req: Request, res: Response): Promise<void> {
    try {
      let { code, year, name, startDate, endDate, status, enabled } = req.body;

      // 1. Validar año
      if (!year || !/^\d{4}$/.test(String(year).trim())) {
        res.status(400).json({
          success: false,
          message: 'El campo year es obligatorio y debe ser un año de 4 dígitos (ej: 2026)'
        });
        return;
      }
      year = String(year).trim();

      // Verificar unicidad de año
      const existingYear = await AcademicYearModel.findOne({ year });
      if (existingYear) {
        res.status(409).json({
          success: false,
          message: `El año lectivo "${year}" ya se encuentra registrado con el código ${existingYear.code}`
        });
        return;
      }

      // 2. Validar nombre
      if (!name || typeof name !== 'string' || name.trim().length < 3) {
        name = `Año Escolar ${year}`;
      } else {
        name = name.trim();
      }

      // 3. Validar fechas
      if (!startDate || !endDate) {
        res.status(400).json({
          success: false,
          message: 'Las fechas startDate y endDate son obligatorias'
        });
        return;
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        res.status(400).json({
          success: false,
          message: 'Las fechas startDate o endDate tienen un formato inválido'
        });
        return;
      }

      if (start >= end) {
        res.status(400).json({
          success: false,
          message: 'La fecha de inicio (startDate) debe ser anterior a la fecha de fin (endDate)'
        });
        return;
      }

      // 4. Validar estado
      const validStatuses: AcademicYearStatus[] = ['PLANIFICACION', 'ACTIVO', 'CERRADO'];
      const normalizedStatus: AcademicYearStatus = status ? String(status).trim().toUpperCase() as AcademicYearStatus : 'PLANIFICACION';

      if (!validStatuses.includes(normalizedStatus)) {
        res.status(400).json({
          success: false,
          message: `El estado "${status}" no es válido. Estados permitidos: ${validStatuses.join(', ')}`
        });
        return;
      }

      // Si se crea como ACTIVO, validar que no haya otro año activo
      if (normalizedStatus === 'ACTIVO') {
        const currentActive = await AcademicYearModel.findOne({ status: 'ACTIVO' });
        if (currentActive) {
          res.status(400).json({
            success: false,
            message: `Ya existe un año lectivo activo (${currentActive.year}). Debe cerrarlo antes de activar el año ${year}.`
          });
          return;
        }
      }

      // 5. Autogenerar código
      if (!code || !String(code).trim()) {
        code = await generateNextCode();
      } else {
        code = String(code).trim().toUpperCase();
        if (!/^[A-Z]{3}-\d{3}$/.test(code)) {
          res.status(400).json({
            success: false,
            message: 'El código debe tener exactamente 7 caracteres en formato AAA-000 (ej: AYE-001)'
          });
          return;
        }
        const existingCode = await AcademicYearModel.findOne({ code });
        if (existingCode) {
          res.status(409).json({
            success: false,
            message: `El código "${code}" ya está en uso por otro año lectivo`
          });
          return;
        }
      }

      const newAcademicYear = await AcademicYearModel.create({
        code,
        year,
        name,
        startDate: start,
        endDate: end,
        status: normalizedStatus,
        closedAt: normalizedStatus === 'CERRADO' ? new Date() : null,
        enabled: enabled !== undefined ? Boolean(enabled) : true
      });

      res.status(201).json({
        success: true,
        message: `Año lectivo ${year} creado exitosamente con código ${code}`,
        data: newAcademicYear
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al registrar el año lectivo',
        error: error.message
      });
    }
  }

  /**
   * 4. PUT /api/academic-years/:id - Actualizar año lectivo y gestionar ciclo de vida
   */
  static async updateAcademicYear(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { name, startDate, endDate, status, enabled } = req.body;

      let current = null;
      if (/^[0-9a-fA-F]{24}$/.test(id)) {
        current = await AcademicYearModel.findById(id);
      } else if (/^AYE-\d{3}$/i.test(id)) {
        current = await AcademicYearModel.findOne({ code: id.toUpperCase() });
      } else if (/^\d{4}$/.test(id)) {
        current = await AcademicYearModel.findOne({ year: id });
      }

      if (!current) {
        res.status(404).json({
          success: false,
          message: `Año lectivo con identificador "${id}" no encontrado`
        });
        return;
      }

      // ========================================================
      // REGLA DE ORO: UN AÑO CERRADO ES TOTALMENTE INMUTABLE
      // ========================================================
      if (current.status === 'CERRADO') {
        if (status && status !== 'CERRADO') {
          res.status(400).json({
            success: false,
            message: `El año lectivo ${current.year} se encuentra CERRADO. Por auditoría y normativa legal, un año cerrado es inmutable y no puede reabrirse.`
          });
          return;
        }

        if (name || startDate || endDate) {
          res.status(400).json({
            success: false,
            message: `El año lectivo ${current.year} se encuentra CERRADO y no permite modificación de nombres ni fechas.`
          });
          return;
        }
      }

      // Validar cambio de fechas si se envían
      let newStart = current.startDate;
      let newEnd = current.endDate;

      if (startDate) {
        const d = new Date(startDate);
        if (isNaN(d.getTime())) {
          res.status(400).json({ success: false, message: 'Fecha startDate inválida' });
          return;
        }
        newStart = d;
      }

      if (endDate) {
        const d = new Date(endDate);
        if (isNaN(d.getTime())) {
          res.status(400).json({ success: false, message: 'Fecha endDate inválida' });
          return;
        }
        newEnd = d;
      }

      if (newStart >= newEnd) {
        res.status(400).json({
          success: false,
          message: 'La fecha startDate debe ser anterior a la fecha endDate'
        });
        return;
      }

      // Validar transición de estado
      let newStatus = current.status;
      let newClosedAt = current.closedAt;

      if (status) {
        const targetStatus: AcademicYearStatus = String(status).trim().toUpperCase() as AcademicYearStatus;
        const validStatuses: AcademicYearStatus[] = ['PLANIFICACION', 'ACTIVO', 'CERRADO'];

        if (!validStatuses.includes(targetStatus)) {
          res.status(400).json({
            success: false,
            message: `El estado "${status}" no es válido. Estados permitidos: ${validStatuses.join(', ')}`
          });
          return;
        }

        // Si se desea pasar a ACTIVO, validar que ningún otro año esté activo
        if (targetStatus === 'ACTIVO' && current.status !== 'ACTIVO') {
          const otherActive = await AcademicYearModel.findOne({
            status: 'ACTIVO',
            _id: { $ne: current._id }
          });

          if (otherActive) {
            res.status(400).json({
              success: false,
              message: `No se puede activar el año ${current.year} porque el año ${otherActive.year} aún está ACTIVO. Debe cerrar el año ${otherActive.year} primero.`
            });
            return;
          }
        }

        // Si se pasa a CERRADO, sellar con timestamp
        if (targetStatus === 'CERRADO' && current.status !== 'CERRADO') {
          newClosedAt = new Date();
        }

        newStatus = targetStatus;
      }

      // Actualizar campos
      if (name && typeof name === 'string' && name.trim().length >= 3) {
        current.name = name.trim();
      }
      current.startDate = newStart;
      current.endDate = newEnd;
      current.status = newStatus;
      current.closedAt = newClosedAt;
      if (enabled !== undefined) {
        current.enabled = Boolean(enabled);
      }

      await current.save();

      res.status(200).json({
        success: true,
        message: `Año lectivo ${current.year} actualizado exitosamente`,
        data: current
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error al actualizar el año lectivo',
        error: error.message
      });
    }
  }
}
