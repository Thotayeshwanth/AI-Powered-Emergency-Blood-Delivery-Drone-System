import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Building2, 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  UserCheck, 
  CheckCircle2, 
  Sparkles, 
  Plane, 
  KeyRound, 
  Thermometer, 
  Radio, 
  ChevronRight,
  Shield
} from 'lucide-react';

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, loginAsDemo, isAuthenticated, user } = useAuth();

  // Detect which portal was requested
  const isHospitalRoute = location.pathname.includes('/hospital');
  const isBloodBankRoute = location.pathname.includes('/blood-bank');
  const defaultTab = isBloodBankRoute ? 'BLOOD_BANK' : 'HOSPITAL';

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Sync tab with URL if user navigated to specific route
  useEffect(() => {
    if (location.pathname.includes('/blood-bank')) {
      setActiveTab('BLOOD_BANK');
    } else if (location.pathname.includes('/hospital')) {
      setActiveTab('HOSPITAL');
    }
  }, [location.pathname]);

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
      badge: 'Hospital Admin',
      desc: 'Requests emergency blood products and oversees clinical allocations'
    },
    {
      role: 'HOSPITAL_RECEIVER',
      name: 'Nurse Anita Sharma',
      email: 'hospital.receiver@lifedrone.io',
      institution: 'RIMS Ongole Vertipad',
      tab: 'HOSPITAL',
      badge: 'Designated Receiver',
      desc: 'Receives delivery notifications and verifies single-use handover passkey'
    },
    {
      role: 'BLOOD_BANK_ADMIN',
      name: 'Dr. B. V. Reddy',
      email: 'bloodbank.admin@lifedrone.io',
      institution: 'Red Cross Blood Bank Ongole',
      tab: 'BLOOD_BANK',
      badge: 'Blood Bank Admin',
      desc: 'Oversees inventory reserves, validates requests, and packs cold-chain units'
    },
    {
      role: 'BLOOD_BANK_AUTHORIZER',
      name: 'Officer Kavitha Raman',
      email: 'bloodbank.authorizer@lifedrone.io',
      institution: 'Red Cross Vertipad Hub',
      tab: 'BLOOD_BANK',
      badge: 'Flight Authorizer',
      desc: 'Dispatches drone missions, computes A* routes, and issues passkeys'
    }
  ];

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

  const isHospital = activeTab === 'HOSPITAL';

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 76px)',
        backgroundColor: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        position: 'relative',
        background: 'radial-gradient(circle at 10% 20%, rgba(23, 105, 255, 0.05) 0%, rgba(0, 166, 166, 0.04) 50%, #FFFFFF 100%)'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1100px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '36px',
          alignItems: 'center'
        }}
      >
        {/* Left Side: Brand Visual & Operational Pillars */}
        <div style={{ padding: '20px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#EEF4FF',
              border: '1px solid #BFDBFE',
              padding: '6px 14px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: '700',
              color: '#1769FF',
              marginBottom: '20px'
            }}
          >
            <Radio size={14} color="#1769FF" className="animate-pulse" />
            <span>Prakasam District Drone Network &bull; Active Corridors</span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(28px, 4vw, 42px)',
              fontWeight: '800',
              color: '#152238',
              letterSpacing: '-0.8px',
              lineHeight: 1.15,
              marginBottom: '16px'
            }}
          >
            Precision Aerial Delivery for <span style={{ color: '#1769FF' }}>Life-Saving Blood</span>
          </h1>

          <p
            style={{
              fontSize: '16px',
              lineHeight: 1.6,
              color: '#64748B',
              marginBottom: '32px'
            }}
          >
            Authenticated portal for regional hospitals and blood banks. Coordinate emergency blood requests, verify inventory in real-time, and authorize drone dispatch with single-use cryptographic passkeys.
          </p>

          {/* Operational Highlight Micro-Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px 18px',
                borderRadius: '12px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0'
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#EEF4FF',
                  color: '#1769FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Plane size={20} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#152238' }}>
                  A* Corridor Navigation
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  Autonomous routing between RIMS Ongole &amp; Red Cross Vertipads
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px 18px',
                borderRadius: '12px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0'
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#E6F7F7',
                  color: '#00A6A6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Thermometer size={20} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#152238' }}>
                  Cold-Chain Assurance (+2°C to +6°C)
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  Certified medical containers for PRBC, Whole Blood, and Platelets
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px 18px',
                borderRadius: '12px',
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0'
              }}
            >
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#ECFDF5',
                  color: '#16A34A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <KeyRound size={20} />
              </div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#152238' }}>
                  Salted Cryptographic Passkey Handover
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  Single-use 6-digit verification strictly for designated receivers
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Elevated Clinical Authentication Center */}
        <div>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 20px 45px -10px rgba(23, 105, 255, 0.12), 0 8px 16px -6px rgba(15, 23, 42, 0.04)',
              padding: '36px 32px',
              position: 'relative'
            }}
          >
            {/* Form Header */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: isHospital ? '#1769FF' : '#00A6A6', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {isHospital ? 'Clinical Hospital Operations' : 'Blood Bank Logistics Hub'}
                </span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    fontWeight: '700',
                    color: '#16A34A',
                    backgroundColor: '#ECFDF5',
                    padding: '2px 8px',
                    borderRadius: '999px',
                    border: '1px solid #BBF7D0'
                  }}
                >
                  <Shield size={12} />
                  <span>256-Bit Encrypted</span>
                </span>
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#152238' }}>
                Sign In to Your Facility
              </h2>
              <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
                Enter your authorized clinical credentials to access the delivery command dashboard.
              </p>
            </div>

            {/* Intuitive Sliding Portal Switcher */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '6px',
                backgroundColor: '#F1F5F9',
                padding: '5px',
                borderRadius: '12px',
                marginBottom: '24px'
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setActiveTab('HOSPITAL');
                  setErrorMsg(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '11px',
                  borderRadius: '9px',
                  fontSize: '13px',
                  fontWeight: '700',
                  backgroundColor: isHospital ? '#FFFFFF' : 'transparent',
                  color: isHospital ? '#1769FF' : '#64748B',
                  boxShadow: isHospital ? '0 2px 8px rgba(23, 105, 255, 0.12)' : 'none',
                  border: isHospital ? '1px solid #BFDBFE' : '1px solid transparent',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
              >
                <Building2 size={16} color={isHospital ? '#1769FF' : '#64748B'} />
                <span>Hospital Portal</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('BLOOD_BANK');
                  setErrorMsg(null);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '11px',
                  borderRadius: '9px',
                  fontSize: '13px',
                  fontWeight: '700',
                  backgroundColor: !isHospital ? '#FFFFFF' : 'transparent',
                  color: !isHospital ? '#00A6A6' : '#64748B',
                  boxShadow: !isHospital ? '0 2px 8px rgba(0, 166, 166, 0.12)' : 'none',
                  border: !isHospital ? '1px solid #A5E8E8' : '1px solid transparent',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
              >
                <ShieldCheck size={16} color={!isHospital ? '#00A6A6' : '#64748B'} />
                <span>Blood Bank Portal</span>
              </button>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div
                style={{
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#DC2626',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '20px'
                }}
              >
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Authentication Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#152238', marginBottom: '6px' }}>
                  Institutional Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail
                    size={17}
                    color="#94A3B8"
                    style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isHospital ? 'hospital.admin@lifedrone.io' : 'bloodbank.admin@lifedrone.io'}
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 42px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      outline: 'none',
                      fontSize: '14px',
                      color: '#152238',
                      backgroundColor: '#FFFFFF',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = isHospital ? '#1769FF' : '#00A6A6'}
                    onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
                  />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '700', color: '#152238' }}>
                    Access Password
                  </label>
                  <span style={{ fontSize: '11px', color: '#64748B' }}>
                    Demo Key: <code>Password@123</code>
                  </span>
                </div>

                <div style={{ position: 'relative' }}>
                  <Lock
                    size={17}
                    color="#94A3B8"
                    style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your security password"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 42px 12px 42px',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      outline: 'none',
                      fontSize: '14px',
                      color: '#152238',
                      backgroundColor: '#FFFFFF',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = isHospital ? '#1769FF' : '#00A6A6'}
                    onBlur={(e) => e.target.style.borderColor = '#CBD5E1'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#94A3B8',
                      padding: '4px',
                      borderRadius: '6px'
                    }}
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={isHospital ? 'btn-primary' : 'btn-secondary'}
                style={{
                  width: '100%',
                  padding: '13px',
                  fontSize: '15px',
                  fontWeight: '700',
                  borderRadius: '10px',
                  marginTop: '4px',
                  cursor: 'pointer'
                }}
              >
                {loading ? (
                  <span>Authenticating Facility...</span>
                ) : (
                  <>
                    <span>Enter {isHospital ? 'Hospital Command' : 'Blood Bank Command'}</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            {/* Instant Demo Role Quick-Access Strip */}
            <div style={{ marginTop: '28px', borderTop: '1px solid #E2E8F0', paddingTop: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '800', color: '#152238', textTransform: 'uppercase' }}>
                  <UserCheck size={14} color="#1769FF" />
                  <span>One-Click Clinical Demo Personas</span>
                </div>
                <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: '700' }}>
                  Instant Sign-In
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
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
                        padding: '10px 14px',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid #E2E8F0',
                        borderRadius: '10px',
                        textAlign: 'left',
                        transition: 'all 0.18s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = isHospital ? '#EEF4FF' : '#E6F7F7';
                        e.currentTarget.style.borderColor = isHospital ? '#BFDBFE' : '#A5E8E8';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#F8FAFC';
                        e.currentTarget.style.borderColor = '#E2E8F0';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#152238', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{acc.name}</span>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: '700',
                              color: isHospital ? '#1769FF' : '#00A6A6',
                              backgroundColor: '#FFFFFF',
                              padding: '1px 6px',
                              borderRadius: '4px',
                              border: '1px solid #CBD5E1'
                            }}
                          >
                            {acc.badge}
                          </span>
                        </div>
                        <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>
                          {acc.institution} &bull; {acc.desc}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: isHospital ? '#1769FF' : '#00A6A6', fontSize: '12px', fontWeight: '700' }}>
                        <span>Login</span>
                        <ChevronRight size={14} />
                      </div>
                    </button>
                  ))}
              </div>
            </div>

            {/* Safety & Onboarding Notice */}
            <div style={{ marginTop: '18px', textAlign: 'center', fontSize: '12px', color: '#64748B', lineHeight: 1.5 }}>
              <span>Need to onboard a new hospital vertipad or blood bank? </span>
              <Link to="/contact" style={{ color: '#1769FF', fontWeight: '700' }}>
                Contact Operations Desk &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
