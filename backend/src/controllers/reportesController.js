import { getDatabase } from '../database/connection.js';

// Reporte de matrícula semestral
export const reporteMatriculaSemestral = (req, res) => {
    try {
        const { periodo_id } = req.query;
        const db = getDatabase();

        if (!periodo_id) {
            return res.status(400).json({ success: false, message: 'ID de periodo es requerido' });
        }

        const periodo = db.prepare('SELECT * FROM periodos_lectivos WHERE id = ?').get(periodo_id);
        if (!periodo) {
            return res.status(404).json({ success: false, message: 'Periodo no encontrado' });
        }

        // Resumen general
        const resumen = db.prepare(`
            SELECT 
                COUNT(*) as total_matriculas,
                SUM(CASE WHEN estado = 'activa' THEN 1 ELSE 0 END) as activas,
                SUM(CASE WHEN estado = 'anulada' THEN 1 ELSE 0 END) as anuladas,
                SUM(CASE WHEN condicion = 'regular' THEN 1 ELSE 0 END) as regulares,
                SUM(CASE WHEN condicion = 'irregular' THEN 1 ELSE 0 END) as irregulares,
                SUM(CASE WHEN condicion = 'repitente' THEN 1 ELSE 0 END) as repitentes
            FROM matriculas WHERE periodo_id = ?
        `).get(periodo_id);

        // Por programa
        const porPrograma = db.prepare(`
            SELECT p.codigo, p.nombre as programa,
                   COUNT(*) as total,
                   SUM(CASE WHEN m.estado = 'activa' THEN 1 ELSE 0 END) as activas
            FROM matriculas m
            JOIN estudiantes e ON m.estudiante_id = e.id
            JOIN programas_estudio p ON e.programa_id = p.id
            WHERE m.periodo_id = ?
            GROUP BY p.id
            ORDER BY p.nombre
        `).all(periodo_id);

        // Por ciclo y turno
        const porCicloTurno = db.prepare(`
            SELECT m.ciclo, t.nombre as turno, COUNT(*) as total
            FROM matriculas m
            LEFT JOIN turnos t ON m.turno_id = t.id
            WHERE m.periodo_id = ? AND m.estado = 'activa'
            GROUP BY m.ciclo, t.id
            ORDER BY m.ciclo, t.id
        `).all(periodo_id);

        // Por género
        const porGenero = db.prepare(`
            SELECT e.genero, COUNT(*) as total
            FROM matriculas m
            JOIN estudiantes e ON m.estudiante_id = e.id
            WHERE m.periodo_id = ? AND m.estado = 'activa'
            GROUP BY e.genero
        `).all(periodo_id);

        // Lista detallada
        const detalle = db.prepare(`
            SELECT m.codigo_matricula, m.ciclo, m.condicion, m.fecha_matricula,
                   e.codigo_estudiante, e.dni, e.nombres, e.apellido_paterno, e.apellido_materno,
                   p.nombre as programa, t.nombre as turno
            FROM matriculas m
            JOIN estudiantes e ON m.estudiante_id = e.id
            LEFT JOIN programas_estudio p ON e.programa_id = p.id
            LEFT JOIN turnos t ON m.turno_id = t.id
            WHERE m.periodo_id = ? AND m.estado = 'activa'
            ORDER BY p.nombre, m.ciclo, e.apellido_paterno
        `).all(periodo_id);

        res.json({
            success: true,
            data: {
                periodo,
                resumen,
                porPrograma,
                porCicloTurno,
                porGenero,
                detalle
            }
        });
    } catch (error) {
        console.error('Error generando reporte:', error);
        res.status(500).json({ success: false, message: 'Error al generar reporte' });
    }
};

