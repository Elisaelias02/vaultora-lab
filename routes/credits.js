const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');

// Ver créditos actuales
router.get('/balance', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT credits, trial_redeemed FROM users WHERE id = ?').get(req.userId);
  res.json({ 
    credits: user.credits,
    trial_redeemed: user.trial_redeemed === 1
  });
});

// Canjear créditos de prueba — VULNERABLE a race condition
router.post('/redeem', authMiddleware, (req, res) => {
  // CHECK
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);

  if (user.trial_redeemed === 1) {
    return res.status(400).json({ error: 'Trial already redeemed' });
  }

  // RACE WINDOW — entre el check y el update
  // Simulamos una operación costosa para ampliar la ventana
  const start = Date.now();
  while (Date.now() - start < 5) {} // 5ms de delay artificial

  // UPDATE
  db.prepare('UPDATE users SET credits = credits + 10, trial_redeemed = 1 WHERE id = ?')
    .run(req.userId);

  const updatedUser = db.prepare('SELECT credits FROM users WHERE id = ?').get(req.userId);

  res.json({ 
    message: 'Trial credits redeemed successfully',
    credits: updatedUser.credits
  });
});

module.exports = router;
