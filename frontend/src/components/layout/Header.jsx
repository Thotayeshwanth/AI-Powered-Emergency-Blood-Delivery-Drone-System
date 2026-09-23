import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Sun,
  Moon,
  ChevronDown,
  Building2,
  Warehouse,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Thermometer,
  LogOut,
  User,
  ExternalLink,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useDroneStore } from '../../store/useDroneStore';

export default function Header({ onToggleSidebar }) {
  const navigate = useNavigate();
  const { user, role, switchRole, logout } = useAuthStore();
  const { notifications, markAsRead, markAllAsRead, getUnreadCount } = useNotificationStore();
  const { darkMode, toggleDarkMode, simulationSpeed, setSimulationSpeed } = useSettingsStore();
  const isSimulating = useDroneStore((state) => state.isSimulating);
  const setSimulating = useDroneStore((state) => state.setSimulating);

  const [showNotifs, setShowNotifs] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifRef = useRef(null);
  const roleRef = useRef(null);
  const userRef = useRef(null);

  const unreadCount = getUnreadCount();

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifs(false);
      }
      if (roleRef.current && !roleRef.current.contains(event.target)) {
        setShowRoleMenu(false);
      }
      if (userRef.current && !userRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleSelect = (newRole) => {
    switchRole(newRole);
    setShowRoleMenu(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur transition-colors md:px-6 dark:border-slate-800 dark:bg-navy-900/95">
      {/* Left: Mobile trigger & breadcrumb/badge */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 md:hidden dark:text-slate-400 dark:hover:bg-slate-800"
          aria-label="Toggle Navigation"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="hidden sm:flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            AeroMed Network
          </span>
          <span className="text-slate-300 dark:text-slate-700">/</span>
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
            {role === 'HOSPITAL'
              ? 'City Care Hospital Terminal'
              : role === 'BLOOD_BANK'
              ? 'Central Blood Logistics Depot'
              : 'AeroMed Fleet Flight Command'}
          </span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Simulation status pill */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium dark:bg-slate-800 dark:border-slate-700">
          <Radio className={`w-3.5 h-3.5 ${isSimulating ? 'text-emerald-500 animate-pulse' : 'text-slate-400'}`} />
          <span className="text-slate-600 dark:text-slate-300">
            {isSimulating ? 'Telemetry Live' : 'Telemetry Paused'}
          </span>
          <button
            onClick={() => {
              const nextSpeed = simulationSpeed === 1 ? 2 : simulationSpeed === 2 ? 5 : 1;
              setSimulationSpeed(nextSpeed);
            }}
            className="ml-1 px-1.5 py-0.5 rounded bg-white text-slate-800 shadow-xs font-mono text-[10px] hover:bg-slate-50 dark:bg-slate-700 dark:text-slate-200"
            title="Click to toggle simulation speed"
          >
            {simulationSpeed}x
          </button>
        </div>

        {/* Role Switcher Dropdown */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-800 shadow-2xs hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {role === 'HOSPITAL' && <Building2 className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />}
            {role === 'BLOOD_BANK' && <Warehouse className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
            {role === 'ADMIN' && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
            <span>Role: {role === 'HOSPITAL' ? 'Hospital' : role === 'BLOOD_BANK' ? 'Blood Bank' : 'Admin'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-navy-900 z-50 animate-in fade-in zoom-in-95">
              <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Switch Operational View
              </div>
              <button
                onClick={() => handleRoleSelect('HOSPITAL')}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium transition-colors ${
                  role === 'HOSPITAL'
                    ? 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <Building2 className="w-4 h-4 text-brand-600" />
                <div>
                  <div className="font-semibold">Hospital Terminal</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Request & track incoming blood</div>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect('BLOOD_BANK')}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium transition-colors ${
                  role === 'BLOOD_BANK'
                    ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <Warehouse className="w-4 h-4 text-purple-600" />
                <div>
                  <div className="font-semibold">Blood Bank Center</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Manage stock, approve & package</div>
                </div>
              </button>

              <button
                onClick={() => handleRoleSelect('ADMIN')}
                className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs font-medium transition-colors ${
                  role === 'ADMIN'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <div>
                  <div className="font-semibold">Flight Command Admin</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Fleet telemetry & operations</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-navy-900">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-navy-900 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
                      {unreadCount} unread
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">No new notifications</div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markAsRead(notif.id);
                        if (notif.link) {
                          navigate(notif.link);
                          setShowNotifs(false);
                        }
                      }}
                      className={`flex gap-3 p-3.5 text-left transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                        !notif.read ? 'bg-brand-50/30 dark:bg-brand-950/20' : ''
                      }`}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {notif.type === 'emergency' && (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400">
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {notif.type === 'drone' && (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
                            <Radio className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {notif.type === 'temperature' && (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
                            <Thermometer className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {notif.type === 'inventory' && (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </div>
                        )}
                        {notif.type === 'info' && (
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-900 truncate dark:text-white">
                            {notif.title}
                          </p>
                          <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                            {notif.timestamp}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-600 line-clamp-2 dark:text-slate-300">
                          {notif.message}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar & Menu */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200'}
              alt={user?.name || 'User avatar'}
              className="h-8 w-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
            />
            <div className="hidden xl:block text-left">
              <div className="text-xs font-bold text-slate-800 dark:text-white leading-tight">
                {user?.name || 'Dr. Practitioner'}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                {user?.title || 'Emergency Operations'}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xl:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-navy-900 z-50">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-white">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate dark:text-slate-400">{user?.email}</p>
                <span className="mt-1 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
                  {user?.organization}
                </span>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    navigate('/users');
                    setShowUserMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <User className="w-3.5 h-3.5" />
                  User Profile & Directory
                </button>
                <button
                  onClick={() => {
                    navigate('/settings');
                    setShowUserMenu(false);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  System Settings
                </button>
              </div>
              <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
