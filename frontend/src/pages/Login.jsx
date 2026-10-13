import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  UserCheck, 
  CheckCircle2,
  Info
} from 'lucide-react';

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, loginAsDemo, isAuthenticated, user } = useAuth();

  // Determine portal from URL path
  const isHospitalRoute = location.pathname.includes('/hospital');
  const isBloodBankRoute = location.pathname.includes('/blood-bank');
  const initialTab = isBloodBankRoute ? 'BLOOD_BANK' : 'HOSPITAL';

  const [activeTab, setActiveTab] = useState(initialTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // If already logged in, redirect to respective dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.institutionType === 'HOSPITAL') {
        navigate('/hospital/dashboard');
      } else {
        navigate('/blood-bank/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Demo accounts
  const demoAccounts = [
    {
      role: 'HOSPITAL_ADMIN',
      name: 'Dr. Ramesh Kumar',
      email: 'hospital.admin@lifedrone.io',
      institution: 'RIMS Ongole',
      tab: 'HOSPITAL',
      badge: 'Hospital Admin'
    },
    {
      role: 'HOSPITAL_RECEIVER',
      name: 'Nurse Anita Sharma',
      email: 'hospital.receiver@lifedrone.io',
      institution: 'RIMS Ongole',
      tab: 'HOSPITAL',
      badge: 'Hospital Receiver'
    },
    {
      role: 'BLOOD_BANK_ADMIN',
      name: 'Dr. B. V. Reddy',
      email: 'bloodbank.admin@lifedrone.io',
      institution: 'Red Cross Ongole',
      tab: 'BLOOD_BANK',
      badge: 'Blood Bank Admin'
    },
    {
      role: 'BLOOD_BANK_AUTHORIZER',
      name: 'Officer Kavitha Raman',
      email: 'bloodbank.authorizer@lifedrone.io',
      institution: 'Red Cross Ongole',
      tab: 'BLOOD_BANK',
      badge: 'Dispatch Authorizer'
    }
  ];

  const handleDemoSelect = (account) => {
    setEmail(account.email);
    setPassword('Password@123');
    setActiveTab(account.tab);
  };

  const handleQuickLogin = async (account) => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const data = await loginAsDemo(account.email, 'Password@123');
      if (data.user.institutionType === 'HOSPITAL') {
        navigate('/hospital/dashboard');
      } else {
        navigate('/blood-bank/dashboard');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const data = await login(email, password);
      if (data.user.institutionType === 'HOSPITAL') {
        navigate('/hospital/dashboard');
      } else {
        navigate('/blood-bank/dashboard');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '80vh',
        backgroundColor: '#F5F8FC',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px'
      }}
    >
      <div style={{ width: '100%', maxWidth: '480px' }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #1769FF 0%, #0052cc 100%)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              marginBottom: '16px',
              boxShadow: '0 8px 16px rgba(23, 105, 255, 0.25)'
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
              <circle cx="12" cy="12" r="3" fill="#00A6A6" />
            </svg>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#152238', letterSpacing: '-0.5px', marginBottom: '6px' }}>
            LifeDrone Portal Sign-In
          </h1>
          <p style={{ fontSize: '14px', color: '#64748B' }}>
            Secure authenticated access for approved regional medical facilities
          </p>
        </div>

        {/* Card */}
        <div
          className="card-light"
          style={{
            padding: '36px',
            boxShadow: '0 10px 25px -5px rgba(21, 34, 56, 0.08), 0 8px 10px -6px rgba(21, 34, 56, 0.04)'
          }}
        >
          {/* Portal Switch Tabs */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '6px',
              backgroundColor: '#F1F5F9',
              padding: '4px',
              borderRadius: '10px',
              marginBottom: '28px'
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab('HOSPITAL')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '700',
                backgroundColor: activeTab === 'HOSPITAL' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'HOSPITAL' ? '#1769FF' : '#64748B',
                boxShadow: activeTab === 'HOSPITAL' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <Building2 size={16} />
              <span>Hospital Portal</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('BLOOD_BANK')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '700',
                backgroundColor: activeTab === 'BLOOD_BANK' ? '#FFFFFF' : 'transparent',
                color: activeTab === 'BLOOD_BANK' ? '#00A6A6' : '#64748B',
                boxShadow: activeTab === 'BLOOD_BANK' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              <ShieldCheck size={16} />
              <span>Blood Bank Portal</span>
            </button>
          </div>

          {errorMsg && (
            <div
              style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#DC2626',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '20px'
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#152238', marginBottom: '6px' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={18}
                  color="#94A3B8"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={activeTab === 'HOSPITAL' ? 'hospital.admin@lifedrone.io' : 'bloodbank.admin@lifedrone.io'}
                  required
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 38px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    outline: 'none',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#152238', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  color="#94A3B8"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '11px 14px 11px 38px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    outline: 'none',
                    fontSize: '14px'
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={activeTab === 'HOSPITAL' ? 'btn-primary' : 'btn-secondary'}
              style={{ width: '100%', padding: '12px', fontSize: '15px', marginTop: '6px' }}
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to {activeTab === 'HOSPITAL' ? 'Hospital Portal' : 'Blood Bank Portal'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Accounts Helper */}
          <div style={{ marginTop: '32px', borderTop: '1px solid #E2E8F0', paddingTop: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '12px' }}>
              <UserCheck size={14} color="#1769FF" />
              <span>Instant Demo Accounts (One-Click Sign-In)</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {demoAccounts
                .filter((acc) => acc.tab === activeTab)
                .map((acc) => (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleQuickLogin(acc)}
                    disabled={loading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '8px',
                      textAlign: 'left',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#EFF6FF';
                      e.currentTarget.style.borderColor = '#BFDBFE';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#F8FAFC';
                      e.currentTarget.style.borderColor = '#E2E8F0';
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#152238' }}>
                        {acc.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#64748B' }}>
                        {acc.badge} &bull; {acc.email}
                      </div>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: '#1769FF' }}>
                      Sign In &rarr;
                    </span>
                  </button>
                ))}
            </div>

            <div style={{ marginTop: '14px', fontSize: '11px', color: '#94A3B8', textAlign: 'center' }}>
              Demo accounts password: <code>Password@123</code> &bull; Prakasam District Pilot
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: '#64748B' }}>
          Notice: Public self-registration for clinical roles is prohibited for security. Contact operations to onboard new hospital vertipads.
        </div>
      </div>
    </div>
  );
}
