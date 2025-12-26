import bcrypt from 'bcryptjs';
import { getDatabase } from '../database/connection.js';

// Listar docentes
export const getDocentes = (req, res) => {
    try {
        const { activo, search } = req.query;
        const db = getDatabase();
        
        let query = `
            SELECT d.*, u.email, u.activo as usuario_activo
            FROM docentes d
            LEFT JOIN usuarios u ON d.usuario_id = u.id
            WHERE 1=1
        `;
        const params = [];

        if (activo !== undefined) {
            query += ' AND d.activo = ?';
            params.push(activo === 'true' || activo === '1' ? 1 : 0);
        }
        if (search) {
            query += ' AND (d.nombres LIKE ? OR d.apellido_paterno LIKE ? OR d.apellido_materno LIKE ? OR d.dni LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        query += ' ORDER BY d.apellido_paterno, d.apellido_materno, d.nombres';
        const docentes = db.prepare(query).all(...params);
        
        res.json({ success: true, data: docentes });
    } catch (error) {
        console.error('Error obteniendo docentes:', error);
        res.status(500).json({ success: false, message: 'Error al obtener docentes' });
    }
};

// Obtener docente por ID
export const getDocente = (req, res) => {
    try {
        const { id } = req.params;
        const db = getDatabase();
        
        const docente = db.prepare(`
            SELECT d.*, u.email, u.activo as usuario_activo
            FROM docentes d
            LEFT JOIN usuarios u ON d.usuario_id = u.id
            WHERE d.id = ?
        `).get(id);
        
        if (!docente) {
            return res.status(404).json({ success: false, message: 'Docente no encontrado' });
        }

        res.json({ success: true, data: docente });
    } catch (error) {
        console.error('Error obteniendo docente:', error);
        res.status(500).json({ success: false, message: 'Error al obtener docente' });
    }
};

// Crear docente
export const createDocente = (req, res) => {
    try {
        const {
            dni, nombres, apellido_paterno, apellido_materno,
            fecha_nacimiento, genero, direccion, telefono, email,
            especialidad, grado_academico, condicion, fecha_ingreso, password
        } = req.body;

        if (!dni || !nombres || !apellido_paterno) {
            return res.status(400).json({ 
                success: false, 
                message: 'DNI, nombres y apellido paterno son requeridos' 
            });
        }

        const db = getDatabase();

        // Verificar si ya existe el DNI
        const existingDni = db.prepare('SELECT id FROM docentes WHERE dni = ?').get(dni);
        if (existingDni) {
            return res.status(400).json({ success: false, message: 'El DNI ya está registrado' });
        }

        // Crear usuario para el docente
        let usuario_id = null;
        if (email && password) {
            const existingEmail = db.prepare('SELECT id FROM usuarios WHERE email = ?').get(email);
            if (existingEmail) {
                return res.status(400).json({ success: false, message: 'El email ya está registrado' });
            }

            const hashedPassword = bcrypt.hashSync(password, 10);
            const userResult = db.prepare(`
                INSERT INTO usuarios (email, password, rol, activo)
                VALUES (?, ?, 'docente', 1)
            `).run(email, hashedPassword);
            usuario_id = userResult.lastInsertRowid;
        }

        const result = db.prepare(`
            INSERT INTO docentes (
                usuario_id, dni, nombres, apellido_paterno, apellido_materno,
                fecha_nacimiento, genero, direccion, telefono, email,
                especialidad, grado_academico, condicion, fecha_ingreso
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            usuario_id, dni, nombres, apellido_paterno, apellido_materno,
            fecha_nacimiento, genero, direccion, telefono, email,
            especialidad, grado_academico, condicion || 'contratado', fecha_ingreso
        );

        res.status(201).json({
            success: true,
            message: 'Docente creado exitosamente',
            data: { id: result.lastInsertRowid, usuario_id }
        });
    } catch (error) {
        console.error('Error creando docente:', error);
        res.status(500).json({ success: false, message: 'Error al crear docente' });
    }
};

// Actualizar docente
export const updateDocente = (req, res) => {
    try {
        const { id } = req.params;
        const {
            dni, nombres, apellido_paterno, apellido_materno,
            fecha_nacimiento, genero, direccion, telefono, email,
            especialidad, grado_academico, condicion, activo
        } = req.body;

        const db = getDatabase();
        
        const existing = db.prepare('SELECT id FROM docentes WHERE id = ?').get(id);
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Docente no encontrado' });
        }

        db.prepare(`
            UPDATE docentes SET
                dni = ?, nombres = ?, apellido_paterno = ?, apellido_materno = ?,
                fecha_nacimiento = ?, genero = ?, direccion = ?, telefono = ?, email = ?,
                especialidad = ?, grado_academico = ?, condicion = ?, activo = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(
            dni, nombres, apellido_paterno, apellido_materno,
            fecha_nacimiento, genero, direccion, telefono, email,
            especialidad, grado_academico, condicion, activo ? 1 : 0, id
        );

        res.json({ success: true, message: 'Docente actualizado' });
    } catch (error) {
        console.error('Error actualizando docente:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar docente' });
    }
};

// Asignar docente a unidad didáctica
export const asignarUnidad = (req, res) => {
    try {
        const { docente_id, unidad_didactica_id, periodo_id, turno_id, seccion } = req.body;

        if (!docente_id || !unidad_didactica_id || !periodo_id || !turno_id) {
            return res.status(400).json({ 
                success: false, 
                message: 'Docente, unidad didáctica, periodo y turno son requeridos' 
            });
        }

        const db = getDatabase();

        // Verificar que no exista la asignación
        const existing = db.prepare(`
            SELECT id FROM docente_unidad 
            WHERE docente_id = ? AND unidad_didactica_id = ? AND periodo_id = ? AND turno_id = ? AND seccion = ?
        `).get(docente_id, unidad_didactica_id, periodo_id, turno_id, seccion || 'A');

        if (existing) {
            return res.status(400).json({ success: false, message: 'La asignación ya existe' });
        }

        const result = db.prepare(`
            INSERT INTO docente_unidad (docente_id, unidad_didactica_id, periodo_id, turno_id, seccion)
            VALUES (?, ?, ?, ?, ?)
        `).run(docente_id, unidad_didactica_id, periodo_id, turno_id, seccion || 'A');

        res.status(201).json({
            success: true,
            message: 'Asignación creada exitosamente',
            data: { id: result.lastInsertRowid }
        });
    } catch (error) {
        console.error('Error asignando unidad:', error);
        res.status(500).json({ success: false, message: 'Error al asignar unidad' });
    }
};

// Obtener asignaciones de un docente
export const getAsignaciones = (req, res) => {
    try {
        const { docente_id, periodo_id } = req.query;
        const db = getDatabase();
        
        let query = `
            SELECT du.*, 
                   d.nombres as docente_nombres, d.apellido_paterno as docente_apellido,
                   ud.nombre as unidad_nombre, ud.codigo as unidad_codigo, ud.ciclo,
                   pl.nombre as periodo_nombre, t.nombre as turno_nombre,
                   p.nombre as programa_nombre
            FROM docente_unidad du
            JOIN docentes d ON du.docente_id = d.id
            JOIN unidades_didacticas ud ON du.unidad_didactica_id = ud.id
            JOIN periodos_lectivos pl ON du.periodo_id = pl.id
            JOIN turnos t ON du.turno_id = t.id
            JOIN planes_estudio pe ON ud.plan_estudio_id = pe.id
            JOIN programas_estudio p ON pe.programa_id = p.id
            WHERE 1=1
        `;
        const params = [];

        if (docente_id) {
            query += ' AND du.docente_id = ?';
            params.push(docente_id);
        }
        if (periodo_id) {
            query += ' AND du.periodo_id = ?';
            params.push(periodo_id);
        }

        query += ' ORDER BY pl.nombre DESC, p.nombre, ud.ciclo, ud.nombre';
        const asignaciones = db.prepare(query).all(...params);
        
        res.json({ success: true, data: asignaciones });
    } catch (error) {
        console.error('Error obteniendo asignaciones:', error);
        res.status(500).json({ success: false, message: 'Error al obtener asignaciones' });
    }
};

// Eliminar asignación
export const eliminarAsignacion = (req, res) => {
    try {
        const { id } = req.params;
        const db = getDatabase();

        // Verificar si hay matrículas asociadas
        const matriculas = db.prepare(`
            SELECT COUNT(*) as count FROM matricula_detalle WHERE docente_unidad_id = ?
        `).get(id);

        if (matriculas.count > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'No se puede eliminar la asignación porque tiene matrículas asociadas' 
            });
        }

        db.prepare('DELETE FROM docente_unidad WHERE id = ?').run(id);
        res.json({ success: true, message: 'Asignación eliminada' });
    } catch (error) {
        console.error('Error eliminando asignación:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar asignación' });
    }
};

