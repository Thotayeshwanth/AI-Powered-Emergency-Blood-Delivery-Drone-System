import { create } from 'zustand';
import { INITIAL_INVENTORY } from '../data/bloodInventory';

export const useInventoryStore = create((set, get) => ({
  inventory: INITIAL_INVENTORY,
  searchQuery: '',
  filterStatus: 'ALL',

  setSearchQuery: (query) => set({ searchQuery: query }),
  setFilterStatus: (status) => set({ filterStatus: status }),

  reserveUnits: (bloodGroup, units) => {
    set((state) => ({
      inventory: state.inventory.map((item) => {
        if (item.bloodGroup === bloodGroup) {
          const newAvail = Math.max(0, item.availableUnits - units);
          const newRes = item.reservedUnits + units;
          const newStatus =
            newAvail <= 1
              ? 'Critical'
              : newAvail <= item.criticalThreshold
              ? 'Low'
              : 'Available';
          return {
            ...item,
            availableUnits: newAvail,
            reservedUnits: newRes,
            status: newStatus,
          };
        }
        return item;
      }),
    }));
  },

  replenishUnits: (bloodGroup, units) => {
    set((state) => ({
      inventory: state.inventory.map((item) => {
        if (item.bloodGroup === bloodGroup) {
          const newAvail = item.availableUnits + units;
          const newStatus =
            newAvail <= 1
              ? 'Critical'
              : newAvail <= item.criticalThreshold
              ? 'Low'
              : 'Available';
          return {
            ...item,
            availableUnits: newAvail,
            status: newStatus,
            lastTested: new Date().toISOString().replace('T', ' ').slice(0, 16),
          };
        }
        return item;
      }),
    }));
  },

  getStats: () => {
    const { inventory } = get();
    const totalUnits = inventory.reduce(
      (sum, item) => sum + item.availableUnits + item.reservedUnits,
      0
    );
    const availableUnits = inventory.reduce(
      (sum, item) => sum + item.availableUnits,
      0
    );
    const reservedUnits = inventory.reduce(
      (sum, item) => sum + item.reservedUnits,
      0
    );
    const criticalCount = inventory.filter(
      (item) => item.status === 'Critical' || item.status === 'Low'
    ).length;

    return { totalUnits, availableUnits, reservedUnits, criticalCount };
  },
}));
