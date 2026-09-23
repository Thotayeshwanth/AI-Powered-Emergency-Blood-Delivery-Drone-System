import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

export default function TemperatureChart({ data, safeMin = 2.0, safeMax = 6.0 }) {
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const tempVal = payload[0].value;
      const isSafe = tempVal >= safeMin && tempVal <= safeMax;
      return (
        <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-800 dark:bg-navy-900">
          <p className="text-xs text-slate-500 font-medium">{label}</p>
          <div className="mt-1 flex items-baseline gap-2">
            <span
              className={`text-lg font-bold font-mono ${
                isSafe ? 'text-slate-900 dark:text-white' : 'text-red-600'
              }`}
            >
              {tempVal}°C
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                isSafe ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
              }`}
            >
              {isSafe ? 'Safe Range' : 'Exceeded Range'}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-72 sm:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0284c7" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={{ stroke: '#cbd5e1' }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 8]}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(val) => `${val}°C`}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine
            y={safeMax}
            stroke="#ef4444"
            strokeDasharray="4 4"
            label={{ value: `Max Safe (${safeMax}°C)`, fill: '#ef4444', fontSize: 10, position: 'insideTopRight' }}
          />
          <ReferenceLine
            y={safeMin}
            stroke="#ef4444"
            strokeDasharray="4 4"
            label={{ value: `Min Safe (${safeMin}°C)`, fill: '#ef4444', fontSize: 10, position: 'insideBottomRight' }}
          />
          <Area
            type="monotone"
            dataKey="temp"
            stroke="#0284c7"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#tempGradient)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
