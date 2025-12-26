import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { getDatabase } from '../database/connection.js';

// Middleware de autenticación
export const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                success: false, 
                message: 'Token de autenticación no proporcionado' 
            });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, config.jwtSecret);
        
        const db = getDatabase();
        const user = db.prepare('SELECT id, email, rol, activo FROM usuarios WHERE id = ?').get(decoded.id);
        
        if (!user || !user.activo) {
            return res.status(401).json({ 
                success: false, 
                message: 'Usuario no autorizado o inactivo' 
            });
        }
        
        req.user = user;
        next();
    } catch (error) {
        console.error('Error de autenticación:', error);
        return res.status(401).json({ 
            success: false, 
            message: 'Token inválido o expirado' 
        });
    }
};

// Middleware de autorización por roles
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: 'No autenticado' 
            });
        }
        
        if (!roles.includes(req.user.rol)) {
            return res.status(403).json({ 
                success: false, 
                message: 'No tiene permisos para acceder a este recurso' 
            });
        }
        
        next();
    };
};

// Middleware solo para administradores
export const adminOnly = authorize('administrador');

// Middleware solo para docentes
export const docenteOnly = authorize('docente');

// Middleware solo para estudiantes
export const estudianteOnly = authorize('estudiante');

// Middleware para administradores y docentes
export const adminOrDocente = authorize('administrador', 'docente');
