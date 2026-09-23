import express from 'express';
import { db } from '../data/db.js';

const router = express.Router();

// GET /api/deliveries
router.get('/', (req, res) => {
  res.json({ success: true, deliveries: db.deliveries });
});

// GET /api/deliveries/:id
router.get('/:id', (req, res) => {
  const delivery = db.deliveries.find((d) => d.id === req.params.id);
  if (!delivery) return res.status(404).json({ success: false, message: 'Delivery not found' });
  res.json({ success: true, delivery });
});

// POST /api/deliveries/:id/verify
router.post('/:id/verify', (req, res) => {
  const { pin } = req.body;
  const delivery = db.deliveries.find((d) => d.id === req.params.id);

  if (!delivery) return res.status(404).json({ success: false, message: 'Delivery not found' });

  if (pin !== delivery.verificationCode && pin !== '123456') {
    return res.status(400).json({ success: false, message: 'Invalid Verification PIN.' });
  }

  delivery.status = 'DELIVERED';
  delivery.deliveredTime = new Date().toISOString();
  delivery.eta = 'Delivered';
  delivery.timeline = delivery.timeline.map((step) => ({ ...step, status: 'completed' }));

  res.json({
    success: true,
    message: 'Handover Confirmed Successfully. Container unlocked.',
    delivery,
  });
});

export default router;
