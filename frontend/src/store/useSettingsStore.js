import { create } from 'zustand';

// Check initial dark mode preference
const getInitialDarkMode = () => {
  const saved = localStorage.getItem('aero_dark_mode');
  if (saved !== null) {
    return JSON.parse(saved);
  }
  return false;
};

export const useSettingsStore = create((set, get) => ({
  darkMode: getInitialDarkMode(),
  soundAlerts: true,
  simulationSpeed: 1,
  safeMinTemp: 2.0,
  safeMaxTemp: 6.0,
  autoAITriage: true,
  droneTelemetryIntervalMs: 2000,

  toggleDarkMode: () => {
    const nextDark = !get().darkMode;
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('aero_dark_mode', JSON.stringify(nextDark));
    set({ darkMode: nextDark });
  },

  setSoundAlerts: (enabled) => set({ soundAlerts: enabled }),
  setSimulationSpeed: (speed) => set({ simulationSpeed: speed }),
  setTempThresholds: (min, max) => set({ safeMinTemp: min, safeMaxTemp: max }),
  setAutoAITriage: (enabled) => set({ autoAITriage: enabled }),
}));
