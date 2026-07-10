const db = require('../db');

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header' });
  }

  const sessionId = authHeader.replace('Bearer ', '');
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId);

  if (!session) {
    return res.status(401).json({ error: 'Invalid session' });
  }

  req.userId = session.user_id;
  req.userEmail = session.email;
  next();
};
