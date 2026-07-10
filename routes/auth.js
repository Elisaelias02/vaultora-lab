const express = require('express');
const router = express.Router();
const db = require('../db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  db.prepare('INSERT INTO auth_tokens (id, email, token, used, expires_at) VALUES (?, ?, ?, 0, ?)')
    .run(uuidv4(), email, token, expiresAt);
  console.log(`[AUTH] Token generado para ${email}: ${token}`);
  res.json({ message: 'Token sent to email', debug_token: token });
});

router.post('/verify', async (req, res) => {
  const { email, token } = req.body;

  const record = db.prepare(
    "SELECT * FROM auth_tokens WHERE email = ? AND token = ? AND used = 0 AND expires_at > datetime('now')"
  ).get(email, token);

  if (!record) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  // RACE WINDOW — delay async para ampliar la ventana
  await new Promise(resolve => setTimeout(resolve, 200));

  db.prepare('UPDATE auth_tokens SET used = 1 WHERE id = ?').run(record.id);

  const sessionId = uuidv4();
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  db.prepare('INSERT INTO sessions (id, user_id, email) VALUES (?, ?, ?)')
    .run(sessionId, user.id, email);

  res.json({ message: 'Authentication successful', session: sessionId });
});

module.exports = router;
