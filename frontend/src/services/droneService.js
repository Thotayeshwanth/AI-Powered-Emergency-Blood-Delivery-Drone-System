import { INITIAL_DRONES } from '../data/drones';
import { mockDelay } from './api';

export const droneService = {
  async getDrones() {
    await mockDelay(200);
    return [...INITIAL_DRONES];
  },

  async getDroneById(droneId) {
    await mockDelay(150);
    const drone = INITIAL_DRONES.find((d) => d.id === droneId);
    if (!drone) throw new Error('Drone not found');
    return drone;
  },

  async updateDroneStatus(droneId, status) {
    await mockDelay(200);
    return { droneId, status, updatedAt: new Date().toISOString() };
  },

  async sendCommand(droneId, command) {
    await mockDelay(250);
    // commands: 'HOLD_POSITION' | 'REROUTE' | 'RETURN_TO_BASE' | 'EXPEDITE_SPEED'
    return {
      droneId,
      command,
      status: 'ACKNOWLEDGED',
      timestamp: new Date().toISOString(),
    };
  },
};
