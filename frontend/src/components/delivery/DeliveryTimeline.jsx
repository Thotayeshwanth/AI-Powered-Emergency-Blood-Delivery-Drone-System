import React from 'react';
import { CheckCircle2, Clock, CircleDot, Circle } from 'lucide-react';

export default function DeliveryTimeline({ timeline = [] }) {
  return (
    <div className="relative pl-6 space-y-6 before:absolute before:bottom-2 before:top-2 before:left-[11px] before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
      {timeline.map((item, index) => {
        const isCompleted = item.status === 'completed';
        const isCurrent = item.status === 'current';
        const isPending = item.status === 'pending';

        return (
          <div key={index} className="relative flex items-start gap-4">
            {/* Step Icon */}
            <div
              className={`absolute -left-6 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white dark:ring-navy-900 ${
                isCompleted
                  ? 'bg-emerald-500 text-white'
                  : isCurrent
                  ? 'bg-brand-600 text-white animate-pulse'
                  : 'bg-slate-200 text-slate-400 dark:bg-slate-800'
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : isCurrent ? (
                <CircleDot className="h-4 w-4" />
              ) : (
                <Circle className="h-3 w-3" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h4
                  className={`text-xs font-bold ${
                    isCompleted
                      ? 'text-slate-900 dark:text-white'
                      : isCurrent
                      ? 'text-brand-600 dark:text-brand-400'
                      : 'text-slate-400'
                  }`}
                >
                  {item.step}
                </h4>
                <span className="font-mono text-[11px] text-slate-400">
                  {item.time}
                </span>
              </div>
              {item.desc && (
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {item.desc}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
