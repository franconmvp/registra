# Sistema de Gestión Educativa

Sistema integral para la gestión de instituciones educativas superiores, desarrollado con Node.js/Express (Backend) y React/Vite (Frontend).

## 🎓 Características

### Autenticación y Roles
- Inicio de sesión seguro con JWT
- Tres tipos de roles: **Administrador**, **Docente** y **Estudiante**
- Control de acceso basado en roles

### Módulo Administrador

#### Gestión Institucional
- Información general de la institución (Código Modular, Nombre, Tipo de IES, DRE, etc.)
- Periodos lectivos (2026-I, 2026-II, etc.)
- Turnos (Mañana, Tarde, Noche)
- Programas de estudio
- Planes de estudio
- Unidades didácticas
- Reglas de promoción (máximo de matriculados por ciclo y turno)

#### Gestión de Estudiantes
- Registro y actualización de datos personales
- Visualización del perfil del estudiante
- Historial académico

#### Gestión de Docentes
- Registro de personal docente
- Asignación de cursos/unidades didácticas
- Gestión de horarios

#### Matrícula
- Prematrícula
- Matrícula oficial en unidades didácticas
- Validación de reglas de promoción

#### Notas y Evaluaciones
- Ingreso de calificaciones por docente
- Generación de actas
- Reportes oficiales

#### Reportes Académicos
- Reporte de matrícula semestral
- Reporte de notas por periodo
- Certificados de estudios
- Constancias de matrícula

### Módulo Docente
- Visualización de unidades asignadas
- Registro de notas por periodo
- Cierre de actas

### Módulo Estudiante
- Visualización de perfil (solo lectura)
- Historial académico con notas
- Fichas de matrícula

## 🚀 Instalación

### Requisitos
- Node.js 18+
- npm o yarn

### Backend

```bash
cd backend
npm install
npm run init-db  # Inicializa la base de datos
npm start        # Inicia el servidor en http://localhost:3000
```

### Frontend

```bash
cd frontend
npm install
npm run dev      # Inicia en http://localhost:5173
```

## 🔐 Credenciales por Defecto

```
Email: admin@ies.edu.pe
Contraseña: admin123
```

## 📁 Estructura del Proyecto

```
├── backend/
│   ├── src/
│   │   ├── config/         # Configuración
│   │   ├── controllers/    # Controladores API
│   │   ├── database/       # Esquema y conexión BD
│   │   ├── middleware/     # Auth y manejo de errores
│   │   ├── routes/         # Rutas API
│   │   └── server.js       # Punto de entrada
│   ├── data/               # Base de datos SQLite
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── context/        # Contextos (Auth)
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Páginas por rol
│   │   ├── services/       # Servicios API
│   │   └── App.jsx
│   ├── index.html
│   └── package.json
│
└── README.md
```

## 🎨 Diseño

Los colores de la interfaz están basados en el logo institucional:
- **Azul Marino (Primary):** `#1e3a5f`
- **Dorado (Secondary):** `#d4a84b`

## 💾 Base de Datos

El sistema utiliza SQLite como base de datos. El esquema incluye las siguientes tablas:

- `usuarios` - Autenticación y roles
- `institucion` - Información institucional
- `periodos_lectivos` - Periodos académicos
- `turnos` - Turnos de estudio
- `programas_estudio` - Carreras/Programas
- `planes_estudio` - Planes curriculares
- `unidades_didacticas` - Cursos/Asignaturas
- `docentes` - Personal docente
- `personal_no_docente` - Administrativos
- `estudiantes` - Alumnos
- `reglas_promocion` - Límites de matrícula
- `docente_unidad` - Asignación docente-curso
- `horarios_docente` - Horarios
- `prematriculas` - Prematrículas
- `matriculas` - Matrículas oficiales
- `matricula_detalle` - Cursos matriculados
- `criterios_evaluacion` - Criterios de notas
- `notas` - Calificaciones parciales
- `notas_finales` - Notas finales
- `actas_notas` - Actas de notas
- `certificados` - Certificados emitidos
- `auditoria` - Log de cambios

## 📝 API Endpoints

La documentación completa de los endpoints está disponible en el README del backend.

## 🔧 Tecnologías

### Backend
- Node.js
- Express.js
- SQLite (better-sqlite3)
- JWT (jsonwebtoken)
- bcryptjs

### Frontend
- React 18
- React Router DOM
- Vite
- Tailwind CSS
- Axios
- Recharts
- Lucide React Icons

## 📄 Licencia

ISC
