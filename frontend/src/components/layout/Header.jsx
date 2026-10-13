import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Menu, 
  X, 
  Activity, 
  LogOut, 
  ChevronRight, 
  Sparkles,
  Building2,
  ShieldCheck,
  PlusCircle,
  User
} from 'lucide-react';
import HelpSupportModal from '../common/HelpSupportModal';
import { useScrollEffects } from '../../hooks/useScrollEffects';

export default function Header() {
  const { isCompact, isScrolled, scrollProgress, scrollDirection } = useScrollEffects();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isHospital = user?.institutionType === 'HOSPITAL';
  const dashboardPath = isHospital ? '/hospital/dashboard' : '/blood-bank/dashboard';

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: isScrolled 
            ? (scrollDirection === 'up' ? 'rgba(255, 255, 255, 0.88)' : 'rgba(255, 255, 255, 0.82)') 
            : 'rgba(255, 255, 255, 0.72)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: isScrolled
            ? (scrollDirection === 'up' ? '1px solid rgba(184, 211, 233, 0.7)' : '1px solid rgba(226, 232, 240, 0.7)')
            : '1px solid rgba(226, 232, 240, 0.5)',
          boxShadow: !isScrolled
            ? 'none'
            : scrollDirection === 'up'
              ? '0 10px 25px -5px rgba(18, 70, 118, 0.10), 0 3px 8px -2px rgba(18, 70, 118, 0.04)'
              : '0 4px 14px -4px rgba(18, 70, 118, 0.06)',
          transition: 'all 0.28s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Responsive Hairline Scroll Progress Bar (Top of Header) */}
        <div 
          className="scroll-progress-line" 
          style={{ width: `${scrollProgress}%` }} 
          aria-hidden="true"
        />

        <div 
          className="container-custom" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            height: isCompact ? '64px' : '76px',
            transition: 'height 0.28s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {/* Left: LifeDrone Official Logo */}
          <Link to={isAuthenticated ? dashboardPath : '/'} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <img
              src="/images/lifedrone-logo.png"
              alt="LifeDrone - One Step to Get Faster Blood Delivery"
              style={{
                height: isCompact ? '40px' : '46px',
                width: 'auto',
                maxWidth: '240px',
                objectFit: 'contain',
                display: 'block',
                transition: 'height 0.28s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            />
          </Link>

          {/* Right Navigation */}
          <nav style={{ display: 'none', gap: '10px', alignItems: 'center' }} className="desktop-nav">
            {!isAuthenticated ? (
              /* Public Navigation (Visible ONLY when not logged in) */
              <>
                <Link
                  to="/how-it-works"
                  style={{
                    padding: '9px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: isActive('/how-it-works') ? '#124676' : '#334155',
                    backgroundColor: isActive('/how-it-works') ? '#EEF5FA' : 'transparent',
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
                    color: isActive('/blood-access') ? '#124676' : '#334155',
                    backgroundColor: isActive('/blood-access') ? '#EEF5FA' : 'transparent',
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
                    color: isActive('/contact') ? '#124676' : '#334155',
                    backgroundColor: isActive('/contact') ? '#EEF5FA' : 'transparent',
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

                {/* Help AI Button */}
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
                    color: '#124676',
                    backgroundColor: '#EEF5FA',
                    border: '1px solid #B8D3E9',
                    boxShadow: '0 2px 8px rgba(18, 70, 118, 0.1)',
                    transition: 'all 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#D3E4F3';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(18, 70, 118, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#EEF5FA';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(18, 70, 118, 0.1)';
                  }}
                >
                  <Sparkles size={15} color="#124676" />
                  <span>Help</span>
                  <span 
                    style={{ 
                      fontSize: '10px', 
                      backgroundColor: '#124676', 
                      color: '#FFFFFF', 
                      padding: '1px 6px', 
                      borderRadius: '999px',
                      fontWeight: '700'
                    }}
                  >
                    AI
                  </span>
                </button>
              </>
            ) : (
              /* Authenticated Navigation Suite (Visible ONLY when logged in) */
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                {/* User & Institution Tag */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    padding: '6px 14px',
                    borderRadius: '10px'
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: isHospital ? '#EEF5FA' : '#FEF2F2',
                      color: isHospital ? '#124676' : '#D2252F',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {isHospital ? <Building2 size={16} /> : <ShieldCheck size={16} />}
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#152238', lineHeight: 1.2 }}>
                      {user?.fullName || 'Authenticated User'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '500' }}>
                      {user?.role}
                    </div>
                  </div>
                </div>

                {/* Direct Action: Request Blood (for Hospital) or Inventory (for Blood Bank) */}
                {isHospital && (
                  <Link
                    to="/request-blood"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      backgroundColor: '#EEF5FA',
                      color: '#124676',
                      border: '1px solid #B8D3E9',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <PlusCircle size={15} />
                    <span>New Request</span>
                  </Link>
                )}

                {/* Dashboard Button */}
                <Link
                  to={dashboardPath}
                  className="btn-primary"
                  style={{
                    padding: '9px 18px',
                    fontSize: '13px',
                    borderRadius: '8px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Activity size={16} />
                  <span>Dashboard</span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#DC2626',
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FECACA',
                    transition: 'all 0.15s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#FEE2E2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#FEF2F2';
                  }}
                  title="Sign Out of Portal"
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </nav>

          {/* Mobile Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="mobile-actions">
            {!isAuthenticated && (
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
                  color: '#124676',
                  backgroundColor: '#EEF5FA',
                  border: '1px solid #B8D3E9'
                }}
                className="mobile-help-btn"
              >
                <Sparkles size={14} />
                <span>Help</span>
              </button>
            )}

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
            {!isAuthenticated ? (
              /* Public Mobile Menu */
              <>
                <Link
                  to="/how-it-works"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#152238',
                    backgroundColor: isActive('/how-it-works') ? '#EEF5FA' : '#F8FAFC',
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
                    backgroundColor: isActive('/blood-access') ? '#EEF5FA' : '#F8FAFC',
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
                    backgroundColor: isActive('/contact') ? '#EEF5FA' : '#F8FAFC',
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
                    color: '#124676',
                    backgroundColor: '#EEF5FA',
                    border: '1px solid #B8D3E9',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={16} color="#124676" />
                    <span>Help: LifeDrone Chatbot &amp; Support</span>
                  </div>
                  <ChevronRight size={18} color="#124676" />
                </button>
              </>
            ) : (
              /* Authenticated Mobile Menu */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div
                  style={{
                    padding: '12px 16px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  <User size={18} color="#124676" />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#152238' }}>
                      {user?.fullName}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B' }}>
                      {user?.role} &bull; {user?.institutionType}
                    </div>
                  </div>
                </div>

                <Link
                  to={dashboardPath}
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  Go to {isHospital ? 'Hospital' : 'Blood Bank'} Dashboard
                </Link>

                {isHospital && (
                  <Link
                    to="/request-blood"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn-outline"
                    style={{ width: '100%', justifyContent: 'center', gap: '6px' }}
                  >
                    <PlusCircle size={16} />
                    <span>Create New Blood Request</span>
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    color: '#DC2626',
                    backgroundColor: '#FEF2F2',
                    border: '1px solid #FECACA',
                    fontWeight: '700',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
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
