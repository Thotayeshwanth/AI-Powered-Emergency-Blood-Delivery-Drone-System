import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { bloodBankAPI, routeAPI } from '../services/api';
import TrackingMap from '../components/tracking/TrackingMap';
import {
  ShieldCheck,
  Package,
  PlusCircle,
  CheckCircle2,
  XCircle,
  Plane,
  Route,
  RefreshCw,
  AlertCircle,
  FileCheck,
  Clock,
  Layers,
  Thermometer,
  KeyRound,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function BloodBankDashboard() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('REQUESTS'); // 'REQUESTS', 'INVENTORY', 'PREPARATION', 'DISPATCH'
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState({
    totalInventoryRecords: 0,
    availableUnits: 0,
    pendingRequests: 0,
    acceptedRequests: 0,
    activeDeliveries: 0
  });

  const [requests, setRequests] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [activeDeliveries, setActiveDeliveries] = useState([]);

  // Modals & Action States
  const [showAddInventoryModal, setShowAddInventoryModal] = useState(false);
  const [inventoryFormData, setInventoryFormData] = useState({
    bloodGroup: 'O+',
    bloodComponent: 'Packed Red Blood Cells',
    quantity: 10,
    unit: 'Units',
    batchNumber: '',
    collectionDate: new Date().toISOString().slice(0, 10),
    expiryDate: new Date(Date.now() + 35 * 86400000).toISOString().slice(0, 10),
    storageTemperature: '+2°C to +6°C',
    storageRequirement: 'Inspected refrigerated blood storage unit'
  });

  // Rejection modal
  const [rejectingRequestId, setRejectingRequestId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Preparation modal
  const [preparingRequest, setPreparingRequest] = useState(null);
  const [prepChecklist, setPrepChecklist] = useState({
    packageId: '',
    coldChainVerified: true,
    tamperSealApplied: true,
    notes: 'Pre-flight cold box sealed at 3.6°C with PCM thermal cooling packs.'
  });

  // Dispatch modal
  const [dispatchingRequest, setDispatchingRequest] = useState(null);
  const [dispatchDroneId, setDispatchDroneId] = useState('LD-HEXA-01 (Apex Lifter)');
  const [calculatedRoute, setCalculatedRoute] = useState(null);
  const [calculatingRoute, setCalculatingRoute] = useState(false);
  const [dispatchSuccessData, setDispatchSuccessData] = useState(null);

  const loadDashboardData = async () => {
    try {
      const res = await bloodBankAPI.getDashboard();
      if (res.data?.success) {
        setStats(res.data.stats);
        setActiveDeliveries(res.data.activeDeliveries || []);
      }
    } catch (err) {
      console.error('Blood bank dashboard error:', err);
    }
  };

  const loadRequests = async () => {
    try {
      const res = await bloodBankAPI.getRequests();
      if (res.data?.success) {
        setRequests(res.data.requests);
      }
    } catch (err) {
      console.error('Requests load error:', err);
    }
  };

  const loadInventory = async () => {
    try {
      const res = await bloodBankAPI.getInventory();
      if (res.data?.success) {
        setInventory(res.data.inventory);
      }
    } catch (err) {
      console.error('Inventory load error:', err);
    }
  };

  useEffect(() => {
    Promise.all([loadDashboardData(), loadRequests(), loadInventory()]).finally(() => {
      setLoading(false);
    });
  }, []);

  const handleAddInventory = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...inventoryFormData,
        batchNumber: inventoryFormData.batchNumber || `BATCH-${Date.now().toString().slice(-6)}`
      };
      const res = await bloodBankAPI.addInventory(payload);
      if (res.data?.success) {
        setShowAddInventoryModal(false);
        loadInventory();
        loadDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add inventory.');
    }
  };

  const handleAcceptRequest = async (requestId) => {
    if (!window.confirm('Accept this blood request and reserve required stock transactionally?')) return;
    try {
      const res = await bloodBankAPI.acceptRequest(requestId);
      if (res.data?.success) {
        alert(res.data.message);
        loadRequests();
        loadInventory();
        loadDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to accept request.');
    }
  };

  const handleRejectRequestSubmit = async (e) => {
    e.preventDefault();
    if (!rejectingRequestId || !rejectionReason.trim()) return;
    try {
      const res = await bloodBankAPI.rejectRequest(rejectingRequestId, rejectionReason);
      if (res.data?.success) {
        setRejectingRequestId(null);
        setRejectionReason('');
        loadRequests();
        loadDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject request.');
    }
  };

  const openPreparationModal = (req) => {
    setPreparingRequest(req);
    setPrepChecklist({
      packageId: `PKG-${req.request_number.slice(-4)}-${Date.now().toString().slice(-3)}`,
      coldChainVerified: true,
      tamperSealApplied: true,
      notes: 'Medical cold box verified at +3.8°C with digital datalogger.'
    });
  };

  const handleCompletePreparation = async (e) => {
    e.preventDefault();
    if (!preparingRequest) return;
    try {
      const res = await bloodBankAPI.preparePackage(preparingRequest.id, prepChecklist);
      if (res.data?.success) {
        alert(res.data.message);
        setPreparingRequest(null);
        loadRequests();
        loadDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to verify package preparation.');
    }
  };

  const openDispatchModal = async (req) => {
    setDispatchingRequest(req);
    setCalculatedRoute(null);
    setDispatchSuccessData(null);
    setCalculatingRoute(true);

    try {
      // Calculate A* Route
      const res = await routeAPI.calculate({
        bloodBankId: user?.institutionId || 1,
        hospitalId: req.hospital_id
      });
      if (res.data?.success) {
        setCalculatedRoute(res.data.plan);
      }
    } catch (e) {
      console.error('Route calculation error:', e);
    } finally {
      setCalculatingRoute(false);
    }
  };

  const handleConfirmDispatch = async () => {
    if (!dispatchingRequest) return;
    try {
      const payload = {
        droneIdentifier: dispatchDroneId
      };
      const res = await bloodBankAPI.dispatchDelivery(dispatchingRequest.id, payload);
      if (res.data?.success) {
        setDispatchSuccessData(res.data);
        loadRequests();
        loadDashboardData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to dispatch drone.');
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
                <span className="badge badge-ready">{user?.role}</span>
                <span style={{ fontSize: '12px', color: '#64748B' }}>Prakasam Central Storage Hub</span>
              </div>
              <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#152238', margin: 0 }}>
                {user?.institutionName || 'Indian Red Cross Society Blood Centre, Ongole'}
              </h1>
              <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
                Staff Member: <strong>{user?.fullName}</strong> &bull; Vertiport Code: <code>VERT-BB-RC (15.5030° N, 80.0450° E)</code>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => { loadDashboardData(); loadRequests(); loadInventory(); }}
                className="btn-outline"
                style={{ padding: '8px 14px', fontSize: '13px' }}
              >
                <RefreshCw size={14} />
                <span>Refresh Data</span>
              </button>
              <button
                onClick={() => setShowAddInventoryModal(true)}
                className="btn-secondary"
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                <PlusCircle size={14} />
                <span>Add Blood Unit</span>
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
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>Total Inventory Batches</div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#152238', marginTop: '4px' }}>
                {stats.totalInventoryRecords}
              </div>
            </div>

            <div className="card-light" style={{ padding: '16px' }}>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>Available Units in Stock</div>
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#00A6A6', marginTop: '4px' }}>
                {stats.availableUnits} <span style={{ fontSize: '14px', fontWeight: '500' }}>Units</span>
              </div>
            </div>

            <div className="card-light" style={{ padding: '16px' }}>
              <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>Pending Hospital Requests</div>
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
              <div style={{ fontSize: '28px', fontWeight: '800', color: '#1769FF', marginTop: '4px' }}>
                {stats.activeDeliveries}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
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
            onClick={() => setActiveTab('REQUESTS')}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: activeTab === 'REQUESTS' ? '#E6F7F7' : '#FFFFFF',
              color: activeTab === 'REQUESTS' ? '#00A6A6' : '#64748B',
              border: activeTab === 'REQUESTS' ? '1px solid #99E2E2' : '1px solid #E2E8F0'
            }}
          >
            <Clock size={16} />
            <span>Incoming Requests ({requests.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('INVENTORY')}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: activeTab === 'INVENTORY' ? '#E6F7F7' : '#FFFFFF',
              color: activeTab === 'INVENTORY' ? '#00A6A6' : '#64748B',
              border: activeTab === 'INVENTORY' ? '1px solid #99E2E2' : '1px solid #E2E8F0'
            }}
          >
            <Package size={16} />
            <span>Blood Inventory ({inventory.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('PREPARATION')}
            style={{
              padding: '10px 18px',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: activeTab === 'PREPARATION' ? '#E6F7F7' : '#FFFFFF',
              color: activeTab === 'PREPARATION' ? '#00A6A6' : '#64748B',
              border: activeTab === 'PREPARATION' ? '1px solid #99E2E2' : '1px solid #E2E8F0'
            }}
          >
            <Layers size={16} />
            <span>Package Prep &amp; Dispatch Queue</span>
          </button>
        </div>

        {/* TAB 1: INCOMING REQUESTS MANAGEMENT */}
        {activeTab === 'REQUESTS' && (
          <div className="card-light" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#152238' }}>
                Emergency Requisitions from Hospitals
              </h2>
              <span style={{ fontSize: '13px', color: '#64748B' }}>
                Accepting reserves stock transactionally and alerts requester
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#64748B', fontSize: '12px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 16px' }}>Request ID</th>
                    <th style={{ padding: '12px 16px' }}>Requesting Hospital</th>
                    <th style={{ padding: '12px 16px' }}>Blood Group &amp; Component</th>
                    <th style={{ padding: '12px 16px' }}>Qty</th>
                    <th style={{ padding: '12px 16px' }}>Urgency</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                    <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#64748B' }}>
                        No incoming requests pending.
                      </td>
                    </tr>
                  ) : (
                    requests.map((r) => (
                      <tr key={r.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '14px 16px', fontWeight: '700', color: '#1769FF' }}>
                          {r.request_number}
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: '600', color: '#152238' }}>
                          {r.hospital_name}
                          <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '400' }}>
                            Patient: {r.patient_reference}
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{ fontWeight: '800', color: '#152238' }}>{r.blood_group}</span> &bull; {r.blood_component}
                        </td>
                        <td style={{ padding: '14px 16px', fontWeight: '700' }}>
                          {r.quantity} {r.unit}
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
                            {r.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleAcceptRequest(r.id)}
                                  className="btn-primary"
                                  style={{ padding: '6px 12px', fontSize: '12px' }}
                                >
                                  Accept &amp; Reserve
                                </button>
                                <button
                                  onClick={() => setRejectingRequestId(r.id)}
                                  className="btn-outline"
                                  style={{ padding: '6px 12px', fontSize: '12px', color: '#DC2626', borderColor: '#FECACA' }}
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {r.status === 'ACCEPTED' && (
                              <button
                                onClick={() => openPreparationModal(r)}
                                className="btn-secondary"
                                style={{ padding: '6px 12px', fontSize: '12px' }}
                              >
                                Prepare Package &rarr;
                              </button>
                            )}

                            {r.status === 'READY_FOR_DISPATCH' && (
                              <button
                                onClick={() => openDispatchModal(r)}
                                className="btn-primary"
                                style={{ padding: '6px 12px', fontSize: '12px' }}
                              >
                                Configure &amp; Dispatch &rarr;
                              </button>
                            )}

                            {['DISPATCHED', 'IN_TRANSIT', 'ARRIVED'].includes(r.status) && (
                              <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: '600' }}>
                                Drone In Flight
                              </span>
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

        {/* TAB 2: INVENTORY MANAGEMENT */}
        {activeTab === 'INVENTORY' && (
          <div className="card-light" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#152238' }}>
                  Blood Bank Cold Storage Inventory
                </h2>
                <div style={{ fontSize: '13px', color: '#64748B' }}>
                  Inspected units stored with temperature compliance in Prakasam central bank
                </div>
              </div>
              <button
                onClick={() => setShowAddInventoryModal(true)}
                className="btn-secondary"
                style={{ padding: '8px 16px', fontSize: '13px' }}
              >
                <PlusCircle size={15} />
                <span>Add Blood Product</span>
              </button>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '2px solid #E2E8F0', color: '#64748B', fontSize: '12px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px 16px' }}>Group</th>
                    <th style={{ padding: '12px 16px' }}>Component</th>
                    <th style={{ padding: '12px 16px' }}>Available Units</th>
                    <th style={{ padding: '12px 16px' }}>Reserved</th>
                    <th style={{ padding: '12px 16px' }}>Batch / Unit ID</th>
                    <th style={{ padding: '12px 16px' }}>Storage Spec</th>
                    <th style={{ padding: '12px 16px' }}>Expiry Date</th>
                    <th style={{ padding: '12px 16px' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '14px 16px', fontWeight: '800', color: '#1769FF', fontSize: '16px' }}>
                        {item.blood_group}
                      </td>
                      <td style={{ padding: '14px 16px', fontWeight: '600', color: '#152238' }}>
                        {item.blood_component}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ fontSize: '16px', fontWeight: '800', color: item.available_quantity > 0 ? '#16A34A' : '#DC2626' }}>
                          {item.available_quantity}
                        </span> {item.unit}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#64748B', fontWeight: '600' }}>
                        {item.reserved_quantity} {item.unit}
                      </td>
                      <td style={{ padding: '14px 16px', fontFamily: 'monospace', fontSize: '13px' }}>
                        {item.batch_number}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#00A6A6', fontWeight: '500' }}>
                        {item.storage_temperature}
                      </td>
                      <td style={{ padding: '14px 16px', color: '#64748B' }}>
                        {item.expiry_date}
                      </td>
                      <td style={{ padding: '14px 16px' }}>
                        <span className={item.status === 'AVAILABLE' ? 'badge badge-delivered' : 'badge badge-rejected'}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: PACKAGE PREP & DISPATCH QUEUE */}
        {activeTab === 'PREPARATION' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {/* Accepted queue waiting for preparation */}
            <div className="card-light" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#152238', marginBottom: '16px' }}>
                1. Preparation Queue (Accepted Orders)
              </h3>
              {requests.filter((r) => r.status === 'ACCEPTED').length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#64748B', fontSize: '14px' }}>
                  No orders waiting for packaging checklist.
                </div>
              ) : (
                requests
                  .filter((r) => r.status === 'ACCEPTED')
                  .map((r) => (
                    <div key={r.id} style={{ border: '1px solid #E2E8F0', borderRadius: '10px', padding: '16px', marginBottom: '12px', backgroundColor: '#FFFFFF' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <strong style={{ color: '#1769FF' }}>{r.request_number}</strong>
                        <span className="badge badge-accepted">Accepted</span>
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#152238' }}>
                        {r.hospital_name}
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
                        Payload: {r.quantity} {r.unit} of {r.blood_group} ({r.blood_component})
                      </div>
                      <button
                        onClick={() => openPreparationModal(r)}
                        className="btn-secondary"
                        style={{ width: '100%', marginTop: '12px', padding: '8px', fontSize: '13px', justifyContent: 'center' }}
                      >
                        Launch Packaging Checklist &rarr;
                      </button>
                    </div>
                  ))
              )}
            </div>

            {/* Ready for flight dispatch */}
            <div className="card-light" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#152238', marginBottom: '16px' }}>
                2. Ready for Aerial Dispatch
              </h3>
              {requests.filter((r) => r.status === 'READY_FOR_DISPATCH').length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#64748B', fontSize: '14px' }}>
                  No orders currently awaiting flight launch.
                </div>
              ) : (
                requests
                  .filter((r) => r.status === 'READY_FOR_DISPATCH')
                  .map((r) => (
                    <div key={r.id} style={{ border: '1px solid #A7F3D0', borderRadius: '10px', padding: '16px', marginBottom: '12px', backgroundColor: '#F0FDF4' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <strong style={{ color: '#15803D' }}>{r.request_number}</strong>
                        <span className="badge badge-ready">Ready For Dispatch</span>
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#152238' }}>
                        {r.hospital_name}
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748B', marginTop: '2px' }}>
                        Payload packaged &bull; {r.blood_group} ({r.blood_component})
                      </div>
                      <button
                        onClick={() => openDispatchModal(r)}
                        className="btn-primary"
                        style={{ width: '100%', marginTop: '12px', padding: '8px', fontSize: '13px', justifyContent: 'center' }}
                      >
                        <Plane size={14} />
                        <span>Plan Route &amp; Launch Drone &rarr;</span>
                      </button>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

      </div>

      {/* ====================================================
          ADD INVENTORY MODAL
          ==================================================== */}
      {showAddInventoryModal && (
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
          <div className="card-light" style={{ width: '100%', maxWidth: '540px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#152238' }}>
                Add Blood Product to Inventory
              </h3>
              <button onClick={() => setShowAddInventoryModal(false)} style={{ color: '#94A3B8' }}>
                <XCircle size={22} />
              </button>
            </div>

            <form onSubmit={handleAddInventory} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#152238', marginBottom: '4px' }}>
                    Blood Group *
                  </label>
                  <select
                    value={inventoryFormData.bloodGroup}
                    onChange={(e) => setInventoryFormData({ ...inventoryFormData, bloodGroup: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF' }}
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#152238', marginBottom: '4px' }}>
                    Component *
                  </label>
                  <select
                    value={inventoryFormData.bloodComponent}
                    onChange={(e) => setInventoryFormData({ ...inventoryFormData, bloodComponent: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF' }}
                  >
                    <option value="Packed Red Blood Cells">Packed Red Blood Cells (PRBC)</option>
                    <option value="Platelets">Platelets</option>
                    <option value="Fresh Frozen Plasma">Fresh Frozen Plasma (FFP)</option>
                    <option value="Whole Blood">Whole Blood</option>
                    <option value="Cryoprecipitate">Cryoprecipitate</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#152238', marginBottom: '4px' }}>
                    Quantity (Units) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={inventoryFormData.quantity}
                    onChange={(e) => setInventoryFormData({ ...inventoryFormData, quantity: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#152238', marginBottom: '4px' }}>
                    Batch / Unit Barcode
                  </label>
                  <input
                    type="text"
                    value={inventoryFormData.batchNumber}
                    onChange={(e) => setInventoryFormData({ ...inventoryFormData, batchNumber: e.target.value })}
                    placeholder="Auto-generated if empty"
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#152238', marginBottom: '4px' }}>
                    Collection Date *
                  </label>
                  <input
                    type="date"
                    value={inventoryFormData.collectionDate}
                    onChange={(e) => setInventoryFormData({ ...inventoryFormData, collectionDate: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#152238', marginBottom: '4px' }}>
                    Expiry Date *
                  </label>
                  <input
                    type="date"
                    value={inventoryFormData.expiryDate}
                    onChange={(e) => setInventoryFormData({ ...inventoryFormData, expiryDate: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#152238', marginBottom: '4px' }}>
                  Storage Temperature Spec
                </label>
                <input
                  type="text"
                  value={inventoryFormData.storageTemperature}
                  onChange={(e) => setInventoryFormData({ ...inventoryFormData, storageTemperature: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddInventoryModal(false)}
                  className="btn-outline"
                  style={{ flex: 1, padding: '10px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-secondary"
                  style={{ flex: 2, padding: '10px', justifyContent: 'center' }}
                >
                  Save Blood Inventory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================
          REJECTION REASON MODAL
          ==================================================== */}
      {rejectingRequestId && (
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
          <div className="card-light" style={{ width: '100%', maxWidth: '440px', padding: '28px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#152238', marginBottom: '8px' }}>
              Decline Blood Request
            </h3>
            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px' }}>
              Mandatory clinical reason is transmitted immediately to the requesting hospital.
            </p>

            <form onSubmit={handleRejectRequestSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <textarea
                rows="3"
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Stock reserved for active casualty; universal group depleted..."
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
              />

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setRejectingRequestId(null)}
                  className="btn-outline"
                  style={{ flex: 1, padding: '10px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-outline"
                  style={{ flex: 1, padding: '10px', color: '#DC2626', borderColor: '#FECACA' }}
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================
          PACKAGE PREPARATION CHECKLIST MODAL
          ==================================================== */}
      {preparingRequest && (
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
          <div className="card-light" style={{ width: '100%', maxWidth: '520px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#152238' }}>
                Medical Packaging Checklist
              </h3>
              <button onClick={() => setPreparingRequest(null)} style={{ color: '#94A3B8' }}>
                <XCircle size={20} />
              </button>
            </div>

            <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px' }}>
              Order: <strong>{preparingRequest.request_number}</strong> &bull; {preparingRequest.hospital_name}
              <br />Payload: {preparingRequest.quantity} units of {preparingRequest.blood_group} ({preparingRequest.blood_component})
            </p>

            <form onSubmit={handleCompletePreparation} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#152238', marginBottom: '4px' }}>
                  Package Tracking Identifier
                </label>
                <input
                  type="text"
                  required
                  value={prepChecklist.packageId}
                  onChange={(e) => setPrepChecklist({ ...prepChecklist, packageId: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="coldChain"
                  checked={prepChecklist.coldChainVerified}
                  onChange={(e) => setPrepChecklist({ ...prepChecklist, coldChainVerified: e.target.checked })}
                />
                <label htmlFor="coldChain" style={{ fontSize: '13px', color: '#152238', fontWeight: '600' }}>
                  Cold Chain Verified (+2°C to +6°C cooling pack inserted)
                </label>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="checkbox"
                  id="tamperSeal"
                  checked={prepChecklist.tamperSealApplied}
                  onChange={(e) => setPrepChecklist({ ...prepChecklist, tamperSealApplied: e.target.checked })}
                />
                <label htmlFor="tamperSeal" style={{ fontSize: '13px', color: '#152238', fontWeight: '600' }}>
                  Tamper-Evident Security Seal Applied to Transport Box
                </label>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#152238', marginBottom: '4px' }}>
                  Packaging Inspection Notes
                </label>
                <textarea
                  rows="2"
                  value={prepChecklist.notes}
                  onChange={(e) => setPrepChecklist({ ...prepChecklist, notes: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                />
              </div>

              <button
                type="submit"
                className="btn-secondary"
                style={{ width: '100%', padding: '12px', justifyContent: 'center' }}
              >
                Sign Off &amp; Mark Ready for Dispatch
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================
          A* ROUTE PLANNING & DRONE DISPATCH MODAL
          ==================================================== */}
      {dispatchingRequest && (
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
          <div className="card-light" style={{ width: '100%', maxWidth: '640px', padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}>
            {dispatchSuccessData ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
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
                    marginBottom: '16px'
                  }}
                >
                  <Plane size={36} />
                </div>
                <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#152238' }}>
                  Medical Drone Dispatched!
                </h3>
                <div style={{ margin: '16px 0', padding: '16px', backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>Assigned Delivery Reference</div>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: '#1769FF', marginBottom: '8px' }}>
                    {dispatchSuccessData.deliveryRef}
                  </div>
                  <div style={{ fontSize: '13px', color: '#152238' }}>
                    Drone ID: <strong>{dispatchSuccessData.droneIdentifier}</strong>
                  </div>
                </div>

                {/* Display Demo Passkey Notice */}
                <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', padding: '14px', borderRadius: '8px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '12px', color: '#1E40AF', fontWeight: '700', textTransform: 'uppercase' }}>
                    Issued Single-Use Passkey (Sent to Receiver's Email)
                  </div>
                  <div style={{ fontSize: '28px', fontWeight: '800', color: '#1D4ED8', letterSpacing: '4px', fontFamily: 'monospace', margin: '6px 0' }}>
                    {dispatchSuccessData.passkey}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748B' }}>
                    Valid for 60 minutes. The receiver enters this code upon drone vertipad touchdown.
                  </div>
                </div>

                <button
                  onClick={() => setDispatchingRequest(null)}
                  className="btn-primary"
                  style={{ width: '100%', padding: '12px' }}
                >
                  Return to Dashboard
                </button>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#152238' }}>
                    Drone Flight Authorization &amp; A* Pathfinding
                  </h3>
                  <button onClick={() => setDispatchingRequest(null)} style={{ color: '#94A3B8' }}>
                    <XCircle size={20} />
                  </button>
                </div>

                <div style={{ marginBottom: '20px', padding: '14px', backgroundColor: '#F8FAFC', borderRadius: '10px', fontSize: '13px', color: '#152238' }}>
                  <div>Destination Hospital: <strong>{dispatchingRequest.hospital_name}</strong></div>
                  <div>Designated Receiver: <strong>{dispatchingRequest.receiver_name} ({dispatchingRequest.receiver_email})</strong></div>
                </div>

                {calculatingRoute ? (
                  <div style={{ textAlign: 'center', padding: '30px' }}>
                    <div style={{ fontSize: '14px', color: '#1769FF', fontWeight: '600' }}>
                      Executing A* Pathfinding across Prakasam Corridor Graph...
                    </div>
                  </div>
                ) : calculatedRoute ? (
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: '#1769FF' }}>
                        Algorithm: {calculatedRoute.algorithm}
                      </span>
                      <span className="badge badge-ready">Corridors Locked</span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '10px', marginBottom: '16px' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>Calculated Distance</div>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#152238' }}>
                          {calculatedRoute.totalDistanceKm} km
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748B' }}>Estimated Flight Duration</div>
                        <div style={{ fontSize: '18px', fontWeight: '800', color: '#00A6A6' }}>
                          {calculatedRoute.flightDurationMinutes} minutes
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: '12px', color: '#64748B', marginBottom: '16px' }}>
                      <strong>Waypoints Corridor Path:</strong>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
                        {calculatedRoute.waypoints.map((w, idx) => (
                          <span key={idx} style={{ backgroundColor: '#EEF4FF', color: '#1769FF', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>
                            {idx + 1}. {w.name || w.code}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : null}

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#152238', marginBottom: '4px' }}>
                    Select Autonomous Medical Drone *
                  </label>
                  <select
                    value={dispatchDroneId}
                    onChange={(e) => setDispatchDroneId(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #CBD5E1', backgroundColor: '#FFFFFF' }}
                  >
                    <option value="LD-HEXA-01 (Apex Lifter)">LD-HEXA-01 (Apex Lifter - Hexacopter)</option>
                    <option value="LD-OCTA-02 (SkyCorridor Pro)">LD-OCTA-02 (SkyCorridor Pro - Octacopter)</option>
                    <option value="LD-VTOL-03 (HighSpeed Courier)">LD-VTOL-03 (HighSpeed Courier - TiltRotor)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setDispatchingRequest(null)}
                    className="btn-outline"
                    style={{ flex: 1, padding: '12px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDispatch}
                    className="btn-primary"
                    style={{ flex: 2, padding: '12px', justifyContent: 'center' }}
                  >
                    <Plane size={16} />
                    <span>Authorize &amp; Launch Medical Drone</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
