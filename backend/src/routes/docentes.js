import { Router } from 'express';
import * as docentesController from '../controllers/docentesController.js';
import { authenticate, adminOnly, docenteOnly } from '../middleware/auth.js';

const router = Router();

// Gestión de docentes (admin)
router.get('/', authenticate, adminOnly, docentesController.getDocentes);
router.get('/:id', authenticate, adminOnly, docentesController.getDocente);
router.post('/', authenticate, adminOnly, docentesController.createDocente);
router.put('/:id', authenticate, adminOnly, docentesController.updateDocente);

// Asignación de unidades
router.get('/asignaciones/list', authenticate, adminOnly, docentesController.getAsignaciones);
router.post('/asignaciones', authenticate, adminOnly, docentesController.asignarUnidad);
router.delete('/asignaciones/:id', authenticate, adminOnly, docentesController.eliminarAsignacion);

// Horarios
router.get('/horarios/list', authenticate, docentesController.getHorarios);
router.post('/horarios', authenticate, adminOnly, docentesController.createHorario);
router.put('/horarios/:id', authenticate, adminOnly, docentesController.updateHorario);
router.delete('/horarios/:id', authenticate, adminOnly, docentesController.deleteHorario);

// Personal no docente
router.get('/personal-no-docente/list', authenticate, adminOnly, docentesController.getPersonalNoDocente);
router.post('/personal-no-docente', authenticate, adminOnly, docentesController.createPersonalNoDocente);
router.put('/personal-no-docente/:id', authenticate, adminOnly, docentesController.updatePersonalNoDocente);

// Rutas para docente logueado
router.get('/mi/asignaciones', authenticate, docenteOnly, docentesController.getMisAsignaciones);

export default router;
