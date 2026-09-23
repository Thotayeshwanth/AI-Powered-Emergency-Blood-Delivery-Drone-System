import React from 'react';
import {
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Clock,
  Activity,
  Battery,
  Flame,
  Wind,
} from 'lucide-react';
import { useTemperatureStore } from '../store/useTemperatureStore';
import TemperatureCard from '../components/temperature/TemperatureCard';
import TemperatureChart from '../components/temperature/TemperatureChart';
import TemperatureAlert from '../components/temperature/TemperatureAlert';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

export default function TemperatureMonitoringPage() {
  const {
    currentTemp,
    safeMin,
    safeMax,
    sensorModel,
    monitoring,
    lastUpdated,
    history,
    isFaultSimulated,
    toggleFaultSimulation,
    batteryLevel,
    peltierStatus,
  } = useTemperatureStore();

  const isSafe = currentTemp >= safeMin && currentTemp <= safeMax;

  return (
    <div className="space-y-6">
      {/* Page Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Blood Container Monitoring
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Cryogenic cold-chain preservation telemetric diagnostics and thermal variance alerts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={isFaultSimulated ? 'danger' : 'outline'}
            size="sm"
            onClick={toggleFaultSimulation}
          >
            {isFaultSimulated ? 'Clear Temperature Fault' : 'Test Alarm (>6°C)'}
          </Button>
        </div>
      </div>

      {/* Prominent Alert Banner if temp is out of bounds */}
      <TemperatureAlert
        currentTemp={currentTemp}
        safeMin={safeMin}
        safeMax={safeMax}
      />

      {/* Main Grid: Card & Telemetry Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Main Monitoring Card */}
        <div className="lg:col-span-1">
          <TemperatureCard
            currentTemp={currentTemp}
            safeMin={safeMin}
            safeMax={safeMax}
            sensorModel={sensorModel}
            monitoring={monitoring}
            lastUpdated={lastUpdated}
            containerId="ISOTHERM-409"
            batteryLevel={batteryLevel}
          />
        </div>

        {/* Right: Real-time Recharts Stream Graph */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-navy-900">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Live Cold-Chain Thermal Sensor Stream
              </h3>
              <p className="text-xs text-slate-500">
                Continuous telemetry from digital probe DS18B20 inside vacuum-insulated chamber
              </p>
            </div>

            <Badge variant={isSafe ? 'safe' : 'critical'} dot>
              {isSafe ? 'Compliant' : 'Out of Bounds'}
            </Badge>
          </div>

          <TemperatureChart
            data={history}
            safeMin={safeMin}
            safeMax={safeMax}
          />
        </div>
      </div>

      {/* Subsystem Telemetry Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Subsystem 1: Peltier Cooler */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-navy-900">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Cooling Module</span>
            <Wind className="w-4 h-4 text-brand-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Thermoelectric Peltier
            </span>
            <Badge variant={peltierStatus.includes('FAULT') ? 'critical' : 'safe'}>
              {peltierStatus}
            </Badge>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Internal fan airflow: 1,450 RPM • Dual heat sink
          </p>
        </div>

        {/* Subsystem 2: Thermal Battery */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-navy-900">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Container Battery</span>
            <Battery className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Autonomous Power
            </span>
            <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">
              {batteryLevel}%
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            18.5 hours active cooling endurance remaining
          </p>
        </div>

        {/* Subsystem 3: Integrity Seal */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-navy-900">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Lid Magnetic Seal</span>
            <ShieldCheck className="w-4 h-4 text-brand-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              Solenoid Interlock
            </span>
            <Badge variant="safe">LOCKED</Badge>
          </div>
          <p className="mt-1 text-[11px] text-slate-500">
            Unlocks only with 6-digit hospital receiver PIN
          </p>
        </div>
      </div>
    </div>
  );
}
