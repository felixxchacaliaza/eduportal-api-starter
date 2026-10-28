# 🚀 EduPortal API Starter • Backend Modular

Base de datos: **`eduportalangular`** en MongoDB (`mongodb://127.0.0.1:27017/eduportalangular`).

## 🛠️ Comandos de Base de Datos (Creación y Valores por Defecto)

- **Crear / Inicializar la base de datos (sin borrar datos existentes):**
  ```bash
  npm run db:init
  ```
- **Reiniciar desde cero con todos los valores por defecto:**
  ```bash
  npm run db:reset
  ```
*(Ambos comandos crean las 10 colecciones, aplican los validadores `$jsonSchema`, sincronizan los índices únicos/compuestos y siembran los datos iniciales en orden jerárquico).*

---

## 📋 1. Modelos de Datos Actualizados

### Colección: `areas`
| Campo | Tipo | Requerido | Unicidad | Longitud (Mín - Máx) | Formato / Ejemplo |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **`id`** | `String` (ObjectId) | Sí | Sí | 24 caracteres | Autogenerado único (ej: `6ad063e8e607cd81d4bf3280`) |
| **`code`** | `String` | Sí | Sí | 7 caracteres exactos | 3 letras en mayúscula + guión + 3 dígitos (ej: `CIE-001`, `HUM-001`) |
| **`name`** | `String` | Sí | Sí | 3 - 100 caracteres | Mayúsculas únicas (`CIENCIAS`, `HUMANIDADES`, `IDIOMAS`, etc.) |
| **`description`** | `String` | No | No | 0 - 100 caracteres | Descripción (por defecto: `""`) |
| **`enabled`** | `Boolean` | No | No | - | Estado activo/inactivo (por defecto: `true`) |

---

### Colección: `levels`
| Campo | Tipo | Requerido | Unicidad | Longitud (Mín - Máx) | Formato / Ejemplo |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **`id`** | `String` (ObjectId) | Sí | Sí | 24 caracteres | Autogenerado único (ej: `6ad07171647e731123821c37`) |
| **`code`** | `String` | Sí | Sí | 7 caracteres exactos | 3 primeras letras de name + guión + 3 dígitos (ej: `INI-001`, `PRI-001`, `SEC-001`) |
| **`name`** | `String` | Sí | Sí | 1 - 100 caracteres | Mayúsculas únicas (`INICIAL`, `PRIMARIA`, `SECUNDARIA`) |
| **`description`** | `String` | No | No | 0 - 100 caracteres | Descripción del nivel educativo (por defecto: `""`) |
| **`enabled`** | `Boolean` | No | No | - | Estado activo/inactivo (por defecto: `true`) |

---

### Colección: `grades`
| Campo | Tipo | Requerido | Unicidad | Longitud / Regla | Formato / Ejemplo |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **`id`** | `String` (ObjectId) | Sí | Sí | 24 caracteres | Autogenerado único (ej: `6ad074e4b5a263375d49bd5d`) |
| **`code`** | `String` | Sí | Sí | 7 caracteres exactos | `GRA-001`, `GRA-002`... (autogenerado con prefijo `GRA` si no se envía) |
| **`name`** | `Number` | Sí | No | Entero $\ge 1$ | Número del grado: `1`, `2`, `3`, `4`, `5` |
| **`description`** | `String` | Sí | No | 1 - 100 caracteres | Nombre descriptivo completo: `"1° de Secundaria"`, etc. |
| **`level`** | `ObjectId` (Ref: `Level`) | Sí | No | 24 caracteres | Referencia al nivel educativo (`SECUNDARIA`) |
| **`enabled`** | `Boolean` | No | No | - | Estado activo/inactivo (por defecto: `true`) |

---

### Colección: `subjects`
| Campo | Tipo | Requerido | Unicidad | Longitud / Rango | Formato / Ejemplo |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **`id`** | `String` (ObjectId) | Sí | Sí | 24 caracteres | Autogenerado único (ej: `6ad06bfb44caa8cb64bab3ad`) |
| **`code`** | `String` | Sí | Sí | 7 caracteres exactos | 3 letras mayúsculas + guión + 3 dígitos (ej: `MAT-001`) |
| **`name`** | `String` | Sí | No | 3 - 100 caracteres | Nombre de la asignatura (ej: `Matemática`) |
| **`description`** | `String` | No | No | 0 - 100 caracteres | Descripción de la asignatura (por defecto: `""`) |
| **`area`** | `ObjectId` (Ref: `Area`) | Sí | No | 24 caracteres | Referencia al área curricular a la que pertenece |
| **`weeklyHours`** | `Number` | Sí | No | >= 1 | Horas lectivas semanales (ej: `5`) |
| **`enabled`** | `Boolean` | No | No | - | Estado activo/inactivo (por defecto: `true`) |

