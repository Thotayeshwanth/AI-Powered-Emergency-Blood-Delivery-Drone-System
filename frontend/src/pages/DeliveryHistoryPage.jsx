import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Download, Calendar, Filter, Eye, CheckCircle2, History } from 'lucide-react';
import { useDeliveryStore } from '../store/useDeliveryStore';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';

export default function DeliveryHistoryPage() {
  const navigate = useNavigate();
  const deliveries = useDeliveryStore((state) => state.deliveries);

  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const historyRecords = [
    ...deliveries,
    {
      id: 'DEL-0992',
      bloodGroup: 'A+',
      units: 2,
      hospitalName: 'St. Jude Trauma Center',
      date: '2026-09-22',
      distanceKm: 3.5,
      deliveryDurationMin: 9,
      currentTemp: 4.1,
      status: 'DELIVERED',
    },
    {
      id: 'DEL-0985',
      bloodGroup: 'O-',
      units: 2,
      hospitalName: 'Mercy Memorial Hospital',
      date: '2026-09-21',
      distanceKm: 6.4,
      deliveryDurationMin: 14,
      currentTemp: 4.2,
      status: 'DELIVERED',
    },
    {
      id: 'DEL-0979',
      bloodGroup: 'B+',
      units: 1,
      hospitalName: 'City Care Hospital',
      date: '2026-09-20',
      distanceKm: 4.8,
      deliveryDurationMin: 11,
      currentTemp: 4.0,
      status: 'DELIVERED',
    },
  ];

  const filtered = historyRecords.filter((del) => {
    const matchesSearch =
      del.id.toLowerCase().includes(search.toLowerCase()) ||
      del.hospitalName.toLowerCase().includes(search.toLowerCase()) ||
      del.bloodGroup.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || del.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportCSV = () => {
    const headers = ['Delivery ID', 'Blood Group', 'Units', 'Hospital', 'Distance (km)', 'Delivery Time', 'Temperature', 'Status'];
    const rows = filtered.map((d) => [
      d.id,
      d.bloodGroup,
      d.units || 2,
      `"${d.hospitalName}"`,
      d.distanceKm,
      `${d.deliveryDurationMin || 11} min`,
      `${d.currentTemp}°C`,
      d.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `aeromed_flight_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Delivery Mission History & Audit Log
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Archival records of completed drone sorties, cold-chain compliance telemetry, and chain-of-custody signatures
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          icon={Download}
          onClick={exportCSV}
        >
          Export CSV Report
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-navy-900">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search history by ID, hospital, blood group..."
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
            <option value="ALL">All Statuses</option>
            <option value="DELIVERED">Delivered</option>
            <option value="IN_TRANSIT">In Transit</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-navy-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
                <th className="py-3 px-4">Delivery ID</th>
                <th className="py-3 px-4">Blood Group</th>
                <th className="py-3 px-4">Hospital</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Distance</th>
                <th className="py-3 px-4">Delivery Time</th>
                <th className="py-3 px-4">Temperature</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((del) => (
                <tr
                  key={del.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    {del.id}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center justify-center rounded-md bg-red-50 text-red-700 border border-red-200 font-bold px-2 py-0.5 dark:bg-red-950/60 dark:text-red-400 dark:border-red-900/50">
                      {del.bloodGroup}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                    {del.hospitalName}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {del.date || 'Today (2026-09-23)'}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                    {del.distanceKm} km
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-800 dark:text-slate-200">
                    {del.deliveryDurationMin ? `${del.deliveryDurationMin} min` : '11 min'}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    {del.currentTemp}°C
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge
                      variant={del.status === 'DELIVERED' ? 'delivered' : 'in_transit'}
                      dot={del.status === 'IN_TRANSIT'}
                    >
                      {del.status === 'DELIVERED' ? 'Delivered' : 'In Transit'}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => navigate(`/deliveries/${del.id}`)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800 dark:hover:text-brand-400"
                      title="View Detailed Mission"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
