import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';
import { STATUS_LABELS, STATUS_COLORS } from '../config/statuses.js';
import { formatTimeLabel } from '../utils/slotGenerator.js';

const InfoRow = ({ label, value }) => (
  value ? (
    <div className="flex items-start gap-3 py-2 border-b border-[#f4f2f4] dark:border-white/5 last:border-0">
      <span className="text-[9px] font-black uppercase tracking-[0.15em] text-[#b1b1b1] w-20 shrink-0 pt-0.5">{label}</span>
      <span className="text-xs font-bold text-[#2f3035] dark:text-white flex-1">{value}</span>
    </div>
  ) : null
);

const BookingDetailsDrawer = ({
  isOpen,
  onClose,
  booking,
  onEdit,
  onReschedule,
  onCancel,
  onMarkPendingEdit,
  onComplete,
}) => {
  const [auditOpen, setAuditOpen] = useState(false);

  if (!booking) return null;

  const sc = STATUS_COLORS[booking.status] || STATUS_COLORS.scheduled;
  const statusLabel = STATUS_LABELS[booking.status] || booking.status;

  const allAddons = [
    ...(booking.selectedAddons || []),
    ...(booking.customAddons || []),
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#fdfcfc] dark:bg-[#0d0d0d] shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-[#f4f2f4] dark:border-white/10 shrink-0">
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-black uppercase tracking-tight truncate">{booking.clientName}</h2>
                <p className="text-xs text-[#b1b1b1] font-bold mt-0.5 truncate">{booking.serviceTitle}</p>
                <div className={clsx('inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-[0.15em]', sc.bg, sc.text, sc.border)}>
                  <span className={clsx('w-1.5 h-1.5 rounded-full', sc.dot)} />
                  {statusLabel}
                </div>
              </div>
              <button onClick={onClose} className="ml-3 p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-all shrink-0">
                <X size={18} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-6">
              {/* Info grid */}
              <div>
                <h3 className="text-[9px] font-black uppercase tracking-[0.18em] text-[#b1b1b1] mb-3">Details</h3>
                <InfoRow label="Date" value={booking.date} />
                <InfoRow label="Time" value={`${formatTimeLabel(booking.startTime || booking.time)} – ${formatTimeLabel(booking.endTime)}`} />
                <InfoRow label="Duration" value={booking.durationMinutes ? `${booking.durationMinutes} min` : null} />
                <InfoRow label="Service" value={booking.serviceTitle} />
                <InfoRow label="Category" value={booking.category || booking.serviceCategory} />
                <InfoRow label="Staff" value={booking.staffName} />
                <InfoRow label="Contact" value={booking.clientContact} />
                <InfoRow label="Email" value={booking.clientEmail} />
                <InfoRow label="Source" value={booking.bookingSource} />
                <InfoRow label="Total" value={booking.totalPrice != null ? `₱${Number(booking.totalPrice).toLocaleString()}` : null} />
              </div>

              {/* Add-ons */}
              {allAddons.length > 0 && (
                <div>
                  <h3 className="text-[9px] font-black uppercase tracking-[0.18em] text-[#b1b1b1] mb-3">Add-ons</h3>
                  <div className="space-y-1.5">
                    {allAddons.map((a, i) => (
                      <div key={a.id || i} className="flex items-center justify-between text-xs py-1.5 border-b border-[#f4f2f4] dark:border-white/5 last:border-0">
                        <span className="font-bold">{a.name}</span>
                        <span className="text-[#F26389] font-black">+₱{Number(a.price || a.defaultPrice || 0).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cancellation reason */}
              {booking.status === 'cancelled' && booking.cancellationReason && (
                <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl">
                  <p className="text-[9px] font-black uppercase text-red-500 mb-1">Cancellation Reason</p>
                  <p className="text-xs text-[#b1b1b1]">{booking.cancellationReason}</p>
                </div>
              )}

              {/* Reschedule reason */}
              {booking.status === 'rescheduled' && booking.rescheduleReason && (
                <div className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-xl">
                  <p className="text-[9px] font-black uppercase text-purple-500 mb-1">Reschedule Reason</p>
                  <p className="text-xs text-[#b1b1b1]">{booking.rescheduleReason}</p>
                </div>
              )}

              {/* Actions */}
              {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                <div>
                  <h3 className="text-[9px] font-black uppercase tracking-[0.18em] text-[#b1b1b1] mb-3">Actions</h3>
                  <div className="flex flex-col gap-2">
                    {(booking.status === 'scheduled' || booking.status === 'rescheduled') && (
                      <button
                        onClick={() => onMarkPendingEdit?.(booking)}
                        className="w-full px-4 py-2.5 bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 rounded-xl font-bold uppercase text-xs hover:bg-amber-500/20 transition-colors"
                      >
                        Mark as Pending Edit
                      </button>
                    )}

                    {booking.status === 'pending_edit' && (
                      <button
                        onClick={() => onComplete?.(booking)}
                        className="w-full px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold uppercase text-xs hover:bg-emerald-500/20 transition-colors"
                      >
                        Google Drive Sent ✓
                      </button>
                    )}

                    <button
                      onClick={() => onReschedule?.(booking)}
                      className="w-full px-4 py-2.5 bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400 rounded-xl font-bold uppercase text-xs hover:bg-purple-500/20 transition-colors"
                    >
                      {booking.status === 'rescheduled' ? 'Reschedule Again' : 'Reschedule'}
                    </button>

                    {booking.status === 'scheduled' && (
                      <button
                        onClick={() => onEdit?.(booking)}
                        className="w-full px-4 py-2.5 bg-[#f4f2f4] dark:bg-white/5 border border-[#e6e4e6] dark:border-white/10 rounded-xl font-bold uppercase text-xs hover:bg-[#e6e4e6] dark:hover:bg-white/10 transition-colors"
                      >
                        Edit
                      </button>
                    )}

                    <button
                      onClick={() => onCancel?.(booking)}
                      className="w-full px-4 py-2.5 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-xl font-bold uppercase text-xs hover:bg-red-500/20 transition-colors"
                    >
                      Cancel Booking
                    </button>
                  </div>
                </div>
              )}

              {booking.status === 'completed' && (
                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-center">
                  <p className="text-emerald-600 dark:text-emerald-400 font-black uppercase text-xs tracking-widest">✓ Completed</p>
                  {booking.completedAt && (
                    <p className="text-[10px] text-[#b1b1b1] font-bold mt-1">{new Date(booking.completedAt).toLocaleDateString()}</p>
                  )}
                </div>
              )}

              {booking.status === 'cancelled' && (
                <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl text-center">
                  <p className="text-red-600 dark:text-red-400 font-black uppercase text-xs tracking-widest">✕ Cancelled</p>
                </div>
              )}

              {/* Audit log */}
              {booking.auditLog?.length > 0 && (
                <div>
                  <button
                    type="button"
                    onClick={() => setAuditOpen((v) => !v)}
                    className="flex items-center justify-between w-full text-[9px] font-black uppercase tracking-[0.18em] text-[#b1b1b1] mb-2"
                  >
                    Audit Log ({booking.auditLog.length})
                    {auditOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                  </button>
                  {auditOpen && (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {[...booking.auditLog].reverse().map((entry, i) => (
                        <div key={i} className="p-2.5 bg-[#f4f2f4] dark:bg-white/5 rounded-lg">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[9px] font-black uppercase tracking-widest text-[#F26389]">{entry.action}</span>
                            <span className="text-[8px] text-[#b1b1b1] font-bold">
                              {entry.timestamp ? new Date(entry.timestamp).toLocaleString() : ''}
                            </span>
                          </div>
                          {entry.reason && <p className="text-[9px] text-[#b1b1b1]">{entry.reason}</p>}
                          {entry.staffName && <p className="text-[9px] text-[#b1b1b1]">Staff: {entry.staffName}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BookingDetailsDrawer;
