import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { ServiceService, StaffService, BookingService, CategoryService } from '../../api/services';

// Slots: 6:00 AM – 10:00 PM, every 30 mins
const HOURS = Array.from({ length: 16 }, (_, i) => String(i + 6).padStart(2, '0')); // 06–21
const MINUTES = ['00', '30'];
const BOOKING_SOURCES = ['Walk-in', 'Messenger'];
const INACTIVE_STATUSES = ['Cancelled', 'cancelled', 'completed', 'Completed'];

const timeToMinutes = (t) => {
    if (!t || !String(t).includes(':')) return null;
    const [h, m] = String(t).split(':').map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return h * 60 + m;
};

const minutesToTime = (total) => {
    const v = Math.max(0, Math.min(22 * 60, Math.round(Number(total) || 0)));
    return `${String(Math.floor(v / 60)).padStart(2, '0')}:${String(v % 60).padStart(2, '0')}`;
};

const formatLocalISO = (d) => {
    if (!d || !(d instanceof Date) || Number.isNaN(d.getTime())) return '';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const parseLocalISO = (s) => {
    if (!s || typeof s !== 'string') return null;
    const parts = s.split('-').map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    return Number.isNaN(d.getTime()) ? null : d;
};

// Sanitize addon rows: trim strings, default numerics to 0, drop empty rows
const sanitizeAddons = (addons) =>
    addons
        .map((a) => ({
            ...a,
            name: (a.name || '').trim(),
            price: Number(a.price) || 0,
            minutes: Number(a.minutes) || 0,
            qty: Math.max(1, Number(a.qty) || 1),
        }))
        .filter((a) => a.name !== '' || a.price > 0 || a.minutes > 0);

export const AddBookingModal = ({ isOpen, onClose, onSuccess, prefillContext = null, editingBooking = null }) => {
    const isEdit = Boolean(editingBooking);
    const now = new Date();

    const [categories, setCategories] = useState([]);
    const [services, setServices] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [staff, setStaff] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [form, setForm] = useState({
        clientName: '',
        clientContact: '',
        clientEmail: '',
        bookingSource: 'Walk-in',
        categoryId: '',
        serviceId: '',
        hour: '09',
        minute: '00',
        endHour: '10',
        endMinute: '00',
        useCustomEndTime: false,
        staffId: '',
        selectedAddons: {},
    });
    const [customAddons, setCustomAddons] = useState([]);
    const [overlapWarning, setOverlapWarning] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [allBookings, setAllBookings] = useState([]);

    const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

    const servicesRef = useRef(services);
    const categoriesRef = useRef(categories);
    useEffect(() => { servicesRef.current = services; }, [services]);
    useEffect(() => { categoriesRef.current = categories; }, [categories]);

    // Load reference data when modal opens
    useEffect(() => {
        if (!isOpen) return;
        CategoryService.getCategories().then(setCategories).catch(console.error);
        ServiceService.getServices().then(setServices).catch(console.error);
        StaffService.getStaff().then(setStaff).catch(console.error);
        BookingService.getBookings().then(setAllBookings).catch(console.error);
    }, [isOpen]);

    // Populate form when editing or when prefill context changes
    useEffect(() => {
        if (!isOpen) return;

        if (isEdit && editingBooking) {
            const d = parseLocalISO(editingBooking.date) || now;
            setSelectedDate(d);
            const [sh = '09', sm = '00'] = (editingBooking.startTime || editingBooking.time || '09:00').split(':');
            const [eh = '10', em = '00'] = (editingBooking.endTime || '10:00').split(':');
            const svc = servicesRef.current.find((s) => s.id === editingBooking.serviceId);
            const cat = categoriesRef.current.find((c) => c.name === svc?.category);
            setForm({
                clientName: editingBooking.clientName || '',
                clientContact: editingBooking.clientContact || '',
                clientEmail: editingBooking.clientEmail || '',
                bookingSource: editingBooking.bookingSource || 'Walk-in',
                categoryId: cat?.id || '',
                serviceId: editingBooking.serviceId || '',
                hour: sh.padStart(2, '0'),
                minute: sm.padStart(2, '0'),
                endHour: eh.padStart(2, '0'),
                endMinute: em.padStart(2, '0'),
                useCustomEndTime: true,
                staffId: editingBooking.staffId || '',
                selectedAddons: (editingBooking.selectedAddons || []).reduce((acc, x) => ({ ...acc, [x.id]: true }), {}),
            });
            setCustomAddons(
                (editingBooking.customAddons || []).map((a) => ({
                    id: a.id || `c-${Date.now()}-${Math.random()}`,
                    name: a.name || '',
                    price: Number(a.price) || 0,
                    minutes: Number(a.minutes) || 0,
                    qty: Math.max(1, Number(a.qty) || 1),
                }))
            );
        } else {
            const prefillISO = prefillContext
                ? `${prefillContext.year}-${prefillContext.month}-${prefillContext.day}`
                : null;
            const d = (prefillISO && parseLocalISO(prefillISO)) || now;
            setSelectedDate(d);
            const ph = (prefillContext?.hour || '09').padStart(2, '0');
            const pm = (prefillContext?.minute || '00').padStart(2, '0');
            setForm((prev) => ({
                ...prev,
                hour: ph,
                minute: pm,
                clientName: '',
                clientContact: '',
                clientEmail: '',
                bookingSource: 'Walk-in',
                categoryId: '',
                serviceId: '',
                useCustomEndTime: false,
                staffId: '',
                selectedAddons: {},
            }));
            setCustomAddons([]);
        }
        setError('');
        setOverlapWarning('');
    }, [isOpen, isEdit, editingBooking?.id, prefillContext]); // eslint-disable-line react-hooks/exhaustive-deps

    // Filter services by selected category
    useEffect(() => {
        if (form.categoryId && categories.length) {
            const cat = categories.find((c) => c.id === form.categoryId);
            setFilteredServices(cat ? services.filter((s) => s.category === cat.name) : []);
        } else {
            setFilteredServices([]);
        }
    }, [form.categoryId, services, categories]);

    // Resolve selected service object
    useEffect(() => {
        setSelectedService(form.serviceId ? services.find((s) => s.id === form.serviceId) || null : null);
    }, [form.serviceId, services]);

    // Auto-compute end time based on service duration + custom addon durations
    useEffect(() => {
        if (form.useCustomEndTime) return;
        const baseDur = Number(selectedService?.durationMinutes) || 60;
        const extraDur = sanitizeAddons(customAddons).reduce((s, a) => s + (a.minutes || 0) * (a.qty || 1), 0);
        const startMins = timeToMinutes(`${form.hour}:${form.minute}`);
        if (startMins === null) return;
        const endTotal = Math.min(startMins + baseDur + extraDur, 22 * 60);
        const [eh, em] = minutesToTime(endTotal).split(':');
        setForm((prev) => ({ ...prev, endHour: eh, endMinute: em }));
    }, [form.hour, form.minute, form.useCustomEndTime, selectedService, customAddons]);

    // Overlap warning (non-blocking)
    useEffect(() => {
        if (!selectedDate || !form.staffId) { setOverlapWarning(''); return; }
        const iso = formatLocalISO(selectedDate);
        const newStart = timeToMinutes(`${form.hour}:${form.minute}`);
        const newEnd = timeToMinutes(`${form.endHour}:${form.endMinute}`);
        if (newStart === null || newEnd === null || newEnd <= newStart) { setOverlapWarning(''); return; }

        const conflicts = allBookings.filter((b) => {
            if (editingBooking && b.id === editingBooking.id) return false;
            if (b.date !== iso || b.staffId !== form.staffId) return false;
            if (INACTIVE_STATUSES.includes(b.status)) return false;
            const bStart = timeToMinutes(b.startTime || b.time);
            const bEnd = timeToMinutes(b.endTime) ?? (bStart !== null ? bStart + (Number(b.durationMinutes) || 60) : null);
            if (bStart === null || bEnd === null) return false;
            return newStart < bEnd && newEnd > bStart;
        });

        if (conflicts.length) {
            const names = conflicts.map((b) => b.clientName || 'Unknown').join(', ');
            setOverlapWarning(`Overlap with: ${names}. You can still save — please verify.`);
        } else {
            setOverlapWarning('');
        }
    }, [selectedDate, form.staffId, form.hour, form.minute, form.endHour, form.endMinute, allBookings, editingBooking]);

    const calcTotal = () => {
        let total = selectedService?.basePrice || 0;
        (selectedService?.addons || []).forEach((a) => {
            if (form.selectedAddons[a.id]) total += a.defaultPrice || 0;
        });
        sanitizeAddons(customAddons).forEach((a) => {
            total += (a.price || 0) * (a.qty || 1);
        });
        return total;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!selectedDate) {
            setError('Please select a date.');
            return;
        }
        const startTime = `${form.hour}:${form.minute}`;
        const endTime = `${form.endHour}:${form.endMinute}`;
        if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
            setError('End time must be after start time.');
            return;
        }

        setIsSubmitting(true);
        try {
            const sanitizedCustom = sanitizeAddons(customAddons);

            // Build preset addons array
            const presetAddons = Object.keys(form.selectedAddons)
                .filter((id) => form.selectedAddons[id])
                .map((id) => {
                    const a = selectedService?.addons?.find((x) => x.id === id);
                    return {
                        id,
                        name: a?.name || '',
                        price: a?.defaultPrice || 0,
                        minutes: a?.minutes || 0,
                        qty: 1,
                        subtotal: a?.defaultPrice || 0,
                        durationSubtotal: a?.minutes || 0,
                        type: 'preset',
                    };
                });

            // Build custom addons array
            const customAddonsPayload = sanitizedCustom.map((a) => ({
                id: a.id,
                name: a.name,
                price: a.price,
                minutes: a.minutes,
                qty: a.qty,
                subtotal: (a.price || 0) * (a.qty || 1),
                durationSubtotal: (a.minutes || 0) * (a.qty || 1),
                type: 'custom',
            }));

            const allAddons = [...presetAddons, ...customAddonsPayload];
            const effectiveDate = formatLocalISO(selectedDate);
            const durationMinutes = Math.max(15, timeToMinutes(endTime) - timeToMinutes(startTime));

            const payload = {
                clientName: form.clientName.trim(),
                clientContact: form.clientContact.trim(),
                clientEmail: form.clientEmail.trim(),
                bookingSource: form.bookingSource,
                serviceId: form.serviceId,
                serviceTitle: selectedService?.title || '',
                date: effectiveDate,
                day: String(selectedDate.getDate()),
                time: startTime,
                startTime,
                endTime,
                serviceDurationMinutes: Number(selectedService?.durationMinutes) || 60,
                durationMinutes,
                staffId: form.staffId,
                staffName: staff.find((s) => s.id === form.staffId)?.name || '',
                totalPrice: calcTotal(),
                addons: allAddons,
                selectedAddons: presetAddons,
                customAddons: customAddonsPayload,
                status: isEdit ? (editingBooking.status || 'Confirmed') : 'Confirmed',
            };

            if (isEdit) {
                await BookingService.updateBooking(editingBooking.id, payload);
            } else {
                await BookingService.createBooking(payload);
            }

            // Reset form
            setForm({
                clientName: '', clientContact: '', clientEmail: '',
                bookingSource: 'Walk-in', categoryId: '', serviceId: '',
                hour: '09', minute: '00', endHour: '10', endMinute: '00',
                useCustomEndTime: false, staffId: '', selectedAddons: {},
            });
            setCustomAddons([]);
            setSelectedDate(null);
            setSelectedService(null);
            setError('');
            setOverlapWarning('');
            onSuccess?.();
            onClose();
        } catch (err) {
            console.error('Booking submit error:', err);
            setError(err.message || `Failed to ${isEdit ? 'update' : 'create'} booking`);
            // Modal stays open, form data preserved
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputCls = 'w-full px-3 py-2 border border-[#e6e4e6] dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] text-sm transition-colors';
    const selectCls = inputCls;

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
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-[#111] rounded-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-black uppercase tracking-wide">
                                {isEdit ? 'Edit Booking' : 'New Booking'}
                            </h2>
                            <button onClick={onClose} className="p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded-lg transition-all">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Top error banner */}
                        {error && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/40 rounded-xl text-red-600 text-sm font-bold">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* LEFT COLUMN: Client + Date */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-[0.15em] text-[#b1b1b1]">Client</h3>

                                <div>
                                    <label className="block text-xs font-bold uppercase mb-1.5">Client Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        value={form.clientName}
                                        onChange={(e) => set('clientName', e.target.value)}
                                        required
                                        placeholder="Jane Doe"
                                        className={inputCls}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase mb-1.5">Contact Number</label>
                                    <input
                                        type="tel"
                                        value={form.clientContact}
                                        onChange={(e) => set('clientContact', e.target.value)}
                                        placeholder="+63 9XX XXX XXXX"
                                        className={inputCls}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase mb-1.5">Email</label>
                                    <input
                                        type="email"
                                        value={form.clientEmail}
                                        onChange={(e) => set('clientEmail', e.target.value)}
                                        placeholder="client@example.com"
                                        className={inputCls}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase mb-1.5">Booked Via</label>
                                    <select
                                        value={form.bookingSource}
                                        onChange={(e) => set('bookingSource', e.target.value)}
                                        className={selectCls}
                                    >
                                        {BOOKING_SOURCES.map((s) => <option key={s}>{s}</option>)}
                                    </select>
                                </div>

                                {/* Date: react-day-picker calendar */}
                                <div>
                                    <label className="block text-xs font-bold uppercase mb-1.5">Date <span className="text-red-500">*</span></label>
                                    <div className="border border-[#e6e4e6] dark:border-white/10 rounded-xl overflow-hidden p-1 bg-white dark:bg-[#0c0c0c]">
                                        <style>{`
                                            .rdp-root { --rdp-accent-color: #F26389; --rdp-accent-background-color: #F2638920; }
                                        `}</style>
                                        <DayPicker
                                            mode="single"
                                            selected={selectedDate}
                                            onSelect={setSelectedDate}
                                            showOutsideDays
                                        />
                                    </div>
                                    {selectedDate && (
                                        <p className="mt-1.5 text-xs font-bold text-[#F26389]">
                                            {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* RIGHT COLUMN: Service, Time, Staff, Add-ons */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-[0.15em] text-[#b1b1b1]">Service &amp; Schedule</h3>

                                <div>
                                    <label className="block text-xs font-bold uppercase mb-1.5">Category</label>
                                    <select
                                        value={form.categoryId}
                                        onChange={(e) => { set('categoryId', e.target.value); set('serviceId', ''); set('selectedAddons', {}); }}
                                        className={selectCls}
                                    >
                                        <option value="">Select category</option>
                                        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase mb-1.5">Service</label>
                                    <select
                                        value={form.serviceId}
                                        onChange={(e) => { set('serviceId', e.target.value); set('selectedAddons', {}); }}
                                        disabled={!form.categoryId}
                                        className={`${selectCls} disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        <option value="">{form.categoryId ? 'Select service' : 'Select category first'}</option>
                                        {filteredServices.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.title} — ₱{s.basePrice?.toLocaleString()} ({s.duration})
                                            </option>
                                        ))}
                                    </select>
                                    {selectedService && (
                                        <p className="mt-1.5 text-[10px] font-bold text-[#F26389] uppercase tracking-wider">
                                            {selectedService.subcategory || selectedService.category} · {selectedService.duration} · ₱{selectedService.basePrice?.toLocaleString()}
                                        </p>
                                    )}
                                </div>

                                {/* Start Time */}
                                <div>
                                    <label className="block text-xs font-bold uppercase mb-1.5">Start Time</label>
                                    <div className="flex gap-2 items-center">
                                        <select value={form.hour} onChange={(e) => set('hour', e.target.value)} className={`flex-1 ${selectCls}`}>
                                            {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
                                        </select>
                                        <span className="text-[#b1b1b1] font-bold">:</span>
                                        <select value={form.minute} onChange={(e) => set('minute', e.target.value)} className={`flex-1 ${selectCls}`}>
                                            {MINUTES.map((m) => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                    </div>
                                </div>

                                {/* End Time */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-xs font-bold uppercase">End Time</label>
                                        <label className="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={form.useCustomEndTime}
                                                onChange={(e) => set('useCustomEndTime', e.target.checked)}
                                                className="accent-[#F26389]"
                                            />
                                            Override
                                        </label>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        <select
                                            value={form.endHour}
                                            onChange={(e) => set('endHour', e.target.value)}
                                            disabled={!form.useCustomEndTime}
                                            className={`flex-1 ${selectCls} disabled:opacity-60`}
                                        >
                                            {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
                                        </select>
                                        <span className="text-[#b1b1b1] font-bold">:</span>
                                        <select
                                            value={form.endMinute}
                                            onChange={(e) => set('endMinute', e.target.value)}
                                            disabled={!form.useCustomEndTime}
                                            className={`flex-1 ${selectCls} disabled:opacity-60`}
                                        >
                                            {MINUTES.map((m) => <option key={m} value={m}>{m}</option>)}
                                        </select>
                                    </div>
                                    <p className="mt-1 text-[10px] text-gray-500 dark:text-gray-400">
                                        {form.useCustomEndTime
                                            ? 'Custom end time.'
                                            : `Auto from service duration (${selectedService?.duration || '1 hour'}).`}
                                    </p>
                                </div>

                                {/* Staff */}
                                <div>
                                    <label className="block text-xs font-bold uppercase mb-1.5">Staff</label>
                                    <select value={form.staffId} onChange={(e) => set('staffId', e.target.value)} className={selectCls}>
                                        <option value="">Select staff</option>
                                        {staff.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
                                    </select>
                                </div>

                                {/* Preset Add-ons */}
                                {(selectedService?.addons || []).length > 0 && (
                                    <div>
                                        <label className="block text-xs font-bold uppercase mb-2">Pre-set Add-ons</label>
                                        <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                            {selectedService.addons.map((a) => (
                                                <label key={a.id} className="flex items-center gap-2 text-sm cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={!!form.selectedAddons[a.id]}
                                                        onChange={() => set('selectedAddons', { ...form.selectedAddons, [a.id]: !form.selectedAddons[a.id] })}
                                                        className="accent-[#F26389]"
                                                    />
                                                    <span className="flex-1">{a.name}</span>
                                                    <span className="font-bold text-[#F26389]">+₱{(a.defaultPrice || 0).toLocaleString()}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Custom Add-ons */}
                                <div className="border-t border-[#f4f2f4] dark:border-white/10 pt-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-xs font-bold uppercase">Custom Add-ons</label>
                                        <button
                                            type="button"
                                            onClick={() => setCustomAddons((p) => [...p, { id: `c-${Date.now()}`, name: '', price: 0, minutes: 0, qty: 1 }])}
                                            className="text-[10px] font-black uppercase text-[#F26389] hover:underline"
                                        >
                                            + Add
                                        </button>
                                    </div>
                                    {customAddons.length === 0 && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 italic">No custom add-ons yet</p>
                                    )}
                                    <div className="space-y-2">
                                        {customAddons.map((a, i) => (
                                            <div key={a.id} className="grid grid-cols-[1fr_64px_56px_32px_24px] gap-1 items-center">
                                                <input
                                                    value={a.name}
                                                    onChange={(e) => setCustomAddons((p) => p.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
                                                    placeholder="Name"
                                                    className="px-2 py-1.5 border border-[#e6e4e6] dark:border-white/10 rounded-lg text-xs bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389]"
                                                />
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={a.price}
                                                    onChange={(e) => setCustomAddons((p) => p.map((x, j) => j === i ? { ...x, price: Number(e.target.value) || 0 } : x))}
                                                    placeholder="₱"
                                                    className="px-2 py-1.5 border border-[#e6e4e6] dark:border-white/10 rounded-lg text-xs bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389]"
                                                />
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={a.minutes}
                                                    onChange={(e) => setCustomAddons((p) => p.map((x, j) => j === i ? { ...x, minutes: Number(e.target.value) || 0 } : x))}
                                                    placeholder="min"
                                                    className="px-2 py-1.5 border border-[#e6e4e6] dark:border-white/10 rounded-lg text-xs bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389]"
                                                />
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={a.qty}
                                                    onChange={(e) => setCustomAddons((p) => p.map((x, j) => j === i ? { ...x, qty: Math.max(1, Number(e.target.value) || 1) } : x))}
                                                    placeholder="qty"
                                                    className="px-2 py-1.5 border border-[#e6e4e6] dark:border-white/10 rounded-lg text-xs bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389]"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setCustomAddons((p) => p.filter((_, j) => j !== i))}
                                                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded p-0.5 text-xs"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                        {customAddons.length > 0 && (
                                            <p className="text-[10px] text-[#b1b1b1]">Columns: Name · Price (₱) · Duration (min) · Qty</p>
                                        )}
                                    </div>
                                </div>

                                {/* Total */}
                                {selectedService && (
                                    <div className="flex justify-between items-center py-3 border-t border-[#f4f2f4] dark:border-white/10">
                                        <span className="font-bold uppercase text-sm">Total</span>
                                        <span className="text-xl font-black text-[#F26389]">₱{calcTotal().toLocaleString()}</span>
                                    </div>
                                )}
                            </div>

                            {/* Full-width footer */}
                            <div className="lg:col-span-2 space-y-3">
                                {overlapWarning && (
                                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-600 dark:text-amber-400 text-xs font-bold">
                                        ⚠️ {overlapWarning}
                                    </div>
                                )}
                                {error && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 text-xs font-bold">
                                        {error}
                                    </div>
                                )}
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="flex-1 px-4 py-2.5 border border-[#e6e4e6] dark:border-white/10 rounded-xl font-bold uppercase text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 px-4 py-2.5 bg-[#F26389] text-white rounded-xl font-bold uppercase text-sm hover:bg-[#BF637C] disabled:opacity-50 transition-colors"
                                    >
                                        {isSubmitting
                                            ? (isEdit ? 'Saving...' : 'Creating...')
                                            : (isEdit ? 'Save Changes' : 'Create Booking')}
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
