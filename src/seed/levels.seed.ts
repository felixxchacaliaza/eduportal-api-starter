import mongoose from 'mongoose';
import { LevelModel } from '../models/level.model.js';
import { env } from '../config/env.js';

export const INITIAL_LEVELS = [
  {
    code: 'INI-001',
    name: 'INICIAL',
    description: 'Nivel de Educación Inicial (3 a 5 años)',
    enabled: true
  },
  {
    code: 'PRI-001',
    name: 'PRIMARIA',
    description: 'Nivel de Educación Primaria (1° a 6° grado)',
    enabled: true
  },
  {
    code: 'SEC-001',
    name: 'SECUNDARIA',
    description: 'Nivel de Educación Secundaria (1° a 5° año)',
    enabled: true
  }
];

export async function seedLevels(): Promise<void> {
  const count = await LevelModel.countDocuments();
  if (count === 0) {
    console.log('🌱 [Seed] Registrando los 3 niveles educativos oficiales...');
    await LevelModel.insertMany(INITIAL_LEVELS);
    console.log('✅ [Seed] Niveles registrados: INICIAL (INI-001), PRIMARIA (PRI-001), SECUNDARIA (SEC-001)');
  }
}

// Ejecución directa para actualizar o resetear la colección de niveles
if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}`) {
  (async () => {
    try {
      await mongoose.connect(env.MONGODB_URI);
      console.log('🔗 Conectado a MongoDB para sembrado de niveles');
      await LevelModel.deleteMany({});
      console.log('🧹 Colección levels limpiada');
      await LevelModel.insertMany(INITIAL_LEVELS);
      console.log('✅ Colección levels actualizada con éxito:');
      const docs = await LevelModel.find();
      console.log(JSON.stringify(docs, null, 2));
      await mongoose.disconnect();
      process.exit(0);
    } catch (err) {
      console.error('❌ Error en el sembrado de niveles:', err);
      process.exit(1);
    }
  })();
}
