import express from 'express';
import { db } from '../data/db.js';

const router = express.Router();

// GET /api/dashboard
router.get('/', (req, res) => {
  const pendingRequests = db.requests.filter((r) => r.status === 'Pending').length;
  const inTransitDeliveries = db.deliveries.filter((d) => d.status === 'IN_TRANSIT').length;
  const availableBlood = db.inventory.reduce((sum, item) => sum + item.availableUnits, 0);
  const criticalStockCount = db.inventory.filter((item) => item.status === 'Critical' || item.status === 'Low').length;

  res.json({
    success: true,
    kpis: {
      pendingRequests,
      activeDeliveries: inTransitDeliveries,
      availableBloodUnits: availableBlood,
      criticalGroupsCount: criticalStockCount,
      containerTemperature: 4.2,
      temperatureStatus: 'SAFE',
    },
    criticalEmergencyRequest: db.requests.find((r) => r.urgencyLevel === 'Critical') || null,
    recentDeliveries: db.deliveries.slice(0, 4),
  });
});

export default router;
