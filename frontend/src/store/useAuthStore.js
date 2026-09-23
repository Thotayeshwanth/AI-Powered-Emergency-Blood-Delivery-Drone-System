import { create } from 'zustand';
import { MOCK_USERS } from '../data/users';
import { authService } from '../services/authService';

export const useAuthStore = create((set, get) => ({
  user: authService.getCurrentUser(),
  role: authService.getCurrentUser().role || 'HOSPITAL',
  isAuthenticated: true,
  isLoading: false,

  login: async ({ email, password, role }) => {
    set({ isLoading: true });
    try {
      const { user } = await authService.login({ email, password, role });
      set({ user, role: user.role, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (err) {
      set({ isLoading: false });
      return { success: false, error: err.message };
    }
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, role: null, isAuthenticated: false });
  },

  switchRole: (newRole) => {
    const userForRole = MOCK_USERS.find((u) => u.role === newRole) || {
      id: `user-${newRole.toLowerCase()}`,
      name: `Demo ${newRole} User`,
      email: `${newRole.toLowerCase()}@emergency.net`,
      role: newRole,
      title: `${newRole} Specialist`,
      organization: 'Emergency Logistics Network',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    };

    localStorage.setItem('aero_user_profile', JSON.stringify(userForRole));
    set({ user: userForRole, role: newRole, isAuthenticated: true });
  },
}));
