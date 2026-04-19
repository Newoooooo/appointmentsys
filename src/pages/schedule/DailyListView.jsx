import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import clsx from 'clsx';
import { DaySelector } from './DaySelector.jsx';

const SLOT_MINUTES = 30;
const SLOT_HEIGHT = 56; // px — matches h-14
const MIN_COL_WIDTH = 180; // minimum px per overlap column for readability

const toMinutes = (timeValue) => {
    if (!timeValue || !String(timeValue).includes(':')) return null;
    const [hour, minute] = String(timeValue).split(':').map((part) => Number.parseInt(part, 10));
    if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
    return hour * 60 + minute;
};

/**
 * Greedy interval-coloring algorithm.
 * Returns appointments enriched with `col` and `totalCols`.
 */
const computeOverlapLayout = (dayAppts) => {
    if (!dayAppts.length) return [];
    const sorted = [...dayAppts].sort((a, b) => a.startMin - b.startMin);
    const colEnds = [];
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

const DailyListView = ({ activeDay, setActiveDay, fullWeek, hours, appointments, staffColors, onSlotClick, onAppointmentClick }) => {
    const firstHourMin = useMemo(() => toMinutes(hours[0] || '07:00'), [hours]);

    // Compute overlap layout for the active day
    const dayLayout = useMemo(() => {
        const dayAppts = appointments
            .filter((a) => a.fullDate === activeDay)
            .map((a) => {
                const start = toMinutes(a.startTime || a.time);
                const end = toMinutes(a.endTime);
                if (start === null) return null;
                const resolvedEnd = end ?? (start + (Number(a.durationMinutes) || 60));
                return { ...a, startMin: start, endMin: resolvedEnd };
            })
            .filter(Boolean);
        return computeOverlapLayout(dayAppts);
    }, [appointments, activeDay]);

    // Maximum simultaneous overlap columns for today → drives min-width for scroll
    const maxCols = useMemo(() => dayLayout.reduce((m, a) => Math.max(m, a.totalCols), 1), [dayLayout]);

    // Set of hour strings covered by at least one appointment (for dot / label styling)
    const occupiedSlots = useMemo(() => {
        const set = new Set();
        dayLayout.forEach((appt) => {
            const startSlotIndex = Math.floor((appt.startMin - (firstHourMin ?? 0)) / SLOT_MINUTES);
            const endSlotIndex = Math.ceil((appt.endMin - (firstHourMin ?? 0)) / SLOT_MINUTES);
            for (let i = Math.max(0, startSlotIndex); i < Math.min(hours.length, endSlotIndex); i++) {
                set.add(hours[i]);
            }
        });
        return set;
    }, [dayLayout, firstHourMin, hours]);

    const totalHeight = hours.length * SLOT_HEIGHT;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="h-full no-scrollbar"
        >
            <DaySelector fullWeek={fullWeek} activeDay={activeDay} onSelectDay={setActiveDay} />

            <div className="flex max-h-150 overflow-y-auto no-scrollbar">
                {/* Hour labels column */}
                <div className="w-14 shrink-0">
                    {hours.map((hour) => (
                        <div key={hour} className="h-14 flex items-start justify-end pr-3 pt-2">
                            <span className={clsx(
                                'text-[10px] font-black uppercase tracking-tighter transition-opacity',
                                occupiedSlots.has(hour) ? 'opacity-100 text-[#F26389]' : 'opacity-20'
                            )}>
                                {hour.endsWith(':00') ? hour.split(':')[0] : ''}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Content area — overflow-x-auto enables horizontal scroll on mobile when overlaps are wide */}
                <div className="flex-1 overflow-x-auto">
                    <div
                        className="relative border-l border-[#f4f2f4] dark:border-white/5"
                        style={{ height: `${totalHeight}px`, minWidth: `${maxCols * MIN_COL_WIDTH}px` }}
                    >
                        {/* Grid lines + empty-slot click targets */}
                        {hours.map((hour) => {
                            const slotTop = ((toMinutes(hour) ?? 0) - (firstHourMin ?? 0)) / SLOT_MINUTES * SLOT_HEIGHT;
                            const isOccupied = occupiedSlots.has(hour);
                            return (
                                <div
                                    key={hour}
                                    className="absolute w-full border-b border-[#f4f2f4] dark:border-white/5 cursor-pointer hover:bg-[#F26389]/5 transition-colors group"
                                    style={{ top: `${slotTop}px`, height: `${SLOT_HEIGHT}px` }}
                                    onClick={() => onSlotClick?.(activeDay, hour)}
                                >
                                    {/* Timeline dot */}
                                    <div className={clsx(
                                        'absolute -left-1 top-2.5 w-2 h-2 rounded-full border-2 border-[#fdfcfc] dark:border-[#080808] z-10',
                                        isOccupied ? 'bg-[#F26389]' : 'bg-[#f4f2f4] dark:bg-white/10'
                                    )} />
                                    {!isOccupied && (
                                        <div className="h-full flex items-center pl-8">
                                            <button
                                                type="button"
                                                className="h-8 flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.2em] text-[#b1b1b1] opacity-0 group-hover:opacity-100 transition-all pointer-events-none"
                                            >
                                                <Plus size={10} strokeWidth={3} /> Slot Available
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Absolutely-positioned appointment cards */}
                        {dayLayout.map((appt) => {
                            const top = ((appt.startMin - (firstHourMin ?? 0)) / SLOT_MINUTES) * SLOT_HEIGHT + 2;
                            const height = Math.max(((appt.endMin - appt.startMin) / SLOT_MINUTES) * SLOT_HEIGHT - 4, 28);
                            const GAP = 4;
                            const leftPct = (appt.col / appt.totalCols) * 100;
                            const widthPct = (1 / appt.totalCols) * 100;

                            return (
                                <div
                                    key={appt.id}
                                    className="absolute z-10 bg-white dark:bg-[#111] border border-[#f4f2f4] dark:border-white/10 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all cursor-pointer overflow-hidden"
                                    style={{
                                        top: `${top}px`,
                                        height: `${height}px`,
                                        left: `calc(${leftPct}% + ${GAP}px)`,
                                        width: `calc(${widthPct}% - ${GAP * 2}px)`,
                                    }}
                                    onClick={(e) => { e.stopPropagation(); onAppointmentClick?.(appt); }}
                                >
                                    {/* Category / staff color bar */}
                                    <div className={clsx('absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl', staffColors[appt.staff]?.bg || 'bg-[#F26389]')} />
                                    <div className="h-full flex flex-col justify-between p-3 pl-4 overflow-hidden">
                                        <div className="space-y-1">
                                            <span className="text-[8px] font-black text-[#F26389] bg-[#F26389]/5 px-2 py-0.5 rounded uppercase tracking-widest inline-block">
                                                {appt.type}
                                            </span>
                                            <h3 className="text-xs font-black uppercase tracking-tight leading-snug line-clamp-2">
                                                {appt.name}
                                            </h3>
                                        </div>
                                        {height > 64 && (
                                            <div className="flex items-center justify-between pt-2 border-t border-[#f4f2f4] dark:border-white/5">
                                                <p className="text-[8px] font-bold text-[#b1b1b1] uppercase flex items-center gap-1 truncate">
                                                    {(appt.startTime || appt.time)}{appt.endTime ? ` \u2013 ${appt.endTime}` : ''} \u00b7 {appt.room}
                                                </p>
                                                <span className={clsx('text-[8px] font-black uppercase tracking-widest ml-1 shrink-0', staffColors[appt.staff]?.text)}>
                                                    {appt.staff}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default DailyListView;
