import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import clsx from 'clsx';
import { formatLocalISO, formatFullDate } from '../utils/dateMath.js';
import { timeToMinutes, formatTimeLabel } from '../utils/slotGenerator.js';
import { getCategoryColor, hexToRgba } from '../config/palette.js';
import { STATUS_LABELS } from '../config/statuses.js';

const SLOT_MINUTES = 30;

const DayView = ({ date, slots, bookings = [], categories = [], onSlotClick, onBookingClick }) => {
  const iso = date instanceof Date ? formatLocalISO(date) : String(date);

  const getSlotState = (slotTime) => {
    const slotMins = timeToMinutes(slotTime);
    if (slotMins === null) return { booking: null, isStart: false, slotSpan: 1, isOccupied: false };
    const match = bookings.find((b) => {
      if (b.date !== iso) return false;
      const start = timeToMinutes(b.startTime || b.time);
      if (start === null) return false;
      const end = timeToMinutes(b.endTime) ?? (start + (Number(b.durationMinutes) || 60));
      return slotMins >= start && slotMins < end;
    });
    if (!match) return { booking: null, isStart: false, slotSpan: 1, isOccupied: false };
    const start = timeToMinutes(match.startTime || match.time);
    const end = timeToMinutes(match.endTime) ?? (start + (Number(match.durationMinutes) || 60));
    const slotSpan = Math.max(1, Math.ceil((end - start) / SLOT_MINUTES));
    return { booking: match, isStart: slotMins === start, slotSpan, isOccupied: true };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex-1 border border-[#f4f2f4] dark:border-white/10 rounded-3xl bg-white dark:bg-[#0c0c0c] overflow-hidden flex flex-col"
    >
      <div className="px-6 py-4 border-b border-[#f4f2f4] dark:border-white/10 bg-[#fdfcfc] dark:bg-[#0c0c0c] sticky top-0">
        <p className="text-sm font-black tracking-tight text-[#2f3035] dark:text-white">
          {date instanceof Date ? formatFullDate(date) : date}
        </p>
      </div>

      <div className="flex flex-1 overflow-y-auto no-scrollbar max-h-[600px]">
        {/* Time labels */}
        <div className="w-16 shrink-0 border-r border-[#f4f2f4] dark:border-white/10">
          {slots.map((slot) => (
            <div key={slot} className="h-14 flex items-start justify-center pt-2 border-b border-[#f4f2f4]/50 dark:border-white/5 last:border-0">
              <span className="text-[10px] font-black opacity-30 uppercase tracking-tighter">
                {slot.endsWith(':00') ? slot.split(':')[0] : ''}
              </span>
            </div>
          ))}
        </div>

        {/* Single day column */}
        <div className="flex-1">
          {slots.map((slot) => {
            const { booking, isStart, slotSpan, isOccupied } = getSlotState(slot);
            const color = booking ? getCategoryColor(booking.category || booking.serviceCategory, categories) : null;

            return (
              <div
                key={slot}
                onClick={() => { if (!isOccupied) onSlotClick?.(iso, slot); }}
                className={clsx(
                  'h-14 border-b border-[#f4f2f4]/50 dark:border-white/5 pl-8 pr-4 group relative cursor-pointer hover:bg-[#F26389]/5 transition-colors',
                  isOccupied && 'bg-[#F26389]/5'
                )}
              >
                {booking && isStart ? (
                  <div
                    onClick={(e) => { e.stopPropagation(); onBookingClick?.(booking); }}
                    className="absolute left-8 right-4 top-1 z-10 bg-white dark:bg-[#111] border rounded-2xl p-3 shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col gap-2"
                    style={{
                      height: `calc(${slotSpan} * 3.5rem - 0.25rem)`,
                      borderColor: hexToRgba(color, 0.3),
                    }}
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ backgroundColor: color }} />
                    <div className="pl-2 flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-black uppercase" style={{ color }}>{STATUS_LABELS[booking.status] || booking.status}</span>
                        <span className="text-[8px] text-[#b1b1b1] font-bold">{booking.startTime} – {booking.endTime}</span>
                      </div>
                      <h4 className="text-xs font-black uppercase tracking-tight leading-snug">{booking.clientName}</h4>
                      <p className="text-[9px] text-[#b1b1b1] font-bold uppercase">{booking.serviceTitle} {booking.staffName ? `· ${booking.staffName}` : ''}</p>
                    </div>
                  </div>
                ) : !isOccupied ? (
                  <div className="h-full flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Plus size={10} className="text-[#b1b1b1]" />
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#b1b1b1]">Available</span>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default DayView;