---

### Colección: `sections`
| Campo | Tipo | Requerido | Unicidad | Longitud / Rango | Formato / Ejemplo |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **`id`** | `String` (ObjectId) | Sí | Sí | 24 caracteres | Autogenerado único (ej: `6ad07679491380faad49a522`) |
| **`code`** | `String` | Sí | Sí | 7 caracteres exactos | `SEC-001`, `SEC-002`... (autogenerado con prefijo `SEC` si no se envía) |
| **`name`** | `String` | Sí | Sí | 1 - 3 letras mayúsculas | Letras del alfabeto o combinaciones: `"A"`, `"B"`, `"AA"`, `"AB"`, `"ABC"` |
| **`description`** | `String` | No | No | 0 - 100 caracteres | Descripción descriptiva (ej: `"Sección A"`, `"Sección AA"`) |
| **`enabled`** | `Boolean` | No | No | - | Estado activo/inactivo (por defecto: `true`) |

---

### Colección: `classrooms`
| Campo | Tipo | Requerido | Unicidad | Longitud / Rango | Formato / Ejemplo |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **`id`** | `String` (ObjectId) | Sí | Sí | 24 caracteres | Autogenerado único (ej: `6ad07828010418dcbee61d28`) |
| **`code`** | `String` | Sí | Sí | 7 caracteres exactos | `AUL-001`, `AUL-002`... (autogenerado con prefijo `AUL` si no se envía) |
| **`name`** | `String` | Sí | Sí | 3 dígitos exactos (`/^\d{3}$/`) | Número del aula: `"101"`, `"102"`, `"201"`, `"202"`, `"301"` (el 1° dígito indica el piso) |
| **`capacity`** | `Number` | Sí | No | Entero $\ge 1$ | Capacidad o aforo de alumnos (ej: `35`) |
| **`description`** | `String` | No | No | 0 - 100 caracteres | Descripción del aula (ej: `"Aula 101 con proyector"`) |
| **`enabled`** | `Boolean` | No | No | - | Estado activo/inactivo (por defecto: `true`) |

---

### Colección: `rules` (Reglas de Negocio / Configuración Atómica)
| Campo | Tipo | Requerido | Unicidad | Descripción | Formato / Ejemplo |
| :--- | :---: | :---: | :---: | :--- | :--- |
| **`id`** | `String` (ObjectId) | Sí | Sí | Identificador de regla | Autogenerado único (ej: `6ad07b03f4b731851d842c20`) |
| **`code`** | `String` | Sí | Sí | 7 caracteres exactos | `RUL-001`, `RUL-002`... (autogenerado con prefijo `RUL`) |
| **`key`** | `String` | Sí | Sí | Clave única de la regla | `"SHIFTS"`, `"DEFAULT_ENROLLMENT_CAPACITY"`, `"MAX_WEEKLY_HOURS"` |
| **`name`** | `String` | Sí | No | Nombre descriptivo legible | `"Turnos Escolares"`, `"Capacidad de Matrículas por Aula por Defecto"`, `"Máximo de Horas Semanales por Grado"` |
| **`description`** | `String` | No | No | Explicación del parámetro | Texto explicativo (hasta 200 caracteres) |
| **`isAnnual`** | `Boolean` | No | No | Si la regla varía por año lectivo | `true` (versión por año `[{ year, value }]`) o `false` (global) |
| **`dataType`** | `String` | Sí | No | Tipo de dato del valor | `"STRING"`, `"NUMBER"`, `"BOOLEAN"`, `"ARRAY"`, `"ARRAY_OBJECT"` |
| **`value`** | `Mixed` | Sí | No | Valor o historial anual | `[{ year: "2026", value: 40 }]`, `"2026"`, etc. |
| **`enabled`** | `Boolean` | No | No | Estado de la regla | `true` por defecto |
* **Resolución dinámica en respuestas GET:** La API calcula y adjunta automáticamente `activeYear` (ej: `"2026"`) y `currentValue` (el valor resuelto para dicho año lectivo), evitando que el frontend en Angular tenga que iterar o filtrar arrays de años.

---

