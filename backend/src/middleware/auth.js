import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. No access token provided.'
    });
  }

  try {
    const secret = process.env.JWT_ACCESS_SECRET || 'lifedrone_super_secure_jwt_secret_prakasam_2026_production_grade_ai';
    const decoded = jwt.verify(token, secret);

    // Look up user from database to ensure account is active and role hasn't changed
    const users = await query(
      `SELECT u.id, u.institution_type, u.institution_id, u.full_name, u.email, u.role, u.is_active,
              h.name as hospital_name, b.name as blood_bank_name
       FROM users u
       LEFT JOIN hospitals h ON u.institution_type = 'HOSPITAL' AND u.institution_id = h.id
       LEFT JOIN blood_banks b ON u.institution_type = 'BLOOD_BANK' AND u.institution_id = b.id
       WHERE u.id = ?`,
      [decoded.userId]
    );

    if (users.length === 0 || !users[0].is_active) {
      return res.status(401).json({
        success: false,
        message: 'Account not found or has been deactivated.'
      });
    }

    req.user = users[0];
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired authentication token.'
    });
  }
}