// Reporte de notas por periodo
export const reporteNotasPeriodo = (req, res) => {
    try {
        const { periodo_id, programa_id } = req.query;
        const db = getDatabase();

        if (!periodo_id) {
            return res.status(400).json({ success: false, message: 'ID de periodo es requerido' });
        }

        let query = `
            SELECT e.codigo_estudiante, e.dni, e.nombres, e.apellido_paterno, e.apellido_materno,
                   p.nombre as programa,
                   ud.codigo as unidad_codigo, ud.nombre as unidad_nombre, ud.ciclo, ud.creditos,
                   nf.nota_final, nf.estado as estado_nota, nf.fecha_cierre,
                   d.nombres as docente_nombres, d.apellido_paterno as docente_apellido
            FROM matricula_detalle md
            JOIN matriculas m ON md.matricula_id = m.id
            JOIN estudiantes e ON m.estudiante_id = e.id
            JOIN unidades_didacticas ud ON md.unidad_didactica_id = ud.id
            LEFT JOIN notas_finales nf ON md.id = nf.matricula_detalle_id
            LEFT JOIN docente_unidad du ON md.docente_unidad_id = du.id
            LEFT JOIN docentes d ON du.docente_id = d.id
            LEFT JOIN programas_estudio p ON e.programa_id = p.id
            WHERE m.periodo_id = ? AND m.estado = 'activa'
        `;
        const params = [periodo_id];

        if (programa_id) {
            query += ' AND e.programa_id = ?';
            params.push(programa_id);
        }

        query += ' ORDER BY p.nombre, e.apellido_paterno, e.nombres, ud.ciclo, ud.nombre';

        const notas = db.prepare(query).all(...params);

        // Estadísticas
        const estadisticas = db.prepare(`
            SELECT 
                COUNT(DISTINCT m.estudiante_id) as total_estudiantes,
                COUNT(md.id) as total_matriculas_ud,
                SUM(CASE WHEN nf.estado = 'aprobado' THEN 1 ELSE 0 END) as aprobados,
                SUM(CASE WHEN nf.estado = 'desaprobado' THEN 1 ELSE 0 END) as desaprobados,
                SUM(CASE WHEN nf.nota_final IS NULL THEN 1 ELSE 0 END) as pendientes,
                ROUND(AVG(nf.nota_final), 2) as promedio_general
            FROM matricula_detalle md
            JOIN matriculas m ON md.matricula_id = m.id
            LEFT JOIN notas_finales nf ON md.id = nf.matricula_detalle_id
            WHERE m.periodo_id = ? AND m.estado = 'activa'
        `).get(periodo_id);

        res.json({
            success: true,
            data: { notas, estadisticas }
        });
    } catch (error) {
        console.error('Error generando reporte de notas:', error);
        res.status(500).json({ success: false, message: 'Error al generar reporte' });
    }
};

// Reporte de actas pendientes
export const reporteActasPendientes = (req, res) => {
    try {
        const { periodo_id } = req.query;
        const db = getDatabase();

        const periodoActivo = periodo_id || 
            db.prepare('SELECT id FROM periodos_lectivos WHERE activo = 1').get()?.id;

        if (!periodoActivo) {
            return res.status(400).json({ success: false, message: 'No hay periodo activo' });
        }

        // Asignaciones sin acta cerrada
        const pendientes = db.prepare(`
            SELECT du.id, du.seccion,
                   ud.nombre as unidad_nombre, ud.codigo as unidad_codigo,
                   d.nombres as docente_nombres, d.apellido_paterno as docente_apellido,
                   t.nombre as turno_nombre,
                   p.nombre as programa_nombre,
                   (SELECT COUNT(*) FROM matricula_detalle md 
                    JOIN matriculas m ON md.matricula_id = m.id 
                    WHERE md.docente_unidad_id = du.id AND m.estado = 'activa') as total_estudiantes,
                   (SELECT COUNT(*) FROM matricula_detalle md 
                    JOIN matriculas m ON md.matricula_id = m.id 
                    JOIN notas_finales nf ON md.id = nf.matricula_detalle_id
                    WHERE md.docente_unidad_id = du.id AND m.estado = 'activa') as con_nota_final
            FROM docente_unidad du
            JOIN unidades_didacticas ud ON du.unidad_didactica_id = ud.id
            JOIN docentes d ON du.docente_id = d.id
            JOIN turnos t ON du.turno_id = t.id
            JOIN planes_estudio pe ON ud.plan_estudio_id = pe.id
            JOIN programas_estudio p ON pe.programa_id = p.id
            WHERE du.periodo_id = ?
            AND du.id NOT IN (SELECT docente_unidad_id FROM actas_notas WHERE estado = 'cerrada')
            ORDER BY p.nombre, ud.nombre
        `).all(periodoActivo);

        res.json({ success: true, data: pendientes });
    } catch (error) {
        console.error('Error obteniendo actas pendientes:', error);
        res.status(500).json({ success: false, message: 'Error al obtener actas pendientes' });
    }
};

