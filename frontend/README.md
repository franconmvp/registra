# Sistema de Gestión Educativa - Frontend

Aplicación web desarrollada con React, Vite y Tailwind CSS.

## Requisitos

- Node.js 18+
- npm o yarn

## Instalación

```bash
cd frontend
npm install
```

## Desarrollo

```bash
npm run dev
```

La aplicación se abrirá en `http://localhost:5173`

## Construcción

```bash
npm run build
```

Los archivos compilados se generarán en la carpeta `dist/`

## Estructura del Proyecto

```
frontend/
├── src/
│   ├── components/     # Componentes reutilizables
│   ├── context/        # Contextos de React (Auth)
│   ├── hooks/          # Custom hooks
│   ├── pages/          # Páginas de la aplicación
│   │   ├── admin/      # Páginas del administrador
│   │   ├── docente/    # Páginas del docente
│   │   └── estudiante/ # Páginas del estudiante
│   ├── services/       # Servicios API
│   ├── App.jsx         # Componente principal
│   ├── main.jsx        # Punto de entrada
│   └── index.css       # Estilos globales
├── public/             # Archivos estáticos
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## Colores del Tema

Los colores están basados en el logo institucional:

- **Primary (Azul Marino):** `#1e3a5f`
- **Secondary (Dorado):** `#d4a84b`

## Roles de Usuario

### Administrador
- Dashboard con estadísticas
- Gestión de información institucional
- Gestión de periodos lectivos
- Gestión de programas y planes de estudio
- Gestión de estudiantes
- Gestión de docentes y asignaciones
- Gestión de matrículas
- Gestión de usuarios
- Reportes

### Docente
- Dashboard personal
- Vista de unidades asignadas
- Registro de notas
- Cierre de actas

### Estudiante
- Dashboard personal
- Visualización de perfil (solo lectura)
- Historial académico con notas
- Fichas de matrícula

## Autenticación

El sistema utiliza JWT (JSON Web Tokens) para la autenticación.
El token se almacena en localStorage.

## Credenciales por Defecto

```
Email: admin@ies.edu.pe
Contraseña: admin123
```
