-- ============================================
-- SISTEMA DE GESTIÓN EDUCATIVA - ESQUEMA DE BASE DE DATOS
-- ============================================

-- Tabla de Usuarios (Autenticación)
CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    rol TEXT NOT NULL CHECK(rol IN ('administrador', 'docente', 'estudiante')),
    activo INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Información Institucional
CREATE TABLE IF NOT EXISTS institucion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo_modular TEXT UNIQUE,
    nombre TEXT NOT NULL,
    tipo_ies TEXT,
    dre TEXT,
    direccion TEXT,
    telefono TEXT,
    correo TEXT,
    pagina_web TEXT,
    logo_url TEXT,
    otros TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Periodos Lectivos
CREATE TABLE IF NOT EXISTS periodos_lectivos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE,
    anio INTEGER NOT NULL,
    semestre INTEGER NOT NULL CHECK(semestre IN (1, 2)),
    fecha_inicio DATE,
    fecha_fin DATE,
    activo INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Turnos
CREATE TABLE IF NOT EXISTS turnos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL UNIQUE,
    hora_inicio TIME,
    hora_fin TIME,
    activo INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Programas de Estudio
CREATE TABLE IF NOT EXISTS programas_estudio (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT UNIQUE,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    duracion_ciclos INTEGER DEFAULT 6,
    activo INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Planes de Estudio
CREATE TABLE IF NOT EXISTS planes_estudio (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT UNIQUE,
    nombre TEXT NOT NULL,
    programa_id INTEGER NOT NULL,
    resolucion TEXT,
    fecha_aprobacion DATE,
    activo INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (programa_id) REFERENCES programas_estudio(id)
);

-- Tabla de Unidades Didácticas (Cursos)
CREATE TABLE IF NOT EXISTS unidades_didacticas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    codigo TEXT UNIQUE,
    nombre TEXT NOT NULL,
    plan_estudio_id INTEGER NOT NULL,
    ciclo INTEGER NOT NULL,
    creditos INTEGER DEFAULT 2,
    horas_teoria INTEGER DEFAULT 0,
    horas_practica INTEGER DEFAULT 0,
    tipo TEXT DEFAULT 'obligatorio' CHECK(tipo IN ('obligatorio', 'electivo')),
    activo INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plan_estudio_id) REFERENCES planes_estudio(id)
);

-- Tabla de Docentes
CREATE TABLE IF NOT EXISTS docentes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER UNIQUE,
    dni TEXT UNIQUE NOT NULL,
    nombres TEXT NOT NULL,
    apellido_paterno TEXT NOT NULL,
    apellido_materno TEXT,
    fecha_nacimiento DATE,
    genero TEXT CHECK(genero IN ('M', 'F', 'Otro')),
    direccion TEXT,
    telefono TEXT,
    email TEXT,
    especialidad TEXT,
    grado_academico TEXT,
    condicion TEXT DEFAULT 'contratado' CHECK(condicion IN ('nombrado', 'contratado')),
    fecha_ingreso DATE,
    activo INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabla de Personal No Docente (Administrativos/Jerárquicos)
CREATE TABLE IF NOT EXISTS personal_no_docente (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER UNIQUE,
    dni TEXT UNIQUE NOT NULL,
    nombres TEXT NOT NULL,
    apellido_paterno TEXT NOT NULL,
    apellido_materno TEXT,
    cargo TEXT NOT NULL,
    area TEXT,
    telefono TEXT,
    email TEXT,
    fecha_ingreso DATE,
    activo INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Tabla de Estudiantes
CREATE TABLE IF NOT EXISTS estudiantes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER UNIQUE,
    codigo_estudiante TEXT UNIQUE NOT NULL,
    dni TEXT UNIQUE NOT NULL,
    nombres TEXT NOT NULL,
    apellido_paterno TEXT NOT NULL,
    apellido_materno TEXT,
    fecha_nacimiento DATE,
    genero TEXT CHECK(genero IN ('M', 'F', 'Otro')),
    direccion TEXT,
    telefono TEXT,
    email TEXT,
    programa_id INTEGER,
    plan_estudio_id INTEGER,
    turno_id INTEGER,
    ciclo_actual INTEGER DEFAULT 1,
    estado TEXT DEFAULT 'activo' CHECK(estado IN ('activo', 'egresado', 'retirado', 'suspendido')),
    fecha_ingreso DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (programa_id) REFERENCES programas_estudio(id),
    FOREIGN KEY (plan_estudio_id) REFERENCES planes_estudio(id),
    FOREIGN KEY (turno_id) REFERENCES turnos(id)
);

