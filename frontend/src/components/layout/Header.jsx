import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Menu, 
  X, 
  Activity, 
  LogOut, 
  ChevronRight,
  LifeBuoy,
  Sparkles
} from 'lucide-react';
import HelpSupportModal from '../common/HelpSupportModal';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.94)' : '#FFFFFF',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid #E2E8F0',
          boxShadow: isScrolled 
            ? '0 10px 30px -10px rgba(21, 34, 56, 0.08), 0 2px 4px -2px rgba(21, 34, 56, 0.04)' 
            : '0 2px 10px -2px rgba(21, 34, 56, 0.03)',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        <div 
          className="container-custom" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            height: '76px' 
          }}
        >
          {/* Left: LifeDrone Brand Identity */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #1769FF 0%, #0052cc 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 16px rgba(23, 105, 255, 0.28)',
                color: '#FFFFFF',
                position: 'relative'
              }}
            >
              {/* Drone / Medical Wing Icon */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v4" />
                <path d="M12 18v4" />
                <path d="M4.93 4.93l2.83 2.83" />
                <path d="M16.24 16.24l2.83 2.83" />
                <path d="M2 12h4" />
                <path d="M18 12h4" />
                <path d="M4.93 19.07l2.83-2.83" />
                <path d="M16.24 7.76l2.83-2.83" />
                <circle cx="12" cy="12" r="3" fill="#00A6A6" />
              </svg>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px', color: '#152238' }}>
                  Life<span style={{ color: '#1769FF' }}>Drone</span>
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: '700',
                    color: '#16A34A',
                    backgroundColor: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    padding: '2px 6px',
                    borderRadius: '999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: '#16A34A' }} />
                  ONLINE
                </span>
              </div>
              <span style={{ display: 'block', fontSize: '10px', fontWeight: '700', letterSpacing: '0.06em', color: '#00A6A6', textTransform: 'uppercase' }}>
                Medical Aerial Logistics
              </span>
            </div>
          </Link>

          {/* Right: PRIMARY NAVIGATION & HELP BUTTON */}
          <nav style={{ display: 'none', gap: '10px', alignItems: 'center' }} className="desktop-nav">
            <Link
              to="/how-it-works"
              style={{
                padding: '9px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: isActive('/how-it-works') ? '#1769FF' : '#334155',
                backgroundColor: isActive('/how-it-works') ? '#EEF4FF' : 'transparent',
                transition: 'all 0.2s ease',
                border: '1px solid transparent'
              }}
              onMouseEnter={(e) => {
                if (!isActive('/how-it-works')) e.currentTarget.style.backgroundColor = '#F8FAFC';
              }}
              onMouseLeave={(e) => {
                if (!isActive('/how-it-works')) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              How It Works
            </Link>

            <Link
              to="/blood-access"
              style={{
                padding: '9px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: isActive('/blood-access') ? '#1769FF' : '#334155',
                backgroundColor: isActive('/blood-access') ? '#EEF4FF' : 'transparent',
                transition: 'all 0.2s ease',
                border: '1px solid transparent'
              }}
              onMouseEnter={(e) => {
                if (!isActive('/blood-access')) e.currentTarget.style.backgroundColor = '#F8FAFC';
              }}
              onMouseLeave={(e) => {
                if (!isActive('/blood-access')) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Raise Blood &amp; Donate Blood
            </Link>

            <Link
              to="/contact"
              style={{
                padding: '9px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: isActive('/contact') ? '#1769FF' : '#334155',
                backgroundColor: isActive('/contact') ? '#EEF4FF' : 'transparent',
                transition: 'all 0.2s ease',
                border: '1px solid transparent'
              }}
              onMouseEnter={(e) => {
                if (!isActive('/contact')) e.currentTarget.style.backgroundColor = '#F8FAFC';
              }}
              onMouseLeave={(e) => {
                if (!isActive('/contact')) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Contact Us
            </Link>

            {/* Help Button triggering LifeDrone AI Chatbot or Human Support */}
            <button
              onClick={() => setHelpModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '7px',
                padding: '8px 16px',
                borderRadius: '999px',
                fontSize: '13px',
                fontWeight: '700',
                color: '#1769FF',
                backgroundColor: '#EEF4FF',
                border: '1px solid #BFDBFE',
                boxShadow: '0 2px 8px rgba(23, 105, 255, 0.1)',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#DBEAFE';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(23, 105, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#EEF4FF';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(23, 105, 255, 0.1)';
              }}
            >
              <Sparkles size={15} color="#1769FF" />
              <span>Help</span>
              <span 
                style={{ 
                  fontSize: '10px', 
                  backgroundColor: '#1769FF', 
                  color: '#FFFFFF', 
                  padding: '1px 6px', 
                  borderRadius: '999px',
                  fontWeight: '700'
                }}
              >
                AI
              </span>
            </button>

            {/* Authenticated Dashboard shortcut if logged in */}
            {isAuthenticated && (
              <>
                <div style={{ width: '1px', height: '22px', backgroundColor: '#E2E8F0', margin: '0 4px' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Link
                    to={user?.institutionType === 'HOSPITAL' ? '/hospital/dashboard' : '/blood-bank/dashboard'}
                    className="btn-primary"
                    style={{ padding: '8px 14px', fontSize: '13px', borderRadius: '8px' }}
                  >
                    <Activity size={15} />
                    <span>Dashboard ({user?.role?.split('_')[0]})</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="btn-ghost"
                    title="Log Out"
                    style={{ padding: '8px 10px', borderRadius: '8px' }}
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              </>
            )}
          </nav>

          {/* Mobile menu toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="mobile-actions">
            <button
              onClick={() => setHelpModalOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '6px 12px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: '700',
                color: '#1769FF',
                backgroundColor: '#EEF4FF',
                border: '1px solid #BFDBFE'
              }}
              className="mobile-help-btn"
            >
              <Sparkles size={14} />
              <span>Help</span>
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              style={{
                display: 'inline-flex',
                padding: '8px',
                borderRadius: '8px',
                color: '#152238',
                border: '1px solid #E2E8F0',
                backgroundColor: '#FFFFFF'
              }}
              className="mobile-toggle"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div
            style={{
              borderTop: '1px solid #E2E8F0',
              backgroundColor: '#FFFFFF',
              padding: '16px 20px 24px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
          >
            <Link
              to="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#152238',
                backgroundColor: isActive('/how-it-works') ? '#EEF4FF' : '#F8FAFC',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>How It Works</span>
              <ChevronRight size={18} color="#64748B" />
            </Link>

            <Link
              to="/blood-access"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#152238',
                backgroundColor: isActive('/blood-access') ? '#EEF4FF' : '#F8FAFC',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>Raise Blood &amp; Donate Blood</span>
              <ChevronRight size={18} color="#64748B" />
            </Link>

            <Link
              to="/contact"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#152238',
                backgroundColor: isActive('/contact') ? '#EEF4FF' : '#F8FAFC',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>Contact Us</span>
              <ChevronRight size={18} color="#64748B" />
            </Link>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setHelpModalOpen(true);
              }}
              style={{
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '700',
                color: '#1769FF',
                backgroundColor: '#EEF4FF',
                border: '1px solid #BFDBFE',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} color="#1769FF" />
                <span>Help: LifeDrone Chatbot &amp; Support</span>
              </div>
              <ChevronRight size={18} color="#1769FF" />
            </button>

            {isAuthenticated && (
              <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link
                  to={user?.institutionType === 'HOSPITAL' ? '/hospital/dashboard' : '/blood-bank/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Go to Dashboard ({user?.role})
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-outline"
                  style={{ width: '100%', justifyContent: 'center', color: '#DC2626', borderColor: '#FECACA' }}
                >
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Responsive CSS */}
        <style>{`
          @media (min-width: 900px) {
            .desktop-nav { display: flex !important; }
            .mobile-actions { display: none !important; }
          }
        `}</style>
      </header>

      {/* LifeDrone AI Chatbot & Human Support Modal */}
      <HelpSupportModal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
      />
    </>
  );
}
