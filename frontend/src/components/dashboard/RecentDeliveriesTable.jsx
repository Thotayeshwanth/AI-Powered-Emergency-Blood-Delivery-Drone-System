import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ExternalLink, Truck } from 'lucide-react';
import Badge from '../common/Badge';

export default function RecentDeliveriesTable({ deliveries = [] }) {
  const navigate = useNavigate();

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-navy-900">
      <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Recent Deliveries
          </h3>
          <p className="text-xs text-slate-500">Live & recently completed emergency flights</p>
        </div>

        <button
          onClick={() => navigate('/deliveries')}
          className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
        >
          View All Deliveries →
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/70 font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
              <th className="py-3 px-4">Delivery ID</th>
              <th className="py-3 px-4">Blood Group</th>
              <th className="py-3 px-4">Hospital</th>
              <th className="py-3 px-4">Drone</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">ETA</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {deliveries.map((del) => (
              <tr
                key={del.id}
                className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
              >
                <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                  {del.id}
                </td>
                <td className="py-3.5 px-4">
                  <span className="inline-flex items-center justify-center rounded-md bg-red-50 text-red-700 border border-red-200 font-bold px-2 py-0.5 dark:bg-red-950/60 dark:text-red-400 dark:border-red-900/50">
                    {del.bloodGroup} ({del.units}U)
                  </span>
                </td>
                <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                  {del.hospitalName}
                </td>
                <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                  {del.droneCode}
                </td>
                <td className="py-3.5 px-4">
                  <Badge
                    variant={
                      del.status === 'IN_TRANSIT'
                        ? 'in_transit'
                        : del.status === 'DELIVERED'
                        ? 'delivered'
                        : 'pending'
                    }
                    dot={del.status === 'IN_TRANSIT'}
                  >
                    {del.status === 'IN_TRANSIT' ? 'In Transit' : del.status}
                  </Badge>
                </td>
                <td className="py-3.5 px-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                  {del.eta}
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => navigate(`/deliveries/${del.id}`)}
                    className="inline-flex items-center gap-1 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800 dark:hover:text-brand-400"
                    title="View Mission Detail"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
