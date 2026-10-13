import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { hospitalAPI } from '../services/api';
import TrackingMap from '../components/tracking/TrackingMap';
import {
  Plane,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Clock,
  Compass,
  Battery,
  ShieldCheck,
  MapPin
} from 'lucide-react';

export default function DeliveryTracking() {
  const { id } = useParams();
  const [delivery, setDelivery] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  // Passkey verification
  const [passkeyCode, setPasskeyCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

  const fetchTracking = async () => {
    try {
      const res = await hospitalAPI.getDeliveryTracking(id);
      if (res.data?.success) {
        setDelivery(res.data.delivery);
        setEvents(res.data.events || []);
      } else {
        setErrorMsg(res.data?.message || 'Could not load tracking data.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error fetching delivery telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking();
    const interval = setInterval(() => {
      fetchTracking();
    }, 3500);
    return () => clearInterval(interval);
  }, [id]);

  const handleVerifyPasskey = async (e) => {
    e.preventDefault();
    setVerifying(true);
    setVerifyResult(null);

    try {
      const res = await hospitalAPI.verifyPasskey(id, passkeyCode);
      if (res.data?.success) {
        setVerifyResult({ success: true, message: res.data.message });
        fetchTracking();
      }
    } catch (err) {
      setVerifyResult({
        success: false,
        message: err.response?.data?.message || 'Passkey verification failed.'
      });
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', color: '#64748B' }}>
        Loading flight telemetry and route coordinates...
      </div>
    );
  }

  if (errorMsg || !delivery) {
    return (
      <div className="container-custom" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <AlertCircle size={48} color="#DC2626" style={{ margin: '0 auto 16px auto' }} />
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#152238' }}>Delivery Telemetry Notice</h2>
        <p style={{ color: '#64748B', margin: '8px 0 24px 0' }}>{errorMsg || 'Delivery not found.'}</p>
        <Link to="/hospital/dashboard" className="btn-primary">
          <ArrowLeft size={16} />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '90vh', padding: '30px 0 80px 0' }}>
      <div className="container-custom">
        
        {/* Back navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <Link
            to="/hospital/dashboard"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#124676', fontWeight: '600' }}
          >
            <ArrowLeft size={16} />
            <span>Hospital Dashboard</span>
          </Link>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="pulse-indicator pulse-blue" />
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#0D375E' }}>
              SIMULATED DRONE TRACKING &bull; LIVE PING EVERY 3.5s
            </span>
          </div>
        </div>

        {/* Flight Header Bar */}
        <div className="card-light" style={{ padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className="badge badge-intransit">{delivery.delivery_status}</span>
                <span style={{ fontSize: '12px', color: '#64748B' }}>Ref: {delivery.delivery_reference}</span>
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#152238', margin: 0 }}>
                {delivery.drone_identifier} &bull; Autonomous Medical Delivery
              </h1>
              <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
                Destination: <strong>{delivery.hospital_name} Vertipad</strong>
              </div>
            </div>

            {/* Quick Metrics */}
            <div style={{ display: 'flex', gap: '20px', textAlign: 'center' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>ETA</div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#124676' }}>{delivery.eta_minutes ?? 0}m</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Remaining</div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#152238' }}>{delivery.distance_km ?? 0} km</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase' }}>Battery</div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#16A34A' }}>{delivery.battery_pct || 94}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Map Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px', marginBottom: '32px' }}>
          <div>
            <TrackingMap delivery={delivery} height="560px" zoom={14} />
          </div>

          {/* Sidebar: Passkey verification & Event Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Passkey Card */}
            <div className="card-light" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#16A34A', marginBottom: '10px' }}>
                <KeyRound size={20} />
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#152238' }}>
                  Receiver Passkey Handover
                </h3>
              </div>

              {delivery.delivery_status === 'DELIVERED' ? (
                <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#ECFDF5', borderRadius: '10px', border: '1px solid #A7F3D0' }}>
                  <CheckCircle2 size={32} color="#16A34A" style={{ margin: '0 auto 8px auto' }} />
                  <div style={{ fontWeight: '800', color: '#15803D', fontSize: '16px' }}>Delivery Completed!</div>
                  <div style={{ fontSize: '12px', color: '#047857', marginTop: '4px' }}>
                    Single-use passkey verified &bull; Payload transferred to hospital staff.
                  </div>
                </div>
              ) : (
                <div>
                  <p style={{ fontSize: '12px', color: '#64748B', marginBottom: '14px', lineHeight: '1.5' }}>
                    Upon touchdown, enter the 6-digit code sent exclusively to the designated receiver to unlock the cold transport container.
                  </p>

                  <form onSubmit={handleVerifyPasskey} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <input
                      type="text"
                      maxLength="6"
                      pattern="\d{6}"
                      required
                      value={passkeyCode}
                      onChange={(e) => setPasskeyCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="6-Digit Passkey"
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '2px solid #CBD5E1',
                        fontSize: '24px',
                        textAlign: 'center',
                        fontFamily: 'monospace',
                        letterSpacing: '8px',
                        fontWeight: '800'
                      }}
                    />

                    {verifyResult && (
                      <div
                        style={{
                          fontSize: '12px',
                          padding: '10px',
                          borderRadius: '6px',
                          backgroundColor: verifyResult.success ? '#ECFDF5' : '#FEF2F2',
                          color: verifyResult.success ? '#15803D' : '#DC2626'
                        }}
                      >
                        {verifyResult.message}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={verifying}
                      className="btn-secondary"
                      style={{ width: '100%', padding: '10px', fontSize: '14px', justifyContent: 'center' }}
                    >
                      {verifying ? 'Verifying Code...' : 'Verify Passkey & Accept Payload'}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Flight Telemetry Logs Card */}
            <div className="card-light" style={{ padding: '24px', flex: 1 }}>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#152238', marginBottom: '14px' }}>
                Corridor Event Logs
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto' }}>
                {events.length === 0 ? (
                  <div style={{ fontSize: '12px', color: '#64748B' }}>No events recorded yet.</div>
                ) : (
                  events.map((ev, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '8px',
                        backgroundColor: '#F8FAFC',
                        fontSize: '12px',
                        border: '1px solid #E2E8F0'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', color: '#152238', marginBottom: '2px' }}>
                        <span>{ev.event_type}</span>
                        <span style={{ fontSize: '11px', color: '#94A3B8' }}>{new Date(ev.recorded_at).toLocaleTimeString()}</span>
                      </div>
                      <div style={{ color: '#64748B' }}>{ev.remarks}</div>
                      <div style={{ color: '#124676', fontSize: '11px', marginTop: '4px' }}>
                        Lat: {ev.latitude}, Lng: {ev.longitude} &bull; Alt: {ev.altitude_meters}m
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
