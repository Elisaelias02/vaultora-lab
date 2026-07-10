const Database = require('better-sqlite3');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const db = new Database('vaultora.db');

// Inicializar tablas
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    credits INTEGER DEFAULT 0,
    trial_redeemed INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS auth_tokens (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    token TEXT NOT NULL,
    used INTEGER DEFAULT 0,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Usuario de prueba
const existingUser = db.prepare('SELECT * FROM users WHERE email = ?').get('victim@vaultora.io');
if (!existingUser) {
  const hashedPassword = bcrypt.hashSync('Password123!', 10);
  db.prepare('INSERT INTO users (id, email, password, credits) VALUES (?, ?, ?, ?)')
    .run(uuidv4(), 'victim@vaultora.io', hashedPassword, 0);
  console.log('[DB] Usuario de prueba creado: victim@vaultora.io / Password123!');
}

module.exports = db;
