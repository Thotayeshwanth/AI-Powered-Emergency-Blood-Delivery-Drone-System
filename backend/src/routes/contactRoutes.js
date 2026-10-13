import { Router } from 'express';
import { submitContact } from '../controllers/contactController.js';
import { contactLimiter } from '../middleware/rateLimiter.js';
import { validateContactInquiry } from '../validators/index.js';

const router = Router();

router.post('/', contactLimiter, validateContactInquiry, submitContact);

export default router;
