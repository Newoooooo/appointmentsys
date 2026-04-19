import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/style.css';
import { parseLocalISO, formatLocalISO } from '../utils/dateMath.js';
import { timeToMinutes, minutesToTime } from '../utils/slotGenerator.js';

const HOURS = Array.from({ length: 16 }, (_, i) => String(i + 6).padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];

const RescheduleModal = ({ isOpen, onClose, onReschedule, booking }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [hour, setHour] = useState('09');
  const [minute, setMinute] = useState('00');
  const [endHour, setEndHour] = useState('10');
  const [endMinute, setEndMinute] = useState('00');
  const [durationOverride, setDurationOverride] = useState('');
  const [useCustomEnd, setUseCustomEnd] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || !booking) return;
    const d = parseLocalISO(booking.date) || new Date();
    setSelectedDate(d);
    const [sh = '09', sm = '00'] = (booking.startTime || booking.time || '09:00').split(':');
    const [eh = '10', em = '00'] = (booking.endTime || '10:00').split(':');
    setHour(sh.padStart(2, '0'));
    setMinute(sm.padStart(2, '0'));
    setEndHour(eh.padStart(2, '0'));
    setEndMinute(em.padStart(2, '0'));
    setDurationOverride(String(booking.durationMinutes || ''));
    setUseCustomEnd(false);
    setReason('');
    setError('');
  }, [isOpen, booking]);

  // Auto-compute end time
  useEffect(() => {
    if (useCustomEnd) return;
    const durMins = durationOverride ? Number(durationOverride) : (Number(booking?.durationMinutes) || 60);
    const startMins = timeToMinutes(`${hour}:${minute}`);
    if (startMins === null) return;
    const [eh, em] = minutesToTime(startMins + durMins).split(':');
    setEndHour(eh);
    setEndMinute(em);
  }, [hour, minute, durationOverride, useCustomEnd, booking]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!selectedDate) { setError('Please select a date.'); return; }
    const newStartTime = `${hour}:${minute}`;
    const newEndTime = `${endHour}:${endMinute}`;
    if (timeToMinutes(newEndTime) <= timeToMinutes(newStartTime)) {
      setError('End time must be after start time.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onReschedule({
        newDate: formatLocalISO(selectedDate),
        newStartTime,
        newEndTime,
        durationMinutes: durationOverride ? Number(durationOverride) : booking?.durationMinutes,
        reason,
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to reschedule.');
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
          className="bg-white dark:bg-[#111] rounded-2xl max-w-2xl w-full max-h-[95vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between p-6 border-b border-[#f4f2f4] dark:border-white/10">
            <div>
              <h2 className="text-lg font-black uppercase tracking-wide">Reschedule Booking</h2>
              {booking && (
                <p className="text-xs text-[#b1b1b1] font-bold mt-0.5">{booking.clientName} · {booking.serviceTitle}</p>
              )}
            </div>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-all"><X size={20} /></button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date picker */}
            <div>
              <label className="block text-xs font-bold uppercase mb-1.5">New Date</label>
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

            {/* Time fields */}
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase mb-1.5">Start Time</label>
                <div className="flex gap-2 items-center">
                  <select value={hour} onChange={(e) => setHour(e.target.value)} className="flex-1 px-3 py-2 border border-[#e6e4e6] dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] text-sm">
                    {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <span className="text-[#b1b1b1] font-bold">:</span>
                  <select value={minute} onChange={(e) => setMinute(e.target.value)} className="flex-1 px-3 py-2 border border-[#e6e4e6] dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] text-sm">
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
                  value={durationOverride}
                  onChange={(e) => { setDurationOverride(e.target.value); setUseCustomEnd(false); }}
                  placeholder={String(booking?.durationMinutes || 60)}
                  className="w-full px-3 py-2 border border-[#e6e4e6] dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] text-sm"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase">End Time</label>
                  <label className="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer">
                    <input type="checkbox" checked={useCustomEnd} onChange={(e) => setUseCustomEnd(e.target.checked)} className="accent-[#F26389]" />
                    Override
                  </label>
                </div>
                <div className="flex gap-2 items-center">
                  <select value={endHour} onChange={(e) => setEndHour(e.target.value)} disabled={!useCustomEnd} className="flex-1 px-3 py-2 border border-[#e6e4e6] dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] text-sm disabled:opacity-60">
                    {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                  <span className="text-[#b1b1b1] font-bold">:</span>
                  <select value={endMinute} onChange={(e) => setEndMinute(e.target.value)} disabled={!useCustomEnd} className="flex-1 px-3 py-2 border border-[#e6e4e6] dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] text-sm disabled:opacity-60">
                    {MINUTES.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1.5">Reason (optional)</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Reason for rescheduling..."
                  rows={3}
                  className="w-full px-3 py-2 border border-[#e6e4e6] dark:border-white/10 rounded-lg bg-white dark:bg-[#0c0c0c] focus:outline-none focus:border-[#F26389] text-sm resize-none"
                />
              </div>
            </div>

            <div className="md:col-span-2 space-y-3">
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 text-xs font-bold">
                  {error}
                </div>
              )}
              <div className="flex gap-3">
                <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-[#e6e4e6] dark:border-white/10 rounded-xl font-bold uppercase text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-xl font-bold uppercase text-sm hover:bg-purple-700 disabled:opacity-50 transition-colors">
                  {isSubmitting ? 'Rescheduling...' : 'Confirm Reschedule'}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default RescheduleModal;
