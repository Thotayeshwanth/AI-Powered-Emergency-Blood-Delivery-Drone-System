import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldAlert,
  Building2,
  HeartPulse,
  Navigation,
} from 'lucide-react';
import { HOSPITALS } from '../data/hospitals';
import { useRequestStore } from '../store/useRequestStore';
import { useNotificationStore } from '../store/useNotificationStore';
import { aiPriorityService } from '../services/aiPriorityService';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

export default function NewBloodRequestPage() {
  const navigate = useNavigate();
  const addRequest = useRequestStore((state) => state.addRequest);
  const addNotification = useNotificationStore((state) => state.addNotification);

  // Form state
  const [patientId, setPatientId] = useState('PT-88102');
  const [patientName, setPatientName] = useState('Emergency Trauma Bay 1');
  const [bloodGroup, setBloodGroup] = useState('O-');
  const [component, setComponent] = useState('Packed Red Blood Cells (PRBC)');
  const [units, setUnits] = useState(2);
  const [hospitalId, setHospitalId] = useState(HOSPITALS[0].id);
  const [deliveryLocation, setDeliveryLocation] = useState('Rooftop Helipad Trauma Elevator 2');
  const [urgencyLevel, setUrgencyLevel] = useState('Critical');
  const [requiredMinutes, setRequiredMinutes] = useState(20);
  const [clinicalNotes, setClinicalNotes] = useState('Acute hemorrhagic shock, ongoing surgical resuscitation.');

  // AI Evaluation state
  const [aiEval, setAiEval] = useState(null);
  const [isEvaluatingAI, setIsEvaluatingAI] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState(null);
  const [errors, setErrors] = useState({});

  // Dynamic AI evaluation update
  useEffect(() => {
    let isCurrent = true;
    const runAI = async () => {
      setIsEvaluatingAI(true);
      const selectedHosp = HOSPITALS.find((h) => h.id === hospitalId);
      const res = await aiPriorityService.evaluateEmergencyPriority({
        bloodGroup,
        units,
        urgencyLevel,
        requiredMinutes,
        hospitalDistanceKm: selectedHosp?.distanceKm || 5,
        clinicalNotes,
      });
      if (isCurrent) {
        setAiEval(res);
        setIsEvaluatingAI(false);
      }
    };
    runAI();
    return () => {
      isCurrent = false;
    };
  }, [bloodGroup, units, urgencyLevel, requiredMinutes, hospitalId, clinicalNotes]);

  const validate = () => {
    const errs = {};
    if (!patientId.trim()) errs.patientId = 'Patient ID is required';
    if (!units || units < 1 || units > 10) errs.units = 'Units must be between 1 and 10';
    if (!requiredMinutes || requiredMinutes < 5) errs.requiredMinutes = 'Minimum time window is 5 minutes';
    if (!deliveryLocation.trim()) errs.deliveryLocation = 'Specific delivery location/helipad required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const selectedHosp = HOSPITALS.find((h) => h.id === hospitalId);

    const newReq = addRequest({
      patientId,
      patientName,
      bloodGroup,
      component,
      units: Number(units),
      hospitalId,
      hospitalName: selectedHosp?.name || 'City Care Hospital',
      deliveryLocation,
      urgencyLevel,
      requiredMinutes: Number(requiredMinutes),
      doctorInCharge: 'Dr. Sarah Chen, MD',
      notes: clinicalNotes,
      aiScore: aiEval?.score || 85,
      aiRecommendation: aiEval?.recommendation || 'Priority drone routing recommended.',
    });

    addNotification({
      type: urgencyLevel === 'Critical' ? 'emergency' : 'info',
      title: `Emergency Blood Request Filed: ${newReq.id}`,
      message: `${bloodGroup} (${units} Units) requested for ${selectedHosp?.name} within ${requiredMinutes} mins.`,
      link: '/blood-requests',
    });

    setIsSubmitting(false);
    setSubmittedRequest(newReq);
  };

  if (submittedRequest) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl text-center space-y-6 dark:border-slate-800 dark:bg-navy-900">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">
              ✓ Blood Request Submitted Successfully
            </h2>
            <p className="text-xs text-slate-500">
              Dispatched to Regional Central Blood Hub and Autonomous Drone Operations Fleet
            </p>
          </div>

          <div className="rounded-2xl bg-slate-50 p-6 border border-slate-200/80 text-left space-y-3 dark:bg-slate-800/40 dark:border-slate-800">
            <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500">Request ID</span>
              <span className="font-mono text-sm font-black text-slate-900 dark:text-white">
                {submittedRequest.id}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Status</span>
              <Badge variant="warning" dot>Pending Approval</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Blood Group & Volume</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                {submittedRequest.bloodGroup} • {submittedRequest.units} Units ({submittedRequest.component})
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Hospital Helipad</span>
              <span className="text-xs font-semibold text-slate-900 dark:text-white">
                {submittedRequest.hospitalName} ({submittedRequest.deliveryLocation})
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Emergency Window</span>
              <span className="text-xs font-bold text-red-600">
                {submittedRequest.requiredMinutes} minutes
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              variant="primary"
              size="md"
              icon={ArrowRight}
              onClick={() => navigate('/blood-requests')}
            >
              Track in Requests Queue
            </Button>
            <Button
              variant="outline"
              size="md"
              onClick={() => {
                setSubmittedRequest(null);
                setPatientId(`PT-${Math.floor(10000 + Math.random() * 90000)}`);
              }}
            >
              Submit Another Request
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          Emergency Blood Delivery Request
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Initiate an automated cross-match and rapid drone airlift order for critical trauma situations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Request Form */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-navy-900">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Patient & Hospital Group */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Patient Medical ID *
                </label>
                <input
                  type="text"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  placeholder="e.g. PT-99420"
                  className={`w-full rounded-xl border px-3.5 py-2 text-xs font-mono text-slate-900 focus:outline-none dark:bg-navy-950 dark:text-white ${
                    errors.patientId ? 'border-red-500' : 'border-slate-300 dark:border-slate-700 focus:border-brand-500'
                  }`}
                />
                {errors.patientId && <p className="text-[11px] text-red-600 mt-1">{errors.patientId}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Receiving Hospital *
                </label>
                <select
                  value={hospitalId}
                  onChange={(e) => {
                    setHospitalId(e.target.value);
                    const hosp = HOSPITALS.find((h) => h.id === e.target.value);
                    if (hosp) setDeliveryLocation(hosp.helipad);
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-navy-950 dark:text-white"
                >
                  {HOSPITALS.map((hosp) => (
                    <option key={hosp.id} value={hosp.id}>
                      {hosp.name} ({hosp.traumaLevel})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Blood Group & Component */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Blood Group *
                </label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-navy-950 dark:text-white"
                >
                  {['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'].map((group) => (
                    <option key={group} value={group}>
                      {group} {group === 'O-' ? '(Universal Donor)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Blood Component *
                </label>
                <select
                  value={component}
                  onChange={(e) => setComponent(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-navy-950 dark:text-white"
                >
                  <option value="Packed Red Blood Cells (PRBC)">Packed Red Blood Cells (PRBC)</option>
                  <option value="Whole Blood">Whole Blood</option>
                  <option value="Platelets (Single Donor)">Platelets (Single Donor)</option>
                  <option value="Fresh Frozen Plasma (FFP)">Fresh Frozen Plasma (FFP)</option>
                  <option value="Cryoprecipitate">Cryoprecipitate</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Required Units *
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-bold text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-navy-950 dark:text-white"
                />
                {errors.units && <p className="text-[11px] text-red-600 mt-1">{errors.units}</p>}
              </div>
            </div>

            {/* Delivery Location & Required Time Window */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Delivery Location / Helipad Landing Pad *
                </label>
                <input
                  type="text"
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  placeholder="e.g. Rooftop Helipad Trauma Elevator 2"
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-navy-950 dark:text-white"
                />
                {errors.deliveryLocation && <p className="text-[11px] text-red-600 mt-1">{errors.deliveryLocation}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Required Maximum Arrival Window (Minutes) *
                </label>
                <input
                  type="number"
                  min="5"
                  max="240"
                  value={requiredMinutes}
                  onChange={(e) => setRequiredMinutes(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-mono font-bold text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-navy-950 dark:text-white"
                />
                {errors.requiredMinutes && <p className="text-[11px] text-red-600 mt-1">{errors.requiredMinutes}</p>}
              </div>
            </div>

            {/* Emergency Level Radio Pills */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Emergency Priority Level *
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setUrgencyLevel('Critical')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                    urgencyLevel === 'Critical'
                      ? 'border-red-500 bg-red-50 text-red-700 ring-2 ring-red-500/20 dark:bg-red-950/40 dark:text-red-300 dark:border-red-600'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-red-600 animate-ping-slow" />
                  <span>🔴 Critical</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUrgencyLevel('Urgent')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                    urgencyLevel === 'Urgent'
                      ? 'border-amber-500 bg-amber-50 text-amber-700 ring-2 ring-amber-500/20 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-600'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span>🟠 Urgent</span>
                </button>

                <button
                  type="button"
                  onClick={() => setUrgencyLevel('Normal')}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-xs font-bold transition-all ${
                    urgencyLevel === 'Normal'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-600'
                      : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>🟢 Normal</span>
                </button>
              </div>
            </div>

            {/* Clinical Indications */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Clinical Diagnosis / Trauma Notes
              </label>
              <textarea
                rows={3}
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                placeholder="Include acute indications (e.g. hemorrhage, ruptured spleen, massive transfusion protocol)"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-medium text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-navy-950 dark:text-white"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="danger"
                size="lg"
                className="w-full"
                isLoading={isSubmitting}
                icon={ShieldAlert}
              >
                Submit Emergency Request
              </Button>
            </div>
          </form>
        </div>

        {/* AI Priority & Route Recommendation Engine Panel */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-brand-200 bg-gradient-to-b from-brand-50/50 to-white p-5 shadow-sm dark:border-brand-900/60 dark:bg-gradient-to-b dark:from-brand-950/40 dark:to-navy-900">
            <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400 mb-3">
              <Sparkles className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider">
                AI Priority Engine
              </h3>
            </div>

            {aiEval ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-brand-100 pb-3 dark:border-brand-900/50">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      Triage Emergency Score
                    </span>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-3xl font-black font-mono text-brand-700 dark:text-brand-400">
                        {aiEval.score}
                      </span>
                      <span className="text-xs text-slate-400">/ 100</span>
                    </div>
                  </div>

                  <Badge
                    variant={
                      aiEval.recommendedPriority === 'Critical'
                        ? 'critical'
                        : aiEval.recommendedPriority === 'Urgent'
                        ? 'urgent'
                        : 'safe'
                    }
                    dot
                  >
                    AI Tier: {aiEval.recommendedPriority}
                  </Badge>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="rounded-xl bg-white p-3 border border-slate-100 dark:bg-navy-950/80 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Recommended Action
                    </span>
                    <p className="mt-1 font-semibold text-slate-800 dark:text-slate-200">
                      {aiEval.recommendation}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-3 border border-slate-100 dark:bg-navy-950/80 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Optimal Drone Match
                    </span>
                    <p className="mt-1 font-semibold text-brand-600 dark:text-brand-400">
                      {aiEval.optimalDroneType}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Estimated Flight Time: ~{aiEval.estimatedFlightMins} mins
                    </p>
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 text-[11px] text-slate-500 dark:bg-slate-800/40">
                  ⚡ Evaluated clinical urgency factors, blood group scarcity, and active weather corridor winds.
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">
                Evaluating parameters...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
