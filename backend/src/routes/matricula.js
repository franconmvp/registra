import { Router } from 'express';
import * as matriculaController from '../controllers/matriculaController.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = Router();

// Prematrículas
router.get('/prematriculas', authenticate, adminOnly, matriculaController.getPrematriculas);
router.get('/prematriculas/:id', authenticate, adminOnly, matriculaController.getPrematricula);
router.post('/prematriculas', authenticate, adminOnly, matriculaController.createPrematricula);
router.patch('/prematriculas/:id/estado', authenticate, adminOnly, matriculaController.updateEstadoPrematricula);

// Matrículas
router.get('/', authenticate, adminOnly, matriculaController.getMatriculas);
router.get('/estadisticas', authenticate, adminOnly, matriculaController.getEstadisticasMatricula);
router.get('/unidades-disponibles', authenticate, adminOnly, matriculaController.getUnidadesDisponibles);
router.get('/:id', authenticate, adminOnly, matriculaController.getMatricula);
router.post('/', authenticate, adminOnly, matriculaController.createMatricula);
router.post('/desde-prematricula/:prematricula_id', authenticate, adminOnly, matriculaController.matricularDesdePrematricula);
router.patch('/:id/estado', authenticate, adminOnly, matriculaController.updateEstadoMatricula);

export default router;
