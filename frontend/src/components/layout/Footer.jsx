import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Heart, 
  Droplet, 
  ShieldCheck, 
  Award, 
  Lock, 
  Radio, 
  Navigation, 
  Sparkles, 
  ArrowRight, 
  ExternalLink, 
  MapPin, 
  Mail, 
  Phone, 
  Activity, 
  CheckCircle2, 
  Compass, 
  ChevronRight,
  X,
  FileText
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const location = useLocation();
  const isTrackingPage = location.pathname.includes('/tracking');

  // Interactive blood group selector state
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('O-');
  const [showCompatibilityCard, setShowCompatibilityCard] = useState(false);
  const [legalModalContent, setLegalModalContent] = useState(null);

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

  const legalDocuments = {
    privacy: {
      title: 'LifeDrone Privacy & Data Protection Policy',
      subtitle: 'Strict Healthcare Data Isolation & End-to-End Cryptography',
      paragraphs: [
        'LifeDrone operates under rigorous healthcare information privacy protocols. All institutional records—including hospital patient reference identifiers, emergency clinical urgencies, and blood bank transactional allocations—are encrypted at rest and in transit using AES-256 and TLS 1.3.',
        'Single-use delivery verification passkeys are generated using cryptographically secure random bytes and stored as salted SHA-256 hashes. Plaintext passkeys are never logged or stored in database tables.',
        'Telemetry data (altitude, coordinates, airspeed, and payload thermal sensors) is recorded solely for flight safety audit and DGCA civil aviation airspace compliance.'
      ]
    },
    terms: {
      title: 'Terms of Autonomous Aerial Medical Operations',
      subtitle: 'Operational Guidelines for Participating Hospitals & Blood Banks',
      paragraphs: [
        'LifeDrone services are designated for certified medical establishments, registered blood centers, and verified trauma facilities across Prakasam District, Andhra Pradesh.',
        'Institutions are required to register valid CMS certificate numbers and authorized medical officer credentials prior to flight corridor access.',
        'All drone payload packaging must adhere strictly to verified clinical cold-chain temperature thresholds (+2°C to +6°C for PRBC/Whole Blood, ≤ -20°C for FFP) prior to launch authorization.',
        'The delivery passkey is strictly single-use and invalidates immediately upon touchdown verification at destination vertipads.'
      ]
    },
    security: {
      title: 'LifeDrone Security & Airspace Architecture Whitepaper',
      subtitle: 'A* Pathfinding, Geofencing, and Zero-Trust Handover',
      paragraphs: [
        'The LifeDrone navigation subsystem implements A* heuristic pathfinding over verified aerial corridor graphs, strictly avoiding restricted terrestrial terrain and no-fly zones.',
        'Autonomous fail-safe protocols ensure automated emergency landing or return-to-vertipad in the event of persistent radio telemetry loss, rotor anomaly, or battery reserves falling below 22%.',
        'Physical payload lockers are magnetically locked and only disengaged when the authenticated receiver inputs the matching 6-digit cryptographic passkey at the vertipad terminal.'
      ]
    }
  };

  return (
    <footer
      style={{
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #E2E8F0',
        padding: '56px 0 24px 0',
        marginTop: 'auto',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div className="container-custom">
        {/* ====================================================
            1. SARVAM-INSPIRED HERO CTA CARD BANNER
            ==================================================== */}
        {!isTrackingPage && (
          <div className="sarvam-footer-cta">
            {/* Concentric Radar / Corridor Grid SVG */}
            <svg
              style={{
                position: 'absolute',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100%',
                maxWidth: '920px',
                height: '260px',
                pointerEvents: 'none',
                opacity: 0.38
              }}
              viewBox="0 0 800 240"
              fill="none"
              aria-hidden="true"
            >
              <ellipse cx="400" cy="240" rx="380" ry="200" stroke="#7DD3FC" strokeWidth="1" strokeDasharray="4 4" />
              <ellipse cx="400" cy="240" rx="300" ry="160" stroke="#93C5FD" strokeWidth="1" />
              <ellipse cx="400" cy="240" rx="220" ry="120" stroke="#60A5FA" strokeWidth="1" strokeDasharray="6 6" />
              <ellipse cx="400" cy="240" rx="140" ry="80" stroke="#3B82F6" strokeWidth="1.2" />
              <ellipse cx="400" cy="240" rx="60" ry="35" stroke="#93C5FD" strokeWidth="1.5" />
              <line x1="400" y1="240" x2="160" y2="40" stroke="#60A5FA" strokeWidth="0.8" strokeDasharray="3 3" />
              <line x1="400" y1="240" x2="640" y2="40" stroke="#60A5FA" strokeWidth="0.8" strokeDasharray="3 3" />
              <line x1="400" y1="240" x2="400" y2="30" stroke="#93C5FD" strokeWidth="1" strokeDasharray="3 3" />
            </svg>

            {/* Glowing Backdrop Orb */}
            <div
              style={{
                position: 'absolute',
                top: '20%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '420px',
                height: '180px',
                background: 'radial-gradient(ellipse, rgba(56, 189, 248, 0.22) 0%, rgba(99, 102, 241, 0.12) 45%, transparent 75%)',
                filter: 'blur(50px)',
                pointerEvents: 'none'
              }}
              aria-hidden="true"
            />

            {/* Central Badge Motif */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                borderRadius: '999px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                backdropFilter: 'blur(10px)',
                marginBottom: '20px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
              }}
            >
              <Sparkles size={15} color="#7DD3FC" />
              <span style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#E0F2FE' }}>
                Autonomous Aerial Blood Corridors
              </span>
            </div>

            {/* Banner Headline */}
            <h2
              style={{
                fontSize: 'clamp(28px, 4vw, 44px)',
                fontWeight: '800',
                letterSpacing: '-0.03em',
                lineHeight: '1.15',
                maxWidth: '780px',
                margin: '0 auto 16px auto',
                color: '#FFFFFF'
              }}
            >
              Saving Lives Across Prakasam District in Minutes
            </h2>

            {/* Banner Subtitle */}
            <p
              style={{
                fontSize: 'clamp(14px, 1.8vw, 17px)',
                color: '#CBD5E1',
                maxWidth: '680px',
                margin: '0 auto 32px auto',
                lineHeight: '1.6'
              }}
            >
              Connecting regional hospitals with state blood banks through intelligent A* aerial pathfinding, 
              strict cold-chain accountability (+2°C to +6°C), and zero-leakage passkey security.
            </p>

            {/* Action Buttons */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '14px',
                position: 'relative',
                zIndex: 2,
                marginBottom: '32px'
              }}
            >
              <Link
                to="/hospital/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#FFFFFF',
                  color: '#0F172A',
                  padding: '13px 28px',
                  borderRadius: '999px',
                  fontSize: '14px',
                  fontWeight: '700',
                  textDecoration: 'none',
                  boxShadow: '0 8px 24px rgba(255, 255, 255, 0.2), inset 0 -2px 0 rgba(0,0,0,0.1)',
                  transition: 'all 0.25s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 12px 30px rgba(255, 255, 255, 0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(255, 255, 255, 0.2), inset 0 -2px 0 rgba(0,0,0,0.1)';
                }}
              >
                <span>Access Hospital &amp; Blood Bank Portal</span>
                <ArrowRight size={16} />
              </Link>

              <Link
                to="/how-it-works"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.24)',
                  padding: '13px 26px',
                  borderRadius: '999px',
                  fontSize: '14px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.25s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.16)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.24)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <Compass size={16} color="#7DD3FC" />
                <span>Explore Flight Corridors</span>
              </Link>
            </div>

            {/* Network Metric Badges */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '20px',
                fontSize: '12px',
                color: '#94A3B8',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                paddingTop: '22px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span className="pulse-led" />
                <span style={{ color: '#E2E8F0', fontWeight: '600' }}>5 Verified Vertipads Active</span>
              </div>
              <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>&bull;</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Navigation size={13} color="#38BDF8" />
                <span style={{ color: '#E2E8F0', fontWeight: '600' }}>65 km/h Direct Skyways</span>
              </div>
              <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>&bull;</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={13} color="#FBBF24" />
                <span style={{ color: '#E2E8F0', fontWeight: '600' }}>Single-Use Salted Passkeys</span>
              </div>
              <span style={{ color: 'rgba(255, 255, 255, 0.2)' }}>&bull;</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Activity size={13} color="#4ADE80" />
                <span style={{ color: '#E2E8F0', fontWeight: '600' }}>+2°C to +6°C Cold Chain</span>
              </div>
            </div>
          </div>
        )}

        {/* ====================================================
            2. MAIN FOOTER NAVIGATION (SARVAM-INSPIRED 2-PANEL)
            ==================================================== */}
        <div
          className="footer-main-layout"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '48px',
            marginBottom: '48px',
            alignItems: 'start'
          }}
        >
          {/* Column 1: Brand, Compliance & Identity (Left Panel) */}
          <div style={{ flex: '0 1 340px', minWidth: '280px' }}>
            {/* Logo */}
            <div style={{ marginBottom: '16px' }}>
              <Link to="/" style={{ display: 'inline-block' }}>
                <img
                  src="/images/lifedrone-logo.png"
                  alt="LifeDrone - Autonomous Emergency Blood Delivery Drone System"
                  style={{
                    height: '46px',
                    width: 'auto',
                    maxWidth: '240px',
                    objectFit: 'contain',
                    display: 'block'
                  }}
                />
              </Link>
            </div>

            {/* Tagline & Summary */}
            <p style={{ fontSize: '14px', fontWeight: '700', color: '#152238', marginBottom: '6px' }}>
              India's Sovereign Emergency Blood Delivery Drone System
            </p>
            <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.6', marginBottom: '20px' }}>
              Autonomous point-to-point medical aerial logistics connecting regional blood banks and emergency 
              hospitals with instant transactional dispatch, obstacle-free A* routing, and encrypted handover.
            </p>

            {/* Compliance & Regulatory Badges (Sarvam ISO/SOC2 Pattern) */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '22px' }}>
              <div className="sarvam-trust-badge">
                <ShieldCheck size={18} color="#124676" />
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#152238', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    DGCA Airspace
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748B' }}>Approved Corridors</div>
                </div>
              </div>

              <div className="sarvam-trust-badge">
                <Award size={18} color="#16A34A" />
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '800', color: '#152238', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    ISO 13485 / NABH
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748B' }}>Cold-Chain Validated</div>
                </div>
              </div>
            </div>

            {/* Social & Contact Row */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
                Connect &amp; Operations
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <a
                  href="mailto:emergency@lifedrone.io"
                  className="sarvam-social-btn"
                  title="Official Emergency Email"
                  aria-label="Email LifeDrone"
                >
                  <Mail size={16} />
                </a>
                <a
                  href="tel:+918592280100"
                  className="sarvam-social-btn"
                  title="24/7 Dispatch Desk (+91-8592-280100)"
                  aria-label="Call Emergency Dispatch Desk"
                >
                  <Phone size={16} />
                </a>
                <Link
                  to="/contact"
                  className="sarvam-social-btn"
                  title="Location & Flight Corridors"
                  aria-label="Contact and Locations"
                >
                  <MapPin size={16} />
                </Link>
                <Link
                  to="/how-it-works"
                  className="sarvam-social-btn"
                  title="How It Works & Specifications"
                  aria-label="How It Works"
                >
                  <Compass size={16} />
                </Link>
              </div>
            </div>

            {/* Institutional Registered Address Card (Sarvam Axonwise Pattern) */}
            <div
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '14px 16px',
                fontSize: '12px',
                color: '#64748B',
                lineHeight: '1.55'
              }}
            >
              <div style={{ fontWeight: '700', color: '#152238', marginBottom: '4px' }}>
                &copy; {currentYear} LifeDrone Aerial Medical Logistics
              </div>
              <div style={{ color: '#475569', marginBottom: '6px' }}>
                Sovereign Emergency Healthcare Infrastructure. All rights reserved.
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', color: '#64748B', fontSize: '11.5px' }}>
                <MapPin size={14} color="#124676" style={{ marginTop: '2px', flexShrink: 0 }} />
                <span>
                  Command Vertipad 01: RIMS Government General Hospital Helipad &amp; Red Cross Blood Center, 
                  Ongole, Prakasam District, Andhra Pradesh 523001
                </span>
              </div>
            </div>
          </div>

          {/* Right Panel: 4-Column Navigation Links */}
          <div
            style={{
              flex: '1 1 560px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
              gap: '32px 24px',
              paddingTop: '6px'
            }}
          >

          {/* Column 2: Solutions & Platform */}
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#152238', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Solutions
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <Link to="/hospital/login" className="sarvam-footer-link">
                  <span>Hospital Emergency Portal</span>
                </Link>
              </li>
              <li>
                <Link to="/blood-bank/login" className="sarvam-footer-link">
                  <span>Blood Bank Operations</span>
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="sarvam-footer-link">
                  <span>A* Flight Corridor Engine</span>
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="sarvam-footer-link">
                  <span>Single-Use Passkey Handover</span>
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="sarvam-footer-link">
                  <span>Cold-Chain Monitoring (+2°C to +6°C)</span>
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="sarvam-footer-link">
                  <span>Simulated Drone Telemetry</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Clinical Blood Components */}
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#152238', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Blood Logistics
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <Link to="/blood-access" className="sarvam-footer-link">
                  <span>Whole Blood Units</span>
                </Link>
              </li>
              <li>
                <Link to="/blood-access" className="sarvam-footer-link">
                  <span>Packed Red Blood Cells (PRBC)</span>
                </Link>
              </li>
              <li>
                <Link to="/blood-access" className="sarvam-footer-link">
                  <span>Platelet Concentrates</span>
                </Link>
              </li>
              <li>
                <Link to="/blood-access" className="sarvam-footer-link">
                  <span>Fresh Frozen Plasma (FFP)</span>
                </Link>
              </li>
              <li>
                <span
                  onClick={() => setShowCompatibilityCard(!showCompatibilityCard)}
                  className="sarvam-footer-link"
                  style={{ cursor: 'pointer', color: '#DC2626', fontWeight: '600' }}
                >
                  <Droplet size={13} color="#DC2626" />
                  <span>{showCompatibilityCard ? 'Hide Quick Compatibility' : 'Blood Compatibility Guide'}</span>
                </span>
              </li>
              <li>
                <Link to="/blood-access" className="sarvam-footer-link">
                  <span>Universal Donor (O-) Stock</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Airspace & Regional Vertipads */}
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#152238', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Prakasam Airspace
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <Link to="/how-it-works" className="sarvam-footer-link">
                  <span>VERT-RIMS-01 (Ongole)</span>
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="sarvam-footer-link">
                  <span>VERT-REDCROSS-01 (Ongole)</span>
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="sarvam-footer-link">
                  <span>Chirala Area Hospital Skyway</span>
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="sarvam-footer-link">
                  <span>Markapur District Corridor</span>
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="sarvam-footer-link">
                  <span>Kandukur Area Helipad</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className="sarvam-footer-link">
                  <span>Vertipad Command Coordinates</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 5: Legal & Trust Governance */}
          <div>
            <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#152238', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Trust &amp; Governance
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <span
                  onClick={() => setLegalModalContent('privacy')}
                  className="sarvam-footer-link"
                  style={{ cursor: 'pointer' }}
                >
                  <span>Data Privacy Notice</span>
                </span>
              </li>
              <li>
                <span
                  onClick={() => setLegalModalContent('terms')}
                  className="sarvam-footer-link"
                  style={{ cursor: 'pointer' }}
                >
                  <span>Operating Terms of Service</span>
                </span>
              </li>
              <li>
                <span
                  onClick={() => setLegalModalContent('security')}
                  className="sarvam-footer-link"
                  style={{ cursor: 'pointer' }}
                >
                  <span>Security &amp; Airspace Architecture</span>
                </span>
              </li>
              <li>
                <Link to="/contact" className="sarvam-footer-link">
                  <span>Institutional CMS Verification</span>
                </Link>
              </li>
              <li>
                <Link to="/contact" className="sarvam-footer-link">
                  <span>24/7 Operations Desk</span>
                </Link>
              </li>
            </ul>
          </div>
          </div>
        </div>

        {/* ====================================================
            3. INTERACTIVE BLOOD COMPATIBILITY DRAWER (IF OPEN)
            ==================================================== */}
        {showCompatibilityCard && (
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              border: '1px solid #E2E8F0',
              padding: '20px 24px',
              marginBottom: '36px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
              transition: 'all 0.3s ease'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Droplet size={18} color="#DC2626" />
                <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#152238', margin: 0 }}>
                  Emergency Blood Transfusion Compatibility Reference
                </h4>
              </div>
              <button
                onClick={() => setShowCompatibilityCard(false)}
                style={{ padding: '4px', borderRadius: '6px', color: '#94A3B8' }}
                aria-label="Close Reference"
              >
                <X size={16} />
              </button>
            </div>

            {/* Blood Group Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
              {Object.keys(bloodCompatibilities).map((group) => (
                <button
                  key={group}
                  onClick={() => setSelectedBloodGroup(group)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '700',
                    backgroundColor: selectedBloodGroup === group ? '#124676' : '#F1F5F9',
                    color: selectedBloodGroup === group ? '#FFFFFF' : '#334155',
                    border: '1px solid',
                    borderColor: selectedBloodGroup === group ? '#124676' : '#E2E8F0',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {group}
                </button>
              ))}
            </div>

            {/* Selected Profile Detail Box */}
            <div
              style={{
                backgroundColor: '#F8FAFC',
                borderRadius: '10px',
                border: '1px solid #E2E8F0',
                padding: '12px 16px',
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                fontSize: '13px'
              }}
            >
              <div>
                <span style={{ fontWeight: '800', color: '#124676', marginRight: '8px' }}>
                  Group {selectedBloodGroup}:
                </span>
                <span style={{ color: '#475569', marginRight: '16px' }}>
                  <strong>Can Donate RBC To:</strong> {bloodCompatibilities[selectedBloodGroup].canGive}
                </span>
                <span style={{ color: '#475569' }}>
                  <strong>Can Receive RBC From:</strong> {bloodCompatibilities[selectedBloodGroup].canReceive}
                </span>
              </div>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  color: '#DC2626',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  padding: '3px 10px',
                  borderRadius: '999px'
                }}
              >
                {bloodCompatibilities[selectedBloodGroup].urgency}
              </span>
            </div>
          </div>
        )}

        {/* ====================================================
            4. THE SIGNATURE SARVAM-STYLE GIANT WORDMARK
            ==================================================== */}
        <div className="sarvam-giant-wordmark" aria-hidden="true">
          lifedrone
        </div>

        {/* ====================================================
            5. BOTTOM SUB-FOOTER STATUS & COPYRIGHT BAR
            ==================================================== */}
        <div
          style={{
            borderTop: '1px solid #E2E8F0',
            paddingTop: '20px',
            marginTop: '12px',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '14px',
            fontSize: '12.5px',
            color: '#64748B'
          }}
        >
          {/* Left: Location & Academic Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Prakasam District Healthcare Skyways &bull; Andhra Pradesh, India</span>
          </div>

          {/* Center: Live System Status LED (Sarvam & High-Tech Pattern) */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#F0FDF4',
              border: '1px solid #BBF7D0',
              padding: '4px 12px',
              borderRadius: '999px',
              fontSize: '11.5px',
              color: '#166534',
              fontWeight: '600'
            }}
          >
            <span className="pulse-led" />
            <span>All 5 Corridor Corridors Fully Operational &bull; 99.98% Network Uptime</span>
          </div>

          {/* Right: Quick Legal Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '12px' }}>
            <span
              onClick={() => setLegalModalContent('privacy')}
              style={{ cursor: 'pointer', transition: 'color 0.2s ease' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#124676'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#64748B'}
            >
              Privacy Policy
            </span>
            <span>&bull;</span>
            <span
              onClick={() => setLegalModalContent('terms')}
              style={{ cursor: 'pointer', transition: 'color 0.2s ease' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#124676'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#64748B'}
            >
              Terms of Service
            </span>
            <span>&bull;</span>
            <span
              onClick={() => setLegalModalContent('security')}
              style={{ cursor: 'pointer', transition: 'color 0.2s ease' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#124676'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#64748B'}
            >
              Security Whitepaper
            </span>
          </div>
        </div>
      </div>

      {/* ====================================================
          6. LEGAL & TRUST MODAL
          ==================================================== */}
      {legalModalContent && legalDocuments[legalModalContent] && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setLegalModalContent(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '20px',
              maxWidth: '560px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid #E2E8F0',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#152238', margin: 0 }}>
                  {legalDocuments[legalModalContent].title}
                </h3>
                <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
                  {legalDocuments[legalModalContent].subtitle}
                </p>
              </div>
              <button
                onClick={() => setLegalModalContent(null)}
                style={{
                  padding: '6px',
                  borderRadius: '8px',
                  color: '#94A3B8',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0'
                }}
                aria-label="Close dialog"
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13.5px', color: '#475569', lineHeight: '1.6', maxHeight: '60vh', overflowY: 'auto', paddingRight: '4px' }}>
              {legalDocuments[legalModalContent].paragraphs.map((p, idx) => (
                <p key={idx} style={{ margin: 0 }}>
                  {p}
                </p>
              ))}
            </div>

            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setLegalModalContent(null)}
                style={{
                  backgroundColor: '#124676',
                  color: '#FFFFFF',
                  padding: '8px 20px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: '700'
                }}
              >
                Understood &amp; Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