// Certificado de estudios (historial)
export const generarCertificadoEstudios = (req, res) => {
    try {
        const { estudiante_id } = req.params;
        const db = getDatabase();

        const estudiante = db.prepare(`
            SELECT e.*, p.nombre as programa_nombre, pe.nombre as plan_nombre
            FROM estudiantes e
            LEFT JOIN programas_estudio p ON e.programa_id = p.id
            LEFT JOIN planes_estudio pe ON e.plan_estudio_id = pe.id
            WHERE e.id = ?
        `).get(estudiante_id);

        if (!estudiante) {
            return res.status(404).json({ success: false, message: 'Estudiante no encontrado' });
        }

        const institucion = db.prepare('SELECT * FROM institucion LIMIT 1').get();

        // Obtener todas las notas finales
        const historial = db.prepare(`
            SELECT ud.codigo, ud.nombre as unidad, ud.ciclo, ud.creditos,
                   nf.nota_final, nf.estado, nf.fecha_cierre,
                   pl.nombre as periodo
            FROM matricula_detalle md
            JOIN matriculas m ON md.matricula_id = m.id
            JOIN unidades_didacticas ud ON md.unidad_didactica_id = ud.id
            JOIN periodos_lectivos pl ON m.periodo_id = pl.id
            LEFT JOIN notas_finales nf ON md.id = nf.matricula_detalle_id
            WHERE m.estudiante_id = ? AND m.estado != 'anulada' AND nf.nota_final IS NOT NULL
            ORDER BY pl.anio, pl.semestre, ud.ciclo, ud.nombre
        `).all(estudiante_id);

        // Calcular estadísticas
        let totalCreditos = 0;
        let creditosAprobados = 0;
        let sumaNotas = 0;
        let countNotas = 0;

        historial.forEach(item => {
            totalCreditos += item.creditos;
            if (item.estado === 'aprobado') {
                creditosAprobados += item.creditos;
            }
            if (item.nota_final) {
                sumaNotas += item.nota_final * item.creditos;
                countNotas += item.creditos;
            }
        });

        const promedioGeneral = countNotas > 0 ? Math.round((sumaNotas / countNotas) * 100) / 100 : 0;

        // Registrar certificado
        const codigo = `CERT-${new Date().getFullYear()}-${String(estudiante.id).padStart(5, '0')}-${Date.now()}`;
        db.prepare(`
            INSERT INTO certificados (estudiante_id, tipo, codigo, emitido_por)
            VALUES (?, 'estudios', ?, ?)
        `).run(estudiante_id, codigo, req.user.id);

        res.json({
            success: true,
            data: {
                codigo_certificado: codigo,
                fecha_emision: new Date().toISOString().split('T')[0],
                institucion,
                estudiante: {
                    codigo: estudiante.codigo_estudiante,
                    dni: estudiante.dni,
                    nombre_completo: `${estudiante.apellido_paterno} ${estudiante.apellido_materno || ''} ${estudiante.nombres}`.trim(),
                    programa: estudiante.programa_nombre,
                    plan: estudiante.plan_nombre
                },
                historial,
                resumen: {
                    total_creditos: totalCreditos,
                    creditos_aprobados: creditosAprobados,
                    promedio_general: promedioGeneral,
                    total_unidades: historial.length,
                    unidades_aprobadas: historial.filter(h => h.estado === 'aprobado').length
                }
            }
        });
    } catch (error) {
        console.error('Error generando certificado:', error);
        res.status(500).json({ success: false, message: 'Error al generar certificado' });
    }
};

// Constancia de matrícula
export const generarConstanciaMatricula = (req, res) => {
    try {
        const { matricula_id } = req.params;
        const db = getDatabase();

        const matricula = db.prepare(`
            SELECT m.*, 
                   e.codigo_estudiante, e.dni, e.nombres, e.apellido_paterno, e.apellido_materno,
                   p.nombre as programa_nombre, pl.nombre as periodo_nombre, t.nombre as turno_nombre
            FROM matriculas m
            JOIN estudiantes e ON m.estudiante_id = e.id
            JOIN periodos_lectivos pl ON m.periodo_id = pl.id
            LEFT JOIN programas_estudio p ON e.programa_id = p.id
            LEFT JOIN turnos t ON m.turno_id = t.id
            WHERE m.id = ?
        `).get(matricula_id);

        if (!matricula) {
            return res.status(404).json({ success: false, message: 'Matrícula no encontrada' });
        }

        const institucion = db.prepare('SELECT * FROM institucion LIMIT 1').get();

        const detalles = db.prepare(`
            SELECT ud.codigo, ud.nombre, ud.ciclo, ud.creditos, ud.horas_teoria, ud.horas_practica
            FROM matricula_detalle md
            JOIN unidades_didacticas ud ON md.unidad_didactica_id = ud.id
            WHERE md.matricula_id = ?
            ORDER BY ud.ciclo, ud.nombre
        `).all(matricula_id);

        const totalCreditos = detalles.reduce((sum, d) => sum + d.creditos, 0);
        const totalHoras = detalles.reduce((sum, d) => sum + d.horas_teoria + d.horas_practica, 0);

        res.json({
            success: true,
            data: {
                institucion,
                matricula: {
                    codigo: matricula.codigo_matricula,
                    fecha: matricula.fecha_matricula,
                    periodo: matricula.periodo_nombre,
                    ciclo: matricula.ciclo,
                    turno: matricula.turno_nombre,
                    condicion: matricula.condicion,
                    estado: matricula.estado
                },
                estudiante: {
                    codigo: matricula.codigo_estudiante,
                    dni: matricula.dni,
                    nombre_completo: `${matricula.apellido_paterno} ${matricula.apellido_materno || ''} ${matricula.nombres}`.trim(),
                    programa: matricula.programa_nombre
                },
                unidades: detalles,
                resumen: {
                    total_unidades: detalles.length,
                    total_creditos: totalCreditos,
                    total_horas: totalHoras
                }
            }
        });
    } catch (error) {
        console.error('Error generando constancia:', error);
        res.status(500).json({ success: false, message: 'Error al generar constancia' });
    }
};

