import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { RuleModel, IRule } from '../models/rule.model.js';
import { getActiveAcademicYear } from './academic-year.controller.js';

/**
 * Calcula automáticamente el siguiente código correlativo de regla (prefijo RUL)
 */
async function generateNextRuleCode(): Promise<string> {
  const prefix = 'RUL';
  const regex = new RegExp(`^${prefix}-\\d{3}$`);

  const existing = await RuleModel.find({ code: regex }).select('code');

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

/**
 * Resuelve el valor vigente de una regla para un año escolar determinado (Opción B)
 */
export async function getRuleActiveValue(key: string, targetYear?: string): Promise<any> {
  const rule = await RuleModel.findOne({ key: key.toUpperCase().trim() });
  if (!rule) return null;

  if (!rule.isAnnual) {
    return rule.value;
  }

  let year = targetYear;
  if (!year) {
    const activeYear = await getActiveAcademicYear();
    year = activeYear || '2026';
  }

  if (Array.isArray(rule.value)) {
    const yearMatch = rule.value.find((item: any) => String(item.year) === String(year));
    if (yearMatch && yearMatch.value !== undefined) {
      return yearMatch.value;
    }
    // Si no existe para ese año específico, toma el último año disponible
    return rule.value[rule.value.length - 1]?.value ?? null;
  }

  return rule.value;
}

/**
 * Formatea una regla agregando campos calculados 'currentYear' y 'currentValue'
 */
function formatRuleWithActiveValue(rule: IRule, currentYear: string, requestedYear?: string) {
  const obj = rule.toJSON();
  const yearToUse = requestedYear || currentYear;

  if (rule.isAnnual && Array.isArray(rule.value)) {
    const match = rule.value.find((item: any) => String(item.year) === String(yearToUse));
    obj.activeYear = yearToUse;
    obj.currentValue = match ? match.value : (rule.value[rule.value.length - 1]?.value ?? null);
  } else {
    obj.activeYear = currentYear;
    obj.currentValue = rule.value;
  }

  return obj;
}

export class RuleController {
  /**
   * 1. Listar todas las reglas de configuración (con currentValue resuelto automáticamente)
   * GET /api/rules?year=2026
   */
  public static async getRules(req: Request, res: Response): Promise<void> {
    try {
      const requestedYear = req.query.year ? String(req.query.year).trim() : undefined;
      const activeYear = await getActiveAcademicYear();
      const currentYear = activeYear || '2026';

      const rules = await RuleModel.find().sort({ code: 1 });
      const formatted = rules.map(r => formatRuleWithActiveValue(r, currentYear, requestedYear));

      res.status(200).json({
        success: true,
        count: formatted.length,
        currentAcademicYear: currentYear,
        queriedYear: requestedYear || currentYear,
        data: formatted
      });
    } catch (error) {
      console.error('Error al listar reglas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al consultar las reglas'
      });
    }
  }

  /**
   * 2. Obtener regla por ID o por KEY (ej: /api/rules/MAX_WEEKLY_HOURS?year=2026)
   * GET /api/rules/:id
   */
  public static async getRuleById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const requestedYear = req.query.year ? String(req.query.year).trim() : undefined;

      let rule = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        rule = await RuleModel.findById(id);
      }

      if (!rule) {
        rule = await RuleModel.findOne({ key: id.toUpperCase().trim() });
      }

      if (!rule) {
        res.status(404).json({
          success: false,
          message: `Regla "${id}" no encontrada (búsqueda por ID o key)`
        });
        return;
      }

      const activeYear = await getActiveAcademicYear();
      const currentYear = activeYear || '2026';

      const formatted = formatRuleWithActiveValue(rule, currentYear, requestedYear);

      res.status(200).json({
        success: true,
        data: formatted
      });
    } catch (error) {
      console.error('Error al buscar regla:', error);
      res.status(500).json({
        success: false,
        message: 'Error al buscar la regla solicitada'
      });
    }
  }

  /**
   * 3. Crear una nueva regla
   * POST /api/rules
   */
  public static async createRule(req: Request, res: Response): Promise<void> {
    try {
      let { code, key, name, description, isAnnual, dataType, value, enabled } = req.body;

      if (!key || typeof key !== 'string' || !key.trim()) {
        res.status(400).json({
          success: false,
          message: 'La clave (key) de la regla es obligatoria (ej: MAX_WEEKLY_HOURS)'
        });
        return;
      }

      const cleanKey = key.trim().toUpperCase();
      const keyRegex = /^[A-Z0-9_]{3,50}$/;
      if (!keyRegex.test(cleanKey)) {
        res.status(400).json({
          success: false,
          message: 'La clave debe contener entre 3 y 50 caracteres (solo mayúsculas, números y guiones bajos)'
        });
        return;
      }

      const existingKey = await RuleModel.findOne({ key: cleanKey });
      if (existingKey) {
        res.status(409).json({
          success: false,
          message: `Ya existe una regla con la clave "${cleanKey}"`
        });
        return;
      }

      if (!name || typeof name !== 'string' || !name.trim()) {
        res.status(400).json({
          success: false,
          message: 'El nombre descriptivo de la regla es obligatorio'
        });
        return;
      }

      const validDataTypes = ['STRING', 'NUMBER', 'BOOLEAN', 'ARRAY', 'ARRAY_OBJECT', 'OBJECT'];
      if (!dataType || !validDataTypes.includes(String(dataType).toUpperCase())) {
        res.status(400).json({
          success: false,
          message: `El tipo de dato es obligatorio. Valores válidos: ${validDataTypes.join(', ')}`
        });
        return;
      }
      const cleanDataType = String(dataType).toUpperCase();

      if (value === undefined || value === null) {
        res.status(400).json({
          success: false,
          message: 'El valor (value) de la regla es obligatorio'
        });
        return;
      }

      if (!code || !String(code).trim()) {
        code = await generateNextRuleCode();
      } else {
        code = String(code).toUpperCase().trim();
        const codeRegex = /^[A-Z]{3}-\d{3}$/;
        if (!codeRegex.test(code)) {
          res.status(400).json({
            success: false,
            message: 'El código debe tener exactamente 7 caracteres con formato AAA-000 (ej: RUL-001)'
          });
          return;
        }
      }

      const existingCode = await RuleModel.findOne({ code });
      if (existingCode) {
        res.status(409).json({
          success: false,
          message: `Ya existe una regla con el código "${code}"`
        });
        return;
      }

      const isEnabled = typeof enabled === 'boolean' ? enabled : true;
      const isAnnualRule = typeof isAnnual === 'boolean' ? isAnnual : false;

      const newRule = new RuleModel({
        code,
        key: cleanKey,
        name: String(name).trim(),
        description: description ? String(description).trim() : '',
        isAnnual: isAnnualRule,
        dataType: cleanDataType,
        value,
        enabled: isEnabled
      });

      await newRule.save();

      res.status(201).json({
        success: true,
        message: `Regla ${cleanKey} (${code}) registrada con éxito`,
        data: newRule
      });
    } catch (error: any) {
      console.error('Error al registrar regla:', error);
      if (error.code === 11000) {
        res.status(409).json({
          success: false,
          message: 'El código o la clave (key) ya se encuentra registrado'
        });
        return;
      }
      res.status(500).json({
        success: false,
        message: error.message || 'Error al registrar la regla'
      });
    }
  }

  /**
   * 4. Editar regla
   * PUT /api/rules/:id
   */
  public static async updateRule(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { code, key, name, description, isAnnual, dataType, value, enabled } = req.body;

      let rule = null;
      if (mongoose.Types.ObjectId.isValid(id)) {
        rule = await RuleModel.findById(id);
      }

      if (!rule) {
        rule = await RuleModel.findOne({ key: id.toUpperCase().trim() });
      }

      if (!rule) {
        res.status(404).json({
          success: false,
          message: `Regla "${id}" no encontrada para actualizar`
        });
        return;
      }

      const updates: Record<string, any> = {};

      if (value !== undefined) updates.value = value;
      if (name !== undefined && String(name).trim()) updates.name = String(name).trim();
      if (description !== undefined) updates.description = String(description).trim();
      if (isAnnual !== undefined) updates.isAnnual = Boolean(isAnnual);
      if (enabled !== undefined) updates.enabled = Boolean(enabled);

      if (dataType !== undefined) {
        const validDataTypes = ['STRING', 'NUMBER', 'BOOLEAN', 'ARRAY', 'ARRAY_OBJECT', 'OBJECT'];
        const cleanDataType = String(dataType).toUpperCase();
        if (!validDataTypes.includes(cleanDataType)) {
          res.status(400).json({
            success: false,
            message: `Tipo de dato no válido. Use: ${validDataTypes.join(', ')}`
          });
          return;
        }
        updates.dataType = cleanDataType;
      }

      if (key !== undefined) {
        const cleanKey = String(key).trim().toUpperCase();
        const existingKey = await RuleModel.findOne({ key: cleanKey, _id: { $ne: rule._id } });
        if (existingKey) {
          res.status(409).json({
            success: false,
            message: `La clave "${cleanKey}" ya está en uso por otra regla`
          });
          return;
        }
        updates.key = cleanKey;
      }

      if (code && String(code).trim()) {
        const cleanCode = String(code).toUpperCase().trim();
        const existingCode = await RuleModel.findOne({ code: cleanCode, _id: { $ne: rule._id } });
        if (existingCode) {
          res.status(409).json({
            success: false,
            message: `El código "${cleanCode}" ya está en uso por otra regla`
          });
          return;
        }
        updates.code = cleanCode;
      }

      const updated = await RuleModel.findByIdAndUpdate(rule._id, updates, {
        new: true,
        runValidators: true
      });

      const currentYearRule = await RuleModel.findOne({ key: 'CURRENT_ACADEMIC_YEAR' });
      const currentYear = currentYearRule?.value ? String(currentYearRule.value) : '2026';
      const formatted = updated ? formatRuleWithActiveValue(updated, currentYear) : null;

      res.status(200).json({
        success: true,
        message: `Regla ${updated?.key} actualizada con éxito`,
        data: formatted
      });
    } catch (error: any) {
      console.error('Error al actualizar regla:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al actualizar la regla'
      });
    }
  }
}
