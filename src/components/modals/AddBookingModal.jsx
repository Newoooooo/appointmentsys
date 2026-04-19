import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, X } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { ServiceService, StaffService, BookingService, CategoryService } from '../../api/services';

const HOUR_OPTIONS = Array.from({ length: 17 }, (_, index) => {
    const hour = index + 6;
    return String(hour).padStart(2, '0');
});

const MINUTE_OPTIONS = ['00', '30'];
const BOOKING_SOURCES = ['Walk-in', 'Messenger'];

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

    if (hour < 6) {
        hour = 6;
        minutes = 0;
    }
    if (hour > 22) {
        hour = 22;
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
    const [selectedDate, setSelectedDate] = useState(now);
    const [customAddons, setCustomAddons] = useState([]);
    const [categories, setCategories] = useState([]);
    const [services, setServices] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [staff, setStaff] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

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

    // Populate form when editing
    useEffect(() => {
        if (!isOpen || !editingBooking) return;

        const bookingDate = editingBooking.date ? new Date(`${editingBooking.date}T00:00:00`) : new Date();
        const [startHour = '09', startMinute = '00'] = (editingBooking.startTime || editingBooking.time || '09:00').split(':');
        const [endHour = '10', endMinute = '00'] = (editingBooking.endTime || '10:00').split(':');

        // Find the category ID based on service
        const service = services.find(s => s.id === editingBooking.serviceId);
        const category = categories.find(c => c.name === service?.category);

        setSelectedDate(bookingDate);
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

        setCustomAddons(editingBooking.customAddons || []);
    }, [isOpen, editingBooking, services, categories]);

    useEffect(() => {
        if (!isOpen || !prefillContext) return;

        const prefillDate = prefillContext.year && prefillContext.month && prefillContext.day
            ? new Date(`${prefillContext.year}-${prefillContext.month}-${prefillContext.day}T00:00:00`)
            : null;

        if (prefillDate) setSelectedDate(prefillDate);

        setFormData(prev => ({
            ...prev,
            month: prefillContext.month || prev.month,
            day: prefillContext.day || prev.day,
            year: prefillContext.year || prev.year,
            hour: prefillContext.hour || prev.hour,
            minute: prefillContext.minute || prev.minute
        }));
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

        setSelectedDate(today);
        setFormData(prev => ({
            ...prev,
            month: String(today.getMonth() + 1).padStart(2, '0'),
            day: String(today.getDate()).padStart(2, '0'),
            year: String(today.getFullYear()),
            hour,
            minute
        }));
    };

    const handleDateSelect = (date) => {
        if (!date) return;
        setSelectedDate(date);
        setFormData(prev => ({
            ...prev,
            month: String(date.getMonth() + 1).padStart(2, '0'),
            day: String(date.getDate()).padStart(2, '0'),
            year: String(date.getFullYear())
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
                status: isEditMode ? (editingBooking.status || 'Confirmed') : 'Confirmed'
            };

            if (isEditMode) {
                await BookingService.updateBooking(editingBooking.id, bookingData);
            } else {
                await BookingService.createBooking(bookingData);
            }

            const resetDate = new Date();
            setSelectedDate(resetDate);
            setFormData({
                clientName: '',
                clientContact: '',
                clientEmail: '',
                bookingSource: 'Walk-in',
                categoryId: '',
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
                        className="bg-white dark:bg-[#111] rounded-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-black uppercase tracking-wide">
                                {isEditMode ? 'Edit Booking' : 'New Booking'}
                            </h2>
                            <button onClick={onClose} className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <h3 className="text-sm font-black uppercase tracking-wide text-gray-600 dark:text-gray-400">Profiling</h3>

                                <div>
                                    <label className="block text-sm font-bold uppercase mb-2">Client Name</label>
                                    <input
                                        type="text"
                                        name="clientName"
                                        value={formData.clientName}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] transition-colors"
                                        placeholder="John Doe"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold uppercase mb-2">Contact Number</label>
                                    <input
                                        type="tel"
                                        name="clientContact"
                                        value={formData.clientContact}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] transition-colors"
                                        placeholder="+63 9XX XXX XXXX"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold uppercase mb-2">Client Email</label>
                                    <input
                                        type="email"
                                        name="clientEmail"
                                        value={formData.clientEmail}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] transition-colors"
                                        placeholder="client@email.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold uppercase mb-2">Booked Via</label>
                                    <select
                                        name="bookingSource"
                                        value={formData.bookingSource}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] transition-colors text-sm"
                                    >
                                        {BOOKING_SOURCES.map(source => (
                                            <option key={source} value={source}>{source}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-black uppercase tracking-wide text-gray-600 dark:text-gray-400">Service & Schedule</h3>

                                <div>
                                    <label className="block text-sm font-bold uppercase mb-2">Category</label>
                                    <select
                                        name="categoryId"
                                        value={formData.categoryId}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] transition-colors text-sm"
                                    >
                                        <option value="">Select a category first</option>
                                        {categories.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold uppercase mb-2">Service</label>
                                    <select
                                        name="serviceId"
                                        value={formData.serviceId}
                                        onChange={handleInputChange}
                                        disabled={!formData.categoryId}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="">
                                            {formData.categoryId ? 'Select a service' : 'Select category first'}
                                        </option>
                                        {filteredServices.map(service => (
                                            <option key={service.id} value={service.id}>
                                                {service.title} - ₱{service.basePrice?.toLocaleString()} ({service.duration})
                                            </option>
                                        ))}
                                    </select>
                                    {selectedService && (
                                        <div className="mt-2 p-3 bg-[#F26389]/5 border border-[#F26389]/20 rounded-lg">
                                            <p className="text-[11px] font-bold uppercase tracking-wider text-[#F26389]">
                                                {selectedService.subcategory || selectedService.category} • {selectedService.duration}
                                            </p>
                                            <p className="text-sm font-black text-[#2f3035] dark:text-white mt-1">
                                                ₱{selectedService.basePrice?.toLocaleString()}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-sm font-bold uppercase">Date</label>
                                        <button
                                            type="button"
                                            onClick={handleSetToday}
                                            className="px-2 py-1 text-[11px] font-bold uppercase rounded-md border border-gray-300 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                        >
                                            Today
                                        </button>
                                    </div>
                                    <div className="border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden bg-white dark:bg-[#0c0c0c] p-2">
                                        <DayPicker
                                            mode="single"
                                            selected={selectedDate}
                                            onSelect={handleDateSelect}
                                            showOutsideDays
                                            className="!font-sans"
                                        />
                                    </div>
                                    {selectedDate && (
                                        <p className="text-[11px] font-bold text-[#F26389] mt-1 text-center">
                                            {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-bold uppercase mb-2">Time</label>
                                    <div className="flex gap-2">
                                        <select
                                            name="hour"
                                            value={formData.hour}
                                            onChange={handleInputChange}
                                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] transition-colors text-sm"
                                        >
                                            {HOUR_OPTIONS.map(hour => (
                                                <option key={hour} value={hour}>{hour}</option>
                                            ))}
                                        </select>
                                        <span className="flex items-center text-gray-400">:</span>
                                        <select
                                            name="minute"
                                            value={formData.minute}
                                            onChange={handleInputChange}
                                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] transition-colors text-sm"
                                        >
                                            {MINUTE_OPTIONS.map(minute => (
                                                <option key={minute} value={minute}>{minute}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-bold uppercase">
                                        <input
                                            type="checkbox"
                                            checked={formData.useCustomEndTime}
                                            onChange={(event) => {
                                                const enabled = event.target.checked;
                                                setFormData((prev) => ({ ...prev, useCustomEndTime: enabled }));
                                            }}
                                            className="rounded accent-[#F26389]"
                                        />
                                        Override End Time
                                    </label>

                                    <div className="flex gap-2">
                                        <select
                                            name="endHour"
                                            value={formData.endHour}
                                            onChange={handleInputChange}
                                            disabled={!formData.useCustomEndTime}
                                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] transition-colors text-sm disabled:opacity-60"
                                        >
                                            {HOUR_OPTIONS.map(hour => (
                                                <option key={hour} value={hour}>{hour}</option>
                                            ))}
                                        </select>
                                        <span className="flex items-center text-gray-400">:</span>
                                        <select
                                            name="endMinute"
                                            value={formData.endMinute}
                                            onChange={handleInputChange}
                                            disabled={!formData.useCustomEndTime}
                                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] transition-colors text-sm disabled:opacity-60"
                                        >
                                            {MINUTE_OPTIONS.map(minute => (
                                                <option key={minute} value={minute}>{minute}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                        {formData.useCustomEndTime
                                            ? 'Custom end time enabled.'
                                            : `End time auto-computed from service duration (${selectedService?.duration || '1 hour'}).`}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold uppercase mb-2">Staff</label>
                                    <select
                                        name="staffId"
                                        value={formData.staffId}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] transition-colors text-sm"
                                    >
                                        <option value="">Select staff member</option>
                                        {staff.map(member => (
                                            <option key={member.id} value={member.id}>
                                                {member.name} ({member.role})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {selectedService?.addons && selectedService.addons.length > 0 && (
                                    <div className="pt-2 pb-2 border-t border-gray-200 dark:border-white/10">
                                        <label className="block text-sm font-bold uppercase mb-3">Pre-set Add-ons</label>
                                        <div className="space-y-2 max-h-32 overflow-y-auto">
                                            {selectedService.addons.map(addon => (
                                                <div key={addon.id} className="flex items-center gap-3">
                                                    <input
                                                        type="checkbox"
                                                        id={addon.id}
                                                        checked={formData.selectedAddons[addon.id] || false}
                                                        onChange={() => handleAddonToggle(addon.id)}
                                                        className="rounded accent-[#F26389]"
                                                    />
                                                    <label htmlFor={addon.id} className="text-sm flex-1">
                                                        {addon.name}
                                                    </label>
                                                    <span className="text-sm font-bold">+₱{addon.defaultPrice}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="pt-2 pb-2 border-t border-gray-200 dark:border-white/10">
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="block text-sm font-bold uppercase">Custom Add-ons</label>
                                        <button
                                            type="button"
                                            onClick={handleAddCustomAddon}
                                            className="px-2 py-1 text-[11px] font-bold uppercase bg-[#F26389]/10 text-[#F26389] border border-[#F26389]/30 rounded-lg hover:bg-[#F26389]/20 transition-colors"
                                        >
                                            + Add
                                        </button>
                                    </div>

                                    {customAddons.length > 0 ? (
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {customAddons.map((addon, index) => (
                                                <div key={addon.id} className="flex gap-2 items-end">
                                                    <div className="flex-1">
                                                        <input
                                                            type="text"
                                                            value={addon.name}
                                                            onChange={(e) => handleCustomAddonChange(index, 'name', e.target.value)}
                                                            placeholder="Add-on name"
                                                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] transition-colors"
                                                        />
                                                    </div>
                                                    <div className="w-24">
                                                        <input
                                                            type="number"
                                                            value={addon.price}
                                                            onChange={(e) => handleCustomAddonChange(index, 'price', e.target.value)}
                                                            placeholder="Price"
                                                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] transition-colors"
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveCustomAddon(index)}
                                                        className="px-2 py-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 italic">No custom add-ons yet</p>
                                    )}
                                </div>
                            </div>

                            <div className="lg:col-span-2 space-y-4">
                                {selectedService && (
                                    <div className="pt-3 pb-3 border-t border-gray-200 dark:border-white/10">
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold uppercase text-sm">Total:</span>
                                            <span className="text-lg font-black text-[#F26389]">₱{calculateTotal().toLocaleString()}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-white/10 rounded-lg font-bold uppercase text-sm hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 px-4 py-2 bg-[#F26389] text-white rounded-lg font-bold uppercase text-sm hover:bg-[#BF637C] disabled:opacity-50 transition-colors"
                                    >
                                        {isSubmitting ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Booking' : 'Create Booking')}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default AddBookingModal;