import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit2, Calendar, Clock3, Package, DollarSign, AlertCircle, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { BookingService } from '../../api/services';

const HOURS = Array.from({ length: 16 }, (_, i) => String(i + 6).padStart(2, '0'));
const MINUTES = ['00', '30'];

export const ViewBookingModal = ({ isOpen, onClose, booking, onEdit, onDeleted }) => {
    const [actionError, setActionError] = useState('');
    const [isBusy, setIsBusy] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [showReschedule, setShowReschedule] = useState(false);
    const [rescheduleDate, setRescheduleDate] = useState('');
    const [rescheduleHour, setRescheduleHour] = useState('09');
    const [rescheduleMinute, setRescheduleMinute] = useState('00');
    const [rescheduleEndHour, setRescheduleEndHour] = useState('10');
    const [rescheduleEndMinute, setRescheduleEndMinute] = useState('00');
    const [rescheduleReason, setRescheduleReason] = useState('');
    const [showExtend, setShowExtend] = useState(false);
    const [extendMinutes, setExtendMinutes] = useState(30);
    const [showPendingEdit, setShowPendingEdit] = useState(false);
    const [pendingEditReason, setPendingEditReason] = useState('');

    if (!booking) return null;

    const allAddons = [...(booking.selectedAddons || []), ...(booking.customAddons || [])];
    const total = booking.totalPrice || 0;
    const isCancelled = ['Cancelled', 'cancelled'].includes(booking.status);

    const resetActions = () => {
        setShowCancelConfirm(false);
        setShowReschedule(false);
        setShowExtend(false);
        setShowPendingEdit(false);
        setCancelReason('');
        setRescheduleDate('');
        setRescheduleReason('');
        setPendingEditReason('');
        setActionError('');
        setExtendMinutes(30);
    };

    const withBusy = async (fn) => {
        setActionError('');
        setIsBusy(true);
        try {
            await fn();
        } catch (err) {
            setActionError(err.message || 'Action failed');
        } finally {
            setIsBusy(false);
        }
    };

    const handleCancel = () => withBusy(async () => {
        await BookingService.cancelBooking(booking.id, cancelReason);
        onDeleted?.();
        onClose();
    });

    const handleMarkPendingEdit = () => withBusy(async () => {
        await BookingService.markPendingEdit(booking.id, pendingEditReason);
        onDeleted?.();
        onClose();
    });

    const handleReschedule = () => withBusy(async () => {
        if (!rescheduleDate) throw new Error('Please enter a new date.');
        await BookingService.rescheduleBooking(booking.id, {
            newDate: rescheduleDate,
            newStartTime: `${rescheduleHour}:${rescheduleMinute}`,
            newEndTime: `${rescheduleEndHour}:${rescheduleEndMinute}`,
            reason: rescheduleReason,
        });
        onDeleted?.();
        onClose();
    });

    const handleExtend = () => withBusy(async () => {
        const mins = Number(extendMinutes);
        if (!mins || mins < 5) throw new Error('Enter at least 5 minutes to extend.');
        await BookingService.extendBooking(booking.id, mins);
        onDeleted?.();
        onClose();
    });

    const statusColor =
        ['Confirmed', 'confirmed', 'scheduled'].includes(booking.status) ? 'text-green-600'
        : ['Cancelled', 'cancelled'].includes(booking.status) ? 'text-red-600'
        : booking.status === 'pending_edit' ? 'text-amber-600'
        : booking.status === 'rescheduled' ? 'text-purple-600'
        : 'text-[#F26389]';

    const sectionCls = 'bg-[#fdfcfc] dark:bg-[#0c0c0c] rounded-xl p-4 border border-[#f4f2f4] dark:border-white/10';
    const rowCls = 'flex justify-between text-xs py-1 border-b border-[#f4f2f4] dark:border-white/5 last:border-0';
    const labelCls = 'text-[#b1b1b1]';

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 z-40"
                    />
                    <motion.div
                        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#fdfcfc] dark:bg-[#0d0d0d] shadow-2xl z-50 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-start justify-between p-6 border-b border-[#f4f2f4] dark:border-white/10 shrink-0">
                            <div className="flex-1 min-w-0">
                                <h2 className="text-base font-black uppercase tracking-tight truncate">{booking.clientName}</h2>
                                <p className="text-xs text-[#b1b1b1] font-bold mt-0.5 truncate">{booking.serviceTitle}</p>
                                <p className={`text-xs font-black mt-1 uppercase tracking-widest ${statusColor}`}>{booking.status}</p>
                            </div>
                            <button onClick={onClose} className="ml-3 p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-all shrink-0">
                                <X size={18} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {actionError && (
                                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 text-xs font-bold">
                                    {actionError}
                                </div>
                            )}

                            {/* Client */}
                            <div className={sectionCls}>
                                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[#b1b1b1] mb-3">Client</p>
                                {booking.clientName && <div className={rowCls}><span className={labelCls}>Name</span><span className="font-bold">{booking.clientName}</span></div>}
                                {booking.clientContact && <div className={rowCls}><span className={labelCls}>Contact</span><span className="font-bold">{booking.clientContact}</span></div>}
                                {booking.clientEmail && <div className={rowCls}><span className={labelCls}>Email</span><span className="font-bold">{booking.clientEmail}</span></div>}
                                {booking.bookingSource && <div className={rowCls}><span className={labelCls}>Via</span><span className="font-bold">{booking.bookingSource}</span></div>}
                            </div>

                            {/* Service & Schedule */}
                            <div className={sectionCls}>
                                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[#b1b1b1] mb-3">Service &amp; Schedule</p>
                                {booking.serviceTitle && <div className={rowCls}><span className={labelCls}>Service</span><span className="font-bold">{booking.serviceTitle}</span></div>}
                                {booking.date && <div className={rowCls}><span className={labelCls}>Date</span><span className="font-bold">{booking.date}</span></div>}
                                <div className={rowCls}><span className={labelCls}>Time</span><span className="font-bold">{booking.startTime || booking.time} – {booking.endTime || 'N/A'}</span></div>
                                {booking.durationMinutes && <div className={rowCls}><span className={labelCls}>Duration</span><span className="font-bold">{booking.durationMinutes} min</span></div>}
                                {booking.staffName && <div className={rowCls}><span className={labelCls}>Staff</span><span className="font-bold">{booking.staffName}</span></div>}
                            </div>

                            {/* Add-ons */}
                            {allAddons.length > 0 && (
                                <div className={sectionCls}>
                                    <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[#b1b1b1] mb-3">Add-ons</p>
                                    {allAddons.map((a, i) => (
                                        <div key={a.id || i} className={rowCls}>
                                            <span className={labelCls}>{a.name}{a.type === 'custom' ? ' (Custom)' : ''}</span>
                                            <span className="font-bold text-[#F26389]">+₱{(a.price || a.defaultPrice || 0).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Total */}
                            <div className="bg-[#F26389]/10 rounded-xl p-4 border border-[#F26389]/20 flex justify-between items-center">
                                <span className="text-sm font-black uppercase tracking-wide">Total</span>
                                <span className="text-2xl font-black text-[#F26389]">₱{total.toLocaleString()}</span>
                            </div>

                            {/* Actions */}
                            {!isCancelled && (
                                <div className="space-y-2 pt-2">
                                    <p className="text-[9px] font-black uppercase tracking-[0.18em] text-[#b1b1b1]">Actions</p>

                                    {/* Edit */}
                                    <button
                                        onClick={() => { onEdit?.(booking); onClose(); }}
                                        className="w-full flex items-center gap-2 px-4 py-2.5 bg-[#F26389] text-white rounded-xl font-bold uppercase text-xs hover:bg-[#BF637C] transition-colors"
                                    >
                                        <Edit2 size={14} /> Edit Booking
                                    </button>

                                    {/* Mark as Pending Edit */}
                                    <button
                                        onClick={() => { resetActions(); setShowPendingEdit((v) => !v); }}
                                        className="w-full flex items-center justify-between gap-2 px-4 py-2.5 border border-amber-400/50 text-amber-600 dark:text-amber-400 rounded-xl font-bold uppercase text-xs hover:bg-amber-400/10 transition-colors"
                                    >
                                        <span className="flex items-center gap-2"><AlertCircle size={14} /> Mark as Pending Edit</span>
                                        {showPendingEdit ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                    </button>
                                    <AnimatePresence>
                                        {showPendingEdit && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                                <div className="p-3 bg-amber-500/5 border border-amber-400/20 rounded-xl space-y-2">
                                                    <input value={pendingEditReason} onChange={(e) => setPendingEditReason(e.target.value)} placeholder="Reason (optional)" className="w-full px-3 py-2 border border-[#e6e4e6] dark:border-white/10 rounded-lg text-xs bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-amber-400" />
                                                    <button onClick={handleMarkPendingEdit} disabled={isBusy} className="w-full px-3 py-2 bg-amber-500 text-white rounded-lg font-bold uppercase text-xs disabled:opacity-50">
                                                        {isBusy ? 'Saving...' : 'Confirm'}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Reschedule */}
                                    <button
                                        onClick={() => { resetActions(); setShowReschedule((v) => !v); }}
                                        className="w-full flex items-center justify-between gap-2 px-4 py-2.5 border border-purple-400/50 text-purple-600 dark:text-purple-400 rounded-xl font-bold uppercase text-xs hover:bg-purple-400/10 transition-colors"
                                    >
                                        <span className="flex items-center gap-2"><Calendar size={14} /> Reschedule</span>
                                        {showReschedule ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                    </button>
                                    <AnimatePresence>
                                        {showReschedule && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                                <div className="p-3 bg-purple-500/5 border border-purple-400/20 rounded-xl space-y-2">
                                                    <input type="date" value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} className="w-full px-3 py-2 border border-[#e6e4e6] dark:border-white/10 rounded-lg text-xs bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-purple-400" />
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <p className="text-[10px] font-bold uppercase text-[#b1b1b1] mb-1">Start</p>
                                                            <div className="flex gap-1">
                                                                <select value={rescheduleHour} onChange={(e) => setRescheduleHour(e.target.value)} className="flex-1 px-2 py-1.5 border border-[#e6e4e6] dark:border-white/10 rounded-lg text-xs bg-white dark:bg-[#0c0c0c] focus:outline-none">{HOURS.map((h) => <option key={h} value={h}>{h}</option>)}</select>
                                                                <select value={rescheduleMinute} onChange={(e) => setRescheduleMinute(e.target.value)} className="w-14 px-2 py-1.5 border border-[#e6e4e6] dark:border-white/10 rounded-lg text-xs bg-white dark:bg-[#0c0c0c] focus:outline-none">{MINUTES.map((m) => <option key={m} value={m}>{m}</option>)}</select>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-bold uppercase text-[#b1b1b1] mb-1">End</p>
                                                            <div className="flex gap-1">
                                                                <select value={rescheduleEndHour} onChange={(e) => setRescheduleEndHour(e.target.value)} className="flex-1 px-2 py-1.5 border border-[#e6e4e6] dark:border-white/10 rounded-lg text-xs bg-white dark:bg-[#0c0c0c] focus:outline-none">{HOURS.map((h) => <option key={h} value={h}>{h}</option>)}</select>
                                                                <select value={rescheduleEndMinute} onChange={(e) => setRescheduleEndMinute(e.target.value)} className="w-14 px-2 py-1.5 border border-[#e6e4e6] dark:border-white/10 rounded-lg text-xs bg-white dark:bg-[#0c0c0c] focus:outline-none">{MINUTES.map((m) => <option key={m} value={m}>{m}</option>)}</select>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <input value={rescheduleReason} onChange={(e) => setRescheduleReason(e.target.value)} placeholder="Reason (optional)" className="w-full px-3 py-2 border border-[#e6e4e6] dark:border-white/10 rounded-lg text-xs bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-purple-400" />
                                                    <button onClick={handleReschedule} disabled={isBusy} className="w-full px-3 py-2 bg-purple-600 text-white rounded-lg font-bold uppercase text-xs disabled:opacity-50">
                                                        {isBusy ? 'Saving...' : 'Confirm Reschedule'}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Extend */}
                                    <button
                                        onClick={() => { resetActions(); setShowExtend((v) => !v); }}
                                        className="w-full flex items-center justify-between gap-2 px-4 py-2.5 border border-blue-400/50 text-blue-600 dark:text-blue-400 rounded-xl font-bold uppercase text-xs hover:bg-blue-400/10 transition-colors"
                                    >
                                        <span className="flex items-center gap-2"><Clock3 size={14} /> Extend Booking</span>
                                        {showExtend ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                    </button>
                                    <AnimatePresence>
                                        {showExtend && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                                <div className="p-3 bg-blue-500/5 border border-blue-400/20 rounded-xl space-y-2">
                                                    <div className="flex items-center gap-2">
                                                        <input type="number" min="5" step="5" value={extendMinutes} onChange={(e) => setExtendMinutes(Number(e.target.value) || 30)} className="flex-1 px-3 py-2 border border-[#e6e4e6] dark:border-white/10 rounded-lg text-xs bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-blue-400" />
                                                        <span className="text-xs font-bold text-[#b1b1b1]">min</span>
                                                    </div>
                                                    <button onClick={handleExtend} disabled={isBusy} className="w-full px-3 py-2 bg-blue-600 text-white rounded-lg font-bold uppercase text-xs disabled:opacity-50">
                                                        {isBusy ? 'Saving...' : 'Extend'}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Cancel */}
                                    <button
                                        onClick={() => { resetActions(); setShowCancelConfirm((v) => !v); }}
                                        className="w-full flex items-center justify-between gap-2 px-4 py-2.5 border border-red-400/50 text-red-600 dark:text-red-400 rounded-xl font-bold uppercase text-xs hover:bg-red-400/10 transition-colors"
                                    >
                                        <span className="flex items-center gap-2"><RotateCcw size={14} /> Cancel Booking</span>
                                        {showCancelConfirm ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                    </button>
                                    <AnimatePresence>
                                        {showCancelConfirm && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                                <div className="p-3 bg-red-500/5 border border-red-400/20 rounded-xl space-y-2">
                                                    <p className="text-xs text-[#b1b1b1]">Marks the booking as cancelled (not deleted).</p>
                                                    <input value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} placeholder="Cancellation reason (optional)" className="w-full px-3 py-2 border border-[#e6e4e6] dark:border-white/10 rounded-lg text-xs bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-red-400" />
                                                    <button onClick={handleCancel} disabled={isBusy} className="w-full px-3 py-2 bg-red-600 text-white rounded-lg font-bold uppercase text-xs disabled:opacity-50">
                                                        {isBusy ? 'Cancelling...' : 'Confirm Cancel'}
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )}

                            {isCancelled && (
                                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-600 font-bold">
                                    This booking has been cancelled.
                                    {booking.cancellationReason && <p className="mt-1 font-normal text-[#b1b1b1]">Reason: {booking.cancellationReason}</p>}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default ViewBookingModal;
