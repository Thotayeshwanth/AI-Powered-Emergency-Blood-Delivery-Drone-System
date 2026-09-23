import { MOCK_USERS } from '../data/users';
import { mockDelay } from './api';

export const authService = {
  async login({ email, password, role }) {
    await mockDelay(400);

    // Find user matching role or email
    const user = MOCK_USERS.find(
      (u) => (role && u.role === role) || (email && u.email.toLowerCase() === email.toLowerCase())
    ) || {
      id: 'user-custom',
      name: 'Dr. Practitioner',
      email: email || 'operator@emergency.med',
      role: role || 'HOSPITAL',
      title: 'Emergency Logistics Specialist',
      organization: 'Trauma Network',
      department: 'Clinical Logistics',
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200',
    };

    const mockToken = `mock_jwt_token_${user.id}_${Date.now()}`;
    localStorage.setItem('aero_auth_token', mockToken);
    localStorage.setItem('aero_user_profile', JSON.stringify(user));

    return { user, token: mockToken };
  },

  async logout() {
    await mockDelay(150);
    localStorage.removeItem('aero_auth_token');
    localStorage.removeItem('aero_user_profile');
    return { success: true };
  },

  getCurrentUser() {
    const cached = localStorage.getItem('aero_user_profile');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return MOCK_USERS[0];
      }
    }
    return MOCK_USERS[0]; // Default to Hospital Doctor
  },
};
