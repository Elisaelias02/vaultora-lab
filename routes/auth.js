const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// Login — genera token de un solo uso
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Generar token de 6 dígitos (simula el que llegaría por email)
  const token = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  db.prepare('INSERT INTO sessions (id, user_id, email) VALUES (?, ?, ?)')
  .run(sessionId, user.id, email);

  console.log(`[AUTH] Token generado para ${email}: ${token}`);

  // En producción esto se enviaría por email
  // En el lab lo devolvemos en consola y en response para facilitar la demo
  res.json({ 
    message: 'Token sent to email',
    debug_token: token  // ← solo para el lab
  });
});

// Verify — VULNERABLE a race condition
router.post('/verify', (req, res) => {
  const { email, token } = req.body;

  // CHECK
  const record = db.prepare(
    'SELECT * FROM auth_tokens WHERE email = ? AND token = ? AND used = 0 AND expires_at > datetime("now")'
  ).get(email, token);

  if (!record) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // RACE WINDOW — entre el check y el update
  // Simulamos una operación costosa para ampliar la ventana
  const start = Date.now();
  while (Date.now() - start < 5) {} // 5ms de delay artificial

  // UPDATE
  db.prepare('UPDATE auth_tokens SET used = 1 WHERE id = ?').run(record.id);

  // Generar sesión
  const sessionId = uuidv4();
  db.prepare('INSERT INTO sessions (id, user_id, email) VALUES (?, ?, ?)')
    .run(sessionId, record.id, email);

  res.json({ 
    message: 'Authentication successful',
    session: sessionId
  });
});

module.exports = router;