### Colección: `academic_years` (Periodos Escolares / Ciclo de Vida del Año)
| Campo | Tipo | Requerido | Unicidad | Descripción | Formato / Ejemplo |
| :--- | :---: | :---: | :---: | :--- | :--- |
| **`id`** | `String` (ObjectId) | Sí | Sí | Identificador de año lectivo | Autogenerado único (ej: `6ad0868b421bca86cba06fb9`) |
| **`code`** | `String` | Sí | Sí | 7 caracteres exactos | `AYE-001`, `AYE-002`... (autogenerado con prefijo `AYE`) |
| **`year`** | `String` | Sí | Sí | Año de 4 dígitos | `"2025"`, `"2026"`, `"2027"` |
| **`name`** | `String` | Sí | No | Nombre descriptivo | `"Año Escolar 2026"` |
| **`startDate`** | `Date` | Sí | No | Inicio del ciclo escolar | `2026-03-02T00:00:00.000Z` |
| **`endDate`** | `Date` | Sí | No | Fin del ciclo escolar | `2026-12-18T23:59:59.000Z` |
| **`status`** | `String` | Sí | No | Estado de ciclo de vida | `"PLANIFICACION"`, `"ACTIVO"`, `"CERRADO"` |
| **`closedAt`** | `Date` | No | No | Fecha de cierre formal | `2025-12-31T23:59:59.000Z` o `null` |
| **`enabled`** | `Boolean` | No | No | Estado activo/inactivo | `true` por defecto |
* **Reglas de Inmutabilidad y Auditoría:**
  * Solo puede existir **un único año en estado `ACTIVO`** a la vez. Al activarse, sincroniza automáticamente la regla maestra `CURRENT_ACADEMIC_YEAR`.
  * Un año con estado **`CERRADO` es inmutable**: no puede reabrirse jamás y bloquea la apertura o edición de salones (`grade_sections`) y materias (`grade_subjects`) asociadas a él (devuelve `403 Forbidden`).

---

### Colección: `grade_sections` (Tabla Intermedia: Salones Escolares)
| Campo | Tipo | Requerido | Unicidad | Formato / Ejemplo |
| :--- | :---: | :---: | :---: | :--- |
| **`id`** | `String` (ObjectId) | Sí | Sí | Autogenerado único (ej: `6ad07d259ce62560770813e5`) |
| **`code`** | `String` | Sí | Sí (7 caracteres) | `GSE-001`, `GSE-002`... (autogenerado con prefijo `GSE`) |
| **`grade`** | `ObjectId` (Ref: `Grade`) | Sí | No | Referencia al grado escolar (ej: `1° de Secundaria`) |
| **`section`** | `ObjectId` (Ref: `Section`) | Sí | No | Referencia a la sección (ej: `A`) |
| **`classroom`** | `ObjectId` (Ref: `Classroom`) | Sí | No | Referencia al aula física asignada (ej: `101`) |
| **`academicYear`** | `String` | Sí | No | Año lectivo de 4 dígitos (ej: `"2026"`, defaults a `rules.CURRENT_ACADEMIC_YEAR`) |
| **`shift`** | `String` | Sí | No | Turno: `"MAÑANA"` o `"TARDE"` (valida contra `rules.SHIFTS`) |
| **`maxCapacity`** | `Number` | Sí | No | Vacantes de matrícula $\ge 1$ (defaults a `rules.DEFAULT_ENROLLMENT_CAPACITY`) |
| **`enrolledStudents`** | `Number` | No | No | Cantidad de alumnos matriculados (default `0`) |
| **`enabled`** | `Boolean` | No | No | Estado activo/inactivo (por defecto: `true`) |
* **Índices únicos compuestos:** `(grade, section, academicYear)` y `(classroom, shift, academicYear)`.

---

