import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const users = await query(
      `SELECT u.*, 
              h.name as hospital_name, h.district as hospital_district,
              b.name as blood_bank_name, b.district as blood_bank_district
       FROM users u
       LEFT JOIN hospitals h ON u.institution_type = 'HOSPITAL' AND u.institution_id = h.id
       LEFT JOIN blood_banks b ON u.institution_type = 'BLOOD_BANK' AND u.institution_id = b.id
       WHERE u.email = ?`,
      [email]
    );

    // Generic error to avoid revealing account existence
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.'
      });
    }

    const user = users[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact the network administrator.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Please verify your email and password.'
      });
    }

    const secret = process.env.JWT_ACCESS_SECRET || 'lifedrone_super_secure_jwt_secret_prakasam_2026_production_grade_ai';
    const expiresIn = process.env.JWT_ACCESS_EXPIRES_IN || '24h';

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        institutionType: user.institution_type,
        institutionId: user.institution_id
      },
      secret,
      { expiresIn }
    );

    // Record audit log
    await query(
      'INSERT INTO audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata_json) VALUES (?, ?, ?, ?, ?, ?)',
      [user.id, user.role, 'USER_LOGIN', 'USER', user.id, JSON.stringify({ ip: req.ip })]
    );

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        role: user.role,
        institutionType: user.institution_type,
        institutionId: user.institution_id,
        institutionName: user.institution_type === 'HOSPITAL' ? user.hospital_name : user.blood_bank_name,
        district: user.institution_type === 'HOSPITAL' ? user.hospital_district : user.blood_bank_district
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      message: 'Internal server error occurred during authentication.'
    });
  }
}

export async function getMe(req, res) {
  try {
    return res.json({
      success: true,
      user: req.user
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

export async function logout(req, res) {
  try {
    if (req.user) {
      await query(
        'INSERT INTO audit_logs (actor_id, actor_role, action, entity_type, entity_id) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, req.user.role, 'USER_LOGOUT', 'USER', req.user.id]
      );
    }
    return res.json({
      success: true,
      message: 'Logged out successfully.'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * Returns seeded demo accounts for quick role switching and testing
 */
export async function getDemoAccounts(req, res) {
  try {
    const demoAccounts = [
      {
        role: 'HOSPITAL_ADMIN',
        roleLabel: 'Hospital Administrator',
        email: 'hospital.admin@lifedrone.io',
        name: 'Dr. Ramesh Kumar',
        institution: 'RIMS Government General Hospital, Ongole',
        category: 'Hospital'
      },
      {
        role: 'HOSPITAL_RECEIVER',
        roleLabel: 'Designated Hospital Receiver',
        email: 'hospital.receiver@lifedrone.io',
        name: 'Nurse Anita Sharma',
        institution: 'RIMS Government General Hospital, Ongole',
        category: 'Hospital'
      },
      {
        role: 'BLOOD_BANK_ADMIN',
        roleLabel: 'Blood Bank Administrator',
        email: 'bloodbank.admin@lifedrone.io',
        name: 'Dr. B. V. Reddy',
        institution: 'Indian Red Cross Society Blood Centre, Ongole',
        category: 'Blood Bank'
      },
      {
        role: 'BLOOD_BANK_AUTHORIZER',
        roleLabel: 'Blood Bank Dispatch Authorizer',
        email: 'bloodbank.authorizer@lifedrone.io',
        name: 'Officer Kavitha Raman',
        institution: 'Indian Red Cross Society Blood Centre, Ongole',
        category: 'Blood Bank'
      }
    ];

    return res.json({
      success: true,
      demoAccounts,
      defaultPassword: 'Password@123'
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
