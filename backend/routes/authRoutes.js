import express from 'express';
import { db } from '../data/db.js';

const router = express.Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, role } = req.body;

  const user = db.users.find(
    (u) => (role && u.role === role) || (email && u.email.toLowerCase() === email.toLowerCase())
  ) || db.users[0];

  const token = `jwt_mock_${user.id}_${Date.now()}`;

  res.json({
    success: true,
    user,
    token,
  });
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  res.json({ success: true, user: db.users[0] });
});

export default router;
