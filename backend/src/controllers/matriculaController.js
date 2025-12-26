import { getDatabase } from '../database/connection.js';

// === PREMATRÍCULAS ===

// Listar prematrículas
export const getPrematriculas = (req, res) => {
    try {
        const { periodo_id, estado } = req.query;
        const db = getDatabase();
        
        let query = `
            SELECT pm.*, 
                   e.codigo_estudiante, e.nombres, e.apellido_paterno, e.apellido_materno, e.dni,
                   pl.nombre as periodo_nombre
            FROM prematriculas pm
            JOIN estudiantes e ON pm.estudiante_id = e.id
            JOIN periodos_lectivos pl ON pm.periodo_id = pl.id
            WHERE 1=1
        `;
        const params = [];

        if (periodo_id) {
            query += ' AND pm.periodo_id = ?';
            params.push(periodo_id);
        }
        if (estado) {
            query += ' AND pm.estado = ?';
            params.push(estado);
        }

        query += ' ORDER BY pm.fecha_prematricula DESC';
        const prematriculas = db.prepare(query).all(...params);
        
        res.json({ success: true, data: prematriculas });
    } catch (error) {
        console.error('Error obteniendo prematrículas:', error);
        res.status(500).json({ success: false, message: 'Error al obtener prematrículas' });
    }
};

// Obtener prematrícula con detalle
export const getPrematricula = (req, res) => {
    try {
        const { id } = req.params;
        const db = getDatabase();
        
        const prematricula = db.prepare(`
            SELECT pm.*, 
                   e.codigo_estudiante, e.nombres, e.apellido_paterno, e.apellido_materno, e.dni,
                   e.programa_id, p.nombre as programa_nombre,
                   pl.nombre as periodo_nombre
            FROM prematriculas pm
            JOIN estudiantes e ON pm.estudiante_id = e.id
            JOIN periodos_lectivos pl ON pm.periodo_id = pl.id
            LEFT JOIN programas_estudio p ON e.programa_id = p.id
            WHERE pm.id = ?
        `).get(id);
        
        if (!prematricula) {
            return res.status(404).json({ success: false, message: 'Prematrícula no encontrada' });
        }

        const detalles = db.prepare(`
            SELECT pd.*, ud.nombre as unidad_nombre, ud.codigo as unidad_codigo, ud.ciclo, ud.creditos,
                   t.nombre as turno_nombre
            FROM prematricula_detalle pd
            JOIN unidades_didacticas ud ON pd.unidad_didactica_id = ud.id
            JOIN turnos t ON pd.turno_id = t.id
            WHERE pd.prematricula_id = ?
            ORDER BY ud.ciclo, ud.nombre
        `).all(id);

        res.json({ success: true, data: { ...prematricula, detalles } });
    } catch (error) {
        console.error('Error obteniendo prematrícula:', error);
        res.status(500).json({ success: false, message: 'Error al obtener prematrícula' });
    }
};

// Crear prematrícula
export const createPrematricula = (req, res) => {
    try {
        const { estudiante_id, periodo_id, unidades } = req.body;

        if (!estudiante_id || !periodo_id || !unidades || !unidades.length) {
            return res.status(400).json({ 
                success: false, 
                message: 'Estudiante, periodo y al menos una unidad didáctica son requeridos' 
            });
        }

        const db = getDatabase();

        // Verificar que no exista prematrícula para ese estudiante y periodo
        const existing = db.prepare(`
            SELECT id FROM prematriculas WHERE estudiante_id = ? AND periodo_id = ?
        `).get(estudiante_id, periodo_id);

        if (existing) {
            return res.status(400).json({ 
                success: false, 
                message: 'Ya existe una prematrícula para este estudiante en el periodo seleccionado' 
            });
        }

        // Crear prematrícula
        const result = db.prepare(`
            INSERT INTO prematriculas (estudiante_id, periodo_id, estado)
            VALUES (?, ?, 'pendiente')
        `).run(estudiante_id, periodo_id);

        const prematricula_id = result.lastInsertRowid;

        // Insertar detalles
        const insertDetalle = db.prepare(`
            INSERT INTO prematricula_detalle (prematricula_id, unidad_didactica_id, turno_id, seccion)
            VALUES (?, ?, ?, ?)
        `);

        for (const unidad of unidades) {
            insertDetalle.run(prematricula_id, unidad.unidad_didactica_id, unidad.turno_id, unidad.seccion || 'A');
        }

        res.status(201).json({
            success: true,
            message: 'Prematrícula creada exitosamente',
            data: { id: prematricula_id }
        });
    } catch (error) {
        console.error('Error creando prematrícula:', error);
        res.status(500).json({ success: false, message: 'Error al crear prematrícula' });
    }
};

