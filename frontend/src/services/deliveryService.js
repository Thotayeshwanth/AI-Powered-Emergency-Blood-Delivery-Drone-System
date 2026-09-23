import { INITIAL_DELIVERIES } from '../data/deliveries';
import { mockDelay } from './api';

export const deliveryService = {
  async getDeliveries() {
    await mockDelay(200);
    return [...INITIAL_DELIVERIES];
  },

  async getDeliveryById(id) {
    await mockDelay(150);
    const del = INITIAL_DELIVERIES.find((d) => d.id === id);
    if (!del) throw new Error('Delivery not found');
    return del;
  },

  async verifyHandover(deliveryId, pin) {
    await mockDelay(350);
    return {
      deliveryId,
      status: 'DELIVERED',
      verified: true,
      deliveredTime: new Date().toISOString(),
    };
  },
};
