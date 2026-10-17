import mongoose from 'mongoose';

async function applyMongoValidation() {
  await mongoose.connect('mongodb://127.0.0.1:27017/eduportalangular');
  const db = mongoose.connection.db;

  const collections = await db?.listCollections().toArray();
  const collectionNames = collections?.map(c => c.name) || [];

  // 1. Validador para areas
  if (!collectionNames.includes('areas')) {
    await db?.createCollection('areas');
  }

  await db?.command({
    collMod: 'areas',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['code', 'name'],
        properties: {
          code: {
            bsonType: 'string',
            minLength: 7,
            maxLength: 7,
            pattern: '^[A-Z]{3}-\\d{3}$',
            description: 'Código de exactamente 7 caracteres con formato AAA-000'
          },
          name: {
            bsonType: 'string',
            minLength: 3,
            maxLength: 100,
            description: 'Nombre de 3 a 100 caracteres'
          },
          description: {
            bsonType: 'string',
            maxLength: 100,
            description: 'Descripción de hasta 100 caracteres'
          },
          enabled: {
            bsonType: 'bool',
            description: 'Booleano que indica si está activa'
          }
        }
      }
    },
    validationLevel: 'moderate',
    validationAction: 'error'
  });

  // 2. Validador para subjects
  if (!collectionNames.includes('subjects')) {
    await db?.createCollection('subjects');
  }

  await db?.command({
    collMod: 'subjects',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['code', 'name', 'area', 'weeklyHours'],
        properties: {
          code: {
            bsonType: 'string',
            minLength: 7,
            maxLength: 7,
            pattern: '^[A-Z]{3}-\\d{3}$',
            description: 'Código de exactamente 7 caracteres con formato AAA-000'
          },
          name: {
            bsonType: 'string',
            minLength: 3,
            maxLength: 100,
            description: 'Nombre de 3 a 100 caracteres'
          },
          description: {
            bsonType: 'string',
            maxLength: 100,
            description: 'Descripción de hasta 100 caracteres'
          },
          area: {
            bsonType: 'objectId',
            description: 'Referencia al ObjectId de la colección areas'
          },
          weeklyHours: {
            bsonType: ['int', 'double', 'decimal', 'long'],
            minimum: 1,
            description: 'Horas semanales mayor o igual a 1'
          },
          enabled: {
            bsonType: 'bool',
            description: 'Estado activo o inactivo'
          }
        }
      }
    },
    validationLevel: 'moderate',
    validationAction: 'error'
  });

  // 3. Validador para levels
  await db?.command({
    collMod: 'levels',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['code', 'name'],
        properties: {
          code: {
            bsonType: 'string',
            minLength: 7,
            maxLength: 7,
            pattern: '^[A-Z]{3}-\\d{3}$',
            description: 'Código de exactamente 7 caracteres con formato AAA-000'
          },
          name: {
            bsonType: 'string',
            minLength: 1,
            maxLength: 100,
            description: 'Nombre requerido de 1 a 100 caracteres'
          },
          description: {
            bsonType: 'string',
            maxLength: 100,
            description: 'Descripción de hasta 100 caracteres'
          },
          enabled: {
            bsonType: 'bool',
            description: 'Estado activo o inactivo'
          }
        }
      }
    },
    validationLevel: 'moderate',
    validationAction: 'error'
  });

  // 4. Validador para grades
  await db?.command({
    collMod: 'grades',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['code', 'name', 'description', 'level'],
        properties: {
          code: {
            bsonType: 'string',
            minLength: 7,
            maxLength: 7,
            pattern: '^[A-Z]{3}-\\d{3}$',
            description: 'Código de exactamente 7 caracteres con formato AAA-000'
          },
          name: {
            bsonType: ['int', 'double', 'decimal', 'long'],
            minimum: 1,
            description: 'Número del grado (1, 2, 3...)'
          },
          description: {
            bsonType: 'string',
            maxLength: 100,
            description: 'Nombre completo (ej: 1° de Secundaria)'
          },
          level: {
            bsonType: 'objectId',
            description: 'Referencia a la colección levels'
          },
          enabled: {
            bsonType: 'bool',
            description: 'Estado activo o inactivo'
          }
        }
      }
    },
    validationLevel: 'moderate',
    validationAction: 'error'
  });

  // 5. Validador para sections

  if (!collectionNames.includes('sections')) {
    await db?.createCollection('sections');
  }

  await db?.command({
    collMod: 'sections',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['code', 'name'],
        properties: {
          code: {
            bsonType: 'string',
            minLength: 7,
            maxLength: 7,
            pattern: '^[A-Z]{3}-\\d{3}$',
            description: 'Código de exactamente 7 caracteres con formato AAA-000'
          },
          name: {
            bsonType: 'string',
            minLength: 1,
            maxLength: 3,
            pattern: '^[A-Z]{1,3}$',
            description: 'Nombre de 1 a 3 letras mayúsculas (A, B, AA, AB, ABC, etc.)'
          },
          description: {
            bsonType: 'string',
            maxLength: 100,
            description: 'Descripción de hasta 100 caracteres'
          },
          enabled: {
            bsonType: 'bool',
            description: 'Estado activo o inactivo'
          }
        }
      }
    },
    validationLevel: 'moderate',
    validationAction: 'error'
  });

  // 6. Validador para classrooms
  if (!collectionNames.includes('classrooms')) {
    await db?.createCollection('classrooms');
  }

  await db?.command({
    collMod: 'classrooms',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['code', 'name', 'capacity'],
        properties: {
          code: {
            bsonType: 'string',
            minLength: 7,
            maxLength: 7,
            pattern: '^[A-Z]{3}-\\d{3}$',
            description: 'Código de exactamente 7 caracteres con formato AAA-000'
          },
          name: {
            bsonType: 'string',
            minLength: 3,
            maxLength: 3,
            pattern: '^\\d{3}$',
            description: 'Nombre/número del aula en formato de 3 dígitos (ej: 101, 102, 201)'
          },
          capacity: {
            bsonType: ['int', 'double', 'decimal', 'long'],
            minimum: 1,
            description: 'Capacidad o aforo del aula mayor o igual a 1'
          },
          description: {
            bsonType: 'string',
            maxLength: 100,
            description: 'Descripción de hasta 100 caracteres'
          },
          enabled: {
            bsonType: 'bool',
            description: 'Estado activo o inactivo'
          }
        }
      }
    },
    validationLevel: 'moderate',
    validationAction: 'error'
  });

  // 7. Validador para rules
  if (!collectionNames.includes('rules')) {
    await db?.createCollection('rules');
  }

  await db?.command({
    collMod: 'rules',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['code', 'key', 'name', 'dataType', 'value'],
        properties: {
          code: {
            bsonType: 'string',
            minLength: 7,
            maxLength: 7,
            pattern: '^[A-Z]{3}-\\d{3}$',
            description: 'Código de exactamente 7 caracteres con formato AAA-000'
          },
          key: {
            bsonType: 'string',
            minLength: 3,
            maxLength: 50,
            pattern: '^[A-Z0-9_]+$',
            description: 'Clave única de la regla en mayúsculas'
          },
          name: {
            bsonType: 'string',
            minLength: 3,
            maxLength: 100,
            description: 'Nombre descriptivo de la regla'
          },
          dataType: {
            bsonType: 'string',
            enum: ['STRING', 'NUMBER', 'BOOLEAN', 'ARRAY', 'ARRAY_OBJECT', 'OBJECT'],
            description: 'Tipo de dato del valor'
          },
          description: {
            bsonType: 'string',
            maxLength: 200,
            description: 'Descripción de hasta 200 caracteres'
          },
          enabled: {
            bsonType: 'bool',
            description: 'Estado activo o inactivo'
          }
        }
      }
    },
    validationLevel: 'moderate',
    validationAction: 'error'
  });

  // 8. Validador para grade_sections
  if (!collectionNames.includes('grade_sections')) {
    await db?.createCollection('grade_sections');
  }

  await db?.command({
    collMod: 'grade_sections',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['code', 'grade', 'section', 'classroom', 'academicYear', 'shift', 'maxCapacity'],
        properties: {
          code: {
            bsonType: 'string',
            minLength: 7,
            maxLength: 7,
            pattern: '^[A-Z]{3}-\\d{3}$',
            description: 'Código de exactamente 7 caracteres con formato AAA-000'
          },
          grade: {
            bsonType: 'objectId',
            description: 'Referencia a la colección grades'
          },
          section: {
            bsonType: 'objectId',
            description: 'Referencia a la colección sections'
          },
          classroom: {
            bsonType: 'objectId',
            description: 'Referencia a la colección classrooms'
          },
          academicYear: {
            bsonType: 'string',
            minLength: 4,
            maxLength: 4,
            pattern: '^\\d{4}$',
            description: 'Año lectivo de 4 dígitos'
          },
          shift: {
            bsonType: 'string',
            description: 'Turno escolar (MAÑANA o TARDE)'
          },
          maxCapacity: {
            bsonType: ['int', 'double', 'decimal', 'long'],
            minimum: 1,
            description: 'Capacidad máxima de matrículas mayor o igual a 1'
          },
          enrolledStudents: {
            bsonType: ['int', 'double', 'decimal', 'long'],
            minimum: 0,
            description: 'Número de matriculados mayor o igual a 0'
          },
          enabled: {
            bsonType: 'bool',
            description: 'Estado activo o inactivo'
          }
        }
      }
    },
    validationLevel: 'moderate',
    validationAction: 'error'
  });

  // 9. Validador para grade_subjects
  if (!collectionNames.includes('grade_subjects')) {
    await db?.createCollection('grade_subjects');
  }

  await db?.command({
    collMod: 'grade_subjects',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['code', 'grade', 'subject', 'academicYear', 'weeklyHours'],
        properties: {
          code: {
            bsonType: 'string',
            minLength: 7,
            maxLength: 7,
            pattern: '^[A-Z]{3}-\\d{3}$',
            description: 'Código de exactamente 7 caracteres con formato AAA-000'
          },
          grade: {
            bsonType: 'objectId',
            description: 'Referencia al grado escolar (grades)'
          },
          subject: {
            bsonType: 'objectId',
            description: 'Referencia a la asignatura curricular (subjects)'
          },
          academicYear: {
            bsonType: 'string',
            minLength: 4,
            maxLength: 4,
            pattern: '^\\d{4}$',
            description: 'Año lectivo de 4 dígitos'
          },
          weeklyHours: {
            bsonType: ['int', 'double', 'decimal', 'long'],
            minimum: 1,
            description: 'Horas semanales mayor o igual a 1'
          },
          enabled: {
            bsonType: 'bool',
            description: 'Estado activo o inactivo'
          }
        }
      }
    },
    validationLevel: 'moderate',
    validationAction: 'error'
  });

  // 10. Validador para academic_years
  if (!collectionNames.includes('academic_years')) {
    await db?.createCollection('academic_years');
  }

  await db?.command({
    collMod: 'academic_years',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['code', 'year', 'name', 'startDate', 'endDate', 'status'],
        properties: {
          code: {
            bsonType: 'string',
            minLength: 7,
            maxLength: 7,
            pattern: '^[A-Z]{3}-\\d{3}$',
            description: 'Código de 7 caracteres con formato AAA-000 (ej: AYE-001)'
          },
          year: {
            bsonType: 'string',
            minLength: 4,
            maxLength: 4,
            pattern: '^\\d{4}$',
            description: 'Año lectivo de 4 dígitos (ej: 2026)'
          },
          name: {
            bsonType: 'string',
            minLength: 3,
            maxLength: 100,
            description: 'Nombre descriptivo del año lectivo'
          },
          startDate: {
            bsonType: 'date',
            description: 'Fecha de inicio del año escolar'
          },
          endDate: {
            bsonType: 'date',
            description: 'Fecha de cierre del año escolar'
          },
          status: {
            bsonType: 'string',
            enum: ['PLANIFICACION', 'ACTIVO', 'CERRADO'],
            description: 'Estado de ciclo de vida del año escolar'
          },
          closedAt: {
            bsonType: ['date', 'null'],
            description: 'Fecha de cierre formal o null'
          },
          enabled: {
            bsonType: 'bool',
            description: 'Estado activo o inactivo'
          }
        }
      }
    },
    validationLevel: 'moderate',
    validationAction: 'error'
  });

  console.log('✅ Validadores de areas, subjects, levels, grades, sections, classrooms, rules, academic_years, grade_sections y grade_subjects registrados en MongoDB');
  await mongoose.disconnect();
  process.exit(0);
}

applyMongoValidation().catch(err => {
  console.error('Error aplicando validación:', err);
  process.exit(1);
});
