import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authenticate, adminOnly } from '../middleware/auth.js';

const router = Router();

// Rutas públicas
router.post('/login', authController.login);

// Rutas protegidas
router.get('/profile', authenticate, authController.getProfile);
router.put('/change-password', authenticate, authController.changePassword);

// Rutas solo para administrador
router.post('/users', authenticate, adminOnly, authController.createUser);
router.get('/users', authenticate, adminOnly, authController.listUsers);
router.patch('/users/:id/toggle-status', authenticate, adminOnly, authController.toggleUserStatus);
router.put('/users/:id/reset-password', authenticate, adminOnly, authController.resetPassword);

export default router;
