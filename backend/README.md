# Sistema de Gestión Educativa - Backend

API REST para el Sistema de Gestión Educativa desarrollado con Node.js, Express y SQLite.

## Requisitos

- Node.js 18+
- npm o yarn

## Instalación

```bash
cd backend
npm install
```

## Inicializar Base de Datos

```bash
npm run init-db
```

Esto creará la base de datos con:
- Usuario administrador por defecto: `admin@ies.edu.pe` / `admin123`
- Datos de ejemplo (turnos, periodos, programas)

## Ejecutar el Servidor

```bash
npm start
```

El servidor se iniciará en `http://localhost:3000`

## Estructura del Proyecto

```
backend/
├── src/
│   ├── config/          # Configuración
│   ├── controllers/     # Controladores de la API
│   ├── database/        # Esquema y conexión a BD
│   ├── middleware/      # Middlewares (auth, errores)
│   ├── routes/          # Rutas de la API
│   └── server.js        # Punto de entrada
├── data/                # Base de datos SQLite
├── .env                 # Variables de entorno
└── package.json
```

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil
- `PUT /api/auth/change-password` - Cambiar contraseña
- `POST /api/auth/users` - Crear usuario (admin)
- `GET /api/auth/users` - Listar usuarios (admin)

### Institución
- `GET /api/institucion` - Información institucional
- `PUT /api/institucion` - Actualizar información
- `GET/POST/PUT /api/institucion/periodos` - Periodos lectivos
- `GET/POST/PUT /api/institucion/turnos` - Turnos
- `GET/POST/PUT /api/institucion/programas` - Programas de estudio
- `GET/POST/PUT /api/institucion/planes` - Planes de estudio
- `GET/POST/PUT /api/institucion/unidades` - Unidades didácticas
- `GET/POST/PUT/DELETE /api/institucion/reglas-promocion` - Reglas de promoción

### Estudiantes
- `GET /api/estudiantes` - Listar estudiantes
- `POST /api/estudiantes` - Crear estudiante
- `GET /api/estudiantes/:id` - Obtener estudiante
- `PUT /api/estudiantes/:id` - Actualizar estudiante
- `GET /api/estudiantes/:id/historial` - Historial académico
- `GET /api/estudiantes/mi/perfil` - Mi perfil (estudiante)
- `GET /api/estudiantes/mi/historial` - Mi historial (estudiante)
- `GET /api/estudiantes/mi/matriculas` - Mis matrículas (estudiante)

### Docentes
- `GET /api/docentes` - Listar docentes
- `POST /api/docentes` - Crear docente
- `GET/PUT /api/docentes/:id` - Gestionar docente
- `GET/POST/DELETE /api/docentes/asignaciones` - Asignaciones
- `GET/POST/PUT/DELETE /api/docentes/horarios` - Horarios
- `GET /api/docentes/mi/asignaciones` - Mis asignaciones (docente)

### Matrícula
- `GET/POST /api/matricula/prematriculas` - Prematrículas
- `GET /api/matricula` - Listar matrículas
- `POST /api/matricula` - Crear matrícula
- `GET /api/matricula/:id` - Detalle de matrícula
- `GET /api/matricula/estadisticas` - Estadísticas

### Notas
- `GET /api/notas/mis-unidades` - Mis unidades (docente)
- `GET /api/notas/asignacion/:id/estudiantes` - Estudiantes de asignación
- `POST /api/notas/registrar` - Registrar nota
- `POST /api/notas/calcular-final/:id` - Calcular nota final
- `POST /api/notas/cerrar/:id` - Cerrar notas (generar acta)
- `GET /api/notas/actas` - Listar actas

### Reportes
- `GET /api/reportes/dashboard` - Dashboard
- `GET /api/reportes/matricula-semestral` - Reporte de matrícula
- `GET /api/reportes/notas-periodo` - Reporte de notas
- `POST /api/reportes/certificado-estudios/:id` - Generar certificado

## Roles

- **Administrador**: Acceso completo a todas las funcionalidades
- **Docente**: Registro y reporte de notas por periodo
- **Estudiante**: Visualización de perfil, historial y fichas de matrícula

## Autenticación

La API utiliza JWT (JSON Web Tokens). Incluir el token en el header:

```
Authorization: Bearer <token>
```
