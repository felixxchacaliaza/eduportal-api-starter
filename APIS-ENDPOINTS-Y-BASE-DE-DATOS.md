# 📚 DICCIONARIO OFICIAL DE APIS, ENDPOINTS Y BASE DE DATOS MONGODB
## Sistema Escolar Eduportal • Backend REST v1.0

> **Estado:** Aprobado y Mergeado en `main`  
> **Git Tag:** `backend-v1.0`  
> **Servidor Base:** `http://localhost:3000/api`  
> **Base de Datos:** MongoDB (`mongodb://127.0.0.1:27017/eduportalangular`)  
> **Total de Colecciones:** **25 Colecciones Interconectadas**  
> **Arquitectura:** Node.js + Express + TypeScript Estricto (ESM) + Mongoose ODM  

---

## 📌 1. Arquitectura General y Convenciones de la API

### 1.1 Envelope Pattern (Formato Universal de Respuestas)
Todas las respuestas de la API devuelven una estructura consistente tipo Envelope:

**Respuesta Exitosa (Colección / Listado):**
```json
{
  "success": true,
  "count": 20,
  "data": [ ... ]
}
```

**Respuesta Exitosa (Documento Individual / Mutación):**
```json
{
  "success": true,
  "message": "Operación ejecutada con éxito",
  "data": { ... }
}
```

**Respuesta de Error:**
```json
{
  "success": false,
  "message": "Descripción clara del error o motivo de validación fallida",
  "error": "Detalles técnicos (opcional)"
}
```

### 1.2 Reglas de Serialización JSON en Mongoose
- **Identificadores:** Todo `_id` de MongoDB se transforma en `id: string` en el JSON de salida.
- **Versión de Documento:** El campo `__v` es suprimido en todas las respuestas.
- **Seguridad:** En la colección `users`, el campo `password` (hash bcrypt) **nunca** es devuelto en las respuestas JSON (`select: false` y suprimido en `toJSON`).

### 1.3 Códigos de Estado HTTP Utilizados
- `200 OK`: Consulta exitosa o actualización realizada.
- `201 Created`: Recurso creado exitosamente.
- `400 Bad Request`: Parámetros inválidos, campos faltantes o regla de negocio violada.
- `401 Unauthorized`: Falta de token JWT o credenciales inválidas.
- `403 Forbidden`: Recurso inactivo, año lectivo cerrado o sin permisos suficientes.
- `404 Not Found`: Recurso solicitado no existe en la base de datos.
- `409 Conflict`: Clave única duplicada (DNI, código correlativo, o salón repetido).
- `500 Internal Server Error`: Excepción no controlada en el servidor.

---

## 🔐 2. Credenciales Maestras Sembradas para Pruebas

| Rol / Perfil | Email | Contraseña | Permisos y Capacidades |
| :--- | :--- | :--- | :--- |
| **Super Usuario** | `root@eduportal.edu.pe` | `Admin123*` | Perfil protegido e indestructible (`isSuperAdmin: true`). Acceso total a los 18 menús y 25 colecciones. |
| **Director** | `roberto.mendoza@eduportal.edu.pe` | `Director123*` | Gestión académica, apertura de salones, plana docente, matrículas y reportes. |
| **Docente** | `carlos.ramirez@eduportal.edu.pe` | `Docente123*` | Acceso a sus salones asignados, registro de notas vigesimales y toma de asistencia. |

---

## 🗄️ 3. Diccionario de Datos: Las 25 Colecciones MongoDB

### Bloque A: Estructura Académica Base (10 Colecciones)

#### 1. `academic_years` (Años Lectivos)
| Campo | Tipo TS | Tipo Mongo | Requerido | Restricción / Formato |
| :--- | :--- | :--- | :---: | :--- |
| `id` | `string` | `ObjectId` | Auto | Clave primaria |
| `code` | `string` | `String` | Sí | Único. Formato `/^AYE-\d{3}$/` (Ej: `AYE-002`) |
| `year` | `string` | `String` | Sí | Único. 4 dígitos numéricos (Ej: `"2026"`) |
| `startDate` | `Date` | `Date` | Sí | Fecha inicio escolar (Ej: `2026-03-01`) |
| `endDate` | `Date` | `Date` | Sí | Fecha fin escolar (Ej: `2026-12-20`) |
| `status` | `string` | `String` | Sí | Enum: `'PLANIFICACION'`, `'ACTIVO'`, `'CERRADO'` |
| `closedAt` | `Date` | `Date` | No | Fecha en la que se cerró el año lectivo |

#### 2. `levels` (Niveles Educativos)
| Campo | Tipo TS | Tipo Mongo | Requerido | Restricción / Formato |
| :--- | :--- | :--- | :---: | :--- |
| `id` | `string` | `ObjectId` | Auto | Clave primaria |
| `code` | `string` | `String` | Sí | Único. Prefijo 3 letras (Ej: `INI-001`, `PRI-001`, `SEC-001`) |
| `name` | `string` | `String` | Sí | Único en mayúsculas (`INICIAL`, `PRIMARIA`, `SECUNDARIA`) |
| `description` | `string` | `String` | No | Descripción institucional |
| `enabled` | `boolean` | `Boolean` | Sí | Estado activo (`true`) |

