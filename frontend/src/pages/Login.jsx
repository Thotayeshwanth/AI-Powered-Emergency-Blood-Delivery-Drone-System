import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
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
  MapPin,
  Navigation,
  Phone,
  FileCheck,
  User,
  Stethoscope,
  Search,
  Check,
  Info,
  ChevronDown,
  ChevronUp,
  RefreshCw
} from 'lucide-react';

// CMS Certificate ranges specified in official medical guidelines
const CMS_RANGES = [
  { range: '0001 to 0879', min: 1, max: 879, label: 'Short-Term (General Medicine and Surgery) Hospitals', sample: '0125' },
  { range: '0880 to 0899', min: 880, max: 899, label: "Children's Hospitals", sample: '0885' },
  { range: '1300 to 1399', min: 1300, max: 1399, label: 'Critical Access Hospitals (often smaller rural facilities)', sample: '1340' },
  { range: '2000 to 2299', min: 2000, max: 2299, label: 'Long-Term Care Hospitals', sample: '2150' },
  { range: '3300 to 3399', min: 3300, max: 3399, label: "Children's Psychiatric Hospitals", sample: '3320' }
];

function detectCmsCategory(cmsValue) {
  if (!cmsValue) return null;
  const num = parseInt(String(cmsValue).replace(/\D/g, ''), 10);
  if (isNaN(num)) return null;

  for (const item of CMS_RANGES) {
    if (num >= item.min && num <= item.max) {
      return item;
    }
  }
  return {
    range: 'Specialized Range',
    label: 'Specialized Healthcare Facility',
    sample: cmsValue
  };
}

// Preset Prakasam District locations for instant 1-click address & GPS fill
const PRESET_LOCATIONS = [
  {
    label: 'RIMS Road, Ongole',
    address: 'RIMS Medical College Road, Ongole, Prakasam District, Andhra Pradesh 523001',
    lat: 15.505700,
    lng: 80.049900
  },
  {
    label: 'Trunk Road, Ongole',
    address: 'Red Cross Building, Trunk Road, Ongole, Prakasam District, Andhra Pradesh 523001',
    lat: 15.508500,
    lng: 80.044200
  },
  {
    label: 'Chirala Medical Hub',
    address: 'Area Hospital Road, Chirala, Prakasam District, Andhra Pradesh 523155',
    lat: 15.824600,
    lng: 80.352100
  },
  {
    label: 'Markapur Hospital Area',
    address: 'Government Hospital Complex, Markapur, Prakasam District, Andhra Pradesh 523316',
    lat: 15.735000,
    lng: 79.280000
  }
];

