import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Check,
  X,
  Plane,
  Eye,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Package,
} from 'lucide-react';
import { useRequestStore } from '../store/useRequestStore';
import { useDroneStore } from '../store/useDroneStore';
import { useDeliveryStore } from '../store/useDeliveryStore';
import { useInventoryStore } from '../store/useInventoryStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { useAuthStore } from '../store/useAuthStore';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';

export default function BloodRequestsPage() {
  const navigate = useNavigate();
  const { role } = useAuthStore();
  const { requests, approveRequest, prepareRequest, dispatchRequest, rejectRequest } = useRequestStore();
  const drones = useDroneStore((state) => state.drones);
  const createDelivery = useDeliveryStore((state) => state.createDelivery);
  const reserveUnits = useInventoryStore((state) => state.reserveUnits);
  const addNotification = useNotificationStore((state) => state.addNotification);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Modals state
  const [selectedReq, setSelectedReq] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDispatchOpen, setIsDispatchOpen] = useState(false);
  const [dispatchReq, setDispatchReq] = useState(null);
  const [selectedDroneId, setSelectedDroneId] = useState(drones.find((d) => d.status === 'IDLE')?.id || drones[0]?.id);

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.id.toLowerCase().includes(search.toLowerCase()) ||
      req.patientId.toLowerCase().includes(search.toLowerCase()) ||
      req.hospitalName.toLowerCase().includes(search.toLowerCase()) ||
      req.bloodGroup.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || req.urgencyLevel === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleApprove = (req) => {
    approveRequest(req.id);
    reserveUnits(req.bloodGroup, req.units);
    addNotification({
      type: 'info',
      title: 'Blood Request Approved',
      message: `${req.id} approved. ${req.units} units of ${req.bloodGroup} reserved for ${req.hospitalName}.`,
      link: '/blood-requests',
    });
  };

  const handlePrepare = (req) => {
    prepareRequest(req.id);
    addNotification({
      type: 'info',
      title: 'Blood Packaging Underway',
      message: `${req.id} packaging sealed in temperature-controlled cold box.`,
      link: '/blood-requests',
    });
  };

  const handleOpenDispatch = (req) => {
    setDispatchReq(req);
    setIsDispatchOpen(true);
  };

  const handleConfirmDispatch = () => {
    if (!dispatchReq) return;
    const drone = drones.find((d) => d.id === selectedDroneId) || drones[0];

    const deliveryId = dispatchRequest(dispatchReq.id, drone.id, drone.code);

    // Create delivery record
    createDelivery({
      id: deliveryId,
      requestId: dispatchReq.id,
      bloodGroup: dispatchReq.bloodGroup,
      units: dispatchReq.units,
      component: dispatchReq.component,
      hospitalName: dispatchReq.hospitalName,
      droneId: drone.id,
      droneCode: drone.code,
      status: 'IN_TRANSIT',
      distanceKm: 4.8,
    });

    addNotification({
      type: 'drone',
      title: 'Emergency Drone Dispatched!',
      message: `${drone.code} launched carrying ${dispatchReq.bloodGroup} to ${dispatchReq.hospitalName}.`,
      link: '/drone-tracking',
    });

    setIsDispatchOpen(false);
  };

  const handleReject = (req) => {
    const reason = prompt('Please enter rejection rationale (e.g. stock exhausted, recipient transferred):') || 'Logistics constraint';
    rejectRequest(req.id, reason);
    addNotification({
      type: 'emergency',
      title: 'Blood Request Rejected',
      message: `${req.id} declined: ${reason}`,
      link: '/blood-requests',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Emergency Blood Requests
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review incoming hospital orders, approve allocations, and initiate drone launch procedures
          </p>
        </div>

        {role !== 'BLOOD_BANK' && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => navigate('/blood-requests/new')}
          >
            + Create Emergency Request
          </Button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-navy-900">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID, hospital, blood group, patient..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-xs font-medium text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-navy-950 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-navy-950 dark:text-slate-200"
          >
            <option value="ALL">All Priorities</option>
            <option value="Critical">🔴 Critical</option>
            <option value="Urgent">🟠 Urgent</option>
            <option value="Normal">🟢 Normal</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none dark:border-slate-700 dark:bg-navy-950 dark:text-slate-200"
          >
            <option value="ALL">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Preparing">Preparing</option>
            <option value="Dispatched">Dispatched</option>
            <option value="Delivered">Delivered</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-navy-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70 font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-800/40">
                <th className="py-3 px-4">Request ID</th>
                <th className="py-3 px-4">Blood Group</th>
                <th className="py-3 px-4">Units</th>
                <th className="py-3 px-4">Hospital</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Time Window</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRequests.map((req) => (
                <tr
                  key={req.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-slate-900 dark:text-white">
                      {req.id}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {req.patientId}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center justify-center rounded-md bg-red-50 text-red-700 border border-red-200 font-black px-2 py-0.5 text-xs dark:bg-red-950/60 dark:text-red-400 dark:border-red-900/50">
                      {req.bloodGroup}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                    {req.units} Units
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {req.hospitalName}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[180px]">
                      {req.deliveryLocation}
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge
                      variant={
                        req.urgencyLevel === 'Critical'
                          ? 'critical'
                          : req.urgencyLevel === 'Urgent'
                          ? 'urgent'
                          : 'safe'
                      }
                      dot
                    >
                      {req.urgencyLevel}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{req.requiredMinutes} min max</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge
                      variant={
                        req.status === 'Dispatched'
                          ? 'in_transit'
                          : req.status === 'Preparing'
                          ? 'preparing'
                          : req.status === 'Approved'
                          ? 'approved'
                          : req.status === 'Delivered'
                          ? 'delivered'
                          : req.status === 'Rejected'
                          ? 'critical'
                          : 'pending'
                      }
                      dot
                    >
                      {req.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedReq(req);
                          setIsDetailOpen(true);
                        }}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* Approval action if Pending */}
                      {req.status === 'Pending' && role !== 'HOSPITAL' && (
                        <>
                          <button
                            onClick={() => handleApprove(req)}
                            className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                            title="Approve Request"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(req)}
                            className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                            title="Reject Request"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      )}

                      {/* Prepare action if Approved */}
                      {req.status === 'Approved' && role !== 'HOSPITAL' && (
                        <button
                          onClick={() => handlePrepare(req)}
                          className="rounded-lg px-2 py-1 bg-purple-50 text-purple-700 text-[11px] font-semibold hover:bg-purple-100 dark:bg-purple-950/60 dark:text-purple-300"
                        >
                          Prepare Box
                        </button>
                      )}

                      {/* Dispatch action if Preparing or Approved */}
                      {(req.status === 'Preparing' || req.status === 'Approved') && (
                        <button
                          onClick={() => handleOpenDispatch(req)}
                          className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 bg-sky-600 text-white text-[11px] font-semibold hover:bg-sky-700 shadow-xs"
                        >
                          <Plane className="w-3 h-3" />
                          Dispatch
                        </button>
                      )}

                      {/* Track Drone if Dispatched */}
                      {req.status === 'Dispatched' && (
                        <button
                          onClick={() => navigate('/drone-tracking')}
                          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 bg-brand-50 text-brand-700 text-[11px] font-semibold hover:bg-brand-100 dark:bg-brand-950/60 dark:text-brand-300"
                        >
                          <Plane className="w-3 h-3" />
                          Track Drone
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details View Modal */}
      <Modal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedReq ? `Request Details: ${selectedReq.id}` : ''}
        subtitle={selectedReq ? `Clinical Emergency Order • ${selectedReq.hospitalName}` : ''}
        maxWidth="max-w-lg"
      >
        {selectedReq && (
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Patient Identifier</span>
                <div className="font-mono font-bold text-slate-900 dark:text-white">{selectedReq.patientId}</div>
                <div className="text-[11px] text-slate-500">{selectedReq.patientName}</div>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-bold">Blood Requested</span>
                <div className="font-bold text-red-600 text-sm">{selectedReq.bloodGroup} • {selectedReq.units} Units</div>
                <div className="text-[11px] text-slate-500">{selectedReq.component}</div>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] uppercase font-bold">Clinical Notes</span>
              <p className="p-3 rounded-xl bg-slate-50 border border-slate-100 font-medium text-slate-700 dark:bg-navy-950 dark:border-slate-800 dark:text-slate-300">
                {selectedReq.notes || 'Emergency surgical trauma protocol active.'}
              </p>
            </div>

            {selectedReq.aiRecommendation && (
              <div className="p-3 rounded-xl bg-brand-50/70 border border-brand-200/80 dark:bg-brand-950/30 dark:border-brand-900/50">
                <div className="flex items-center gap-1.5 text-brand-700 dark:text-brand-400 font-bold mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Triage Evaluation ({selectedReq.aiScore}/100)</span>
                </div>
                <p className="text-slate-700 dark:text-slate-300 text-[11px]">
                  {selectedReq.aiRecommendation}
                </p>
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-slate-400">Attending Physician:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedReq.doctorInCharge}</span>
            </div>
          </div>
        )}
      </Modal>

      {/* Drone Assignment & Dispatch Modal */}
      <Modal
        isOpen={isDispatchOpen}
        onClose={() => setIsDispatchOpen(false)}
        title="Assign Drone & Authorize VTOL Dispatch"
        subtitle={dispatchReq ? `Mission for ${dispatchReq.hospitalName} • ${dispatchReq.bloodGroup} (${dispatchReq.units} Units)` : ''}
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Select an operational autonomous drone currently stationed at Central Blood Logistics Hub launchpad:
          </p>

          <div className="space-y-2">
            {drones.map((drone) => (
              <label
                key={drone.id}
                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedDroneId === drone.id
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 dark:border-brand-600'
                    : 'border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="droneSelect"
                    checked={selectedDroneId === drone.id}
                    onChange={() => setSelectedDroneId(drone.id)}
                    className="text-brand-600 focus:ring-brand-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">
                      {drone.code} ({drone.model})
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Battery: {drone.battery}% • Status: {drone.status}
                    </div>
                  </div>
                </div>

                <Badge variant={drone.status === 'IDLE' ? 'safe' : 'in_transit'} size="sm">
                  {drone.status === 'IDLE' ? 'Ready' : 'In Flight'}
                </Badge>
              </label>
            ))}
          </div>

          <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500 dark:bg-slate-800/40">
            ✈ Flight clearance will be automatically registered with FAA emergency medical corridor ATC.
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              className="w-full"
              icon={Plane}
              onClick={handleConfirmDispatch}
            >
              Authorize & Launch Drone
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
