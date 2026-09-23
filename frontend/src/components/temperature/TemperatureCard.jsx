import React from 'react';
import { Thermometer, ShieldCheck, AlertTriangle, Cpu, Clock, Activity, BatteryCharging } from 'lucide-react';
import Badge from '../common/Badge';

export default function TemperatureCard({
  currentTemp = 4.2,
  safeMin = 2.0,
  safeMax = 6.0,
  sensorModel = 'DS18B20',
  monitoring = 'ACTIVE',
  lastUpdated = '10 seconds ago',
  containerId = 'ISOTHERM-409',
  batteryLevel = 94,
}) {
  const isSafe = currentTemp >= safeMin && currentTemp <= safeMax;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-navy-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Blood Container
          </span>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Container {containerId}
          </h3>
        </div>

        <Badge variant={isSafe ? 'safe' : 'critical'} size="lg" dot>
          {isSafe ? 'SAFE' : 'CRITICAL FAULT'}
        </Badge>
      </div>

      {/* Main Temperature Display */}
      <div className="py-6 flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Temperature
          </span>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-5xl font-black font-mono tracking-tight ${
                isSafe
                  ? 'text-slate-900 dark:text-white'
                  : 'text-red-600 dark:text-red-500 animate-pulse'
              }`}
            >
              {currentTemp}°C
            </span>
            <span className="text-sm font-semibold text-slate-400">Celsius</span>
          </div>
          <p className="text-xs font-medium text-slate-500">
            Certified safe preservation window
          </p>
        </div>

        <div
          className={`flex h-20 w-20 items-center justify-center rounded-2xl border-2 transition-colors ${
            isSafe
              ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-400'
              : 'border-red-400 bg-red-100 text-red-600 dark:border-red-800 dark:bg-red-950/60 dark:text-red-400 animate-bounce'
          }`}
        >
          <Thermometer className="h-10 w-10" />
        </div>
      </div>

      {/* Metadata Specification Grid */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
        <div className="flex items-center gap-2.5 rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/40">
          <Cpu className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-semibold text-slate-400">Sensor</div>
            <div className="font-bold text-slate-800 truncate dark:text-slate-200">
              {sensorModel}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/40">
          <Activity className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-semibold text-slate-400">Monitoring</div>
            <div className="font-bold text-emerald-600 dark:text-emerald-400">
              {monitoring}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/40">
          <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-semibold text-slate-400">Last Updated</div>
            <div className="font-bold text-slate-800 dark:text-slate-200">
              {lastUpdated}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 rounded-lg bg-slate-50 p-2.5 dark:bg-slate-800/40">
          <ShieldCheck className="w-4 h-4 text-brand-500 flex-shrink-0" />
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-semibold text-slate-400">Safe Range</div>
            <div className="font-bold text-brand-600 dark:text-brand-400">
              {safeMin}°C – {safeMax}°C
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
