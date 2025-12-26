import { getDatabase } from '../database/connection.js';

// Obtener estudiantes matriculados en una asignación de docente
export const getEstudiantesAsignacion = (req, res) => {
    try {
        const { docente_unidad_id } = req.params;
        const db = getDatabase();

        const estudiantes = db.prepare(`
            SELECT md.id as matricula_detalle_id, md.estado, md.numero_vez,
                   e.id as estudiante_id, e.codigo_estudiante, e.nombres, e.apellido_paterno, e.apellido_materno,
                   m.codigo_matricula,
                   nf.nota_final, nf.estado as estado_nota
            FROM matricula_detalle md
            JOIN matriculas m ON md.matricula_id = m.id
            JOIN estudiantes e ON m.estudiante_id = e.id
            LEFT JOIN notas_finales nf ON md.id = nf.matricula_detalle_id
            WHERE md.docente_unidad_id = ? AND m.estado = 'activa'
            ORDER BY e.apellido_paterno, e.apellido_materno, e.nombres
        `).all(docente_unidad_id);

        res.json({ success: true, data: estudiantes });
    } catch (error) {
        console.error('Error obteniendo estudiantes:', error);
        res.status(500).json({ success: false, message: 'Error al obtener estudiantes' });
    }
};

// Obtener criterios de evaluación de una asignación
export const getCriteriosEvaluacion = (req, res) => {
    try {
        const { docente_unidad_id } = req.params;
        const db = getDatabase();

        const criterios = db.prepare(`
            SELECT * FROM criterios_evaluacion 
            WHERE docente_unidad_id = ?
            ORDER BY orden
        `).all(docente_unidad_id);

        res.json({ success: true, data: criterios });
    } catch (error) {
        console.error('Error obteniendo criterios:', error);
        res.status(500).json({ success: false, message: 'Error al obtener criterios' });
    }
};

// Crear/actualizar criterios de evaluación
export const saveCriterios = (req, res) => {
    try {
        const { docente_unidad_id } = req.params;
        const { criterios } = req.body;

        if (!criterios || !Array.isArray(criterios)) {
            return res.status(400).json({ success: false, message: 'Criterios son requeridos' });
        }

        const db = getDatabase();

        // Eliminar criterios existentes
        db.prepare('DELETE FROM criterios_evaluacion WHERE docente_unidad_id = ?').run(docente_unidad_id);

        // Insertar nuevos criterios
        const insert = db.prepare(`
            INSERT INTO criterios_evaluacion (docente_unidad_id, nombre, peso, orden)
            VALUES (?, ?, ?, ?)
        `);

        criterios.forEach((criterio, index) => {
            insert.run(docente_unidad_id, criterio.nombre, criterio.peso || 1, index + 1);
        });

        res.json({ success: true, message: 'Criterios guardados' });
    } catch (error) {
        console.error('Error guardando criterios:', error);
        res.status(500).json({ success: false, message: 'Error al guardar criterios' });
    }
};

// Obtener notas de un estudiante en una asignación
export const getNotasEstudiante = (req, res) => {
    try {
        const { matricula_detalle_id } = req.params;
        const db = getDatabase();

        const notas = db.prepare(`
            SELECT n.*, c.nombre as criterio_nombre, c.peso
            FROM notas n
            LEFT JOIN criterios_evaluacion c ON n.criterio_id = c.id
            WHERE n.matricula_detalle_id = ?
            ORDER BY c.orden
        `).all(matricula_detalle_id);

        const notaFinal = db.prepare(`
            SELECT * FROM notas_finales WHERE matricula_detalle_id = ?
        `).get(matricula_detalle_id);

        res.json({ success: true, data: { notas, notaFinal } });
    } catch (error) {
        console.error('Error obteniendo notas:', error);
        res.status(500).json({ success: false, message: 'Error al obtener notas' });
    }
};

