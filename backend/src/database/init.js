import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', '..', 'data', 'educacion.db');
const schemaPath = path.join(__dirname, 'schema.sql');

// Crear directorio de datos si no existe
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Inicializar base de datos
const db = new Database(dbPath);

// Habilitar foreign keys
db.pragma('foreign_keys = ON');

// Leer y ejecutar el esquema
console.log('Inicializando base de datos...');
const schema = fs.readFileSync(schemaPath, 'utf8');
db.exec(schema);
console.log('Esquema creado exitosamente.');

// Datos iniciales
const insertData = () => {
    // Insertar información institucional por defecto
    const institucionExiste = db.prepare('SELECT COUNT(*) as count FROM institucion').get();
    if (institucionExiste.count === 0) {
        db.prepare(`
            INSERT INTO institucion (codigo_modular, nombre, tipo_ies, dre, direccion, telefono, correo)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run('0000000', 'Instituto de Educación Superior', 'Público', 'DRE Lima', 'Av. Principal 123', '01-1234567', 'contacto@ies.edu.pe');
        console.log('Información institucional creada.');
    }

    // Insertar turnos por defecto
    const turnosExisten = db.prepare('SELECT COUNT(*) as count FROM turnos').get();
    if (turnosExisten.count === 0) {
        const insertTurno = db.prepare('INSERT INTO turnos (nombre, hora_inicio, hora_fin) VALUES (?, ?, ?)');
        insertTurno.run('Mañana', '07:00', '13:00');
        insertTurno.run('Tarde', '13:00', '19:00');
        insertTurno.run('Noche', '19:00', '23:00');
        console.log('Turnos creados.');
    }

    // Insertar periodos lectivos
    const periodosExisten = db.prepare('SELECT COUNT(*) as count FROM periodos_lectivos').get();
    if (periodosExisten.count === 0) {
        const insertPeriodo = db.prepare(`
            INSERT INTO periodos_lectivos (nombre, anio, semestre, fecha_inicio, fecha_fin, activo)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        insertPeriodo.run('2026-I', 2026, 1, '2026-03-01', '2026-07-31', 1);
        insertPeriodo.run('2026-II', 2026, 2, '2026-08-01', '2026-12-20', 0);
        console.log('Periodos lectivos creados.');
    }

    // Crear usuario administrador por defecto
    const adminExiste = db.prepare('SELECT COUNT(*) as count FROM usuarios WHERE rol = ?').get('administrador');
    if (adminExiste.count === 0) {
        const hashedPassword = bcrypt.hashSync('admin123', 10);
        db.prepare(`
            INSERT INTO usuarios (email, password, rol, activo)
            VALUES (?, ?, ?, ?)
        `).run('admin@ies.edu.pe', hashedPassword, 'administrador', 1);
        console.log('Usuario administrador creado.');
        console.log('Email: admin@ies.edu.pe');
        console.log('Contraseña: admin123');
    }

    // Insertar programa de estudio de ejemplo
    const programasExisten = db.prepare('SELECT COUNT(*) as count FROM programas_estudio').get();
    if (programasExisten.count === 0) {
        const insertPrograma = db.prepare(`
            INSERT INTO programas_estudio (codigo, nombre, descripcion, duracion_ciclos)
            VALUES (?, ?, ?, ?)
        `);
        insertPrograma.run('COMP-01', 'Computación e Informática', 'Programa de estudios en tecnologías de la información', 6);
        insertPrograma.run('CONT-01', 'Contabilidad', 'Programa de estudios en ciencias contables', 6);
        insertPrograma.run('ENF-01', 'Enfermería Técnica', 'Programa de estudios en ciencias de la salud', 6);
        console.log('Programas de estudio creados.');
    }

    // Insertar plan de estudio de ejemplo
    const planesExisten = db.prepare('SELECT COUNT(*) as count FROM planes_estudio').get();
    if (planesExisten.count === 0) {
        const programa = db.prepare('SELECT id FROM programas_estudio WHERE codigo = ?').get('COMP-01');
        if (programa) {
            db.prepare(`
                INSERT INTO planes_estudio (codigo, nombre, programa_id, resolucion, fecha_aprobacion, activo)
                VALUES (?, ?, ?, ?, ?, ?)
            `).run('PLAN-COMP-2024', 'Plan de Estudios 2024 - Computación', programa.id, 'RD-001-2024', '2024-01-15', 1);
            
            // Insertar unidades didácticas de ejemplo
            const plan = db.prepare('SELECT id FROM planes_estudio WHERE codigo = ?').get('PLAN-COMP-2024');
            if (plan) {
                const insertUD = db.prepare(`
                    INSERT INTO unidades_didacticas (codigo, nombre, plan_estudio_id, ciclo, creditos, horas_teoria, horas_practica)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `);
                
                // Ciclo 1
                insertUD.run('FUND-101', 'Fundamentos de Programación', plan.id, 1, 4, 2, 4);
                insertUD.run('MAT-101', 'Matemática Básica', plan.id, 1, 3, 2, 2);
                insertUD.run('COM-101', 'Comunicación', plan.id, 1, 2, 2, 0);
                insertUD.run('ING-101', 'Inglés Técnico I', plan.id, 1, 2, 1, 2);
                
                // Ciclo 2
                insertUD.run('POO-201', 'Programación Orientada a Objetos', plan.id, 2, 4, 2, 4);
                insertUD.run('BD-201', 'Base de Datos I', plan.id, 2, 4, 2, 4);
                insertUD.run('RED-201', 'Redes de Computadoras', plan.id, 2, 3, 2, 2);
                insertUD.run('ING-201', 'Inglés Técnico II', plan.id, 2, 2, 1, 2);
                
                // Ciclo 3
                insertUD.run('WEB-301', 'Desarrollo Web', plan.id, 3, 4, 2, 4);
                insertUD.run('BD-301', 'Base de Datos II', plan.id, 3, 4, 2, 4);
                insertUD.run('SO-301', 'Sistemas Operativos', plan.id, 3, 3, 2, 2);
                
                console.log('Plan de estudio y unidades didácticas creados.');
            }
        }
    }
};

insertData();

db.close();
console.log('\n¡Base de datos inicializada correctamente!');
