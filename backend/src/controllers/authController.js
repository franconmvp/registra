import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getDatabase } from '../database/connection.js';
import config from '../config/index.js';

// Login de usuario
export const login = (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email y contraseña son requeridos'
            });
        }

        const db = getDatabase();
        const user = db.prepare('SELECT * FROM usuarios WHERE email = ?').get(email);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        if (!user.activo) {
            return res.status(401).json({
                success: false,
                message: 'Usuario inactivo. Contacte al administrador.'
            });
        }

        const isMatch = bcrypt.compareSync(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Obtener información adicional según el rol
        let userInfo = {
            id: user.id,
            email: user.email,
            rol: user.rol
        };

        if (user.rol === 'estudiante') {
            const estudiante = db.prepare(`
                SELECT e.*, p.nombre as programa_nombre 
                FROM estudiantes e 
                LEFT JOIN programas_estudio p ON e.programa_id = p.id 
                WHERE e.usuario_id = ?
            `).get(user.id);
            if (estudiante) {
                userInfo.estudiante = {
                    id: estudiante.id,
                    codigo: estudiante.codigo_estudiante,
                    nombres: estudiante.nombres,
                    apellidoPaterno: estudiante.apellido_paterno,
                    apellidoMaterno: estudiante.apellido_materno,
                    programa: estudiante.programa_nombre
                };
            }
        } else if (user.rol === 'docente') {
            const docente = db.prepare('SELECT * FROM docentes WHERE usuario_id = ?').get(user.id);
            if (docente) {
                userInfo.docente = {
                    id: docente.id,
                    nombres: docente.nombres,
                    apellidoPaterno: docente.apellido_paterno,
                    apellidoMaterno: docente.apellido_materno,
                    especialidad: docente.especialidad
                };
            }
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, rol: user.rol },
            config.jwtSecret,
            { expiresIn: config.jwtExpiresIn }
        );

        res.json({
            success: true,
            message: 'Inicio de sesión exitoso',
            data: {
                token,
                user: userInfo
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error al iniciar sesión'
        });
    }
};

// Obtener perfil del usuario autenticado
export const getProfile = (req, res) => {
    try {
        const db = getDatabase();
        let profile = { ...req.user };

        if (req.user.rol === 'estudiante') {
            const estudiante = db.prepare(`
                SELECT e.*, p.nombre as programa_nombre, pe.nombre as plan_nombre, t.nombre as turno_nombre
                FROM estudiantes e 
                LEFT JOIN programas_estudio p ON e.programa_id = p.id 
                LEFT JOIN planes_estudio pe ON e.plan_estudio_id = pe.id
                LEFT JOIN turnos t ON e.turno_id = t.id
                WHERE e.usuario_id = ?
            `).get(req.user.id);
            profile.estudiante = estudiante;
        } else if (req.user.rol === 'docente') {
            const docente = db.prepare('SELECT * FROM docentes WHERE usuario_id = ?').get(req.user.id);
            profile.docente = docente;
        }

        res.json({
            success: true,
            data: profile
        });

    } catch (error) {
        console.error('Error obteniendo perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener perfil'
        });
    }
};

// Cambiar contraseña
export const changePassword = (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Contraseña actual y nueva contraseña son requeridas'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'La nueva contraseña debe tener al menos 6 caracteres'
            });
        }

        const db = getDatabase();
        const user = db.prepare('SELECT password FROM usuarios WHERE id = ?').get(req.user.id);

        const isMatch = bcrypt.compareSync(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Contraseña actual incorrecta'
            });
        }

        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        db.prepare('UPDATE usuarios SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
            .run(hashedPassword, req.user.id);

        res.json({
            success: true,
            message: 'Contraseña actualizada correctamente'
        });

    } catch (error) {
        console.error('Error cambiando contraseña:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cambiar contraseña'
        });
    }
};

// Crear usuario (solo admin)
export const createUser = (req, res) => {
    try {
        const { email, password, rol } = req.body;

        if (!email || !password || !rol) {
            return res.status(400).json({
                success: false,
                message: 'Email, contraseña y rol son requeridos'
            });
        }

        if (!['administrador', 'docente', 'estudiante'].includes(rol)) {
            return res.status(400).json({
                success: false,
                message: 'Rol inválido'
            });
        }

        const db = getDatabase();
        
        const existingUser = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(email);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'El email ya está registrado'
            });
        }

        const hashedPassword = bcrypt.hashSync(password, 10);
        const result = db.prepare(`
            INSERT INTO usuarios (email, password, rol, activo)
            VALUES (?, ?, ?, 1)
        `).run(email, hashedPassword, rol);

        res.status(201).json({
            success: true,
            message: 'Usuario creado exitosamente',
            data: { id: result.lastInsertRowid, email, rol }
        });

    } catch (error) {
        console.error('Error creando usuario:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear usuario'
        });
    }
};

// Listar usuarios (solo admin)
export const listUsers = (req, res) => {
    try {
        const db = getDatabase();
        const users = db.prepare(`
            SELECT id, email, rol, activo, created_at 
            FROM usuarios 
            ORDER BY created_at DESC
        `).all();

        res.json({
            success: true,
            data: users
        });

    } catch (error) {
        console.error('Error listando usuarios:', error);
        res.status(500).json({
            success: false,
            message: 'Error al listar usuarios'
        });
    }
};

// Activar/Desactivar usuario (solo admin)
export const toggleUserStatus = (req, res) => {
    try {
        const { id } = req.params;
        const db = getDatabase();

        const user = db.prepare('SELECT id, activo FROM usuarios WHERE id = ?').get(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // No permitir desactivar al propio usuario
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({
                success: false,
                message: 'No puede desactivar su propia cuenta'
            });
        }

        const newStatus = user.activo ? 0 : 1;
        db.prepare('UPDATE usuarios SET activo = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
            .run(newStatus, id);

        res.json({
            success: true,
            message: `Usuario ${newStatus ? 'activado' : 'desactivado'} correctamente`
        });

    } catch (error) {
        console.error('Error toggling user status:', error);
        res.status(500).json({
            success: false,
            message: 'Error al cambiar estado del usuario'
        });
    }
};

// Resetear contraseña (solo admin)
export const resetPassword = (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'La nueva contraseña debe tener al menos 6 caracteres'
            });
        }

        const db = getDatabase();
        const user = db.prepare('SELECT id FROM usuarios WHERE id = ?').get(id);
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        db.prepare('UPDATE usuarios SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
            .run(hashedPassword, id);

        res.json({
            success: true,
            message: 'Contraseña reseteada correctamente'
        });

    } catch (error) {
        console.error('Error reseteando contraseña:', error);
        res.status(500).json({
            success: false,
            message: 'Error al resetear contraseña'
        });
    }
};
