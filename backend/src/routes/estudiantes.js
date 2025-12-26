import { Router } from 'express';
import * as estudiantesController from '../controllers/estudiantesController.js';
import { authenticate, adminOnly, estudianteOnly } from '../middleware/auth.js';

const router = Router();

// Rutas para administrador
router.get('/', authenticate, adminOnly, estudiantesController.getEstudiantes);
router.get('/:id', authenticate, adminOnly, estudiantesController.getEstudiante);
router.post('/', authenticate, adminOnly, estudiantesController.createEstudiante);
router.put('/:id', authenticate, adminOnly, estudiantesController.updateEstudiante);
router.get('/:id/historial', authenticate, adminOnly, estudiantesController.getHistorialAcademico);

// Rutas para estudiante logueado
router.get('/mi/perfil', authenticate, estudianteOnly, estudiantesController.getMiPerfil);
router.get('/mi/historial', authenticate, estudianteOnly, estudiantesController.getMiHistorial);
router.get('/mi/matriculas', authenticate, estudianteOnly, estudiantesController.getMisMatriculas);

export default router;
