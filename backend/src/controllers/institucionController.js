import { getDatabase } from '../database/connection.js';

// Obtener información institucional
export const getInstitucion = (req, res) => {
    try {
        const db = getDatabase();
        const institucion = db.prepare('SELECT * FROM institucion LIMIT 1').get();

        res.json({
            success: true,
            data: institucion || {}
        });
    } catch (error) {
        console.error('Error obteniendo institución:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener información institucional'
        });
    }
};

// Actualizar información institucional
export const updateInstitucion = (req, res) => {
    try {
        const {
            codigo_modular, nombre, tipo_ies, dre, direccion,
            telefono, correo, pagina_web, otros
        } = req.body;

        const db = getDatabase();
        const existing = db.prepare('SELECT id FROM institucion LIMIT 1').get();

        if (existing) {
            db.prepare(`
                UPDATE institucion SET 
                    codigo_modular = ?, nombre = ?, tipo_ies = ?, dre = ?,
                    direccion = ?, telefono = ?, correo = ?, pagina_web = ?,
                    otros = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `).run(codigo_modular, nombre, tipo_ies, dre, direccion, telefono, correo, pagina_web, otros, existing.id);
        } else {
            db.prepare(`
                INSERT INTO institucion (codigo_modular, nombre, tipo_ies, dre, direccion, telefono, correo, pagina_web, otros)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(codigo_modular, nombre, tipo_ies, dre, direccion, telefono, correo, pagina_web, otros);
        }

        res.json({
            success: true,
            message: 'Información institucional actualizada'
        });
    } catch (error) {
        console.error('Error actualizando institución:', error);
        res.status(500).json({
            success: false,
            message: 'Error al actualizar información institucional'
        });
    }
};

// === PERIODOS LECTIVOS ===

export const getPeriodos = (req, res) => {
    try {
        const db = getDatabase();
        const periodos = db.prepare('SELECT * FROM periodos_lectivos ORDER BY anio DESC, semestre DESC').all();
        res.json({ success: true, data: periodos });
    } catch (error) {
        console.error('Error obteniendo periodos:', error);
        res.status(500).json({ success: false, message: 'Error al obtener periodos' });
    }
};

export const getPeriodoActivo = (req, res) => {
    try {
        const db = getDatabase();
        const periodo = db.prepare('SELECT * FROM periodos_lectivos WHERE activo = 1 LIMIT 1').get();
        res.json({ success: true, data: periodo });
    } catch (error) {
        console.error('Error obteniendo periodo activo:', error);
        res.status(500).json({ success: false, message: 'Error al obtener periodo activo' });
    }
};

export const createPeriodo = (req, res) => {
    try {
        const { nombre, anio, semestre, fecha_inicio, fecha_fin } = req.body;

        if (!nombre || !anio || !semestre) {
            return res.status(400).json({ success: false, message: 'Nombre, año y semestre son requeridos' });
        }

        const db = getDatabase();
        const result = db.prepare(`
            INSERT INTO periodos_lectivos (nombre, anio, semestre, fecha_inicio, fecha_fin)
            VALUES (?, ?, ?, ?, ?)
        `).run(nombre, anio, semestre, fecha_inicio, fecha_fin);

        res.status(201).json({
            success: true,
            message: 'Periodo creado exitosamente',
            data: { id: result.lastInsertRowid }
        });
    } catch (error) {
        console.error('Error creando periodo:', error);
        res.status(500).json({ success: false, message: 'Error al crear periodo' });
    }
};

export const updatePeriodo = (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, anio, semestre, fecha_inicio, fecha_fin, activo } = req.body;

        const db = getDatabase();
        
        // Si se activa este periodo, desactivar los demás
        if (activo === 1 || activo === true) {
            db.prepare('UPDATE periodos_lectivos SET activo = 0').run();
        }

        db.prepare(`
            UPDATE periodos_lectivos 
            SET nombre = ?, anio = ?, semestre = ?, fecha_inicio = ?, fecha_fin = ?, activo = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(nombre, anio, semestre, fecha_inicio, fecha_fin, activo ? 1 : 0, id);

        res.json({ success: true, message: 'Periodo actualizado' });
    } catch (error) {
        console.error('Error actualizando periodo:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar periodo' });
    }
};

export const deletePeriodo = (req, res) => {
    try {
        const { id } = req.params;
        const db = getDatabase();

        // Verificar si tiene matrículas
        const matriculas = db.prepare('SELECT COUNT(*) as count FROM matriculas WHERE periodo_id = ?').get(id);
        if (matriculas.count > 0) {
            return res.status(400).json({ success: false, message: 'No se puede eliminar un periodo con matrículas asociadas' });
        }

        db.prepare('DELETE FROM periodos_lectivos WHERE id = ?').run(id);
        res.json({ success: true, message: 'Periodo eliminado' });
    } catch (error) {
        console.error('Error eliminando periodo:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar periodo' });
    }
};

