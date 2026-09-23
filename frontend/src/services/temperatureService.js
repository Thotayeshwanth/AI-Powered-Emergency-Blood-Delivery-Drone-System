import { mockDelay } from './api';

export const temperatureService = {
  getInitialHistory() {
    const times = ['10 min ago', '8 min ago', '6 min ago', '4 min ago', '2 min ago', 'Now'];
    const temps = [4.1, 4.2, 4.2, 4.3, 4.2, 4.2];

    return times.map((time, idx) => ({
      timestamp: time,
      temperature: temps[idx],
      safeMin: 2.0,
      safeMax: 6.0,
      status: 'SAFE',
    }));
  },

  async reportThresholdAlert(deliveryId, temperature) {
    await mockDelay(100);
    return {
      alertId: `ALT-${Date.now()}`,
      deliveryId,
      temperature,
      severity: 'CRITICAL',
      timestamp: new Date().toISOString(),
      message: `Blood container temperature exceeded safe range: ${temperature}°C`,
    };
  },
};
