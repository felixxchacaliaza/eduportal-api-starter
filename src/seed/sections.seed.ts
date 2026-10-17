import mongoose from 'mongoose';
import { SectionModel } from '../models/section.model.js';
import { env } from '../config/env.js';

export const INITIAL_SECTIONS = [
  { code: 'SEC-001', name: 'A', description: 'Sección A', enabled: true },
  { code: 'SEC-002', name: 'B', description: 'Sección B', enabled: true },
  { code: 'SEC-003', name: 'C', description: 'Sección C', enabled: true },
  { code: 'SEC-004', name: 'D', description: 'Sección D', enabled: true },
  { code: 'SEC-005', name: 'E', description: 'Sección E', enabled: true },
  { code: 'SEC-006', name: 'F', description: 'Sección F', enabled: true }
];

export async function seedSections(): Promise<void> {
  const count = await SectionModel.countDocuments();
  if (count > 0) {
    console.log(`ℹ️ [Seed] Ya existen ${count} secciones en la base de datos.`);
    return;
  }

  console.log('🌱 [Seed] Registrando las 6 secciones iniciales (A, B, C, D, E, F)...');
  await SectionModel.insertMany(INITIAL_SECTIONS);
  console.log('✅ [Seed] 6 secciones registradas correctamente (SEC-001 a SEC-006).');
}

// Ejecución directa si se invoca por comando
if (process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('sections.seed.ts')) {
  (async () => {
    try {
      await mongoose.connect(env.MONGODB_URI);
      console.log('🔗 Conectado a MongoDB para sembrado de secciones');
      await SectionModel.deleteMany({});
      console.log('🧹 Colección sections limpiada');
      await SectionModel.insertMany(INITIAL_SECTIONS);
      console.log('✅ 6 secciones registradas con éxito:');
      const all = await SectionModel.find().sort({ name: 1 });
      console.log(JSON.stringify(all, null, 2));
      await mongoose.disconnect();
      process.exit(0);
    } catch (err) {
      console.error('❌ Error en el sembrado de secciones:', err);
      process.exit(1);
    }
  })();
}