// Gestionar horarios de docente
export const getHorarios = (req, res) => {
    try {
        const { docente_id, periodo_id } = req.query;
        const db = getDatabase();
        
        let query = `
            SELECT h.*, du.seccion,
                   ud.nombre as unidad_nombre, ud.codigo as unidad_codigo,
                   d.nombres as docente_nombres, d.apellido_paterno as docente_apellido
            FROM horarios_docente h
            JOIN docente_unidad du ON h.docente_unidad_id = du.id
            JOIN unidades_didacticas ud ON du.unidad_didactica_id = ud.id
            JOIN docentes d ON du.docente_id = d.id
            WHERE 1=1
        `;
        const params = [];

        if (docente_id) {
            query += ' AND du.docente_id = ?';
            params.push(docente_id);
        }
        if (periodo_id) {
            query += ' AND du.periodo_id = ?';
            params.push(periodo_id);
        }

        query += ' ORDER BY h.dia_semana, h.hora_inicio';
        const horarios = db.prepare(query).all(...params);
        
        res.json({ success: true, data: horarios });
    } catch (error) {
        console.error('Error obteniendo horarios:', error);
        res.status(500).json({ success: false, message: 'Error al obtener horarios' });
    }
};

export const createHorario = (req, res) => {
    try {
        const { docente_unidad_id, dia_semana, hora_inicio, hora_fin, aula } = req.body;

        if (!docente_unidad_id || !dia_semana || !hora_inicio || !hora_fin) {
            return res.status(400).json({ 
                success: false, 
                message: 'Asignación, día, hora inicio y hora fin son requeridos' 
            });
        }

        const db = getDatabase();
        const result = db.prepare(`
            INSERT INTO horarios_docente (docente_unidad_id, dia_semana, hora_inicio, hora_fin, aula)
            VALUES (?, ?, ?, ?, ?)
        `).run(docente_unidad_id, dia_semana, hora_inicio, hora_fin, aula);

        res.status(201).json({
            success: true,
            message: 'Horario creado exitosamente',
            data: { id: result.lastInsertRowid }
        });
    } catch (error) {
        console.error('Error creando horario:', error);
        res.status(500).json({ success: false, message: 'Error al crear horario' });
    }
};

