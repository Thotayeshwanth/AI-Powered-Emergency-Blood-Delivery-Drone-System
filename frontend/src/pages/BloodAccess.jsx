import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicAPI } from '../services/api';
import { 
  Building2, 
  ShieldCheck, 
  Heart, 
  ArrowRight, 
  Phone, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Info,
  Clock
} from 'lucide-react';

export default function BloodAccess() {
  const [bloodBanks, setBloodBanks] = useState([]);

  useEffect(() => {
    publicAPI.getInstitutions()
      .then((res) => {
        if (res.data?.success && res.data.bloodBanks) {
          setBloodBanks(res.data.bloodBanks);
        }
      })
      .catch((e) => console.log('Blood banks load notice:', e.message));
  }, []);

  return (
    <div style={{ backgroundColor: '#FFFFFF', paddingBottom: '90px' }}>
      
      {/* Page Header */}
      <div style={{ backgroundColor: '#F5F8FC', borderBottom: '1px solid #E2E8F0', padding: '60px 0' }}>
        <div className="container-custom" style={{ textAlign: 'center', maxWidth: '780px' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#124676', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Emergency Network Access
          </span>
          <h1 style={{ fontSize: '42px', fontWeight: '800', color: '#152238', margin: '12px 0 16px 0', letterSpacing: '-1px' }}>
            Blood Access &amp; Delivery Network
          </h1>
          <p style={{ fontSize: '17px', color: '#64748B', lineHeight: '1.6' }}>
            Connecting participating hospitals and blood banks across Prakasam district.
          </p>
        </div>
      </div>

      <div className="container-custom" style={{ marginTop: '60px' }}>
        
        {/* TWO PROMINENT ACCESS CARDS */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '32px',
            marginBottom: '80px'
          }}
        >
          {/* CARD 1: HOSPITAL ACCESS */}
          <div
            className="card-light card-hover"
            style={{
              padding: '40px',
              borderTop: '5px solid #124676',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '16px',
                  backgroundColor: '#EEF5FA',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#124676',
                  marginBottom: '24px'
                }}
              >
                <Building2 size={32} />
              </div>

              <span className="badge badge-dispatched" style={{ marginBottom: '12px' }}>
                Hospital Access
              </span>

              <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#152238', marginBottom: '16px' }}>
                Hospital Portal
              </h2>

              <p style={{ fontSize: '15px', color: '#64748B', lineHeight: '1.7', marginBottom: '24px' }}>
                Search blood availability, request blood products, and coordinate approved deliveries.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
                {[
                  'Real-time blood stock search by group & component',
                  'Instant digital emergency blood requisitioning',
                  'Simulated aerial drone route tracking & ETA',
                  'Single-use passkey entry for vertipad package handover'
                ].map((feat, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#152238' }}>
                    <CheckCircle2 size={16} color="#16A34A" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              to="/hospital/login"
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '15px', justifyContent: 'center' }}
            >
              <span>Access Hospital Portal</span>
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* CARD 2: BLOOD BANK ACCESS */}
          <div
            className="card-light card-hover"
            style={{
              padding: '40px',
              borderTop: '5px solid #D2252F',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '16px',
                  backgroundColor: '#FEF2F2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#D2252F',
                  marginBottom: '24px'
                }}
              >
                <ShieldCheck size={32} />
              </div>

              <span className="badge badge-ready" style={{ marginBottom: '12px' }}>
                Blood Bank Access
              </span>

              <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#152238', marginBottom: '16px' }}>
                Blood Bank Portal
              </h2>

              <p style={{ fontSize: '15px', color: '#64748B', lineHeight: '1.7', marginBottom: '24px' }}>
                Manage blood inventory, review requests, prepare packages, and coordinate approved deliveries.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
                {[
                  'Blood component inventory tracking & cold chain logs',
                  'Transactional stock reservation on request acceptance',
                  'Medical packaging & tamper-seal verification checklist',
                  'A* drone flight dispatch & crypto passkey generation'
                ].map((feat, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#152238' }}>
                    <CheckCircle2 size={16} color="#D2252F" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              to="/blood-bank/login"
              className="btn-secondary"
              style={{ width: '100%', padding: '14px', fontSize: '15px', justifyContent: 'center' }}
            >
              <span>Access Blood Bank Portal</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        {/* ====================================================
            BLOOD DONATION INFORMATION SECTION
            ==================================================== */}
        <section
          style={{
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '20px',
            padding: '48px 36px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#DC2626', marginBottom: '12px' }}>
            <Heart size={24} fill="#DC2626" />
            <span style={{ fontSize: '14px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Voluntary Donor Information
            </span>
          </div>

          <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#152238', marginBottom: '16px' }}>
            Donate Blood. Save Lives.
          </h2>

          <p style={{ fontSize: '16px', color: '#64748B', lineHeight: '1.7', maxWidth: '820px', marginBottom: '32px' }}>
            Blood cannot be manufactured — it can only come as a generous gift from voluntary donors.
            Every donation has the potential to save up to three lives in emergency surgeries, trauma resuscitation,
            and maternal care across Prakasam district.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '24px',
              marginBottom: '36px'
            }}
          >
            <div className="card-light" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#124676', fontWeight: '700' }}>
                <CheckCircle2 size={18} />
                <span>Eligibility Criteria</span>
              </div>
              <ul style={{ paddingLeft: '18px', fontSize: '13px', color: '#64748B', lineHeight: '1.6' }}>
                <li>Age between 18 and 65 years</li>
                <li>Weight minimum 45 kg</li>
                <li>Hemoglobin level 12.5 g/dL or above</li>
                <li>Normal blood pressure and pulse rate</li>
                <li>No active antibiotic medication or infections</li>
              </ul>
            </div>

            <div className="card-light" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#D2252F', fontWeight: '700' }}>
                <Clock size={18} />
                <span>Donation Procedure</span>
              </div>
              <ul style={{ paddingLeft: '18px', fontSize: '13px', color: '#64748B', lineHeight: '1.6' }}>
                <li>Pre-donation medical screening &amp; mini-physical</li>
                <li>Quick, sterile 10-minute phlebotomy collection</li>
                <li>Post-donation refreshments &amp; 15-minute rest</li>
                <li>Full plasma volume restored in 24-48 hours</li>
                <li>Eligible to donate again every 3 months</li>
              </ul>
            </div>

            <div className="card-light" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#16A34A', fontWeight: '700' }}>
                <Calendar size={18} />
                <span>Donation Drives &amp; Camps</span>
              </div>
              <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.6' }}>
                Colleges, industrial units, and community associations can coordinate voluntary blood donation camps with local certified blood banks. Mobile collection vans will visit your location with certified medical teams.
              </p>
            </div>
          </div>

          {/* Participating Blood Banks Contact Directory */}
          <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#152238', marginBottom: '18px' }}>
            Participating Blood Banks in Prakasam District
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px'
            }}
          >
            {(bloodBanks.length > 0 ? bloodBanks : [
              { name: 'Indian Red Cross Society Blood Centre', address: 'Red Cross Bhavan, Lawyerpet, Ongole', phone: '+91-8592-233445' },
              { name: 'RIMS Model Blood Bank', address: 'RIMS Campus, Clinical Diagnostic Block, Ongole', phone: '+91-8592-280145' },
              { name: 'Rotary Club Central Blood Bank Chirala', address: 'Rotary Complex, Gandhi Road, Chirala', phone: '+91-8594-233990' },
              { name: 'Markapur Regional Blood Storage & Centre', address: 'Hospital Road, NGO Colony, Markapur', phone: '+91-8596-225588' }
            ]).map((bb, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  padding: '16px'
                }}
              >
                <div style={{ fontWeight: '700', fontSize: '14px', color: '#152238', marginBottom: '4px' }}>
                  {bb.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B', marginBottom: '6px' }}>
                  <MapPin size={14} color="#124676" />
                  <span>{bb.address}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#16A34A', fontWeight: '600' }}>
                  <Phone size={14} />
                  <span>{bb.contact_phone || bb.phone}</span>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: '28px',
              backgroundColor: '#EFF6FF',
              border: '1px solid #B8D3E9',
              borderRadius: '8px',
              padding: '12px 16px',
              fontSize: '12px',
              color: '#0D375E',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Info size={16} style={{ flexShrink: 0 }} />
            <span>
              <strong>Regulatory Integrity:</strong> The LifeDrone MVP coordinates hospital-to-blood-bank supply chain requests. Public individual donor records are not automatically stored as inventory until inspected and logged by licensed blood center phlebotomists.
            </span>
          </div>
        </section>

      </div>
    </div>
  );
}
