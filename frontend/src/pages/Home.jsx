import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicAPI } from '../services/api';
import TrackingMap from '../components/tracking/TrackingMap';
import {
  Search,
  Route,
  KeyRound,
  MailCheck,
  Building2,
  Navigation,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Plane,
  Clock,
  ChevronRight,
  Layers
} from 'lucide-react';

export default function Home() {
  const [metrics, setMetrics] = useState({
    hospitalsCount: 5,
    bloodBanksCount: 4,
    requestsCount: 3,
    deliveriesCompleted: 1,
    availableUnits: 94
  });

  // Sample demonstration delivery for interactive operations center visual
  const demoDelivery = {
    id: 1,
    drone_identifier: 'LD-HEXA-01 (Apex Lifter)',
    delivery_status: 'IN_TRANSIT',
    eta_minutes: 3,
    distance_km: 1.25,
    current_lat: 15.5075,
    current_lng: 80.0460,
    speed_kmh: 62.5,
    battery_pct: 96,
    waypoints: [
      { code: 'VERT-BB-RC', name: 'Red Cross Ongole Vertiport', lat: 15.5030, lng: 80.0450 },
      { code: 'WP-MED-CORR-1', name: 'Central Medical Skyway Node Alpha', lat: 15.5100, lng: 80.0420 },
      { code: 'VERT-HOSP-RIMS', name: 'RIMS Hospital Helipad/Vertipad', lat: 15.5057, lng: 80.0499 }
    ]
  };

  useEffect(() => {
    publicAPI.getMetrics()
      .then((res) => {
        if (res.data?.success && res.data.metrics) {
          setMetrics(res.data.metrics);
        }
      })
      .catch((e) => console.log('Metrics load notice:', e.message));
  }, []);

  return (
    <div style={{ backgroundColor: '#FFFFFF' }}>
      
      {/* ====================================================
          SECTION 1: HERO SECTION
          ==================================================== */}
      <section
        style={{
          position: 'relative',
          padding: '80px 0 100px 0',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F8FC 100%)',
          overflow: 'hidden'
        }}
      >
        {/* Subtle decorative background circles */}
        <div
          style={{
            position: 'absolute',
            top: '-120px',
            right: '-100px',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(18, 70, 118, 0.08) 0%, rgba(255, 255, 255, 0) 70%)',
            pointerEvents: 'none'
          }}
        />

        <div className="container-custom">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '48px',
              alignItems: 'center'
            }}
          >
            {/* Left Hero Text */}
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: '#EEF5FA',
                  border: '1px solid #B8D3E9',
                  padding: '6px 14px',
                  borderRadius: '9999px',
                  fontSize: '13px',
                  fontWeight: '700',
                  color: '#124676',
                  marginBottom: '20px'
                }}
              >
                <Zap size={14} fill="#124676" />
                <span>AI-Assisted Emergency Medical Drone Logistics</span>
              </div>

              <h1
                style={{
                  fontSize: 'clamp(36px, 5.5vw, 62px)',
                  fontWeight: '800',
                  lineHeight: '1.1',
                  color: '#152238',
                  letterSpacing: '-1.5px',
                  marginBottom: '24px'
                }}
              >
                FROM BLOOD BANK<br />
                TO BEDSIDE<br />
                <span style={{ color: '#D2252F' }}>IN A FLASH</span>
              </h1>

              <p
                style={{
                  fontSize: '18px',
                  lineHeight: '1.6',
                  color: '#64748B',
                  maxWidth: '540px',
                  marginBottom: '36px'
                }}
              >
                LifeDrone connects hospitals and blood banks through intelligent delivery coordination,
                secure package handovers, and drone-assisted medical logistics.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px' }}>
                <Link to="/blood-access" className="btn-primary" style={{ padding: '14px 28px', fontSize: '16px' }}>
                  <span>Request Blood</span>
                  <ArrowRight size={18} />
                </Link>

                <Link to="/how-it-works" className="btn-outline" style={{ padding: '14px 28px', fontSize: '16px' }}>
                  <span>Discover How It Works</span>
                </Link>
              </div>

              {/* Pilot indicator snippet */}
              <div style={{ marginTop: '36px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span className="pulse-indicator pulse-green" style={{ marginRight: '8px' }} />
                  <span style={{ fontSize: '13px', color: '#64748B', fontWeight: '500' }}>
                    Active Pilot in <strong>Prakasam District</strong>, AP &bull; 5 Vertipads Configured
                  </span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual: Drone & Medical Transport Illustration */}
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <div
                className="animate-float"
                style={{
                  width: '100%',
                  maxWidth: '500px',
                  background: '#FFFFFF',
                  borderRadius: '24px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 25px 50px -12px rgba(18, 70, 118, 0.15)',
                  padding: '28px',
                  position: 'relative'
                }}
              >
                {/* Visual Header: Traveling Drone with Blood Packet Animation */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      backgroundColor: '#F1F5F9',
                      padding: '5px 12px',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      overflow: 'hidden',
                      position: 'relative',
                      minWidth: '200px',
                      height: '42px'
                    }}
                  >
                    {/* Dotted Flight Track */}
                    <div
                      style={{
                        position: 'absolute',
                        left: '10px',
                        right: '10px',
                        top: '50%',
                        height: '1px',
                        borderTop: '2px dashed #8EB7DC',
                        zIndex: 1
                      }}
                    />

                    {/* Small Traveling Drone with Blood Packet */}
                    <div
                      className="animate-drone-patrol"
                      style={{
                        position: 'relative',
                        zIndex: 2,
                        display: 'inline-flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}
                    >
                      {/* Mini Drone Body with Spinning Rotors */}
                      <svg width="32" height="18" viewBox="0 0 32 18" fill="none">
                        <ellipse className="rotor-active" cx="6" cy="3" rx="5" ry="1.2" fill="#64748B" />
                        <ellipse className="rotor-active" cx="26" cy="3" rx="5" ry="1.2" fill="#64748B" />
                        <path d="M6 4 L16 8 L26 4" stroke="#152238" strokeWidth="1.8" strokeLinecap="round" />
                        <rect x="11" y="6" width="10" height="5" rx="1.5" fill="#124676" />
                        <circle cx="16" cy="7" r="1.2" fill="#10B981" />
                        <line x1="16" y1="11" x2="16" y2="15" stroke="#94A3B8" strokeWidth="1.2" />
                      </svg>

                      {/* Suspended Red Blood Packet */}
                      <div
                        style={{
                          marginTop: '-3px',
                          width: '11px',
                          height: '13px',
                          backgroundColor: '#DC2626',
                          borderRadius: '2px 2px 3px 3px',
                          border: '1px solid #991B1B',
                          boxShadow: '0 2px 4px rgba(220, 38, 38, 0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Blood Packet in Transit"
                      >
                        <span style={{ color: '#FFFFFF', fontSize: '8px', fontWeight: '900', lineHeight: 1 }}>+</span>
                      </div>
                    </div>

                    <div style={{ marginLeft: 'auto', zIndex: 2, fontSize: '11px', fontWeight: '700', color: '#0D375E', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span className="pulse-indicator pulse-green" style={{ width: '6px', height: '6px' }} />
                      <span>Blood Transit</span>
                    </div>
                  </div>
                  <span className="badge badge-intransit">Cruising 65 km/h</span>
                </div>

                {/* Drone SVG Graphic */}
                <div
                  style={{
                    height: '220px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px dashed #CBD5E1',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Visual aerial flight path line */}
                  <svg
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    viewBox="0 0 400 200"
                    fill="none"
                  >
                    <path
                      d="M 20 160 Q 200 40 380 140"
                      stroke="#8EB7DC"
                      strokeWidth="3"
                      strokeDasharray="6 6"
                    />
                  </svg>

                  {/* Drone SVG */}
                  <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                    <svg width="100" height="70" viewBox="0 0 100 70" fill="none">
                      {/* Propellers */}
                      <ellipse cx="20" cy="18" rx="16" ry="3" fill="#64748B" opacity="0.7" />
                      <ellipse cx="80" cy="18" rx="16" ry="3" fill="#64748B" opacity="0.7" />
                      {/* Drone Body */}
                      <path d="M 20 22 L 50 35 L 80 22" stroke="#152238" strokeWidth="4" strokeLinecap="round" />
                      <rect x="36" y="28" width="28" height="18" rx="4" fill="#124676" />
                      {/* Medical Cold Container */}
                      <rect x="40" y="46" width="20" height="16" rx="3" fill="#DC2626" />
                      {/* Red cross on container */}
                      <path d="M 50 50 v 8 M 46 54 h 8" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>

                    <div style={{ marginTop: '8px', fontSize: '13px', fontWeight: '700', color: '#152238' }}>
                      LD-HEXA-01 Medical Lifter
                    </div>
                    <div style={{ fontSize: '11px', color: '#D2252F', fontWeight: '600' }}>
                      Payload: 2 Units O+ Packed RBC &bull; Cold Box 3.8&deg;C
                    </div>
                  </div>
                </div>

                {/* Telemetry pill */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '12px',
                    marginTop: '20px',
                    backgroundColor: '#F5F8FC',
                    padding: '12px',
                    borderRadius: '12px',
                    textAlign: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>ETA</div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#124676' }}>3.2 min</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>Altitude</div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#152238' }}>75 m</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '600' }}>Passkey</div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: '#16A34A' }}>Secured</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          SECTION 2: PROBLEM AND SOLUTION PREVIEW
          ==================================================== */}
      <section style={{ padding: '90px 0', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
        <div className="container-custom">
          <div style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto 60px auto' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#D2252F', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              The Critical Window
            </span>
            <h2 style={{ fontSize: '38px', fontWeight: '800', color: '#152238', margin: '12px 0 20px 0', letterSpacing: '-0.8px' }}>
              When Every Minute Matters
            </h2>
            <p style={{ fontSize: '16px', color: '#64748B', lineHeight: '1.7', marginBottom: '16px' }}>
              Critical medical deliveries can be delayed by traffic, distance, difficult terrain,
              and coordination gaps. Hospitals need a dependable way to identify blood availability
              and coordinate secure, time-sensitive transportation.
            </p>
            <p style={{ fontSize: '16px', color: '#152238', lineHeight: '1.7', fontWeight: '500' }}>
              LifeDrone provides a digital workflow that connects hospitals with blood banks,
              manages requests, coordinates dispatch, calculates suitable routes, and keeps authorized
              recipients informed about delivery progress.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '28px'
            }}
          >
            {/* Card 1 */}
            <div className="card-light card-hover" style={{ padding: '32px' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  backgroundColor: '#EEF5FA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#124676',
                  marginBottom: '20px'
                }}
              >
                <Zap size={26} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#152238', marginBottom: '12px' }}>
                1. Faster Coordination
              </h3>
              <p style={{ fontSize: '15px', color: '#64748B', lineHeight: '1.6' }}>
                Hospitals search live inventory across participating blood banks by component,
                group, and urgency, replacing chaotic phone calls with instant request pipelines.
              </p>
            </div>

            {/* Card 2 */}
            <div className="card-light card-hover" style={{ padding: '32px' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  backgroundColor: '#FEF2F2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#D2252F',
                  marginBottom: '20px'
                }}
              >
                <Route size={26} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#152238', marginBottom: '12px' }}>
                2. Intelligent Route Planning
              </h3>
              <p style={{ fontSize: '15px', color: '#64748B', lineHeight: '1.6' }}>
                The backend A* pathfinding algorithm calculates optimal corridor waypoints between
                vertipads, minimizing flight duration while maintaining strict airspace adherence.
              </p>
            </div>

            {/* Card 3 */}
            <div className="card-light card-hover" style={{ padding: '32px' }}>
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  backgroundColor: '#ECFDF5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#16A34A',
                  marginBottom: '20px'
                }}
              >
                <KeyRound size={26} />
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#152238', marginBottom: '12px' }}>
                3. Secure Delivery Handover
              </h3>
              <p style={{ fontSize: '15px', color: '#64748B', lineHeight: '1.6' }}>
                Cryptographic single-use passkeys delivered exclusively to authorized hospital receivers
                prevent misdelivery, tampering, and unverified package handoffs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          SECTION 3: HOW LIFEDRONE WORKS (7-STEP TIMELINE)
          ==================================================== */}
      <section style={{ padding: '90px 0', backgroundColor: '#F5F8FC' }}>
        <div className="container-custom">
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 60px auto' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#124676', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              End-to-End Workflow
            </span>
            <h2 style={{ fontSize: '38px', fontWeight: '800', color: '#152238', margin: '12px 0 16px 0', letterSpacing: '-0.8px' }}>
              How LifeDrone Operates
            </h2>
            <p style={{ fontSize: '16px', color: '#64748B' }}>
              From initial blood bank query to vertipad touchdown, every phase is validated,
              logged, and guarded by role-based authorizations.
            </p>
          </div>

          {/* 7-Step Horizontal / Responsive Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {[
              {
                step: '01',
                title: 'Hospital Searches for Blood',
                desc: 'Hospital staff search participating blood banks by blood group, component, quantity, and clinical urgency.',
                icon: Search
              },
              {
                step: '02',
                title: 'Hospital Places a Request',
                desc: 'Hospital enters patient reference details, required-by deadline, and selects an authorized designated receiver.',
                icon: Building2
              },
              {
                step: '03',
                title: 'Blood Bank Reviews the Request',
                desc: 'Blood bank verifies inventory availability, inspects compatibility requirements, and accepts or rejects the order.',
                icon: ShieldCheck
              },
              {
                step: '04',
                title: 'Package Preparation',
                desc: 'Authorized staff complete the medical packaging checklist, ensuring cold chain integrity (+2°C to +6°C) and tamper seals.',
                icon: Layers
              },
              {
                step: '05',
                title: 'Dispatch and Route Planning',
                desc: 'Staff authorize dispatch. The system calculates an A* path over configured airspace corridors and generates a secure passkey.',
                icon: Route
              },
              {
                step: '06',
                title: 'Live Delivery Status',
                desc: 'Designated hospital receiver receives email alerts with real-time tracking links and 5-minute flight telemetry pings.',
                icon: Plane
              },
              {
                step: '07',
                title: 'Secure Package Handover',
                desc: 'Hospital receiver enters single-use passkey at the vertipad to verify receipt and complete custody transfer.',
                icon: KeyRound
              }
            ].map((item, index) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.step}
                  className="card-sharp-hover"
                  style={{
                    padding: '24px 28px',
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr',
                    alignItems: 'center',
                    gap: '24px'
                  }}
                >
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '16px',
                      backgroundColor: '#EEF5FA',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#124676'
                    }}
                  >
                    <IconComp size={24} />
                    <span style={{ fontSize: '11px', fontWeight: '800', marginTop: '2px' }}>{item.step}</span>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '18px', fontWeight: '700', color: '#152238', marginBottom: '6px' }}>
                      Step {index + 1}: {item.title}
                    </h4>
                    <p style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.5' }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              marginTop: '36px',
              textAlign: 'center',
              backgroundColor: '#EFF6FF',
              border: '1px solid #B8D3E9',
              borderRadius: '12px',
              padding: '16px',
              fontSize: '13px',
              color: '#0D375E'
            }}
          >
            <strong>Operational Transparency:</strong> LifeDrone currently runs in <em>Demonstration Simulation Mode</em> over the Prakasam District aerial corridor graph. Simulated drone positions are clearly distinguished from physical GPS avionics telemetry.
          </div>
        </div>
      </section>

      {/* ====================================================
          SECTION 4: OUR SOLUTIONS (6 SOLUTION CARDS)
          ==================================================== */}
      <section style={{ padding: '90px 0', backgroundColor: '#FFFFFF' }}>
        <div className="container-custom">
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 60px auto' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: '#D2252F', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              System Capabilities
            </span>
            <h2 style={{ fontSize: '38px', fontWeight: '800', color: '#152238', margin: '12px 0 16px 0', letterSpacing: '-0.8px' }}>
              Our Core Solutions
            </h2>
            <p style={{ fontSize: '16px', color: '#64748B' }}>
              Comprehensive emergency logistics toolset designed specifically for clinical blood bank and trauma center operations.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '28px'
            }}
          >
            {[
              {
                icon: Search,
                title: '1. Blood Availability Search',
                desc: 'Real-time query of blood bank inventory across Prakasam district by blood group, component, unit count, and cold expiry.'
              },
              {
                icon: Route,
                title: '2. Intelligent Route Planning',
                desc: 'Deterministic A* algorithm calculates optimal airspace corridors between vertipads using Haversine distance heuristics.'
              },
              {
                icon: KeyRound,
                title: '3. Secure Delivery Verification',
                desc: 'Single-use cryptographically salted passkey verification prevents unverified handovers and prevents token replay.'
              },
              {
                icon: MailCheck,
                title: '4. Email Notification System',
                desc: 'SMTP-powered notification service delivering dispatch alerts, 5-minute telemetry progress pings, and delivery receipts.'
              },
              {
                icon: Building2,
                title: '5. Hospital & Blood Bank Coordination',
                desc: 'Unified, authenticated portals separating hospital administrators, field receivers, blood bank authorizers, and inventory managers.'
              },
              {
                icon: Navigation,
                title: '6. Delivery Status Tracking',
                desc: 'Visual OpenStreetMap console displaying flight paths, distance remaining, drone coordinates, battery, and arrival ETA.'
              }
            ].map((sol) => {
              const Icon = sol.icon;
              return (
                <div key={sol.title} className="card-sharp-hover" style={{ padding: '30px' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: '#EEF5FA',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#124676',
                      marginBottom: '18px'
                    }}
                  >
                    <Icon size={24} />
                  </div>
                  <h3 style={{ fontSize: '19px', fontWeight: '700', color: '#152238', marginBottom: '10px' }}>
                    {sol.title}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.6' }}>
                    {sol.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ====================================================
          SECTION 5: INTELLIGENT DELIVERY PLATFORM (OPERATIONS CENTER)
          ==================================================== */}
      <section style={{ padding: '90px 0', backgroundColor: '#F5F8FC' }}>
        <div className="container-custom">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '40px',
              alignItems: 'center'
            }}
          >
            <div>
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#124676', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Operations Center Preview
              </span>
              <h2 style={{ fontSize: '38px', fontWeight: '800', color: '#152238', margin: '12px 0 20px 0', letterSpacing: '-0.8px' }}>
                Intelligence Behind Every Delivery
              </h2>
              <p style={{ fontSize: '16px', color: '#64748B', lineHeight: '1.7', marginBottom: '24px' }}>
                LifeDrone combines inventory information, delivery workflows, route planning,
                and secure verification to coordinate medical deliveries.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
                {[
                  'Origin Vertiport: Red Cross Blood Bank Ongole',
                  'Destination: RIMS Government General Hospital',
                  'Planned A* Corridor: Ongole Medical Trunk Link (1.25 km)',
                  'Estimated Flight Duration: 3.2 minutes @ 65 km/h'
                ].map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', color: '#152238' }}>
                    <CheckCircle2 size={18} color="#16A34A" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <Link to="/blood-access" className="btn-primary">
                <span>Access Live Operations Portal</span>
                <ChevronRight size={18} />
              </Link>
            </div>

            {/* Interactive Operations Console Map */}
            <div>
              <TrackingMap delivery={demoDelivery} height="460px" zoom={14} />
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          SECTION 6: IMPACT METRICS
          ==================================================== */}
      <section style={{ padding: '80px 0', backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
        <div className="container-custom">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#124676', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Network Footprint
            </span>
            <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#152238', marginTop: '8px' }}>
              Prakasam District Pilot Metrics
            </h2>
            <p style={{ fontSize: '14px', color: '#64748B', marginTop: '4px' }}>
              Database-backed live records &bull; Demonstration Pilot Scope
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '28px',
              textAlign: 'center',
              maxWidth: '800px',
              margin: '0 auto'
            }}
          >
            <div className="card-sharp-hover" style={{ padding: '32px' }}>
              <div style={{ fontSize: '46px', fontWeight: '800', color: '#124676', lineHeight: '1' }}>
                {metrics.hospitalsCount}
              </div>
              <div style={{ fontSize: '17px', fontWeight: '700', color: '#152238', marginTop: '12px' }}>
                Participating Hospitals
              </div>
              <div style={{ fontSize: '13px', color: '#64748B', marginTop: '6px' }}>
                Prakasam District Regional Medical Centers
              </div>
            </div>

            <div className="card-sharp-hover" style={{ padding: '32px' }}>
              <div style={{ fontSize: '46px', fontWeight: '800', color: '#D2252F', lineHeight: '1' }}>
                {metrics.bloodBanksCount}
              </div>
              <div style={{ fontSize: '17px', fontWeight: '700', color: '#152238', marginTop: '12px' }}>
                Participating Blood Banks
              </div>
              <div style={{ fontSize: '13px', color: '#64748B', marginTop: '6px' }}>
                Licensed Blood Storage &amp; Vertipad Hubs
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================
          SECTION 7: FINAL CALL TO ACTION
          ==================================================== */}
      <section
        style={{
          padding: '90px 0',
          background: 'linear-gradient(135deg, #124676 0%, #0B2C4D 100%)',
          color: '#FFFFFF',
          textAlign: 'center'
        }}
      >
        <div className="container-custom" style={{ maxWidth: '780px' }}>
          <h2 style={{ fontSize: 'clamp(32px, 4.5vw, 46px)', fontWeight: '800', color: '#FFFFFF', marginBottom: '18px', letterSpacing: '-0.8px' }}>
            Help Build a Faster Medical Delivery Network
          </h2>
          <p style={{ fontSize: '18px', lineHeight: '1.6', opacity: '0.9', marginBottom: '36px' }}>
            Connect your hospital or blood bank with LifeDrone and explore
            a smarter way to coordinate critical blood deliveries.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '16px' }}>
            <Link
              to="/hospital/login"
              style={{
                backgroundColor: '#FFFFFF',
                color: '#124676',
                padding: '14px 28px',
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '15px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.15)'
              }}
            >
              <Building2 size={18} />
              <span>Hospital Access</span>
            </Link>

            <Link
              to="/blood-bank/login"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(8px)',
                padding: '14px 28px',
                borderRadius: '10px',
                fontWeight: '700',
                fontSize: '15px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <ShieldCheck size={18} />
              <span>Blood Bank Access</span>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
