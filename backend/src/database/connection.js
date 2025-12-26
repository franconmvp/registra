import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '..', '..', 'data', 'educacion.db');

let db = null;

export const getDatabase = () => {
    if (!db) {
        db = new Database(dbPath);
        db.pragma('foreign_keys = ON');
    }
    return db;
};

export const closeDatabase = () => {
    if (db) {
        db.close();
        db = null;
    }
};

export default getDatabase;
