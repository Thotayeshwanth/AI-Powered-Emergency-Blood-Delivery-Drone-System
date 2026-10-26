import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';
import { sendRegistrationReviewEmail } from '../services/emailService.js';

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    const users = await query(
      `SELECT u.*, 
              h.name as hospital_name, h.district as hospital_district, h.is_approved as hospital_is_approved,
              b.name as blood_bank_name, b.district as blood_bank_district, b.is_approved as blood_bank_is_approved
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

    // Check approval status for hospitals and blood banks
    if (user.institution_type === 'HOSPITAL' && (user.hospital_is_approved === 0 || user.hospital_is_approved === false)) {
      return res.status(403).json({
        success: false,
        message: 'Your hospital application is currently under review. It will be approved soon. Thank you!'
      });
    }

    if (user.institution_type === 'BLOOD_BANK' && (user.blood_bank_is_approved === 0 || user.blood_bank_is_approved === false)) {
      return res.status(403).json({
        success: false,
        message: 'Your blood bank application is currently under review. It will be approved soon. Thank you!'
      });
    }

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

/**
 * Register a new Hospital with CMS certificate number, owner, doctor, location lat/lng, and contact details
 */
export async function registerHospital(req, res) {
  try {
    const {
      name,
      cms_certificate_number,
      owner_name,
      doctor_name,
      address,
      latitude,
      longitude,
      contact_email,
      contact_phone,
      password,
      district = 'Prakasam',
      state = 'Andhra Pradesh',
      facility_category
    } = req.body;

    if (
      !name ||
      !cms_certificate_number ||
      !owner_name ||
      !doctor_name ||
      !address ||
      latitude === undefined ||
      longitude === undefined ||
      !contact_email ||
      !contact_phone ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: 'All fields are mandatory: Hospital Name, CMS Certificate Number, Owner Name, Doctor Name, Address, Latitude, Longitude, Contact Email, Mobile Number, and Password.'
      });
    }

    const cleanEmail = contact_email.trim().toLowerCase();
    const cleanCms = cms_certificate_number.trim();

    // Check if email already registered in users
    const existingUsers = await query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please sign in or use a different email.'
      });
    }

    // Check if CMS number already registered in hospitals
    const existingCMS = await query('SELECT id FROM hospitals WHERE cms_certificate_number = ?', [cleanCms]);
    if (existingCMS.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'A hospital with this CMS Certificate Number is already registered or undergoing review.'
      });
    }

    // Determine category based on CMS Certificate number if not explicitly set
    let category = facility_category;
    if (!category) {
      // Extract numeric digits from CMS number
      const numericPart = parseInt(cleanCms.replace(/\D/g, ''), 10);
      if (!isNaN(numericPart)) {
        if (numericPart >= 1 && numericPart <= 879) {
          category = 'Short-Term (General Medicine and Surgery) Hospital';
        } else if (numericPart >= 880 && numericPart <= 899) {
          category = "Children's Hospital";
        } else if (numericPart >= 1300 && numericPart <= 1399) {
          category = 'Critical Access Hospital';
        } else if (numericPart >= 2000 && numericPart <= 2299) {
          category = 'Long-Term Care Hospital';
        } else if (numericPart >= 3300 && numericPart <= 3399) {
          category = "Children's Psychiatric Hospital";
        } else {
          category = 'Specialized Clinical Hospital';
        }
      } else {
        category = 'General Healthcare Facility';
      }
    }

    // Generate unique hospital code
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const code = `HOSP-${randomSuffix}`;

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert into hospitals table (is_approved = FALSE by default)
    const hospitalResult = await query(
      `INSERT INTO hospitals 
        (name, code, address, district, state, latitude, longitude, contact_phone, contact_email, cms_certificate_number, owner_name, doctor_name, facility_category, is_approved)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE)`,
      [
        name.trim(),
        code,
        address.trim(),
        district,
        state,
        parseFloat(latitude),
        parseFloat(longitude),
        contact_phone.trim(),
        cleanEmail,
        cleanCms,
        owner_name.trim(),
        doctor_name.trim(),
        category
      ]
    );

    const hospitalId = hospitalResult.insertId;

    // Insert user with role HOSPITAL_ADMIN
    const userResult = await query(
      `INSERT INTO users 
        (institution_type, institution_id, full_name, email, password_hash, role, phone_number, is_active)
       VALUES ('HOSPITAL', ?, ?, ?, ?, 'HOSPITAL_ADMIN', ?, TRUE)`,
      [
        hospitalId,
        doctor_name.trim(),
        cleanEmail,
        passwordHash,
        contact_phone.trim()
      ]
    );

    const userId = userResult.insertId;

    // Record audit log
    await query(
      'INSERT INTO audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata_json) VALUES (?, ?, ?, ?, ?, ?)',
      [
        userId,
        'HOSPITAL_ADMIN',
        'HOSPITAL_REGISTRATION_SUBMITTED',
        'HOSPITAL',
        hospitalId,
        JSON.stringify({
          cms_certificate_number: cleanCms,
          owner_name: owner_name.trim(),
          doctor_name: doctor_name.trim(),
          category
        })
      ]
    );

    // Send confirmation email asynchronously
    sendRegistrationReviewEmail({
      email: cleanEmail,
      institutionType: 'HOSPITAL',
      institutionName: name.trim(),
      certificateOrLicense: cleanCms,
      ownerName: owner_name.trim(),
      doctorName: doctor_name.trim(),
      address: address.trim(),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      contactPhone: contact_phone.trim(),
      category
    }).catch((err) => console.error('Failed to send hospital registration email:', err.message));

    return res.status(201).json({
      success: true,
      message: 'Your application is under review. It will be approved soon. Thank you!',
      hospital: {
        id: hospitalId,
        name: name.trim(),
        code,
        category,
        cms_certificate_number: cleanCms,
        email: cleanEmail,
        is_approved: false
      }
    });
  } catch (err) {
    console.error('registerHospital error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to process hospital registration. Please try again.'
    });
  }
}

/**
 * Register a new Blood Bank with License/Certificate number, owner, doctor, location lat/lng, and contact details
 */
export async function registerBloodBank(req, res) {
  try {
    const {
      name,
      license_number,
      owner_name,
      doctor_name,
      address,
      latitude,
      longitude,
      contact_email,
      contact_phone,
      password,
      district = 'Prakasam',
      state = 'Andhra Pradesh',
      facility_category = 'Regional Blood Transfusion Centre'
    } = req.body;

    if (
      !name ||
      !license_number ||
      !owner_name ||
      !doctor_name ||
      !address ||
      latitude === undefined ||
      longitude === undefined ||
      !contact_email ||
      !contact_phone ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: 'All fields are mandatory: Blood Bank Name, License Number, Owner Name, Doctor Name, Address, Latitude, Longitude, Contact Email, Mobile Number, and Password.'
      });
    }

    const cleanEmail = contact_email.trim().toLowerCase();
    const cleanLicense = license_number.trim();

    // Check if email already registered in users
    const existingUsers = await query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existingUsers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists. Please sign in or use a different email.'
      });
    }

    // Check if license number already registered
    const existingLicense = await query('SELECT id FROM blood_banks WHERE license_number = ?', [cleanLicense]);
    if (existingLicense.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'A blood bank with this License Number is already registered or undergoing review.'
      });
    }

    // Generate unique code
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const code = `BB-${randomSuffix}`;

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert into blood_banks table (is_approved = FALSE by default)
    const bbResult = await query(
      `INSERT INTO blood_banks 
        (name, code, address, district, state, latitude, longitude, contact_phone, contact_email, license_number, owner_name, doctor_name, facility_category, is_approved)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE)`,
      [
        name.trim(),
        code,
        address.trim(),
        district,
        state,
        parseFloat(latitude),
        parseFloat(longitude),
        contact_phone.trim(),
        cleanEmail,
        cleanLicense,
        owner_name.trim(),
        doctor_name.trim(),
        facility_category
      ]
    );

    const bloodBankId = bbResult.insertId;

    // Insert user with role BLOOD_BANK_ADMIN
    const userResult = await query(
      `INSERT INTO users 
        (institution_type, institution_id, full_name, email, password_hash, role, phone_number, is_active)
       VALUES ('BLOOD_BANK', ?, ?, ?, ?, 'BLOOD_BANK_ADMIN', ?, TRUE)`,
      [
        bloodBankId,
        doctor_name.trim(),
        cleanEmail,
        passwordHash,
        contact_phone.trim()
      ]
    );

    const userId = userResult.insertId;

    // Record audit log
    await query(
      'INSERT INTO audit_logs (actor_id, actor_role, action, entity_type, entity_id, metadata_json) VALUES (?, ?, ?, ?, ?, ?)',
      [
        userId,
        'BLOOD_BANK_ADMIN',
        'BLOOD_BANK_REGISTRATION_SUBMITTED',
        'BLOOD_BANK',
        bloodBankId,
        JSON.stringify({
          license_number: cleanLicense,
          owner_name: owner_name.trim(),
          doctor_name: doctor_name.trim()
        })
      ]
    );

    // Send confirmation email asynchronously
    sendRegistrationReviewEmail({
      email: cleanEmail,
      institutionType: 'BLOOD_BANK',
      institutionName: name.trim(),
      certificateOrLicense: cleanLicense,
      ownerName: owner_name.trim(),
      doctorName: doctor_name.trim(),
      address: address.trim(),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      contactPhone: contact_phone.trim(),
      category: facility_category
    }).catch((err) => console.error('Failed to send blood bank registration email:', err.message));

    return res.status(201).json({
      success: true,
      message: 'Your application is under review. It will be approved soon. Thank you!',
      bloodBank: {
        id: bloodBankId,
        name: name.trim(),
        code,
        license_number: cleanLicense,
        email: cleanEmail,
        is_approved: false
      }
    });
  } catch (err) {
    console.error('registerBloodBank error:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to process blood bank registration. Please try again.'
    });
  }
}

/**
 * Proxy geocoding endpoint via OpenStreetMap Nominatim for exact address-to-coordinates conversion
 */
export async function geocodeAddress(req, res) {
  try {
    const q = req.query.q;
    if (!q || q.trim().length < 2) {
      return res.json({ success: true, results: [] });
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&q=${encodeURIComponent(q.trim())}`,
      {
        headers: {
          'User-Agent': 'LifeDrone-Emergency-Healthcare-System/1.0 (lifedrone.io)'
        }
      }
    );

    if (!response.ok) {
      return res.json({ success: true, results: [] });
    }

    const data = await response.json();
    const results = (Array.isArray(data) ? data : []).map((item) => ({
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      type: item.type,
      importance: item.importance
    }));

    return res.json({ success: true, results });
  } catch (err) {
    console.error('Geocoding error:', err.message);
    return res.json({ success: true, results: [] });
  }
}