// === TURNOS ===

export const getTurnos = (req, res) => {
    try {
        const db = getDatabase();
        const turnos = db.prepare('SELECT * FROM turnos ORDER BY id').all();
        res.json({ success: true, data: turnos });
    } catch (error) {
        console.error('Error obteniendo turnos:', error);
        res.status(500).json({ success: false, message: 'Error al obtener turnos' });
    }
};

export const createTurno = (req, res) => {
    try {
        const { nombre, hora_inicio, hora_fin } = req.body;

        if (!nombre) {
            return res.status(400).json({ success: false, message: 'Nombre es requerido' });
        }

        const db = getDatabase();
        const result = db.prepare('INSERT INTO turnos (nombre, hora_inicio, hora_fin) VALUES (?, ?, ?)')
            .run(nombre, hora_inicio, hora_fin);

        res.status(201).json({ success: true, message: 'Turno creado', data: { id: result.lastInsertRowid } });
    } catch (error) {
        console.error('Error creando turno:', error);
        res.status(500).json({ success: false, message: 'Error al crear turno' });
    }
};

export const updateTurno = (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, hora_inicio, hora_fin, activo } = req.body;

        const db = getDatabase();
        db.prepare('UPDATE turnos SET nombre = ?, hora_inicio = ?, hora_fin = ?, activo = ? WHERE id = ?')
            .run(nombre, hora_inicio, hora_fin, activo ? 1 : 0, id);

        res.json({ success: true, message: 'Turno actualizado' });
    } catch (error) {
        console.error('Error actualizando turno:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar turno' });
    }
};

// === PROGRAMAS DE ESTUDIO ===

export const getProgramas = (req, res) => {
    try {
        const db = getDatabase();
        const programas = db.prepare('SELECT * FROM programas_estudio ORDER BY nombre').all();
        res.json({ success: true, data: programas });
    } catch (error) {
        console.error('Error obteniendo programas:', error);
        res.status(500).json({ success: false, message: 'Error al obtener programas' });
    }
};

export const getPrograma = (req, res) => {
    try {
        const { id } = req.params;
        const db = getDatabase();
        const programa = db.prepare('SELECT * FROM programas_estudio WHERE id = ?').get(id);
        
        if (!programa) {
            return res.status(404).json({ success: false, message: 'Programa no encontrado' });
        }

        res.json({ success: true, data: programa });
    } catch (error) {
        console.error('Error obteniendo programa:', error);
        res.status(500).json({ success: false, message: 'Error al obtener programa' });
    }
};

export const createPrograma = (req, res) => {
    try {
        const { codigo, nombre, descripcion, duracion_ciclos } = req.body;

        if (!nombre) {
            return res.status(400).json({ success: false, message: 'Nombre es requerido' });
        }

        const db = getDatabase();
        const result = db.prepare(`
            INSERT INTO programas_estudio (codigo, nombre, descripcion, duracion_ciclos)
            VALUES (?, ?, ?, ?)
        `).run(codigo, nombre, descripcion, duracion_ciclos || 6);

        res.status(201).json({ success: true, message: 'Programa creado', data: { id: result.lastInsertRowid } });
    } catch (error) {
        console.error('Error creando programa:', error);
        res.status(500).json({ success: false, message: 'Error al crear programa' });
    }
};

