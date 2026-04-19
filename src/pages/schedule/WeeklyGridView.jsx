import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import clsx from 'clsx';

const SLOT_MINUTES = 30;
const SLOT_HEIGHT = 56; // px — matches h-14

const toMinutes = (timeValue) => {
    if (!timeValue || !String(timeValue).includes(':')) return null;
    const [hour, minute] = String(timeValue).split(':').map((part) => Number.parseInt(part, 10));
    if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
    return hour * 60 + minute;
};

/**
 * Greedy interval-coloring algorithm.
 * Returns the input appointments enriched with `col` (0-based column index)
 * and `totalCols` (max simultaneous columns during the event's time range).
 */
const computeOverlapLayout = (dayAppts) => {
    if (!dayAppts.length) return [];
    const sorted = [...dayAppts].sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin || String(a.id).localeCompare(String(b.id)));
    const colEnds = []; // track end-time of last event assigned to each column
    const assigned = sorted.map((appt) => {
        let col = colEnds.findIndex((e) => e <= appt.startMin);
        if (col === -1) { col = colEnds.length; colEnds.push(appt.endMin); }
        else { colEnds[col] = appt.endMin; }
        return { ...appt, col };
    });
    return assigned.map((appt) => {
        const totalCols = assigned
            .filter((o) => o.startMin < appt.endMin && o.endMin > appt.startMin)
            .reduce((m, o) => Math.max(m, o.col + 1), 1);
        return { ...appt, totalCols };
    });
};

