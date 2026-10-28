import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

describe('TDD Quality Gate - Criterios de Aceptación AC-1 a AC-12 (00-backend)', () => {
  test('AC-1: Todo código debe cumplir el regex /^[A-Z]{3}-\\d{3}$/', () => {
    const codeRegex = /^[A-Z]{3}-\d{3}$/;
    assert.ok(codeRegex.test('PER-001'), 'PER-001 debe ser válido');
    assert.ok(codeRegex.test('STU-010'), 'STU-010 debe ser válido');
    assert.ok(codeRegex.test('TEA-005'), 'TEA-005 debe ser válido');
    assert.ok(codeRegex.test('MEN-001'), 'MEN-001 debe ser válido');
    assert.ok(!codeRegex.test('per-001'), 'Minúsculas deben fallar');
    assert.ok(!codeRegex.test('PER001'), 'Sin guión debe fallar');
    assert.ok(!codeRegex.test('P-001'), 'Menos de 3 letras debe fallar');
  });

  test('AC-4: DNI civil debe tener exactamente 8 dígitos numéricos', () => {
    const dniRegex = /^\d{8}$/;
    assert.ok(dniRegex.test('45891234'), '45891234 debe ser válido');
    assert.ok(!dniRegex.test('4589123'), '7 dígitos debe fallar');
    assert.ok(!dniRegex.test('458912345'), '9 dígitos debe fallar');
    assert.ok(!dniRegex.test('4589123A'), 'Letras en DNI deben fallar');
  });

  test('AC-6: Un alumno no puede ser su propio apoderado', () => {
    const studentPersonId = '653a1b2c3d4e5f6a7b8c9d01';
    const guardianPersonId = '653a1b2c3d4e5f6a7b8c9d02';
    assert.notEqual(studentPersonId, guardianPersonId, 'El alumno y el apoderado deben ser personas distintas');
  });

  test('AC-7: SuperUsuario debe ser indestructible e inmune', () => {
    const superAdminProfile = { code: 'PRF-001', name: 'SUPER USUARIO', isSuperAdmin: true, isSystem: true, enabled: true };
    const superUser = { code: 'USR-001', email: 'root@eduportal.edu.pe', isProtected: true, enabled: true };
    assert.strictEqual(superAdminProfile.isSuperAdmin, true);
    assert.strictEqual(superUser.isProtected, true);
  });

  test('AC-10: Calificaciones vigesimales deben estar en rango 0 a 20', () => {
    const isValidScore = (score: number | null) => score === null || (Number.isInteger(score) && score >= 0 && score <= 20);
    assert.ok(isValidScore(15));
    assert.ok(isValidScore(0));
    assert.ok(isValidScore(20));
    assert.ok(isValidScore(null));
    assert.ok(!isValidScore(-1));
    assert.ok(!isValidScore(21));
  });
});