export const updateHorario = (req, res) => {
    try {
        const { id } = req.params;
        const { dia_semana, hora_inicio, hora_fin, aula } = req.body;

        const db = getDatabase();
        db.prepare(`
            UPDATE horarios_docente SET dia_semana = ?, hora_inicio = ?, hora_fin = ?, aula = ?
            WHERE id = ?
        `).run(dia_semana, hora_inicio, hora_fin, aula, id);

        res.json({ success: true, message: 'Horario actualizado' });
    } catch (error) {
        console.error('Error actualizando horario:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar horario' });
    }
};

export const deleteHorario = (req, res) => {
    try {
        const { id } = req.params;
        const db = getDatabase();
        db.prepare('DELETE FROM horarios_docente WHERE id = ?').run(id);
        res.json({ success: true, message: 'Horario eliminado' });
    } catch (error) {
        console.error('Error eliminando horario:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar horario' });
    }
};

// Obtener mis asignaciones (para docente logueado)
export const getMisAsignaciones = (req, res) => {
    try {
        const db = getDatabase();
        
        const docente = db.prepare('SELECT id FROM docentes WHERE usuario_id = ?').get(req.user.id);
        if (!docente) {
            return res.status(404).json({ success: false, message: 'Docente no encontrado' });
        }

        const periodoActivo = db.prepare('SELECT id FROM periodos_lectivos WHERE activo = 1').get();

        const asignaciones = db.prepare(`
            SELECT du.*, 
                   ud.nombre as unidad_nombre, ud.codigo as unidad_codigo, ud.ciclo,
                   pl.nombre as periodo_nombre, t.nombre as turno_nombre,
                   p.nombre as programa_nombre
            FROM docente_unidad du
            JOIN unidades_didacticas ud ON du.unidad_didactica_id = ud.id
            JOIN periodos_lectivos pl ON du.periodo_id = pl.id
            JOIN turnos t ON du.turno_id = t.id
            JOIN planes_estudio pe ON ud.plan_estudio_id = pe.id
            JOIN programas_estudio p ON pe.programa_id = p.id
            WHERE du.docente_id = ? AND du.periodo_id = ?
            ORDER BY p.nombre, ud.ciclo, ud.nombre
        `).all(docente.id, periodoActivo?.id);

        res.json({ success: true, data: asignaciones });
    } catch (error) {
        console.error('Error obteniendo mis asignaciones:', error);
        res.status(500).json({ success: false, message: 'Error al obtener mis asignaciones' });
    }
};

