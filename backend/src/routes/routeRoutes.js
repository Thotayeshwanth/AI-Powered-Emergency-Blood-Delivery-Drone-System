import { Router } from 'express';
import { calculateRoute, getDeliveryRoute, getNetworkGraph } from '../controllers/routeController.js';

const router = Router();

router.post('/calculate', calculateRoute);
router.get('/network', getNetworkGraph);
router.get('/deliveries/:id/route', getDeliveryRoute);

export default router;
