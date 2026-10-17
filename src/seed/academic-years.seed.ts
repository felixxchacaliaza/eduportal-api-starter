import mongoose from 'mongoose';
import { AcademicYearModel } from '../models/academic-year.model.js';
import { env } from '../config/env.js';

export const initialAcademicYears = [
  {
    code: 'AYE-001',
    year: '2025',
    name: 'Año Escolar 2025',
    startDate: new Date('2025-03-03T00:00:00.000Z'),
    endDate: new Date('2025-12-19T23:59:59.000Z'),
    status: 'CERRADO',
    closedAt: new Date('2025-12-31T23:59:59.000Z'),
    enabled: true
  },
  {
    code: 'AYE-002',
    year: '2026',
    name: 'Año Escolar 2026',
    startDate: new Date('2026-03-02T00:00:00.000Z'),
    endDate: new Date('2026-12-18T23:59:59.000Z'),
    status: 'ACTIVO',
    closedAt: null,
    enabled: true
  },
  {
    code: 'AYE-003',
    year: '2027',
    name: 'Año Escolar 2027',
    startDate: new Date('2027-03-01T00:00:00.000Z'),
    endDate: new Date('2027-12-17T23:59:59.000Z'),
    status: 'PLANIFICACION',
    closedAt: null,
    enabled: true
  }
];

export async function seedAcademicYears(): Promise<void> {
  const count = await AcademicYearModel.countDocuments();
  if (count === 0) {
    await AcademicYearModel.insertMany(initialAcademicYears);
    console.log(`✅ [Seed] ${initialAcademicYears.length} años lectivos insertados exitosamente (2025 CERRADO, 2026 ACTIVO, 2027 PLANIFICACION).`);
  } else {
    console.log(`ℹ️ [Seed] Ya existen ${count} años lectivos en la base de datos.`);
  }
}

// Ejecución independiente con tsx
if (process.argv[1]?.endsWith('academic-years.seed.ts')) {
  mongoose
    .connect(env.MONGODB_URI)
    .then(async () => {
      console.log('🔗 Conectado a MongoDB para sembrado de años lectivos');
      await AcademicYearModel.deleteMany({});
      console.log('🧹 Colección academic_years limpiada');
      const docs = await AcademicYearModel.insertMany(initialAcademicYears);
      console.log(`✅ ${docs.length} años lectivos registrados con éxito:`);
      console.log(JSON.stringify(docs, null, 2));
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Error en el sembrado de años lectivos:', err);
      process.exit(1);
    });
}
