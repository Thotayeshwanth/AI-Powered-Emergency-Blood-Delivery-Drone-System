import express from 'express';
import { db } from '../data/db.js';

const router = express.Router();

// GET /api/drones
router.get('/', (req, res) => {
  res.json({ success: true, drones: db.drones });
});

// GET /api/drones/:id
router.get('/:id', (req, res) => {
  const drone = db.drones.find((d) => d.id === req.params.id);
  if (!drone) return res.status(404).json({ success: false, message: 'Drone not found' });
  res.json({ success: true, drone });
});

// GET /api/drones/:id/location
router.get('/:id/location', (req, res) => {
  const drone = db.drones.find((d) => d.id === req.params.id);
  if (!drone) return res.status(404).json({ success: false, message: 'Drone not found' });

  res.json({
    success: true,
    droneId: drone.id,
    code: drone.code,
    lat: drone.lat,
    lng: drone.lng,
    altitudeM: drone.altitudeM,
    speedKmh: drone.speedKmh,
    heading: drone.heading,
    battery: drone.battery,
    status: drone.status,
    timestamp: new Date().toISOString(),
  });
});

// POST /api/drones/:id/command
router.post('/:id/command', (req, res) => {
  const { command } = req.body;
  const drone = db.drones.find((d) => d.id === req.params.id);

  if (!drone) return res.status(404).json({ success: false, message: 'Drone not found' });

  if (command === 'HOLD_POSITION') {
    drone.status = 'IDLE';
    drone.speedKmh = 0;
  } else if (command === 'RESUME_MISSION') {
    drone.status = 'IN_TRANSIT';
    drone.speedKmh = 42;
  } else if (command === 'EXPEDITE') {
    drone.speedKmh = 54;
    drone.altitudeM = 140;
  }

  res.json({
    success: true,
    droneId: drone.id,
    command,
    status: 'ACKNOWLEDGED',
    updatedDrone: drone,
    timestamp: new Date().toISOString(),
  });
});

export default router;
