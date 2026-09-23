import { db } from '../data/db.js';

export function setupSocketHandlers(io) {
  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    // Send initial handshake state
    socket.emit('system:ready', {
      message: 'Connected to AeroMed Real-Time Telemetry Stream',
      serverTime: new Date().toISOString(),
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  // Background telemetry broadcast ticker every 2 seconds
  setInterval(() => {
    const activeDrone = db.drones.find((d) => d.status === 'IN_TRANSIT');
    if (activeDrone) {
      // Simulate minor GPS drift along flight path
      activeDrone.speedKmh = Math.round(41 + Math.sin(Date.now() / 1000) * 3);
      activeDrone.altitudeM = Math.round(120 + Math.sin(Date.now() / 2000) * 4);
      activeDrone.battery = Math.max(15, Number((activeDrone.battery - 0.01).toFixed(2)));

      io.emit('drone:location', {
        droneId: activeDrone.id,
        code: activeDrone.code,
        lat: activeDrone.lat,
        lng: activeDrone.lng,
        altitudeM: activeDrone.altitudeM,
        speedKmh: activeDrone.speedKmh,
        battery: activeDrone.battery,
        status: activeDrone.status,
      });

      io.emit('temperature:update', {
        deliveryId: activeDrone.currentDeliveryId || 'DEL-1024',
        temperature: Number((4.15 + Math.random() * 0.2).toFixed(1)),
        safeRange: [2.0, 6.0],
        status: 'SAFE',
      });
    }
  }, 2000);
}
