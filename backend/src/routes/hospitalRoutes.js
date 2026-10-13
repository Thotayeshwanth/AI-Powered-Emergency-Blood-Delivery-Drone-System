import { Router } from 'express';
import {
  getHospitals,
  getHospitalDashboard,
  searchBloodInventory,
  createBloodRequest,
  getHospitalRequests,
  getRequestDetails,
  cancelBloodRequest,
  getDeliveryTracking,
  verifyDeliveryPasskey
} from '../controllers/hospitalController.js';
import { authenticateToken } from '../middleware/auth.js';
import { authorizeRoles, requireInstitutionType } from '../middleware/rbac.js';
import { passkeyVerificationLimiter } from '../middleware/rateLimiter.js';
import { validateBloodRequest, validatePasskeyVerification } from '../validators/index.js';

const router = Router();

// Public/semi-public endpoint for institutions list
router.get('/list', getHospitals);

// Protected hospital endpoints
router.use(authenticateToken);
router.use(requireInstitutionType('HOSPITAL'));

router.get('/dashboard', getHospitalDashboard);
router.get('/inventory/search', searchBloodInventory);
router.post('/requests', authorizeRoles('HOSPITAL_ADMIN'), validateBloodRequest, createBloodRequest);
router.get('/requests', getHospitalRequests);
router.get('/requests/:id', getRequestDetails);
router.post('/requests/:id/cancel', authorizeRoles('HOSPITAL_ADMIN'), cancelBloodRequest);

router.get('/deliveries/:id/tracking', getDeliveryTracking);
router.post(
  '/deliveries/:id/verify-passkey',
  authorizeRoles('HOSPITAL_RECEIVER', 'HOSPITAL_ADMIN'),
  passkeyVerificationLimiter,
  validatePasskeyVerification,
  verifyDeliveryPasskey
);

export default router;