-- Tabla de Reglas de Promoción
CREATE TABLE IF NOT EXISTS reglas_promocion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    programa_id INTEGER NOT NULL,
    ciclo INTEGER NOT NULL,
    turno_id INTEGER NOT NULL,
    max_matriculados INTEGER NOT NULL,
    periodo_id INTEGER,
    activo INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (programa_id) REFERENCES programas_estudio(id),
    FOREIGN KEY (turno_id) REFERENCES turnos(id),
    FOREIGN KEY (periodo_id) REFERENCES periodos_lectivos(id),
    UNIQUE(programa_id, ciclo, turno_id, periodo_id)
);

-- Tabla de Asignación de Docentes a Unidades Didácticas
CREATE TABLE IF NOT EXISTS docente_unidad (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    docente_id INTEGER NOT NULL,
    unidad_didactica_id INTEGER NOT NULL,
    periodo_id INTEGER NOT NULL,
    turno_id INTEGER NOT NULL,
    seccion TEXT DEFAULT 'A',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (docente_id) REFERENCES docentes(id),
    FOREIGN KEY (unidad_didactica_id) REFERENCES unidades_didacticas(id),
    FOREIGN KEY (periodo_id) REFERENCES periodos_lectivos(id),
    FOREIGN KEY (turno_id) REFERENCES turnos(id),
    UNIQUE(docente_id, unidad_didactica_id, periodo_id, turno_id, seccion)
);

-- Tabla de Horarios Docentes
CREATE TABLE IF NOT EXISTS horarios_docente (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    docente_unidad_id INTEGER NOT NULL,
    dia_semana TEXT NOT NULL CHECK(dia_semana IN ('Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo')),
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    aula TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (docente_unidad_id) REFERENCES docente_unidad(id)
);

-- Tabla de Prematrícula
CREATE TABLE IF NOT EXISTS prematriculas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    estudiante_id INTEGER NOT NULL,
    periodo_id INTEGER NOT NULL,
    fecha_prematricula DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado TEXT DEFAULT 'pendiente' CHECK(estado IN ('pendiente', 'aprobada', 'rechazada')),
    observaciones TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id),
    FOREIGN KEY (periodo_id) REFERENCES periodos_lectivos(id),
    UNIQUE(estudiante_id, periodo_id)
);

-- Tabla de Detalle de Prematrícula
CREATE TABLE IF NOT EXISTS prematricula_detalle (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    prematricula_id INTEGER NOT NULL,
    unidad_didactica_id INTEGER NOT NULL,
    turno_id INTEGER NOT NULL,
    seccion TEXT DEFAULT 'A',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (prematricula_id) REFERENCES prematriculas(id),
    FOREIGN KEY (unidad_didactica_id) REFERENCES unidades_didacticas(id),
    FOREIGN KEY (turno_id) REFERENCES turnos(id)
);

-- Tabla de Matrículas Oficiales
CREATE TABLE IF NOT EXISTS matriculas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    estudiante_id INTEGER NOT NULL,
    periodo_id INTEGER NOT NULL,
    codigo_matricula TEXT UNIQUE,
    fecha_matricula DATETIME DEFAULT CURRENT_TIMESTAMP,
    ciclo INTEGER NOT NULL,
    turno_id INTEGER,
    condicion TEXT DEFAULT 'regular' CHECK(condicion IN ('regular', 'irregular', 'repitente')),
    estado TEXT DEFAULT 'activa' CHECK(estado IN ('activa', 'anulada', 'finalizada')),
    observaciones TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id),
    FOREIGN KEY (periodo_id) REFERENCES periodos_lectivos(id),
    FOREIGN KEY (turno_id) REFERENCES turnos(id),
    UNIQUE(estudiante_id, periodo_id)
);

