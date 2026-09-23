import { create } from 'zustand';
import { INITIAL_REQUESTS } from '../data/bloodRequests';

export const useRequestStore = create((set, get) => ({
  requests: INITIAL_REQUESTS,
  filterStatus: 'ALL',
  filterPriority: 'ALL',
  searchQuery: '',

  setFilterStatus: (filterStatus) => set({ filterStatus }),
  setFilterPriority: (filterPriority) => set({ filterPriority }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  addRequest: (newReq) => {
    const created = {
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'Pending',
      requestTime: new Date().toISOString(),
      assignedDroneId: null,
      assignedDroneCode: null,
      deliveryId: null,
      ...newReq,
    };
    set((state) => ({ requests: [created, ...state.requests] }));
    return created;
  },

  approveRequest: (requestId) => {
    set((state) => ({
      requests: state.requests.map((r) =>
        r.id === requestId ? { ...r, status: 'Approved' } : r
      ),
    }));
  },

  prepareRequest: (requestId) => {
    set((state) => ({
      requests: state.requests.map((r) =>
        r.id === requestId ? { ...r, status: 'Preparing' } : r
      ),
    }));
  },

  dispatchRequest: (requestId, droneId, droneCode) => {
    const deliveryId = `DEL-${requestId.replace('REQ-', '')}`;
    set((state) => ({
      requests: state.requests.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status: 'Dispatched',
              assignedDroneId: droneId,
              assignedDroneCode: droneCode,
              deliveryId,
            }
          : r
      ),
    }));
    return deliveryId;
  },

  rejectRequest: (requestId, reason = 'Inventory shortage') => {
    set((state) => ({
      requests: state.requests.map((r) =>
        r.id === requestId ? { ...r, status: 'Rejected', rejectionReason: reason } : r
      ),
    }));
  },
}));
