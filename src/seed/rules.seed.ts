import mongoose from 'mongoose';
import { RuleModel } from '../models/rule.model.js';
import { env } from '../config/env.js';

export const INITIAL_RULES = [
  {
    code: 'RUL-001',
    key: 'SHIFTS',
    name: 'Turnos Escolares',
    description: 'Turnos oficiales habilitados para impartir clases en el colegio por año lectivo',
    isAnnual: true,
    dataType: 'ARRAY_OBJECT',
    value: [
      { year: '2025', value: ['MAÑANA'] },
      { year: '2026', value: ['MAÑANA', 'TARDE'] },
      { year: '2027', value: ['MAÑANA', 'TARDE'] }
    ],
    enabled: true
  },
  {
    code: 'RUL-002',
    key: 'DEFAULT_ENROLLMENT_CAPACITY',
    name: 'Capacidad de Matrículas por Aula por Defecto',
    description: 'Límite pedagógico de vacantes para matrículas por salón por año (independiente del aforo físico)',
    isAnnual: true,
    dataType: 'ARRAY_OBJECT',
    value: [
      { year: '2025', value: 25 },
      { year: '2026', value: 30 },
      { year: '2027', value: 30 }
    ],
    enabled: true
  },
  {
    code: 'RUL-003',
    key: 'MAX_WEEKLY_HOURS',
    name: 'Máximo de Horas Semanales por Grado',
    description: 'Límite máximo de horas lectivas semanales acumuladas por grado según normativa MINEDU por año (40h para 2026)',
    isAnnual: true,
    dataType: 'ARRAY_OBJECT',
    value: [
      { year: '2025', value: 35 },
      { year: '2026', value: 40 },
      { year: '2027', value: 40 }
    ],
    enabled: true
  },
  {
    code: 'RUL-004',
    key: 'EVALUATION_PERIODS',
    name: 'Periodos de Evaluación Escolar y Candados',
    description: 'Configuración de periodos bimestrales o trimestrales con candados isOpen para el registro de notas MINEDU',
    isAnnual: true,
    dataType: 'OBJECT',
    value: {
      periods: [
        { period: 1, name: 'Bimestre 1', weight: 25, isOpen: true },
        { period: 2, name: 'Bimestre 2', weight: 25, isOpen: true },
        { period: 3, name: 'Bimestre 3', weight: 25, isOpen: false },
        { period: 4, name: 'Bimestre 4', weight: 25, isOpen: false }
      ]
    },
    enabled: true
  },
  {
    code: 'RUL-005',
    key: 'GRADING_SCALE',
    name: 'Escala de Calificación Oficial MINEDU',
    description: 'Escala vigesimal (0 a 20) con nota mínima aprobatoria 11',
    isAnnual: false,
    dataType: 'OBJECT',
    value: {
      minScore: 0,
      maxScore: 20,
      passingScore: 11,
      type: 'VIGESIMAL'
    },
    enabled: true
  }
];

export async function seedRules(): Promise<void> {
  const count = await RuleModel.countDocuments();
  if (count >= INITIAL_RULES.length) {
    console.log(`ℹ️ [Seed] Ya existen ${count} reglas de configuración en la base de datos.`);
    return;
  }

  for (const ruleData of INITIAL_RULES) {
    const exists = await RuleModel.findOne({ key: ruleData.key });
    if (!exists) {
      await RuleModel.create(ruleData);
      console.log(`🌱 [Seed] Regla ${ruleData.key} (${ruleData.code}) creada.`);
    }
  }
  console.log('✅ [Seed] Reglas de configuración sincronizadas correctamente.');
}

// Ejecución directa si se invoca por comando
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('rules.seed.ts')) {
  (async () => {
    try {
      await mongoose.connect(env.MONGODB_URI);
      console.log('🔗 Conectado a MongoDB para sembrado de reglas (Opción B)');
      await RuleModel.deleteMany({});
      console.log('🧹 Colección rules limpiada');
      await RuleModel.insertMany(INITIAL_RULES);
      console.log('✅ 5 reglas registradas con éxito (con versionado anual y regla maestra):');
      const all = await RuleModel.find().sort({ code: 1 });
      console.log(JSON.stringify(all, null, 2));
      await mongoose.disconnect();
      process.exit(0);
    } catch (err) {
      console.error('❌ Error en el sembrado de reglas:', err);
      process.exit(1);
    }
  })();
}