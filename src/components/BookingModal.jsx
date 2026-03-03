import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User, Clock, Check } from 'lucide-react';

const BookingModal = ({ isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative bg-white w-full max-w-lg rounded-[28px] shadow-2xl overflow-hidden"
                    >
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                                    <Check size={28} />
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                                    <X size={20} />
                                </button>
                            </div>

                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Booking Confirmed!</h2>
                            <p className="text-slate-500 mb-8">We've sent a confirmation email and SMS reminder to the customer.</p>

                            <div className="space-y-4 bg-slate-50 p-6 rounded-2xl mb-8">
                                <div className="flex items-center gap-3">
                                    <Calendar className="text-slate-400" size={18} />
                                    <span className="text-slate-700 font-medium">Monday, October 24, 2024</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Clock className="text-slate-400" size={18} />
                                    <span className="text-slate-700 font-medium">10:00 AM — 11:00 AM (60 min)</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <User className="text-slate-400" size={18} />
                                    <span className="text-slate-700 font-medium">Jordan Smith (Senior Therapist)</span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all">
                                    Go to Calendar
                                </button>
                                <button onClick={onClose} className="w-full text-slate-500 py-2 font-semibold hover:text-slate-800 transition-all text-sm">
                                    Close Window
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default BookingModal;