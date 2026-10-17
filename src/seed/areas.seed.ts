import mongoose from 'mongoose';
import { AreaModel } from '../models/area.model.js';
import { env } from '../config/env.js';

export const INITIAL_AREAS = [
  {
    code: 'CIE-001',
    name: 'CIENCIAS',
    description: 'Área de ciencias naturales, exactas y experimentales',
    enabled: true
  },
  {
    code: 'HUM-001',
    name: 'HUMANIDADES',
    description: 'Área de ciencias sociales, comunicación y desarrollo personal',
    enabled: true
  },
  {
    code: 'IDI-001',
    name: 'IDIOMAS',
    description: 'Área de lenguas extranjeras y originarias',
    enabled: true
  },
  {
    code: 'TEC-001',
    name: 'TECNOLOGÍA',
    description: 'Área de tecnologías de la información, computación y educación para el trabajo',
    enabled: true
  },
  {
    code: 'ART-001',
    name: 'ARTES',
    description: 'Área de expresión artística, música, artes visuales y cultura',
    enabled: true
  }
];

export async function seedAreas(): Promise<void> {
  const count = await AreaModel.countDocuments();
  if (count === 0) {
    console.log('🌱 [Seed] Registrando las 5 áreas curriculares oficiales...');
    await AreaModel.insertMany(INITIAL_AREAS);
    console.log('✅ [Seed] Áreas registradas: CIE-001, HUM-001, IDI-001, TEC-001, ART-001');
  }
}

// Ejecución directa para actualizar o resetear la colección de áreas
if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}`) {
  (async () => {
    try {
      await mongoose.connect(env.MONGODB_URI);
      console.log('🔗 Conectado a MongoDB para actualizar la colección areas');
      await AreaModel.deleteMany({});
      console.log('🧹 Colección areas limpiada');
      await AreaModel.insertMany(INITIAL_AREAS);
      console.log('✅ Colección areas actualizada con éxito:');
      const docs = await AreaModel.find({}, { _id: 1, code: 1, name: 1, description: 1, enabled: 1 });
      console.log(JSON.stringify(docs, null, 2));
      await mongoose.disconnect();
      process.exit(0);
    } catch (err) {
      console.error('❌ Error actualizando areas:', err);
      process.exit(1);
    }
  })();
}
