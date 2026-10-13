import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Info, UserCheck, ChevronDown, CheckCircle2 } from 'lucide-react';

export default function DemoBanner() {
  const { user, loginAsDemo, isAuthenticated } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loadingRole, setLoadingRole] = useState(null);
  const navigate = useNavigate();

  const demoProfiles = [
    {
      role: 'HOSPITAL_ADMIN',
      name: 'Dr. Ramesh Kumar',
      email: 'hospital.admin@lifedrone.io',
      institution: 'RIMS Ongole',
      targetPath: '/hospital/dashboard'
    },
    {
      role: 'HOSPITAL_RECEIVER',
      name: 'Nurse Anita Sharma',
      email: 'hospital.receiver@lifedrone.io',
      institution: 'RIMS Ongole',
      targetPath: '/hospital/dashboard'
    },
    {
      role: 'BLOOD_BANK_ADMIN',
      name: 'Dr. B. V. Reddy',
      email: 'bloodbank.admin@lifedrone.io',
      institution: 'Red Cross Ongole',
      targetPath: '/blood-bank/dashboard'
    },
    {
      role: 'BLOOD_BANK_AUTHORIZER',
      name: 'Officer Kavitha Raman',
      email: 'bloodbank.authorizer@lifedrone.io',
      institution: 'Red Cross Ongole',
      targetPath: '/blood-bank/dashboard'
    }
  ];

  const handleSwitch = async (profile) => {
    setLoadingRole(profile.role);
    try {
      await loginAsDemo(profile.email, 'Password@123');
      setDropdownOpen(false);
      navigate(profile.targetPath);
    } catch (e) {
      console.error('Demo switch error:', e);
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <aside
      aria-label="Demonstration Notice"
      style={{
        backgroundColor: '#EFF6FF',
        borderBottom: '1px solid #BFDBFE',
        padding: '8px 16px',
        fontSize: '13px',
        color: '#1E40AF',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        zIndex: 40,
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Info size={15} color="#1D4ED8" style={{ flexShrink: 0 }} />
        <span>
          <strong>Pilot Demonstration Mode:</strong> Simulated Drone Tracking &amp; Prakasam Corridor Routing.
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
        {isAuthenticated && user && (
          <span style={{ fontSize: '12px', color: '#1E3A8A', backgroundColor: '#DBEAFE', padding: '3px 8px', borderRadius: '4px' }}>
            Logged in: <strong>{user.fullName}</strong> ({user.role})
          </span>
        )}

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #93C5FD',
              color: '#1D4ED8',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600'
            }}
          >
            <UserCheck size={14} />
            <span>Switch Demo Role</span>
            <ChevronDown size={14} />
          </button>

          {dropdownOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '100%',
                marginTop: '6px',
                width: '280px',
                backgroundColor: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.15)',
                padding: '8px',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <div style={{ padding: '4px 8px', fontSize: '11px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase' }}>
                Select Instant Demo Persona
              </div>
              {demoProfiles.map((p) => {
                const isCurrent = user?.role === p.role;
                return (
                  <button
                    key={p.role}
                    onClick={() => handleSwitch(p)}
                    disabled={loadingRole !== null}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      textAlign: 'left',
                      backgroundColor: isCurrent ? '#EEF4FF' : '#FFFFFF',
                      border: isCurrent ? '1px solid #BFDBFE' : '1px solid transparent',
                      transition: 'background 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isCurrent) e.currentTarget.style.backgroundColor = '#F8FAFC';
                    }}
                    onMouseLeave={(e) => {
                      if (!isCurrent) e.currentTarget.style.backgroundColor = '#FFFFFF';
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: '600', color: '#152238', fontSize: '13px' }}>
                        {p.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>
                        {p.role} &bull; {p.institution}
                      </div>
                    </div>
                    {isCurrent && <CheckCircle2 size={16} color="#16A34A" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
