import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Building2,
  Warehouse,
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Plane,
  HeartPulse,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import Button from '../components/common/Button';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState('sarah.chen@citycare.org');
  const [password, setPassword] = useState('••••••••••••');
  const [role, setRole] = useState('HOSPITAL');
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await login({ email, password, role });
    setIsLoading(false);
    navigate('/dashboard');
  };

  const handleQuickRoleSelect = (selectedRole, defaultEmail) => {
    setRole(selectedRole);
    setEmail(defaultEmail);
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-50 transition-colors dark:bg-navy-950">
      {/* Background ambient accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-brand-500/10 rounded-full blur-3xl dark:bg-brand-500/5" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        {/* Brand Icon & Heading */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-xl shadow-brand-500/25">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h1 className="mt-4 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl dark:text-white">
            AI-Powered Emergency Blood Delivery Drone System
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">
            Intelligent Emergency Blood Logistics Platform
          </p>
        </div>

        {/* Login Form Box */}
        <div className="mt-8 rounded-2xl border border-slate-200/90 bg-white p-8 shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-navy-900 dark:shadow-none">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Role Segmented Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Operational Terminal Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickRoleSelect('HOSPITAL', 'sarah.chen@citycare.org')}
                  className={`flex flex-col items-center justify-center rounded-xl p-2.5 text-xs font-bold border transition-all ${
                    role === 'HOSPITAL'
                      ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 dark:border-brand-600 ring-2 ring-brand-500/20'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <Building2 className="w-4 h-4 mb-1 text-brand-600" />
                  <span>Hospital</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickRoleSelect('BLOOD_BANK', 'marcus.vance@bloodhubs.org')}
                  className={`flex flex-col items-center justify-center rounded-xl p-2.5 text-xs font-bold border transition-all ${
                    role === 'BLOOD_BANK'
                      ? 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-600 ring-2 ring-purple-500/20'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <Warehouse className="w-4 h-4 mb-1 text-purple-600" />
                  <span>Blood Bank</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickRoleSelect('ADMIN', 'admin@aeromedsystem.gov')}
                  className={`flex flex-col items-center justify-center rounded-xl p-2.5 text-xs font-bold border transition-all ${
                    role === 'ADMIN'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-600 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 mb-1 text-emerald-600" />
                  <span>Admin</span>
                </button>
              </div>
            </div>

            {/* Email / Username */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email / Work Identifier
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@hospital.org"
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-navy-950 dark:text-white"
                />
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Security Password / Token
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-navy-950 dark:text-white"
                />
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-slate-700 dark:bg-navy-950"
                />
                <span className="text-slate-600 dark:text-slate-400 font-medium">Remember Me</span>
              </label>

              <button
                type="button"
                className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={isLoading}
              icon={ArrowRight}
            >
              Sign In to Command Center
            </Button>
          </form>

          {/* Quick Demo Fill Info */}
          <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
            <span className="text-[11px] text-slate-400">
              Demo Prototype Mode: Click any role button above to instantly load test credentials.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
