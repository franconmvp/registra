import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import config from './config/index.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Importar rutas
import authRoutes from './routes/auth.js';
import institucionRoutes from './routes/institucion.js';
import estudiantesRoutes from './routes/estudiantes.js';
import docentesRoutes from './routes/docentes.js';
import matriculaRoutes from './routes/matricula.js';
import notasRoutes from './routes/notas.js';
import reportesRoutes from './routes/reportes.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta de health check
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Sistema de Gestión Educativa - API funcionando',
        timestamp: new Date().toISOString()
    });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/institucion', institucionRoutes);
app.use('/api/estudiantes', estudiantesRoutes);
app.use('/api/docentes', docentesRoutes);
app.use('/api/matricula', matriculaRoutes);
app.use('/api/notas', notasRoutes);
app.use('/api/reportes', reportesRoutes);

// Manejo de errores
app.use(notFound);
app.use(errorHandler);

// Iniciar servidor
const PORT = config.port;
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════════════════════════╗
║     SISTEMA DE GESTIÓN EDUCATIVA - Backend                 ║
╠════════════════════════════════════════════════════════════╣
║  Servidor iniciado en: http://localhost:${PORT}              ║
║  API Base URL: http://localhost:${PORT}/api                  ║
╚════════════════════════════════════════════════════════════╝
    `);
});

export default app;
