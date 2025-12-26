import { Router } from 'express';
import * as institucionController from '../controllers/institucionController.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = Router();

// Información institucional
router.get('/', authenticate, institucionController.getInstitucion);
router.put('/', authenticate, adminOnly, institucionController.updateInstitucion);

// Periodos lectivos
router.get('/periodos', authenticate, institucionController.getPeriodos);
router.get('/periodos/activo', authenticate, institucionController.getPeriodoActivo);
router.post('/periodos', authenticate, adminOnly, institucionController.createPeriodo);
router.put('/periodos/:id', authenticate, adminOnly, institucionController.updatePeriodo);
router.delete('/periodos/:id', authenticate, adminOnly, institucionController.deletePeriodo);

// Turnos
router.get('/turnos', authenticate, institucionController.getTurnos);
router.post('/turnos', authenticate, adminOnly, institucionController.createTurno);
router.put('/turnos/:id', authenticate, adminOnly, institucionController.updateTurno);

// Programas de estudio
router.get('/programas', authenticate, institucionController.getProgramas);
router.get('/programas/:id', authenticate, institucionController.getPrograma);
router.post('/programas', authenticate, adminOnly, institucionController.createPrograma);
router.put('/programas/:id', authenticate, adminOnly, institucionController.updatePrograma);

// Planes de estudio
router.get('/planes', authenticate, institucionController.getPlanes);
router.get('/planes/:id', authenticate, institucionController.getPlan);
router.post('/planes', authenticate, adminOnly, institucionController.createPlan);
router.put('/planes/:id', authenticate, adminOnly, institucionController.updatePlan);

// Unidades didácticas
router.get('/unidades', authenticate, institucionController.getUnidadesDidacticas);
router.post('/unidades', authenticate, adminOnly, institucionController.createUnidadDidactica);
router.put('/unidades/:id', authenticate, adminOnly, institucionController.updateUnidadDidactica);

// Reglas de promoción
router.get('/reglas-promocion', authenticate, institucionController.getReglasPromocion);
router.post('/reglas-promocion', authenticate, adminOnly, institucionController.createReglaPromocion);
router.put('/reglas-promocion/:id', authenticate, adminOnly, institucionController.updateReglaPromocion);
router.delete('/reglas-promocion/:id', authenticate, adminOnly, institucionController.deleteReglaPromocion);

export default router;