export default function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, loginAsDemo, isAuthenticated, user } = useAuth();

  // Mode: 'SIGN_IN' or 'REGISTER'
  const [authMode, setAuthMode] = useState('SIGN_IN');

  // Active portal tab: 'HOSPITAL' or 'BLOOD_BANK'
  const isBloodBankRoute = location.pathname.includes('/blood-bank');
  const [activeTab, setActiveTab] = useState(isBloodBankRoute ? 'BLOOD_BANK' : 'HOSPITAL');

  // Sign In state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);

  // Registration form state
  const [regData, setRegData] = useState({
    name: '',
    cms_certificate_number: '',
    license_number: '',
    owner_name: '',
    doctor_name: '',
    address: '',
    latitude: '',
    longitude: '',
    contact_email: '',
    contact_phone: '',
    password: '',
    confirm_password: ''
  });
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showCmsGuide, setShowCmsGuide] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeSuggestions, setGeocodeSuggestions] = useState([]);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState(null);
  const [regSuccessData, setRegSuccessData] = useState(null);

  // Sync tab with URL
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

  // Detected CMS Category
  const detectedCmsCategory = detectCmsCategory(regData.cms_certificate_number);

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
    setLoginError(null);
    setLoginLoading(true);
    try {
      const data = await loginAsDemo(account.email, 'Password@123');
      if (data.user.institutionType === 'HOSPITAL') {
        navigate('/hospital/dashboard');
      } else {
        navigate('/blood-bank/dashboard');
      }
    } catch (err) {
      setLoginError(err.message || 'Login failed.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError(null);
    setLoginLoading(true);

    try {
      const data = await login(email, password);
      if (data.user.institutionType === 'HOSPITAL') {
        navigate('/hospital/dashboard');
      } else {
        navigate('/blood-bank/dashboard');
      }
    } catch (err) {
      setLoginError(err.message || 'Invalid email or password.');
    } finally {
      setLoginLoading(false);
    }
  };

  // Address Auto-Geocoding using Nominatim
  const handleAutoGeocode = async (addressQuery) => {
    const queryToSearch = addressQuery || regData.address;
    if (!queryToSearch || queryToSearch.trim().length < 3) {
      setRegError('Please enter a specific locality or address before auto-detecting coordinates.');
      return;
    }

    setGeocoding(true);
    setRegError(null);
    try {
      const res = await authAPI.geocode(queryToSearch);
      if (res.data?.results && res.data.results.length > 0) {
        const topResult = res.data.results[0];
        setRegData((prev) => ({
          ...prev,
          latitude: topResult.lat.toFixed(6),
          longitude: topResult.lon.toFixed(6)
        }));
        setGeocodeSuggestions(res.data.results);
      } else {
        // Fallback geocoding to Prakasam default if external service is quiet
        setRegData((prev) => ({
          ...prev,
          latitude: '15.505700',
          longitude: '80.049900'
        }));
      }
    } catch (err) {
      console.error('Geocoding request failed:', err);
      // Friendly fallback
      setRegData((prev) => ({
        ...prev,
        latitude: '15.505700',
        longitude: '80.049900'
      }));
    } finally {
      setGeocoding(false);
    }
  };

  const handleSelectPresetLocation = (preset) => {
    setRegData((prev) => ({
      ...prev,
      address: preset.address,
      latitude: preset.lat.toFixed(6),
      longitude: preset.lng.toFixed(6)
    }));
    setGeocodeSuggestions([]);
  };

  const handleSelectGeocodeSuggestion = (suggestion) => {
    setRegData((prev) => ({
      ...prev,
      address: suggestion.displayName,
      latitude: suggestion.lat.toFixed(6),
      longitude: suggestion.lon.toFixed(6)
    }));
    setGeocodeSuggestions([]);
  };

  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    setRegError(null);

    // Validation
    if (activeTab === 'HOSPITAL') {
      if (!regData.cms_certificate_number.trim()) {
        setRegError('CMS Certificate Number is required for Hospital Registration.');
        return;
      }
    } else {
      if (!regData.license_number.trim()) {
        setRegError('Blood Bank License / Certificate Number is required.');
        return;
      }
    }

    if (!regData.name.trim()) {
      setRegError('Facility Name is required.');
      return;
    }
    if (!regData.owner_name.trim()) {
      setRegError('Authorized Owner / Director Name is required.');
      return;
    }
    if (!regData.doctor_name.trim()) {
      setRegError('Supervising Doctor / Chief Medical Officer Name is required.');
      return;
    }
    if (!regData.address.trim()) {
      setRegError('Designated Facility Address is required.');
      return;
    }
    if (!regData.latitude || !regData.longitude) {
      setRegError('Latitude and Longitude are required. Click "Auto-Detect Lat/Long" or select an address.');
      return;
    }
    if (!regData.contact_email.trim() || !regData.contact_email.includes('@')) {
      setRegError('Please provide a valid Gmail or Institutional email address.');
      return;
    }
    if (!regData.contact_phone.trim() || regData.contact_phone.trim().length < 10) {
      setRegError('Please provide a valid 10-digit mobile number.');
      return;
    }
    if (!regData.password || regData.password.length < 6) {
      setRegError('Password must be at least 6 characters.');
      return;
    }
    if (regData.password !== regData.confirm_password) {
      setRegError('Password and Confirm Password do not match.');
      return;
    }

    setRegLoading(true);

    try {
      let res;
      if (activeTab === 'HOSPITAL') {
        res = await authAPI.registerHospital({
          name: regData.name,
          cms_certificate_number: regData.cms_certificate_number,
          owner_name: regData.owner_name,
          doctor_name: regData.doctor_name,
          address: regData.address,
          latitude: regData.latitude,
          longitude: regData.longitude,
          contact_email: regData.contact_email,
          contact_phone: regData.contact_phone,
          password: regData.password,
          facility_category: detectedCmsCategory?.label
        });
      } else {
        res = await authAPI.registerBloodBank({
          name: regData.name,
          license_number: regData.license_number,
          owner_name: regData.owner_name,
          doctor_name: regData.doctor_name,
          address: regData.address,
          latitude: regData.latitude,
          longitude: regData.longitude,
          contact_email: regData.contact_email,
          contact_phone: regData.contact_phone,
          password: regData.password,
          facility_category: 'Regional Blood Transfusion Centre'
        });
      }

      setRegSuccessData({
        ...regData,
        institutionType: activeTab,
        category: detectedCmsCategory?.label || (activeTab === 'HOSPITAL' ? 'Hospital' : 'Blood Bank')
      });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed. Please verify your details.';
      setRegError(msg);
    } finally {
      setRegLoading(false);
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
        padding: '36px 16px',
        position: 'relative',
        background: 'radial-gradient(circle at 10% 20%, rgba(18, 70, 118, 0.05) 0%, rgba(210, 37, 47, 0.04) 50%, #FFFFFF 100%)'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: authMode === 'REGISTER' ? '1180px' : '1080px',
          display: 'grid',
          gridTemplateColumns: authMode === 'REGISTER' ? '1fr' : 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
          gap: '36px',
          alignItems: 'start'
        }}
      >
        {/* Left Side: Brand Visual & Operational Pillars (Shown during Sign In) */}
        {authMode === 'SIGN_IN' && (
          <div style={{ padding: '16px' }}>
            <div style={{ marginBottom: '20px' }}>
              <img
                src="/images/lifedrone-logo.png"
                alt="LifeDrone - One Step to Get Faster Blood Delivery"
                style={{
                  height: '52px',
                  width: 'auto',
                  maxWidth: '270px',
                  objectFit: 'contain',
                  display: 'block'
                }}
              />
            </div>

            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#EEF5FA',
                border: '1px solid #B8D3E9',
                padding: '6px 14px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: '700',
                color: '#124676',
                marginBottom: '20px'
              }}
            >
              <Radio size={14} color="#124676" className="animate-pulse" />
              <span>Prakasam District Drone Network &bull; Active Corridors</span>
            </div>

            <h1
              style={{
                fontSize: 'clamp(28px, 4vw, 40px)',
                fontWeight: '800',
                color: '#152238',
                letterSpacing: '-0.8px',
                lineHeight: 1.15,
                marginBottom: '16px'
              }}
            >
              Precision Aerial Delivery for <span style={{ color: '#124676' }}>Life-Saving Blood</span>
            </h1>

            <p
              style={{
                fontSize: '15px',
                lineHeight: 1.6,
                color: '#64748B',
                marginBottom: '28px'
              }}
            >
              Authenticated clinical portal for regional hospitals and blood banks. Coordinate emergency blood requests, verify inventory in real-time, and authorize drone dispatch with single-use cryptographic passkeys.
            </p>

            {/* Operational Highlight Micro-Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px 16px',
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
                    backgroundColor: '#EEF5FA',
                    color: '#124676',
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
                  padding: '12px 16px',
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
                    backgroundColor: '#FEF2F2',
                    color: '#D2252F',
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
                    Cold-Chain Assurance (+2&deg;C to +6&deg;C)
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
                  padding: '12px 16px',
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
        )}

        {/* Right / Center Side: Authentication or Registration Form Card */}
        <div style={{ maxWidth: authMode === 'REGISTER' ? '920px' : '520px', margin: '0 auto', width: '100%' }}>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '24px',
              border: '1px solid #E2E8F0',
              boxShadow: '0 20px 45px -10px rgba(18, 70, 118, 0.12), 0 8px 16px -6px rgba(15, 23, 42, 0.04)',
              padding: authMode === 'REGISTER' ? '36px 36px' : '36px 32px',
              position: 'relative'
            }}
          >
            {/* Top Switcher: Sign In vs Register Facility */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: '1px solid #E2E8F0',
                paddingBottom: '16px',
                marginBottom: '24px'
              }}
            >
              <div style={{ display: 'flex', gap: '8px', backgroundColor: '#F1F5F9', padding: '4px', borderRadius: '10px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('SIGN_IN');
                    setLoginError(null);
                    setRegError(null);
                  }}
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: '700',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: authMode === 'SIGN_IN' ? '#FFFFFF' : 'transparent',
                    color: authMode === 'SIGN_IN' ? '#124676' : '#64748B',
                    boxShadow: authMode === 'SIGN_IN' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Portal Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('REGISTER');
                    setLoginError(null);
                    setRegError(null);
                    setRegSuccessData(null);
                  }}
                  style={{
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: '700',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    backgroundColor: authMode === 'REGISTER' ? '#FFFFFF' : 'transparent',
                    color: authMode === 'REGISTER' ? '#124676' : '#64748B',
                    boxShadow: authMode === 'REGISTER' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Register New Facility
                </button>
              </div>
            </div>

            {/* Portal Switcher: Hospital Portal vs Blood Bank Portal */}
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
                  setLoginError(null);
                  setRegError(null);
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
                  color: isHospital ? '#124676' : '#64748B',
                  boxShadow: isHospital ? '0 2px 8px rgba(18, 70, 118, 0.12)' : 'none',
                  border: isHospital ? '1px solid #B8D3E9' : '1px solid transparent',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
              >
                <Building2 size={16} color={isHospital ? '#124676' : '#64748B'} />
                <span>Hospital Portal</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('BLOOD_BANK');
                  setLoginError(null);
                  setRegError(null);
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
                  color: !isHospital ? '#D2252F' : '#64748B',
                  boxShadow: !isHospital ? '0 2px 8px rgba(210, 37, 47, 0.12)' : 'none',
                  border: !isHospital ? '1px solid #FECACA' : '1px solid transparent',
                  transition: 'all 0.2s ease',
                  cursor: 'pointer'
                }}
              >
                <ShieldCheck size={16} color={!isHospital ? '#D2252F' : '#64748B'} />
                <span>Blood Bank Portal</span>
              </button>
            </div>

            {/* ========================================================================= */}
            {/* VIEW 1: SIGN IN MODE                                                      */}
            {/* ========================================================================= */}
            {authMode === 'SIGN_IN' && (
              <>
                <div style={{ marginBottom: '22px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: isHospital ? '#124676' : '#D2252F', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                    {isHospital ? 'Clinical Hospital Operations' : 'Blood Bank Logistics Hub'}
                  </div>
                  <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#152238' }}>
                    Sign In to Your Facility
                  </h2>
                  <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
                    Enter your authorized clinical credentials to access the delivery command dashboard.
                  </p>
                </div>

                {/* Error Message */}
                {loginError && (
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
                    <span>{loginError}</span>
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
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
                          fontSize: '14px',
                          border: '1px solid #CBD5E1',
                          borderRadius: '10px',
                          outline: 'none',
                          color: '#152238',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label style={{ fontSize: '13px', fontWeight: '700', color: '#152238' }}>
                        Access Password
                      </label>
                      <span style={{ fontSize: '11px', color: '#64748B' }}>Demo Key: Password@123</span>
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
                          fontSize: '14px',
                          border: '1px solid #CBD5E1',
                          borderRadius: '10px',
                          outline: 'none',
                          color: '#152238',
                          boxSizing: 'border-box'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          color: '#94A3B8'
                        }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      backgroundColor: isHospital ? '#124676' : '#D2252F',
                      color: '#FFFFFF',
                      border: 'none',
                      width: '100%',
                      padding: '13px',
                      fontSize: '15px',
                      fontWeight: '700',
                      borderRadius: '10px',
                      marginTop: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    {loginLoading ? (
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
                <div style={{ marginTop: '26px', borderTop: '1px solid #E2E8F0', paddingTop: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: '800', color: '#152238', textTransform: 'uppercase' }}>
                      <UserCheck size={14} color="#124676" />
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
                          disabled={loginLoading}
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
                            e.currentTarget.style.backgroundColor = isHospital ? '#EEF5FA' : '#FEF2F2';
                            e.currentTarget.style.borderColor = isHospital ? '#B8D3E9' : '#FECACA';
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
                                  color: isHospital ? '#124676' : '#D2252F',
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

                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: isHospital ? '#124676' : '#D2252F', fontSize: '12px', fontWeight: '700' }}>
                            <span>Login</span>
                            <ChevronRight size={14} />
                          </div>
                        </button>
                      ))}
                  </div>
                </div>

                {/* Onboard Facility Callout */}
                <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#64748B', borderTop: '1px dashed #E2E8F0', paddingTop: '16px' }}>
                  <span>Need to register a new {isHospital ? 'hospital' : 'blood bank'} vertipad? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('REGISTER');
                      setRegError(null);
                      setRegSuccessData(null);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: isHospital ? '#124676' : '#D2252F',
                      fontWeight: '800',
                      cursor: 'pointer',
                      padding: 0,
                      textDecoration: 'underline'
                    }}
                  >
                    Register Facility &rarr;
                  </button>
                </div>
              </>
            )}

            {/* ========================================================================= */}
            {/* VIEW 2: REGISTRATION SUCCESS NOTIFICATION STATE                           */}
            {/* ========================================================================= */}
            {authMode === 'REGISTER' && regSuccessData && (
              <div style={{ padding: '8px 0', textAlign: 'center' }}>
                <div
                  style={{
                    width: '68px',
                    height: '68px',
                    borderRadius: '50%',
                    backgroundColor: '#ECFDF5',
                    border: '3px solid #16A34A',
                    color: '#16A34A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 18px auto'
                  }}
                >
                  <CheckCircle2 size={38} />
                </div>

                <div
                  style={{
                    display: 'inline-block',
                    padding: '4px 14px',
                    borderRadius: '999px',
                    backgroundColor: '#FEF3C7',
                    color: '#D97706',
                    fontSize: '12px',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '10px'
                  }}
                >
                  Application Submitted For Clinical Review
                </div>

                <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#152238', marginBottom: '8px' }}>
                  Your application is under review. It will be approved soon. Thank you!
                </h2>

                <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, maxWidth: '620px', margin: '0 auto 24px auto' }}>
                  An automated confirmation email has been dispatched to <strong>{regSuccessData.contact_email}</strong>. 
                  Our Clinical Operations Committee and Aviation Safety Desk are reviewing your facility authorization details and vertipad coordinates.
                </p>

                {/* Facility Summary Card */}
                <div
                  style={{
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    borderRadius: '16px',
                    padding: '20px 24px',
                    textAlign: 'left',
                    maxWidth: '620px',
                    margin: '0 auto 28px auto'
                  }}
                >
                  <div style={{ fontSize: '13px', fontWeight: '800', color: '#124676', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.5px' }}>
                    Registered Facility Dossier
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', fontSize: '13px' }}>
                    <div>
                      <span style={{ color: '#64748B', display: 'block', fontSize: '11px', fontWeight: '600' }}>FACILITY NAME</span>
                      <strong style={{ color: '#152238' }}>{regSuccessData.name}</strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748B', display: 'block', fontSize: '11px', fontWeight: '600' }}>
                        {regSuccessData.institutionType === 'HOSPITAL' ? 'CMS CERTIFICATE NO.' : 'BLOOD BANK LICENSE NO.'}
                      </span>
                      <strong style={{ color: '#124676', fontFamily: 'monospace' }}>
                        {regSuccessData.cms_certificate_number || regSuccessData.license_number}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: '#64748B', display: 'block', fontSize: '11px', fontWeight: '600' }}>AUTHORIZED OWNER</span>
                      <span style={{ color: '#152238', fontWeight: '600' }}>{regSuccessData.owner_name}</span>
                    </div>
                    <div>
                      <span style={{ color: '#64748B', display: 'block', fontSize: '11px', fontWeight: '600' }}>SUPERVISING DOCTOR / CMO</span>
                      <span style={{ color: '#152238', fontWeight: '600' }}>{regSuccessData.doctor_name}</span>
                    </div>
                    <div>
                      <span style={{ color: '#64748B', display: 'block', fontSize: '11px', fontWeight: '600' }}>EXACT VERTIPAD GPS</span>
                      <span style={{ color: '#16A34A', fontFamily: 'monospace', fontWeight: '700' }}>
                        Lat: {regSuccessData.latitude}, Long: {regSuccessData.longitude}
                      </span>
                    </div>
                    <div>
                      <span style={{ color: '#64748B', display: 'block', fontSize: '11px', fontWeight: '600' }}>APPROVAL STATUS</span>
                      <span style={{ color: '#D97706', fontWeight: '800' }}>Pending Clinical Verification</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('SIGN_IN');
                      setEmail(regSuccessData.contact_email);
                      setRegSuccessData(null);
                    }}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#124676',
                      color: '#FFFFFF',
                      fontWeight: '700',
                      borderRadius: '10px',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Return to Portal Sign In
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setRegSuccessData(null);
                      setRegData({
                        name: '',
                        cms_certificate_number: '',
                        license_number: '',
                        owner_name: '',
                        doctor_name: '',
                        address: '',
                        latitude: '',
                        longitude: '',
                        contact_email: '',
                        contact_phone: '',
                        password: '',
                        confirm_password: ''
                      });
                    }}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#F1F5F9',
                      color: '#152238',
                      fontWeight: '700',
                      borderRadius: '10px',
                      border: '1px solid #CBD5E1',
                      cursor: 'pointer'
                    }}
                  >
                    Register Another Facility
                  </button>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 3: REGISTRATION FORM MODE                                            */}
            {/* ========================================================================= */}
            {authMode === 'REGISTER' && !regSuccessData && (
              <div>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: isHospital ? '#124676' : '#D2252F', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>
                    {isHospital ? 'New Hospital Onboarding' : 'New Blood Bank Onboarding'}
                  </div>
                  <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#152238' }}>
                    Register {isHospital ? 'Hospital Facility' : 'Blood Bank Centre'}
                  </h2>
                  <p style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
                    Submit authorization details, institutional contact info, and exact vertipad location coordinates for clinical corridor access.
                  </p>
                </div>

                {/* Error Banner */}
                {regError && (
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
                    <span>{regError}</span>
                  </div>
                )}

                <form onSubmit={handleRegistrationSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {/* SECTION 1: Facility Identification */}
                  <div
                    style={{
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '14px',
                      padding: '18px 20px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                      <FileCheck size={18} color="#124676" />
                      <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#152238', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        1. Regulatory Certificate &amp; Facility Name
                      </h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                      {/* Hospital CMS Certificate Number */}
                      {isHospital ? (
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <label style={{ fontSize: '13px', fontWeight: '700', color: '#152238' }}>
                              CMS Certificate Number <span style={{ color: '#D2252F' }}>*</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => setShowCmsGuide(!showCmsGuide)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#124676',
                                fontSize: '11px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                                padding: 0
                              }}
                            >
                              <Info size={12} />
                              <span>{showCmsGuide ? 'Hide CMS Guide' : 'CMS Category Guide'}</span>
                              {showCmsGuide ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </button>
                          </div>

                          <div style={{ position: 'relative' }}>
                            <input
                              type="text"
                              value={regData.cms_certificate_number}
                              onChange={(e) => setRegData({ ...regData, cms_certificate_number: e.target.value })}
                              placeholder="e.g. 0125, 0885, 1340, 2150"
                              required
                              style={{
                                width: '100%',
                                padding: '11px 14px',
                                fontSize: '14px',
                                border: '1px solid #CBD5E1',
                                borderRadius: '10px',
                                outline: 'none',
                                color: '#152238',
                                boxSizing: 'border-box',
                                fontFamily: 'monospace',
                                fontWeight: '600'
                              }}
                            />
                          </div>

                          {/* Live CMS Category Detection Badge */}
                          {detectedCmsCategory && (
                            <div
                              style={{
                                marginTop: '6px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '11px',
                                fontWeight: '700',
                                color: '#047857',
                                backgroundColor: '#ECFDF5',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                border: '1px solid #A7F3D0'
                              }}
                            >
                              <Check size={12} />
                              <span>Detected: {detectedCmsCategory.label} ({detectedCmsCategory.range})</span>
                            </div>
                          )}

                          {/* CMS Range Directory Accordion matching user's image */}
                          {showCmsGuide && (
                            <div
                              style={{
                                marginTop: '10px',
                                backgroundColor: '#152238',
                                color: '#F8FAFC',
                                padding: '14px 16px',
                                borderRadius: '10px',
                                fontSize: '12px'
                              }}
                            >
                              <div style={{ fontWeight: '800', marginBottom: '8px', color: '#93C5FD' }}>
                                CMS Hospital Numbering Directory:
                              </div>
                              <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px', lineHeight: 1.4 }}>
                                {CMS_RANGES.map((item) => (
                                  <li key={item.range}>
                                    <strong style={{ color: '#FFFFFF' }}>{item.range}:</strong> {item.label}
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setRegData({ ...regData, cms_certificate_number: item.sample });
                                        setShowCmsGuide(false);
                                      }}
                                      style={{
                                        marginLeft: '8px',
                                        backgroundColor: 'rgba(255,255,255,0.15)',
                                        border: 'none',
                                        color: '#38BDF8',
                                        padding: '1px 6px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '10px',
                                        fontWeight: '700'
                                      }}
                                    >
                                      Use {item.sample}
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Blood Bank License Number */
                        <div>
                          <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#152238', marginBottom: '6px' }}>
                            Blood Bank License / Certificate Number <span style={{ color: '#D2252F' }}>*</span>
                          </label>
                          <input
                            type="text"
                            value={regData.license_number}
                            onChange={(e) => setRegData({ ...regData, license_number: e.target.value })}
                            placeholder="e.g. AP/DL/BB/2026/0942"
                            required
                            style={{
                              width: '100%',
                              padding: '11px 14px',
                              fontSize: '14px',
                              border: '1px solid #CBD5E1',
                              borderRadius: '10px',
                              outline: 'none',
                              color: '#152238',
                              boxSizing: 'border-box',
                              fontFamily: 'monospace',
                              fontWeight: '600'
                            }}
                          />
                          <span style={{ fontSize: '11px', color: '#64748B', marginTop: '4px', display: 'block' }}>
                            State Drug Control &amp; Transfusion Council Accreditation
                          </span>
                        </div>
                      )}

                      {/* Facility Name */}
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#152238', marginBottom: '6px' }}>
                          Official {isHospital ? 'Hospital' : 'Blood Bank'} Name <span style={{ color: '#D2252F' }}>*</span>
                        </label>
                        <input
                          type="text"
                          value={regData.name}
                          onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                          placeholder={isHospital ? 'e.g. RIMS Super Speciality Hospital, Ongole' : 'e.g. Indian Red Cross Society Blood Centre'}
                          required
                          style={{
                            width: '100%',
                            padding: '11px 14px',
                            fontSize: '14px',
                            border: '1px solid #CBD5E1',
                            borderRadius: '10px',
                            outline: 'none',
                            color: '#152238',
                            boxSizing: 'border-box'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECTION 2: Authorization Details (Owner & Doctor) */}
                  <div
                    style={{
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '14px',
                      padding: '18px 20px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                      <User size={18} color="#124676" />
                      <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#152238', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        2. Institutional Authorization Details
                      </h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                      {/* Owner Name */}
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#152238', marginBottom: '6px' }}>
                          Authorized Owner / Chairman / Director Name <span style={{ color: '#D2252F' }}>*</span>
                        </label>
                        <div style={{ position: 'relative' }}>
                          <User size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                          <input
                            type="text"
                            value={regData.owner_name}
                            onChange={(e) => setRegData({ ...regData, owner_name: e.target.value })}
                            placeholder="e.g. Sri K. Venkateswarlu"
                            required
                            style={{
                              width: '100%',
                              padding: '11px 14px 11px 38px',
                              fontSize: '14px',
                              border: '1px solid #CBD5E1',
                              borderRadius: '10px',
                              outline: 'none',
                              color: '#152238',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      </div>

                      {/* Doctor Name */}
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#152238', marginBottom: '6px' }}>
                          Supervising Doctor / Chief Medical Officer Name <span style={{ color: '#D2252F' }}>*</span>
                        </label>
                        <div style={{ position: 'relative' }}>
                          <Stethoscope size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                          <input
                            type="text"
                            value={regData.doctor_name}
                            onChange={(e) => setRegData({ ...regData, doctor_name: e.target.value })}
                            placeholder="e.g. Dr. P. Sreenivasulu, MD"
                            required
                            style={{
                              width: '100%',
                              padding: '11px 14px 11px 38px',
                              fontSize: '14px',
                              border: '1px solid #CBD5E1',
                              borderRadius: '10px',
                              outline: 'none',
                              color: '#152238',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 3: Location with Automatic Geocoding */}
                  <div
                    style={{
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '14px',
                      padding: '18px 20px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin size={18} color="#124676" />
                        <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#152238', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                          3. Location &amp; Exact Vertipad Coordinates (Auto-Geocoded)
                        </h3>
                      </div>
                      <span style={{ fontSize: '11px', color: '#16A34A', fontWeight: '700', backgroundColor: '#ECFDF5', padding: '2px 8px', borderRadius: '4px' }}>
                        OpenStreetMap GPS Sync
                      </span>
                    </div>

                    {/* Quick Preset Location Pills */}
                    <div style={{ marginBottom: '12px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '700', color: '#64748B', display: 'block', marginBottom: '6px' }}>
                        QUICK SELECT PRAKASAM LOCATIONS:
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {PRESET_LOCATIONS.map((preset) => (
                          <button
                            key={preset.label}
                            type="button"
                            onClick={() => handleSelectPresetLocation(preset)}
                            style={{
                              padding: '5px 10px',
                              fontSize: '11px',
                              fontWeight: '600',
                              backgroundColor: '#FFFFFF',
                              border: '1px solid #CBD5E1',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              color: '#124676',
                              transition: 'all 0.15s'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#EEF5FA';
                              e.currentTarget.style.borderColor = '#124676';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#FFFFFF';
                              e.currentTarget.style.borderColor = '#CBD5E1';
                            }}
                          >
                            + {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Address Input & Auto-Detect Button */}
                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#152238', marginBottom: '6px' }}>
                        Detailed Facility Address <span style={{ color: '#D2252F' }}>*</span>
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                          <Navigation size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                          <input
                            type="text"
                            value={regData.address}
                            onChange={(e) => {
                              setRegData({ ...regData, address: e.target.value });
                            }}
                            onBlur={() => {
                              // Auto trigger geocode if address was typed and lat/lng not yet populated
                              if (regData.address && regData.address.trim().length > 4 && (!regData.latitude || !regData.longitude)) {
                                handleAutoGeocode(regData.address);
                              }
                            }}
                            placeholder="Enter street, locality, or landmark (e.g. RIMS Road, Ongole, Prakasam)"
                            required
                            style={{
                              width: '100%',
                              padding: '11px 14px 11px 38px',
                              fontSize: '14px',
                              border: '1px solid #CBD5E1',
                              borderRadius: '10px',
                              outline: 'none',
                              color: '#152238',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAutoGeocode(regData.address)}
                          disabled={geocoding}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '11px 16px',
                            backgroundColor: '#124676',
                            color: '#FFFFFF',
                            fontSize: '12px',
                            fontWeight: '700',
                            border: 'none',
                            borderRadius: '10px',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {geocoding ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
                          <span>{geocoding ? 'Detecting...' : 'Auto-Detect Lat/Long'}</span>
                        </button>
                      </div>

                      {/* Dropdown Suggestions if multiple matches found */}
                      {geocodeSuggestions.length > 1 && (
                        <div
                          style={{
                            marginTop: '8px',
                            backgroundColor: '#FFFFFF',
                            border: '1px solid #CBD5E1',
                            borderRadius: '8px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            overflow: 'hidden'
                          }}
                        >
                          <div style={{ padding: '6px 12px', backgroundColor: '#F1F5F9', fontSize: '11px', fontWeight: '700', color: '#64748B' }}>
                            SELECT MATCHING ADDRESS:
                          </div>
                          {geocodeSuggestions.slice(0, 4).map((sug, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSelectGeocodeSuggestion(sug)}
                              style={{
                                width: '100%',
                                textAlign: 'left',
                                padding: '8px 12px',
                                border: 'none',
                                borderBottom: idx < 3 ? '1px solid #F1F5F9' : 'none',
                                backgroundColor: '#FFFFFF',
                                cursor: 'pointer',
                                fontSize: '12px',
                                color: '#152238'
                              }}
                              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#EEF5FA')}
                              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#FFFFFF')}
                            >
                              <strong>{sug.displayName.slice(0, 65)}...</strong>
                              <span style={{ display: 'block', fontSize: '10px', color: '#16A34A' }}>
                                Lat: {sug.lat.toFixed(6)}, Lon: {sug.lon.toFixed(6)}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Auto-filled Exact Latitude & Longitude */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '14px' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label style={{ fontSize: '13px', fontWeight: '700', color: '#152238' }}>
                            Exact Latitude <span style={{ color: '#D2252F' }}>*</span>
                          </label>
                          {regData.latitude && (
                            <span style={{ fontSize: '10px', fontWeight: '700', color: '#16A34A', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <Check size={11} /> Auto-Filled
                            </span>
                          )}
                        </div>
                        <input
                          type="number"
                          step="any"
                          value={regData.latitude}
                          onChange={(e) => setRegData({ ...regData, latitude: e.target.value })}
                          placeholder="e.g. 15.505700"
                          required
                          style={{
                            width: '100%',
                            padding: '11px 14px',
                            fontSize: '14px',
                            border: '1px solid #CBD5E1',
                            borderRadius: '10px',
                            outline: 'none',
                            color: '#152238',
                            boxSizing: 'border-box',
                            fontFamily: 'monospace',
                            backgroundColor: regData.latitude ? '#F0FDF4' : '#FFFFFF'
                          }}
                        />
                      </div>

                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <label style={{ fontSize: '13px', fontWeight: '700', color: '#152238' }}>
                            Exact Longitude <span style={{ color: '#D2252F' }}>*</span>
                          </label>
                          {regData.longitude && (
                            <span style={{ fontSize: '10px', fontWeight: '700', color: '#16A34A', display: 'flex', alignItems: 'center', gap: '3px' }}>
                              <Check size={11} /> Auto-Filled
                            </span>
                          )}
                        </div>
                        <input
                          type="number"
                          step="any"
                          value={regData.longitude}
                          onChange={(e) => setRegData({ ...regData, longitude: e.target.value })}
                          placeholder="e.g. 80.049900"
                          required
                          style={{
                            width: '100%',
                            padding: '11px 14px',
                            fontSize: '14px',
                            border: '1px solid #CBD5E1',
                            borderRadius: '10px',
                            outline: 'none',
                            color: '#152238',
                            boxSizing: 'border-box',
                            fontFamily: 'monospace',
                            backgroundColor: regData.longitude ? '#F0FDF4' : '#FFFFFF'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* SECTION 4: Contact & Access Credentials */}
                  <div
                    style={{
                      backgroundColor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      borderRadius: '14px',
                      padding: '18px 20px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                      <Mail size={18} color="#124676" />
                      <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#152238', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        4. Institutional Contact &amp; Security Passkey
                      </h3>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                      {/* Gmail / Institutional Email */}
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#152238', marginBottom: '6px' }}>
                          Gmail / Institutional Email Address <span style={{ color: '#D2252F' }}>*</span>
                        </label>
                        <div style={{ position: 'relative' }}>
                          <Mail size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                          <input
                            type="email"
                            value={regData.contact_email}
                            onChange={(e) => setRegData({ ...regData, contact_email: e.target.value })}
                            placeholder="e.g. yourhospital@gmail.com"
                            required
                            style={{
                              width: '100%',
                              padding: '11px 14px 11px 38px',
                              fontSize: '14px',
                              border: '1px solid #CBD5E1',
                              borderRadius: '10px',
                              outline: 'none',
                              color: '#152238',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '11px', color: '#64748B', marginTop: '3px', display: 'block' }}>
                          Registration review email will be dispatched to this address.
                        </span>
                      </div>

                      {/* Mobile Number */}
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#152238', marginBottom: '6px' }}>
                          Authorized Mobile Phone Number <span style={{ color: '#D2252F' }}>*</span>
                        </label>
                        <div style={{ position: 'relative' }}>
                          <Phone size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                          <input
                            type="tel"
                            value={regData.contact_phone}
                            onChange={(e) => setRegData({ ...regData, contact_phone: e.target.value })}
                            placeholder="e.g. 9848012345"
                            required
                            style={{
                              width: '100%',
                              padding: '11px 14px 11px 38px',
                              fontSize: '14px',
                              border: '1px solid #CBD5E1',
                              borderRadius: '10px',
                              outline: 'none',
                              color: '#152238',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                        <span style={{ fontSize: '11px', color: '#64748B', marginTop: '3px', display: 'block' }}>
                          For single-use delivery passkeys &amp; emergency drone alerts.
                        </span>
                      </div>
                    </div>

                    {/* Password & Confirm Password */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#152238', marginBottom: '6px' }}>
                          Create Password <span style={{ color: '#D2252F' }}>*</span>
                        </label>
                        <div style={{ position: 'relative' }}>
                          <Lock size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                          <input
                            type={showRegPassword ? 'text' : 'password'}
                            value={regData.password}
                            onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                            placeholder="Minimum 6 characters"
                            required
                            style={{
                              width: '100%',
                              padding: '11px 38px 11px 38px',
                              fontSize: '14px',
                              border: '1px solid #CBD5E1',
                              borderRadius: '10px',
                              outline: 'none',
                              color: '#152238',
                              boxSizing: 'border-box'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            style={{
                              position: 'absolute',
                              right: '12px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              border: 'none',
                              background: 'transparent',
                              cursor: 'pointer',
                              color: '#94A3B8'
                            }}
                          >
                            {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#152238', marginBottom: '6px' }}>
                          Confirm Password <span style={{ color: '#D2252F' }}>*</span>
                        </label>
                        <div style={{ position: 'relative' }}>
                          <Lock size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                          <input
                            type={showRegPassword ? 'text' : 'password'}
                            value={regData.confirm_password}
                            onChange={(e) => setRegData({ ...regData, confirm_password: e.target.value })}
                            placeholder="Re-enter password"
                            required
                            style={{
                              width: '100%',
                              padding: '11px 14px 11px 38px',
                              fontSize: '14px',
                              border: '1px solid #CBD5E1',
                              borderRadius: '10px',
                              outline: 'none',
                              color: '#152238',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submission Reassurance Notice */}
                  <div
                    style={{
                      backgroundColor: '#EEF5FA',
                      border: '1px solid #B8D3E9',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      fontSize: '12px',
                      color: '#124676',
                      lineHeight: 1.5,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    <Info size={18} style={{ flexShrink: 0 }} />
                    <span>
                      Upon submission, your application will be reviewed by the LifeDrone Operations Committee. An automated confirmation email stating <strong>"Your application is under review. It will be approved soon. Thank you!"</strong> will be dispatched to your registered address.
                    </span>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={regLoading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      backgroundColor: isHospital ? '#124676' : '#D2252F',
                      color: '#FFFFFF',
                      border: 'none',
                      width: '100%',
                      padding: '14px',
                      fontSize: '15px',
                      fontWeight: '800',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    {regLoading ? (
                      <span>Transmitting Facility Application...</span>
                    ) : (
                      <>
                        <span>Submit {isHospital ? 'Hospital' : 'Blood Bank'} Application for Review</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>

                {/* Return to Sign In */}
                <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#64748B' }}>
                  <span>Already have an authorized account? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('SIGN_IN');
                      setRegError(null);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: isHospital ? '#124676' : '#D2252F',
                      fontWeight: '800',
                      cursor: 'pointer',
                      padding: 0,
                      textDecoration: 'underline'
                    }}
                  >
                    Sign In to Portal &rarr;
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
