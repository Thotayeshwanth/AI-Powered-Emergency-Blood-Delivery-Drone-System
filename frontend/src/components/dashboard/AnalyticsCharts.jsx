import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function AnalyticsCharts() {
  // Chart 1: Blood requests by blood group
  const requestsByGroupData = [
    { group: 'O-', requests: 14 },
    { group: 'O+', requests: 22 },
    { group: 'A+', requests: 18 },
    { group: 'A-', requests: 8 },
    { group: 'B+', requests: 11 },
    { group: 'B-', requests: 5 },
    { group: 'AB+', requests: 7 },
    { group: 'AB-', requests: 3 },
  ];

  // Chart 2: Delivery Activity by time of day
  const deliveryActivityData = [
    { time: '08:00', deliveries: 2, avgFlightMin: 9 },
    { time: '10:00', deliveries: 5, avgFlightMin: 8 },
    { time: '12:00', deliveries: 8, avgFlightMin: 7 },
    { time: '14:00', deliveries: 6, avgFlightMin: 8 },
    { time: '16:00', deliveries: 9, avgFlightMin: 9 },
    { time: '18:00', deliveries: 7, avgFlightMin: 8 },
    { time: '20:00', deliveries: 4, avgFlightMin: 7 },
  ];

  // Chart 3: Request status breakdown
  const statusData = [
    { name: 'Delivered', value: 48, color: '#16a34a' },
    { name: 'In Transit', value: 12, color: '#0284c7' },
    { name: 'Preparing', value: 8, color: '#9333ea' },
    { name: 'Pending', value: 6, color: '#d97706' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chart 1: Blood Requests by Group */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-navy-900">
        <div className="mb-4">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Requests by Blood Group
          </h4>
          <p className="text-xs text-slate-500">Total units requested past 30 days</p>
        </div>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={requestsByGroupData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
              <XAxis dataKey="group" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="requests" fill="#0284c7" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Delivery Activity */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-navy-900">
        <div className="mb-4">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Daily Delivery Activity
          </h4>
          <p className="text-xs text-slate-500">Missions dispatched over hourly windows</p>
        </div>
        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={deliveryActivityData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
              <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                }}
              />
              <Line
                type="monotone"
                dataKey="deliveries"
                name="Deliveries"
                stroke="#16a34a"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#16a34a' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Request Status Distribution */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-navy-900">
        <div className="mb-4">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">
            Mission Request Status
          </h4>
          <p className="text-xs text-slate-500">Distribution of active vs delivered batches</p>
        </div>
        <div className="h-60 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                innerRadius={55}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  fontSize: '12px',
                }}
              />
              <Legend
                verticalAlign="bottom"
                iconType="circle"
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
