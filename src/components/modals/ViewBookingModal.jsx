import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit2, Trash2, Calendar, Clock, User, Package, DollarSign, ChevronsRight } from 'lucide-react';
import { BookingService } from '../../api/services';

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

export const ViewBookingModal = ({ isOpen, onClose, booking, onEdit, onDeleted }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState('');
    const [isExtending, setIsExtending] = useState(false);
    const [extendSuccess, setExtendSuccess] = useState('');
    const [extendError, setExtendError] = useState('');
    const [extendOverlapWarn, setExtendOverlapWarn] = useState(false);
    const [customEndTime, setCustomEndTime] = useState('');
    const [extendReason, setExtendReason] = useState('');
    const [showExtend, setShowExtend] = useState(false);
    const [currentBooking, setCurrentBooking] = useState(null);

    const activeBooking = currentBooking || booking;

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
            return;
        }

        setIsDeleting(true);
        setError('');

        try {
            await BookingService.deleteBooking(activeBooking.id);
            onDeleted?.();
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to cancel booking');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleExtend = async (minutesToAdd) => {
        setExtendError('');
        setExtendSuccess('');
        setExtendOverlapWarn(false);
        setIsExtending(true);

        try {
            const currentEnd = activeBooking.endTime;
            const startMins = toMinutes(activeBooking.startTime || activeBooking.time);
            const currentEndMins = toMinutes(currentEnd) ?? (startMins !== null ? startMins + (activeBooking.durationMinutes || 60) : null);
            const newEndMins = (currentEndMins ?? 0) + minutesToAdd;
            const newEndTime = toTimeLabel(newEndMins);
            const newDuration = startMins !== null ? newEndMins - startMins : activeBooking.durationMinutes;
            const result = await BookingService.extendBooking(activeBooking.id, {
                newEndTime,
                actor: 'staff',
                reason: extendReason
            });
            setCurrentBooking({ ...activeBooking, endTime: newEndTime, durationMinutes: newDuration });
            setExtendSuccess(`Extended to ${newEndTime}`);
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
        // Snap to 30-min increments
        const snappedMins = Math.round(rawEndMins / 30) * 30;
        const snappedEnd = toTimeLabel(snappedMins);
        const newDuration = snappedMins - startMins;

        try {
            const result = await BookingService.extendBooking(activeBooking.id, {
                newEndTime: snappedEnd,
                actor: 'staff',
                reason: extendReason
            });
            setCurrentBooking({ ...activeBooking, endTime: snappedEnd, durationMinutes: newDuration });
            setExtendSuccess(`Extended to ${snappedEnd}`);
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

    // Calculate total with addons
    const total = (activeBooking.totalPrice || 0);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={e => e.stopPropagation()}
                        className="bg-white dark:bg-[#111] rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-black uppercase tracking-wide">Booking Details</h2>
                            <button 
                                onClick={onClose} 
                                className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Booking Info */}
                        <div className="space-y-6">
                            {/* Client Information */}
                            <div className="bg-[#fdfcfc] dark:bg-[#0c0c0c] rounded-xl p-4 border border-[#f4f2f4] dark:border-white/10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#F26389]/10 flex items-center justify-center">
                                        <User size={20} className="text-[#F26389]" />
                                    </div>
                                    <h3 className="text-sm font-black uppercase tracking-wide">Client Information</h3>
                                </div>
                                <div className="space-y-2 pl-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-[#767676] dark:text-[#a0a0a0]">Name:</span>
                                        <span className="text-sm font-bold">{activeBooking.clientName || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-[#767676] dark:text-[#a0a0a0]">Contact:</span>
                                        <span className="text-sm font-bold">{activeBooking.clientContact || 'N/A'}</span>
                                    </div>
                                    {activeBooking.clientEmail && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-[#767676] dark:text-[#a0a0a0]">Email:</span>
                                            <span className="text-sm font-bold">{activeBooking.clientEmail}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-sm text-[#767676] dark:text-[#a0a0a0]">Booked Via:</span>
                                        <span className="text-sm font-bold">{activeBooking.bookingSource || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Service & Schedule */}
                            <div className="bg-[#fdfcfc] dark:bg-[#0c0c0c] rounded-xl p-4 border border-[#f4f2f4] dark:border-white/10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#F26389]/10 flex items-center justify-center">
                                        <Package size={20} className="text-[#F26389]" />
                                    </div>
                                    <h3 className="text-sm font-black uppercase tracking-wide">Service & Schedule</h3>
                                </div>
                                <div className="space-y-2 pl-2">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-[#767676] dark:text-[#a0a0a0]">Service:</span>
                                        <span className="text-sm font-bold">{activeBooking.serviceTitle || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-[#767676] dark:text-[#a0a0a0]">Date:</span>
                                        <span className="text-sm font-bold flex items-center gap-2">
                                            <Calendar size={14} className="text-[#F26389]" />
                                            {activeBooking.date || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-[#767676] dark:text-[#a0a0a0]">Time:</span>
                                        <span className="text-sm font-bold flex items-center gap-2">
                                            <Clock size={14} className="text-[#F26389]" />
                                            {activeBooking.startTime || activeBooking.time} - {activeBooking.endTime || 'N/A'}
                                        </span>
                                    </div>
                                    {activeBooking.staffName && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-[#767676] dark:text-[#a0a0a0]">Staff:</span>
                                            <span className="text-sm font-bold">{activeBooking.staffName}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-sm text-[#767676] dark:text-[#a0a0a0]">Status:</span>
                                        <span className={`text-sm font-bold ${
                                            activeBooking.status === 'Confirmed'
                                                ? 'text-green-600'
                                                : activeBooking.status === 'Cancelled'
                                                ? 'text-red-600'
                                                : 'text-[#F26389]'
                                        }`}>
                                            {activeBooking.status || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Add-ons & Pricing */}
                            {((activeBooking.selectedAddons && activeBooking.selectedAddons.length > 0) ||
                              (activeBooking.customAddons && activeBooking.customAddons.length > 0)) && (
                                <div className="bg-[#fdfcfc] dark:bg-[#0c0c0c] rounded-xl p-4 border border-[#f4f2f4] dark:border-white/10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-[#F26389]/10 flex items-center justify-center">
                                            <DollarSign size={20} className="text-[#F26389]" />
                                        </div>
                                        <h3 className="text-sm font-black uppercase tracking-wide">Add-ons</h3>
                                    </div>
                                    <div className="space-y-2 pl-2">
                                        {activeBooking.selectedAddons?.map((addon, index) => (
                                            <div key={index} className="flex justify-between text-sm">
                                                <span className="text-[#767676] dark:text-[#a0a0a0]">{addon.name}</span>
                                                <span className="font-bold">+₱{addon.price?.toLocaleString()}</span>
                                            </div>
                                        ))}
                                        {activeBooking.customAddons?.map((addon, index) => (
                                            <div key={index} className="flex justify-between text-sm">
                                                <span className="text-[#767676] dark:text-[#a0a0a0]">{addon.name} (Custom)</span>
                                                <span className="font-bold">+₱{addon.price?.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Total */}
                            <div className="bg-[#F26389]/10 rounded-xl p-4 border border-[#F26389]/20">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-black uppercase tracking-wide">Total Amount:</span>
                                    <span className="text-2xl font-black text-[#F26389]">₱{total.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Extend Booking */}
                            <div className="bg-[#fdfcfc] dark:bg-[#0c0c0c] rounded-xl border border-[#f4f2f4] dark:border-white/10 overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => setShowExtend((v) => !v)}
                                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-[#F26389]/10 flex items-center justify-center">
                                            <ChevronsRight size={16} className="text-[#F26389]" />
                                        </div>
                                        <span className="text-sm font-black uppercase tracking-wide">Extend Booking</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-[#767676] dark:text-[#a0a0a0] uppercase tracking-widest">{showExtend ? 'Hide' : 'Show'}</span>
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
                                                className="flex-1 h-9 px-3 bg-white dark:bg-[#111] border border-[#e6e4e6] dark:border-white/10 rounded-lg text-xs font-bold outline-none focus:border-[#F26389] transition-all"
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

                                        <div>
                                            <input
                                                type="text"
                                                value={extendReason}
                                                onChange={(e) => setExtendReason(e.target.value)}
                                                placeholder="reason (optional)"
                                                className="w-full h-9 px-3 bg-white dark:bg-[#111] border border-[#e6e4e6] dark:border-white/10 rounded-lg text-xs font-bold outline-none focus:border-[#F26389] transition-all placeholder:text-[#b1b1b1]"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2 border border-red-500 text-red-600 dark:text-red-400 rounded-lg font-bold uppercase text-sm hover:bg-red-500/10 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <Trash2 size={16} />
                                {isDeleting ? 'Cancelling...' : 'Cancel Booking'}
                            </button>
                            <button
                                onClick={() => {
                                    onEdit?.(activeBooking);
                                    onClose();
                                }}
                                className="flex-1 px-4 py-2 bg-[#F26389] text-white rounded-lg font-bold uppercase text-sm hover:bg-[#BF637C] transition-colors flex items-center justify-center gap-2"
                            >
                                <Edit2 size={16} />
                                Edit Booking
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ViewBookingModal;
