import mongoose from 'mongoose';
import { GradeModel } from '../models/grade.model.js';
import { LevelModel } from '../models/level.model.js';
import { env } from '../config/env.js';

export async function seedGrades(): Promise<void> {
  const count = await GradeModel.countDocuments();
  if (count > 0) {
    console.log(`ℹ️ [Seed] Ya existen ${count} grados en la base de datos.`);
    return;
  }

  const secundaria = await LevelModel.findOne({ code: 'SEC-001' });

  if (!secundaria) {
    console.warn('⚠️ [Seed] Nivel SECUNDARIA no encontrado. Ejecuta primero seedLevels.');
    return;
  }

  const initialGrades = [
    // Grados de Secundaria (1° al 5°)
    { code: 'GRA-001', name: 1, description: '1° de Secundaria', level: secundaria._id, enabled: true },
    { code: 'GRA-002', name: 2, description: '2° de Secundaria', level: secundaria._id, enabled: true },
    { code: 'GRA-003', name: 3, description: '3° de Secundaria', level: secundaria._id, enabled: true },
    { code: 'GRA-004', name: 4, description: '4° de Secundaria', level: secundaria._id, enabled: true },
    { code: 'GRA-005', name: 5, description: '5° de Secundaria', level: secundaria._id, enabled: true }
  ];

  console.log('🌱 [Seed] Registrando los 5 grados oficiales de Secundaria...');
  await GradeModel.insertMany(initialGrades);
  console.log('✅ [Seed] 5 grados registrados correctamente (Secundaria: 1° al 5°).');
}

// Ejecución directa si se invoca por comando
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('grades.seed.ts')) {
  (async () => {
    try {
      await mongoose.connect(env.MONGODB_URI);
      console.log('🔗 Conectado a MongoDB para sembrado de grados');
      await GradeModel.deleteMany({});
      console.log('🧹 Colección grades limpiada');
      await seedGrades();
      const all = await GradeModel.find().populate('level', 'id code name');
      console.log('Grados en MongoDB:', JSON.stringify(all, null, 2));
      await mongoose.disconnect();
      process.exit(0);
    } catch (err) {
      console.error('❌ Error en el sembrado de grados:', err);
      process.exit(1);
    }
  })();
}