// Aprobar/Rechazar prematrícula
export const updateEstadoPrematricula = (req, res) => {
    try {
        const { id } = req.params;
        const { estado, observaciones } = req.body;

        if (!['aprobada', 'rechazada', 'pendiente'].includes(estado)) {
            return res.status(400).json({ success: false, message: 'Estado inválido' });
        }

        const db = getDatabase();
        db.prepare(`
            UPDATE prematriculas SET estado = ?, observaciones = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(estado, observaciones, id);

        res.json({ success: true, message: `Prematrícula ${estado}` });
    } catch (error) {
        console.error('Error actualizando prematrícula:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar prematrícula' });
    }
};

// === MATRÍCULAS OFICIALES ===

// Listar matrículas
export const getMatriculas = (req, res) => {
    try {
        const { periodo_id, programa_id, estado, search } = req.query;
        const db = getDatabase();
        
        let query = `
            SELECT m.*, 
                   e.codigo_estudiante, e.nombres, e.apellido_paterno, e.apellido_materno, e.dni,
                   p.nombre as programa_nombre, pl.nombre as periodo_nombre, t.nombre as turno_nombre
            FROM matriculas m
            JOIN estudiantes e ON m.estudiante_id = e.id
            JOIN periodos_lectivos pl ON m.periodo_id = pl.id
            LEFT JOIN programas_estudio p ON e.programa_id = p.id
            LEFT JOIN turnos t ON m.turno_id = t.id
            WHERE 1=1
        `;
        const params = [];

        if (periodo_id) {
            query += ' AND m.periodo_id = ?';
            params.push(periodo_id);
        }
        if (programa_id) {
            query += ' AND e.programa_id = ?';
            params.push(programa_id);
        }
        if (estado) {
            query += ' AND m.estado = ?';
            params.push(estado);
        }
        if (search) {
            query += ' AND (e.nombres LIKE ? OR e.apellido_paterno LIKE ? OR e.codigo_estudiante LIKE ?)';
            const searchTerm = `%${search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        query += ' ORDER BY m.fecha_matricula DESC';
        const matriculas = db.prepare(query).all(...params);
        
        res.json({ success: true, data: matriculas });
    } catch (error) {
        console.error('Error obteniendo matrículas:', error);
        res.status(500).json({ success: false, message: 'Error al obtener matrículas' });
    }
};

// Obtener matrícula con detalle
export const getMatricula = (req, res) => {
    try {
        const { id } = req.params;
        const db = getDatabase();
        
        const matricula = db.prepare(`
            SELECT m.*, 
                   e.codigo_estudiante, e.nombres, e.apellido_paterno, e.apellido_materno, e.dni, e.email,
                   e.programa_id, p.nombre as programa_nombre, pe.nombre as plan_nombre,
                   pl.nombre as periodo_nombre, t.nombre as turno_nombre
            FROM matriculas m
            JOIN estudiantes e ON m.estudiante_id = e.id
            JOIN periodos_lectivos pl ON m.periodo_id = pl.id
            LEFT JOIN programas_estudio p ON e.programa_id = p.id
            LEFT JOIN planes_estudio pe ON e.plan_estudio_id = pe.id
            LEFT JOIN turnos t ON m.turno_id = t.id
            WHERE m.id = ?
        `).get(id);
        
        if (!matricula) {
            return res.status(404).json({ success: false, message: 'Matrícula no encontrada' });
        }

        const detalles = db.prepare(`
            SELECT md.*, ud.nombre as unidad_nombre, ud.codigo as unidad_codigo, ud.ciclo, ud.creditos,
                   ud.horas_teoria, ud.horas_practica,
                   d.nombres as docente_nombres, d.apellido_paterno as docente_apellido
            FROM matricula_detalle md
            JOIN unidades_didacticas ud ON md.unidad_didactica_id = ud.id
            LEFT JOIN docente_unidad du ON md.docente_unidad_id = du.id
            LEFT JOIN docentes d ON du.docente_id = d.id
            WHERE md.matricula_id = ?
            ORDER BY ud.ciclo, ud.nombre
        `).all(id);

        res.json({ success: true, data: { ...matricula, detalles } });
    } catch (error) {
        console.error('Error obteniendo matrícula:', error);
        res.status(500).json({ success: false, message: 'Error al obtener matrícula' });
    }
};

// Crear matrícula oficial
export const createMatricula = (req, res) => {
    try {
        const { estudiante_id, periodo_id, ciclo, turno_id, condicion, unidades, observaciones } = req.body;

        if (!estudiante_id || !periodo_id || !ciclo || !unidades || !unidades.length) {
            return res.status(400).json({ 
                success: false, 
                message: 'Estudiante, periodo, ciclo y unidades didácticas son requeridos' 
            });
        }

        const db = getDatabase();

        // Verificar que no exista matrícula para ese estudiante y periodo
        const existing = db.prepare(`
            SELECT id FROM matriculas WHERE estudiante_id = ? AND periodo_id = ?
        `).get(estudiante_id, periodo_id);

        if (existing) {
            return res.status(400).json({ 
                success: false, 
                message: 'Ya existe una matrícula para este estudiante en el periodo seleccionado' 
            });
        }

        // Verificar reglas de promoción (cupos disponibles)
        const estudiante = db.prepare('SELECT programa_id FROM estudiantes WHERE id = ?').get(estudiante_id);
        
        if (estudiante && turno_id) {
            const regla = db.prepare(`
                SELECT max_matriculados FROM reglas_promocion 
                WHERE programa_id = ? AND ciclo = ? AND turno_id = ? AND activo = 1
            `).get(estudiante.programa_id, ciclo, turno_id);

            if (regla) {
                const matriculados = db.prepare(`
                    SELECT COUNT(*) as count FROM matriculas m
                    JOIN estudiantes e ON m.estudiante_id = e.id
                    WHERE m.periodo_id = ? AND m.ciclo = ? AND m.turno_id = ? 
                    AND e.programa_id = ? AND m.estado = 'activa'
                `).get(periodo_id, ciclo, turno_id, estudiante.programa_id);

                if (matriculados.count >= regla.max_matriculados) {
                    return res.status(400).json({ 
                        success: false, 
                        message: `Se ha alcanzado el límite de ${regla.max_matriculados} matriculados para este ciclo y turno` 
                    });
                }
            }
        }

        // Generar código de matrícula
        const periodo = db.prepare('SELECT nombre FROM periodos_lectivos WHERE id = ?').get(periodo_id);
        const countMatriculas = db.prepare('SELECT COUNT(*) as count FROM matriculas WHERE periodo_id = ?').get(periodo_id);
        const codigo_matricula = `MAT-${periodo?.nombre || periodo_id}-${String(countMatriculas.count + 1).padStart(5, '0')}`;

        // Crear matrícula
        const result = db.prepare(`
            INSERT INTO matriculas (estudiante_id, periodo_id, codigo_matricula, ciclo, turno_id, condicion, observaciones)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(estudiante_id, periodo_id, codigo_matricula, ciclo, turno_id, condicion || 'regular', observaciones);

        const matricula_id = result.lastInsertRowid;

        // Insertar detalles
        const insertDetalle = db.prepare(`
            INSERT INTO matricula_detalle (matricula_id, unidad_didactica_id, docente_unidad_id, numero_vez)
            VALUES (?, ?, ?, ?)
        `);

        for (const unidad of unidades) {
            // Buscar asignación de docente
            let docente_unidad_id = null;
            if (turno_id) {
                const asignacion = db.prepare(`
                    SELECT id FROM docente_unidad 
                    WHERE unidad_didactica_id = ? AND periodo_id = ? AND turno_id = ?
                    LIMIT 1
                `).get(unidad.unidad_didactica_id, periodo_id, turno_id);
                docente_unidad_id = asignacion?.id;
            }

            insertDetalle.run(matricula_id, unidad.unidad_didactica_id, docente_unidad_id, unidad.numero_vez || 1);
        }

        // Actualizar ciclo actual del estudiante
        db.prepare('UPDATE estudiantes SET ciclo_actual = ? WHERE id = ?').run(ciclo, estudiante_id);

        res.status(201).json({
            success: true,
            message: 'Matrícula creada exitosamente',
            data: { id: matricula_id, codigo: codigo_matricula }
        });
    } catch (error) {
        console.error('Error creando matrícula:', error);
        res.status(500).json({ success: false, message: 'Error al crear matrícula' });
    }
};

// Crear matrícula desde prematrícula aprobada
export const matricularDesdePrematricula = (req, res) => {
    try {
        const { prematricula_id } = req.params;
        const { ciclo, condicion, observaciones } = req.body;

        const db = getDatabase();

        // Obtener prematrícula
        const prematricula = db.prepare(`
            SELECT pm.*, e.programa_id, e.turno_id as estudiante_turno
            FROM prematriculas pm
            JOIN estudiantes e ON pm.estudiante_id = e.id
            WHERE pm.id = ? AND pm.estado = 'aprobada'
        `).get(prematricula_id);

        if (!prematricula) {
            return res.status(404).json({ 
                success: false, 
                message: 'Prematrícula no encontrada o no está aprobada' 
            });
        }

        // Verificar que no exista matrícula
        const existing = db.prepare(`
            SELECT id FROM matriculas WHERE estudiante_id = ? AND periodo_id = ?
        `).get(prematricula.estudiante_id, prematricula.periodo_id);

        if (existing) {
            return res.status(400).json({ success: false, message: 'Ya existe una matrícula para este periodo' });
        }

        // Obtener detalles de prematrícula
        const detalles = db.prepare(`
            SELECT pd.*, t.id as turno_id
            FROM prematricula_detalle pd
            JOIN turnos t ON pd.turno_id = t.id
            WHERE pd.prematricula_id = ?
        `).all(prematricula_id);

        const turno_id = detalles[0]?.turno_id || prematricula.estudiante_turno;

        // Crear matrícula
        const periodo = db.prepare('SELECT nombre FROM periodos_lectivos WHERE id = ?').get(prematricula.periodo_id);
        const countMatriculas = db.prepare('SELECT COUNT(*) as count FROM matriculas WHERE periodo_id = ?').get(prematricula.periodo_id);
        const codigo_matricula = `MAT-${periodo?.nombre || prematricula.periodo_id}-${String(countMatriculas.count + 1).padStart(5, '0')}`;

        const result = db.prepare(`
            INSERT INTO matriculas (estudiante_id, periodo_id, codigo_matricula, ciclo, turno_id, condicion, observaciones)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(prematricula.estudiante_id, prematricula.periodo_id, codigo_matricula, ciclo, turno_id, condicion || 'regular', observaciones);

        const matricula_id = result.lastInsertRowid;

        // Insertar detalles
        const insertDetalle = db.prepare(`
            INSERT INTO matricula_detalle (matricula_id, unidad_didactica_id, docente_unidad_id, numero_vez)
            VALUES (?, ?, ?, ?)
        `);

        for (const detalle of detalles) {
            const asignacion = db.prepare(`
                SELECT id FROM docente_unidad 
                WHERE unidad_didactica_id = ? AND periodo_id = ? AND turno_id = ?
                LIMIT 1
            `).get(detalle.unidad_didactica_id, prematricula.periodo_id, detalle.turno_id);

            insertDetalle.run(matricula_id, detalle.unidad_didactica_id, asignacion?.id, 1);
        }

        res.status(201).json({
            success: true,
            message: 'Matrícula creada exitosamente desde prematrícula',
            data: { id: matricula_id, codigo: codigo_matricula }
        });
    } catch (error) {
        console.error('Error creando matrícula desde prematrícula:', error);
        res.status(500).json({ success: false, message: 'Error al crear matrícula' });
    }
};

// Actualizar estado de matrícula
export const updateEstadoMatricula = (req, res) => {
    try {
        const { id } = req.params;
        const { estado, observaciones } = req.body;

        if (!['activa', 'anulada', 'finalizada'].includes(estado)) {
            return res.status(400).json({ success: false, message: 'Estado inválido' });
        }

        const db = getDatabase();
        db.prepare(`
            UPDATE matriculas SET estado = ?, observaciones = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(estado, observaciones, id);

        res.json({ success: true, message: `Estado de matrícula actualizado a ${estado}` });
    } catch (error) {
        console.error('Error actualizando matrícula:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar matrícula' });
    }
};

// Obtener unidades disponibles para matrícula
export const getUnidadesDisponibles = (req, res) => {
    try {
        const { estudiante_id, periodo_id } = req.query;
        const db = getDatabase();

        if (!estudiante_id) {
            return res.status(400).json({ success: false, message: 'ID de estudiante es requerido' });
        }

        // Obtener información del estudiante
        const estudiante = db.prepare(`
            SELECT e.*, pe.id as plan_id
            FROM estudiantes e
            LEFT JOIN planes_estudio pe ON e.plan_estudio_id = pe.id
            WHERE e.id = ?
        `).get(estudiante_id);

        if (!estudiante) {
            return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
        }

        // Obtener unidades del plan de estudios
        const unidades = db.prepare(`
            SELECT ud.*, 
                (SELECT COUNT(*) FROM matricula_detalle md 
                 JOIN matriculas m ON md.matricula_id = m.id 
                 WHERE md.unidad_didactica_id = ud.id AND m.estudiante_id = ? 
                 AND md.estado IN ('aprobado')) as aprobado,
                (SELECT COUNT(*) FROM matricula_detalle md 
                 JOIN matriculas m ON md.matricula_id = m.id 
                 WHERE md.unidad_didactica_id = ud.id AND m.estudiante_id = ?) as veces_cursado
            FROM unidades_didacticas ud
            WHERE ud.plan_estudio_id = ? AND ud.activo = 1
            ORDER BY ud.ciclo, ud.nombre
        `).all(estudiante_id, estudiante_id, estudiante.plan_id);

        // Filtrar unidades no aprobadas
        const disponibles = unidades.filter(u => u.aprobado === 0);

        res.json({ success: true, data: { estudiante, unidades: disponibles } });
    } catch (error) {
        console.error('Error obteniendo unidades disponibles:', error);
        res.status(500).json({ success: false, message: 'Error al obtener unidades disponibles' });
    }
};

// Estadísticas de matrícula
export const getEstadisticasMatricula = (req, res) => {
    try {
        const { periodo_id } = req.query;
        const db = getDatabase();

        if (!periodo_id) {
            return res.status(400).json({ success: false, message: 'ID de periodo es requerido' });
        }

        // Total de matrículas por estado
        const porEstado = db.prepare(`
            SELECT estado, COUNT(*) as total
            FROM matriculas WHERE periodo_id = ?
            GROUP BY estado
        `).all(periodo_id);

        // Por programa
        const porPrograma = db.prepare(`
            SELECT p.nombre as programa, COUNT(*) as total
            FROM matriculas m
            JOIN estudiantes e ON m.estudiante_id = e.id
            JOIN programas_estudio p ON e.programa_id = p.id
            WHERE m.periodo_id = ? AND m.estado = 'activa'
            GROUP BY p.id
        `).all(periodo_id);

        // Por ciclo
        const porCiclo = db.prepare(`
            SELECT ciclo, COUNT(*) as total
            FROM matriculas WHERE periodo_id = ? AND estado = 'activa'
            GROUP BY ciclo ORDER BY ciclo
        `).all(periodo_id);

        // Por turno
        const porTurno = db.prepare(`
            SELECT t.nombre as turno, COUNT(*) as total
            FROM matriculas m
            JOIN turnos t ON m.turno_id = t.id
            WHERE m.periodo_id = ? AND m.estado = 'activa'
            GROUP BY t.id
        `).all(periodo_id);

        res.json({
            success: true,
            data: { porEstado, porPrograma, porCiclo, porTurno }
        });
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({ success: false, message: 'Error al obtener estadísticas' });
    }
};
