import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import clsx from 'clsx';
import { formatLocalISO } from '../utils/dateMath.js';
import { timeToMinutes } from '../utils/slotGenerator.js';
import { getCategoryColor, hexToRgba } from '../config/palette.js';

const SLOT_HEIGHT_REM = 3.5;
const SLOT_MINUTES = 30;

const WeekView = ({ weekDays, slots, bookings = [], categories = [], activeDay, onSlotClick, onBookingClick }) => {
  const getSlotState = (dayIso, slotTime) => {
    const slotMins = timeToMinutes(slotTime);
    if (slotMins === null) return { booking: null, isStart: false, slotSpan: 1, isOccupied: false };

    const match = bookings.find((b) => {
      if (b.date !== dayIso) return false;
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
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.99 }}
      className="flex-1 overflow-x-auto overflow-y-hidden no-scrollbar border border-[#f4f2f4] dark:border-white/10 rounded-3xl bg-white dark:bg-[#0c0c0c]"
    >
      <div className="min-w-[700px] h-full flex flex-col">
        {/* Header */}
        <div className="flex border-b border-[#f4f2f4] dark:border-white/10 bg-[#fdfcfc] dark:bg-[#0c0c0c] sticky top-0 z-10">
          <div className="w-16 shrink-0 border-r border-[#f4f2f4] dark:border-white/10" />
          {weekDays.map((day) => {
            const iso = formatLocalISO(day);
            const isActive = activeDay === iso;
            return (
              <div
                key={iso}
                className={clsx('flex-1 py-4 text-center border-r border-[#f4f2f4] dark:border-white/10 last:border-r-0', isActive && 'bg-[#F26389]/5')}
              >
                <p className="text-[8px] font-black text-[#b1b1b1] uppercase tracking-[0.2em] mb-1">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </p>
                <p className={clsx('text-sm font-black tracking-tighter', isActive ? 'text-[#F26389]' : 'text-[#2f3035] dark:text-white')}>
                  {day.getDate()}
                </p>
                <p className="text-[8px] text-[#b1b1b1] font-bold uppercase tracking-widest mt-0.5">
                  {day.toLocaleDateString('en-US', { month: 'short' })}
                </p>
              </div>
            );
          })}
        </div>

        {/* Time grid */}
        <div className="flex-1 overflow-y-auto no-scrollbar flex max-h-[600px]">
          {/* Time labels */}
          <div className="sticky left-0 bg-[#fdfcfc] dark:bg-[#0c0c0c] w-16 shrink-0 border-r border-[#f4f2f4] dark:border-white/10">
            {slots.map((slot) => (
              <div key={slot} className="h-14 flex items-start justify-center pt-2 border-b border-[#f4f2f4]/50 dark:border-white/5 last:border-0">
                <span className="text-[10px] font-black opacity-30 uppercase tracking-tighter">
                  {slot.endsWith(':00') ? slot.split(':')[0] : ''}
                </span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          <div className="flex flex-1">
            {weekDays.map((day) => {
              const iso = formatLocalISO(day);
              return (
                <div key={iso} className="flex-1 border-r border-[#f4f2f4] dark:border-white/10 last:border-r-0">
                  {slots.map((slot) => {
                    const { booking, isStart, slotSpan, isOccupied } = getSlotState(iso, slot);
                    const color = booking ? getCategoryColor(booking.category || booking.serviceCategory, categories) : null;

                    return (
                      <div
                        key={`${iso}-${slot}`}
                        onClick={() => { if (!isOccupied) onSlotClick?.(iso, slot); }}
                        className={clsx(
                          'h-14 border-b border-[#f4f2f4]/50 dark:border-white/5 p-1.5 group relative cursor-pointer hover:bg-[#F26389]/5 transition-colors',
                          isOccupied && 'bg-[#F26389]/5'
                        )}
                      >
                        {booking && isStart ? (
                          <div
                            onClick={(e) => { e.stopPropagation(); onBookingClick?.(booking); }}
                            className="absolute left-1.5 right-1.5 top-1.5 z-10 bg-white dark:bg-[#151515] border rounded-xl p-2 shadow-sm flex flex-col justify-between overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                            style={{
                              height: `calc(${slotSpan} * ${SLOT_HEIGHT_REM}rem - 0.5rem)`,
                              borderColor: hexToRgba(color, 0.3),
                            }}
                          >
                            <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl" style={{ backgroundColor: color }} />
                            <div className="pl-1.5">
                              <span className="text-[7px] font-black uppercase" style={{ color }}>{booking.status}</span>
                              <h4 className="text-[10px] font-black uppercase tracking-tight leading-tight line-clamp-2 mt-0.5">{booking.clientName}</h4>
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-[#f4f2f4] dark:border-white/5 pl-1.5">
                              <span className="text-[7px] font-bold text-[#b1b1b1] uppercase truncate">{booking.serviceTitle}</span>
                            </div>
                          </div>
                        ) : !isOccupied ? (
                          <div className="w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Plus size={10} className="text-[#b1b1b1]" />
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WeekView;
