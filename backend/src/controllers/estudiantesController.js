import bcrypt from 'bcryptjs';
import { getDatabase } from '../database/connection.js';

// Listar estudiantes
export const getEstudiantes = (req, res) => {
    try {
        const { programa_id, estado, search } = req.query;
        const db = getDatabase();
        
        let query = `
            SELECT e.*, u.email, u.activo as usuario_activo,
                   p.nombre as programa_nombre, pe.nombre as plan_nombre, t.nombre as turno_nombre
            FROM estudiantes e
            LEFT JOIN usuarios u ON e.usuario_id = u.id
            LEFT JOIN programas_estudio p ON e.programa_id = p.id
            LEFT JOIN planes_estudio pe ON e.plan_estudio_id = pe.id
            LEFT JOIN turnos t ON e.turno_id = t.id
            WHERE 1=1
        `;
        const params = [];

        if (programa_id) {
            query += ' AND e.programa_id = ?';
            params.push(programa_id);
        }
        if (estado) {
            query += ' AND e.estado = ?';
            params.push(estado);
        }
        if (search) {
            query += ' AND (e.nombres LIKE ? OR e.apellido_paterno LIKE ? OR e.apellido_materno LIKE ? OR e.codigo_estudiante LIKE ? OR e.dni LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
        }

        query += ' ORDER BY e.apellido_paterno, e.apellido_materno, e.nombres';
        const estudiantes = db.prepare(query).all(...params);
        
        res.json({ success: true, data: estudiantes });
    } catch (error) {
        console.error('Error obteniendo estudiantes:', error);
        res.status(500).json({ success: false, message: 'Error al obtener estudiantes' });
    }
};

// Obtener estudiante por ID
export const getEstudiante = (req, res) => {
    try {
        const { id } = req.params;
        const db = getDatabase();
        
        const estudiante = db.prepare(`
            SELECT e.*, u.email, u.activo as usuario_activo,
                   p.nombre as programa_nombre, pe.nombre as plan_nombre, t.nombre as turno_nombre
            FROM estudiantes e
            LEFT JOIN usuarios u ON e.usuario_id = u.id
            LEFT JOIN programas_estudio p ON e.programa_id = p.id
            LEFT JOIN planes_estudio pe ON e.plan_estudio_id = pe.id
            LEFT JOIN turnos t ON e.turno_id = t.id
            WHERE e.id = ?
        `).get(id);
        
        if (!estudiante) {
            return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
        }

        res.json({ success: true, data: estudiante });
    } catch (error) {
        console.error('Error obteniendo estudiante:', error);
        res.status(500).json({ success: false, message: 'Error al obtener estudiante' });
    }
};

// Crear estudiante
export const createEstudiante = (req, res) => {
    try {
        const {
            codigo_estudiante, dni, nombres, apellido_paterno, apellido_materno,
            fecha_nacimiento, genero, direccion, telefono, email,
            programa_id, plan_estudio_id, turno_id, ciclo_actual, fecha_ingreso, password
        } = req.body;

        if (!codigo_estudiante || !dni || !nombres || !apellido_paterno) {
            return res.status(400).json({ 
                success: false, 
                message: 'Código, DNI, nombres y apellido paterno son requeridos' 
            });
        }

        const db = getDatabase();

        // Verificar si ya existe el código o DNI
        const existingCodigo = db.prepare('SELECT id FROM estudiantes WHERE codigo_estudiante = ?').get(codigo_estudiante);
        if (existingCodigo) {
            return res.status(400).json({ success: false, message: 'El código de estudiante ya existe' });
        }

        const existingDni = db.prepare('SELECT id FROM estudiantes WHERE dni = ?').get(dni);
        if (existingDni) {
            return res.status(400).json({ success: false, message: 'El DNI ya está registrado' });
        }

        // Crear usuario para el estudiante
        let usuario_id = null;
        if (email && password) {
            const existingEmail = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(email);
            if (existingEmail) {
                return res.status(400).json({ success: false, message: 'El email ya está registrado' });
            }

            const hashedPassword = bcrypt.hashSync(password, 10);
            const userResult = db.prepare(`
                INSERT INTO usuarios (email, password, rol, activo)
                VALUES (?, ?, 'estudiante', 1)
            `).run(email, hashedPassword);
            usuario_id = userResult.lastInsertRowid;
        }

        const result = db.prepare(`
            INSERT INTO estudiantes (
                usuario_id, codigo_estudiante, dni, nombres, apellido_paterno, apellido_materno,
                fecha_nacimiento, genero, direccion, telefono, email,
                programa_id, plan_estudio_id, turno_id, ciclo_actual, fecha_ingreso
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            usuario_id, codigo_estudiante, dni, nombres, apellido_paterno, apellido_materno,
            fecha_nacimiento, genero, direccion, telefono, email,
            programa_id, plan_estudio_id, turno_id, ciclo_actual || 1, fecha_ingreso
        );

        res.status(201).json({
            success: true,
            message: 'Estudiante creado exitosamente',
            data: { id: result.lastInsertRowid, usuario_id }
        });
    } catch (error) {
        console.error('Error creando estudiante:', error);
        res.status(500).json({ success: false, message: 'Error al crear estudiante' });
    }
};

// Actualizar estudiante
export const updateEstudiante = (req, res) => {
    try {
        const { id } = req.params;
        const {
            codigo_estudiante, dni, nombres, apellido_paterno, apellido_materno,
            fecha_nacimiento, genero, direccion, telefono, email,
            programa_id, plan_estudio_id, turno_id, ciclo_actual, estado
        } = req.body;

        const db = getDatabase();
        
        const existing = db.prepare('SELECT id FROM estudiantes WHERE id = ?').get(id);
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
        }

        db.prepare(`
            UPDATE estudiantes SET
                codigo_estudiante = ?, dni = ?, nombres = ?, apellido_paterno = ?, apellido_materno = ?,
                fecha_nacimiento = ?, genero = ?, direccion = ?, telefono = ?, email = ?,
                programa_id = ?, plan_estudio_id = ?, turno_id = ?, ciclo_actual = ?, estado = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(
            codigo_estudiante, dni, nombres, apellido_paterno, apellido_materno,
            fecha_nacimiento, genero, direccion, telefono, email,
            programa_id, plan_estudio_id, turno_id, ciclo_actual, estado, id
        );

        res.json({ success: true, message: 'Estudiante actualizado' });
    } catch (error) {
        console.error('Error actualizando estudiante:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar estudiante' });
    }
};

