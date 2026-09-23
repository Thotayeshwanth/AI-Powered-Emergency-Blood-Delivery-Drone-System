import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import Button from '../common/Button';
import { useTemperatureStore } from '../../store/useTemperatureStore';

export default function TemperatureAlert({ currentTemp, safeMin = 2.0, safeMax = 6.0 }) {
  const isOutOfBounds = currentTemp < safeMin || currentTemp > safeMax;
  const toggleFaultSimulation = useTemperatureStore((state) => state.toggleFaultSimulation);
  const isFaultSimulated = useTemperatureStore((state) => state.isFaultSimulated);

  if (!isOutOfBounds) {
    return (
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-300">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider">Cold-Chain Integrity Verified</div>
            <div className="text-xs text-emerald-700 dark:text-emerald-400">
              Container temp {currentTemp}°C is strictly within WHO certified safe range ({safeMin}°C – {safeMax}°C).
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          size="xs"
          onClick={toggleFaultSimulation}
          className="border-emerald-300 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:text-emerald-300"
        >
          {isFaultSimulated ? 'Clear Simulated Fault' : 'Simulate Temp Spike Test'}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-xl border-2 border-red-500 bg-red-50 text-red-900 shadow-md animate-pulse-subtle dark:border-red-600 dark:bg-red-950/40 dark:text-red-200">
      <div className="flex items-start gap-3.5">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-red-600 text-white shadow-sm">
          <AlertTriangle className="h-6 w-6 animate-bounce" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-extrabold uppercase tracking-wide text-red-700 dark:text-red-400">
              ⚠ TEMPERATURE ALERT
            </h4>
            <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-mono text-[10px] font-bold">
              {currentTemp}°C CRITICAL
            </span>
          </div>
          <p className="mt-1 text-xs font-semibold text-red-800 dark:text-red-300 max-w-xl">
            Blood container temperature has exceeded the recommended safe range ({safeMin}°C – {safeMax}°C). Biological degradation risk imminent if uncorrected within 15 minutes.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="danger"
          size="sm"
          onClick={toggleFaultSimulation}
        >
          Reset Thermal Sensor
        </Button>
      </div>
    </div>
  );
}