#### 3. `grades` (Grados Escolares)
| Campo | Tipo TS | Tipo Mongo | Requerido | Restricción / Formato |
| :--- | :--- | :--- | :---: | :--- |
| `id` | `string` | `ObjectId` | Auto | Clave primaria |
| `code` | `string` | `String` | Sí | Único. Formato `GRA-001` a `GRA-005` |
| `name` | `number` | `Number` | Sí | Número de grado (`1`, `2`, `3`, `4`, `5`) |
| `description` | `string` | `String` | Sí | Ej: `"1° de Secundaria"` |
| `level` | `string` | `ObjectId` | Sí | Referencia foránea `ref: 'Level'` |
| `enabled` | `boolean` | `Boolean` | Sí | Estado activo (`true`) |

#### 4. `sections` (Secciones)
| Campo | Tipo TS | Tipo Mongo | Requerido | Restricción / Formato |
| :--- | :--- | :--- | :---: | :--- |
| `id` | `string` | `ObjectId` | Auto | Clave primaria |
| `code` | `string` | `String` | Sí | Único. Formato `SEC-001` a `SEC-006` |
| `name` | `string` | `String` | Sí | Letra en mayúscula: `'A'`, `'B'`, `'C'`, `'D'`, `'E'`, `'F'` |
| `enabled` | `boolean` | `Boolean` | Sí | Estado activo (`true`) |

#### 5. `classrooms` (Aulas Físicas)
| Campo | Tipo TS | Tipo Mongo | Requerido | Restricción / Formato |
| :--- | :--- | :--- | :---: | :--- |
| `id` | `string` | `ObjectId` | Auto | Clave primaria |
| `code` | `string` | `String` | Sí | Único. Formato `AUL-001` a `AUL-006` |
| `name` | `string` | `String` | Sí | Ej: `"Aula 101 - Pabellón A"` |
| `capacity` | `number` | `Number` | Sí | Aforo físico máximo en personas (Ej: `30`) |
| `building` | `string` | `String` | No | Pabellón o edificio (Ej: `"Pabellón A"`) |
| `floor` | `number` | `Number` | No | Número de piso (`1`, `2`, `3`) |
| `enabled` | `boolean` | `Boolean` | Sí | Estado activo (`true`) |

#### 6. `rules` (Reglas de Negocio Institucionales)
| Campo | Tipo TS | Tipo Mongo | Requerido | Restricción / Formato |
| :--- | :--- | :--- | :---: | :--- |
| `id` | `string` | `ObjectId` | Auto | Clave primaria |
| `code` | `string` | `String` | Sí | Único. Formato `RUL-001` a `RUL-006` |
| `name` | `string` | `String` | Sí | Identificador de regla: `'SHIFTS'`, `'DEFAULT_ENROLLMENT_CAPACITY'`, etc. |
| `description` | `string` | `String` | No | Explicación pedagógica |
| `value` | `any` | `Mixed` | Sí | JSON o valor: ej: `["MAÑANA", "TARDE"]`, `30`, `40` |
| `academicYear` | `string` | `String` | No | Opcional para parametrización por año lectivo |
| `enabled` | `boolean` | `Boolean` | Sí | Estado activo (`true`) |

#### 7. `areas` (Áreas Curriculares Oficiales MINEDU)
| Campo | Tipo TS | Tipo Mongo | Requerido | Restricción / Formato |
| :--- | :--- | :--- | :---: | :--- |
| `id` | `string` | `ObjectId` | Auto | Clave primaria |
| `code` | `string` | `String` | Sí | Único. Prefijo 3 letras (Ej: `CIE-001`, `HUM-001`, `IDI-001`) |
| `name` | `string` | `String` | Sí | Único en mayúsculas: `CIENCIAS`, `HUMANIDADES`, `IDIOMAS`, etc. |
| `description` | `string` | `String` | No | Descripción del área |
| `enabled` | `boolean` | `Boolean` | Sí | Estado activo (`true`) |

#### 8. `subjects` (Asignaturas / Materias)
| Campo | Tipo TS | Tipo Mongo | Requerido | Restricción / Formato |
| :--- | :--- | :--- | :---: | :--- |
| `id` | `string` | `ObjectId` | Auto | Clave primaria |
| `code` | `string` | `String` | Sí | Único. Formato `SUB-001` a `SUB-007` |
| `name` | `string` | `String` | Sí | Nombre oficial: `"Matemática"`, `"Comunicación"`, etc. |
| `area` | `string` | `ObjectId` | Sí | Referencia foránea `ref: 'Area'` |
| `weeklyHours` | `number` | `Number` | Sí | Horas pedagógicas sugeridas por semana |
| `enabled` | `boolean` | `Boolean` | Sí | Estado activo (`true`) |