// Listar personal no docente
export const getPersonalNoDocente = (req, res) => {
    try {
        const db = getDatabase();
        const personal = db.prepare(`
            SELECT pnd.*, u.email, u.activo as usuario_activo
            FROM personal_no_docente pnd
            LEFT JOIN usuarios u ON pnd.usuario_id = u.id
            ORDER BY pnd.apellido_paterno, pnd.apellido_materno, pnd.nombres
        `).all();
        
        res.json({ success: true, data: personal });
    } catch (error) {
        console.error('Error obteniendo personal no docente:', error);
        res.status(500).json({ success: false, message: 'Error al obtener personal no docente' });
    }
};

// Crear personal no docente
export const createPersonalNoDocente = (req, res) => {
    try {
        const {
            dni, nombres, apellido_paterno, apellido_materno,
            cargo, area, telefono, email, fecha_ingreso
        } = req.body;

        if (!dni || !nombres || !apellido_paterno || !cargo) {
            return res.status(400).json({ 
                success: false, 
                message: 'DNI, nombres, apellido paterno y cargo son requeridos' 
            });
        }

        const db = getDatabase();
        const result = db.prepare(`
            INSERT INTO personal_no_docente (dni, nombres, apellido_paterno, apellido_materno, cargo, area, telefono, email, fecha_ingreso)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(dni, nombres, apellido_paterno, apellido_materno, cargo, area, telefono, email, fecha_ingreso);

        res.status(201).json({
            success: true,
            message: 'Personal no docente creado exitosamente',
            data: { id: result.lastInsertRowid }
        });
    } catch (error) {
        console.error('Error creando personal no docente:', error);
        res.status(500).json({ success: false, message: 'Error al crear personal no docente' });
    }
};

// Actualizar personal no docente
export const updatePersonalNoDocente = (req, res) => {
    try {
        const { id } = req.params;
        const {
            dni, nombres, apellido_paterno, apellido_materno,
            cargo, area, telefono, email, activo
        } = req.body;

        const db = getDatabase();
        db.prepare(`
            UPDATE personal_no_docente SET
                dni = ?, nombres = ?, apellido_paterno = ?, apellido_materno = ?,
                cargo = ?, area = ?, telefono = ?, email = ?, activo = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(dni, nombres, apellido_paterno, apellido_materno, cargo, area, telefono, email, activo ? 1 : 0, id);

        res.json({ success: true, message: 'Personal no docente actualizado' });
    } catch (error) {
        console.error('Error actualizando personal no docente:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar personal no docente' });
    }
};