### Colección: `grade_subjects` (Malla Curricular por Grado Escolar)
| Campo | Tipo | Requerido | Unicidad | Formato / Ejemplo |
| :--- | :---: | :---: | :---: | :--- |
| **`id`** | `String` (ObjectId) | Sí | Sí | Autogenerado único (ej: `6ad081a2f4...`) |
| **`code`** | `String` | Sí | Sí (7 caracteres) | `GSB-001`, `GSB-002`... (autogenerado con prefijo `GSB`) |
| **`grade`** | `ObjectId` (Ref: `Grade`) | Sí | No | Referencia al grado escolar (ej: `1° de Secundaria`) |
| **`subject`** | `ObjectId` (Ref: `Subject`) | Sí | No | Referencia a la materia curricular (ej: `Matemática`) |
| **`academicYear`** | `String` | Sí | No | Año lectivo de 4 dígitos (ej: `"2026"`, defaults a `rules.CURRENT_ACADEMIC_YEAR`) |
| **`weeklyHours`** | `Number` | Sí | No | Horas semanales $\ge 1$ (defaults a `subject.weeklyHours`) |
| **`enabled`** | `Boolean` | No | No | Estado activo/inactivo (por defecto: `true`) |
* **Índice único compuesto:** `(grade, subject, academicYear)`.
* **Regla de Negocio:** La suma de horas semanales por grado en un año lectivo no puede exceder el límite normado en `rules.MAX_WEEKLY_HOURS` (40 horas semanales).

---

## 📡 2. Tabla de Endpoints de Áreas Curriculares (`/api/areas`)

| # | Acción | Método | Endpoint | Body de Ejemplo | Respuesta Exitosa |
| :-: | :--- | :-: | :--- | :--- | :--- |
| **1** | **Listar todas** | `GET` | `/api/areas` | *Ninguno* | `200 OK` (Array con las 5 áreas) |
| **2** | **Listar por ID o Código** | `GET` | `/api/areas/:id` *(o `/api/areas/CIE-001`)* | *Ninguno* | `200 OK` (Objeto área) |
| **3** | **Crear** | `POST` | `/api/areas` | `{ "name": "Robótica", "description": "Taller de robótica" }` | `201 Created` (Autogenera `ROB-001`, `enabled: true`) |
| **4** | **Editar** | `PUT` | `/api/areas/:id` | `{ "description": "Actualizada", "enabled": false }` | `200 OK` |

---

## 📡 3. Tabla de Endpoints de Niveles (`/api/levels`)

| # | Acción | Método | Endpoint | Body de Ejemplo | Respuesta Exitosa |
| :-: | :--- | :-: | :--- | :--- | :--- |
| **1** | **Listar todos** | `GET` | `/api/levels` | *Ninguno* | `200 OK` (Array con los 3 niveles) |
| **2** | **Listar por ID** | `GET` | `/api/levels/:id` | *Ninguno* | `200 OK` (Objeto nivel) |
| **3** | **Crear** | `POST` | `/api/levels` | `{ "name": "Superior", "description": "Nivel Superior" }` | `201 Created` (Autogenera `SUP-001`, `enabled: true`) |
| **4** | **Editar** | `PUT` | `/api/levels/:id` | `{ "description": "Actualizada", "enabled": false }` | `200 OK` |

---

## 📡 4. Tabla de Endpoints de Grados (`/api/grades`)

| # | Acción | Método | Endpoint | Body de Ejemplo | Respuesta Exitosa |
| :-: | :--- | :-: | :--- | :--- | :--- |
| **1** | **Listar todos** | `GET` | `/api/grades` | *Ninguno* | `200 OK` (Array con los 5 grados de Secundaria ordenados por `name`) |
| **2** | **Listar por ID** | `GET` | `/api/grades/:id` | *Ninguno* | `200 OK` (Objeto con `level` poblado) |
| **3** | **Crear** | `POST` | `/api/grades` | `{ "name": 6, "description": "6° de Primaria", "level": "..." }` | `201 Created` (Autogenera `GRA-006`, `enabled: true`) |
| **4** | **Editar** | `PUT` | `/api/grades/:id` | `{ "description": "Actualizada" }` | `200 OK` |

---

## 📡 5. Tabla de Endpoints de Asignaturas (`/api/subjects`)

| # | Acción | Método | Endpoint | Body de Ejemplo | Comportamiento |
| :-: | :--- | :-: | :--- | :--- | :--- |
| **1** | **Listar todas** | `GET` | `/api/subjects` | *Ninguno* | `200 OK` (Array con `area` poblado completo) |
| **2** | **Listar por ID** | `GET` | `/api/subjects/:id` | *Ninguno* | `200 OK` (Objeto con `area` poblado completo) |
| **3** | **Crear (Autogenerado)** | `POST` | `/api/subjects` | `{ "name": "Física", "area": "...", "weeklyHours": 4 }` | `201 Created` (Autogenera `FIS-001`, `enabled: true`) |
| **4** | **Crear (Código manual)** | `POST` | `/api/subjects` | `{ "code": "HUM-002", "name": "Filosofía", "area": "...", "weeklyHours": 3 }` | `201 Created` (Valida formato y unicidad) |
| **5** | **Editar** | `PUT` | `/api/subjects/:id` | `{ "weeklyHours": 6, "enabled": false }` | `200 OK` (Actualiza solo lo enviado) |