#### 9. `grade_sections` (Salones Aperturados por Año)
| Campo | Tipo TS | Tipo Mongo | Requerido | Restricción / Formato |
| :--- | :--- | :--- | :---: | :--- |
| `id` | `string` | `ObjectId` | Auto | Clave primaria |
| `code` | `string` | `String` | Sí | Único. Formato `GSE-001` a `GSE-010` |
| `academicYear` | `string` | `String` | Sí | 4 dígitos del año lectivo (`"2026"`) |
| `grade` | `string` | `ObjectId` | Sí | Referencia foránea `ref: 'Grade'` |
| `section` | `string` | `ObjectId` | Sí | Referencia foránea `ref: 'Section'` |
| `classroom` | `string` | `ObjectId` | Sí | Referencia foránea `ref: 'Classroom'` |
| `shift` | `string` | `String` | Sí | Enum: `'MAÑANA'`, `'TARDE'`, `'NOCHE'` |
| `maxCapacity` | `number` | `Number` | Sí | Capacidad de matrículas ($\le$ aforo aula) |
| `enrolledStudents`| `number` | `Number` | Sí | Contador de alumnos matriculados (inicial: `0`) |
| `tutor` | `string` | `ObjectId` | No | Opcional `ref: 'Teacher'` (Tutor del salón) |
| `enabled` | `boolean` | `Boolean` | Sí | Estado activo (`true`) |
*Índice Compuesto Único:* `{ grade: 1, section: 1, academicYear: 1 }` (No permite salón duplicado en el mismo año).

#### 10. `grade_subjects` (Malla Curricular por Grado)
| Campo | Tipo TS | Tipo Mongo | Requerido | Restricción / Formato |
| :--- | :--- | :--- | :---: | :--- |
| `id` | `string` | `ObjectId` | Auto | Clave primaria |
| `code` | `string` | `String` | Sí | Único. Formato `GSB-001` a `GSB-035` |
| `academicYear` | `string` | `String` | Sí | Año lectivo (`"2026"`) |
| `grade` | `string` | `ObjectId` | Sí | Referencia foránea `ref: 'Grade'` |
| `subject` | `string` | `ObjectId` | Sí | Referencia foránea `ref: 'Subject'` |
| `weeklyHours` | `number` | `Number` | Sí | Horas semanales para esa materia en ese grado |
| `enabled` | `boolean` | `Boolean` | Sí | Estado activo (`true`) |
*Índice Compuesto Único:* `{ grade: 1, subject: 1, academicYear: 1 }`.
*Regla de Negocio:* La suma de `weeklyHours` por grado no puede exceder el tope de `40` horas MINEDU.

---

### Bloque B: Personas, Actores y Cargos (5 Colecciones)

#### 11. `positions` (Catálogo de Cargos Institucionales)
| Campo | Tipo TS | Tipo Mongo | Requerido | Restricción / Formato |
| :--- | :--- | :--- | :---: | :--- |
| `id` | `string` | `ObjectId` | Auto | Clave primaria |
| `code` | `string` | `String` | Sí | Único. Formato `POS-001` a `POS-007` |
| `name` | `string` | `String` | Sí | Nombre del cargo en mayúsculas |
| `department` | `string` | `String` | Sí | Enum: `'DIRECCION'`, `'ADMINISTRACION'`, `'PSICOPEDAGOGIA'`, `'CONVIVENCIA'`, `'SERVICIOS_GENERALES'` |
| `description` | `string` | `String` | No | Funciones del puesto |
| `enabled` | `boolean` | `Boolean` | Sí | Estado activo (`true`) |

#### 12. `persons` (Padrón Civil Único de Personas)
| Campo | Tipo TS | Tipo Mongo | Requerido | Restricción / Formato |
| :--- | :--- | :--- | :---: | :--- |
| `id` | `string` | `ObjectId` | Auto | Clave primaria |
| `code` | `string` | `String` | Sí | Único. Formato `PER-001` a `PER-020` |
| `dni` | `string` | `String` | Sí | **Índice Único.** Exactamente 8 dígitos numéricos `/^\d{8}$/` |
| `firstName` | `string` | `String` | Sí | Nombres de la persona |
| `lastName` | `string` | `String` | Sí | Apellidos de la persona |
| `birthDate` | `Date` | `Date` | No | Fecha de nacimiento |
| `gender` | `string` | `String` | Sí | Enum: `'M'`, `'F'` |
| `personalEmail` | `string` | `String` | Sí | **Índice Único.** Correo personal validado |
| `phone` | `string` | `String` | No | Teléfono de contacto |
| `address` | `string` | `String` | No | Dirección física de residencia |
| `enabled` | `boolean` | `Boolean` | Sí | Estado activo (`true`) |

#### 13. `workers` (Personal Administrativo y Servicios)
| Campo | Tipo TS | Tipo Mongo | Requerido | Restricción / Formato |
| :--- | :--- | :--- | :---: | :--- |
| `id` | `string` | `ObjectId` | Auto | Clave primaria |
| `code` | `string` | `String` | Sí | Único. Formato `WRK-001` a `WRK-005` |
| `person` | `string` | `ObjectId` | Sí | **Índice Único.** Referencia `ref: 'Person'` |
| `position` | `string` | `ObjectId` | Sí | Referencia `ref: 'Position'` |
| `contractType` | `string` | `String` | Sí | Enum: `'NOMBRADO'`, `'CONTRATADO'`, `'LOCACION'` |
| `hireDate` | `Date` | `Date` | Sí | Fecha de ingreso institucional |
| `enabled` | `boolean` | `Boolean` | Sí | Estado activo (`true`) |

