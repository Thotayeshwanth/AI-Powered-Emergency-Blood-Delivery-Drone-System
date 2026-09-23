import React, { useState } from 'react';
import { ShieldAlert, PauseCircle, PlayCircle, FastForward, RotateCcw, Check } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useDroneStore } from '../../store/useDroneStore';
import { useNotificationStore } from '../../store/useNotificationStore';

export default function DroneControlsModal({ isOpen, onClose, drone }) {
  const sendCommand = useDroneStore((state) => state.sendCommand);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const [successMsg, setSuccessMsg] = useState('');

  if (!drone) return null;

  const handleAction = (cmd, label) => {
    sendCommand(drone.id, cmd);
    setSuccessMsg(`Command sent: ${label}`);
    addNotification({
      type: 'drone',
      title: `Drone Command Executed`,
      message: `${drone.code} received manual flight command: ${label}`,
      link: '/drone-tracking',
    });
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 1200);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Flight Teleoperation: ${drone.code}`}
      subtitle={`Model: ${drone.model} • Airspace Corridor: ${drone.flightCorridor}`}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {successMsg && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold dark:bg-emerald-950/60 dark:text-emerald-400">
            <Check className="w-4 h-4" />
            {successMsg}
          </div>
        )}

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manual override signals transmit directly to drone flight autopilot via encrypted SATCOM link.
        </p>

        <div className="space-y-2.5">
          <button
            onClick={() => handleAction('HOLD_POSITION', 'Hold Position / Hover')}
            className="flex w-full items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-left transition-colors dark:border-slate-800 dark:bg-navy-800 dark:hover:bg-slate-800"
          >
            <div className="flex items-center gap-3">
              <PauseCircle className="w-5 h-5 text-amber-500" />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Hold Position (Stationary Hover)
                </div>
                <div className="text-[11px] text-slate-500">
                  Drone halts forward velocity and loiters at current GPS fix.
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleAction('RESUME_MISSION', 'Resume Normal Cruise')}
            className="flex w-full items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-left transition-colors dark:border-slate-800 dark:bg-navy-800 dark:hover:bg-slate-800"
          >
            <div className="flex items-center gap-3">
              <PlayCircle className="w-5 h-5 text-brand-600" />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Resume Mission Cruise
                </div>
                <div className="text-[11px] text-slate-500">
                  Resumes waypoint tracking at nominal 42 km/h.
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleAction('EXPEDITE', 'Expedite Maximum Airspeed')}
            className="flex w-full items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-left transition-colors dark:border-slate-800 dark:bg-navy-800 dark:hover:bg-slate-800"
          >
            <div className="flex items-center gap-3">
              <FastForward className="w-5 h-5 text-emerald-600" />
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Expedite Airspeed (54 km/h)
                </div>
                <div className="text-[11px] text-slate-500">
                  Requests emergency corridor priority clearance from ATC.
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleAction('RETURN_TO_BASE', 'Abort & Return To Base (RTB)')}
            className="flex w-full items-center justify-between p-3.5 rounded-xl border border-red-200 bg-red-50/50 hover:bg-red-50 text-left transition-colors dark:border-red-900/60 dark:bg-red-950/20 dark:hover:bg-red-950/40"
          >
            <div className="flex items-center gap-3">
              <RotateCcw className="w-5 h-5 text-red-600 dark:text-red-400" />
              <div>
                <div className="text-xs font-bold text-red-700 dark:text-red-400">
                  Abort & Return To Base (RTB)
                </div>
                <div className="text-[11px] text-red-600/80 dark:text-red-400/80">
                  Immediate emergency recall back to Central Blood Hub launchpad.
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </Modal>
  );
}