// Lista de certificados emitidos
export const getCertificados = (req, res) => {
    try {
        const { estudiante_id, tipo } = req.query;
        const db = getDatabase();

        let query = `
            SELECT c.*, 
                   e.codigo_estudiante, e.nombres, e.apellido_paterno, e.apellido_materno,
                   u.email as emitido_por_email
            FROM certificados c
            JOIN estudiantes e ON c.estudiante_id = e.id
            LEFT JOIN usuarios u ON c.emitido_por = u.id
            WHERE 1=1
        `;
        const params = [];

        if (estudiante_id) {
            query += ' AND c.estudiante_id = ?';
            params.push(estudiante_id);
        }
        if (tipo) {
            query += ' AND c.tipo = ?';
            params.push(tipo);
        }

        query += ' ORDER BY c.fecha_emision DESC';
        const certificados = db.prepare(query).all(...params);

        res.json({ success: true, data: certificados });
    } catch (error) {
        console.error('Error obteniendo certificados:', error);
        res.status(500).json({ success: false, message: 'Error al obtener certificados' });
    }
};

// Dashboard general (admin)
export const getDashboard = (req, res) => {
    try {
        const db = getDatabase();

        const periodoActivo = db.prepare('SELECT * FROM periodos_lectivos WHERE activo = 1').get();

        // Conteos generales
        const totalEstudiantes = db.prepare("SELECT COUNT(*) as count FROM estudiantes WHERE estado = 'activo'").get();
        const totalDocentes = db.prepare('SELECT COUNT(*) as count FROM docentes WHERE activo = 1').get();
        const totalProgramas = db.prepare('SELECT COUNT(*) as count FROM programas_estudio WHERE activo = 1').get();

        let matriculasActivas = { count: 0 };
        let estadisticasMatricula = {};

        if (periodoActivo) {
            matriculasActivas = db.prepare(`
                SELECT COUNT(*) as count FROM matriculas WHERE periodo_id = ? AND estado = 'activa'
            `).get(periodoActivo.id);

            // Por programa
            const porPrograma = db.prepare(`
                SELECT p.nombre, COUNT(*) as total
                FROM matriculas m
                JOIN estudiantes e ON m.estudiante_id = e.id
                JOIN programas_estudio p ON e.programa_id = p.id
                WHERE m.periodo_id = ? AND m.estado = 'activa'
                GROUP BY p.id
                ORDER BY total DESC
            `).all(periodoActivo.id);

            // Por ciclo
            const porCiclo = db.prepare(`
                SELECT ciclo, COUNT(*) as total
                FROM matriculas
                WHERE periodo_id = ? AND estado = 'activa'
                GROUP BY ciclo ORDER BY ciclo
            `).all(periodoActivo.id);

            estadisticasMatricula = { porPrograma, porCiclo };
        }

        res.json({
            success: true,
            data: {
                periodoActivo,
                resumen: {
                    estudiantes: totalEstudiantes.count,
                    docentes: totalDocentes.count,
                    programas: totalProgramas.count,
                    matriculasActivas: matriculasActivas.count
                },
                estadisticasMatricula
            }
        });
    } catch (error) {
        console.error('Error obteniendo dashboard:', error);
        res.status(500).json({ success: false, message: 'Error al obtener dashboard' });
    }
};