#### 14. `teachers` (Plana Docente)
| Campo | Tipo TS | Tipo Mongo | Requerido | Restricción / Formato |
| :--- | :--- | :--- | :---: | :--- |
| `id` | `string` | `ObjectId` | Auto | Clave primaria |
| `code` | `string` | `String` | Sí | Único. Formato `TEA-001` a `TEA-005` |
| `person` | `string` | `ObjectId` | Sí | **Índice Único.** Referencia `ref: 'Person'` |
| `area` | `string` | `ObjectId` | Sí | Referencia `ref: 'Area'` (Especialidad curricular) |
| `academicDegree`| `string` | `String` | Sí | Enum: `'LICENCIADO'`, `'MAGISTER'`, `'DOCTOR'`, `'BACHILLER'` |
| `contractedHours`| `number` | `Number` | Sí | Horas contractuales semanales (Ej: `30`) |
| `assignedHours` | `number` | `Number` | Sí | Horas asignadas en salones (inicial: `0`) |
| `enabled` | `boolean` | `Boolean` | Sí | Estado activo (`true`) |

#### 15. `students` (Padrón de Estudiantes y Apoderados)
| Campo | Tipo TS | Tipo Mongo | Requerido | Restricción / Formato |
| :--- | :--- | :--- | :---: | :--- |
| `id` | `string` | `ObjectId` | Auto | Clave primaria |
| `code` | `string` | `String` | Sí | Único. Formato `STU-001` a `STU-005` |
| `person` | `string` | `ObjectId` | Sí | **Índice Único.** Referencia `ref: 'Person'` |
| `guardians` | `Array` | `Subdoc[]` | Sí | Lista de apoderados vinculados al padrón civil |
| `guardians.person` | `string` | `ObjectId` | Sí | Referencia `ref: 'Person'` (apoderado) |
| `guardians.relationship` | `string` | `String` | Sí | Enum: `'PADRE'`, `'MADRE'`, `'TUTOR'`, `'APODERADO'` |
| `guardians.isPrimary` | `boolean` | `Boolean` | Sí | Si es el contacto principal (Al menos 1 obligatorio) |
| `entryYear` | `string` | `String` | Sí | Año de ingreso escolar (Ej: `"2025"`) |
| `enabled` | `boolean` | `Boolean` | Sí | Estado activo (`true`) |
*Regla de Negocio:* Un alumno no puede ser su propio apoderado (`student.person !== guardian.person`).

---

### Bloque C: Seguridad RBAC y Menú Dinámico (3 Colecciones)

#### 16. `menus` (Opciones de Navegación del Sistema)
| Campo | Tipo TS | Tipo Mongo | Requerido | Restricción / Formato |
| :--- | :--- | :--- | :---: | :--- |
| `id` | `string` | `ObjectId` | Auto | Clave primaria |
| `code` | `string` | `String` | Sí | Único. Formato `MEN-001` a `MEN-018` |
| `key` | `string` | `String` | Sí | Clave única de permiso (Ej: `'STUDENTS'`, `'EVALUATIONS'`) |
| `label` | `string` | `String` | Sí | Texto visual del menú (Ej: `"Alumnos y Matrícula"`) |
| `icon` | `string` | `String` | Sí | Nombre de icono Material (Ej: `'people'`, `'school'`, `'payments'`) |
| `path` | `string` | `String` | No | Ruta en frontend (ej: `'/alumnos'`) o `null` si es carpeta padre |
| `parent` | `string` | `ObjectId` | No | Opcional `ref: 'Menu'` para submenús jerárquicos |
| `order` | `number` | `Number` | Sí | Posición ordinal en el menú lateral |
| `enabled` | `boolean` | `Boolean` | Sí | Estado activo (`true`) |

#### 17. `profiles` (Perfiles y Matriz de Permisos RBAC)
| Campo | Tipo TS | Tipo Mongo | Requerido | Restricción / Formato |
| :--- | :--- | :--- | :---: | :--- |
| `id` | `string` | `ObjectId` | Auto | Clave primaria |
| `code` | `string` | `String` | Sí | Único. Formato `PRF-001` a `PRF-003` |
| `name` | `string` | `String` | Sí | Único: `'SUPER USUARIO'`, `'DIRECTOR'`, `'DOCENTE'` |
| `description` | `string` | `String` | No | Alcance del perfil |
| `isSuperAdmin` | `boolean` | `Boolean` | Sí | Si es `true`, tiene bypass total e inmunidad |
| `isSystem` | `boolean` | `Boolean` | Sí | Perfiles base protegidos contra borrado |
| `permissions` | `Array` | `Subdoc[]` | Sí | Lista de permisos por menú |
| `permissions.menu` | `string` | `ObjectId` | Sí | Referencia `ref: 'Menu'` |
| `permissions.accessLevel` | `string` | `String` | Sí | Enum: `'FULL'`, `'READ_ONLY'` |
| `enabled` | `boolean` | `Boolean` | Sí | Estado activo (`true`) |

#### 18. `users` (Cuentas Institucionales de Acceso)
| Campo | Tipo TS | Tipo Mongo | Requerido | Restricción / Formato |
| :--- | :--- | :--- | :---: | :--- |
| `id` | `string` | `ObjectId` | Auto | Clave primaria |
| `code` | `string` | `String` | Sí | Único. Formato `USR-001` a `USR-003` |
| `person` | `string` | `ObjectId` | Sí | Referencia `ref: 'Person'` |
| `profile` | `string` | `ObjectId` | Sí | Referencia `ref: 'Profile'` |
| `email` | `string` | `String` | Sí | **Índice Único.** Email de inicio de sesión |
| `password` | `string` | `String` | Sí | Hash bcrypt (10 rounds). Excluido en consultas |
| `isProtected` | `boolean` | `Boolean` | Sí | Si es `true`, no puede desactivarse ni eliminarse |
| `lastLogin` | `Date` | `Date` | No | Timestamp de última autenticación exitosa |
| `enabled` | `boolean` | `Boolean` | Sí | Estado activo (`true`) |

