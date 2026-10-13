import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { hospitalAPI, publicAPI } from '../services/api';
import TrackingMap from '../components/tracking/TrackingMap';
import {
  Search,
  PlusCircle,
  Clock,
  CheckCircle2,
  Plane,
  ShieldCheck,
  AlertCircle,
  FileText,
  KeyRound,
  Filter,
  RefreshCw,
  Building2,
  Calendar,
  XCircle,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export default function HospitalDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('SEARCH'); // 'SEARCH', 'REQUESTS', 'TRACKING', 'VERIFY'
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    pendingRequests: 0,
    acceptedRequests: 0,
    activeDeliveries: 0,
    completedDeliveries: 0,
    availableNetworkUnits: 0
  });
  const [requests, setRequests] = useState([]);
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [selectedTrackingDelivery, setSelectedTrackingDelivery] = useState(null);

  // Search State
  const [searchParams, setSearchParams] = useState({
    bloodGroup: 'O+',
    bloodComponent: 'Packed Red Blood Cells',
    quantity: 1
  });
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Create Request Modal State
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedBankForRequest, setSelectedBankForRequest] = useState(null);
  const [requestFormData, setRequestFormData] = useState({
    patientReference: '',
    bloodGroup: 'O+',
    bloodComponent: 'Packed Red Blood Cells',
    quantity: 1,
    urgency: 'CRITICAL_EMERGENCY',
    requiredByTime: '',
    designatedReceiverId: 2, // Default to seeded Nurse Anita Sharma
    remarks: ''
  });
  const [submittingRequest, setSubmittingRequest] = useState(false);
  const [requestSuccessData, setRequestSuccessData] = useState(null);

  // Passkey Verification Modal / State
  const [showPasskeyModal, setShowPasskeyModal] = useState(false);
  const [targetDeliveryForPasskey, setTargetDeliveryForPasskey] = useState(null);
  const [passkeyCode, setPasskeyCode] = useState('');
  const [verifyingPasskey, setVerifyingPasskey] = useState(false);
  const [passkeyResult, setPasskeyResult] = useState(null);

  // Load Dashboard Stats & Requests
  const loadDashboardData = async () => {
    try {
      const res = await hospitalAPI.getDashboard();
      if (res.data?.success) {
        setStats(res.data.stats);
        setRequests(res.data.recentRequests || []);
        setActiveDeliveries(res.data.activeDeliveries || []);
        if (res.data.activeDeliveries?.length > 0 && !selectedTrackingDelivery) {
          // Select first active delivery for tracking
          loadDeliveryTracking(res.data.activeDeliveries[0].id);
        }
      }
    } catch (err) {
      console.error('Hospital dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadAllRequests = async () => {
    try {
      const res = await hospitalAPI.getRequests();
      if (res.data?.success) {
        setRequests(res.data.requests);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadDeliveryTracking = async (deliveryId) => {
    try {
      const res = await hospitalAPI.getDeliveryTracking(deliveryId);
      if (res.data?.success) {
        setSelectedTrackingDelivery(res.data.delivery);
      }
    } catch (e) {
      console.error('Tracking fetch error:', e);
    }
  };

  useEffect(() => {
    loadDashboardData();
    // Default search on mount
    handleSearch();

    // Set default required-by time to 2 hours from now
    const twoHoursLater = new Date(Date.now() + 2 * 3600 * 1000);
    const isoLocal = new Date(twoHoursLater.getTime() - twoHoursLater.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setRequestFormData((prev) => ({ ...prev, requiredByTime: isoLocal }));
  }, []);

  // Periodic poll for active tracking progression every 3.5 seconds
  useEffect(() => {
    let interval = null;
    if (activeTab === 'TRACKING' && selectedTrackingDelivery && !['DELIVERED', 'CANCELLED'].includes(selectedTrackingDelivery.delivery_status)) {
      interval = setInterval(() => {
        loadDeliveryTracking(selectedTrackingDelivery.id);
      }, 3500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab, selectedTrackingDelivery?.id, selectedTrackingDelivery?.delivery_status]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setSearching(true);
    try {
      const res = await hospitalAPI.searchInventory(searchParams);
      if (res.data?.success) {
        setSearchResults(res.data.results);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearching(false);
    }
  };

  const openCreateRequestModal = (bankItem) => {
    setSelectedBankForRequest(bankItem);
    setRequestFormData((prev) => ({
      ...prev,
      bloodGroup: bankItem.blood_group,
      bloodComponent: bankItem.blood_component,
      quantity: searchParams.quantity || 1
    }));
    setRequestSuccessData(null);
    setShowRequestModal(true);
  };

  const handleCreateRequestSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBankForRequest) return;
    setSubmittingRequest(true);

    try {
      const payload = {
        ...requestFormData,
        bloodBankId: selectedBankForRequest.blood_bank_id,
        quantity: parseInt(requestFormData.quantity, 10),
        designatedReceiverId: parseInt(requestFormData.designatedReceiverId, 10)
      };

      const res = await hospitalAPI.createRequest(payload);
      if (res.data?.success) {
        setRequestSuccessData(res.data);
        loadDashboardData();
        loadAllRequests();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit blood request.');
    } finally {
      setSubmittingRequest(false);
    }
  };

  const handleOpenPasskeyModal = (del) => {
    setTargetDeliveryForPasskey(del);
    setPasskeyCode('');
    setPasskeyResult(null);
    setShowPasskeyModal(true);
  };

  const handleVerifyPasskey = async (e) => {
    e.preventDefault();
    if (!targetDeliveryForPasskey) return;
    setVerifyingPasskey(true);
    setPasskeyResult(null);

    try {
      const res = await hospitalAPI.verifyPasskey(targetDeliveryForPasskey.id, passkeyCode);
      if (res.data?.success) {
        setPasskeyResult({ success: true, message: res.data.message });
        loadDashboardData();
        loadAllRequests();
        if (selectedTrackingDelivery?.id === targetDeliveryForPasskey.id) {
          loadDeliveryTracking(targetDeliveryForPasskey.id);
        }
      }
    } catch (err) {
      setPasskeyResult({
        success: false,
        message: err.response?.data?.message || 'Passkey verification failed.'
      });
    } finally {
      setVerifyingPasskey(false);
    }
  };

  const getStatusBadge = (status) => {
    const map = {
      PENDING: 'badge-pending',
      ACCEPTED: 'badge-accepted',
      PREPARING: 'badge-preparing',
      READY_FOR_DISPATCH: 'badge-ready',
      DISPATCHED: 'badge-dispatched',
      IN_TRANSIT: 'badge-intransit',
      ARRIVED: 'badge-arrived',
      DELIVERED: 'badge-delivered',
      REJECTED: 'badge-rejected',
      CANCELLED: 'badge-cancelled'
    };
    return `badge ${map[status] || 'badge-pending'}`;
  };

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '90vh', paddingBottom: '80px' }}>
      
      {/* Top Header / Facility Bar */}
      <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0', padding: '24px 0' }}>
        <div className="container-custom">
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <span className="badge badge-dispatched">{user?.role}</span>
                <span style={{ fontSize: '12px', color: '#64748B' }}>Prakasam District Healthcare Network</span>
              </div>
              <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#152238', margin: 0 }}>
                {user?.institutionName || 'RIMS Government General Hospital, Ongole'}
              </h1>
              <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
                Logged in as: <strong>{user?.fullName}</strong> &bull; Receiver Vertipad: <code>VERT-HOSP-RIMS (15.5057° N, 80.0499° E)</code>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => { loadDashboardData(); loadAllRequests(); }} className="btn-outline" style={{ padding: '8px 14px', fontSize: '13px' }}>
                <RefreshCw size={14} />
                <span>Refresh Data</span>
              </button>
              <button onClick={() => setActiveTab('SEARCH')} className="btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
                <Search size={14} />
                <span>New Blood Request</span>
              </button>
            </div>
          </div>

          {/* Metric Summary Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '16px',
              marginTop: '24px'
            }}
          >
            <div className="card-light" style={{ padding: '16px' }}>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>Available in Network</div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#1769FF', marginTop: '4px' }}>
                {stats.availableNetworkUnits} <span style={{ fontSize: '14px', fontWeight: '500' }}>Units</span>
              </div>
            </div>

            <div className="card-light" style={{ padding: '16px' }}>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>Pending Approval</div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#D97706', marginTop: '4px' }}>
                {stats.pendingRequests}
              </div>
            </div>

            <div className="card-light" style={{ padding: '16px' }}>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>Accepted / Preparing</div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#4338CA', marginTop: '4px' }}>
                {stats.acceptedRequests}
              </div>
            </div>

            <div className="card-light" style={{ padding: '16px' }}>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>Active Drone Flights</div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#00A6A6', marginTop: '4px' }}>
                {stats.activeDeliveries}
              </div>
            </div>

            <div className="card-light" style={{ padding: '16px' }}>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>Completed Deliveries</div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#16A34A', marginTop: '4px' }}>
                {stats.completedDeliveries}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Tabs */}
      <div className="container-custom" style={{ marginTop: '28px' }}>
        
        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px',
            borderBottom: '1px solid #E2E8F0',
            paddingBottom: '12px',
            marginBottom: '24px'
          }}
        >
          <button
            onClick={() => setActiveTab('SEARCH')}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: activeTab === 'SEARCH' ? '#EEF4FF' : '#FFFFFF',
              color: activeTab === 'SEARCH' ? '#1769FF' : '#64748B',
              border: activeTab === 'SEARCH' ? '1px solid #BFDBFE' : '1px solid #E2E8F0'
            }}
          >
            <Search size={16} />
            <span>Search Blood &amp; Request</span>
          </button>

          <button
            onClick={() => { setActiveTab('REQUESTS'); loadAllRequests(); }}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: activeTab === 'REQUESTS' ? '#EEF4FF' : '#FFFFFF',
              color: activeTab === 'REQUESTS' ? '#1769FF' : '#64748B',
              border: activeTab === 'REQUESTS' ? '1px solid #BFDBFE' : '1px solid #E2E8F0'
            }}
          >
            <FileText size={16} />
            <span>My Requests ({requests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('TRACKING')}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: activeTab === 'TRACKING' ? '#EEF4FF' : '#FFFFFF',
              color: activeTab === 'TRACKING' ? '#1769FF' : '#64748B',
              border: activeTab === 'TRACKING' ? '1px solid #BFDBFE' : '1px solid #E2E8F0'
            }}
          >
            <Plane size={16} />
            <span>Active Flight Tracking ({activeDeliveries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('VERIFY')}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: activeTab === 'VERIFY' ? '#ECFDF5' : '#FFFFFF',
              color: activeTab === 'VERIFY' ? '#16A34A' : '#64748B',
              border: activeTab === 'VERIFY' ? '1px solid #A7F3D0' : '1px solid #E2E8F0'
            }}
          >
            <KeyRound size={16} />
            <span>Receiver Passkey Verification</span>
          </button>
        </div>

        {/* TAB 1: SEARCH BLOOD & CREATE REQUEST */}
        {activeTab === 'SEARCH' && (
          <div>
            {/* Search Filter Bar */}
            <div className="card-light" style={{ padding: '24px', marginBottom: '28px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#152238', marginBottom: '16px' }}>
                Query Regional Blood Banks (Prakasam District)
              </h2>

              <form onSubmit={handleSearch} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', alignItems: 'end' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748B', marginBottom: '6px' }}>
                    Blood Group *
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
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748B', marginBottom: '6px' }}>
                    Component *
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
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#64748B', marginBottom: '6px' }}>
                    Required Units *
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
                  <button type="submit" disabled={searching} className="btn-primary" style={{ width: '100%', padding: '11px' }}>
                    <Search size={16} />
                    <span>{searching ? 'Checking Stock...' : 'Find Matching Inventory'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Search Results Grid */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#152238' }}>
                  Matching Blood Bank Inventory ({searchResults.length})
                </h3>
                <span style={{ fontSize: '13px', color: '#64748B' }}>
                  Sorted by nearest aerial distance &amp; cold expiry date
                </span>
              </div>

              {searchResults.length === 0 ? (
                <div className="card-light" style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
                  <Search size={36} color="#94A3B8" style={{ margin: '0 auto 12px auto' }} />
                  <p style={{ fontWeight: '600' }}>No exact inventory matched your search criteria.</p>
                  <p style={{ fontSize: '13px', marginTop: '4px' }}>Try selecting a universal donor group (such as O-) or adjusting the required unit quantity.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
                  {searchResults.map((item) => (
                    <div key={item.inventory_id} className="card-light card-hover" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                          <div>
                            <span className="badge badge-ready" style={{ fontSize: '13px', fontWeight: '800' }}>
                              {item.blood_group} &bull; {item.blood_component}
                            </span>
                            <div style={{ fontSize: '16px', fontWeight: '800', color: '#152238', marginTop: '8px' }}>
                              {item.blood_bank_name}
                            </div>
                            <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                              {item.address}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '20px', fontWeight: '800', color: '#16A34A' }}>
                              {item.available_quantity} {item.unit}
                            </div>
                            <div style={{ fontSize: '11px', color: '#64748B' }}>In Cold Storage</div>
                          </div>
                        </div>

                        <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#64748B', display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '18px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Batch Number:</span>
                            <strong style={{ color: '#152238' }}>{item.batch_number}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Expiry Date:</span>
                            <strong style={{ color: '#152238' }}>{item.expiry_date}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Storage Spec:</span>
                            <strong style={{ color: '#00A6A6' }}>{item.storage_temperature}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Aerial Flight Est:</span>
                            <strong style={{ color: '#1769FF' }}>~{item.distanceKm} km ({item.estFlightMinutes} min flight)</strong>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => openCreateRequestModal(item)}
                        className="btn-primary"
                        style={{ width: '100%', padding: '10px', fontSize: '14px', justifyContent: 'center' }}
                      >
                        <PlusCircle size={16} />
                        <span>Place Blood Request</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MY REQUESTS TABLE */}
        {activeTab === 'REQUESTS' && (
          <div className="card-light" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#152238' }}>
                Hospital Blood Requests Ledger
              </h2>
              <span style={{ fontSize: '13px', color: '#64748B' }}>
                All records stored with ACID transaction guarantees in MySQL
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#64748B', fontSize: '12px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 16px' }}>Request ID</th>
                    <th style={{ padding: '12px 16px' }}>Patient Ref</th>
                    <th style={{ padding: '12px 16px' }}>Group &amp; Component</th>
                    <th style={{ padding: '12px 16px' }}>Qty</th>
                    <th style={{ padding: '12px 16px' }}>Target Blood Bank</th>
                    <th style={{ padding: '12px 16px' }}>Urgency</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={{ textAlign: 'center', padding: '36px', color: '#64748B' }}>
                        No blood requests found. Use the Search tab to place your first order.
                      </td>
                    </tr>
                  ) : (
                    requests.map((r) => (
                      <tr key={r.id} style={{ borderBottom: '1px solid #E2E8F0', transition: 'background 0.15s ease' }}>
                        <td style={{ padding: '14px 16px', fontWeight: '700', color: '#1769FF' }}>
                          {r.request_number}
                        </td>
                        <td style={{ padding: '14px 16px', color: '#152238', fontWeight: '500' }}>
                          {r.patient_reference}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ fontWeight: '700', color: '#152238' }}>{r.blood_group}</span> &bull; {r.blood_component}
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: '600' }}>
                          {r.quantity} {r.unit}
                        </td>
                        <td style={{ padding: '14px 16px', color: '#64748B' }}>
                          {r.blood_bank_name}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: '700',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            backgroundColor: r.urgency === 'CRITICAL_EMERGENCY' ? '#FEF2F2' : '#EFF6FF',
                            color: r.urgency === 'CRITICAL_EMERGENCY' ? '#DC2626' : '#1D4ED8'
                          }}>
                            {r.urgency}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span className={getStatusBadge(r.status)}>
                            {r.status.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '8px' }}>
                            <Link
                              to={`/requests/${r.id}`}
                              className="btn-ghost"
                              style={{ padding: '6px 10px', fontSize: '12px' }}
                            >
                              Details
                            </Link>
                            {['DISPATCHED', 'IN_TRANSIT', 'ARRIVED'].includes(r.status) && r.delivery_id && (
                              <button
                                onClick={() => {
                                  setActiveTab('TRACKING');
                                  loadDeliveryTracking(r.delivery_id);
                                }}
                                className="btn-primary"
                                style={{ padding: '6px 12px', fontSize: '12px' }}
                              >
                                <Plane size={13} />
                                <span>Track</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ACTIVE FLIGHT TRACKING & SIMULATION */}
        {activeTab === 'TRACKING' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
              <div>
                <TrackingMap delivery={selectedTrackingDelivery} height="520px" zoom={14} />
              </div>

              {/* Delivery Telemetry Sidebar */}
              <div className="card-light" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <span className="badge badge-intransit">Live Flight Tracking</span>
                    <button
                      onClick={() => selectedTrackingDelivery && loadDeliveryTracking(selectedTrackingDelivery.id)}
                      className="btn-ghost"
                      style={{ padding: '4px 8px', fontSize: '12px' }}
                    >
                      <RefreshCw size={13} />
                    </button>
                  </div>

                  {selectedTrackingDelivery ? (
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#152238' }}>
                        {selectedTrackingDelivery.drone_identifier}
                      </h3>
                      <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '16px' }}>
                        Ref: {selectedTrackingDelivery.delivery_reference}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px', backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '10px', marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#64748B' }}>Flight Status:</span>
                          <span className={getStatusBadge(selectedTrackingDelivery.delivery_status)}>
                            {selectedTrackingDelivery.delivery_status}
                          </span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#64748B' }}>Estimated Arrival:</span>
                          <strong style={{ color: '#1769FF' }}>{selectedTrackingDelivery.eta_minutes ?? 0} mins</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#64748B' }}>Remaining Flight Distance:</span>
                          <strong>{selectedTrackingDelivery.distance_km ?? 0} km</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#64748B' }}>Drone Cruising Speed:</span>
                          <strong>{selectedTrackingDelivery.speed_kmh || 65} km/h</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#64748B' }}>Avionics Battery:</span>
                          <strong style={{ color: '#16A34A' }}>{selectedTrackingDelivery.battery_pct || 94}%</strong>
                        </div>
                      </div>

                      {/* Passkey CTA if Arrived */}
                      {['ARRIVED', 'IN_TRANSIT'].includes(selectedTrackingDelivery.delivery_status) && (
                        <button
                          onClick={() => handleOpenPasskeyModal(selectedTrackingDelivery)}
                          className="btn-secondary"
                          style={{ width: '100%', padding: '12px', fontSize: '14px', justifyContent: 'center' }}
                        >
                          <KeyRound size={16} />
                          <span>Enter Delivery Passkey</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '40px 10px', color: '#64748B' }}>
                      <Plane size={36} color="#94A3B8" style={{ margin: '0 auto 12px auto' }} />
                      <p>Select an active delivery from below to inspect live corridor telemetry.</p>
                    </div>
                  )}
                </div>

                {/* Active Deliveries List in Sidebar */}
                <div style={{ marginTop: '20px', borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '10px' }}>
                    Active Hospital Deliveries ({activeDeliveries.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                    {activeDeliveries.map((del) => (
                      <div
                        key={del.id}
                        onClick={() => loadDeliveryTracking(del.id)}
                        style={{
                          padding: '10px',
                          borderRadius: '8px',
                          border: selectedTrackingDelivery?.id === del.id ? '1px solid #1769FF' : '1px solid #E2E8F0',
                          backgroundColor: selectedTrackingDelivery?.id === del.id ? '#EEF4FF' : '#FFFFFF',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: '#152238' }}>{del.delivery_reference}</div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>{del.blood_group} &bull; {del.blood_bank_name}</div>
                        </div>
                        <span className={getStatusBadge(del.delivery_status)} style={{ fontSize: '10px' }}>
                          {del.delivery_status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: RECEIVER PASSKEY VERIFICATION */}
        {activeTab === 'VERIFY' && (
          <div className="card-light" style={{ padding: '36px', maxWidth: '640px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  backgroundColor: '#ECFDF5',
                  color: '#16A34A',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px'
                }}
              >
                <KeyRound size={28} />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#152238' }}>
                Vertipad Package Handover Verification
              </h2>
              <p style={{ fontSize: '14px', color: '#64748B', marginTop: '4px' }}>
                Enter the confidential 6-digit passkey sent exclusively to the designated receiver's email to confirm delivery.
              </p>
            </div>

            <form onSubmit={handleVerifyPasskey} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#152238', marginBottom: '6px' }}>
                  Select Arrived Delivery *
                </label>
                <select
                  value={targetDeliveryForPasskey?.id || ''}
                  onChange={(e) => {
                    const found = activeDeliveries.find((d) => d.id === parseInt(e.target.value, 10));
                    setTargetDeliveryForPasskey(found || null);
                  }}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF' }}
                  required
                >
                  <option value="">-- Choose active delivery --</option>
                  {activeDeliveries.map((del) => (
                    <option key={del.id} value={del.id}>
                      {del.delivery_reference} &bull; {del.blood_group} ({del.blood_component}) &bull; Status: {del.delivery_status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#152238', marginBottom: '6px' }}>
                  6-Digit Delivery Passkey *
                </label>
                <input
                  type="text"
                  maxLength="6"
                  pattern="\d{6}"
                  value={passkeyCode}
                  onChange={(e) => setPasskeyCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 749281"
                  required
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '8px',
                    border: '2px solid #CBD5E1',
                    fontSize: '28px',
                    textAlign: 'center',
                    fontFamily: 'monospace',
                    letterSpacing: '10px',
                    fontWeight: '800',
                    outline: 'none'
                  }}
                />
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '6px', textAlign: 'center' }}>
                  Single-use token. Once verified, token is deactivated permanently.
                  <br />(For seed demo delivery DEL-202610-001, test passkey is: <code>749281</code>)
                </div>
              </div>

              {passkeyResult && (
                <div
                  style={{
                    padding: '14px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    backgroundColor: passkeyResult.success ? '#ECFDF5' : '#FEF2F2',
                    border: `1px solid ${passkeyResult.success ? '#A7F3D0' : '#FCA5A5'}`,
                    color: passkeyResult.success ? '#15803D' : '#DC2626',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  {passkeyResult.success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  <span>{passkeyResult.message}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={verifyingPasskey || !targetDeliveryForPasskey}
                className="btn-secondary"
                style={{ width: '100%', padding: '14px', fontSize: '15px', justifyContent: 'center' }}
              >
                {verifyingPasskey ? 'Verifying Cryptographic Passkey...' : 'Confirm Handover & Unlock Payload'}
              </button>
            </form>
          </div>
        )}

      </div>

      {/* ====================================================
          CREATE BLOOD REQUEST MODAL
          ==================================================== */}
      {showRequestModal && selectedBankForRequest && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'rgba(21, 34, 56, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            className="card-light"
            style={{
              width: '100%',
              maxWidth: '600px',
              padding: '32px',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
          >
            {requestSuccessData ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: '#ECFDF5',
                    color: '#16A34A',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px'
                  }}
                >
                  <CheckCircle2 size={32} />
                </div>
                <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#152238' }}>
                  Request Transmitted to Blood Bank!
                </h3>
                <div style={{ margin: '16px 0', padding: '14px', backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '13px', color: '#64748B' }}>Assigned Request Reference Number</div>
                  <div style={{ fontSize: '24px', fontWeight: '800', color: '#1769FF', letterSpacing: '1px' }}>
                    {requestSuccessData.requestNumber}
                  </div>
                </div>
                <p style={{ fontSize: '14px', color: '#64748B', lineHeight: '1.6', marginBottom: '24px' }}>
                  The blood bank operations desk will review inventory compatibility, reserve the units transactionally, and initialize medical package preparation.
                </p>
                <button
                  onClick={() => setShowRequestModal(false)}
                  className="btn-primary"
                  style={{ width: '100%', padding: '12px' }}
                >
                  Return to Dashboard
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateRequestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#152238' }}>
                    Create Emergency Blood Request
                  </h3>
                  <button type="button" onClick={() => setShowRequestModal(false)} style={{ color: '#94A3B8' }}>
                    <XCircle size={22} />
                  </button>
                </div>

                <div style={{ backgroundColor: '#EEF4FF', border: '1px solid #BFDBFE', padding: '12px', borderRadius: '8px', fontSize: '13px', color: '#1E40AF' }}>
                  <strong>Target Blood Bank:</strong> {selectedBankForRequest.blood_bank_name} &bull; Distance: ~{selectedBankForRequest.distanceKm} km
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#152238', marginBottom: '4px' }}>
                    Patient / Clinical Reference ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={requestFormData.patientReference}
                    onChange={(e) => setRequestFormData({ ...requestFormData, patientReference: e.target.value })}
                    placeholder="e.g. PT-RIMS-1049 (Casualty OT-2)"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  />
                  <span style={{ fontSize: '11px', color: '#64748B' }}>Only collect non-sensitive clinical identifiers necessary for transfusion custody.</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#152238', marginBottom: '4px' }}>
                      Blood Group
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={requestFormData.bloodGroup}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#F1F5F9', fontWeight: '700' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#152238', marginBottom: '4px' }}>
                      Component
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={requestFormData.bloodComponent}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#F1F5F9' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#152238', marginBottom: '4px' }}>
                      Required Units *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={selectedBankForRequest.available_quantity || 10}
                      value={requestFormData.quantity}
                      onChange={(e) => setRequestFormData({ ...requestFormData, quantity: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#152238', marginBottom: '4px' }}>
                      Urgency Level *
                    </label>
                    <select
                      value={requestFormData.urgency}
                      onChange={(e) => setRequestFormData({ ...requestFormData, urgency: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF' }}
                    >
                      <option value="CRITICAL_EMERGENCY">CRITICAL EMERGENCY (Immediate)</option>
                      <option value="URGENT">URGENT (&lt; 2 Hours)</option>
                      <option value="ROUTINE">ROUTINE (&lt; 6 Hours)</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#152238', marginBottom: '4px' }}>
                      Required-by Time *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={requestFormData.requiredByTime}
                      onChange={(e) => setRequestFormData({ ...requestFormData, requiredByTime: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#152238', marginBottom: '4px' }}>
                      Designated Receiver *
                    </label>
                    <select
                      value={requestFormData.designatedReceiverId}
                      onChange={(e) => setRequestFormData({ ...requestFormData, designatedReceiverId: e.target.value })}
                      style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF' }}
                    >
                      <option value="2">Nurse Anita Sharma (Hospital Receiver)</option>
                      <option value="6">Staff Incharge Mohan (Hospital Receiver)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#152238', marginBottom: '4px' }}>
                    Clinical Remarks
                  </label>
                  <textarea
                    rows="2"
                    value={requestFormData.remarks}
                    onChange={(e) => setRequestFormData({ ...requestFormData, remarks: e.target.value })}
                    placeholder="e.g. Acute hemorrhagic shock protocol, cross-match tube in transit..."
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="btn-outline"
                    style={{ flex: 1, padding: '12px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingRequest}
                    className="btn-primary"
                    style={{ flex: 2, padding: '12px' }}
                  >
                    {submittingRequest ? 'Submitting Request...' : 'Confirm & Transmit Request'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ====================================================
          STANDALONE PASSKEY MODAL
          ==================================================== */}
      {showPasskeyModal && targetDeliveryForPasskey && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            backgroundColor: 'rgba(21, 34, 56, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div className="card-light" style={{ width: '100%', maxWidth: '460px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#152238' }}>
                Verify Delivery Passkey
              </h3>
              <button onClick={() => setShowPasskeyModal(false)} style={{ color: '#94A3B8' }}>
                <XCircle size={20} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>
              Delivery: <strong>{targetDeliveryForPasskey.delivery_reference}</strong> &bull; Drone: {targetDeliveryForPasskey.drone_identifier}
            </p>

            <form onSubmit={handleVerifyPasskey} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <input
                type="text"
                maxLength="6"
                pattern="\d{6}"
                value={passkeyCode}
                onChange={(e) => setPasskeyCode(e.target.value.replace(/\D/g, ''))}
                placeholder="6-Digit Code"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid #CBD5E1',
                  fontSize: '26px',
                  textAlign: 'center',
                  fontFamily: 'monospace',
                  letterSpacing: '8px',
                  fontWeight: '800'
                }}
              />

              {passkeyResult && (
                <div style={{ fontSize: '13px', color: passkeyResult.success ? '#15803D' : '#DC2626' }}>
                  {passkeyResult.message}
                </div>
              )}

              <button
                type="submit"
                disabled={verifyingPasskey}
                className="btn-secondary"
                style={{ width: '100%', padding: '12px', justifyContent: 'center' }}
              >
                {verifyingPasskey ? 'Verifying...' : 'Submit & Complete Delivery'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
