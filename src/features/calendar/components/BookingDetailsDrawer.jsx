import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, ChevronDown, ChevronUp, ChevronsRight } from 'lucide-react';
import clsx from 'clsx';
import { STATUS_LABELS, STATUS_COLORS } from '../config/statuses.js';
import { formatTimeLabel } from '../utils/slotGenerator.js';
import { BookingService } from '../../../api/services.js';

const toMinutes = (t) => {
    if (!t || !String(t).includes(':')) return null;
    const [h, m] = String(t).split(':').map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return h * 60 + m;
};

const toTimeLabel = (mins) => {
    const bounded = Math.max(0, Math.min(23 * 60 + 59, Number(mins) || 0));
    return `${String(Math.floor(bounded / 60)).padStart(2, '0')}:${String(bounded % 60).padStart(2, '0')}`;
};

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
    onBookingUpdated,
}) => {
    const [auditOpen, setAuditOpen] = useState(false);
    const [showExtend, setShowExtend] = useState(false);
    const [isExtending, setIsExtending] = useState(false);
    const [extendSuccess, setExtendSuccess] = useState('');
    const [extendError, setExtendError] = useState('');
    const [extendOverlapWarn, setExtendOverlapWarn] = useState(false);
    const [customEndTime, setCustomEndTime] = useState('');
    const [extendReason, setExtendReason] = useState('');
    const [currentBooking, setCurrentBooking] = useState(null);

    const activeBooking = currentBooking || booking;

    // Reset extend state when booking changes
    React.useEffect(() => {
        setCurrentBooking(null);
        setShowExtend(false);
        setExtendSuccess('');
        setExtendError('');
        setExtendOverlapWarn(false);
        setCustomEndTime('');
        setExtendReason('');
    }, [booking?.id]);

    const handleExtend = async (minutesToAdd) => {
        setExtendError('');
        setExtendSuccess('');
        setExtendOverlapWarn(false);
        setIsExtending(true);
        try {
            const startMins = toMinutes(activeBooking.startTime || activeBooking.time);
            const currentEndMins = toMinutes(activeBooking.endTime) ?? (startMins !== null ? startMins + (activeBooking.durationMinutes || 60) : null);
            const newEndMins = (currentEndMins ?? 0) + minutesToAdd;
            const newEndTime = toTimeLabel(newEndMins);
            const newDuration = startMins !== null ? newEndMins - startMins : activeBooking.durationMinutes;
            const result = await BookingService.extendBooking(activeBooking.id, {
                newEndTime,
                actor: 'staff',
                reason: extendReason,
            });
            const updated = { ...activeBooking, endTime: newEndTime, durationMinutes: newDuration };
            setCurrentBooking(updated);
            onBookingUpdated?.(updated);
            setExtendSuccess(`Extended to ${formatTimeLabel(newEndTime)}`);
            if (result.hasOverlap) setExtendOverlapWarn(true);
            setExtendReason('');
        } catch (err) {
            setExtendError(err.message || 'Failed to extend booking');
        } finally {
            setIsExtending(false);
        }
    };

    const handleCustomExtend = async () => {
        if (!customEndTime) return;
        setExtendError('');
        setExtendSuccess('');
        setExtendOverlapWarn(false);
        setIsExtending(true);
        const startMins = toMinutes(activeBooking.startTime || activeBooking.time);
        const rawEndMins = toMinutes(customEndTime);
        if (rawEndMins === null || startMins === null || rawEndMins <= startMins) {
            setExtendError('New end time must be after booking start time');
            setIsExtending(false);
            return;
        }
        const snappedMins = Math.round(rawEndMins / 30) * 30;
        const snappedEnd = toTimeLabel(snappedMins);
        const newDuration = snappedMins - startMins;
        try {
            const result = await BookingService.extendBooking(activeBooking.id, {
                newEndTime: snappedEnd,
                actor: 'staff',
                reason: extendReason,
            });
            const updated = { ...activeBooking, endTime: snappedEnd, durationMinutes: newDuration };
            setCurrentBooking(updated);
            onBookingUpdated?.(updated);
            setExtendSuccess(`Extended to ${formatTimeLabel(snappedEnd)}`);
            if (result.hasOverlap) setExtendOverlapWarn(true);
            setCustomEndTime('');
            setExtendReason('');
        } catch (err) {
            setExtendError(err.message || 'Failed to extend booking');
        } finally {
            setIsExtending(false);
        }
    };

    if (!activeBooking) return null;

    const sc = STATUS_COLORS[activeBooking.status] || STATUS_COLORS.scheduled;
    const statusLabel = STATUS_LABELS[activeBooking.status] || activeBooking.status;

    const allAddons = [
        ...(activeBooking.selectedAddons || []),
        ...(activeBooking.customAddons || []),
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
                                <h2 className="text-base font-black uppercase tracking-tight truncate">{activeBooking.clientName}</h2>
                                <p className="text-xs text-[#b1b1b1] font-bold mt-0.5 truncate">{activeBooking.serviceTitle}</p>
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
                                <InfoRow label="Date" value={activeBooking.date} />
                                <InfoRow
                                    label="Time"
                                    value={
                                        (activeBooking.startTime || activeBooking.time) && activeBooking.endTime
                                            ? `${formatTimeLabel(activeBooking.startTime || activeBooking.time)} – ${formatTimeLabel(activeBooking.endTime)}`
                                            : formatTimeLabel(activeBooking.startTime || activeBooking.time)
                                    }
                                />
                                <InfoRow label="Duration" value={activeBooking.durationMinutes ? `${activeBooking.durationMinutes} min` : null} />
                                <InfoRow label="Service" value={activeBooking.serviceTitle} />
                                <InfoRow label="Category" value={activeBooking.category || activeBooking.serviceCategory} />
                                <InfoRow label="Staff" value={activeBooking.staffName} />
                                <InfoRow label="Contact" value={activeBooking.clientContact} />
                                <InfoRow label="Email" value={activeBooking.clientEmail} />
                                <InfoRow label="Source" value={activeBooking.bookingSource} />
                                <InfoRow
                                    label="Total"
                                    value={activeBooking.totalPrice != null ? `₱${Number(activeBooking.totalPrice).toLocaleString()}` : null}
                                />
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
                            {activeBooking.status === 'cancelled' && activeBooking.cancellationReason && (
                                <div className="p-3 bg-red-500/5 border border-red-500/20 rounded-xl">
                                    <p className="text-[9px] font-black uppercase text-red-500 mb-1">Cancellation Reason</p>
                                    <p className="text-xs text-[#b1b1b1]">{activeBooking.cancellationReason}</p>
                                </div>
                            )}

                            {/* Reschedule reason */}
                            {activeBooking.status === 'rescheduled' && activeBooking.rescheduleReason && (
                                <div className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-xl">
                                    <p className="text-[9px] font-black uppercase text-purple-500 mb-1">Reschedule Reason</p>
                                    <p className="text-xs text-[#b1b1b1]">{activeBooking.rescheduleReason}</p>
                                </div>
                            )}

                            {/* Actions */}
                            {activeBooking.status !== 'cancelled' && activeBooking.status !== 'completed' && (
                                <div>
                                    <h3 className="text-[9px] font-black uppercase tracking-[0.18em] text-[#b1b1b1] mb-3">Actions</h3>
                                    <div className="flex flex-col gap-2">
                                        {activeBooking.status !== 'cancelled' && activeBooking.status !== 'completed' && activeBooking.status !== 'pending_edit' && (
                                            <button
                                                onClick={() => onMarkPendingEdit?.(activeBooking)}
                                                className="w-full px-4 py-2.5 bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 rounded-xl font-bold uppercase text-xs hover:bg-green-500/20 transition-colors"
                                            >
                                                Mark as Pending Edit
                                            </button>
                                        )}

                                        {activeBooking.status === 'pending_edit' && (
                                            <button
                                                onClick={() => onComplete?.(activeBooking)}
                                                className="w-full px-4 py-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 rounded-xl font-bold uppercase text-xs hover:bg-emerald-500/20 transition-colors"
                                            >
                                                Google Drive Sent ✓
                                            </button>
                                        )}

                                        <button
                                            onClick={() => onReschedule?.(activeBooking)}
                                            className="w-full px-4 py-2.5 bg-purple-500/10 border border-purple-500/30 text-purple-600 dark:text-purple-400 rounded-xl font-bold uppercase text-xs hover:bg-purple-500/20 transition-colors"
                                        >
                                            {activeBooking.status === 'rescheduled' ? 'Reschedule Again' : 'Reschedule'}
                                        </button>

                                        <button
                                            onClick={() => onEdit?.(activeBooking)}
                                            className="w-full px-4 py-2.5 bg-[#f4f2f4] dark:bg-white/5 border border-[#e6e4e6] dark:border-white/10 rounded-xl font-bold uppercase text-xs hover:bg-[#e6e4e6] dark:hover:bg-white/10 transition-colors"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => onCancel?.(activeBooking)}
                                            className="w-full px-4 py-2.5 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 rounded-xl font-bold uppercase text-xs hover:bg-red-500/20 transition-colors"
                                        >
                                            Cancel Booking
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeBooking.status === 'completed' && (
                                <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl text-center">
                                    <p className="text-emerald-600 dark:text-emerald-400 font-black uppercase text-xs tracking-widest">✓ Completed</p>
                                    {activeBooking.completedAt && (
                                        <p className="text-[10px] text-[#b1b1b1] font-bold mt-1">{new Date(activeBooking.completedAt).toLocaleDateString()}</p>
                                    )}
                                </div>
                            )}

                            {activeBooking.status === 'cancelled' && (
                                <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl text-center">
                                    <p className="text-red-600 dark:text-red-400 font-black uppercase text-xs tracking-widest">✕ Cancelled</p>
                                </div>
                            )}

                            {/* Extend Booking (from PR #3) */}
                            {activeBooking.status !== 'cancelled' && activeBooking.status !== 'completed' && (
                                <div className="bg-white dark:bg-[#111] rounded-xl border border-[#f4f2f4] dark:border-white/10 overflow-hidden">
                                    <button
                                        type="button"
                                        onClick={() => setShowExtend((v) => !v)}
                                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-[#F26389]/10 flex items-center justify-center">
                                                <ChevronsRight size={16} className="text-[#F26389]" />
                                            </div>
                                            <span className="text-xs font-black uppercase tracking-wide">Extend Booking</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-[#b1b1b1] uppercase tracking-widest">
                                            {showExtend ? 'Hide' : 'Show'}
                                        </span>
                                    </button>

                                    {showExtend && (
                                        <div className="px-4 pb-4 space-y-3 border-t border-[#f4f2f4] dark:border-white/10 pt-3">
                                            {extendSuccess && (
                                                <div className="p-2 bg-green-500/10 border border-green-500/30 rounded-lg text-green-700 dark:text-green-400 text-xs font-bold">
                                                    ✓ {extendSuccess}
                                                </div>
                                            )}
                                            {extendOverlapWarn && (
                                                <div className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-700 dark:text-yellow-400 text-xs font-bold">
                                                    ⚠ This booking now overlaps with another booking.
                                                </div>
                                            )}
                                            {extendError && (
                                                <div className="p-2 bg-red-500/10 border border-red-500/30 rounded-lg text-red-600 text-xs font-bold">
                                                    {extendError}
                                                </div>
                                            )}

                                            <div className="flex gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => handleExtend(30)}
                                                    disabled={isExtending}
                                                    className="flex-1 py-2 border border-[#e6e4e6] dark:border-white/10 rounded-lg text-xs font-black uppercase tracking-wide hover:border-[#F26389] hover:text-[#F26389] disabled:opacity-50 transition-all"
                                                >
                                                    +30 min
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleExtend(60)}
                                                    disabled={isExtending}
                                                    className="flex-1 py-2 border border-[#e6e4e6] dark:border-white/10 rounded-lg text-xs font-black uppercase tracking-wide hover:border-[#F26389] hover:text-[#F26389] disabled:opacity-50 transition-all"
                                                >
                                                    +60 min
                                                </button>
                                            </div>

                                            <div className="flex gap-2">
                                                <input
                                                    type="time"
                                                    value={customEndTime}
                                                    step={1800}
                                                    onChange={(e) => setCustomEndTime(e.target.value)}
                                                    className="flex-1 h-9 px-3 bg-white dark:bg-[#0c0c0c] border border-[#e6e4e6] dark:border-white/10 rounded-lg text-xs font-bold outline-none focus:border-[#F26389] transition-all"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={handleCustomExtend}
                                                    disabled={isExtending || !customEndTime}
                                                    className="px-4 h-9 bg-[#F26389] text-white rounded-lg text-xs font-black uppercase tracking-wide disabled:opacity-50 hover:bg-[#BF637C] transition-colors"
                                                >
                                                    Set
                                                </button>
                                            </div>

                                            <input
                                                type="text"
                                                value={extendReason}
                                                onChange={(e) => setExtendReason(e.target.value)}
                                                placeholder="reason (optional)"
                                                className="w-full h-9 px-3 bg-white dark:bg-[#0c0c0c] border border-[#e6e4e6] dark:border-white/10 rounded-lg text-xs font-bold outline-none focus:border-[#F26389] transition-all placeholder:text-[#b1b1b1]"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Audit log */}
                            {activeBooking.auditLog?.length > 0 && (
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => setAuditOpen((v) => !v)}
                                        className="flex items-center justify-between w-full text-[9px] font-black uppercase tracking-[0.18em] text-[#b1b1b1] mb-2"
                                    >
                                        Audit Log ({activeBooking.auditLog.length})
                                        {auditOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                    </button>
                                    {auditOpen && (
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {[...activeBooking.auditLog].reverse().map((entry, i) => (
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