---

## 📡 6. Tabla de Endpoints de Secciones (`/api/sections`)

| # | Acción | Método | Endpoint | Body de Ejemplo | Respuesta Exitosa |
| :-: | :--- | :-: | :--- | :--- | :--- |
| **1** | **Listar todas** | `GET` | `/api/sections` | *Ninguno* | `200 OK` (Array con las secciones ordenadas por `name`) |
| **2** | **Listar por ID** | `GET` | `/api/sections/:id` | *Ninguno* | `200 OK` (Objeto sección) |
| **3** | **Crear** | `POST` | `/api/sections` | `{ "name": "AA", "description": "Sección AA" }` | `201 Created` (Autogenera `SEC-007`, `enabled: true`) |
| **4** | **Editar** | `PUT` | `/api/sections/:id` | `{ "description": "Actualizada", "enabled": false }` | `200 OK` |

---

## 📡 7. Tabla de Endpoints de Aulas (`/api/classrooms`)

| # | Acción | Método | Endpoint | Body de Ejemplo | Respuesta Exitosa |
| :-: | :--- | :-: | :--- | :--- | :--- |
| **1** | **Listar todas** | `GET` | `/api/classrooms` | *Ninguno* | `200 OK` (Array con las aulas ordenadas por `name`) |
| **2** | **Listar por ID** | `GET` | `/api/classrooms/:id` | *Ninguno* | `200 OK` (Objeto aula) |
| **3** | **Crear** | `POST` | `/api/classrooms` | `{ "name": "203", "capacity": 35, "description": "Aula 203" }` | `201 Created` (Autogenera `AUL-007`, `enabled: true`) |
| **4** | **Editar** | `PUT` | `/api/classrooms/:id` | `{ "capacity": 40, "description": "Actualizada" }` | `200 OK` |

---

## 📡 8. Tabla de Endpoints de Reglas (`/api/rules`)

| # | Acción | Método | Endpoint | Body de Ejemplo | Respuesta Exitosa |
| :-: | :--- | :-: | :--- | :--- | :--- |
| **1** | **Listar todas** | `GET` | `/api/rules` | *Ninguno* | `200 OK` (Array con las 3 reglas de negocio con `currentValue` resuelto) |
| **2** | **Obtener por ID o KEY** | `GET` | `/api/rules/:id` *(o `/api/rules/MAX_WEEKLY_HOURS`)* | *Ninguno* | `200 OK` (Objeto regla con valor activo vigente) |
| **3** | **Crear regla** | `POST` | `/api/rules` | `{ "key": "MIN_PASSING_GRADE", "name": "Nota Mínima Aprobatoria", "dataType": "NUMBER", "value": 11 }` | `201 Created` (Autogenera `RUL-004`, `enabled: true`) |
| **4** | **Editar regla** | `PUT` | `/api/rules/:id` *(o `/api/rules/MAX_WEEKLY_HOURS`)* | `{ "value": [{ "year": "2026", "value": 40 }] }` | `200 OK` (Actualiza el valor de la regla) |

---

## 📡 9. Tabla de Endpoints de Años Lectivos (`/api/academic-years`)

| # | Acción | Método | Endpoint | Body de Ejemplo | Respuesta Exitosa |
| :-: | :--- | :-: | :--- | :--- | :--- |
| **1** | **Listar todos** | `GET` | `/api/academic-years` *(soporta `?status=ACTIVO&enabled=true`)* | *Ninguno* | `200 OK` (Array con los años ordenados descendentemente) |
| **2** | **Obtener por ID o Año** | `GET` | `/api/academic-years/:id` *(acepta ID, código `AYE-002` o año `2026`)* | *Ninguno* | `200 OK` (Objeto año lectivo) |
| **3** | **Crear / Aperturar** | `POST` | `/api/academic-years` | `{ "year": "2028", "startDate": "2028-03-01", "endDate": "2028-12-20", "status": "PLANIFICACION" }` | `201 Created` (Autogenera `AYE-004`) |
| **4** | **Gestionar Estado** | `PUT` | `/api/academic-years/:id` | `{ "status": "CERRADO" }` o `{ "status": "ACTIVO" }` | `200 OK` (Valida transición, bloquea si ya está cerrado y sella `closedAt`) |

---

