import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { app } from '../src/app.js';
import { env } from '../src/config/env.js';
import type { Server } from 'node:http';

let server: Server;
let baseUrl: string;
let authToken: string;

test.before(async () => {
  await mongoose.connect(env.MONGODB_URI);
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const address = server.address();
      if (address && typeof address === 'object') {
        baseUrl = `http://127.0.0.1:${address.port}`;
      }
      resolve();
    });
  });
});

test.after(async () => {
  server.close();
  await mongoose.disconnect();
});

test('E2E HTTP - 1. POST /api/auth/login autentica a root@eduportal.edu.pe', async () => {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'root@eduportal.edu.pe',
      password: 'Admin123*'
    })
  });

  assert.equal(res.status, 200, `Debe responder 200 OK, respondió ${res.status}`);
  const json = await res.json() as any;
  assert.equal(json.success, true);
  assert.ok(json.data?.token, 'Debe devolver un JWT token');
  assert.equal(json.data.user.email, 'root@eduportal.edu.pe');
  authToken = json.data.token;
});

test('E2E HTTP - 2. GET /api/auth/me devuelve usuario y árbol de 18 menús', async () => {
  assert.ok(authToken, 'Requiere authToken');
  const res = await fetch(`${baseUrl}/api/auth/me`, {
    headers: { 'Authorization': `Bearer ${authToken}` }
  });

  assert.equal(res.status, 200);
  const json = await res.json() as any;
  assert.equal(json.success, true);
  assert.equal(json.data.email, 'root@eduportal.edu.pe');
  assert.ok(Array.isArray(json.data.menuTree), 'menuTree debe ser un array');
  assert.ok(json.data.menuTree.length > 0, 'menuTree debe tener menús construidos');
});

test('E2E HTTP - 3. GET /api/persons lista el padrón civil', async () => {
  const res = await fetch(`${baseUrl}/api/persons`);
  assert.equal(res.status, 200);
  const json = await res.json() as any;
  assert.equal(json.success, true);
  assert.ok(Array.isArray(json.data));
  assert.ok(json.data.length >= 20, 'Deben existir al menos 20 personas');
  assert.ok(json.data.some((p: any) => p.dni === '10293847'));
});

test('E2E HTTP - 4. GET /api/students lista alumnos con apoderados poblados', async () => {
  const res = await fetch(`${baseUrl}/api/students`);
  assert.equal(res.status, 200);
  const json = await res.json() as any;
  assert.equal(json.success, true);
  assert.ok(Array.isArray(json.data));
  assert.ok(json.data.length >= 5, 'Deben existir 5 alumnos');
  const student = json.data[0];
  assert.ok(student.person, 'Debe tener person poblada');
  assert.ok(student.guardians.length > 0, 'Debe tener apoderados');
});

test('E2E HTTP - 5. GET /api/grade-sections lista salones con referencias', async () => {
  const res = await fetch(`${baseUrl}/api/grade-sections`);
  assert.equal(res.status, 200);
  const json = await res.json() as any;
  assert.equal(json.success, true);
  assert.ok(Array.isArray(json.data));
  assert.equal(json.data.length, 10, 'Deben existir 10 salones');
});

test('E2E HTTP - 6. GET /api/tuition-payments lista matrículas y pensiones', async () => {
  const res = await fetch(`${baseUrl}/api/tuition-payments`);
  assert.equal(res.status, 200);
  const json = await res.json() as any;
  assert.equal(json.success, true);
  assert.ok(Array.isArray(json.data));
  assert.ok(json.data.length >= 11, 'Deben existir al menos 11 registros de pagos');
});

test('E2E HTTP - 7. GET /api/enrollments lista matrículas activas', async () => {
  const res = await fetch(`${baseUrl}/api/enrollments`);
  assert.equal(res.status, 200);
  const json = await res.json() as any;
  assert.equal(json.success, true);
  assert.ok(Array.isArray(json.data));
  assert.ok(json.data.length >= 3, 'Deben existir al menos 3 matrículas');
});

