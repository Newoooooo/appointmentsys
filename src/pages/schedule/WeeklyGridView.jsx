import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import clsx from 'clsx';

const SLOT_HEIGHT_PX = 56; // h-14
const SLOT_MINUTES = 30;
const DAY_START_MINUTES = 7 * 60;

const toMinutes = (timeValue) => {
    if (!timeValue || !String(timeValue).includes(':')) return null;
    const [hour, minute] = String(timeValue).split(':').map((part) => Number.parseInt(part, 10));
    if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
    return hour * 60 + minute;
};

const toAmPm = (time24) => {
    if (!time24 || !String(time24).includes(':')) return time24;
    const [hourStr, minute] = String(time24).split(':');
    const hour = Number.parseInt(hourStr, 10);
    if (Number.isNaN(hour)) return time24;
    const ampm = hour < 12 ? 'AM' : 'PM';
    const h = hour % 12 || 12;
    return `${h}${minute === '00' ? '' : `:${minute}`} ${ampm}`;
};

const WeeklyGridView = ({ activeDay, fullWeek, hours, appointments, getCategoryColor, onSlotClick, onAppointmentClick }) => {
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
    const showNowLine = nowMinutes >= DAY_START_MINUTES && nowMinutes <= DAY_START_MINUTES + hours.length * SLOT_MINUTES;

    const getAppointmentsStartingAt = (dayFullDate, hour) => {
        const slotMinutes = toMinutes(hour);
        if (slotMinutes === null) return [];

        return appointments
            .filter((item) => {
                if (item.fullDate !== dayFullDate) return false;
                const start = toMinutes(item.startTime || item.time);
                return start === slotMinutes;
            })
            .map((item) => {
                const startMinutes = toMinutes(item.startTime || item.time);
                const endMinutes = toMinutes(item.endTime);
                const resolvedEnd = endMinutes ?? (startMinutes + (Number(item.durationMinutes) || 60));
                const slotSpan = Math.max(1, Math.ceil((resolvedEnd - startMinutes) / SLOT_MINUTES));
                return { appointment: item, slotSpan };
            });
    };

    const isSlotOccupied = (dayFullDate, hour) => {
        const slotMinutes = toMinutes(hour);
        if (slotMinutes === null) return false;
        return appointments.some((item) => {
            if (item.fullDate !== dayFullDate) return false;
            const start = toMinutes(item.startTime || item.time);
            const end = toMinutes(item.endTime);
            if (start === null) return false;
            const resolvedEnd = end ?? (start + (Number(item.durationMinutes) || 60));
            return slotMinutes >= start && slotMinutes < resolvedEnd;
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            className="h-full w-full overflow-x-auto overflow-y-hidden touch-pan-x no-scrollbar border border-[#f4f2f4] dark:border-white/10 rounded-3xl bg-white dark:bg-[#0c0c0c]"
        >
            <div className="min-w-250 h-full flex flex-col relative">
                <div className="flex border-b border-[#f4f2f4] dark:border-white/10 bg-[#fdfcfc] dark:bg-[#0c0c0c] sticky top-0 z-20">
                    <div className="w-20 shrink-0 border-r border-[#f4f2f4] dark:border-white/10 bg-[#fdfcfc] dark:bg-[#0c0c0c] sticky left-0" />

                    {fullWeek.map((day) => (
                        <div
                            key={day.fullDate}
                            className={clsx(
                                'flex-1 py-4 text-center border-r border-[#f4f2f4] dark:border-white/10 last:border-r-0',
                                activeDay === day.fullDate && 'bg-[#F26389]/5'
                            )}
                        >
                            <p className="text-[8px] font-black text-[#767676] dark:text-[#a0a0a0] uppercase tracking-[0.2em] mb-1">{day.label}</p>
                            <p
                                className={clsx(
                                    'text-sm font-black tracking-tighter',
                                    activeDay === day.fullDate ? 'text-[#F26389]' : 'text-[#2f3035] dark:text-white'
                                )}
                            >
                                {day.dateNumber}
                            </p>
                            <p className="text-[8px] text-[#767676] dark:text-[#a0a0a0] font-bold uppercase tracking-widest mt-0.5">{day.monthShort}</p>
                        </div>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar relative flex max-h-150">
                    <div className="sticky left-0 bg-[#fdfcfc] dark:bg-[#0c0c0c] w-20 shrink-0 border-r border-[#f4f2f4] dark:border-white/10 z-10">
                        {hours.map((hour) => (
                            <div key={hour} className="h-14 flex items-start justify-end pr-2 pt-2 border-b border-[#f4f2f4]/50 dark:border-white/5 last:border-0">
                                <span className="text-[9px] font-black opacity-40 whitespace-nowrap">
                                    {hour.endsWith(':00') ? toAmPm(hour) : ''}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-1 relative">
                        {/* Current time indicator */}
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

                        {fullWeek.map((day) => (
                            <div key={day.fullDate} className="flex-1 border-r border-[#f4f2f4] dark:border-white/10 last:border-r-0 min-h-full">
                                {hours.map((hour) => {
                                    const startingAppts = getAppointmentsStartingAt(day.fullDate, hour);
                                    const occupied = isSlotOccupied(day.fullDate, hour);

                                    return (
                                        <div
                                            key={`${day.fullDate}-${hour}`}
                                            onClick={() => {
                                                if (!occupied) {
                                                    onSlotClick?.(day.fullDate, hour);
                                                }
                                            }}
                                            className={clsx(
                                                'h-14 border-b border-[#f4f2f4]/50 dark:border-white/5 p-1.5 group relative cursor-pointer hover:bg-[#F26389]/5 transition-colors',
                                                occupied && 'bg-[#F26389]/5'
                                            )}
                                        >
                                            {startingAppts.length > 0 ? (() => {
                                                const maxSpan = Math.max(...startingAppts.map((a) => a.slotSpan));
                                                return (
                                                    <div
                                                        className="absolute left-1.5 right-1.5 top-1.5 z-10 flex gap-0.5"
                                                        style={{ height: `calc(${maxSpan} * 3.5rem - 0.5rem)` }}
                                                    >
                                                    {startingAppts.map(({ appointment: appt, slotSpan }, idx) => {
                                                        const catColor = getCategoryColor?.(appt.category) || '#F26389';
                                                        return (
                                                            <div
                                                                key={appt.id || idx}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onAppointmentClick?.(appt);
                                                                }}
                                                                className="flex-1 min-w-0 bg-white dark:bg-[#151515] border border-[#f4f2f4] dark:border-white/10 rounded-xl p-2 shadow-sm flex flex-col justify-between overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                                                                style={{
                                                                    height: `calc(${slotSpan} * 3.5rem - 0.5rem)`,
                                                                    borderLeftColor: catColor,
                                                                    borderLeftWidth: 3
                                                                }}
                                                            >
                                                                <div className="space-y-1">
                                                                    <span className="text-[7px] font-black uppercase" style={{ color: catColor }}>{appt.category || appt.type}</span>
                                                                    <h4 className="text-[10px] font-black uppercase tracking-tight leading-tight line-clamp-2">{appt.name}</h4>
                                                                </div>
                                                                <div className="flex items-center justify-between pt-2 border-t border-[#f4f2f4] dark:border-white/5">
                                                                    <span className="text-[7px] font-bold text-[#767676] dark:text-[#a0a0a0] uppercase">{appt.room}</span>
                                                                    <span className="text-[7px] font-black uppercase" style={{ color: catColor }}>
                                                                        {appt.staff?.split(' ')?.pop()}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                    </div>
                                                );
                                            })() : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Plus size={10} className="text-[#767676] dark:text-[#a0a0a0] opacity-20" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default WeeklyGridView;
