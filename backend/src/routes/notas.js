import { Router } from 'express';
import * as notasController from '../controllers/notasController.js';
import { authenticate, adminOnly, docenteOnly, adminOrDocente } from '../middleware/auth.js';

const router = Router();

// Rutas para docente
router.get('/mis-unidades', authenticate, docenteOnly, notasController.getMisUnidadesNotas);

// Gestión de notas (docente o admin)
router.get('/asignacion/:docente_unidad_id/estudiantes', authenticate, adminOrDocente, notasController.getEstudiantesAsignacion);
router.get('/asignacion/:docente_unidad_id/criterios', authenticate, adminOrDocente, notasController.getCriteriosEvaluacion);
router.post('/asignacion/:docente_unidad_id/criterios', authenticate, adminOrDocente, notasController.saveCriterios);

router.get('/estudiante/:matricula_detalle_id', authenticate, adminOrDocente, notasController.getNotasEstudiante);
router.post('/registrar', authenticate, adminOrDocente, notasController.registrarNota);
router.post('/registrar-lote', authenticate, adminOrDocente, notasController.registrarNotasLote);
router.post('/calcular-final/:matricula_detalle_id', authenticate, adminOrDocente, notasController.calcularNotaFinal);
router.post('/cerrar/:docente_unidad_id', authenticate, adminOrDocente, notasController.cerrarNotas);

// Actas
router.get('/actas', authenticate, adminOnly, notasController.getActas);
router.get('/actas/:id', authenticate, adminOrDocente, notasController.getActaDetalle);

export default router;