test('E2E HTTP - 8. GET /api/teacher-assignments lista asignaciones docentes', async () => {
  const res = await fetch(`${baseUrl}/api/teacher-assignments`);
  assert.equal(res.status, 200);
  const json = await res.json() as any;
  assert.equal(json.success, true);
  assert.ok(Array.isArray(json.data));
  assert.ok(json.data.length >= 2);
});

test('E2E HTTP - 9. GET /api/schedules lista horarios semanales', async () => {
  const res = await fetch(`${baseUrl}/api/schedules`);
  assert.equal(res.status, 200);
  const json = await res.json() as any;
  assert.equal(json.success, true);
  assert.ok(Array.isArray(json.data));
  assert.ok(json.data.length >= 2);
});

test('E2E HTTP - 10. GET /api/evaluations lista evaluaciones con periodos', async () => {
  const res = await fetch(`${baseUrl}/api/evaluations`);
  assert.equal(res.status, 200);
  const json = await res.json() as any;
  assert.equal(json.success, true);
  assert.ok(Array.isArray(json.data));
  assert.ok(json.data.length >= 2);
});

test('E2E HTTP - 11. GET /api/attendances lista asistencias', async () => {
  const res = await fetch(`${baseUrl}/api/attendances`);
  assert.equal(res.status, 200);
  const json = await res.json() as any;
  assert.equal(json.success, true);
  assert.ok(Array.isArray(json.data));
  assert.ok(json.data.length >= 2);
});

test('E2E HTTP - 12. GET /api/incidents lista incidencias disciplinarias', async () => {
  const res = await fetch(`${baseUrl}/api/incidents`);
  assert.equal(res.status, 200);
  const json = await res.json() as any;
  assert.equal(json.success, true);
  assert.ok(Array.isArray(json.data));
  assert.ok(json.data.length >= 2);
});

test('E2E HTTP - 13. GET /api/menus lista catálogo de navegación', async () => {
  const res = await fetch(`${baseUrl}/api/menus`);
  assert.equal(res.status, 200);
  const json = await res.json() as any;
  assert.equal(json.success, true);
  assert.ok(Array.isArray(json.data));
  assert.equal(json.data.length, 18, 'Deben existir 18 opciones de menú');
});

test('E2E HTTP - 14. GET /api/profiles lista perfiles RBAC', async () => {
  const res = await fetch(`${baseUrl}/api/profiles`);
  assert.equal(res.status, 200);
  const json = await res.json() as any;
  assert.equal(json.success, true);
  assert.ok(Array.isArray(json.data));
  assert.equal(json.data.length, 3, 'Deben existir 3 perfiles');
});

test('E2E HTTP - 15. GET /api/users lista cuentas de usuario con protección de password', async () => {
  const res = await fetch(`${baseUrl}/api/users`);
  assert.equal(res.status, 200);
  const json = await res.json() as any;
  assert.equal(json.success, true);
  assert.ok(Array.isArray(json.data));
  assert.equal(json.data.length, 3, 'Deben existir 3 usuarios');
  // Verificar que el password no sea devuelto
  assert.equal(json.data[0].password, undefined, 'El password jamás debe ser expuesto');
});

test('E2E HTTP - 16. GET /api/teachers lista plana docente', async () => {
  const res = await fetch(`${baseUrl}/api/teachers`);
  assert.equal(res.status, 200);
  const json = await res.json() as any;
  assert.equal(json.success, true);
  assert.ok(Array.isArray(json.data));
  assert.equal(json.data.length, 5, 'Deben existir 5 docentes');
});

test('E2E HTTP - 17. GET /api/workers lista trabajadores', async () => {
  const res = await fetch(`${baseUrl}/api/workers`);
  assert.equal(res.status, 200);
  const json = await res.json() as any;
  assert.equal(json.success, true);
  assert.ok(Array.isArray(json.data));
  assert.equal(json.data.length, 5, 'Deben existir 5 trabajadores');
});

test('E2E HTTP - 18. GET /api/positions lista puestos', async () => {
  const res = await fetch(`${baseUrl}/api/positions`);
  assert.equal(res.status, 200);
  const json = await res.json() as any;
  assert.equal(json.success, true);
  assert.ok(Array.isArray(json.data));
  assert.equal(json.data.length, 7, 'Deben existir 7 puestos');
});
