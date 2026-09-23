import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  ClipboardList,
  Layers,
  Plane,
  Thermometer,
  Truck,
  History,
  BarChart3,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useRequestStore } from '../../store/useRequestStore';
import { useDroneStore } from '../../store/useDroneStore';
import { useInventoryStore } from '../../store/useInventoryStore';

export default function Sidebar({ isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile }) {
  const navigate = useNavigate();
  const { role, logout } = useAuthStore();
  const requests = useRequestStore((state) => state.requests);
  const drones = useDroneStore((state) => state.drones);
  const { getStats } = useInventoryStore();

  const pendingCount = requests.filter((r) => r.status === 'Pending').length;
  const inFlightCount = drones.filter((d) => d.status === 'IN_TRANSIT').length;
  const stats = getStats();

  const navItems = [
    {
      title: 'Command Center',
      path: '/dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      title: 'Emergency Request',
      path: '/blood-requests/new',
      icon: PlusCircle,
      badge: 'URGENT',
      badgeColor: 'bg-red-500 text-white',
      roles: ['HOSPITAL', 'ADMIN'],
    },
    {
      title: 'Blood Requests',
      path: '/blood-requests',
      icon: ClipboardList,
      badge: pendingCount > 0 ? pendingCount : null,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      title: 'Blood Inventory',
      path: '/blood-inventory',
      icon: Layers,
      badge: stats.criticalCount > 0 ? `${stats.criticalCount} Low` : null,
      badgeColor: 'bg-red-500/90 text-white',
    },
    {
      title: 'Live Drone Tracking',
      path: '/drone-tracking',
      icon: Plane,
      badge: inFlightCount > 0 ? `${inFlightCount} In Flight` : null,
      badgeColor: 'bg-sky-500 text-white',
    },
    {
      title: 'Temperature Cold-Box',
      path: '/temperature-monitoring',
      icon: Thermometer,
      badge: null,
    },
    {
      title: 'Active Deliveries',
      path: '/deliveries',
      icon: Truck,
      badge: null,
    },
    {
      title: 'Delivery History',
      path: '/delivery-history',
      icon: History,
      badge: null,
    },
    {
      title: 'Fleet Analytics',
      path: '/analytics',
      icon: BarChart3,
      badge: null,
      roles: ['BLOOD_BANK', 'ADMIN'],
    },
    {
      title: 'Personnel & Users',
      path: '/users',
      icon: Users,
      badge: null,
    },
    {
      title: 'System Settings',
      path: '/settings',
      icon: Settings,
      badge: null,
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col border-r border-slate-200/80 bg-white transition-all duration-300 dark:border-slate-800 dark:bg-navy-900 ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {/* Brand header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md shadow-brand-500/20">
              <ShieldAlert className="h-5 w-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
                  AEROMED
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase text-brand-600 dark:text-brand-400">
                  Drone Logistics
                </span>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle */}
          <button
            onClick={onToggleCollapse}
            className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems
            .filter((item) => !item.roles || item.roles.includes(role))
            .map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    `group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 shadow-xs dark:bg-brand-950/60 dark:text-brand-300'
                        : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
                    }`
                  }
                  title={isCollapsed ? item.title : undefined}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`h-4 w-4 flex-shrink-0 transition-colors ${
                        isCollapsed ? 'mx-auto' : ''
                      }`}
                    />
                    {!isCollapsed && <span className="truncate">{item.title}</span>}
                  </div>

                  {!isCollapsed && item.badge && (
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold tracking-tight ${
                        item.badgeColor || 'bg-brand-100 text-brand-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
        </div>

        {/* Footer with sign out */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className={`flex w-full items-center rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors dark:text-slate-400 dark:hover:bg-red-950/40 dark:hover:text-red-400 ${
              isCollapsed ? 'justify-center' : 'gap-3'
            }`}
            title="Sign Out"
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
