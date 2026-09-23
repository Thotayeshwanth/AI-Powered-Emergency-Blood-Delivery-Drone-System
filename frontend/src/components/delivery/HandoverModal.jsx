import React, { useState } from 'react';
import { KeyRound, CheckCircle, ShieldCheck } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { useDeliveryStore } from '../../store/useDeliveryStore';
import { useNotificationStore } from '../../store/useNotificationStore';

export default function HandoverModal({ isOpen, onClose, delivery }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const verifyHandover = useDeliveryStore((state) => state.verifyHandover);
  const addNotification = useNotificationStore((state) => state.addNotification);

  if (!delivery) return null;

  const handleVerify = () => {
    setError('');
    const result = verifyHandover(delivery.id, pin);

    if (result.success) {
      setIsSuccess(true);
      addNotification({
        type: 'info',
        title: 'Delivery Handover Confirmed',
        message: `${delivery.id} confirmed delivered to ${delivery.hospitalName}. Container unlocked.`,
        link: `/deliveries/${delivery.id}`,
      });
      setTimeout(() => {
        setIsSuccess(false);
        setPin('');
        onClose();
      }, 1500);
    } else {
      setError(result.message);
    }
  };

  const fillTestPin = () => {
    setPin(delivery.verificationCode || '883921');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Secure Handover Verification"
      subtitle={`Mission ${delivery.id} • ${delivery.hospitalName}`}
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {isSuccess ? (
          <div className="py-6 text-center space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              Container Unlocked!
            </h4>
            <p className="text-xs text-slate-500">
              Handover logged with encrypted cryptographic signature. Biological payload released to hospital trauma staff.
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200/80 text-xs text-slate-600 dark:bg-slate-800/40 dark:border-slate-800 dark:text-slate-300">
              <p className="font-semibold text-slate-800 dark:text-white mb-1">
                Hospital Verification Protocol
              </p>
              Please enter the 6-digit security PIN provided on the trauma center receiving terminal to authenticate payload transfer.
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                6-Digit Security PIN
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="Enter 6-digit PIN"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-mono text-center text-lg tracking-widest text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 dark:border-slate-700 dark:bg-navy-950 dark:text-white"
                />
                <KeyRound className="absolute right-3.5 top-3.5 h-5 w-5 text-slate-400" />
              </div>

              {error && <p className="text-xs font-semibold text-red-600">{error}</p>}

              <button
                type="button"
                onClick={fillTestPin}
                className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                Auto-fill test PIN: ({delivery.verificationCode || '883921'})
              </button>
            </div>

            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                className="w-full"
                onClick={handleVerify}
                disabled={pin.length < 4}
              >
                Authenticate & Unlock Container
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
