import { Router } from 'express';
import * as reportesController from '../controllers/reportesController.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = Router();

// Dashboard
router.get('/dashboard', authenticate, adminOnly, reportesController.getDashboard);

// Reportes de matrícula
router.get('/matricula-semestral', authenticate, adminOnly, reportesController.reporteMatriculaSemestral);

// Reportes de notas
router.get('/notas-periodo', authenticate, adminOnly, reportesController.reporteNotasPeriodo);
router.get('/actas-pendientes', authenticate, adminOnly, reportesController.reporteActasPendientes);

// Certificados
router.get('/certificados', authenticate, adminOnly, reportesController.getCertificados);
router.post('/certificado-estudios/:estudiante_id', authenticate, adminOnly, reportesController.generarCertificadoEstudios);
router.get('/constancia-matricula/:matricula_id', authenticate, adminOnly, reportesController.generarConstanciaMatricula);

export default router;
