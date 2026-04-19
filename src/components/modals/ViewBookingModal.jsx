import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Edit2, Trash2, Calendar, Clock, User, Package, DollarSign } from 'lucide-react';
import { BookingService } from '../../api/services';

export const ViewBookingModal = ({ isOpen, onClose, booking, onEdit, onDeleted }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState('');

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
            return;
        }

        setIsDeleting(true);
        setError('');

        try {
            await BookingService.deleteBooking(booking.id);
            onDeleted?.();
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to cancel booking');
        } finally {
            setIsDeleting(false);
        }
    };

    if (!booking) return null;

    // Calculate total with addons
    const addonTotal = [...(booking.selectedAddons || []), ...(booking.customAddons || [])]
        .reduce((sum, addon) => sum + (addon.price || 0), 0);
    const total = (booking.totalPrice || 0);

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
                                        <span className="text-sm text-[#b1b1b1]">Name:</span>
                                        <span className="text-sm font-bold">{booking.clientName || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-[#b1b1b1]">Contact:</span>
                                        <span className="text-sm font-bold">{booking.clientContact || 'N/A'}</span>
                                    </div>
                                    {booking.clientEmail && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-[#b1b1b1]">Email:</span>
                                            <span className="text-sm font-bold">{booking.clientEmail}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-sm text-[#b1b1b1]">Booked Via:</span>
                                        <span className="text-sm font-bold">{booking.bookingSource || 'N/A'}</span>
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
                                        <span className="text-sm text-[#b1b1b1]">Service:</span>
                                        <span className="text-sm font-bold">{booking.serviceTitle || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-[#b1b1b1]">Date:</span>
                                        <span className="text-sm font-bold flex items-center gap-2">
                                            <Calendar size={14} className="text-[#F26389]" />
                                            {booking.date || 'N/A'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-[#b1b1b1]">Time:</span>
                                        <span className="text-sm font-bold flex items-center gap-2">
                                            <Clock size={14} className="text-[#F26389]" />
                                            {booking.startTime || booking.time} - {booking.endTime || 'N/A'}
                                        </span>
                                    </div>
                                    {booking.staffName && (
                                        <div className="flex justify-between">
                                            <span className="text-sm text-[#b1b1b1]">Staff:</span>
                                            <span className="text-sm font-bold">{booking.staffName}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-sm text-[#b1b1b1]">Status:</span>
                                        <span className={`text-sm font-bold ${
                                            booking.status === 'Confirmed' 
                                                ? 'text-green-600' 
                                                : booking.status === 'Cancelled'
                                                ? 'text-red-600'
                                                : 'text-[#F26389]'
                                        }`}>
                                            {booking.status || 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Add-ons & Pricing */}
                            {((booking.selectedAddons && booking.selectedAddons.length > 0) || 
                              (booking.customAddons && booking.customAddons.length > 0)) && (
                                <div className="bg-[#fdfcfc] dark:bg-[#0c0c0c] rounded-xl p-4 border border-[#f4f2f4] dark:border-white/10">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-10 h-10 rounded-xl bg-[#F26389]/10 flex items-center justify-center">
                                            <DollarSign size={20} className="text-[#F26389]" />
                                        </div>
                                        <h3 className="text-sm font-black uppercase tracking-wide">Add-ons</h3>
                                    </div>
                                    <div className="space-y-2 pl-2">
                                        {booking.selectedAddons?.map((addon, index) => (
                                            <div key={index} className="flex justify-between text-sm">
                                                <span className="text-[#b1b1b1]">{addon.name}</span>
                                                <span className="font-bold">+₱{addon.price?.toLocaleString()}</span>
                                            </div>
                                        ))}
                                        {booking.customAddons?.map((addon, index) => (
                                            <div key={index} className="flex justify-between text-sm">
                                                <span className="text-[#b1b1b1]">{addon.name} (Custom)</span>
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
                                    onEdit?.(booking);
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
