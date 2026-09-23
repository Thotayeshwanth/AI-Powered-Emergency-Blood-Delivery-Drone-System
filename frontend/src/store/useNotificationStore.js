import { create } from 'zustand';
import { INITIAL_NOTIFICATIONS } from '../data/notifications';

export const useNotificationStore = create((set, get) => ({
  notifications: INITIAL_NOTIFICATIONS,

  addNotification: (notification) => {
    const newNotif = {
      id: `notif-${Date.now()}`,
      timestamp: 'Just now',
      read: false,
      type: 'info',
      ...notification,
    };
    set((state) => ({ notifications: [newNotif, ...state.notifications] }));
  },

  markAsRead: (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    }));
  },

  clearAll: () => {
    set({ notifications: [] });
  },

  getUnreadCount: () => {
    return get().notifications.filter((n) => !n.read).length;
  },
}));
