import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Truck,
  Droplet,
  Thermometer,
  PlusCircle,
  Plane,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useRequestStore } from '../store/useRequestStore';
import { useDeliveryStore } from '../store/useDeliveryStore';
import { useInventoryStore } from '../store/useInventoryStore';
import { useTemperatureStore } from '../store/useTemperatureStore';
import { useDroneStore } from '../store/useDroneStore';
import StatCard from '../components/common/StatCard';
import Button from '../components/common/Button';
import EmergencyCard from '../components/dashboard/EmergencyCard';
import RecentDeliveriesTable from '../components/dashboard/RecentDeliveriesTable';
import AnalyticsCharts from '../components/dashboard/AnalyticsCharts';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, role } = useAuthStore();
  const requests = useRequestStore((state) => state.requests);
  const deliveries = useDeliveryStore((state) => state.deliveries);
  const drones = useDroneStore((state) => state.drones);
  const { getStats } = useInventoryStore();
  const currentTemp = useTemperatureStore((state) => state.currentTemp);
  const isFaultSimulated = useTemperatureStore((state) => state.isFaultSimulated);

  // Compute live KPI values
  const pendingRequestsCount = requests.filter((r) => r.status === 'Pending').length;
  const inTransitCount = deliveries.filter((d) => d.status === 'IN_TRANSIT').length;
  const inventoryStats = getStats();
  const criticalRequest = requests.find((r) => r.urgencyLevel === 'Critical');

  const roleTitle =
    role === 'HOSPITAL'
      ? 'Hospital Admin'
      : role === 'BLOOD_BANK'
      ? 'Blood Bank Director'
      : 'Fleet Operations Commander';

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Welcome, {roleTitle}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time emergency blood logistics and autonomous flight telemetry operations
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {role !== 'BLOOD_BANK' && (
            <Button
              variant="danger"
              size="sm"
              icon={PlusCircle}
              onClick={() => navigate('/blood-requests/new')}
            >
              New Emergency Request
            </Button>
          )}

          <Button
            variant="primary"
            size="sm"
            icon={Plane}
            onClick={() => navigate('/drone-tracking')}
          >
            Live Drone Tracking
          </Button>

          <Button
            variant="outline"
            size="sm"
            icon={Layers}
            onClick={() => navigate('/blood-inventory')}
          >
            View Inventory
          </Button>
        </div>
      </div>

      {/* Prominent Emergency Request Callout */}
      {criticalRequest && <EmergencyCard request={criticalRequest} />}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Blood Requests */}
        <StatCard
          title="Blood Requests"
          value={pendingRequestsCount < 10 ? `0${pendingRequestsCount}` : pendingRequestsCount}
          subvalue="Pending Requests"
          icon={FileText}
          badge={`${requests.length} Total`}
          badgeVariant="warning"
          onClick={() => navigate('/blood-requests')}
        />

        {/* Card 2: Active Deliveries */}
        <StatCard
          title="Active Deliveries"
          value={inTransitCount < 10 ? `0${inTransitCount}` : inTransitCount}
          subvalue="Currently In Transit"
          icon={Truck}
          badge="High Priority"
          badgeVariant="in_transit"
          onClick={() => navigate('/deliveries')}
        />

        {/* Card 3: Available Blood */}
        <StatCard
          title="Available Blood"
          value={inventoryStats.availableUnits}
          subvalue="Units Available"
          icon={Droplet}
          badge={`${inventoryStats.criticalCount} Low Groups`}
          badgeVariant={inventoryStats.criticalCount > 0 ? 'critical' : 'safe'}
          onClick={() => navigate('/blood-inventory')}
        />

        {/* Card 4: Temperature */}
        <StatCard
          title="Temperature"
          value={`${currentTemp}°C`}
          subvalue={isFaultSimulated ? 'CRITICAL SPIKE' : 'SAFE'}
          icon={Thermometer}
          badge={isFaultSimulated ? 'ALERT' : 'NOMINAL'}
          badgeVariant={isFaultSimulated ? 'critical' : 'safe'}
          onClick={() => navigate('/temperature-monitoring')}
        />
      </div>

      {/* Recent Deliveries Table */}
      <RecentDeliveriesTable deliveries={deliveries.slice(0, 4)} />

      {/* System Overview Charts */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              System Overview & Analytics
            </h3>
            <p className="text-xs text-slate-500">
              Aggregated cold-chain delivery metrics and hospital blood requirements
            </p>
          </div>
        </div>

        <AnalyticsCharts />
      </div>
    </div>
  );
}
