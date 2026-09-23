import React, { useState } from 'react';
import {
  Search,
  Filter,
  Layers,
  Plus,
  Droplet,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Archive,
} from 'lucide-react';
import { useInventoryStore } from '../store/useInventoryStore';
import { useNotificationStore } from '../store/useNotificationStore';
import StatCard from '../components/common/StatCard';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';

export default function BloodInventoryPage() {
  const { inventory, replenishUnits, getStats } = useInventoryStore();
  const addNotification = useNotificationStore((state) => state.addNotification);

  const [search, setSearch] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Restock modal state
  const [isRestockOpen, setIsRestockOpen] = useState(false);
  const [restockGroup, setRestockGroup] = useState('O-');
  const [restockAmount, setRestockAmount] = useState(2);

  const stats = getStats();

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.bloodGroup.toLowerCase().includes(search.toLowerCase()) ||
      item.status.toLowerCase().includes(search.toLowerCase());
    const matchesGroup = selectedGroupFilter === 'ALL' || item.bloodGroup === selectedGroupFilter;
    const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter;
    return matchesSearch && matchesGroup && matchesStatus;
  });

  const handleRestock = (e) => {
    e.preventDefault();
    replenishUnits(restockGroup, Number(restockAmount));
    addNotification({
      type: 'inventory',
      title: 'Blood Inventory Replenished',
      message: `Added ${restockAmount} units of ${restockGroup} to cold-storage bay.`,
      link: '/blood-inventory',
    });
    setIsRestockOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Blood Inventory
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time stock monitoring, cryogenic reserve management, and critical threshold alerts
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => setIsRestockOpen(true)}
        >
          Replenish Blood Units
        </Button>
      </div>

      {/* Inventory Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Units"
          value={stats.totalUnits}
          subvalue="In Facility Storage"
          icon={Layers}
          badge="100% Cold-Chain"
          badgeVariant="safe"
        />

        <StatCard
          title="Available"
          value={stats.availableUnits}
          subvalue="Ready for Immediate Flight"
          icon={Droplet}
          badge="Airlift Verified"
          badgeVariant="in_transit"
        />

        <StatCard
          title="Reserved"
          value={stats.reservedUnits}
          subvalue="Allocated for In-Transit"
          icon={Archive}
          badge="Locked"
          badgeVariant="warning"
        />

        <StatCard
          title="Critical Stock"
          value={stats.criticalCount}
          subvalue="Groups Under Minimum"
          icon={AlertTriangle}
          badge={stats.criticalCount > 0 ? 'Urgent Restock' : 'Optimal'}
          badgeVariant={stats.criticalCount > 0 ? 'critical' : 'safe'}
        />
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-navy-900">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search blood group..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs font-medium text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-navy-950 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Blood group filter */}
          <select
            value={selectedGroupFilter}
            onChange={(e) => setSelectedGroupFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-navy-950 dark:text-slate-200"
          >
            <option value="ALL">All Groups</option>
            {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map((bg) => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-navy-950 dark:text-slate-200"
          >
            <option value="ALL">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Low">Low</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-navy-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
                <th className="py-3 px-4">Blood Group</th>
                <th className="py-3 px-4 text-right">Available Units</th>
                <th className="py-3 px-4 text-right">Reserved</th>
                <th className="py-3 px-4 text-right">Critical Limit</th>
                <th className="py-3 px-4">Component Breakdown</th>
                <th className="py-3 px-4">Storage Temp</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredInventory.map((item) => (
                <tr
                  key={item.bloodGroup}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-white font-extrabold text-xs">
                        {item.bloodGroup}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {item.bloodGroup === 'O-' ? 'O Negative (Universal)' : `Group ${item.bloodGroup}`}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-slate-900 dark:text-white">
                    {item.availableUnits < 10 ? `0${item.availableUnits}` : item.availableUnits}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-500 dark:text-slate-400">
                    {item.reservedUnits < 10 ? `0${item.reservedUnits}` : item.reservedUnits}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                    ≤ {item.criticalThreshold}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                    <span className="text-[11px]">
                      PRBC: {item.prbc} • WB: {item.wholeBlood} • Plt: {item.platelets}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                    {item.storageTemp}°C
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge
                      variant={
                        item.status === 'Available'
                          ? 'available'
                          : item.status === 'Low'
                          ? 'low'
                          : 'critical'
                      }
                      dot
                    >
                      {item.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        setRestockGroup(item.bloodGroup);
                        setIsRestockOpen(true);
                      }}
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                    >
                      + Replenish
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Replenish Blood Units Modal */}
      <Modal
        isOpen={isRestockOpen}
        onClose={() => setIsRestockOpen(false)}
        title="Replenish Cold-Chain Blood Supply"
        subtitle="Log validated donor bags into central refrigeration vault"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleRestock} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Select Blood Group
            </label>
            <select
              value={restockGroup}
              onChange={(e) => setRestockGroup(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-navy-950 dark:text-white"
            >
              {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Units to Add
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={restockAmount}
              onChange={(e) => setRestockAmount(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-navy-950 dark:text-white"
            />
          </div>

          <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500 dark:bg-slate-800/40">
            ✓ Biological units will undergo serological re-check and barcoded ISO-15189 intake.
          </div>

          <div className="pt-2">
            <Button type="submit" variant="primary" size="md" className="w-full">
              Confirm Storage Intake
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