// Obtener historial académico del estudiante
export const getHistorialAcademico = (req, res) => {
    try {
        const { id } = req.params;
        const db = getDatabase();

        // Verificar que el estudiante existe
        const estudiante = db.prepare('SELECT * FROM estudiantes WHERE id = ?').get(id);
        if (!estudiante) {
            return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
        }

        // Obtener matrículas y notas
        const matriculas = db.prepare(`
            SELECT m.*, pl.nombre as periodo_nombre, t.nombre as turno_nombre
            FROM matriculas m
            JOIN periodos_lectivos pl ON m.periodo_id = pl.id
            LEFT JOIN turnos t ON m.turno_id = t.id
            WHERE m.estudiante_id = ?
            ORDER BY pl.anio DESC, pl.semestre DESC
        `).all(id);

        // Para cada matrícula, obtener los detalles con notas
        const historial = matriculas.map(matricula => {
            const detalles = db.prepare(`
                SELECT md.*, ud.nombre as unidad_nombre, ud.codigo as unidad_codigo, ud.creditos,
                       nf.nota_final, nf.estado as estado_nota
                FROM matricula_detalle md
                JOIN unidades_didacticas ud ON md.unidad_didactica_id = ud.id
                LEFT JOIN notas_finales nf ON md.id = nf.matricula_detalle_id
                WHERE md.matricula_id = ?
                ORDER BY ud.ciclo, ud.nombre
            `).all(matricula.id);

            return { ...matricula, detalles };
        });

        res.json({ success: true, data: { estudiante, historial } });
    } catch (error) {
        console.error('Error obteniendo historial:', error);
        res.status(500).json({ success: false, message: 'Error al obtener historial académico' });
    }
};

// Obtener perfil del estudiante logueado
export const getMiPerfil = (req, res) => {
    try {
        const db = getDatabase();
        
        const estudiante = db.prepare(`
            SELECT e.*, u.email, p.nombre as programa_nombre, pe.nombre as plan_nombre, t.nombre as turno_nombre
            FROM estudiantes e
            LEFT JOIN usuarios u ON e.usuario_id = u.id
            LEFT JOIN programas_estudio p ON e.programa_id = p.id
            LEFT JOIN planes_estudio pe ON e.plan_estudio_id = pe.id
            LEFT JOIN turnos t ON e.turno_id = t.id
            WHERE e.usuario_id = ?
        `).get(req.user.id);
        
        if (!estudiante) {
            return res.status(404).json({ success: false, message: 'Perfil de estudiante no encontrado' });
        }

        res.json({ success: true, data: estudiante });
    } catch (error) {
        console.error('Error obteniendo mi perfil:', error);
        res.status(500).json({ success: false, message: 'Error al obtener perfil' });
    }
};

// Obtener mi historial académico (para estudiante logueado)
export const getMiHistorial = (req, res) => {
    try {
        const db = getDatabase();
        
        const estudiante = db.prepare('SELECT id FROM estudiantes WHERE usuario_id = ?').get(req.user.id);
        if (!estudiante) {
            return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
        }

        req.params.id = estudiante.id;
        return getHistorialAcademico(req, res);
    } catch (error) {
        console.error('Error obteniendo mi historial:', error);
        res.status(500).json({ success: false, message: 'Error al obtener mi historial' });
    }
};

// Obtener mis fichas de matrícula
export const getMisMatriculas = (req, res) => {
    try {
        const db = getDatabase();
        
        const estudiante = db.prepare('SELECT id FROM estudiantes WHERE usuario_id = ?').get(req.user.id);
        if (!estudiante) {
            return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
        }

        const matriculas = db.prepare(`
            SELECT m.*, pl.nombre as periodo_nombre, t.nombre as turno_nombre
            FROM matriculas m
            JOIN periodos_lectivos pl ON m.periodo_id = pl.id
            LEFT JOIN turnos t ON m.turno_id = t.id
            WHERE m.estudiante_id = ?
            ORDER BY pl.anio DESC, pl.semestre DESC
        `).all(estudiante.id);

        const result = matriculas.map(matricula => {
            const detalles = db.prepare(`
                SELECT md.*, ud.nombre as unidad_nombre, ud.codigo as unidad_codigo, 
                       ud.creditos, ud.horas_teoria, ud.horas_practica
                FROM matricula_detalle md
                JOIN unidades_didacticas ud ON md.unidad_didactica_id = ud.id
                WHERE md.matricula_id = ?
                ORDER BY ud.nombre
            `).all(matricula.id);

            return { ...matricula, detalles };
        });

        res.json({ success: true, data: result });
    } catch (error) {
        console.error('Error obteniendo mis matrículas:', error);
        res.status(500).json({ success: false, message: 'Error al obtener fichas de matrícula' });
    }
};