// Registrar nota
export const registrarNota = (req, res) => {
    try {
        const { matricula_detalle_id, criterio_id, nota, observaciones } = req.body;

        if (matricula_detalle_id === undefined || nota === undefined) {
            return res.status(400).json({ 
                success: false, 
                message: 'Matrícula detalle y nota son requeridos' 
            });
        }

        if (nota < 0 || nota > 20) {
            return res.status(400).json({ 
                success: false, 
                message: 'La nota debe estar entre 0 y 20' 
            });
        }

        const db = getDatabase();

        // Verificar si ya existe la nota
        const existing = db.prepare(`
            SELECT id FROM notas 
            WHERE matricula_detalle_id = ? AND (criterio_id = ? OR (criterio_id IS NULL AND ? IS NULL))
        `).get(matricula_detalle_id, criterio_id, criterio_id);

        if (existing) {
            db.prepare(`
                UPDATE notas SET nota = ?, observaciones = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `).run(nota, observaciones, existing.id);
        } else {
            db.prepare(`
                INSERT INTO notas (matricula_detalle_id, criterio_id, nota, registrado_por, observaciones)
                VALUES (?, ?, ?, ?, ?)
            `).run(matricula_detalle_id, criterio_id, nota, req.user.id, observaciones);
        }

        res.json({ success: true, message: 'Nota registrada' });
    } catch (error) {
        console.error('Error registrando nota:', error);
        res.status(500).json({ success: false, message: 'Error al registrar nota' });
    }
};

// Registrar notas en lote
export const registrarNotasLote = (req, res) => {
    try {
        const { notas } = req.body;

        if (!notas || !Array.isArray(notas)) {
            return res.status(400).json({ success: false, message: 'Notas son requeridas' });
        }

        const db = getDatabase();

        const upsert = db.prepare(`
            INSERT INTO notas (matricula_detalle_id, criterio_id, nota, registrado_por, observaciones)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(matricula_detalle_id, criterio_id) DO UPDATE SET
                nota = excluded.nota,
                observaciones = excluded.observaciones,
                updated_at = CURRENT_TIMESTAMP
        `);

        // SQLite no tiene ON CONFLICT para múltiples columnas fácilmente, usamos otra estrategia
        for (const notaData of notas) {
            if (notaData.nota < 0 || notaData.nota > 20) continue;

            const existing = db.prepare(`
                SELECT id FROM notas 
                WHERE matricula_detalle_id = ? AND criterio_id IS ?
            `).get(notaData.matricula_detalle_id, notaData.criterio_id);

            if (existing) {
                db.prepare(`
                    UPDATE notas SET nota = ?, observaciones = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ?
                `).run(notaData.nota, notaData.observaciones, existing.id);
            } else {
                db.prepare(`
                    INSERT INTO notas (matricula_detalle_id, criterio_id, nota, registrado_por, observaciones)
                    VALUES (?, ?, ?, ?, ?)
                `).run(notaData.matricula_detalle_id, notaData.criterio_id, notaData.nota, req.user.id, notaData.observaciones);
            }
        }

        res.json({ success: true, message: 'Notas registradas' });
    } catch (error) {
        console.error('Error registrando notas:', error);
        res.status(500).json({ success: false, message: 'Error al registrar notas' });
    }
};

