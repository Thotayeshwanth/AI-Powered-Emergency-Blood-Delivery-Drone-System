import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hospitalAPI, publicAPI } from '../services/api';
import {
  Search,
  PlusCircle,
  Building2,
  Calendar,
  Clock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function RequestBlood() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useState({
    bloodGroup: 'O+',
    bloodComponent: 'Packed Red Blood Cells',
    quantity: 2
  });

  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);

  const [formData, setFormData] = useState({
    patientReference: '',
    bloodGroup: 'O+',
    bloodComponent: 'Packed Red Blood Cells',
    quantity: 2,
    urgency: 'CRITICAL_EMERGENCY',
    requiredByTime: '',
    designatedReceiverId: 2,
    remarks: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [successResult, setSuccessResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    // Set default required-by time
    const twoHoursLater = new Date(Date.now() + 2 * 3600 * 1000);
    const isoLocal = new Date(twoHoursLater.getTime() - twoHoursLater.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setFormData((prev) => ({ ...prev, requiredByTime: isoLocal }));

    // Run initial search
    handleSearch();
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setSearching(true);
    setErrorMsg(null);
    try {
      const res = await hospitalAPI.searchInventory(searchParams);
      if (res.data?.success) {
        setSearchResults(res.data.results);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to search blood inventory.');
    } finally {
      setSearching(false);
    }
  };

  const handleSelectBank = (bank) => {
    setSelectedBank(bank);
    setFormData((prev) => ({
      ...prev,
      bloodGroup: bank.blood_group,
      bloodComponent: bank.blood_component,
      quantity: searchParams.quantity
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBank) {
      setErrorMsg('Please select a participating blood bank from the inventory list below.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const payload = {
        ...formData,
        bloodBankId: selectedBank.blood_bank_id,
        quantity: parseInt(formData.quantity, 10),
        designatedReceiverId: parseInt(formData.designatedReceiverId, 10)
      };

      const res = await hospitalAPI.createRequest(payload);
      if (res.data?.success) {
        setSuccessResult(res.data);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit requisition.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '90vh', padding: '40px 0 80px 0' }}>
      <div className="container-custom" style={{ maxWidth: '960px' }}>
        
        {/* Breadcrumb */}
        <div style={{ marginBottom: '24px' }}>
          <Link
            to="/hospital/dashboard"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#1769FF', fontWeight: '600' }}
          >
            <ArrowLeft size={16} />
            <span>Return to Hospital Dashboard</span>
          </Link>
        </div>

        {/* Page Title */}
        <div style={{ marginBottom: '28px' }}>
          <span className="badge badge-dispatched" style={{ marginBottom: '8px' }}>
            Emergency Requisition Gateway
          </span>
          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#152238' }}>
            Request Blood Product via Aerial Drone
          </h1>
          <p style={{ fontSize: '15px', color: '#64748B', marginTop: '4px' }}>
            Target Vertipad: <strong>{user?.institutionName || 'RIMS Govt General Hospital'}</strong> &bull; Prakasam Aerial Network
          </p>
        </div>

        {successResult ? (
          <div className="card-light" style={{ padding: '48px', textAlign: 'center' }}>
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
            <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#152238' }}>
              Requisition Transmitted Successfully!
            </h2>
            <div style={{ margin: '20px auto', maxWidth: '360px', padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: '12px', color: '#64748B' }}>Unique Request Reference Number</div>
              <div style={{ fontSize: '26px', fontWeight: '800', color: '#1769FF', letterSpacing: '1px' }}>
                {successResult.requestNumber}
              </div>
            </div>
            <p style={{ fontSize: '15px', color: '#64748B', maxWidth: '520px', margin: '0 auto 28px auto', lineHeight: '1.6' }}>
              The selected blood bank has been alerted via email. Upon review, stock will be reserved transactionally and prepared for autonomous drone dispatch.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <Link to="/hospital/dashboard" className="btn-primary">
                View in Hospital Dashboard
              </Link>
              <button
                onClick={() => { setSuccessResult(null); setSelectedBank(null); }}
                className="btn-outline"
              >
                Place Another Request
              </button>
            </div>
          </div>
        ) : (
          <div>
            {errorMsg && (
              <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626', padding: '14px', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <AlertCircle size={18} style={{ flexShrink: 0 }} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Step 1: Query Stock */}
            <div className="card-light" style={{ padding: '28px', marginBottom: '28px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#152238', marginBottom: '16px' }}>
                1. Search Blood Bank Stock in Prakasam Network
              </h2>

              <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748B', marginBottom: '4px' }}>
                    Blood Group
                  </label>
                  <select
                    value={searchParams.bloodGroup}
                    onChange={(e) => setSearchParams({ ...searchParams, bloodGroup: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF' }}
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748B', marginBottom: '4px' }}>
                    Blood Component
                  </label>
                  <select
                    value={searchParams.bloodComponent}
                    onChange={(e) => setSearchParams({ ...searchParams, bloodComponent: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF' }}
                  >
                    <option value="Packed Red Blood Cells">Packed Red Blood Cells (PRBC)</option>
                    <option value="Platelets">Platelets</option>
                    <option value="Fresh Frozen Plasma">Fresh Frozen Plasma (FFP)</option>
                    <option value="Whole Blood">Whole Blood</option>
                    <option value="Cryoprecipitate">Cryoprecipitate</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748B', marginBottom: '4px' }}>
                    Units Needed
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={searchParams.quantity}
                    onChange={(e) => setSearchParams({ ...searchParams, quantity: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  />
                </div>

                <div>
                  <button type="submit" disabled={searching} className="btn-primary" style={{ width: '100%', padding: '10px' }}>
                    <Search size={15} />
                    <span>{searching ? 'Querying...' : 'Filter Stock'}</span>
                  </button>
                </div>
              </form>

              {/* Matching Blood Banks list */}
              <div style={{ marginTop: '20px' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Available Supply Sources (Select One)
                </div>

                {searchResults.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                    No matching stock in verified blood banks.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {searchResults.map((bank) => {
                      const isSelected = selectedBank?.inventory_id === bank.inventory_id;
                      return (
                        <div
                          key={bank.inventory_id}
                          onClick={() => handleSelectBank(bank)}
                          style={{
                            padding: '14px',
                            borderRadius: '8px',
                            border: isSelected ? '2px solid #1769FF' : '1px solid #E2E8F0',
                            backgroundColor: isSelected ? '#EEF4FF' : '#FFFFFF',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div>
                            <div style={{ fontWeight: '800', color: '#152238', fontSize: '14px' }}>
                              {bank.blood_bank_name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748B' }}>
                              {bank.address} &bull; Distance: <strong>~{bank.distanceKm} km ({bank.estFlightMinutes} min flight)</strong>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '16px', fontWeight: '800', color: '#16A34A' }}>
                              {bank.available_quantity} {bank.unit}
                            </div>
                            <span style={{ fontSize: '11px', fontWeight: '700', color: isSelected ? '#1769FF' : '#64748B' }}>
                              {isSelected ? '✓ Selected' : 'Click to Select'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Patient & Receiver Form */}
            {selectedBank && (
              <form onSubmit={handleSubmit} className="card-light" style={{ padding: '28px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#152238', marginBottom: '16px' }}>
                  2. Patient Reference &amp; Requisition Details
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#152238', marginBottom: '4px' }}>
                      Patient / Emergency Case Reference ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.patientReference}
                      onChange={(e) => setFormData({ ...formData, patientReference: e.target.value })}
                      placeholder="e.g. PT-RIMS-2041 (Emergency Trauma Bay 3)"
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#152238', marginBottom: '4px' }}>
                        Clinical Urgency Level *
                      </label>
                      <select
                        value={formData.urgency}
                        onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF' }}
                      >
                        <option value="CRITICAL_EMERGENCY">CRITICAL EMERGENCY (Immediate Dispatch)</option>
                        <option value="URGENT">URGENT (&lt; 2 Hours)</option>
                        <option value="ROUTINE">ROUTINE (&lt; 6 Hours)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#152238', marginBottom: '4px' }}>
                        Required-by Time *
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={formData.requiredByTime}
                        onChange={(e) => setFormData({ ...formData, requiredByTime: e.target.value })}
                        style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#152238', marginBottom: '4px' }}>
                      Designated Hospital Receiver *
                    </label>
                    <select
                      value={formData.designatedReceiverId}
                      onChange={(e) => setFormData({ ...formData, designatedReceiverId: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF' }}
                    >
                      <option value="2">Nurse Anita Sharma (Authorized Receiver - RIMS)</option>
                      <option value="6">Staff Incharge Mohan (Authorized Receiver - KIMS)</option>
                    </select>
                    <span style={{ fontSize: '11px', color: '#64748B' }}>
                      The single-use delivery passkey will be emailed securely to this verified recipient upon drone dispatch.
                    </span>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#152238', marginBottom: '4px' }}>
                      Clinical Remarks &amp; Transfusion Protocols
                    </label>
                    <textarea
                      rows="2"
                      value={formData.remarks}
                      onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                      placeholder="Notes on cross-matching, blood filtration, or rapid delivery instructions..."
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary"
                    style={{ padding: '14px', fontSize: '15px', justifyContent: 'center', marginTop: '10px' }}
                  >
                    {submitting ? 'Transmitting Requisition...' : 'Submit Blood Requisition to ' + selectedBank.blood_bank_name}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