export const updatePrograma = (req, res) => {
    try {
        const { id } = req.params;
        const { codigo, nombre, descripcion, duracion_ciclos, activo } = req.body;

        const db = getDatabase();
        db.prepare(`
            UPDATE programas_estudio 
            SET codigo = ?, nombre = ?, descripcion = ?, duracion_ciclos = ?, activo = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(codigo, nombre, descripcion, duracion_ciclos, activo ? 1 : 0, id);

        res.json({ success: true, message: 'Programa actualizado' });
    } catch (error) {
        console.error('Error actualizando programa:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar programa' });
    }
};

// === PLANES DE ESTUDIO ===

export const getPlanes = (req, res) => {
    try {
        const { programa_id } = req.query;
        const db = getDatabase();
        
        let query = `
            SELECT pe.*, p.nombre as programa_nombre 
            FROM planes_estudio pe 
            JOIN programas_estudio p ON pe.programa_id = p.id
        `;
        
        if (programa_id) {
            query += ' WHERE pe.programa_id = ?';
            const planes = db.prepare(query).all(programa_id);
            return res.json({ success: true, data: planes });
        }

        const planes = db.prepare(query + ' ORDER BY pe.fecha_aprobacion DESC').all();
        res.json({ success: true, data: planes });
    } catch (error) {
        console.error('Error obteniendo planes:', error);
        res.status(500).json({ success: false, message: 'Error al obtener planes' });
    }
};

export const getPlan = (req, res) => {
    try {
        const { id } = req.params;
        const db = getDatabase();
        
        const plan = db.prepare(`
            SELECT pe.*, p.nombre as programa_nombre 
            FROM planes_estudio pe 
            JOIN programas_estudio p ON pe.programa_id = p.id 
            WHERE pe.id = ?
        `).get(id);
        
        if (!plan) {
            return res.status(404).json({ success: false, message: 'Plan no encontrado' });
        }

        // Obtener unidades didácticas del plan
        const unidades = db.prepare(`
            SELECT * FROM unidades_didacticas WHERE plan_estudio_id = ? ORDER BY ciclo, nombre
        `).all(id);

        res.json({ success: true, data: { ...plan, unidades } });
    } catch (error) {
        console.error('Error obteniendo plan:', error);
        res.status(500).json({ success: false, message: 'Error al obtener plan' });
    }
};

export const createPlan = (req, res) => {
    try {
        const { codigo, nombre, programa_id, resolucion, fecha_aprobacion } = req.body;

        if (!nombre || !programa_id) {
            return res.status(400).json({ success: false, message: 'Nombre y programa son requeridos' });
        }

        const db = getDatabase();
        const result = db.prepare(`
            INSERT INTO planes_estudio (codigo, nombre, programa_id, resolucion, fecha_aprobacion)
            VALUES (?, ?, ?, ?, ?)
        `).run(codigo, nombre, programa_id, resolucion, fecha_aprobacion);

        res.status(201).json({ success: true, message: 'Plan creado', data: { id: result.lastInsertRowid } });
    } catch (error) {
        console.error('Error creando plan:', error);
        res.status(500).json({ success: false, message: 'Error al crear plan' });
    }
};

export const updatePlan = (req, res) => {
    try {
        const { id } = req.params;
        const { codigo, nombre, programa_id, resolucion, fecha_aprobacion, activo } = req.body;

        const db = getDatabase();
        db.prepare(`
            UPDATE planes_estudio 
            SET codigo = ?, nombre = ?, programa_id = ?, resolucion = ?, fecha_aprobacion = ?, activo = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(codigo, nombre, programa_id, resolucion, fecha_aprobacion, activo ? 1 : 0, id);

        res.json({ success: true, message: 'Plan actualizado' });
    } catch (error) {
        console.error('Error actualizando plan:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar plan' });
    }
};

// === UNIDADES DIDÁCTICAS ===

export const getUnidadesDidacticas = (req, res) => {
    try {
        const { plan_id, ciclo } = req.query;
        const db = getDatabase();
        
        let query = `
            SELECT ud.*, pe.nombre as plan_nombre, p.nombre as programa_nombre
            FROM unidades_didacticas ud
            JOIN planes_estudio pe ON ud.plan_estudio_id = pe.id
            JOIN programas_estudio p ON pe.programa_id = p.id
            WHERE 1=1
        `;
        const params = [];

        if (plan_id) {
            query += ' AND ud.plan_estudio_id = ?';
            params.push(plan_id);
        }
        if (ciclo) {
            query += ' AND ud.ciclo = ?';
            params.push(ciclo);
        }

        query += ' ORDER BY ud.ciclo, ud.nombre';
        const unidades = db.prepare(query).all(...params);
        res.json({ success: true, data: unidades });
    } catch (error) {
        console.error('Error obteniendo unidades:', error);
        res.status(500).json({ success: false, message: 'Error al obtener unidades' });
    }
};

