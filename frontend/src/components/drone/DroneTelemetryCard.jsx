import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Battery,
  Compass,
  Gauge,
  Navigation,
  Radio,
  RotateCw,
  ExternalLink,
  Shield,
  Thermometer,
  AlertCircle,
  Play,
  Pause,
} from 'lucide-react';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { useDroneStore } from '../../store/useDroneStore';

export default function DroneTelemetryCard({ drone, onOpenControls }) {
  const navigate = useNavigate();
  const isSimulating = useDroneStore((state) => state.isSimulating);
  const setSimulating = useDroneStore((state) => state.setSimulating);
  const resetDroneRoute = useDroneStore((state) => state.resetDroneRoute);

  if (!drone) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-navy-900 text-center">
        <p className="text-sm text-slate-500">No drone selected</p>
      </div>
    );
  }

  const getBatteryColor = (battery) => {
    if (battery > 50) return 'text-emerald-500';
    if (battery > 20) return 'text-amber-500';
    return 'text-red-500';
  };

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden dark:border-slate-800 dark:bg-navy-900">
      {/* Top Header */}
      <div className="border-b border-slate-100 p-5 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Drone Status
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-700" />
            <span className="font-mono text-xs text-brand-600 dark:text-brand-400 font-bold">
              {drone.serialNumber}
            </span>
          </div>

          <Badge
            variant={
              drone.status === 'IN_TRANSIT'
                ? 'in_transit'
                : drone.status === 'LANDING'
                ? 'safe'
                : 'idle'
            }
            dot
          >
            {drone.status === 'IN_TRANSIT'
              ? 'IN TRANSIT'
              : drone.status === 'LANDING'
              ? 'APPROACHING HELIPAD'
              : 'IDLE / CHARGING'}
          </Badge>
        </div>

        <div className="mt-2 flex items-baseline justify-between">
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {drone.code}
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {drone.model}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-[11px] font-medium text-slate-500 mb-1">
            <span>Mission Progress</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              {drone.progressPct}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-sky-400 transition-all duration-300"
              style={{ width: `${drone.progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Primary Telemetry Grid */}
      <div className="grid grid-cols-2 gap-3 p-5 border-b border-slate-100 dark:border-slate-800">
        {/* Battery */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800/80 dark:bg-slate-800/40">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Battery</span>
            <Battery className={`h-4 w-4 ${getBatteryColor(drone.battery)}`} />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
              {drone.battery}%
            </span>
          </div>
          <span className="text-[10px] text-slate-400">Li-Po 6S Smart Pack</span>
        </div>

        {/* Distance Remaining */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800/80 dark:bg-slate-800/40">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Distance</span>
            <Navigation className="h-4 w-4 text-brand-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
              {drone.distanceRemainingKm}
            </span>
            <span className="text-xs text-slate-500">km</span>
          </div>
          <span className="text-[10px] text-slate-400">Total: {drone.totalDistanceKm} km</span>
        </div>

        {/* ETA */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800/80 dark:bg-slate-800/40">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">ETA</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping-slow" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {drone.etaMinutes < 10 ? `0${drone.etaMinutes}` : drone.etaMinutes}
            </span>
            <span className="text-xs text-slate-500">min</span>
          </div>
          <span className="text-[10px] text-slate-400">Target helipad arrival</span>
        </div>

        {/* GPS */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800/80 dark:bg-slate-800/40">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">GPS</span>
            <Radio className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">
              ACTIVE
            </span>
          </div>
          <span className="text-[10px] text-slate-400">{drone.satellites} Sats • RTK Locked</span>
        </div>

        {/* Altitude */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800/80 dark:bg-slate-800/40">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Altitude</span>
            <Compass className="h-4 w-4 text-slate-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
              {drone.altitudeM}
            </span>
            <span className="text-xs text-slate-500">m</span>
          </div>
          <span className="text-[10px] text-slate-400">Baro + LiDAR Alt</span>
        </div>

        {/* Speed */}
        <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 dark:border-slate-800/80 dark:bg-slate-800/40">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Speed</span>
            <Gauge className="h-4 w-4 text-slate-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
              {drone.speedKmh}
            </span>
            <span className="text-xs text-slate-500">km/h</span>
          </div>
          <span className="text-[10px] text-slate-400">Ground Airspeed</span>
        </div>
      </div>

      {/* Payload Container Brief */}
      {drone.payload && (
        <div className="p-5 border-b border-slate-100 bg-brand-50/30 dark:border-slate-800 dark:bg-brand-950/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Payload Biological Cargo
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <Thermometer className="w-3.5 h-3.5" />
              {drone.containerTemp}°C (Safe)
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-600 text-white font-extrabold text-sm">
              {drone.payload.bloodGroup}
            </span>
            <div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                {drone.payload.units} Units • {drone.payload.component}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Container {drone.payload.containerId} • Active Cryo-Cooling
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="p-5 space-y-2.5">
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant={isSimulating ? 'secondary' : 'primary'}
            size="sm"
            icon={isSimulating ? Pause : Play}
            onClick={() => setSimulating(!isSimulating)}
          >
            {isSimulating ? 'Pause Stream' : 'Live Tracking'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={RotateCw}
            onClick={() => resetDroneRoute(drone.id)}
          >
            Reset Flight
          </Button>
        </div>

        {drone.currentDeliveryId && (
          <Button
            variant="primary"
            size="md"
            className="w-full"
            icon={ExternalLink}
            onClick={() => navigate(`/deliveries/${drone.currentDeliveryId}`)}
          >
            View Delivery Mission
          </Button>
        )}

        {onOpenControls && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            icon={Shield}
            onClick={onOpenControls}
          >
            Flight Control Commands
          </Button>
        )}
      </div>
    </div>
  );
}