---

### Bloque D: Operación Escolar y Transacciones (7 Colecciones)

#### 19. `enrollments` (Matrículas Escolares)
| Campo | Tipo TS | Tipo Mongo | Requerido | Restricción / Formato |
| :--- | :--- | :--- | :---: | :--- |
| `id` | `string` | `ObjectId` | Auto | Clave primaria |
| `code` | `string` | `String` | Sí | Único. Formato `ENR-001` a `ENR-003` |
| `student` | `string` | `ObjectId` | Sí | Referencia `ref: 'Student'` |
| `gradeSection` | `string` | `ObjectId` | Sí | Referencia `ref: 'GradeSection'` |
| `academicYear` | `string` | `String` | Sí | Año lectivo (`"2026"`) |
| `enrollmentDate`| `Date` | `Date` | Sí | Fecha de la matrícula |
| `status` | `string` | `String` | Sí | Enum: `'DEFINITIVA'`, `'CONDICIONAL'`, `'TRASLADADO'`, `'RETIRADO'` |
| `observation` | `string` | `String` | No | Observaciones académicas |
| `enabled` | `boolean` | `Boolean` | Sí | Estado activo (`true`) |
*Índice Compuesto Único:* `{ student: 1, academicYear: 1 }` (Un alumno solo puede tener una matrícula por año).

#### 20. `teacher_assignments` (Asignación de Carga Docente)
| Campo | Tipo TS | Tipo Mongo | Requerido | Restricción / Formato |
| :--- | :--- | :--- | :---: | :--- |
| `id` | `string` | `ObjectId` | Auto | Clave primaria |
| `code` | `string` | `String` | Sí | Único. Formato `TAS-001` a `TAS-002` |
| `teacher` | `string` | `ObjectId` | Sí | Referencia `ref: 'Teacher'` |
| `gradeSection` | `string` | `ObjectId` | Sí | Referencia `ref: 'GradeSection'` |
| `subject` | `string` | `ObjectId` | Sí | Referencia `ref: 'Subject'` |
| `academicYear` | `string` | `String` | Sí | Año lectivo (`"2026"`) |
| `enabled` | `boolean` | `Boolean` | Sí | Estado activo (`true`) |
*Índice Compuesto Único:* `{ gradeSection: 1, subject: 1, academicYear: 1 }` (1 solo docente por materia y salón).

#### 21. `schedules` (Horarios Semanales por Salón)
| Campo | Tipo TS | Tipo Mongo | Requerido | Restricción / Formato |
| :--- | :--- | :--- | :---: | :--- |
| `id` | `string` | `ObjectId` | Auto | Clave primaria |
| `code` | `string` | `String` | Sí | Único. Formato `SCH-001` a `SCH-002` |
| `academicYear` | `string` | `String` | Sí | Año lectivo (`"2026"`) |
| `gradeSection` | `string` | `ObjectId` | Sí | Referencia `ref: 'GradeSection'` |
| `subject` | `string` | `ObjectId` | Sí | Referencia `ref: 'Subject'` |
| `teacher` | `string` | `ObjectId` | Sí | Referencia `ref: 'Teacher'` |
| `dayOfWeek` | `string` | `String` | Sí | Enum: `'LUNES'`, `'MARTES'`, `'MIERCOLES'`, `'JUEVES'`, `'VIERNES'`, `'SABADO'` |
| `startTime` | `string` | `String` | Sí | Formato `HH:MM` (Ej: `"08:00"`) |
| `endTime` | `string` | `String` | Sí | Formato `HH:MM` (Ej: `"09:30"`) |
| `enabled` | `boolean` | `Boolean` | Sí | Estado activo (`true`) |

#### 22. `evaluations` (Notas y Periodos de Calificación)
| Campo | Tipo TS | Tipo Mongo | Requerido | Restricción / Formato |
| :--- | :--- | :--- | :---: | :--- |
| `id` | `string` | `ObjectId` | Auto | Clave primaria |
| `code` | `string` | `String` | Sí | Único. Formato `EVA-001` a `EVA-002` |
| `student` | `string` | `ObjectId` | Sí | Referencia `ref: 'Student'` |
| `gradeSection` | `string` | `ObjectId` | Sí | Referencia `ref: 'GradeSection'` |
| `subject` | `string` | `ObjectId` | Sí | Referencia `ref: 'Subject'` |
| `teacher` | `string` | `ObjectId` | Sí | Referencia `ref: 'Teacher'` |
| `academicYear` | `string` | `String` | Sí | Año lectivo (`"2026"`) |
| `periods` | `Array` | `Subdoc[]` | Sí | Lista de periodos bimestrales |
| `periods.period` | `string` | `String` | Sí | Identificador: `'BIMESTRE_1'`, `'BIMESTRE_2'`, etc. |
| `periods.score` | `number` | `Number` | No | Calificación vigesimal entera entre `0` y `20` |
| `periods.conclusion`| `string` | `String` | No | Conclusión descriptiva MINEDU |
| `finalScore` | `number` | `Number` | No | Promedio final anual calculado |
| `enabled` | `boolean` | `Boolean` | Sí | Estado activo (`true`) |
*Índice Compuesto Único:* `{ student: 1, gradeSection: 1, subject: 1, academicYear: 1 }`.

