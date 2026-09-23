import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Gauge,
  Thermometer,
  Sparkles,
  Server,
  Save,
  CheckCircle,
} from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';
import Button from '../components/common/Button';

export default function SettingsPage() {
  const {
    darkMode,
    toggleDarkMode,
    soundAlerts,
    setSoundAlerts,
    simulationSpeed,
    setSimulationSpeed,
    safeMinTemp,
    safeMaxTemp,
    setTempThresholds,
    autoAITriage,
    setAutoAITriage,
  } = useSettingsStore();

  const [minTemp, setMinTemp] = useState(safeMinTemp);
  const [maxTemp, setMaxTemp] = useState(safeMaxTemp);
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api');
  const [socketUrl, setSocketUrl] = useState('http://localhost:5000');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setTempThresholds(Number(minTemp), Number(maxTemp));
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          System Preferences & Configuration
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Customize UI aesthetics, cold-chain tolerance thresholds, simulation dynamics, and backend connection
        </p>
      </div>

      {savedSuccess && (
        <div className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-semibold dark:bg-emerald-950/60 dark:text-emerald-400 animate-in fade-in">
          <CheckCircle className="w-4 h-4" />
          System settings saved successfully.
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Section 1: Appearance & Theme */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-navy-900">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Visual Appearance
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Toggle between hospital day mode and dark cockpit night mode for low-light command centers
          </p>

          <div className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="flex items-center gap-3">
              {darkMode ? (
                <Moon className="w-5 h-5 text-brand-400" />
              ) : (
                <Sun className="w-5 h-5 text-amber-500" />
              )}
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Dark Mode Cockpit
                </div>
                <div className="text-[11px] text-slate-500">
                  {darkMode ? 'Dark theme is currently active' : 'Clean medical light mode is active'}
                </div>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={toggleDarkMode}
            >
              {darkMode ? 'Switch to Light' : 'Switch to Dark'}
            </Button>
          </div>
        </div>

        {/* Section 2: Cold-Chain Preservation Thresholds */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-navy-900">
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 mb-1">
            <Thermometer className="w-4 h-4" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Cold-Chain Temperature Alert Boundaries
            </h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Certified safe preservation tolerance for whole blood and red blood cells according to WHO standards
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Lower Limit Safe Temperature (°C)
              </label>
              <input
                type="number"
                step="0.1"
                value={minTemp}
                onChange={(e) => setMinTemp(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-navy-950 dark:text-white"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Default: 2.0°C</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Upper Limit Alert Threshold (°C)
              </label>
              <input
                type="number"
                step="0.1"
                value={maxTemp}
                onChange={(e) => setMaxTemp(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-navy-950 dark:text-white"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Default: 6.0°C (Triggers alert if exceeded)</span>
            </div>
          </div>
        </div>

        {/* Section 3: Telemetry & Flight Simulation */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-navy-900">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white mb-1">
            <Gauge className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-bold">
              Simulation Telemetry Speed Multiplier
            </h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Adjust the velocity of waypoint progression and ETA updates during prototype testing
          </p>

          <div className="flex items-center gap-3">
            {[1, 2, 5].map((speed) => (
              <button
                key={speed}
                type="button"
                onClick={() => setSimulationSpeed(speed)}
                className={`flex-1 rounded-xl p-3 text-xs font-bold border transition-all ${
                  simulationSpeed === speed
                    ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 dark:border-brand-600 ring-2 ring-brand-500/20'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700 dark:border-slate-800 dark:hover:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {speed}x Normal Airspeed
              </button>
            ))}
          </div>
        </div>

        {/* Section 4: Backend API & Socket Architecture Preparation */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-navy-900">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white mb-1">
            <Server className="w-4 h-4 text-brand-600" />
            <h3 className="text-sm font-bold">
              Backend Integration Layer (Ready for Node.js / Express + Socket.IO)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            When connecting to real backend microservices, update the target REST and WebSocket endpoints:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                REST API Base URL (VITE_API_BASE_URL)
              </label>
              <input
                type="text"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 font-mono text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-navy-950 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                WebSocket / Socket.IO Server URL
              </label>
              <input
                type="text"
                value={socketUrl}
                onChange={(e) => setSocketUrl(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 font-mono text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-navy-950 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="md" icon={Save}>
            Save Preferences
          </Button>
        </div>
      </form>
    </div>
  );
}
