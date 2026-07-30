const Database = require("better-sqlite3");

const db = new Database("./database/essenzen.db");

// Tabelle für Nutzer
db.prepare(`
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT,
    essenzen INTEGER DEFAULT 0
)
`).run();

// Tabelle für Historie
db.prepare(`
CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    amount INTEGER,
    reason TEXT,
    moderator TEXT,
    date TEXT
)
`).run();

module.exports = db;