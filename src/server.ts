import { app } from './app.js';
import { env } from './config/env.js';
import { connectDatabase } from './config/database.js';
import { seedAreas } from './seed/areas.seed.js';
import { seedSubjects } from './seed/subjects.seed.js';
import { seedLevels } from './seed/levels.seed.js';
import { seedGrades } from './seed/grades.seed.js';
import { seedSections } from './seed/sections.seed.js';
import { seedClassrooms } from './seed/classrooms.seed.js';
import { seedRules } from './seed/rules.seed.js';
import { seedAcademicYears } from './seed/academic-years.seed.js';
import { seedGradeSections } from './seed/grade-sections.seed.js';
import { seedGradeSubjects } from './seed/grade-subjects.seed.js';

async function bootstrap(): Promise<void> {
  console.log('🚀 Iniciando EduPortal API Starter (Base de datos: eduportalangular)...');

  // 1. Conexión a la base de datos MongoDB
  await connectDatabase();

  // 2. Sembrado automático de áreas curriculares, asignaturas, niveles, grados, secciones, aulas, reglas, años lectivos, salones y malla curricular si están vacíos
  await seedAreas();
  await seedSubjects();
  await seedLevels();
  await seedGrades();
  await seedSections();
  await seedClassrooms();
  await seedRules();
  await seedAcademicYears();
  await seedGradeSections();
  await seedGradeSubjects();

  // 3. Encender el servidor HTTP
  app.listen(env.PORT, () => {
    console.log('─────────────────────────────────────────────────────────────');
    console.log(`📡 [Express] Servidor escuchando en: http://localhost:${env.PORT}`);
    console.log(`🏷️ Áreas Curriculares:              http://localhost:${env.PORT}/api/areas`);
    console.log(`📖 Asignaturas:                     http://localhost:${env.PORT}/api/subjects`);
    console.log(`🎓 Niveles:                         http://localhost:${env.PORT}/api/levels`);
    console.log(`🏫 Grados:                          http://localhost:${env.PORT}/api/grades`);
    console.log(`🔤 Secciones:                       http://localhost:${env.PORT}/api/sections`);
    console.log(`🚪 Aulas (Classrooms):              http://localhost:${env.PORT}/api/classrooms`);
    console.log(`⚙️ Reglas (Rules):                  http://localhost:${env.PORT}/api/rules`);
    console.log(`📅 Años Lectivos (Academic-Years):  http://localhost:${env.PORT}/api/academic-years`);
    console.log(`👥 Salones (Grade-Sections):        http://localhost:${env.PORT}/api/grade-sections`);
    console.log(`📚 Malla Curricular (Grade-Subjects): http://localhost:${env.PORT}/api/grade-subjects`);
    console.log(`🗄️ Base de datos:                   eduportalangular`);
    console.log(`🌐 CORS:                            ${env.CORS_ORIGIN}`);
    console.log('─────────────────────────────────────────────────────────────');
  });
}

bootstrap().catch((err) => {
  console.error('❌ Error fatal al iniciar el servidor:', err);
  process.exit(1);
});