#### 23. `attendances` (Control Diario de Asistencias)
| Campo | Tipo TS | Tipo Mongo | Requerido | Restricción / Formato |
| :--- | :--- | :--- | :---: | :--- |
| `id` | `string` | `ObjectId` | Auto | Clave primaria |
| `code` | `string` | `String` | Sí | Único. Formato `ATT-001` a `ATT-002` |
| `student` | `string` | `ObjectId` | Sí | Referencia `ref: 'Student'` |
| `gradeSection` | `string` | `ObjectId` | Sí | Referencia `ref: 'GradeSection'` |
| `academicYear` | `string` | `String` | Sí | Año lectivo (`"2026"`) |
| `date` | `Date` | `Date` | Sí | Fecha de la asistencia (sin horas) |
| `status` | `string` | `String` | Sí | Enum: `'PRESENTE'`, `'TARDANZA'`, `'FALTA_INJUSTIFICADA'`, `'FALTA_JUSTIFICADA'` |
| `observation` | `string` | `String` | No | Motivo de tardanza o justificación |
| `registeredBy` | `string` | `ObjectId` | Sí | Referencia `ref: 'Person'` (Auxiliar o docente) |
| `enabled` | `boolean` | `Boolean` | Sí | Estado activo (`true`) |
*Índice Compuesto Único:* `{ student: 1, date: 1 }`.

#### 24. `incidents` (Bitácora de Convivencia Escolar)
| Campo | Tipo TS | Tipo Mongo | Requerido | Restricción / Formato |
| :--- | :--- | :--- | :---: | :--- |
| `id` | `string` | `ObjectId` | Auto | Clave primaria |
| `code` | `string` | `String` | Sí | Único. Formato `INC-001` a `INC-002` |
| `student` | `string` | `ObjectId` | Sí | Referencia `ref: 'Student'` |
| `academicYear` | `string` | `String` | Sí | Año lectivo (`"2026"`) |
| `date` | `Date` | `Date` | Sí | Fecha del suceso |
| `severity` | `string` | `String` | Sí | Enum: `'LEVE'`, `'MODERADA'`, `'GRAVE'` |
| `category` | `string` | `String` | Sí | Enum: `'CONDUCTA'`, `'UNIFORME'`, `'ACADEMICA'`, `'CONVIVENCIA'` |
| `description` | `string` | `String` | Sí | Relato de los hechos observados |
| `actionTaken` | `string` | `String` | No | Medida correctiva o compromiso |
| `registeredBy` | `string` | `ObjectId` | Sí | Referencia `ref: 'Person'` |
| `status` | `string` | `String` | Sí | Enum: `'REGISTRADA'`, `'EN_SEGUIMIENTO'`, `'RESUELTA'` |
| `enabled` | `boolean` | `Boolean` | Sí | Estado activo (`true`) |

#### 25. `tuition_payments` (Matrículas y Pensiones Escolares)
| Campo | Tipo TS | Tipo Mongo | Requerido | Restricción / Formato |
| :--- | :--- | :--- | :---: | :--- |
| `id` | `string` | `ObjectId` | Auto | Clave primaria |
| `code` | `string` | `String` | Sí | Único. Formato `PAY-001` a `PAY-011` |
| `student` | `string` | `ObjectId` | Sí | Referencia `ref: 'Student'` |
| `academicYear` | `string` | `String` | Sí | Año lectivo (`"2026"`) |
| `concept` | `string` | `String` | Sí | Enum: `'MATRICULA'`, `'PENSION_01'` a `'PENSION_10'` |
| `amount` | `number` | `Number` | Sí | Monto en Soles (Ej: `450.00`) |
| `dueDate` | `Date` | `Date` | Sí | Fecha de vencimiento límite |
| `status` | `string` | `String` | Sí | Enum: `'PENDIENTE'`, `'PAGADO'`, `'VENCIDO'`, `'EXONERADO'` |
| `paidDate` | `Date` | `Date` | No | Fecha en que se realizó el abono |
| `paymentMethod`| `string` | `String` | No | Enum: `'EFECTIVO'`, `'TRANSFERENCIA'`, `'POS'` |
| `receiptNumber`| `string` | `String` | No | Número de boleta o comprobante |
| `enabled` | `boolean` | `Boolean` | Sí | Estado activo (`true`) |
*Índice Compuesto Único:* `{ student: 1, academicYear: 1, concept: 1 }`.

---

## 📡 4. Catálogo Exhaustivo de Endpoints REST

### 🔑 Módulo 0: Autenticación & Menú Dinámico (`/api/auth`)

#### 1. Iniciar Sesión (Login)
* **Método / Ruta:** `POST /api/auth/login`
* **Headers:** `Content-Type: application/json`
* **Request Body:**
  ```json
  {
    "email": "root@eduportal.edu.pe",
    "password": "Admin123*"
  }
  ```
