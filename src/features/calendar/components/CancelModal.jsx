import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';

const CancelModal = ({ isOpen, onClose, onCancel, booking }) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onCancel(reason);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-[#111] rounded-2xl max-w-md w-full"
        >
          <div className="flex items-center justify-between p-6 border-b border-[#f4f2f4] dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center">
                <AlertTriangle size={16} className="text-red-500" />
              </div>
              <h2 className="text-base font-black uppercase tracking-wide">Cancel Booking</h2>
            </div>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-all">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {booking && (
              <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                <p className="text-sm font-black">{booking.clientName}</p>
                <p className="text-xs text-[#b1b1b1] font-bold mt-0.5">{booking.serviceTitle} · {booking.date} · {booking.startTime}</p>
              </div>
            )}

            <p className="text-sm text-[#b1b1b1]">
              This action will mark the booking as cancelled. Are you sure you want to proceed?
            </p>

            <div>
              <label className="block text-xs font-bold uppercase mb-1.5">Reason (optional)</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for cancellation..."
                rows={3}
                className="w-full px-3 py-2 border border-[#e6e4e6] dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] text-sm resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-[#e6e4e6] dark:border-white/10 rounded-xl font-bold uppercase text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                Go Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-bold uppercase text-sm hover:bg-red-600 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? 'Cancelling...' : 'Cancel Booking'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CancelModal;
