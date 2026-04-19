import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ServiceService, StaffService, BookingService, CategoryService } from '../../api/services';

const HOUR_OPTIONS = Array.from({ length: 15 }, (_, i) => String(i + 7).padStart(2, '0'));

const MINUTE_OPTIONS = ['00', '15', '30', '45'];
const BOOKING_SOURCES = ['Walk-in', 'Messenger'];

const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_LABELS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
];

const getNearestAllowedTime = (date = new Date()) => {
    let hour = date.getHours();
    let minutes = date.getMinutes();

    if (minutes < 15) {
        minutes = 0;
    } else if (minutes < 45) {
        minutes = 30;
    } else {
        minutes = 0;
        hour += 1;
    }

    if (hour < 7) {
        hour = 7;
        minutes = 0;
    }
    if (hour > 21) {
        hour = 21;
        minutes = 0;
    }

    return {
        hour: String(hour).padStart(2, '0'),
        minute: String(minutes).padStart(2, '0')
    };
};

export const AddBookingModal = ({ isOpen, onClose, onSuccess, prefillContext = null, editingBooking = null }) => {
    const now = new Date();
    const isEditMode = Boolean(editingBooking);

    const [formData, setFormData] = useState({
        clientName: '',
        clientContact: '',
        clientEmail: '',
        bookingSource: 'Walk-in',
        categoryId: '',
        serviceId: '',
        month: String(now.getMonth() + 1).padStart(2, '0'),
        day: String(now.getDate()).padStart(2, '0'),
        year: String(now.getFullYear()),
        hour: '09',
        minute: '00',
        endHour: '10',
        endMinute: '00',
        useCustomEndTime: false,
        staffId: '',
        selectedAddons: {}
    });
    const [customAddons, setCustomAddons] = useState([]);
    const [categories, setCategories] = useState([]);
    const [services, setServices] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [staff, setStaff] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [transportationFee, setTransportationFee] = useState(0);
    const [calViewYear, setCalViewYear] = useState(now.getFullYear());
    const [calViewMonth, setCalViewMonth] = useState(now.getMonth());

    const toMinutes = (hour, minute) => (Number(hour) * 60) + Number(minute);
    const toTimeParts = (totalMinutes) => {
        const hour = Math.floor(totalMinutes / 60);
        const minute = totalMinutes % 60;
        return {
            hour: String(hour).padStart(2, '0'),
            minute: String(minute).padStart(2, '0')
        };
    };
    const addMinutesToTime = (hour, minute, addMinutes) => {
        const baseMinutes = toMinutes(hour, minute);
        const next = Math.min(baseMinutes + addMinutes, 23 * 60 + 59);
        return toTimeParts(next);
    };

    useEffect(() => {
        if (isOpen) {
            CategoryService.getCategories().then(setCategories).catch(console.error);
            ServiceService.getServices().then(setServices).catch(console.error);
            StaffService.getStaff().then(setStaff).catch(console.error);
        }
    }, [isOpen]);

    // Sync calendar view to selected date when modal opens
    useEffect(() => {
        if (!isOpen) return;
        if (editingBooking?.date) {
            const d = new Date(editingBooking.date);
            if (!isNaN(d.getTime())) {
                setCalViewYear(d.getFullYear());
                setCalViewMonth(d.getMonth());
                return;
            }
        }
        const today = new Date();
        setCalViewYear(today.getFullYear());
        setCalViewMonth(today.getMonth());
    }, [isOpen, editingBooking]);

    // Populate form when editing
    useEffect(() => {
        if (!isOpen || !editingBooking) return;

        const bookingDate = editingBooking.date ? new Date(editingBooking.date) : new Date();
        const [startHour = '09', startMinute = '00'] = (editingBooking.startTime || editingBooking.time || '09:00').split(':');
        const [endHour = '10', endMinute = '00'] = (editingBooking.endTime || '10:00').split(':');

        // Find the category ID based on service
        const service = services.find(s => s.id === editingBooking.serviceId);
        const category = categories.find(c => c.name === service?.category);

        setFormData({
            clientName: editingBooking.clientName || '',
            clientContact: editingBooking.clientContact || '',
            clientEmail: editingBooking.clientEmail || '',
            bookingSource: editingBooking.bookingSource || 'Walk-in',
            categoryId: category?.id || '',
            serviceId: editingBooking.serviceId || '',
            month: String(bookingDate.getMonth() + 1).padStart(2, '0'),
            day: String(bookingDate.getDate()).padStart(2, '0'),
            year: String(bookingDate.getFullYear()),
            hour: String(startHour).padStart(2, '0'),
            minute: String(startMinute).padStart(2, '0'),
            endHour: String(endHour).padStart(2, '0'),
            endMinute: String(endMinute).padStart(2, '0'),
            useCustomEndTime: false,
            staffId: editingBooking.staffId || '',
            selectedAddons: (editingBooking.selectedAddons || []).reduce((acc, addon) => {
                acc[addon.id] = true;
                return acc;
            }, {})
        });

        setTransportationFee(editingBooking.transportationFee || 0);
        setCustomAddons(editingBooking.customAddons || []);
    }, [isOpen, editingBooking, services, categories]);

    useEffect(() => {
        if (!isOpen || !prefillContext) return;

        setFormData(prev => ({
            ...prev,
            month: prefillContext.month || prev.month,
            day: prefillContext.day || prev.day,
            year: prefillContext.year || prev.year,
            hour: prefillContext.hour || prev.hour,
            minute: prefillContext.minute || prev.minute
        }));
        if (prefillContext.year && prefillContext.month) {
            setCalViewYear(parseInt(prefillContext.year));
            setCalViewMonth(parseInt(prefillContext.month) - 1);
        }
    }, [isOpen, prefillContext]);

    useEffect(() => {
        // Filter services by selected category
        if (formData.categoryId && services.length > 0) {
            const selectedCategory = categories.find(c => c.id === formData.categoryId);
            if (selectedCategory) {
                const filtered = services.filter(s => s.category === selectedCategory.name);
                setFilteredServices(filtered);
            } else {
                setFilteredServices([]);
            }
        } else {
            setFilteredServices([]);
        }
    }, [formData.categoryId, services, categories]);
    useEffect(() => {
        if (formData.serviceId && services.length > 0) {
            const service = services.find(s => s.id === formData.serviceId);
            setSelectedService(service || null);
            return;
        }
        setSelectedService(null);
    }, [formData.serviceId, services]);

    useEffect(() => {
        if (!isOpen || formData.useCustomEndTime) return;

        const durationMinutes = Number(selectedService?.durationMinutes) || 60;
        const computed = addMinutesToTime(formData.hour, formData.minute, durationMinutes);
        setFormData((prev) => ({
            ...prev,
            endHour: computed.hour,
            endMinute: computed.minute
        }));
    }, [formData.hour, formData.minute, formData.useCustomEndTime, isOpen, selectedService]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // If changing category, reset service selection
        if (name === 'categoryId') {
            setFormData(prev => ({
                ...prev,
                [name]: value,
                serviceId: '',
                selectedAddons: {}
            }));
            setSelectedService(null);
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleAddonToggle = (addonId) => {
        setFormData(prev => ({
            ...prev,
            selectedAddons: {
                ...prev.selectedAddons,
                [addonId]: !prev.selectedAddons[addonId]
            }
        }));
    };

    const handleServiceSelection = (serviceId) => {
        setFormData(prev => ({
            ...prev,
            serviceId,
            selectedAddons: {}
        }));
    };

    const handleSetToday = () => {
        const today = new Date();
        const { hour, minute } = getNearestAllowedTime(today);

        setFormData(prev => ({
            ...prev,
            month: String(today.getMonth() + 1).padStart(2, '0'),
            day: String(today.getDate()).padStart(2, '0'),
            year: String(today.getFullYear()),
            hour,
            minute
        }));
    };

    const handleAddCustomAddon = () => {
        const newId = `custom-${Date.now()}`;
        setCustomAddons(prev => [...prev, { id: newId, name: '', price: 0 }]);
    };

    const handleCustomAddonChange = (index, field, value) => {
        setCustomAddons(prev => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                [field]: field === 'price' ? parseFloat(value) || 0 : value
            };
            return updated;
        });
    };

    const handleRemoveCustomAddon = (index) => {
        setCustomAddons(prev => prev.filter((_, i) => i !== index));
    };

    const calculateTotal = () => {
        let total = selectedService?.basePrice || 0;
        if (selectedService?.addons) {
            selectedService.addons.forEach(addon => {
                if (formData.selectedAddons[addon.id]) {
                    total += addon.defaultPrice || 0;
                }
            });
        }
        customAddons.forEach(addon => {
            total += addon.price || 0;
        });
        total += transportationFee || 0;
        return total;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            const effectiveDate = `${formData.year}-${formData.month}-${formData.day}`;
            const day = formData.day;
            const startTime = `${formData.hour}:${formData.minute}`;
            const endTime = `${formData.endHour}:${formData.endMinute}`;

            if (toMinutes(formData.endHour, formData.endMinute) <= toMinutes(formData.hour, formData.minute)) {
                throw new Error('End time must be later than start time');
            }

            const selectedAddonsArray = Object.keys(formData.selectedAddons)
                .filter(addonId => formData.selectedAddons[addonId])
                .map(addonId => {
                    const addon = selectedService?.addons.find(a => a.id === addonId);
                    return {
                        id: addonId,
                        name: addon?.name || '',
                        price: addon?.defaultPrice || 0,
                        type: 'preset'
                    };
                });

            const customAddonsArray = customAddons
                .filter(addon => addon.name.trim())
                .map(addon => ({
                    id: addon.id,
                    name: addon.name.trim(),
                    price: addon.price,
                    type: 'custom'
                }));

            const bookingData = {
                clientName: formData.clientName.trim(),
                clientContact: formData.clientContact.trim(),
                clientEmail: formData.clientEmail.trim(),
                bookingSource: formData.bookingSource,
                serviceId: formData.serviceId,
                serviceTitle: selectedService?.title || '',
                date: effectiveDate,
                day,
                time: startTime,
                startTime,
                endTime,
                serviceDurationMinutes: Number(selectedService?.durationMinutes) || 60,
                staffId: formData.staffId,
                staffName: staff.find(s => s.id === formData.staffId)?.name || '',
                totalPrice: calculateTotal(),
                selectedAddons: selectedAddonsArray,
                customAddons: customAddonsArray,
                transportationFee: transportationFee || 0,
                status: isEditMode ? (editingBooking.status || 'Confirmed') : 'Confirmed'
            };

            if (isEditMode) {
                await BookingService.updateBooking(editingBooking.id, bookingData);
            } else {
                await BookingService.createBooking(bookingData);
            }

            const resetDate = new Date();
            setFormData({
                clientName: '',
                clientContact: '',
                clientEmail: '',
                bookingSource: 'Walk-in',
                serviceId: '',
                month: String(resetDate.getMonth() + 1).padStart(2, '0'),
                day: String(resetDate.getDate()).padStart(2, '0'),
                year: String(resetDate.getFullYear()),
                hour: '09',
                minute: '00',
                endHour: '10',
                endMinute: '00',
                useCustomEndTime: false,
                staffId: '',
                selectedAddons: {}
            });
            setTransportationFee(0);
            setCustomAddons([]);
            setSelectedService(null);
            onSuccess?.();
            onClose();
        } catch (err) {
            setError(err.message || `Failed to ${isEditMode ? 'update' : 'create'} booking`);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Calendar helpers ────────────────────────────────────────────────────
    const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();

    const buildCalendarGrid = (y, m) => {
        const firstDay = new Date(y, m, 1).getDay(); // 0 = Sun
        const daysInMonth = getDaysInMonth(y, m);
        const daysInPrev = getDaysInMonth(y, m === 0 ? 11 : m - 1);
        const cells = [];
        for (let i = firstDay - 1; i >= 0; i--) cells.push({ d: daysInPrev - i, type: 'prev' });
        for (let d = 1; d <= daysInMonth; d++) cells.push({ d, type: 'cur' });
        let nextDay = 1;
        while (cells.length % 7 !== 0) cells.push({ d: nextDay++, type: 'next' });
        return cells;
    };

    const handleCalPrev = () => {
        if (calViewMonth === 0) { setCalViewYear(calViewYear - 1); setCalViewMonth(11); }
        else setCalViewMonth(calViewMonth - 1);
    };

    const handleCalNext = () => {
        if (calViewMonth === 11) { setCalViewYear(calViewYear + 1); setCalViewMonth(0); }
        else setCalViewMonth(calViewMonth + 1);
    };

    const handleCalDayClick = (cell) => {
        let y = calViewYear, m = calViewMonth;
        if (cell.type === 'prev') { if (m === 0) { y--; m = 11; } else m--; }
        else if (cell.type === 'next') { if (m === 11) { y++; m = 0; } else m++; }
        setFormData(prev => ({
            ...prev,
            year: String(y),
            month: String(m + 1).padStart(2, '0'),
            day: String(cell.d).padStart(2, '0'),
        }));
        if (cell.type !== 'cur') { setCalViewYear(y); setCalViewMonth(m); }
    };

    const calToday = new Date();
    const todayY = calToday.getFullYear(), todayM = calToday.getMonth(), todayD = calToday.getDate();
    const selectedY = parseInt(formData.year), selectedM = parseInt(formData.month) - 1, selectedD = parseInt(formData.day);
    const calCells = buildCalendarGrid(calViewYear, calViewMonth);

    const selectedDateLabel = useMemo(() => {
        const date = new Date(parseInt(formData.year), parseInt(formData.month) - 1, parseInt(formData.day));
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    }, [formData.year, formData.month, formData.day]);

    // ── Render ───────────────────────────────────────────────────────────────
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
                        className="bg-white dark:bg-[#111] rounded-xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-white/10 shrink-0">
                            <h2 className="text-sm font-black uppercase tracking-widest text-[#2f3035] dark:text-white">
                                {isEditMode ? 'Edit Booking' : 'New Booking'}
                            </h2>
                            <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-gray-600">
                                <X size={18} />
                            </button>
                        </div>

                        {error && (
                            <div className="mx-6 mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-600 text-xs shrink-0">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                            {/* Two-column body */}
                            <div className="flex flex-1 overflow-hidden divide-x divide-gray-100 dark:divide-white/10 min-h-0">

                                {/* ── LEFT COLUMN: Client ── */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-4 min-w-0">
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#b1b1b1]">Client</p>

                                    {/* Client Name */}
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-[#b1b1b1] mb-1.5">
                                            Client Name <span className="text-[#F26389]">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="clientName"
                                            value={formData.clientName}
                                            onChange={handleInputChange}
                                            placeholder="Rhuzell"
                                            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] transition-colors"
                                        />
                                    </div>

                                    {/* Contact Number */}
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-[#b1b1b1] mb-1.5">
                                            Contact Number
                                        </label>
                                        <input
                                            type="tel"
                                            name="clientContact"
                                            value={formData.clientContact}
                                            onChange={handleInputChange}
                                            placeholder="+63 9XX XXX XXXX"
                                            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] transition-colors"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-[#b1b1b1] mb-1.5">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            name="clientEmail"
                                            value={formData.clientEmail}
                                            onChange={handleInputChange}
                                            placeholder="client@example.com"
                                            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] transition-colors"
                                        />
                                    </div>

                                    {/* Booked Via */}
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-[#b1b1b1] mb-1.5">
                                            Booked Via
                                        </label>
                                        <select
                                            name="bookingSource"
                                            value={formData.bookingSource}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] transition-colors"
                                        >
                                            {BOOKING_SOURCES.map(src => (
                                                <option key={src} value={src}>{src}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Date – inline calendar */}
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-[#b1b1b1] mb-1.5">
                                            Date <span className="text-[#F26389]">*</span>
                                        </label>

                                        <div className="border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden">
                                            {/* Month / year header */}
                                            <div className="flex items-center justify-between px-4 pt-3 pb-2">
                                                <span className="text-sm font-bold text-[#2f3035] dark:text-white">
                                                    {MONTH_LABELS[calViewMonth]} {calViewYear}
                                                </span>
                                                <div className="flex gap-0.5">
                                                    <button type="button" onClick={handleCalPrev}
                                                        className="p-1 text-[#F26389] hover:bg-[#F26389]/10 rounded transition-colors">
                                                        <ChevronLeft size={16} />
                                                    </button>
                                                    <button type="button" onClick={handleCalNext}
                                                        className="p-1 text-[#F26389] hover:bg-[#F26389]/10 rounded transition-colors">
                                                        <ChevronRight size={16} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Day-name row */}
                                            <div className="grid grid-cols-7 px-3">
                                                {DAY_NAMES.map(n => (
                                                    <div key={n} className="text-center text-[10px] font-bold text-gray-400 py-1">{n}</div>
                                                ))}
                                            </div>

                                            {/* Day grid */}
                                            <div className="grid grid-cols-7 px-3 pb-3 gap-y-0.5">
                                                {calCells.map((cell, idx) => {
                                                    let cellY = calViewYear, cellM = calViewMonth;
                                                    if (cell.type === 'prev') {
                                                        if (cellM === 0) { cellY--; cellM = 11; } else cellM--;
                                                    } else if (cell.type === 'next') {
                                                        if (cellM === 11) { cellY++; cellM = 0; } else cellM++;
                                                    }
                                                    const isToday = cellY === todayY && cellM === todayM && cell.d === todayD;
                                                    const isSelected = cellY === selectedY && cellM === selectedM && cell.d === selectedD;
                                                    const isOther = cell.type !== 'cur';
                                                    return (
                                                        <button
                                                            key={idx}
                                                            type="button"
                                                            onClick={() => handleCalDayClick(cell)}
                                                            className={[
                                                                'w-8 h-8 mx-auto flex items-center justify-center text-xs rounded-full transition-all',
                                                                isSelected
                                                                    ? 'bg-[#F26389] text-white font-bold'
                                                                    : isToday
                                                                        ? 'border-2 border-[#F26389] text-[#F26389] font-bold'
                                                                        : isOther
                                                                            ? 'text-gray-300 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/5'
                                                                            : 'text-[#2f3035] dark:text-white hover:bg-[#F26389]/10',
                                                            ].join(' ')}
                                                        >
                                                            {cell.d}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Selected date label */}
                                        <p className="mt-1.5 text-xs font-bold text-[#F26389]">{selectedDateLabel}</p>
                                    </div>
                                </div>

                                {/* ── RIGHT COLUMN: Service & Schedule ── */}
                                <div className="flex-1 overflow-y-auto p-6 space-y-4 min-w-0">
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-[#b1b1b1]">Service &amp; Schedule</p>

                                    {/* Category */}
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-[#b1b1b1] mb-1.5">Category</label>
                                        <select
                                            name="categoryId"
                                            value={formData.categoryId}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] transition-colors"
                                        >
                                            <option value="">Select category</option>
                                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>

                                    {/* Service */}
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-[#b1b1b1] mb-1.5">Service</label>
                                        <select
                                            name="serviceId"
                                            value={formData.serviceId}
                                            onChange={handleInputChange}
                                            disabled={!formData.categoryId}
                                            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <option value="">
                                                {formData.categoryId ? 'Select a service' : 'Select category first'}
                                            </option>
                                            {filteredServices.map(s => (
                                                <option key={s.id} value={s.id}>{s.title}</option>
                                            ))}
                                        </select>
                                        {selectedService && (
                                            <p className="mt-1.5 text-[11px] font-bold text-[#F26389] uppercase tracking-wider">
                                                {selectedService.subcategory || selectedService.category} &middot; {selectedService.duration} &middot; ₱{selectedService.basePrice?.toLocaleString()}
                                            </p>
                                        )}
                                    </div>

                                    {/* Start Time */}
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-[#b1b1b1] mb-1.5">Start Time</label>
                                        <div className="flex gap-2 items-center">
                                            <select name="hour" value={formData.hour} onChange={handleInputChange}
                                                className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] transition-colors">
                                                {HOUR_OPTIONS.map(h => <option key={h} value={h}>{h}</option>)}
                                            </select>
                                            <span className="text-gray-400 font-bold">:</span>
                                            <select name="minute" value={formData.minute} onChange={handleInputChange}
                                                className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] transition-colors">
                                                {MINUTE_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    {/* End Time */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-[#b1b1b1]">End Time</label>
                                            <label className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 dark:text-gray-400 cursor-pointer select-none">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.useCustomEndTime}
                                                    onChange={e => setFormData(prev => ({ ...prev, useCustomEndTime: e.target.checked }))}
                                                    className="rounded accent-[#F26389]"
                                                />
                                                Override
                                            </label>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                            <select name="endHour" value={formData.endHour} onChange={handleInputChange}
                                                disabled={!formData.useCustomEndTime}
                                                className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] transition-colors disabled:opacity-60">
                                                {HOUR_OPTIONS.map(h => <option key={h} value={h}>{h}</option>)}
                                            </select>
                                            <span className="text-gray-400 font-bold">:</span>
                                            <select name="endMinute" value={formData.endMinute} onChange={handleInputChange}
                                                disabled={!formData.useCustomEndTime}
                                                className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] transition-colors disabled:opacity-60">
                                                {MINUTE_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                                            </select>
                                        </div>
                                        {formData.useCustomEndTime && (
                                            <p className="mt-1 text-[11px] text-gray-400">Custom end time.</p>
                                        )}
                                    </div>

                                    {/* Staff */}
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-[#b1b1b1] mb-1.5">Staff</label>
                                        <select name="staffId" value={formData.staffId} onChange={handleInputChange}
                                            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] transition-colors">
                                            <option value="">Select staff member</option>
                                            {staff.map(m => (
                                                <option key={m.id} value={m.id}>{m.name} ({m.role})</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Preset Add-ons */}
                                    {selectedService?.addons && selectedService.addons.length > 0 && (
                                        <div>
                                            <label className="block text-[10px] font-black uppercase tracking-widest text-[#b1b1b1] mb-2">Add-ons</label>
                                            <div className="space-y-1.5">
                                                {selectedService.addons.map(addon => (
                                                    <label key={addon.id} className="flex items-center gap-2 text-sm cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.selectedAddons[addon.id] || false}
                                                            onChange={() => handleAddonToggle(addon.id)}
                                                            className="rounded accent-[#F26389]"
                                                        />
                                                        <span className="flex-1 text-[#2f3035] dark:text-white">{addon.name}</span>
                                                        <span className="text-xs font-bold text-[#F26389]">+₱{addon.defaultPrice?.toLocaleString()}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Custom Add-ons */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-[#b1b1b1]">Custom Add-ons</label>
                                            <button type="button" onClick={handleAddCustomAddon}
                                                className="text-xs font-bold text-[#F26389] hover:underline tracking-wide">
                                                + ADD
                                            </button>
                                        </div>
                                        {customAddons.length > 0 ? (
                                            <div className="space-y-2">
                                                {customAddons.map((addon, idx) => (
                                                    <div key={addon.id} className="flex gap-2 items-center">
                                                        <input
                                                            type="text"
                                                            value={addon.name}
                                                            onChange={e => handleCustomAddonChange(idx, 'name', e.target.value)}
                                                            placeholder="Add-on name"
                                                            className="flex-1 px-2 py-1.5 text-sm border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] transition-colors"
                                                        />
                                                        <input
                                                            type="number"
                                                            value={addon.price}
                                                            onChange={e => handleCustomAddonChange(idx, 'price', e.target.value)}
                                                            placeholder="0"
                                                            className="w-20 px-2 py-1.5 text-sm border border-gray-200 dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] transition-colors"
                                                        />
                                                        <button type="button" onClick={() => handleRemoveCustomAddon(idx)}
                                                            className="text-red-400 hover:text-red-600 px-1 transition-colors">✕</button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-xs text-[#F26389] italic">No custom add-ons yet</p>
                                        )}
                                    </div>

                                    {/* Transportation Fee */}
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-[#b1b1b1] mb-1.5">Transportation Fee</label>
                                        <div className="flex items-center border border-gray-200 dark:border-white/10 rounded-lg overflow-hidden bg-white dark:bg-[#0c0c0c] focus-within:border-[#F26389] transition-colors">
                                            <span className="pl-3 pr-1 text-sm font-bold text-gray-400">₱</span>
                                            <input
                                                type="number"
                                                value={transportationFee}
                                                onChange={e => setTransportationFee(parseFloat(e.target.value) || 0)}
                                                min="0"
                                                className="flex-1 py-2 pr-3 text-sm bg-transparent focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Total */}
                                    <div className="pt-3 border-t border-gray-100 dark:border-white/10 flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[#b1b1b1]">Total</span>
                                        <span className="text-xl font-black text-[#F26389]">₱{calculateTotal().toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer buttons */}
                            <div className="flex border-t border-gray-100 dark:border-white/10 divide-x divide-gray-100 dark:divide-white/10 shrink-0">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white bg-[#F26389] hover:bg-[#d9527a] disabled:opacity-50 transition-colors"
                                >
                                    {isSubmitting
                                        ? (isEditMode ? 'Updating...' : 'Creating...')
                                        : (isEditMode ? 'Save Changes' : 'Create Booking')}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AddBookingModal;
