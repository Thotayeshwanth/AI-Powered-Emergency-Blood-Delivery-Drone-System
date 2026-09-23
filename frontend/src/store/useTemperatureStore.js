import { create } from 'zustand';

export const useTemperatureStore = create((set, get) => ({
  currentTemp: 4.2,
  safeMin: 2.0,
  safeMax: 6.0,
  sensorModel: 'DS18B20 Digital Thermometer',
  sensorStatus: 'ACTIVE',
  batteryLevel: 94,
  peltierStatus: 'COOLING_NOMINAL',
  lastUpdated: 'Just now',
  secondsSinceLastUpdate: 0,
  isFaultSimulated: false,

  history: [
    { time: '10m ago', temp: 4.1, safeMin: 2.0, safeMax: 6.0 },
    { time: '8m ago', temp: 4.2, safeMin: 2.0, safeMax: 6.0 },
    { time: '6m ago', temp: 4.2, safeMin: 2.0, safeMax: 6.0 },
    { time: '4m ago', temp: 4.3, safeMin: 2.0, safeMax: 6.0 },
    { time: '2m ago', temp: 4.2, safeMin: 2.0, safeMax: 6.0 },
    { time: '1m ago', temp: 4.1, safeMin: 2.0, safeMax: 6.0 },
    { time: 'Now', temp: 4.2, safeMin: 2.0, safeMax: 6.0 },
  ],

  toggleFaultSimulation: () => {
    const nextFaultState = !get().isFaultSimulated;
    const newTemp = nextFaultState ? 6.8 : 4.2;
    set({
      isFaultSimulated: nextFaultState,
      currentTemp: newTemp,
      peltierStatus: nextFaultState ? 'COMPRESSOR_FAULT' : 'COOLING_NOMINAL',
    });
  },

  tickTemperature: () => {
    const { isFaultSimulated, history } = get();

    let newTemp;
    if (isFaultSimulated) {
      // Temperature trending hot (> 6°C)
      newTemp = Number((6.6 + Math.random() * 0.8).toFixed(1));
    } else {
      // Normal oscillation between 4.1 and 4.4°C
      newTemp = Number((4.1 + Math.random() * 0.3).toFixed(1));
    }

    const nowLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const newHistory = [
      ...history.slice(-11), // keep last 12 points
      {
        time: nowLabel,
        temp: newTemp,
        safeMin: 2.0,
        safeMax: 6.0,
      },
    ];

    set({
      currentTemp: newTemp,
      history: newHistory,
      lastUpdated: '1s ago',
      secondsSinceLastUpdate: 1,
    });
  },
}));
