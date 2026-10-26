import { Router } from 'express';
import { 
  login, 
  getMe, 
  logout, 
  getDemoAccounts, 
  registerHospital, 
  registerBloodBank,
  geocodeAddress 
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { loginLimiter } from '../middleware/rateLimiter.js';
import { validateLogin } from '../validators/index.js';

const router = Router();

router.post('/login', loginLimiter, validateLogin, login);
router.post('/register-hospital', registerHospital);
router.post('/register-blood-bank', registerBloodBank);
router.get('/geocode', geocodeAddress);
router.get('/me', authenticateToken, getMe);
router.post('/logout', authenticateToken, logout);
router.get('/demo-accounts', getDemoAccounts);

export default router;
