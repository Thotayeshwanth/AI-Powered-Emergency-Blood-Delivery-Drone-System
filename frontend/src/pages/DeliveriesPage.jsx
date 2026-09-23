import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Truck, ExternalLink, KeyRound, Thermometer, Clock } from 'lucide-react';
import { useDeliveryStore } from '../store/useDeliveryStore';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import HandoverModal from '../components/delivery/HandoverModal';

export default function DeliveriesPage() {
  const navigate = useNavigate();
  const deliveries = useDeliveryStore((state) => state.deliveries);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedDeliveryForHandover, setSelectedDeliveryForHandover] = useState(null);

  const filteredDeliveries = deliveries.filter((del) => {
    const matchesSearch =
      del.id.toLowerCase().includes(search.toLowerCase()) ||
      del.hospitalName.toLowerCase().includes(search.toLowerCase()) ||
      del.droneCode.toLowerCase().includes(search.toLowerCase()) ||
      del.bloodGroup.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || del.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Active Deliveries & Missions
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            End-to-end flight logistics tracking, cold-chain temperature telemetry, and digital handover
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-navy-900">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search missions, hospitals, drones..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs font-medium text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-navy-950 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-navy-950 dark:text-slate-200"
          >
            <option value="ALL">All Mission Statuses</option>
            <option value="IN_TRANSIT">In Transit</option>
            <option value="DELIVERED">Delivered</option>
          </select>
        </div>
      </div>

      {/* Deliveries List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDeliveries.map((del) => (
          <div
            key={del.id}
            className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all dark:border-slate-800 dark:bg-navy-900"
          >
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-black text-slate-900 dark:text-white">
                    {del.id}
                  </span>
                  <Badge
                    variant={del.status === 'IN_TRANSIT' ? 'in_transit' : 'delivered'}
                    dot={del.status === 'IN_TRANSIT'}
                    size="sm"
                  >
                    {del.status === 'IN_TRANSIT' ? 'In Flight' : 'Delivered'}
                  </Badge>
                </div>

                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600 text-white font-extrabold text-xs">
                  {del.bloodGroup}
                </span>
              </div>

              {/* Body */}
              <div className="py-4 space-y-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">
                    Receiving Hospital
                  </span>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {del.hospitalName}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/40">
                    <span className="text-[10px] uppercase text-slate-400">Drone</span>
                    <p className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {del.droneCode}
                    </p>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-2 dark:bg-slate-800/40">
                    <span className="text-[10px] uppercase text-slate-400">Temperature</span>
                    <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {del.currentTemp}°C
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-slate-500 text-[11px]">
                  <span>Payload: {del.units} Units ({del.component || 'PRBC'})</span>
                  <span>ETA: {del.eta}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                icon={ExternalLink}
                onClick={() => navigate(`/deliveries/${del.id}`)}
              >
                Mission Details
              </Button>

              {del.status === 'IN_TRANSIT' && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={KeyRound}
                  onClick={() => setSelectedDeliveryForHandover(del)}
                >
                  Confirm Landing
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Handover Verification Modal */}
      <HandoverModal
        isOpen={!!selectedDeliveryForHandover}
        onClose={() => setSelectedDeliveryForHandover(null)}
        delivery={selectedDeliveryForHandover}
      />
    </div>
  );
}
