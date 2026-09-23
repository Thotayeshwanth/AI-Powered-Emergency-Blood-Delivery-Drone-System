import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plane,
  Building2,
  Thermometer,
  ShieldCheck,
  KeyRound,
  FileCheck,
  CheckCircle2,
  Clock,
  Navigation,
} from 'lucide-react';
import { useDeliveryStore } from '../store/useDeliveryStore';
import { useDroneStore } from '../store/useDroneStore';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import DeliveryTimeline from '../components/delivery/DeliveryTimeline';
import HandoverModal from '../components/delivery/HandoverModal';

export default function DeliveryDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const deliveries = useDeliveryStore((state) => state.deliveries);
  const drones = useDroneStore((state) => state.drones);

  const [isHandoverOpen, setIsHandoverOpen] = useState(false);

  const delivery = deliveries.find((d) => d.id === id) || deliveries[0];
  const assignedDrone = drones.find((dr) => dr.id === delivery?.droneId || dr.code === delivery?.droneCode);

  if (!delivery) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-slate-500">Delivery mission not found.</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/deliveries')}>
          Return to Deliveries
        </Button>
      </div>
    );
  }

  const isDelivered = delivery.status === 'DELIVERED';

  return (
    <div className="space-y-6">
      {/* Top Navigation Back Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/deliveries')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Deliveries</span>
        </button>

        <div className="flex items-center gap-2">
          {!isDelivered && (
            <Button
              variant="primary"
              size="sm"
              icon={KeyRound}
              onClick={() => setIsHandoverOpen(true)}
            >
              Verify Hospital Handover PIN
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            icon={Plane}
            onClick={() => navigate('/drone-tracking')}
          >
            Track in Leaflet Map
          </Button>
        </div>
      </div>

      {/* Main Delivery Info Card matching Requirement 13 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-navy-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800 gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 text-white font-black text-base shadow-sm">
              {delivery.id.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  {delivery.id}
                </h1>
                <Badge
                  variant={delivery.status === 'IN_TRANSIT' ? 'in_transit' : 'delivered'}
                  dot={delivery.status === 'IN_TRANSIT'}
                >
                  {delivery.status === 'IN_TRANSIT' ? 'IN TRANSIT' : 'DELIVERED'}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Associated Clinical Request: {delivery.requestId || 'REQ-1024'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400">Biological Cargo</span>
              <div className="flex items-center gap-1.5 justify-end">
                <span className="rounded-md bg-red-600 px-2 py-0.5 text-xs font-black text-white">
                  {delivery.bloodGroup}
                </span>
                <span className="font-bold text-slate-900 dark:text-white text-xs">
                  {delivery.units} Units
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Attributes Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-xs font-medium text-slate-400">Hospital</span>
            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              {delivery.hospitalName}
            </p>
          </div>

          <div>
            <span className="text-xs font-medium text-slate-400">Assigned Drone</span>
            <p className="text-sm font-mono font-bold text-brand-600 dark:text-brand-400 mt-0.5">
              {delivery.droneCode}
            </p>
          </div>

          <div>
            <span className="text-xs font-medium text-slate-400">Container Temperature</span>
            <p className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {delivery.currentTemp}°C (Safe)
            </p>
          </div>

          <div>
            <span className="text-xs font-medium text-slate-400">Handover PIN Code</span>
            <p className="text-sm font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
              {delivery.verificationCode || '883921'}
            </p>
          </div>
        </div>

        {/* Mission Timeline Section */}
        <div className="pt-6">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Mission Progression Timeline
            </h3>
            <p className="text-xs text-slate-500">
              Verified automated state transitions from request generation to helipad touchdown
            </p>
          </div>

          <div className="max-w-xl py-2">
            <DeliveryTimeline timeline={delivery.timeline} />
          </div>
        </div>
      </div>

      {/* Handover PIN verification modal */}
      <HandoverModal
        isOpen={isHandoverOpen}
        onClose={() => setIsHandoverOpen(false)}
        delivery={delivery}
      />
    </div>
  );
}