## 📡 10. Tabla de Endpoints de Salones Escolar (`/api/grade-sections`)

| # | Acción | Método | Endpoint | Body de Ejemplo | Respuesta Exitosa |
| :-: | :--- | :-: | :--- | :--- | :--- |
| **1** | **Listar todos** | `GET` | `/api/grade-sections` | *Ninguno* | `200 OK` (Array con los 10 salones con `grade`, `section` y `classroom` poblados) |
| **2** | **Listar por ID** | `GET` | `/api/grade-sections/:id` | *Ninguno* | `200 OK` (Objeto salón poblado completo) |
| **3** | **Crear salón** | `POST` | `/api/grade-sections` | `{ "grade": "...", "section": "...", "classroom": "...", "shift": "MAÑANA" }` | `201 Created` (Autogenera `GSE-011`, auto-asigna año y vacantes) |
| **4** | **Editar salón** | `PUT` | `/api/grade-sections/:id` | `{ "classroom": "...", "maxCapacity": 28 }` | `200 OK` (Revalida colisiones y aforos) |

---

## 📡 11. Tabla de Endpoints de Malla Curricular (`/api/grade-subjects`)

| # | Acción | Método | Endpoint | Body de Ejemplo | Respuesta Exitosa |
| :-: | :--- | :-: | :--- | :--- | :--- |
| **1** | **Listar malla** | `GET` | `/api/grade-subjects` *(soporta `?grade=...&academicYear=2026`)* | *Ninguno* | `200 OK` (Array con las 35 asignaciones curriculares pobladas) |
| **2** | **Listar por ID** | `GET` | `/api/grade-subjects/:id` | *Ninguno* | `200 OK` (Objeto de asignación curricular) |
| **3** | **Asignar materia** | `POST` | `/api/grade-subjects` | `{ "grade": "...", "subject": "...", "weeklyHours": 5 }` | `201 Created` (Valida límite 40h MINEDU y unicidad) |
| **4** | **Editar asignación** | `PUT` | `/api/grade-subjects/:id` | `{ "weeklyHours": 6 }` | `200 OK` (Revalida que no exceda 40h acumuladas) |

---

## 📡 12. Nuevos Endpoints Operativos, Seguridad y Personas (25 Colecciones)

### 🔐 Seguridad & Auth JWT
| Método | Endpoint | Descripción | Body / Parámetros |
| :---: | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Login con credenciales | `{ "email": "root@eduportal.edu.pe", "password": "..." }` |
| `GET` | `/api/auth/me` | Retorna usuario autenticado y árbol dinámico `menuTree` | Bearer Token en header `Authorization` |
| `CRUD` | `/api/menus` | Opciones y árbol de navegación dinámica | - |
| `CRUD` | `/api/profiles` | Perfiles y permisos RBAC | - |
| `CRUD` | `/api/users` | Cuentas de usuario institucionales | - |

### 👥 Padrón Civil & Actores
| Método | Endpoint | Descripción |
| :---: | :--- | :--- |
| `CRUD` | `/api/persons` | Padrón civil universal (DNI único de 8 dígitos) |
| `CRUD` | `/api/positions` | Catálogo de cargos institucionales |
| `CRUD` | `/api/workers` | Trabajadores y personal administrativo |
| `CRUD` | `/api/teachers` | Plana docente con área curricular vinculada |
| `CRUD` | `/api/students` | Alumnos con apoderados vinculados |

### 🎓 Operación Escolar & Transacciones
| Método | Endpoint | Descripción |
| :---: | :--- | :--- |
| `CRUD` | `/api/enrollments` | Matrículas con validación de vacantes y aforo |
| `CRUD` | `/api/teacher-assignments` | Asignación de docente a salón y materia |
| `CRUD` | `/api/schedules` | Horarios semanales por salón |
| `CRUD` | `/api/evaluations` | Notas vigesimales por periodos lectivos |
| `CRUD` | `/api/attendances` | Asistencias diarias de estudiantes |
| `CRUD` | `/api/incidents` | Registro disciplinario e incidencias |
| `CRUD` | `/api/tuition-payments` | Cuotas y pagos de matrículas y pensiones |

---

## ⚡ Comandos

```bash
# Iniciar servidor en modo desarrollo
npm run dev

# Ejecutar comprobación de tipos
npx tsc --noEmit

# Ejecutar suite de pruebas de criterios de aceptación (TDD)
npx tsx --test tests/backend-acceptance-criteria.test.ts
```
