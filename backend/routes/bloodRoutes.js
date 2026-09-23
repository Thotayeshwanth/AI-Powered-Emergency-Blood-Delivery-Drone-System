import express from 'express';
import { db } from '../data/db.js';

const router = express.Router();

// GET /api/blood/inventory
router.get('/inventory', (req, res) => {
  res.json({ success: true, inventory: db.inventory });
});

// POST /api/blood/inventory/replenish
router.post('/inventory/replenish', (req, res) => {
  const { bloodGroup, units } = req.body;
  const item = db.inventory.find((i) => i.bloodGroup === bloodGroup);

  if (item) {
    item.availableUnits += Number(units) || 1;
    item.status = item.availableUnits <= item.criticalThreshold ? 'Low' : 'Available';
  }

  res.json({ success: true, updatedItem: item, inventory: db.inventory });
});

// GET /api/blood/requests
router.get('/requests', (req, res) => {
  res.json({ success: true, requests: db.requests });
});

// POST /api/blood/requests
router.post('/requests', (req, res) => {
  const newReq = {
    id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
    status: 'Pending',
    requestTime: new Date().toISOString(),
    assignedDroneId: null,
    assignedDroneCode: null,
    deliveryId: null,
    ...req.body,
  };

  db.requests.unshift(newReq);
  res.status(201).json({ success: true, request: newReq });
});

// PATCH /api/blood/requests/:id/approve
router.patch('/requests/:id/approve', (req, res) => {
  const { id } = req.params;
  const request = db.requests.find((r) => r.id === id);

  if (!request) {
    return res.status(404).json({ success: false, message: 'Request not found' });
  }

  request.status = 'Approved';

  // Reserve inventory units
  const inv = db.inventory.find((i) => i.bloodGroup === request.bloodGroup);
  if (inv) {
    inv.availableUnits = Math.max(0, inv.availableUnits - request.units);
    inv.reservedUnits += request.units;
  }

  res.json({ success: true, request });
});

// PATCH /api/blood/requests/:id/prepare
router.patch('/requests/:id/prepare', (req, res) => {
  const { id } = req.params;
  const request = db.requests.find((r) => r.id === id);

  if (!request) {
    return res.status(404).json({ success: false, message: 'Request not found' });
  }

  request.status = 'Preparing';
  res.json({ success: true, request });
});

// PATCH /api/blood/requests/:id/dispatch
router.patch('/requests/:id/dispatch', (req, res) => {
  const { id } = req.params;
  const { droneId, droneCode } = req.body;
  const request = db.requests.find((r) => r.id === id);

  if (!request) {
    return res.status(404).json({ success: false, message: 'Request not found' });
  }

  const deliveryId = `DEL-${id.replace('REQ-', '')}`;
  request.status = 'Dispatched';
  request.assignedDroneId = droneId;
  request.assignedDroneCode = droneCode;
  request.deliveryId = deliveryId;

  // Create active delivery
  db.deliveries.unshift({
    id: deliveryId,
    requestId: id,
    bloodGroup: request.bloodGroup,
    units: request.units,
    component: request.component,
    hospitalName: request.hospitalName,
    droneId: droneId || 'drone-01',
    droneCode: droneCode || 'FROWWY J2',
    status: 'IN_TRANSIT',
    currentTemp: 4.2,
    sensorId: 'DS18B20-A01',
    containerId: 'ISOTHERM-409',
    eta: '6 min',
    distanceKm: 4.8,
    verificationCode: '883921',
    timeline: [
      { step: 'Request Created', time: 'Just now', status: 'completed', desc: 'Blood request filed' },
      { step: 'Approved by Blood Bank', time: 'Just now', status: 'completed', desc: 'Units allocated' },
      { step: 'Container Prepared', time: 'Just now', status: 'completed', desc: 'Sealed cold box' },
      { step: 'Drone Dispatched', time: 'Just now', status: 'completed', desc: 'Airborne launch' },
      { step: 'In Transit', time: 'En route', status: 'current', desc: 'Corridor Med-North-2' },
      { step: 'Hospital Landing', time: 'Pending', status: 'pending', desc: 'Awaiting touchdown' },
    ],
  });

  res.json({ success: true, request, deliveryId });
});

// PATCH /api/blood/requests/:id/reject
router.patch('/requests/:id/reject', (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const request = db.requests.find((r) => r.id === id);

  if (!request) {
    return res.status(404).json({ success: false, message: 'Request not found' });
  }

  request.status = 'Rejected';
  request.rejectionReason = reason || 'Inventory allocation limit';

  res.json({ success: true, request });
});

export default router;
