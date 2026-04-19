import React, { useMemo } from 'react';
import clsx from 'clsx';
import { getMonthGrid, formatLocalISO, parseLocalISO, isToday, isSameDay } from '../utils/dateMath.js';
import { ACTIVE_STATUSES } from '../config/statuses.js';
import { getCategoryColor, hexToRgba } from '../config/palette.js';

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MonthView = ({ year, month, bookings = [], categories = [], activeDay, onDayClick }) => {
  const grid = useMemo(() => getMonthGrid(year, month), [year, month]);

  const bookingsByDay = useMemo(() => {
    const map = {};
    bookings.forEach((b) => {
      if (!b.date) return;
      if (!map[b.date]) map[b.date] = [];
      map[b.date].push(b);
    });
    return map;
  }, [bookings]);

  return (
    <div className="flex-1 overflow-auto no-scrollbar">
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAY_LABELS.map((d) => (
          <div key={d} className="text-center text-[9px] font-black uppercase tracking-[0.18em] text-[#b1b1b1] py-2">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 border-l border-t border-[#f4f2f4] dark:border-white/10">
        {grid.map((day) => {
          const iso = formatLocalISO(day);
          const isCurrentMonth = day.getMonth() === month;
          const todayFlag = isToday(day);
          const activeDayDate = activeDay
            ? (typeof activeDay === 'string' ? parseLocalISO(activeDay) : activeDay)
            : null;
          const isActive = activeDayDate ? isSameDay(day, activeDayDate) : false;
          const dayBookings = bookingsByDay[iso] || [];
          const activeBookings = dayBookings.filter((b) => ACTIVE_STATUSES.includes(b.status));

          return (
            <button
              key={iso}
              type="button"
              onClick={() => onDayClick(day)}
              className={clsx(
                'border-r border-b border-[#f4f2f4] dark:border-white/10 p-2 min-h-24 text-left flex flex-col gap-1 transition-colors',
                'hover:bg-[#F26389]/5',
                isActive && 'bg-[#F26389]/5',
                !isCurrentMonth && 'opacity-40'
              )}
            >
              <span
                className={clsx(
                  'w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-black',
                  todayFlag ? 'bg-[#F26389] text-white' : 'text-[#2f3035] dark:text-white'
                )}
              >
                {day.getDate()}
              </span>

              <div className="flex flex-col gap-0.5 flex-1">
                {activeBookings.slice(0, 3).map((b) => {
                  const color = getCategoryColor(b.category || b.serviceCategory, categories);
                  return (
                    <div
                      key={b.id}
                      className="text-[8px] font-bold truncate rounded px-1 py-0.5 leading-tight"
                      style={{ backgroundColor: hexToRgba(color, 0.15), color }}
                    >
                      {b.clientName || 'Booking'}
                    </div>
                  );
                })}
                {activeBookings.length > 3 && (
                  <div className="text-[8px] font-bold text-[#b1b1b1] px-1">
                    +{activeBookings.length - 3} more
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MonthView;
