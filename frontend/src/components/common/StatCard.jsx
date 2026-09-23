import React from 'react';

export default function StatCard({
  title,
  value,
  subvalue,
  icon: Icon,
  badge,
  badgeVariant = 'safe',
  trend,
  className = '',
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md dark:border-slate-800 dark:bg-navy-900 ${
        onClick ? 'cursor-pointer hover:border-brand-300 dark:hover:border-brand-600' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {value}
            </span>
            {trend && (
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                {trend}
              </span>
            )}
          </div>
          {subvalue && (
            <p className="text-xs text-slate-500 dark:text-slate-400">{subvalue}</p>
          )}
        </div>

        {Icon && (
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-600 ring-1 ring-brand-100 dark:bg-brand-950/60 dark:text-brand-400 dark:ring-brand-900/50">
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      {badge && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <span className="text-xs text-slate-500 dark:text-slate-400">Status</span>
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
              badgeVariant === 'critical' || badgeVariant === 'danger'
                ? 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400'
                : badgeVariant === 'warning'
                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                badgeVariant === 'critical' ? 'bg-red-500 animate-ping-slow' : 'bg-current'
              }`}
            />
            {badge}
          </span>
        </div>
      )}
    </div>
  );
}