const WeeklyGridView = ({ activeDay, fullWeek, hours, appointments, staffColors, onSlotClick, onAppointmentClick }) => {
    const firstHourMin = useMemo(() => toMinutes(hours[0] || '07:00'), [hours]);

    // Pre-compute overlap layout for every day in the week
    const dayLayouts = useMemo(() => {
        const result = {};
        fullWeek.forEach((day) => {
            const dayAppts = appointments
                .filter((a) => a.fullDate === day.fullDate)
                .map((a) => {
                    const start = toMinutes(a.startTime || a.time);
                    const end = toMinutes(a.endTime);
                    if (start === null) return null;
                    const resolvedEnd = end ?? (start + (Number(a.durationMinutes) || 60));
                    return { ...a, startMin: start, endMin: resolvedEnd };
                })
                .filter(Boolean);
            result[day.fullDate] = computeOverlapLayout(dayAppts);
        });
        return result;
    }, [fullWeek, appointments]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            className="h-full w-full overflow-x-auto overflow-y-hidden touch-pan-x no-scrollbar border border-[#f4f2f4] dark:border-white/10 rounded-3xl bg-white dark:bg-[#0c0c0c]"
        >
            <div className="min-w-250 h-full flex flex-col relative">
                {/* Day headers */}
                <div className="flex border-b border-[#f4f2f4] dark:border-white/10 bg-[#fdfcfc] dark:bg-[#0c0c0c] sticky top-0">
                    <div className="w-16 shrink-0 border-r border-[#f4f2f4] dark:border-white/10 bg-[#fdfcfc] dark:bg-[#0c0c0c] sticky left-0" />
                    {fullWeek.map((day) => (
                        <div
                            key={day.fullDate}
                            className={clsx(
                                'flex-1 py-4 text-center border-r border-[#f4f2f4] dark:border-white/10 last:border-r-0',
                                activeDay === day.fullDate && 'bg-[#F26389]/5'
                            )}
                        >
                            <p className="text-[8px] font-black text-[#b1b1b1] uppercase tracking-[0.2em] mb-1">{day.label}</p>
                            <p className={clsx('text-sm font-black tracking-tighter', activeDay === day.fullDate ? 'text-[#F26389]' : 'text-[#2f3035] dark:text-white')}>
                                {day.dateNumber}
                            </p>
                            <p className="text-[8px] text-[#b1b1b1] font-bold uppercase tracking-widest mt-0.5">{day.monthShort}</p>
                        </div>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar relative flex max-h-150">
                    {/* Hour labels — sticky on the left */}
                    <div className="sticky left-0 bg-[#fdfcfc] dark:bg-[#0c0c0c] w-16 shrink-0 border-r border-[#f4f2f4] dark:border-white/10 z-20">
                        {hours.map((hour) => (
                            <div key={hour} className="h-14 flex items-start justify-center pt-2 border-b border-[#f4f2f4]/50 dark:border-white/5 last:border-0">
                                <span className="text-[10px] font-black opacity-30 uppercase tracking-tighter">
                                    {hour.endsWith(':00') ? hour.split(':')[0] : ''}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Day columns */}
                    <div className="flex flex-1">
                        {fullWeek.map((day) => {
                            const layout = dayLayouts[day.fullDate] || [];
                            return (
                                <div key={day.fullDate} className="flex-1 border-r border-[#f4f2f4] dark:border-white/10 last:border-r-0 relative">
                                    {/* Grid lines + empty-slot click targets */}
                                    {hours.map((hour) => (
                                        <div
                                            key={`${day.fullDate}-${hour}`}
                                            onClick={() => onSlotClick?.(day.fullDate, hour)}
                                            className="h-14 border-b border-[#f4f2f4]/50 dark:border-white/5 group cursor-pointer hover:bg-[#F26389]/5 transition-colors flex items-center justify-center"
                                        >
                                            <Plus size={10} className="text-[#b1b1b1] opacity-0 group-hover:opacity-20 transition-opacity" />
                                        </div>
                                    ))}

                                    {/* Absolutely-positioned appointment cards */}
                                    {layout.map((appt) => {
                                        const top = ((appt.startMin - (firstHourMin ?? 0)) / SLOT_MINUTES) * SLOT_HEIGHT + 2;
                                        const height = Math.max(((appt.endMin - appt.startMin) / SLOT_MINUTES) * SLOT_HEIGHT - 4, 24);
                                        const GAP = 2;
                                        const leftPct = (appt.col / appt.totalCols) * 100;
                                        const widthPct = (1 / appt.totalCols) * 100;
                                        const isNarrow = appt.totalCols >= 3;

                                        return (
                                            <div
                                                key={appt.id}
                                                onClick={(e) => { e.stopPropagation(); onAppointmentClick?.(appt); }}
                                                className="absolute z-10 bg-white dark:bg-[#151515] border border-[#f4f2f4] dark:border-white/10 rounded-xl shadow-sm hover:shadow-lg hover:border-[#F26389]/30 transition-all cursor-pointer overflow-hidden"
                                                style={{
                                                    top: `${top}px`,
                                                    height: `${height}px`,
                                                    left: `calc(${leftPct}% + ${GAP}px)`,
                                                    width: `calc(${widthPct}% - ${GAP * 2}px)`,
                                                }}
                                            >
                                                <div className={clsx('absolute left-0 top-0 bottom-0 w-1 rounded-l-xl', staffColors[appt.staff]?.bg || 'bg-[#F26389]')} />
                                                <div className={clsx('h-full flex flex-col justify-between overflow-hidden pl-2', isNarrow ? 'p-1' : 'p-2')}>
                                                    <div>
                                                        <span className="text-[7px] font-black text-[#F26389] uppercase block leading-tight truncate">{appt.type}</span>
                                                        <h4 className={clsx('font-black uppercase tracking-tight leading-tight line-clamp-2', isNarrow ? 'text-[8px]' : 'text-[10px]')}>
                                                            {appt.name}
                                                        </h4>
                                                    </div>
                                                    {height > 44 && (
                                                        <div className="flex items-center justify-between border-t border-[#f4f2f4] dark:border-white/5 pt-1 mt-1">
                                                            <span className="text-[7px] font-bold text-[#b1b1b1] uppercase truncate">{appt.room}</span>
                                                            <span className={clsx('text-[7px] font-black uppercase ml-1 shrink-0', staffColors[appt.staff]?.text)}>
                                                                {appt.staff?.split(' ')?.pop()}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
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

export default WeeklyGridView;
