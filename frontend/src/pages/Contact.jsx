import React, { useState } from 'react';
import { publicAPI } from '../services/api';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Clock,
  ShieldCheck
} from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    organizationName: '',
    organizationType: 'Hospital',
    subject: '',
    message: '',
    consent: true
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.fullName || !formData.email || !formData.organizationName || !formData.subject || !formData.message) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    if (!formData.consent) {
      setErrorMsg('Please acknowledge the data consent terms to submit.');
      return;
    }

    setLoading(true);

    try {
      const res = await publicAPI.submitContact(formData);
      if (res.data?.success) {
        setSuccess(true);
        setFormData({
          fullName: '',
          email: '',
          organizationName: '',
          organizationType: 'Hospital',
          subject: '',
          message: '',
          consent: true
        });
      } else {
        setErrorMsg(res.data?.message || 'Failed to submit inquiry.');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Network error occurred while submitting inquiry.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#FFFFFF', paddingBottom: '90px' }}>
      
      {/* Header */}
      <div style={{ backgroundColor: '#F5F8FC', borderBottom: '1px solid #E2E8F0', padding: '60px 0' }}>
        <div className="container-custom" style={{ textAlign: 'center', maxWidth: '780px' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#1769FF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Collaboration &amp; Pilot Participation
          </span>
          <h1 style={{ fontSize: '42px', fontWeight: '800', color: '#152238', margin: '12px 0 16px 0', letterSpacing: '-1px' }}>
            Let's Make Critical Deliveries Faster
          </h1>
          <p style={{ fontSize: '17px', color: '#64748B', lineHeight: '1.6' }}>
            LifeDrone is exploring smarter ways to coordinate blood availability, secure medical logistics,
            and drone-assisted delivery between hospitals and blood banks.
          </p>
        </div>
      </div>

      <div className="container-custom" style={{ marginTop: '60px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '48px'
          }}
        >
          {/* Left: Contact Info & Scope */}
          <div>
            <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#152238', marginBottom: '16px' }}>
              Connect with LifeDrone Team
            </h2>
            <p style={{ fontSize: '15px', color: '#64748B', lineHeight: '1.7', marginBottom: '32px' }}>
              Contact us to discuss the pilot project, hospital participation, blood bank coordination,
              vertipad installation assessments, or technical collaboration.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: '#EEF4FF',
                    color: '#1769FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <MapPin size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '15px', color: '#152238' }}>Regional Operations Hub</div>
                  <div style={{ fontSize: '14px', color: '#64748B', marginTop: '2px' }}>
                    Collectorate Road, Near RIMS Vertipad, Ongole, Prakasam District, Andhra Pradesh 523001
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: '#E6F7F7',
                    color: '#00A6A6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Mail size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '15px', color: '#152238' }}>Direct Email</div>
                  <div style={{ fontSize: '14px', color: '#64748B', marginTop: '2px' }}>
                    emergency@lifedrone.io / coordination@lifedrone.io
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    backgroundColor: '#ECFDF5',
                    color: '#16A34A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Clock size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: '700', fontSize: '15px', color: '#152238' }}>Pilot Flight Watch</div>
                  <div style={{ fontSize: '14px', color: '#64748B', marginTop: '2px' }}>
                    Flight Corridors Active 07:00 - 21:00 IST (Emergency Simulation Standby)
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '20px',
                fontSize: '13px',
                color: '#64748B',
                lineHeight: '1.6'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#152238', fontWeight: '700', marginBottom: '6px' }}>
                <ShieldCheck size={16} color="#16A34A" />
                <span>Privacy &amp; Medical Non-Disclosure</span>
              </div>
              LifeDrone does not collect patient health identifiers or clinical records via public inquiry forms. All submissions are processed strictly for institutional verification and technical onboarding.
            </div>
          </div>

          {/* Right: Contact Form */}
          <div
            className="card-light"
            style={{
              padding: '36px',
              border: '1px solid #E2E8F0',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            {success ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: '#ECFDF5',
                    color: '#16A34A',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px'
                  }}
                >
                  <CheckCircle2 size={36} />
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#152238', marginBottom: '12px' }}>
                  Inquiry Dispatched!
                </h3>
                <p style={{ fontSize: '15px', color: '#64748B', lineHeight: '1.6', marginBottom: '24px' }}>
                  Thank you for reaching out. Your inquiry has been persisted to the LifeDrone network database, and an automated acknowledgement email has been sent. Our team will get in touch shortly.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="btn-outline"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#152238', marginBottom: '4px' }}>
                  Initiate Partnership or Inquiry
                </h3>

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
                      gap: '8px'
                    }}
                  >
                    <AlertCircle size={16} style={{ flexShrink: 0 }} />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#152238', marginBottom: '6px' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Dr. K. Venkat Rao"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#152238', marginBottom: '6px' }}>
                      Official Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@hospital.org"
                      required
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        outline: 'none'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#152238', marginBottom: '6px' }}>
                      Organization Type *
                    </label>
                    <select
                      name="organizationType"
                      value={formData.organizationType}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1px solid #CBD5E1',
                        backgroundColor: '#FFFFFF',
                        outline: 'none'
                      }}
                    >
                      <option value="Hospital">Hospital</option>
                      <option value="Blood Bank">Blood Bank</option>
                      <option value="Healthcare Organization">Healthcare Organization</option>
                      <option value="Technology Partner">Technology Partner</option>
                      <option value="Individual">Individual</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#152238', marginBottom: '6px' }}>
                    Organization Name *
                  </label>
                  <input
                    type="text"
                    name="organizationName"
                    value={formData.organizationName}
                    onChange={handleChange}
                    placeholder="e.g. Area Hospital Markapur"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#152238', marginBottom: '6px' }}>
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="e.g. Joining Prakasam Drone Blood Delivery Pilot"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#152238', marginBottom: '6px' }}>
                    Message *
                  </label>
                  <textarea
                    name="message"
                    rows="4"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Describe your facility requirements, vertipad coordinates, or questions..."
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="consent"
                    name="consent"
                    checked={formData.consent}
                    onChange={handleChange}
                    style={{ marginTop: '3px' }}
                  />
                  <label htmlFor="consent" style={{ fontSize: '12px', color: '#64748B', lineHeight: '1.4' }}>
                    I consent to LifeDrone storing my contact details in the project database for pilot coordination and receiving status emails.
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{ width: '100%', padding: '12px', fontSize: '15px' }}
                >
                  {loading ? (
                    <span>Submitting Inquiry...</span>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Submit Inquiry</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
