import { create } from 'zustand';
import { INITIAL_DRONES } from '../data/drones';

export const useDroneStore = create((set, get) => ({
  drones: INITIAL_DRONES,
  selectedDroneId: 'drone-01',
  isSimulating: true,
  simulationSpeed: 1, // 1x, 2x, 5x

  selectDrone: (droneId) => set({ selectedDroneId: droneId }),

  setSimulating: (isSimulating) => set({ isSimulating }),

  setSimulationSpeed: (speed) => set({ simulationSpeed: speed }),

  // Advances drone position along route
  tickSimulation: () => {
    const { isSimulating, simulationSpeed, drones } = get();
    if (!isSimulating) return;

    set({
      drones: drones.map((drone) => {
        if (drone.status !== 'IN_TRANSIT' || !drone.destination) {
          return drone;
        }

        // Increment progress percentage
        const progressIncrement = 0.6 * simulationSpeed;
        let newProgress = drone.progressPct + progressIncrement;
        let newStatus = drone.status;

        if (newProgress >= 100) {
          newProgress = 100;
          newStatus = 'LANDING';
        }

        // Interpolate lat / lng
        const startLat = drone.origin.lat;
        const startLng = drone.origin.lng;
        const destLat = drone.destination.lat;
        const destLng = drone.destination.lng;

        const factor = newProgress / 100;
        const currentLat = Number((startLat + (destLat - startLat) * factor).toFixed(6));
        const currentLng = Number((startLng + (destLng - startLng) * factor).toFixed(6));

        // Heading calculation
        const deltaLat = destLat - startLat;
        const deltaLng = destLng - startLng;
        const headingDeg = Math.round((Math.atan2(deltaLng, deltaLat) * 180) / Math.PI + 360) % 360;

        // Remaining distance & ETA
        const distanceRemaining = Math.max(0, Number((drone.totalDistanceKm * (1 - factor)).toFixed(1)));
        const speedJitter = 40 + Math.sin(Date.now() / 1500) * 3;
        const etaMins = Math.max(0, Math.ceil((distanceRemaining / speedJitter) * 60));
        const altitudeJitter = Math.round(120 + Math.sin(Date.now() / 2000) * 4);
        const batteryDrain = Math.max(10, Number((drone.battery - 0.02 * simulationSpeed).toFixed(1)));

        return {
          ...drone,
          lat: currentLat,
          lng: currentLng,
          heading: headingDeg,
          progressPct: Number(newProgress.toFixed(1)),
          status: newStatus,
          distanceRemainingKm: distanceRemaining,
          etaMinutes: etaMins,
          speedKmh: Math.round(speedJitter),
          altitudeM: altitudeJitter,
          battery: batteryDrain,
        };
      }),
    });
  },

  sendCommand: (droneId, command) => {
    set((state) => ({
      drones: state.drones.map((d) => {
        if (d.id !== droneId) return d;
        if (command === 'HOLD_POSITION') {
          return { ...d, status: 'IDLE', speedKmh: 0 };
        }
        if (command === 'RESUME_MISSION') {
          return { ...d, status: 'IN_TRANSIT', speedKmh: 42 };
        }
        if (command === 'RETURN_TO_BASE') {
          return {
            ...d,
            status: 'IN_TRANSIT',
            destination: d.origin,
            flightCorridor: 'Return Corridor - RTB Priority',
            progressPct: 0,
          };
        }
        if (command === 'EXPEDITE') {
          return { ...d, speedKmh: 54, altitudeM: 140 };
        }
        return d;
      }),
    }));
  },

  resetDroneRoute: (droneId) => {
    set((state) => ({
      drones: state.drones.map((d) => {
        if (d.id !== droneId) return d;
        const initial = INITIAL_DRONES.find((init) => init.id === droneId);
        return initial ? { ...initial } : d;
      }),
    }));
  },
}));