* **Respuesta Exitosa (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": "8h",
      "user": {
        "id": "673f8a...",
        "code": "USR-001",
        "email": "root@eduportal.edu.pe",
        "person": {
          "id": "673f8b...",
          "dni": "10293847",
          "fullName": "Félix Chacaliaza Flores"
        },
        "profile": {
          "id": "673f8c...",
          "name": "SUPER USUARIO",
          "isSuperAdmin": true
        }
      },
      "menuTree": [ ... ]
    }
  }
  ```

#### 2. Consultar Usuario Autenticado y Menú Dinámico
* **Método / Ruta:** `GET /api/auth/me`
* **Headers:** `Authorization: Bearer <TOKEN_JWT>`
* **Respuesta Exitosa (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "id": "673f8a...",
      "code": "USR-001",
      "email": "root@eduportal.edu.pe",
      "person": { "id": "...", "dni": "10293847", "fullName": "..." },
      "profile": { "id": "...", "name": "SUPER USUARIO", "isSuperAdmin": true },
      "menuTree": [
        {
          "id": "673f8d...",
          "code": "MEN-001",
          "key": "DASHBOARD",
          "label": "Tablero Principal",
          "icon": "dashboard",
          "path": "/dashboard",
          "order": 1,
          "accessLevel": "FULL",
          "children": []
        },
        {
          "id": "673f8e...",
          "code": "MEN-002",
          "key": "STUDENTS_GROUP",
          "label": "Gestión Escolar",
          "icon": "school",
          "path": null,
          "order": 2,
          "accessLevel": "FULL",
          "children": [
            {
              "id": "673f8f...",
              "code": "MEN-003",
              "key": "STUDENTS",
              "label": "Alumnos y Matrícula",
              "icon": "people",
              "path": "/alumnos",
              "order": 1,
              "accessLevel": "FULL"
            }
          ]
        }
      ]
    }
  }
  ```

---

### 👥 Módulo 1: Padrón Civil & Actores

#### 1. Padrón Civil (`/api/persons`)
* `GET /api/persons`: Listar personas (Soporta query `?search=10293847` y `?enabled=true`).
* `GET /api/persons/:id`: Consultar persona por su ObjectId.
* `GET /api/persons/check-dni/:dni`: Validar si un DNI ya existe (`{ exists: boolean, person?: ... }`).
* `POST /api/persons`: Registrar nueva persona civil (Valida 8 dígitos exactos).
* `PUT /api/persons/:id`: Actualizar datos personales.
* `DELETE /api/persons/:id`: Baja lógica (`enabled: false`).

#### 2. Catálogo de Cargos (`/api/positions`)
* `GET /api/positions`: Listar los 7 cargos institucionales.
* `GET /api/positions/:id`: Consultar cargo.
* `POST /api/positions`: Crear nuevo puesto de trabajo.
* `PUT /api/positions/:id`: Modificar nombre o departamento.

#### 3. Personal Administrativo y Servicio (`/api/workers`)
* `GET /api/workers`: Listar trabajadores (Pobla automáticamente `person` y `position`).
* `GET /api/workers/:id`: Consultar trabajador específico.
* `POST /api/workers`: Contratar personal vinculándolo a una `person` y un `position`.
* `PUT /api/workers/:id`: Modificar tipo de contrato o estado.

#### 4. Plana Docente (`/api/teachers`)
* `GET /api/teachers`: Listar docentes (Pobla `person` y especialidad `area`).
* `GET /api/teachers/:id`: Consultar docente.
* `POST /api/teachers`: Crear profesor asignando horas contractuales y área.
* `PUT /api/teachers/:id`: Actualizar grado académico o carga disponible.

#### 5. Estudiantes y Apoderados (`/api/students`)
* `GET /api/students`: Listar estudiantes (Pobla `person` del alumno y `guardians.person`).
* `GET /api/students/:id`: Consultar expediente del estudiante.
* `POST /api/students`: Crear alumno vinculando apoderados obligatorios:
  ```json
  {
    "person": "673f8b0123456789abcdef01",
    "entryYear": "2026",
    "guardians": [
      {
        "person": "673f8b0123456789abcdef02",
        "relationship": "PADRE",
        "isPrimary": true
      }
    ]
  }
  ```
* `PUT /api/students/:id`: Modificar datos escolares o actualizar apoderados.

---

### 🏫 Módulo 2: Estructura Académica Base

* `GET /api/academic-years`: Listar años lectivos (2025 CERRADO, 2026 ACTIVO, 2027 PLANIFICACION).
* `POST /api/academic-years`: Aperturar año escolar con fechas de inicio y fin.
* `PUT /api/academic-years/:id`: Cerrar año lectivo (`status: "CERRADO"` sella modificaciones).
* `GET /api/levels`: Listar niveles educativos (INICIAL, PRIMARIA, SECUNDARIA).
* `GET /api/grades`: Listar los 5 grados de secundaria (`level` poblado).
* `GET /api/sections`: Listar secciones escolares (A, B, C, D, E, F).
* `GET /api/classrooms`: Listar aulas físicas con capacidad máxima.
* `GET /api/rules`: Listar reglas globales (`SHIFTS`, `DEFAULT_ENROLLMENT_CAPACITY`, etc.).
* `GET /api/areas`: Listar las 5 áreas curriculares MINEDU.
* `GET /api/subjects`: Listar asignaturas oficiales con su área vinculada.
* `GET /api/grade-sections`: Listar los 10 salones escolares activos para 2026 con aforo y vacantes.
* `POST /api/grade-sections`: Aperturar un nuevo salón (Valida que el aforo no supere el aula).
* `GET /api/grade-subjects`: Listar la malla curricular de 35 asignaciones (`?grade=...&academicYear=2026`).

