import mongoose from 'mongoose';
import { ClassroomModel } from '../models/classroom.model.js';
import { env } from '../config/env.js';

export const INITIAL_CLASSROOMS = [
  { code: 'AUL-001', name: '101', capacity: 35, description: 'Aula 101 con proyector', enabled: true },
  { code: 'AUL-002', name: '102', capacity: 35, description: 'Aula 102 regular', enabled: true },
  { code: 'AUL-003', name: '201', capacity: 35, description: 'Aula 201 segundo piso', enabled: true },
  { code: 'AUL-004', name: '202', capacity: 35, description: 'Aula 202 segundo piso', enabled: true },
  { code: 'AUL-005', name: '301', capacity: 30, description: 'Aula 301 tercer piso', enabled: true },
  { code: 'AUL-006', name: '302', capacity: 30, description: 'Aula 302 tercer piso', enabled: true }
];

export async function seedClassrooms(): Promise<void> {
  const count = await ClassroomModel.countDocuments();
  if (count > 0) {
    console.log(`ℹ️ [Seed] Ya existen ${count} aulas en la base de datos.`);
    return;
  }

  console.log('🌱 [Seed] Registrando las 6 aulas iniciales (101, 102, 201, 202, 301, 302)...');
  await ClassroomModel.insertMany(INITIAL_CLASSROOMS);
  console.log('✅ [Seed] 6 aulas registradas correctamente (AUL-001 a AUL-006).');
}

// Ejecución directa si se invoca por comando
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('classrooms.seed.ts')) {
  (async () => {
    try {
      await mongoose.connect(env.MONGODB_URI);
      console.log('🔗 Conectado a MongoDB para sembrado de aulas');
      await ClassroomModel.deleteMany({});
      console.log('🧹 Colección classrooms limpiada');
      await ClassroomModel.insertMany(INITIAL_CLASSROOMS);
      console.log('✅ 6 aulas registradas con éxito:');
      const all = await ClassroomModel.find().sort({ name: 1 });
      console.log(JSON.stringify(all, null, 2));
      await mongoose.disconnect();
      process.exit(0);
    } catch (err) {
      console.error('❌ Error en el sembrado de aulas:', err);
      process.exit(1);
    }
  })();
}
