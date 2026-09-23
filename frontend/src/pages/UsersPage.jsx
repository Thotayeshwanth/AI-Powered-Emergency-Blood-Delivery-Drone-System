import React, { useState } from 'react';
import { Search, UserPlus, Building2, Warehouse, ShieldCheck, Mail, Phone, Shield } from 'lucide-react';
import { MOCK_USERS } from '../data/users';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';

export default function UsersPage() {
  const [users, setUsers] = useState([
    ...MOCK_USERS,
    {
      id: 'user-04',
      name: 'Dr. Michael Hayes, MD',
      email: 'm.hayes@stjude-trauma.org',
      role: 'HOSPITAL',
      title: 'Attending Cardiac Surgeon',
      organization: 'St. Jude Trauma Center',
      department: 'Surgical ICU',
      avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200',
      phone: '+1 (555) 789-0123',
      status: 'ACTIVE',
    },
    {
      id: 'user-05',
      name: 'Capt. James Miller',
      email: 'j.miller@aeromedsystem.gov',
      role: 'ADMIN',
      title: 'Chief UAS Flight Safety Officer',
      organization: 'AeroMed Flight Safety Division',
      department: 'Aviation Compliance',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
      phone: '+1 (555) 441-2900',
      status: 'ACTIVE',
    },
    {
      id: 'user-06',
      name: 'Amina Diallo, MS',
      email: 'a.diallo@bloodhubs.org',
      role: 'BLOOD_BANK',
      title: 'Cryopreservation Specialist',
      organization: 'Central Blood Logistics Hub',
      department: 'Blood Component Processing',
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=200',
      phone: '+1 (555) 019-2899',
      status: 'ACTIVE',
    },
  ]);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('HOSPITAL');
  const [newUserOrg, setNewUserOrg] = useState('City Care Hospital');

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.organization.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const created = {
      id: `user-${Date.now()}`,
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      title: `${newUserRole} Logistics Officer`,
      organization: newUserOrg,
      department: 'Emergency Response',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200',
      phone: '+1 (555) 300-1122',
      status: 'ACTIVE',
    };

    setUsers([created, ...users]);
    setNewUserName('');
    setNewUserEmail('');
    setIsAddUserOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Personnel & Authorized Terminals
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Role-based access directory for hospital clinicians, blood bank specialists, and drone operators
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={UserPlus}
          onClick={() => setIsAddUserOpen(true)}
        >
          Add Authorized User
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-navy-900">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, organization, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs font-medium text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-navy-950 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-navy-950 dark:text-slate-200"
          >
            <option value="ALL">All Roles</option>
            <option value="HOSPITAL">Hospital</option>
            <option value="BLOOD_BANK">Blood Bank</option>
            <option value="ADMIN">Admin / Pilot</option>
          </select>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredUsers.map((u) => (
          <div
            key={u.id}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-all dark:border-slate-800 dark:bg-navy-900 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <img
                    src={u.avatar}
                    alt={u.name}
                    className="h-11 w-11 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {u.name}
                    </h3>
                    <p className="text-[11px] text-slate-500">{u.title}</p>
                  </div>
                </div>

                <Badge
                  variant={
                    u.role === 'HOSPITAL'
                      ? 'in_transit'
                      : u.role === 'BLOOD_BANK'
                      ? 'purple'
                      : 'safe'
                  }
                  size="sm"
                >
                  {u.role === 'HOSPITAL' ? 'Hospital' : u.role === 'BLOOD_BANK' ? 'Blood Bank' : 'Admin'}
                </Badge>
              </div>

              <div className="py-3 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-semibold">{u.organization}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{u.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{u.phone}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Security Clearance:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                LEVEL 3 • {u.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        title="Add Authorized System Operator"
        subtitle="Provision encrypted credentials for hospital or fleet staff"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddUser} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              placeholder="e.g. Dr. Robert Vance, MD"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-navy-950 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Work Email Address *
            </label>
            <input
              type="email"
              required
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              placeholder="e.g. r.vance@hospital.org"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-navy-950 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Role Authority
            </label>
            <select
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-navy-950 dark:text-white"
            >
              <option value="HOSPITAL">Hospital Clinician / Surgeon</option>
              <option value="BLOOD_BANK">Blood Bank Logistics Director</option>
              <option value="ADMIN">Drone Flight Operations Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Organization Name
            </label>
            <input
              type="text"
              value={newUserOrg}
              onChange={(e) => setNewUserOrg(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-slate-900 focus:outline-none dark:border-slate-700 dark:bg-navy-950 dark:text-white"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" variant="primary" size="md" className="w-full">
              Grant Authorized Access
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
