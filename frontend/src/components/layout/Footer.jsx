import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Heart, 
  Clock, 
  Wind, 
  Compass, 
  Activity, 
  CheckCircle2, 
  Radio, 
  Send,
  Droplet
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [currentTime, setCurrentTime] = useState('');
  const [subscribedEmail, setSubscribedEmail] = useState('');
  const [subscribedState, setSubscribedState] = useState(false);
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('O-');

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) + ' IST');
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const bloodCompatibilities = {
    'O-': { canGive: 'Everyone (Universal RBC Donor)', canReceive: 'O- only', urgency: 'Highest Emergency Reserve' },
    'O+': { canGive: 'O+, A+, B+, AB+', canReceive: 'O+, O-', urgency: 'High Trauma Demand' },
    'A+': { canGive: 'A+, AB+', canReceive: 'A+, A-, O+, O-', urgency: 'Standard Clinical Stock' },
    'A-': { canGive: 'A+, A-, AB+, AB-', canReceive: 'A-, O-', urgency: 'High Reserve Value' },
    'B+': { canGive: 'B+, AB+', canReceive: 'B+, B-, O+, O-', urgency: 'High Regional Demand' },
    'B-': { canGive: 'B+, B-, AB+, AB-', canReceive: 'B-, O-', urgency: 'Critical Reserve' },
    'AB+': { canGive: 'AB+ only', canReceive: 'Everyone (Universal RBC Recipient)', urgency: 'Plasma Donor Priority' },
    'AB-': { canGive: 'AB+, AB-', canReceive: 'AB-, A-, B-, O-', urgency: 'Universal Plasma Donor' }
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!subscribedEmail.trim()) return;
    setSubscribedState(true);
    setTimeout(() => {
      setSubscribedEmail('');
    }, 3000);
  };

  return (
    <footer
      style={{
        backgroundColor: '#F8FAFC',
        borderTop: '1px solid #E2E8F0',
        padding: '60px 0 28px 0',
        marginTop: 'auto',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Top Dynamic Telemetry & Status Ribbon */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          marginTop: '-60px',
          marginBottom: '50px',
          padding: '12px 0'
        }}
      >
        <div className="container-custom" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          {/* Live Flight Readiness Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span className="pulse-indicator pulse-green" />
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#152238', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Radio size={14} color="#16A34A" />
              <span>Corridor Telemetry: <strong>All Corridors Active</strong></span>
            </span>
            <span style={{ color: '#CBD5E1' }}>&bull;</span>
            <span style={{ fontSize: '12px', color: '#64748B' }}>
              A* Pathfinding Engine Online
            </span>
          </div>

          {/* Dynamic Weather & Time Widget */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '18px', fontSize: '12px', color: '#475569' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Wind size={14} color="#1769FF" />
              <span>Prakasam Wind: <strong>11 km/h ESE</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Compass size={14} color="#00A6A6" />
              <span>Flight Condition: <strong style={{ color: '#16A34A' }}>VFR Clear</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#F1F5F9', padding: '3px 8px', borderRadius: '6px', fontWeight: '700', color: '#1E293B' }}>
              <Clock size={13} color="#64748B" />
              <span>{currentTime || '14:30:00 IST'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom">
        {/* Main 4-Column Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '36px',
            marginBottom: '48px'
          }}
        >
          {/* Column 1: Brand & Dynamic Mission */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #1769FF 0%, #0052cc 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 12px rgba(23, 105, 255, 0.25)'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
                  <circle cx="12" cy="12" r="3" fill="#00A6A6" />
                </svg>
              </div>
              <span style={{ fontSize: '20px', fontWeight: '800', color: '#152238' }}>
                Life<span style={{ color: '#1769FF' }}>Drone</span>
              </span>
            </div>

            <p style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.6', marginBottom: '16px' }}>
              Autonomous emergency blood logistics network connecting regional hospitals and blood banks. 
              Intelligent A* routing, cold-chain accountability (+2°C to +6°C), and single-use passkey verification.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#1769FF', fontWeight: '700' }}>
              <Heart size={14} color="#DC2626" fill="#DC2626" />
              <span>Every Second Matters. Every Drop Counts.</span>
            </div>

            {/* Dynamic Newsletter & Alert Subscription */}
            <div style={{ marginTop: '20px' }}>
              <span style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#475569', marginBottom: '6px' }}>
                Corridor Status &amp; Dispatch Bulletins
              </span>
              {subscribedState ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#16A34A', fontWeight: '600' }}>
                  <CheckCircle2 size={15} />
                  <span>Subscribed to LifeDrone Operations Feed</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '6px' }}>
                  <input
                    type="email"
                    required
                    value={subscribedEmail}
                    onChange={(e) => setSubscribedEmail(e.target.value)}
                    placeholder="Enter hospital/official email"
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '12px',
                      backgroundColor: '#FFFFFF',
                      outline: 'none'
                    }}
                  />
                  <button
                    type="submit"
                    className="btn-primary"
                    style={{ padding: '8px 14px', fontSize: '12px', borderRadius: '8px' }}
                    title="Subscribe"
                  >
                    <Send size={13} />
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#152238', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Navigation Links
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '14px', color: '#64748B' }}>
              <li>
                <Link to="/how-it-works" style={{ transition: 'all 0.2s ease', display: 'inline-flex', alignItems: 'center', gap: '6px' }} onMouseEnter={(e) => e.currentTarget.style.color = '#1769FF'} onMouseLeave={(e) => e.currentTarget.style.color = '#64748B'}>
                  <span>How It Works</span>
                </Link>
              </li>
              <li>
                <Link to="/blood-access" style={{ transition: 'all 0.2s ease', display: 'inline-flex', alignItems: 'center', gap: '6px' }} onMouseEnter={(e) => e.currentTarget.style.color = '#1769FF'} onMouseLeave={(e) => e.currentTarget.style.color = '#64748B'}>
                  <span>Raise Blood &amp; Donate Blood</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" style={{ transition: 'all 0.2s ease', display: 'inline-flex', alignItems: 'center', gap: '6px' }} onMouseEnter={(e) => e.currentTarget.style.color = '#1769FF'} onMouseLeave={(e) => e.currentTarget.style.color = '#64748B'}>
                  <span>Contact Us</span>
                </Link>
              </li>
              <li>
                <Link to="/hospital/login" style={{ transition: 'all 0.2s ease', display: 'inline-flex', alignItems: 'center', gap: '6px' }} onMouseEnter={(e) => e.currentTarget.style.color = '#1769FF'} onMouseLeave={(e) => e.currentTarget.style.color = '#64748B'}>
                  <span>Hospital Access Portal</span>
                </Link>
              </li>
              <li>
                <Link to="/blood-bank/login" style={{ transition: 'all 0.2s ease', display: 'inline-flex', alignItems: 'center', gap: '6px' }} onMouseEnter={(e) => e.currentTarget.style.color = '#1769FF'} onMouseLeave={(e) => e.currentTarget.style.color = '#64748B'}>
                  <span>Blood Bank Operations Portal</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Regional Flight Corridors (Removed "Pilot" word as requested) */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#152238', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Airspace Corridors
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', color: '#64748B' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <MapPin size={16} color="#1769FF" style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>
                  <strong>Prakasam Corridor Network</strong>: Ongole &bull; Chirala &bull; Markapur &bull; Kandukur (Andhra Pradesh, India)
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={16} color="#1769FF" style={{ flexShrink: 0 }} />
                <a href="mailto:emergency@lifedrone.io" style={{ color: '#1E40AF', fontWeight: '600' }}>
                  emergency@lifedrone.io
                </a>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={16} color="#16A34A" style={{ flexShrink: 0 }} />
                <a href="tel:+918592280100" style={{ color: '#065F46', fontWeight: '700' }}>
                  +91-8592-280100 (24/7 Ops Desk)
                </a>
              </div>

              {/* Verified Vertipad Nodes Tag */}
              <div style={{ marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {['VERT-RIMS-01', 'VERT-REDCROSS-01', 'AP-PK-TRUNK'].map((v) => (
                  <span
                    key={v}
                    style={{
                      fontSize: '10px',
                      fontWeight: '700',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #CBD5E1',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      color: '#475569'
                    }}
                  >
                    {v}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Column 4: Dynamic Interactive Blood Compatibility Guide */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: '800', color: '#152238', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Droplet size={15} color="#DC2626" />
              <span>Compatibility Reference</span>
            </h4>
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                padding: '14px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
              }}
            >
              {/* Interactive Blood Group Selector */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '10px' }}>
                {Object.keys(bloodCompatibilities).map((group) => (
                  <button
                    key={group}
                    onClick={() => setSelectedBloodGroup(group)}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '700',
                      backgroundColor: selectedBloodGroup === group ? '#1769FF' : '#F1F5F9',
                      color: selectedBloodGroup === group ? '#FFFFFF' : '#334155',
                      border: '1px solid',
                      borderColor: selectedBloodGroup === group ? '#1769FF' : '#E2E8F0',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {group}
                  </button>
                ))}
              </div>

              {/* Dynamic Compatibility Box */}
              <div style={{ fontSize: '12px', color: '#152238' }}>
                <div style={{ fontWeight: '700', color: '#1769FF', marginBottom: '4px' }}>
                  {selectedBloodGroup} Profile:
                </div>
                <div style={{ color: '#475569', marginBottom: '2px' }}>
                  <strong>Can Give To:</strong> {bloodCompatibilities[selectedBloodGroup].canGive}
                </div>
                <div style={{ color: '#475569', marginBottom: '4px' }}>
                  <strong>Can Receive:</strong> {bloodCompatibilities[selectedBloodGroup].canReceive}
                </div>
                <span style={{ fontSize: '10px', fontWeight: '700', color: '#00A6A6', backgroundColor: '#E6F7F7', padding: '1px 6px', borderRadius: '4px' }}>
                  {bloodCompatibilities[selectedBloodGroup].urgency}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: '1px solid #E2E8F0',
            paddingTop: '20px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '14px',
            fontSize: '13px',
            color: '#64748B'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>&copy; {currentYear} LifeDrone Emergency Medical Aerial Logistics. All rights reserved.</span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '12px' }}>
            <span style={{ cursor: 'pointer' }} onClick={() => alert('LifeDrone Privacy Notice: Data stored is encrypted and isolated to participating institutions in compliance with healthcare data practices.')}>
              Privacy Notice
            </span>
            <span>&bull;</span>
            <span style={{ cursor: 'pointer' }} onClick={() => alert('LifeDrone Terms: Academic software prototype designed for drone emergency logistics research.')}>
              Terms of Service
            </span>
            <span>&bull;</span>
            <span style={{ color: '#16A34A', fontWeight: '600' }}>Light Theme Edition</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
