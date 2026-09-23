import { useEffect } from 'react';
import { useDroneStore } from '../store/useDroneStore';
import { useTemperatureStore } from '../store/useTemperatureStore';

export function useSimulationTicker() {
  const tickSimulation = useDroneStore((state) => state.tickSimulation);
  const isSimulating = useDroneStore((state) => state.isSimulating);
  const simulationSpeed = useDroneStore((state) => state.simulationSpeed);
  const tickTemperature = useTemperatureStore((state) => state.tickTemperature);

  useEffect(() => {
    if (!isSimulating) return;

    // Drone flight telemetry ticks every 1 second
    const droneInterval = setInterval(() => {
      tickSimulation();
    }, 1000 / simulationSpeed);

    // Thermal cold box sensor sampling every 3 seconds
    const tempInterval = setInterval(() => {
      tickTemperature();
    }, 3000 / simulationSpeed);

    return () => {
      clearInterval(droneInterval);
      clearInterval(tempInterval);
    };
  }, [isSimulating, simulationSpeed, tickSimulation, tickTemperature]);
}
