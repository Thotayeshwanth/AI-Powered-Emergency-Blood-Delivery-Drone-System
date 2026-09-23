import express from 'express';

const router = express.Router();

// GET /api/temperature/:deliveryId
router.get('/:deliveryId', (req, res) => {
  const { deliveryId } = req.params;
  const times = ['10 min ago', '8 min ago', '6 min ago', '4 min ago', '2 min ago', 'Now'];
  const temps = [4.1, 4.2, 4.2, 4.3, 4.2, 4.2];

  res.json({
    success: true,
    deliveryId,
    sensorModel: 'DS18B20 Digital Thermometer',
    currentTemp: 4.2,
    safeMin: 2.0,
    safeMax: 6.0,
    status: 'SAFE',
    history: times.map((t, idx) => ({
      time: t,
      temp: temps[idx],
      safeMin: 2.0,
      safeMax: 6.0,
    })),
  });
});

// POST /api/temperature/:deliveryId/alert
router.post('/:deliveryId/alert', (req, res) => {
  const { deliveryId } = req.params;
  const { temperature } = req.body;

  res.json({
    success: true,
    alertId: `ALT-${Date.now()}`,
    deliveryId,
    temperature,
    severity: 'CRITICAL',
    message: `Temperature threshold alert logged for delivery ${deliveryId}`,
    timestamp: new Date().toISOString(),
  });
});

export default router;
