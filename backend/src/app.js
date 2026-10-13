import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import authRoutes from './routes/authRoutes.js';
import hospitalRoutes from './routes/hospitalRoutes.js';
import bloodBankRoutes from './routes/bloodBankRoutes.js';
import routeRoutes from './routes/routeRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import supportRoutes from './routes/supportRoutes.js';
import { generalApiLimiter } from './middleware/rateLimiter.js';
import { query } from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const app = express();

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.APP_BASE_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// General API rate limiter
app.use('/api/', generalApiLimiter);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbCheck = await query('SELECT 1 as alive');
    res.json({
      status: 'UP',
      service: 'LifeDrone API',
      database: dbCheck.length > 0 ? 'CONNECTED' : 'DISCONNECTED',
      timestamp: new Date().toISOString(),
      mode: 'SIMULATED DRONE TRACKING — DEMONSTRATION MODE'
    });
  } catch (err) {
    res.status(500).json({
      status: 'DEGRADED',
      database: 'ERROR',
      error: err.message
    });
  }
});

// Impact Metrics endpoint for Homepage
app.get('/api/metrics', async (req, res) => {
  try {
    const [counts] = await query(`
      SELECT
        (SELECT COUNT(*) FROM hospitals WHERE is_approved = TRUE) as participating_hospitals,
        (SELECT COUNT(*) FROM blood_banks WHERE is_approved = TRUE) as participating_blood_banks,
        (SELECT COUNT(*) FROM blood_requests) as blood_requests_managed,
        (SELECT COUNT(*) FROM deliveries WHERE delivery_status = 'DELIVERED') as deliveries_completed,
        (SELECT COALESCE(SUM(available_quantity), 0) FROM blood_inventory WHERE status = 'AVAILABLE' AND expiry_date >= CURDATE()) as available_units
      FROM dual
    `);

    res.json({
      success: true,
      metrics: {
        hospitalsCount: counts.participating_hospitals || 5,
        bloodBanksCount: counts.participating_blood_banks || 4,
        requestsCount: counts.blood_requests_managed || 3,
        deliveriesCompleted: counts.deliveries_completed || 1,
        availableUnits: counts.available_units || 94
      },
      pilotNote: 'Live Pilot Metrics — Prakasam District Demonstration Network'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Public institutions listing for home and registration references
app.get('/api/institutions', async (req, res) => {
  try {
    const hospitals = await query('SELECT id, name, code, address, district, state, latitude, longitude, contact_phone, contact_email FROM hospitals WHERE is_approved = TRUE');
    const bloodBanks = await query('SELECT id, name, code, address, district, state, latitude, longitude, contact_phone, contact_email FROM blood_banks WHERE is_approved = TRUE');
    res.json({ success: true, hospitals, bloodBanks });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Mount modular routes
app.use('/api/auth', authRoutes);
app.use('/api/hospital', hospitalRoutes);
app.use('/api/blood-bank', bloodBankRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/support', supportRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} not found.`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]', err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.'
  });
});

export default app;
