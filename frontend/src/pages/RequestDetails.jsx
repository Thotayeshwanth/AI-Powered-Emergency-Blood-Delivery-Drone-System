import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { hospitalAPI } from '../services/api';
import {
  FileText,
  Building2,
  ShieldCheck,
  Clock,
  Plane,
  ArrowLeft,
  Mail,
  User,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Calendar
} from 'lucide-react';

export default function RequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [emailLogs, setEmailLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    hospitalAPI.getRequestDetails(id)
      .then((res) => {
        if (res.data?.success) {
          setRequest(res.data.request);
          setEmailLogs(res.data.emailLogs || []);
        } else {
          setErrorMsg(res.data?.message || 'Could not load request.');
        }
      })
      .catch((err) => {
        setErrorMsg(err.response?.data?.message || 'Error loading request details.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this blood request?')) return;
    try {
      const res = await hospitalAPI.cancelRequest(id, { reason: 'Cancelled by requester' });
      if (res.data?.success) {
        alert('Request cancelled successfully.');
        navigate('/hospital/dashboard');
      }
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to cancel request.');
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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', color: '#64748B' }}>
        Loading request details...
      </div>
    );
  }

  if (errorMsg || !request) {
    return (
      <div className="container-custom" style={{ padding: '80px 20px', textAlign: 'center' }}>
        <AlertCircle size={48} color="#DC2626" style={{ margin: '0 auto 16px auto' }} />
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#152238' }}>Request Record Notice</h2>
        <p style={{ color: '#64748B', margin: '8px 0 24px 0' }}>{errorMsg || 'Request not found.'}</p>
        <Link to="/hospital/dashboard" className="btn-primary">
          <ArrowLeft size={16} />
          <span>Return to Hospital Dashboard</span>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '90vh', padding: '40px 0 80px 0' }}>
      <div className="container-custom" style={{ maxWidth: '900px' }}>
        
        {/* Breadcrumb / Back button */}
        <div style={{ marginBottom: '24px' }}>
          <Link
            to="/hospital/dashboard"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: '#124676', fontWeight: '600' }}
          >
            <ArrowLeft size={16} />
            <span>Back to Hospital Dashboard</span>
          </Link>
        </div>

        {/* Card Header */}
        <div className="card-light" style={{ padding: '32px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span className={getStatusBadge(request.status)}>
                  {request.status.replace(/_/g, ' ')}
                </span>
                <span style={{ fontSize: '12px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#EFF6FF', color: '#124676' }}>
                  {request.urgency}
                </span>
              </div>
              <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#152238', margin: 0 }}>
                {request.request_number}
              </h1>
              <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
                Logged on {new Date(request.created_at).toLocaleString()}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              {request.status === 'PENDING' && (
                <button
                  onClick={handleCancel}
                  className="btn-outline"
                  style={{ color: '#DC2626', borderColor: '#FECACA' }}
                >
                  <XCircle size={16} />
                  <span>Cancel Request</span>
                </button>
              )}

              {request.delivery_id && (
                <Link
                  to={`/deliveries/${request.delivery_id}/tracking`}
                  className="btn-primary"
                >
                  <Plane size={16} />
                  <span>Open Flight Tracking</span>
                </Link>
              )}
            </div>
          </div>

          {/* Rejection notice if any */}
          {request.status === 'REJECTED' && (
            <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', padding: '14px', borderRadius: '8px', color: '#DC2626', fontSize: '13px', marginBottom: '20px' }}>
              <strong>Rejection Reason from Blood Bank:</strong> {request.rejection_reason || 'Stock depletion.'}
            </div>
          )}

          {/* Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '24px', borderTop: '1px solid #E2E8F0', paddingTop: '24px' }}>
            {/* Column 1: Medical Payload */}
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '12px' }}>
                Requested Blood Product
              </h3>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#124676', marginBottom: '4px' }}>
                {request.blood_group} &bull; {request.blood_component}
              </div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#152238', marginBottom: '12px' }}>
                Quantity: {request.quantity} {request.unit}
              </div>
              <div style={{ fontSize: '13px', color: '#64748B' }}>
                Patient Reference: <strong>{request.patient_reference}</strong>
              </div>
              <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
                Required-by Deadline: <strong>{new Date(request.required_by_time).toLocaleString()}</strong>
              </div>
            </div>

            {/* Column 2: Blood Bank */}
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '12px' }}>
                Target Blood Bank
              </h3>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#152238', marginBottom: '4px' }}>
                {request.blood_bank_name}
              </div>
              <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '6px' }}>
                {request.blood_bank_address}
              </div>
              <div style={{ fontSize: '13px', color: '#16A34A', fontWeight: '600' }}>
                Phone: {request.blood_bank_phone}
              </div>
              <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
                Email: {request.blood_bank_email}
              </div>
            </div>

            {/* Column 3: Custody & Receiver */}
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#64748B', textTransform: 'uppercase', marginBottom: '12px' }}>
                Hospital Custody
              </h3>
              <div style={{ fontSize: '14px', color: '#152238', marginBottom: '4px' }}>
                Hospital Requester: <strong>{request.requested_by_name}</strong>
              </div>
              <div style={{ fontSize: '14px', color: '#152238', marginBottom: '4px' }}>
                Designated Receiver: <strong>{request.receiver_name}</strong>
              </div>
              <div style={{ fontSize: '13px', color: '#64748B' }}>
                Receiver Email: {request.receiver_email}
              </div>
              <div style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
                Receiver Phone: {request.receiver_phone || '+91-9876543211'}
              </div>
            </div>
          </div>
        </div>

        {/* Delivery & Telemetry Card */}
        {request.delivery_id && (
          <div className="card-light" style={{ padding: '28px', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#152238', marginBottom: '16px' }}>
              Autonomous Aerial Delivery Status
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '10px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase' }}>Delivery Reference</div>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#124676' }}>{request.delivery_reference}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase' }}>Drone Platform</div>
                <div style={{ fontSize: '15px', fontWeight: '700' }}>{request.drone_identifier}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase' }}>Flight Status</div>
                <span className={getStatusBadge(request.delivery_status)}>{request.delivery_status}</span>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase' }}>Flight ETA</div>
                <div style={{ fontSize: '15px', fontWeight: '800', color: '#D2252F' }}>{request.eta_minutes ?? 0} mins</div>
              </div>
            </div>
          </div>
        )}

        {/* Email Notification Logs */}
        <div className="card-light" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#152238', marginBottom: '16px' }}>
            Audited Email Notification History
          </h2>
          {emailLogs.length === 0 ? (
            <div style={{ color: '#64748B', fontSize: '13px' }}>
              No notification logs recorded for this recipient yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {emailLogs.map((log, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 14px',
                    backgroundColor: '#F8FAFC',
                    borderRadius: '8px',
                    fontSize: '13px'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: '600', color: '#152238' }}>{log.subject}</div>
                    <div style={{ fontSize: '11px', color: '#64748B' }}>To: {log.recipient_email} &bull; Template: {log.template_name}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="badge badge-delivered" style={{ fontSize: '11px' }}>{log.status}</span>
                    <div style={{ fontSize: '11px', color: '#94A3B8', marginTop: '2px' }}>{new Date(log.sent_at).toLocaleTimeString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
