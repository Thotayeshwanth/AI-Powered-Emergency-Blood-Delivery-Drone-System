import React, { useState } from 'react';
import { Plane, Radio, RefreshCw, Layers, ShieldCheck, Activity } from 'lucide-react';
import { useDroneStore } from '../store/useDroneStore';
import DroneMap from '../components/drone/DroneMap';
import DroneTelemetryCard from '../components/drone/DroneTelemetryCard';
import DroneControlsModal from '../components/drone/DroneControlsModal';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';

export default function DroneTrackingPage() {
  const { drones, selectedDroneId, selectDrone } = useDroneStore();
  const [isControlsOpen, setIsControlsOpen] = useState(false);

  const selectedDrone = drones.find((d) => d.id === selectedDroneId) || drones[0];

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Live Drone Tracking
            </h1>
            <Badge variant="in_transit" dot>
              Simulated Telemetry
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time geospatial tracking, autonomous airspace corridor routing, and cold-box status
          </p>
        </div>

        {/* Fleet Drone Switcher Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {drones.map((drone) => (
            <button
              key={drone.id}
              onClick={() => selectDrone(drone.id)}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
                selectedDroneId === drone.id
                  ? 'bg-brand-600 text-white shadow-sm ring-2 ring-brand-500/20'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 dark:bg-navy-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              <Plane className="w-3.5 h-3.5" />
              <span>{drone.code}</span>
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  drone.status === 'IN_TRANSIT'
                    ? 'bg-emerald-400 animate-pulse'
                    : 'bg-slate-400'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Left Map + Right Telemetry HUD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Large Leaflet Map Container */}
        <div className="lg:col-span-2 h-[520px] lg:h-[620px] relative">
          <DroneMap selectedDrone={selectedDrone} />
        </div>

        {/* Right Drone Information Panel */}
        <div className="lg:col-span-1">
          <DroneTelemetryCard
            drone={selectedDrone}
            onOpenControls={() => setIsControlsOpen(true)}
          />
        </div>
      </div>

      {/* Manual Flight Teleoperation Modal */}
      <DroneControlsModal
        isOpen={isControlsOpen}
        onClose={() => setIsControlsOpen(false)}
        drone={selectedDrone}
      />
    </div>
  );
}