---

### 🎓 Módulo 3: Operación Académica y Transacciones

#### 1. Matrículas (`/api/enrollments`)
* `GET /api/enrollments`: Listar matrículas (Soporta `?academicYear=2026&gradeSection=...`).
* `POST /api/enrollments`: Matricular estudiante:
  ```json
  {
    "student": "673f8e0123456789abcdef10",
    "gradeSection": "673f8e0123456789abcdef20",
    "academicYear": "2026",
    "status": "DEFINITIVA"
  }
  ```
  *(Autovalida que el salón tenga vacantes disponibles y autoincrementa `enrolledStudents + 1`)*.

#### 2. Carga Docente (`/api/teacher-assignments`)
* `GET /api/teacher-assignments`: Listar asignaciones de profesores a materias y salones.
* `POST /api/teacher-assignments`: Asignar profesor a una materia y salón.

#### 3. Horarios Semanales (`/api/schedules`)
* `GET /api/schedules`: Listar todos los bloques horarios semanales.
* `GET /api/schedules/by-section/:sectionId`: Obtener el horario completo de un salón ordenado por día y hora.
* `GET /api/schedules/by-teacher/:teacherId`: Obtener la agenda de clases de un docente.
* `POST /api/schedules`: Registrar bloque horario (Previene cruces de horario para el profesor y el salón).

#### 4. Calificaciones y Registro Vigesimal (`/api/evaluations`)
* `GET /api/evaluations`: Listar evaluaciones anuales.
* `GET /api/evaluations/matrix`: Matriz de notas para planilla docente (`?gradeSection=...&subject=...`).
* `PUT /api/evaluations/bulk-update`: Guardar notas vigesimales por lote (Verifica candado `isOpen: true`).

#### 5. Asistencia Escolar (`/api/attendances`)
* `GET /api/attendances`: Listar asistencias registradas.
* `GET /api/attendances/by-section-date`: Listar asistencia de un salón en una fecha específica (`?gradeSection=...&date=2026-03-10`).
* `POST /api/attendances/bulk-register`: Registro masivo de asistencia diaria de un salón completo.

#### 6. Incidencias Disciplinarias (`/api/incidents`)
* `GET /api/incidents`: Listar incidencias de convivencia (Filtros por severidad y estado).
* `POST /api/incidents`: Registrar incidente con medidas adoptadas.
* `PUT /api/incidents/:id`: Dar seguimiento y resolver incidente.

#### 7. Pagos y Pensiones (`/api/tuition-payments`)
* `GET /api/tuition-payments`: Listar pagos y cuotas escolares (`?academicYear=2026&status=PENDIENTE`).
* `GET /api/tuition-payments/by-student/:studentId`: Consultar estado de cuenta y cronograma de un alumno.
* `GET /api/tuition-payments/kpis-summary`: Resumen financiero institucional (recaudado vs pendiente vs morosidad).
* `POST /api/tuition-payments/pay/:id`: Registrar cobro de pensión o matrícula:
  ```json
  {
    "paymentMethod": "TRANSFERENCIA",
    "paidDate": "2026-03-05T10:00:00Z"
  }
  ```

---

### 🛡️ Módulo 4: Seguridad, Roles y Cuentas (`/api/menus`, `/api/profiles`, `/api/users`)

* `GET /api/menus`: Listar los 18 menús del sistema.
* `GET /api/profiles`: Listar los perfiles de usuario (`SUPER USUARIO`, `DIRECTOR`, `DOCENTE`).
* `GET /api/users`: Listar cuentas de usuario registradas (Contraseñas suprimidas).
* `POST /api/users`: Crear nueva cuenta institucional con hash bcrypt automático.
* `PUT /api/users/:id`: Modificar perfil o estado de un usuario (Protege cuentas del sistema).

---

## 💻 5. Guía de Consumo desde el Frontend Angular 22

### 5.1 Servicio Base HTTP en Angular 22
Al consumir cualquier endpoint desde Angular 22, inyecta `HttpClient` y tipa la respuesta utilizando las interfaces y el envelope `{ success: true, data: T }`:

```typescript
import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface ApiResponse<T> {
  success: boolean;
  count?: number;
  message?: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class StudentService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:3000/api/students';

  // Signal reactivo de estado
  readonly students = signal<IStudent[]>([]);
  readonly loading = signal<boolean>(false);

  async loadStudents(): Promise<void> {
    this.loading.set(true);
    try {
      const response = await firstValueFrom(
        this.http.get<ApiResponse<IStudent[]>>(this.apiUrl)
      );
      this.students.set(response.data);
    } finally {
      this.loading.set(false);
    }
  }
}
```

### 5.2 Interceptor de Autenticación JWT
Crea un `auth.interceptor.ts` funcional que adjunte el token a cada petición saliente:

```typescript
import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('eduportal_token');
  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  }
  return next(req);
};
```
