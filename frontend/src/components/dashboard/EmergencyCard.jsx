import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Clock, ArrowRight, ShieldAlert } from 'lucide-react';
import Badge from '../common/Badge';

export default function EmergencyCard({ request }) {
  const navigate = useNavigate();

  if (!request) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-red-500/80 bg-gradient-to-r from-red-500/10 via-red-500/5 to-transparent p-5 shadow-sm dark:border-red-600/80 dark:bg-red-950/20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left: Critical Request Tag & Info */}
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-black uppercase tracking-wider text-white shadow-xs">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping-slow" />
              CRITICAL
            </span>
            <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
              {request.id}
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Trauma Triage
            </span>
          </div>

          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500">Blood Group:</span>
              <span className="inline-flex items-center justify-center rounded-md bg-red-600 px-2 py-0.5 text-xs font-extrabold text-white">
                {request.bloodGroup}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500">Units:</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {request.units} Units
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500">Hospital:</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {request.hospitalName}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-xs font-extrabold">
                Required: {request.requiredMinutes} minutes
              </span>
            </div>
          </div>
        </div>

        {/* Right: View Button */}
        <div className="flex items-center sm:self-center">
          <button
            onClick={() => navigate(`/blood-requests`)}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 transition-all dark:bg-red-600 dark:hover:bg-red-700 active:scale-95"
          >
            <span>View Request</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
