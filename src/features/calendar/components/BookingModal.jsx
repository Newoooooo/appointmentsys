import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import clsx from 'clsx';
import { ServiceService, StaffService, CategoryService } from '../../../api/services.js';
import { BOOKING_SOURCES } from '../config/constants.js';
import { getOverlapWarning } from '../utils/overlapWarning.js';
import { formatLocalISO, parseLocalISO } from '../utils/dateMath.js';
import { timeToMinutes, minutesToTime } from '../utils/slotGenerator.js';

const HOURS = Array.from({ length: 16 }, (_, i) => String(i + 6).padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];

const BookingModal = ({ isOpen, onClose, onSave, prefillDate, prefillTime, editingBooking, bookings = [] }) => {
  const isEdit = Boolean(editingBooking);
  const now = new Date();

  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);

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
    durationOverride: '',
    staffId: '',
    selectedAddons: {},
  });
  const [customAddons, setCustomAddons] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [filteredServices, setFilteredServices] = useState([]);
  const [overlapWarning, setOverlapWarning] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    CategoryService.getCategories().then(setCategories).catch(console.error);
    ServiceService.getServices().then(setServices).catch(console.error);
    StaffService.getStaff().then(setStaff).catch(console.error);
  }, [isOpen]);

  const servicesRef = React.useRef(services);
  const categoriesRef = React.useRef(categories);
  useEffect(() => { servicesRef.current = services; }, [services]);
  useEffect(() => { categoriesRef.current = categories; }, [categories]);

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
        durationOverride: String(editingBooking.durationMinutes || ''),
        staffId: editingBooking.staffId || '',
        selectedAddons: (editingBooking.selectedAddons || []).reduce((a, x) => ({ ...a, [x.id]: true }), {}),
      });
      setCustomAddons(editingBooking.customAddons || []);
    } else {
      const d = prefillDate instanceof Date
        ? prefillDate
        : (prefillDate ? parseLocalISO(prefillDate) : null) || now;
      setSelectedDate(d);
      const [ph = '09', pm = '00'] = (prefillTime || '09:00').split(':');
      setForm((prev) => ({
        ...prev,
        hour: ph.padStart(2, '0'),
        minute: pm.padStart(2, '0'),
        clientName: '',
        clientContact: '',
        clientEmail: '',
        bookingSource: 'Walk-in',
        categoryId: '',
        serviceId: '',
        useCustomEndTime: false,
        durationOverride: '',
        staffId: '',
        selectedAddons: {},
      }));
      setCustomAddons([]);
    }
  }, [isOpen, isEdit, editingBooking?.id, prefillDate, prefillTime]);

  useEffect(() => {
    if (form.categoryId && categories.length) {
      const cat = categories.find((c) => c.id === form.categoryId);
      setFilteredServices(cat ? services.filter((s) => s.category === cat.name) : []);
    } else {
      setFilteredServices([]);
    }
  }, [form.categoryId, services, categories]);

  useEffect(() => {
    setSelectedService(form.serviceId ? services.find((s) => s.id === form.serviceId) || null : null);
  }, [form.serviceId, services]);

  useEffect(() => {
    if (form.useCustomEndTime) return;
    const durMins = form.durationOverride
      ? Number(form.durationOverride)
      : (Number(selectedService?.durationMinutes) || 60);
    const startMins = timeToMinutes(`${form.hour}:${form.minute}`);
    if (startMins === null) return;
    const endMins = startMins + durMins;
    const [eh, em] = minutesToTime(endMins).split(':');
    setForm((prev) => ({ ...prev, endHour: eh, endMinute: em }));
  }, [form.hour, form.minute, form.useCustomEndTime, form.durationOverride, selectedService]);

  useEffect(() => {
    if (!selectedDate || !form.staffId) { setOverlapWarning(''); return; }
    const iso = formatLocalISO(selectedDate);
    const warning = getOverlapWarning({
      bookings,
      date: iso,
      staffId: form.staffId,
      startTime: `${form.hour}:${form.minute}`,
      endTime: `${form.endHour}:${form.endMinute}`,
      excludeId: editingBooking?.id || null,
    });
    setOverlapWarning(warning || '');
  }, [selectedDate, form.staffId, form.hour, form.minute, form.endHour, form.endMinute, bookings, editingBooking]);

  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const calcTotal = () => {
    let total = selectedService?.basePrice || 0;
    (selectedService?.addons || []).forEach((a) => { if (form.selectedAddons[a.id]) total += a.defaultPrice || 0; });
    customAddons.forEach((a) => { total += a.price || 0; });
    return total;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedDate) { setError('Please select a date.'); return; }
    const startTime = `${form.hour}:${form.minute}`;
    const endTime = `${form.endHour}:${form.endMinute}`;
    if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
      setError('End time must be after start time.');
      return;
    }
    const durationMinutes = form.durationOverride
      ? Number(form.durationOverride)
      : (Number(selectedService?.durationMinutes) || 60);

    const addonsArray = Object.keys(form.selectedAddons)
      .filter((id) => form.selectedAddons[id])
      .map((id) => {
        const a = selectedService?.addons?.find((x) => x.id === id);
        return { id, name: a?.name || '', price: a?.defaultPrice || 0, type: 'preset' };
      });

    const payload = {
      clientName: form.clientName.trim(),
      clientContact: form.clientContact.trim(),
      clientEmail: form.clientEmail.trim(),
      bookingSource: form.bookingSource,
      serviceId: form.serviceId,
      serviceTitle: selectedService?.title || '',
      category: categories.find((c) => c.id === form.categoryId)?.name || '',
      date: formatLocalISO(selectedDate),
      time: startTime,
      startTime,
      endTime,
      durationMinutes,
      staffId: form.staffId,
      staffName: staff.find((s) => s.id === form.staffId)?.name || '',
      totalPrice: calcTotal(),
      selectedAddons: addonsArray,
      customAddons: customAddons.filter((a) => a.name.trim()).map((a) => ({ ...a, type: 'custom' })),
    };

    setIsSubmitting(true);
    try {
      await onSave(payload, editingBooking?.id);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-[#111] rounded-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between p-6 border-b border-[#f4f2f4] dark:border-white/10">
            <h2 className="text-lg font-black uppercase tracking-wide">{isEdit ? 'Edit Booking' : 'New Booking'}</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-all"><X size={20} /></button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT: Client info + Date picker */}
            <div className="space-y-5">
              <h3 className="text-xs font-black uppercase tracking-[0.15em] text-[#b1b1b1]">Client</h3>

              {[
                { label: 'Client Name', name: 'clientName', type: 'text', placeholder: 'Jane Doe', required: true },
                { label: 'Contact Number', name: 'clientContact', type: 'tel', placeholder: '+63 9XX XXX XXXX' },
                { label: 'Email', name: 'clientEmail', type: 'email', placeholder: 'client@example.com' },
              ].map(({ label, name, type, placeholder, required }) => (
                <div key={name}>
                  <label className="block text-xs font-bold uppercase mb-1.5">{label}</label>
                  <input
                    type={type}
                    value={form[name]}
                    onChange={(e) => set(name, e.target.value)}
                    required={required}
                    placeholder={placeholder}
                    className="w-full px-3 py-2 border border-[#e6e4e6] dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] text-sm transition-colors"
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-bold uppercase mb-1.5">Booked Via</label>
                <select
                  value={form.bookingSource}
                  onChange={(e) => set('bookingSource', e.target.value)}
                  className="w-full px-3 py-2 border border-[#e6e4e6] dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] text-sm"
                >
                  {BOOKING_SOURCES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1.5">Date</label>
                <div className="border border-[#e6e4e6] dark:border-white/10 rounded-xl overflow-hidden p-2 bg-white dark:bg-[#0c0c0c]">
                  <style>{`
                    .rdp { --rdp-accent-color: #F26389; --rdp-accent-background-color: #F2638920; }
                  `}</style>
                  <DayPicker
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    showOutsideDays
                  />
                </div>
              </div>
            </div>

            {/* RIGHT: Service, time, staff, addons */}
            <div className="space-y-5">
              <h3 className="text-xs font-black uppercase tracking-[0.15em] text-[#b1b1b1]">Service & Schedule</h3>

              <div>
                <label className="block text-xs font-bold uppercase mb-1.5">Category</label>
                <select
                  value={form.categoryId}
                  onChange={(e) => { set('categoryId', e.target.value); set('serviceId', ''); }}
                  className="w-full px-3 py-2 border border-[#e6e4e6] dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] text-sm"
                >
                  <option value="">Select category</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1.5">Service</label>
                <select
                  value={form.serviceId}
                  onChange={(e) => set('serviceId', e.target.value)}
                  disabled={!form.categoryId}
                  className="w-full px-3 py-2 border border-[#e6e4e6] dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] text-sm disabled:opacity-50"
                >
                  <option value="">{form.categoryId ? 'Select service' : 'Select category first'}</option>
                  {filteredServices.map((s) => (
                    <option key={s.id} value={s.id}>{s.title} — ₱{s.basePrice?.toLocaleString()} ({s.duration})</option>
                  ))}
                </select>
                {selectedService && (
                  <p className="mt-1.5 text-[10px] font-bold text-[#F26389] uppercase tracking-wider">
                    {selectedService.subcategory} · {selectedService.duration} · ₱{selectedService.basePrice?.toLocaleString()}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1.5">Start Time</label>
                <div className="flex gap-2 items-center">
                  <select value={form.hour} onChange={(e) => set('hour', e.target.value)} className="flex-1 px-3 py-2 border border-[#e6e4e6] dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] text-sm">
                    {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <span className="text-[#b1b1b1] font-bold">:</span>
                  <select value={form.minute} onChange={(e) => set('minute', e.target.value)} className="flex-1 px-3 py-2 border border-[#e6e4e6] dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] text-sm">
                    {MINUTES.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1.5">Duration (minutes)</label>
                <input
                  type="number"
                  min="15"
                  step="15"
                  value={form.durationOverride != null && form.durationOverride !== '' ? form.durationOverride : (selectedService?.durationMinutes ?? '')}
                  onChange={(e) => { set('durationOverride', e.target.value); set('useCustomEndTime', false); }}
                  placeholder={selectedService ? String(selectedService.durationMinutes) : '60'}
                  className="w-full px-3 py-2 border border-[#e6e4e6] dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] text-sm"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase">End Time</label>
                  <label className="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer">
                    <input type="checkbox" checked={form.useCustomEndTime} onChange={(e) => set('useCustomEndTime', e.target.checked)} className="accent-[#F26389]" />
                    Override
                  </label>
                </div>
                <div className="flex gap-2 items-center">
                  <select value={form.endHour} onChange={(e) => set('endHour', e.target.value)} disabled={!form.useCustomEndTime} className="flex-1 px-3 py-2 border border-[#e6e4e6] dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] text-sm disabled:opacity-60">
                    {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <span className="text-[#b1b1b1] font-bold">:</span>
                  <select value={form.endMinute} onChange={(e) => set('endMinute', e.target.value)} disabled={!form.useCustomEndTime} className="flex-1 px-3 py-2 border border-[#e6e4e6] dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] text-sm disabled:opacity-60">
                    {MINUTES.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1.5">Staff</label>
                <select value={form.staffId} onChange={(e) => set('staffId', e.target.value)} className="w-full px-3 py-2 border border-[#e6e4e6] dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] text-sm">
                  <option value="">Select staff</option>
                  {staff.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
                </select>
              </div>

              {selectedService?.addons?.length > 0 && (
                <div>
                  <label className="block text-xs font-bold uppercase mb-2">Add-ons</label>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {selectedService.addons.map((a) => (
                      <label key={a.id} className="flex items-center gap-2 text-sm cursor-pointer">
                        <input type="checkbox" checked={!!form.selectedAddons[a.id]} onChange={() => set('selectedAddons', { ...form.selectedAddons, [a.id]: !form.selectedAddons[a.id] })} className="accent-[#F26389]" />
                        <span className="flex-1">{a.name}</span>
                        <span className="font-bold text-[#F26389]">+₱{a.defaultPrice}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase">Custom Add-ons</label>
                  <button type="button" onClick={() => setCustomAddons((p) => [...p, { id: `c-${Date.now()}`, name: '', price: 0 }])} className="text-[10px] font-black uppercase text-[#F26389] hover:underline">+ Add</button>
                </div>
                {customAddons.map((a, i) => (
                  <div key={a.id} className="flex gap-2 mb-1.5">
                    <input value={a.name} onChange={(e) => setCustomAddons((p) => p.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} placeholder="Name" className="flex-1 px-2 py-1.5 border border-[#e6e4e6] dark:border-white/10 rounded-lg text-sm bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389]" />
                    <input type="number" value={a.price} onChange={(e) => setCustomAddons((p) => p.map((x, j) => j === i ? { ...x, price: Number(e.target.value) } : x))} placeholder="₱" className="w-20 px-2 py-1.5 border border-[#e6e4e6] dark:border-white/10 rounded-lg text-sm bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389]" />
                    <button type="button" onClick={() => setCustomAddons((p) => p.filter((_, j) => j !== i))} className="text-red-500 px-1 hover:bg-red-50 dark:hover:bg-red-500/10 rounded">✕</button>
                  </div>
                ))}
              </div>

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
                <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-[#e6e4e6] dark:border-white/10 rounded-xl font-bold uppercase text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 bg-[#F26389] text-white rounded-xl font-bold uppercase text-sm hover:bg-[#BF637C] disabled:opacity-50 transition-colors">
                  {isSubmitting ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Booking')}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BookingModal;
