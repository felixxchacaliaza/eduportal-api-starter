import mongoose from 'mongoose';
import { SubjectModel } from '../models/subject.model.js';
import { AreaModel } from '../models/area.model.js';
import { env } from '../config/env.js';

export async function seedSubjects(): Promise<void> {
  const count = await SubjectModel.countDocuments();
  if (count > 0) {
    console.log(`ℹ️ [Seed] Ya existen ${count} asignaturas en la base de datos.`);
    return;
  }

  // Buscar las áreas existentes para obtener sus ObjectId
  const ciencias = await AreaModel.findOne({ code: 'CIE-001' });
  const humanidades = await AreaModel.findOne({ code: 'HUM-001' });
  const idiomas = await AreaModel.findOne({ code: 'IDI-001' });
  const tecnologia = await AreaModel.findOne({ code: 'TEC-001' });
  const artes = await AreaModel.findOne({ code: 'ART-001' });

  if (!ciencias || !humanidades || !idiomas || !tecnologia || !artes) {
    console.warn('⚠️ [Seed] No se encontraron todas las áreas base. Ejecuta primero el seed de áreas.');
    return;
  }

  const initialSubjects = [
    {
      code: 'MAT-001',
      name: 'Matemática',
      description: 'Álgebra, geometría y cálculo',
      area: ciencias._id,
      weeklyHours: 5,
      enabled: true
    },
    {
      code: 'COM-001',
      name: 'Comunicación',
      description: 'Comprensión lectora, gramática y redacción',
      area: humanidades._id,
      weeklyHours: 5,
      enabled: true
    },
    {
      code: 'ING-001',
      name: 'Inglés',
      description: 'Inglés comunicativo y gramática básica',
      area: idiomas._id,
      weeklyHours: 3,
      enabled: true
    },
    {
      code: 'CYT-001',
      name: 'Ciencia y Tecnología',
      description: 'Física, química y biología experimental',
      area: ciencias._id,
      weeklyHours: 4,
      enabled: true
    },
    {
      code: 'HIS-001',
      name: 'Historia y Geografía',
      description: 'Historia universal y ciencias sociales',
      area: humanidades._id,
      weeklyHours: 3,
      enabled: true
    },
    {
      code: 'EPT-001',
      name: 'Educación para el Trabajo',
      description: 'Tecnología, computación y proyectos productivos',
      area: tecnologia._id,
      weeklyHours: 3,
      enabled: true
    },
    {
      code: 'ART-001',
      name: 'Arte y Cultura',
      description: 'Artes visuales, teatro y música',
      area: artes._id,
      weeklyHours: 2,
      enabled: true
    }
  ];

  console.log('🌱 [Seed] Registrando asignaturas iniciales...');
  await SubjectModel.insertMany(initialSubjects);
  console.log(`✅ [Seed] ${initialSubjects.length} asignaturas registradas correctamente.`);
}

// Ejecución directa si se invoca con npm run seed
if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}`) {
  (async () => {
    try {
      await mongoose.connect(env.MONGODB_URI);
      console.log('🔗 Conectado a MongoDB para sembrado de asignaturas');
      await SubjectModel.deleteMany({});
      console.log('🧹 Colección subjects limpiada');
      await seedSubjects();
      const all = await SubjectModel.find().populate('area', 'id code name');
      console.log('Asignaturas en MongoDB:', JSON.stringify(all, null, 2));
      await mongoose.disconnect();
      process.exit(0);
    } catch (err) {
      console.error('❌ Error en el sembrado:', err);
      process.exit(1);
    }
  })();
}
