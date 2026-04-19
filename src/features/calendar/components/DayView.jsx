import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import clsx from 'clsx';
import { formatLocalISO, formatFullDate } from '../utils/dateMath.js';
import { timeToMinutes } from '../utils/slotGenerator.js';
import { getCategoryColor, hexToRgba } from '../config/palette.js';
import { STATUS_LABELS } from '../config/statuses.js';
import { SLOT_START_HOUR, SLOT_INTERVAL_MINUTES } from '../config/constants.js';

const SLOT_HEIGHT_PX = 56; // h-14 = 3.5rem = 56px
const SLOT_MINUTES = SLOT_INTERVAL_MINUTES;
const DAY_START_MINUTES = SLOT_START_HOUR * 60;
const CARD_PADDING_PX = 4; // gap between column cards

/**
 * Assigns each booking a column index and total column count so that
 * overlapping bookings are rendered side-by-side (Google Calendar style).
 */
function computeColumnLayout(bookings) {
  if (!bookings.length) return [];

  const items = bookings.map((b) => {
    const start = timeToMinutes(b.startTime || b.time) ?? 0;
    const end = timeToMinutes(b.endTime) ?? (start + (Number(b.durationMinutes) || 60));
    return { booking: b, start, end, col: -1 };
  }).sort((a, b) => a.start - b.start);

  // Greedy column assignment: place each booking in the first column whose
  // last booking ended at or before this booking's start.
  const colEnds = []; // colEnds[c] = end minutes of last booking in column c
  items.forEach((item) => {
    const col = colEnds.findIndex((endMins) => endMins <= item.start);
    if (col === -1) {
      item.col = colEnds.length;
      colEnds.push(item.end);
    } else {
      item.col = col;
      colEnds[col] = item.end;
    }
  });

  // For each booking compute numCols = max col index among all overlapping + 1
  items.forEach((item) => {
    const maxCol = items
      .filter((other) => other.start < item.end && other.end > item.start)
      .reduce((m, o) => Math.max(m, o.col), 0);
    item.numCols = maxCol + 1;
  });

  return items;
}

const DayView = ({ date, slots, bookings = [], categories = [], onSlotClick, onBookingClick }) => {
  const iso = date instanceof Date ? formatLocalISO(date) : String(date);

  const [nowMinutes, setNowMinutes] = useState(() => {
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes();
  });

  useEffect(() => {
    const tick = () => {
      const n = new Date();
      setNowMinutes(n.getHours() * 60 + n.getMinutes());
    };
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  const nowTopPx = ((nowMinutes - DAY_START_MINUTES) / SLOT_MINUTES) * SLOT_HEIGHT_PX;
  const showNowLine = nowMinutes >= DAY_START_MINUTES && nowMinutes <= DAY_START_MINUTES + slots.length * SLOT_MINUTES;

  const dayBookings = useMemo(
    () => bookings.filter((b) => b.date === iso),
    [bookings, iso]
  );

  const layoutItems = useMemo(() => computeColumnLayout(dayBookings), [dayBookings]);

  const totalGridHeight = slots.length * SLOT_HEIGHT_PX;

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

        {/* Day column: dumb grid rows + absolutely-positioned booking cards */}
        <div className="flex-1 relative" style={{ height: `${totalGridHeight}px` }}>
          {/* Now line */}
          {showNowLine && (
            <div
              className="absolute left-0 right-0 z-20 pointer-events-none"
              style={{ top: `${nowTopPx}px` }}
            >
              <div className="flex items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 -ml-1.5" />
                <div className="flex-1 h-px bg-red-500" />
              </div>
            </div>
          )}

          {/* Clickable slot rows (background grid) */}
          {slots.map((slot) => (
            <div
              key={slot}
              onClick={() => onSlotClick?.(iso, slot)}
              className="h-14 border-b border-[#f4f2f4]/50 dark:border-white/5 group cursor-pointer hover:bg-[#F26389]/5 transition-colors"
            >
              <div className="h-full flex items-center gap-2 pl-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <Plus size={10} className="text-[#b1b1b1]" />
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#b1b1b1]">Available</span>
              </div>
            </div>
          ))}

          {/* Absolutely-positioned booking cards */}
          {layoutItems.map(({ booking, start, end, col, numCols }) => {
            const color = getCategoryColor(booking.category || booking.serviceCategory, categories);
            const topPx = ((start - DAY_START_MINUTES) / SLOT_MINUTES) * SLOT_HEIGHT_PX;
            const heightPx = Math.max(SLOT_HEIGHT_PX, ((end - start) / SLOT_MINUTES) * SLOT_HEIGHT_PX) - 4;
            const widthPct = 100 / numCols;
            const leftPct = (col / numCols) * 100;

            return (
              <div
                key={booking.id}
                onClick={(e) => { e.stopPropagation(); onBookingClick?.(booking); }}
                className="absolute z-10 bg-white dark:bg-[#111] border rounded-2xl p-3 shadow-sm hover:shadow-lg transition-all cursor-pointer flex flex-col gap-2 overflow-hidden"
                style={{
                  top: `${topPx + 2}px`,
                  height: `${heightPx}px`,
                  left: `calc(${leftPct}% + ${col === 0 ? 8 : CARD_PADDING_PX}px)`,
                  width: `calc(${widthPct}% - ${col === 0 ? 8 + CARD_PADDING_PX : CARD_PADDING_PX * 2}px - ${col === numCols - 1 ? 8 : 0}px)`,
                  borderColor: hexToRgba(color, 0.3),
                }}
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{ backgroundColor: color }} />
                <div className="pl-2 flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[8px] font-black uppercase" style={{ color }}>{STATUS_LABELS[booking.status] || booking.status}</span>
                    <span className="text-[8px] text-[#b1b1b1] font-bold">{booking.startTime} – {booking.endTime}</span>
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-tight leading-snug truncate">{booking.clientName}</h4>
                  <p className="text-[9px] text-[#b1b1b1] font-bold uppercase truncate">{booking.serviceTitle}{booking.staffName ? ` · ${booking.staffName}` : ''}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default DayView;
