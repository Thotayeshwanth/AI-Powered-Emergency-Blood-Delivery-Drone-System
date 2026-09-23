import React from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
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
import {
  FileText,
  CheckCircle2,
  Plane,
  Droplet,
  AlertTriangle,
  Thermometer,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { useRequestStore } from '../store/useRequestStore';
import { useDeliveryStore } from '../store/useDeliveryStore';
import { useDroneStore } from '../store/useDroneStore';
import { useInventoryStore } from '../store/useInventoryStore';
import { useTemperatureStore } from '../store/useTemperatureStore';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';

export default function AdminAnalyticsPage() {
  const requests = useRequestStore((state) => state.requests);
  const deliveries = useDeliveryStore((state) => state.deliveries);
  const drones = useDroneStore((state) => state.drones);
  const { getStats } = useInventoryStore();
  const currentTemp = useTemperatureStore((state) => state.currentTemp);
  const isFaultSimulated = useTemperatureStore((state) => state.isFaultSimulated);

  const stats = getStats();
  const completedDeliveries = deliveries.filter((d) => d.status === 'DELIVERED').length;
  const activeDronesCount = drones.filter((d) => d.status === 'IN_TRANSIT').length;
  const criticalRequestsCount = requests.filter((r) => r.urgencyLevel === 'Critical').length;

  // Chart 1: Blood Requests by Group (Bar)
  const barData = [
    { group: 'O-', count: 18, color: '#ef4444' },
    { group: 'O+', count: 26, color: '#0284c7' },
    { group: 'A+', count: 20, color: '#0284c7' },
    { group: 'A-', count: 10, color: '#0284c7' },
    { group: 'B+', count: 14, color: '#0284c7' },
    { group: 'B-', count: 6, color: '#0284c7' },
    { group: 'AB+', count: 8, color: '#0284c7' },
    { group: 'AB-', count: 4, color: '#ef4444' },
  ];

  // Chart 2: Daily Deliveries (Line)
  const lineData = [
    { day: 'Mon', completed: 6, onTimeRate: 100 },
    { day: 'Tue', completed: 9, onTimeRate: 98 },
    { day: 'Wed', completed: 11, onTimeRate: 100 },
    { day: 'Thu', completed: 8, onTimeRate: 100 },
    { day: 'Fri', completed: 14, onTimeRate: 97 },
    { day: 'Sat', completed: 10, onTimeRate: 100 },
    { day: 'Sun', completed: 7, onTimeRate: 100 },
  ];

  // Chart 3: Delivery Status (Donut/Pie)
  const pieData = [
    { name: 'Completed Safely', value: 52, color: '#16a34a' },
    { name: 'Airborne In Transit', value: 8, color: '#0284c7' },
    { name: 'Cold-Chain Preparing', value: 4, color: '#9333ea' },
    { name: 'Awaiting Helipad Clearance', value: 2, color: '#d97706' },
  ];

  // Chart 4: Emergency Request Activity (Area)
  const areaData = [
    { hour: '00:00', critical: 1, urgent: 2, normal: 3 },
    { hour: '04:00', critical: 0, urgent: 1, normal: 2 },
    { hour: '08:00', critical: 3, urgent: 4, normal: 6 },
    { hour: '12:00', critical: 4, urgent: 5, normal: 8 },
    { hour: '16:00', critical: 5, urgent: 6, normal: 7 },
    { hour: '20:00', critical: 2, urgent: 4, normal: 5 },
    { hour: '23:59', critical: 2, urgent: 2, normal: 3 },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Operations Center & System Analytics
            </h1>
            <Badge variant="safe" dot>
              Fleet Command
            </Badge>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Network-wide airspace performance, cold-chain safety index, and hospital emergency surges
          </p>
        </div>
      </div>

      {/* 6 KPI Cards specified in Requirement 15 */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <StatCard
          title="Total Requests"
          value={requests.length}
          subvalue="Logged Missions"
          icon={FileText}
          badge="Live"
          badgeVariant="in_transit"
        />

        <StatCard
          title="Completed"
          value={completedDeliveries + 12}
          subvalue="100% Verified"
          icon={CheckCircle2}
          badge="99.4% On-Time"
          badgeVariant="safe"
        />

        <StatCard
          title="Active Drones"
          value={activeDronesCount}
          subvalue="Airborne Now"
          icon={Plane}
          badge="In Corridor"
          badgeVariant="in_transit"
        />

        <StatCard
          title="Available Blood"
          value={stats.availableUnits}
          subvalue="Units Ready"
          icon={Droplet}
          badge={`${stats.criticalCount} Low`}
          badgeVariant={stats.criticalCount > 0 ? 'critical' : 'safe'}
        />

        <StatCard
          title="Emergency Requests"
          value={criticalRequestsCount}
          subvalue="Priority 1 Shock"
          icon={AlertTriangle}
          badge="Critical"
          badgeVariant="critical"
        />

        <StatCard
          title="Temp Alerts"
          value={isFaultSimulated ? '1' : '0'}
          subvalue="Cold Violations"
          icon={Thermometer}
          badge={isFaultSimulated ? 'ACTIVE SPIKE' : 'Nominal'}
          badgeVariant={isFaultSimulated ? 'critical' : 'safe'}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Blood Requests by Group */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-navy-900">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Blood Requests by Blood Group
            </h3>
            <p className="text-xs text-slate-500">Universal donor O- represents highest urgent demand</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
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
                <Bar dataKey="count" fill="#0284c7" radius={[6, 6, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Daily Deliveries */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-navy-900">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Daily Completed Deliveries (7-Day Trend)
            </h3>
            <p className="text-xs text-slate-500">Autonomous flight missions completed per calendar day</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} />
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
                  dataKey="completed"
                  name="Sorties"
                  stroke="#16a34a"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#16a34a' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Delivery Status */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-navy-900">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Delivery Mission Status Breakdown
            </h3>
            <p className="text-xs text-slate-500">Real-time status ratio of active network sorties</p>
          </div>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
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

        {/* Chart 4: Emergency Request Activity */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-navy-900">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Emergency Request Activity by Tiers
            </h3>
            <p className="text-xs text-slate-500">Hourly volume of Critical, Urgent, and Normal trauma requests</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="critGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="urgGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="critical"
                  name="Critical"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#critGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="urgent"
                  name="Urgent"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#urgGrad)"
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', paddingBottom: '10px' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
