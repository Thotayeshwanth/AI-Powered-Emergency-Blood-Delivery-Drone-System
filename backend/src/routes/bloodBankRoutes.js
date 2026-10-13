import { Router } from 'express';
import {
  getBloodBankDashboard,
  getInventory,
  addInventory,
  updateInventory,
  getBloodBankRequests,
  acceptRequest,
  rejectRequest,
  preparePackage,
  dispatchDelivery
} from '../controllers/bloodBankController.js';
import { authenticateToken } from '../middleware/auth.js';
import { authorizeRoles, requireInstitutionType } from '../middleware/rbac.js';
import { validateInventoryItem, validateDispatch } from '../validators/index.js';

const router = Router();

router.use(authenticateToken);
router.use(requireInstitutionType('BLOOD_BANK'));

router.get('/dashboard', getBloodBankDashboard);

// Inventory routes
router.get('/inventory', getInventory);
router.post('/inventory', authorizeRoles('BLOOD_BANK_ADMIN'), validateInventoryItem, addInventory);
router.patch('/inventory/:id', authorizeRoles('BLOOD_BANK_ADMIN'), updateInventory);

// Request management routes
router.get('/requests', getBloodBankRequests);
router.post('/requests/:id/accept', authorizeRoles('BLOOD_BANK_ADMIN'), acceptRequest);
router.post('/requests/:id/reject', authorizeRoles('BLOOD_BANK_ADMIN'), rejectRequest);
router.post('/requests/:id/prepare', authorizeRoles('BLOOD_BANK_ADMIN', 'BLOOD_BANK_AUTHORIZER'), preparePackage);
router.post(
  '/requests/:id/dispatch',
  authorizeRoles('BLOOD_BANK_AUTHORIZER', 'BLOOD_BANK_ADMIN'),
  validateDispatch,
  dispatchDelivery
);

export default router;