export const createUnidadDidactica = (req, res) => {
    try {
        const { codigo, nombre, plan_estudio_id, ciclo, creditos, horas_teoria, horas_practica, tipo } = req.body;

        if (!nombre || !plan_estudio_id || !ciclo) {
            return res.status(400).json({ success: false, message: 'Nombre, plan y ciclo son requeridos' });
        }

        const db = getDatabase();
        const result = db.prepare(`
            INSERT INTO unidades_didacticas (codigo, nombre, plan_estudio_id, ciclo, creditos, horas_teoria, horas_practica, tipo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(codigo, nombre, plan_estudio_id, ciclo, creditos || 2, horas_teoria || 0, horas_practica || 0, tipo || 'obligatorio');

        res.status(201).json({ success: true, message: 'Unidad didáctica creada', data: { id: result.lastInsertRowid } });
    } catch (error) {
        console.error('Error creando unidad:', error);
        res.status(500).json({ success: false, message: 'Error al crear unidad didáctica' });
    }
};

export const updateUnidadDidactica = (req, res) => {
    try {
        const { id } = req.params;
        const { codigo, nombre, ciclo, creditos, horas_teoria, horas_practica, tipo, activo } = req.body;

        const db = getDatabase();
        db.prepare(`
            UPDATE unidades_didacticas 
            SET codigo = ?, nombre = ?, ciclo = ?, creditos = ?, horas_teoria = ?, horas_practica = ?, tipo = ?, activo = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
        `).run(codigo, nombre, ciclo, creditos, horas_teoria, horas_practica, tipo, activo ? 1 : 0, id);

        res.json({ success: true, message: 'Unidad didáctica actualizada' });
    } catch (error) {
        console.error('Error actualizando unidad:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar unidad didáctica' });
    }
};

// === REGLAS DE PROMOCIÓN ===

export const getReglasPromocion = (req, res) => {
    try {
        const { programa_id, periodo_id } = req.query;
        const db = getDatabase();
        
        let query = `
            SELECT rp.*, p.nombre as programa_nombre, t.nombre as turno_nombre, pl.nombre as periodo_nombre
            FROM reglas_promocion rp
            JOIN programas_estudio p ON rp.programa_id = p.id
            JOIN turnos t ON rp.turno_id = t.id
            LEFT JOIN periodos_lectivos pl ON rp.periodo_id = pl.id
            WHERE 1=1
        `;
        const params = [];

        if (programa_id) {
            query += ' AND rp.programa_id = ?';
            params.push(programa_id);
        }
        if (periodo_id) {
            query += ' AND rp.periodo_id = ?';
            params.push(periodo_id);
        }

        query += ' ORDER BY p.nombre, rp.ciclo, t.id';
        const reglas = db.prepare(query).all(...params);
        res.json({ success: true, data: reglas });
    } catch (error) {
        console.error('Error obteniendo reglas:', error);
        res.status(500).json({ success: false, message: 'Error al obtener reglas de promoción' });
    }
};

export const createReglaPromocion = (req, res) => {
    try {
        const { programa_id, ciclo, turno_id, max_matriculados, periodo_id } = req.body;

        if (!programa_id || !ciclo || !turno_id || !max_matriculados) {
            return res.status(400).json({ success: false, message: 'Todos los campos son requeridos' });
        }

        const db = getDatabase();
        const result = db.prepare(`
            INSERT INTO reglas_promocion (programa_id, ciclo, turno_id, max_matriculados, periodo_id)
            VALUES (?, ?, ?, ?, ?)
        `).run(programa_id, ciclo, turno_id, max_matriculados, periodo_id);

        res.status(201).json({ success: true, message: 'Regla creada', data: { id: result.lastInsertRowid } });
    } catch (error) {
        console.error('Error creando regla:', error);
        res.status(500).json({ success: false, message: 'Error al crear regla de promoción' });
    }
};

export const updateReglaPromocion = (req, res) => {
    try {
        const { id } = req.params;
        const { max_matriculados, activo } = req.body;

        const db = getDatabase();
        db.prepare(`
            UPDATE reglas_promocion SET max_matriculados = ?, activo = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?
        `).run(max_matriculados, activo ? 1 : 0, id);

        res.json({ success: true, message: 'Regla actualizada' });
    } catch (error) {
        console.error('Error actualizando regla:', error);
        res.status(500).json({ success: false, message: 'Error al actualizar regla' });
    }
};

export const deleteReglaPromocion = (req, res) => {
    try {
        const { id } = req.params;
        const db = getDatabase();
        db.prepare('DELETE FROM reglas_promocion WHERE id = ?').run(id);
        res.json({ success: true, message: 'Regla eliminada' });
    } catch (error) {
        console.error('Error eliminando regla:', error);
        res.status(500).json({ success: false, message: 'Error al eliminar regla' });
    }
};