// Calcular y guardar nota final
export const calcularNotaFinal = (req, res) => {
    try {
        const { matricula_detalle_id } = req.params;
        const db = getDatabase();

        // Obtener notas con sus pesos
        const notas = db.prepare(`
            SELECT n.nota, COALESCE(c.peso, 1) as peso
            FROM notas n
            LEFT JOIN criterios_evaluacion c ON n.criterio_id = c.id
            WHERE n.matricula_detalle_id = ?
        `).all(matricula_detalle_id);

        if (notas.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'No hay notas registradas para calcular el promedio' 
            });
        }

        // Calcular promedio ponderado
        let sumaPonderada = 0;
        let sumaPesos = 0;
        for (const nota of notas) {
            sumaPonderada += nota.nota * nota.peso;
            sumaPesos += nota.peso;
        }
        const notaFinal = Math.round((sumaPonderada / sumaPesos) * 100) / 100;
        const estado = notaFinal >= 13 ? 'aprobado' : 'desaprobado';

        // Guardar nota final
        const existing = db.prepare('SELECT id FROM notas_finales WHERE matricula_detalle_id = ?').get(matricula_detalle_id);

        if (existing) {
            db.prepare(`
                UPDATE notas_finales SET nota_final = ?, estado = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `).run(notaFinal, estado, existing.id);
        } else {
            db.prepare(`
                INSERT INTO notas_finales (matricula_detalle_id, nota_final, estado)
                VALUES (?, ?, ?)
            `).run(matricula_detalle_id, notaFinal, estado);
        }

        // Actualizar estado en matricula_detalle
        db.prepare(`
            UPDATE matricula_detalle SET estado = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(estado, matricula_detalle_id);

        res.json({ 
            success: true, 
            message: 'Nota final calculada',
            data: { nota_final: notaFinal, estado }
        });
    } catch (error) {
        console.error('Error calculando nota final:', error);
        res.status(500).json({ success: false, message: 'Error al calcular nota final' });
    }
};

// Cerrar notas (finalizar acta)
export const cerrarNotas = (req, res) => {
    try {
        const { docente_unidad_id } = req.params;
        const db = getDatabase();

        // Verificar que todos los estudiantes tengan nota final
        const sinNota = db.prepare(`
            SELECT COUNT(*) as count
            FROM matricula_detalle md
            JOIN matriculas m ON md.matricula_id = m.id
            LEFT JOIN notas_finales nf ON md.id = nf.matricula_detalle_id
            WHERE md.docente_unidad_id = ? AND m.estado = 'activa' AND nf.id IS NULL
        `).get(docente_unidad_id);

        if (sinNota.count > 0) {
            return res.status(400).json({ 
                success: false, 
                message: `Hay ${sinNota.count} estudiantes sin nota final registrada` 
            });
        }

        // Generar código de acta
        const countActas = db.prepare('SELECT COUNT(*) as count FROM actas_notas').get();
        const codigo_acta = `ACTA-${new Date().getFullYear()}-${String(countActas.count + 1).padStart(5, '0')}`;

        // Crear acta
        const result = db.prepare(`
            INSERT INTO actas_notas (docente_unidad_id, codigo_acta, estado, generado_por)
            VALUES (?, ?, 'cerrada', ?)
        `).run(docente_unidad_id, codigo_acta, req.user.id);

        // Actualizar notas finales
        db.prepare(`
            UPDATE notas_finales SET fecha_cierre = CURRENT_TIMESTAMP, cerrado_por = ?
            WHERE matricula_detalle_id IN (
                SELECT md.id FROM matricula_detalle md
                JOIN matriculas m ON md.matricula_id = m.id
                WHERE md.docente_unidad_id = ? AND m.estado = 'activa'
            )
        `).run(req.user.id, docente_unidad_id);

        res.json({ 
            success: true, 
            message: 'Notas cerradas y acta generada',
            data: { acta_id: result.lastInsertRowid, codigo: codigo_acta }
        });
    } catch (error) {
        console.error('Error cerrando notas:', error);
        res.status(500).json({ success: false, message: 'Error al cerrar notas' });
    }
};

// Obtener actas
export const getActas = (req, res) => {
    try {
        const { periodo_id, docente_id } = req.query;
        const db = getDatabase();

        let query = `
            SELECT a.*, 
                   du.seccion, ud.nombre as unidad_nombre, ud.codigo as unidad_codigo,
                   d.nombres as docente_nombres, d.apellido_paterno as docente_apellido,
                   pl.nombre as periodo_nombre,
                   u.email as generado_por_email
            FROM actas_notas a
            JOIN docente_unidad du ON a.docente_unidad_id = du.id
            JOIN unidades_didacticas ud ON du.unidad_didactica_id = ud.id
            JOIN docentes d ON du.docente_id = d.id
            JOIN periodos_lectivos pl ON du.periodo_id = pl.id
            LEFT JOIN usuarios u ON a.generado_por = u.id
            WHERE 1=1
        `;
        const params = [];

        if (periodo_id) {
            query += ' AND du.periodo_id = ?';
            params.push(periodo_id);
        }
        if (docente_id) {
            query += ' AND du.docente_id = ?';
            params.push(docente_id);
        }

        query += ' ORDER BY a.fecha_generacion DESC';
        const actas = db.prepare(query).all(...params);

        res.json({ success: true, data: actas });
    } catch (error) {
        console.error('Error obteniendo actas:', error);
        res.status(500).json({ success: false, message: 'Error al obtener actas' });
    }
};

// Obtener detalle de acta
export const getActaDetalle = (req, res) => {
    try {
        const { id } = req.params;
        const db = getDatabase();

        const acta = db.prepare(`
            SELECT a.*, 
                   du.seccion, ud.nombre as unidad_nombre, ud.codigo as unidad_codigo, ud.creditos,
                   d.nombres as docente_nombres, d.apellido_paterno as docente_apellido, d.apellido_materno as docente_apellido_m,
                   pl.nombre as periodo_nombre, t.nombre as turno_nombre,
                   p.nombre as programa_nombre
            FROM actas_notas a
            JOIN docente_unidad du ON a.docente_unidad_id = du.id
            JOIN unidades_didacticas ud ON du.unidad_didactica_id = ud.id
            JOIN docentes d ON du.docente_id = d.id
            JOIN periodos_lectivos pl ON du.periodo_id = pl.id
            JOIN turnos t ON du.turno_id = t.id
            JOIN planes_estudio pe ON ud.plan_estudio_id = pe.id
            JOIN programas_estudio p ON pe.programa_id = p.id
            WHERE a.id = ?
        `).get(id);

        if (!acta) {
            return res.status(404).json({ success: false, message: 'Acta no encontrada' });
        }

        // Obtener estudiantes con notas
        const estudiantes = db.prepare(`
            SELECT e.codigo_estudiante, e.nombres, e.apellido_paterno, e.apellido_materno, e.dni,
                   nf.nota_final, nf.estado, nf.fecha_cierre
            FROM matricula_detalle md
            JOIN matriculas m ON md.matricula_id = m.id
            JOIN estudiantes e ON m.estudiante_id = e.id
            LEFT JOIN notas_finales nf ON md.id = nf.matricula_detalle_id
            WHERE md.docente_unidad_id = ? AND m.estado != 'anulada'
            ORDER BY e.apellido_paterno, e.apellido_materno, e.nombres
        `).all(acta.docente_unidad_id);

        res.json({ success: true, data: { ...acta, estudiantes } });
    } catch (error) {
        console.error('Error obteniendo acta:', error);
        res.status(500).json({ success: false, message: 'Error al obtener acta' });
    }
};

// Mis unidades para registro de notas (docente)
export const getMisUnidadesNotas = (req, res) => {
    try {
        const db = getDatabase();

        const docente = db.prepare('SELECT id FROM docentes WHERE usuario_id = ?').get(req.user.id);
        if (!docente) {
            return res.status(404).json({ success: false, message: 'Docente no encontrado' });
        }

        const periodoActivo = db.prepare('SELECT id, nombre FROM periodos_lectivos WHERE activo = 1').get();

        const unidades = db.prepare(`
            SELECT du.id as docente_unidad_id, du.seccion,
                   ud.id as unidad_id, ud.nombre as unidad_nombre, ud.codigo as unidad_codigo, ud.ciclo,
                   p.nombre as programa_nombre, t.nombre as turno_nombre,
                   (SELECT COUNT(*) FROM matricula_detalle md 
                    JOIN matriculas m ON md.matricula_id = m.id 
                    WHERE md.docente_unidad_id = du.id AND m.estado = 'activa') as total_estudiantes,
                   (SELECT COUNT(*) FROM actas_notas WHERE docente_unidad_id = du.id AND estado = 'cerrada') as acta_cerrada
            FROM docente_unidad du
            JOIN unidades_didacticas ud ON du.unidad_didactica_id = ud.id
            JOIN turnos t ON du.turno_id = t.id
            JOIN planes_estudio pe ON ud.plan_estudio_id = pe.id
            JOIN programas_estudio p ON pe.programa_id = p.id
            WHERE du.docente_id = ? AND du.periodo_id = ?
            ORDER BY p.nombre, ud.ciclo, ud.nombre
        `).all(docente.id, periodoActivo?.id);

        res.json({ 
            success: true, 
            data: { 
                periodo: periodoActivo, 
                unidades 
            } 
        });
    } catch (error) {
        console.error('Error obteniendo mis unidades:', error);
        res.status(500).json({ success: false, message: 'Error al obtener unidades' });
    }
};