-- Tabla de Detalle de Matrícula
CREATE TABLE IF NOT EXISTS matricula_detalle (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    matricula_id INTEGER NOT NULL,
    unidad_didactica_id INTEGER NOT NULL,
    docente_unidad_id INTEGER,
    numero_vez INTEGER DEFAULT 1,
    estado TEXT DEFAULT 'cursando' CHECK(estado IN ('cursando', 'aprobado', 'desaprobado', 'retirado', 'NSP')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (matricula_id) REFERENCES matriculas(id),
    FOREIGN KEY (unidad_didactica_id) REFERENCES unidades_didacticas(id),
    FOREIGN KEY (docente_unidad_id) REFERENCES docente_unidad(id)
);

-- Tabla de Criterios de Evaluación
CREATE TABLE IF NOT EXISTS criterios_evaluacion (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    docente_unidad_id INTEGER NOT NULL,
    nombre TEXT NOT NULL,
    peso REAL DEFAULT 1.0,
    orden INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (docente_unidad_id) REFERENCES docente_unidad(id)
);

-- Tabla de Notas/Calificaciones
CREATE TABLE IF NOT EXISTS notas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    matricula_detalle_id INTEGER NOT NULL,
    criterio_id INTEGER,
    nota REAL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
    registrado_por INTEGER,
    observaciones TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (matricula_detalle_id) REFERENCES matricula_detalle(id),
    FOREIGN KEY (criterio_id) REFERENCES criterios_evaluacion(id),
    FOREIGN KEY (registrado_por) REFERENCES usuarios(id)
);

-- Tabla de Notas Finales
CREATE TABLE IF NOT EXISTS notas_finales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    matricula_detalle_id INTEGER UNIQUE NOT NULL,
    nota_final REAL,
    estado TEXT CHECK(estado IN ('aprobado', 'desaprobado', 'NSP')),
    fecha_cierre DATETIME,
    cerrado_por INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (matricula_detalle_id) REFERENCES matricula_detalle(id),
    FOREIGN KEY (cerrado_por) REFERENCES usuarios(id)
);

-- Tabla de Actas de Notas
CREATE TABLE IF NOT EXISTS actas_notas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    docente_unidad_id INTEGER NOT NULL,
    codigo_acta TEXT UNIQUE,
    fecha_generacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado TEXT DEFAULT 'borrador' CHECK(estado IN ('borrador', 'cerrada', 'anulada')),
    generado_por INTEGER,
    observaciones TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (docente_unidad_id) REFERENCES docente_unidad(id),
    FOREIGN KEY (generado_por) REFERENCES usuarios(id)
);

-- Tabla de Certificados
CREATE TABLE IF NOT EXISTS certificados (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    estudiante_id INTEGER NOT NULL,
    tipo TEXT NOT NULL CHECK(tipo IN ('estudios', 'notas', 'egreso', 'titulo')),
    codigo TEXT UNIQUE,
    fecha_emision DATE DEFAULT CURRENT_DATE,
    estado TEXT DEFAULT 'emitido' CHECK(estado IN ('emitido', 'anulado')),
    emitido_por INTEGER,
    observaciones TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (estudiante_id) REFERENCES estudiantes(id),
    FOREIGN KEY (emitido_por) REFERENCES usuarios(id)
);

-- Tabla de Auditoría
CREATE TABLE IF NOT EXISTS auditoria (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER,
    tabla TEXT NOT NULL,
    registro_id INTEGER,
    accion TEXT NOT NULL CHECK(accion IN ('INSERT', 'UPDATE', 'DELETE')),
    datos_anteriores TEXT,
    datos_nuevos TEXT,
    ip TEXT,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_estudiantes_programa ON estudiantes(programa_id);
CREATE INDEX IF NOT EXISTS idx_estudiantes_plan ON estudiantes(plan_estudio_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_estudiante ON matriculas(estudiante_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_periodo ON matriculas(periodo_id);
CREATE INDEX IF NOT EXISTS idx_notas_matricula ON notas(matricula_detalle_id);
CREATE INDEX IF NOT EXISTS idx_docente_unidad_periodo ON docente_unidad(periodo_id);
