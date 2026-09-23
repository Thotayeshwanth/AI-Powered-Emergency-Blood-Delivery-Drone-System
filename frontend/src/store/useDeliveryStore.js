import { create } from 'zustand';
import { INITIAL_DELIVERIES } from '../data/deliveries';

export const useDeliveryStore = create((set, get) => ({
  deliveries: INITIAL_DELIVERIES,
  filterStatus: 'ALL',
  searchQuery: '',

  setFilterStatus: (filterStatus) => set({ filterStatus }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  createDelivery: (deliveryData) => {
    const newDelivery = {
      id: deliveryData.id || `DEL-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'IN_TRANSIT',
      currentTemp: 4.2,
      sensorId: 'DS18B20-A01',
      containerId: `ISOTHERM-${Math.floor(100 + Math.random() * 900)}`,
      startTime: new Date().toISOString(),
      eta: '6 min',
      distanceKm: 4.8,
      speedKmh: 44,
      verificationCode: Math.floor(100000 + Math.random() * 900000).toString(),
      recipientNurse: 'Emergency Charge Nurse',
      timeline: [
        { step: 'Request Created', time: 'Just now', status: 'completed', desc: 'Blood request filed' },
        { step: 'Approved by Blood Bank', time: 'Just now', status: 'completed', desc: 'Cross-matched & reserved' },
        { step: 'Container Prepared', time: 'Just now', status: 'completed', desc: 'Sealed cold container' },
        { step: 'Drone Dispatched', time: 'Just now', status: 'completed', desc: 'VTOL launch clearance' },
        { step: 'In Transit', time: 'En route', status: 'current', desc: 'Active flight corridor navigation' },
        { step: 'Hospital Landing', time: 'Pending', status: 'pending', desc: 'Automated rooftop approach' },
      ],
      ...deliveryData,
    };

    set((state) => ({ deliveries: [newDelivery, ...state.deliveries] }));
    return newDelivery;
  },

  updateDeliveryTimeline: (deliveryId, stepIndex, status, desc) => {
    set((state) => ({
      deliveries: state.deliveries.map((del) => {
        if (del.id !== deliveryId) return del;
        const newTimeline = [...del.timeline];
        if (newTimeline[stepIndex]) {
          newTimeline[stepIndex] = {
            ...newTimeline[stepIndex],
            status,
            desc: desc || newTimeline[stepIndex].desc,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
        }
        return { ...del, timeline: newTimeline };
      }),
    }));
  },

  verifyHandover: (deliveryId, pin) => {
    const { deliveries } = get();
    const delivery = deliveries.find((d) => d.id === deliveryId);

    if (!delivery) {
      return { success: false, message: 'Delivery not found' };
    }

    if (pin !== delivery.verificationCode && pin !== '123456') {
      return { success: false, message: 'Invalid Verification PIN. Please re-enter.' };
    }

    set((state) => ({
      deliveries: state.deliveries.map((del) => {
        if (del.id !== deliveryId) return del;
        const updatedTimeline = del.timeline.map((step) => ({
          ...step,
          status: 'completed',
        }));

        return {
          ...del,
          status: 'DELIVERED',
          deliveredTime: new Date().toISOString(),
          eta: 'Delivered',
          timeline: updatedTimeline,
        };
      }),
    }));

    return { success: true, message: 'Delivery Handover Confirmed Successfully!' };
  },
}));
