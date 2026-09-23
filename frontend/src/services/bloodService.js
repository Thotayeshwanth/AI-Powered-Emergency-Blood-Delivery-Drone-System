import { INITIAL_INVENTORY } from '../data/bloodInventory';
import { INITIAL_REQUESTS } from '../data/bloodRequests';
import { mockDelay } from './api';

export const bloodService = {
  async getInventory() {
    await mockDelay(200);
    return [...INITIAL_INVENTORY];
  },

  async getRequests() {
    await mockDelay(200);
    return [...INITIAL_REQUESTS];
  },

  async createRequest(requestData) {
    await mockDelay(300);
    const newRequest = {
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Pending',
      requestTime: new Date().toISOString(),
      assignedDroneId: null,
      assignedDroneCode: null,
      deliveryId: null,
      ...requestData,
    };
    return newRequest;
  },

  async approveRequest(requestId, droneId) {
    await mockDelay(300);
    return {
      requestId,
      status: 'Approved',
      droneId,
      updatedAt: new Date().toISOString(),
    };
  },

  async rejectRequest(requestId, reason) {
    await mockDelay(300);
    return {
      requestId,
      status: 'Rejected',
      reason,
      updatedAt: new Date().toISOString(),
    };
  },
};
