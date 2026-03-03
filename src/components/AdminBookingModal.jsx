import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { StaffService } from '../api/services';
import LoadingOverlay from './LoadingOverlay';

const AdminBookingModal = ({ isOpen, onClose, service, onConfirm }) => {
    const [clientName, setClientName] = useState('');
    const [clientContact, setClientContact] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('09:00');
    const [selectedStaff, setSelectedStaff] = useState('');
    const [staff, setStaff] = useState([]);
    const [selectedAddons, setSelectedAddons] = useState({});
    const [addonPrices, setAddonPrices] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showOverlay, setShowOverlay] = useState(false);

    useEffect(() => {
        if (isOpen) {
            StaffService.getStaff().then(setStaff);
            // Initialize addon prices with defaults
            if (service?.addons) {
                const prices = {};
                service.addons.forEach(addon => {
                    prices[addon.id] = addon.defaultPrice;
                });
                setAddonPrices(prices);
            }
        }
    }, [isOpen, service]);

    const calculateTotal = () => {
        let total = service?.basePrice || 0;
        Object.keys(selectedAddons).forEach(addonId => {
            if (selectedAddons[addonId]) {
                total += addonPrices[addonId] || 0;
            }
        });
        return total;
    };

    const handleAddonToggle = (addonId) => {
        setSelectedAddons(prev => ({
            ...prev,
            [addonId]: !prev[addonId]
        }));
    };

    const handleAddonPriceChange = (addonId, newPrice) => {
        const numPrice = parseFloat(newPrice) || 0;
        setAddonPrices(prev => ({
            ...prev,
            [addonId]: numPrice
        }));
    };

    const handleSubmit = async () => {
        if (!clientName.trim() || !clientContact.trim() || !selectedDate || !selectedStaff) {
            alert('Please fill in all required fields');
            return;
        }

        setShowOverlay(true);
        setIsLoading(true);

        const selectedStaffObj = staff.find(s => s.id.toString() === selectedStaff);
        const day = selectedDate.split('-')[2]; // Extract day from YYYY-MM-DD

        const bookingData = {
            clientName,
            clientContact,
            serviceId: service.id,
            serviceTitle: service.title,
            date: selectedDate,
            time: selectedTime,
            day,
            totalPrice: calculateTotal(),
            staffId: selectedStaff,
            staffName: selectedStaffObj?.name || '',
            selectedAddons: Object.keys(selectedAddons)
                .filter(id => selectedAddons[id])
                .map(id => ({
                    id,
                    name: service.addons.find(a => a.id === id)?.name,
                    price: addonPrices[id]
                }))
        };

        try {
            const result = await onConfirm(bookingData);
            setTimeout(() => {
                setShowOverlay(false);
                setIsLoading(false);
                // Reset form
                setClientName('');
                setClientContact('');
                setSelectedDate('');
                setSelectedTime('09:00');
                setSelectedStaff('');
                setSelectedAddons({});
                onClose();
            }, 800);
        } catch (error) {
            setShowOverlay(false);
            setIsLoading(false);
            alert('Error creating booking: ' + error.message);
        }
    };

    const timeSlots = [];
    for (let h = 9; h < 17; h++) {
        for (let m = 0; m < 60; m += 30) {
            timeSlots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
        }
    }

    const total = calculateTotal();
    const formatCurrency = (value) => `₱${value.toLocaleString()}`;

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
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="relative bg-[#fdfcfc] dark:bg-[#111] w-full max-w-2xl rounded-[28px] shadow-2xl border border-[#f4f2f4] dark:border-white/10 max-h-[90vh] overflow-y-auto"
                    >
                        {showOverlay && <LoadingOverlay />}

                        {/* Header */}
                        <div className="sticky top-0 bg-[#fdfcfc] dark:bg-[#111] border-b border-[#f4f2f4] dark:border-white/10 p-6 flex justify-between items-center z-10">
                            <h2 className="text-sm font-black uppercase tracking-tight text-[#2f3035] dark:text-[#fdfcfc]">
                                Admin Package Booking
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-[#f4f2f4] dark:hover:bg-white/10 rounded-xl transition-colors text-[#b1b1b1]"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Form Content */}
                        <div className="p-6 space-y-6">
                            {/* Client Information */}
                            <div className="space-y-4">
                                <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-[#f87941]">Client Information</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-[8px] font-black uppercase tracking-widest text-[#b1b1b1] block mb-2">
                                            Client Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={clientName}
                                            onChange={(e) => setClientName(e.target.value)}
                                            placeholder="Enter client name"
                                            className="w-full h-10 px-4 bg-white dark:bg-[#0c0c0c] border border-[#f4f2f4] dark:border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest outline-none focus:border-[#f87941] transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[8px] font-black uppercase tracking-widest text-[#b1b1b1] block mb-2">
                                            Contact Info *
                                        </label>
                                        <input
                                            type="text"
                                            value={clientContact}
                                            onChange={(e) => setClientContact(e.target.value)}
                                            placeholder="Messenger link or phone"
                                            className="w-full h-10 px-4 bg-white dark:bg-[#0c0c0c] border border-[#f4f2f4] dark:border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest outline-none focus:border-[#f87941] transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Package Details */}
                            <div className="space-y-4">
                                <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-[#f87941]">Package Details</h3>
                                <div className="bg-white dark:bg-[#0c0c0c] border border-[#f4f2f4] dark:border-white/10 rounded-2xl p-4 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#b1b1b1]">
                                            {service?.title}
                                        </span>
                                        <span className="text-sm font-black text-[#f87941]">
                                            {formatCurrency(service?.basePrice || 0)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Add-ons Section */}
                            {service?.addons && service.addons.length > 0 && (
                                <div className="space-y-4">
                                    <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-[#f87941]">Available Add-ons</h3>
                                    <div className="space-y-3">
                                        {service.addons.map((addon) => (
                                            <div
                                                key={addon.id}
                                                className="bg-white dark:bg-[#0c0c0c] border border-[#f4f2f4] dark:border-white/10 rounded-xl p-4 flex items-center justify-between gap-3"
                                            >
                                                <div className="flex items-center gap-3 flex-1">
                                                    <input
                                                        type="checkbox"
                                                        id={`addon-${addon.id}`}
                                                        checked={selectedAddons[addon.id] || false}
                                                        onChange={() => handleAddonToggle(addon.id)}
                                                        className="w-4 h-4 accent-[#f87941] rounded"
                                                    />
                                                    <label
                                                        htmlFor={`addon-${addon.id}`}
                                                        className="text-[10px] font-bold uppercase tracking-widest text-[#2f3035] dark:text-[#fdfcfc] cursor-pointer flex-1"
                                                    >
                                                        {addon.name}
                                                    </label>
                                                </div>
                                                <input
                                                    type="number"
                                                    value={addonPrices[addon.id] || addon.defaultPrice}
                                                    onChange={(e) => handleAddonPriceChange(addon.id, e.target.value)}
                                                    className="w-24 h-9 px-3 bg-white dark:bg-[#111] border border-[#f4f2f4] dark:border-white/10 rounded-lg text-[10px] font-bold text-right outline-none focus:border-[#f87941] transition-all"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Schedule & Staff */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[8px] font-black uppercase tracking-widest text-[#b1b1b1] block">
                                        Date *
                                    </label>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="w-full h-10 px-4 bg-white dark:bg-[#0c0c0c] border border-[#f4f2f4] dark:border-white/10 rounded-xl text-[10px] font-bold outline-none focus:border-[#f87941] transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[8px] font-black uppercase tracking-widest text-[#b1b1b1] block">
                                        Time *
                                    </label>
                                    <select
                                        value={selectedTime}
                                        onChange={(e) => setSelectedTime(e.target.value)}
                                        className="w-full h-10 px-4 bg-white dark:bg-[#0c0c0c] border border-[#f4f2f4] dark:border-white/10 rounded-xl text-[10px] font-bold outline-none focus:border-[#f87941] transition-all appearance-none cursor-pointer"
                                    >
                                        {timeSlots.map(time => (
                                            <option key={time} value={time}>{time}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Staff Assignment */}
                            <div className="space-y-2">
                                <label className="text-[8px] font-black uppercase tracking-widest text-[#b1b1b1] block">
                                    Assign Staff *
                                </label>
                                <select
                                    value={selectedStaff}
                                    onChange={(e) => setSelectedStaff(e.target.value)}
                                    className="w-full h-10 px-4 bg-white dark:bg-[#0c0c0c] border border-[#f4f2f4] dark:border-white/10 rounded-xl text-[10px] font-bold outline-none focus:border-[#f87941] transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Select a staff member</option>
                                    {staff.map(member => (
                                        <option key={member.id} value={member.id}>
                                            {member.name} ({member.availability})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Price Summary */}
                            <div className="bg-gradient-to-r from-[#f87941]/10 to-[#f87941]/5 dark:from-[#f87941]/5 dark:to-[#f87941]/0 border border-[#f87941]/20 rounded-2xl p-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-[10px]">
                                        <span className="font-bold uppercase tracking-widest text-[#b1b1b1]">
                                            Base Price
                                        </span>
                                        <span className="font-black text-[#2f3035] dark:text-[#fdfcfc]">
                                            {formatCurrency(service?.basePrice || 0)}
                                        </span>
                                    </div>
                                    {Object.keys(selectedAddons).some(id => selectedAddons[id]) && (
                                        <div className="flex justify-between items-center text-[10px] border-t border-[#f87941]/20 pt-2">
                                            <span className="font-bold uppercase tracking-widest text-[#b1b1b1]">
                                                Add-ons
                                            </span>
                                            <span className="font-black text-[#2f3035] dark:text-[#fdfcfc]">
                                                {formatCurrency(total - (service?.basePrice || 0))}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center text-sm border-t border-[#f87941]/30 pt-2">
                                        <span className="font-black uppercase tracking-widest text-[#f87941]">
                                            Total
                                        </span>
                                        <span className="font-black text-[#f87941] text-lg">
                                            {formatCurrency(total)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={onClose}
                                    className="flex-1 h-10 border border-[#f4f2f4] dark:border-white/10 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-[#b1b1b1] hover:bg-[#f4f2f4] dark:hover:bg-white/5 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isLoading}
                                    className="flex-1 h-10 bg-[#f87941] text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-[#f87941]/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Confirm & Schedule
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AdminBookingModal;
