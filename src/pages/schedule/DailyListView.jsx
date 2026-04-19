import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Plus } from 'lucide-react';
import clsx from 'clsx';
import { DaySelector } from './DaySelector.jsx';

const SLOT_HEIGHT_PX = 56; // h-14 = 3.5rem = 56px
const SLOT_MINUTES = 30;
const DAY_START_MINUTES = 7 * 60; // 07:00
const MIN_COL_WIDTH = 180; // minimum px per overlap column

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

/**
 * Greedy interval-coloring algorithm.
 * Returns appointments enriched with `col` (0-based) and `totalCols`.
 */
const computeOverlapLayout = (appts) => {
    if (!appts.length) return [];
    const sorted = [...appts].sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin || String(a.id).localeCompare(String(b.id)));
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

const DailyListView = ({ activeDay, setActiveDay, fullWeek, hours, appointments, getCategoryColor, onSlotClick, onAppointmentClick }) => {
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

    // Build overlap layout for the active day
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

    // Max simultaneous columns → drives min-width so horizontal scroll works on mobile
    const maxCols = useMemo(() => dayLayout.reduce((m, a) => Math.max(m, a.totalCols), 1), [dayLayout]);

    // Set of minute values covered by at least one appointment (for dot styling)
    const occupiedMinutesSet = useMemo(() => {
        const set = new Set();
        dayLayout.forEach((appt) => {
            for (let m = appt.startMin; m < appt.endMin; m += SLOT_MINUTES) {
                set.add(m);
            }
        });
        return set;
    }, [dayLayout]);

    // Per-slot: first category color (for dot colour)
    const slotDotColor = useMemo(() => {
        const map = new Map();
        dayLayout.forEach((appt) => {
            const slotMin = toMinutes(appt.startTime || appt.time);
            if (slotMin !== null && !map.has(slotMin)) {
                map.set(slotMin, getCategoryColor?.(appt.category) || '#F26389');
            }
        });
        return map;
    }, [dayLayout, getCategoryColor]);

    const totalHeight = hours.length * SLOT_HEIGHT_PX;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="h-full no-scrollbar"
        >
            <DaySelector fullWeek={fullWeek} activeDay={activeDay} onSelectDay={setActiveDay} />

            <div className="flex max-h-150 overflow-y-auto no-scrollbar relative">
                {/* Hour labels column */}
                <div className="w-14 shrink-0">
                    {hours.map((hour) => {
                        const slotMin = toMinutes(hour) ?? 0;
                        const isOccupied = occupiedMinutesSet.has(slotMin);
                        return (
                            <div key={hour} className="h-14 flex items-start justify-end pr-3 pt-2">
                                <span className={clsx(
                                    'text-[9px] font-black uppercase tracking-tighter transition-opacity whitespace-nowrap',
                                    isOccupied ? 'opacity-100 text-[#F26389]' : 'opacity-20'
                                )}>
                                    {hour.endsWith(':00') ? toAmPm(hour) : ''}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {/* Content area */}
                <div className="flex-1 overflow-x-auto">
                    <div
                        className="relative border-l border-[#f4f2f4] dark:border-white/5"
                        style={{ height: `${totalHeight}px`, minWidth: `${maxCols * MIN_COL_WIDTH}px` }}
                    >
                        {/* Current time indicator */}
                        {showNowLine && (
                            <div
                                className="absolute left-0 right-0 z-20 pointer-events-none"
                                style={{ top: `${nowTopPx}px` }}
                            >
                                <div className="flex items-center gap-1 ml-0">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 -ml-1.5" />
                                    <div className="flex-1 h-px bg-red-500" />
                                </div>
                            </div>
                        )}

                        {/* Grid lines + empty-slot click targets */}
                        {hours.map((hour) => {
                            const slotMin = toMinutes(hour) ?? 0;
                            const slotTop = ((slotMin - DAY_START_MINUTES) / SLOT_MINUTES) * SLOT_HEIGHT_PX;
                            const isOccupied = occupiedMinutesSet.has(slotMin);
                            const dotColor = slotDotColor.get(slotMin) ?? null;
                            return (
                                <div
                                    key={hour}
                                    className="absolute w-full border-b border-[#f4f2f4] dark:border-white/5 cursor-pointer hover:bg-[#F26389]/5 transition-colors group"
                                    style={{ top: `${slotTop}px`, height: `${SLOT_HEIGHT_PX}px` }}
                                    onClick={() => { if (!isOccupied) onSlotClick?.(activeDay, hour); }}
                                >
                                    {/* Timeline dot */}
                                    <div
                                        className="absolute -left-1 top-2.5 w-2 h-2 rounded-full border-2 border-[#fdfcfc] dark:border-[#080808] z-10 transition-colors"
                                        style={isOccupied && dotColor
                                            ? { backgroundColor: dotColor }
                                            : { backgroundColor: '#e5e3e5' }}
                                    />
                                    {!isOccupied && (
                                        <div className="h-full flex items-center pl-8">
                                            <button
                                                type="button"
                                                className="h-8 flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.2em] text-[#767676] dark:text-[#a0a0a0] opacity-0 group-hover:opacity-100 transition-all pointer-events-none"
                                            >
                                                <Plus size={10} strokeWidth={3} /> Slot Available
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {/* Absolutely-positioned appointment cards — side-by-side for overlaps */}
                        {dayLayout.map((appt) => {
                            const top = ((appt.startMin - DAY_START_MINUTES) / SLOT_MINUTES) * SLOT_HEIGHT_PX + 2;
                            const height = Math.max(((appt.endMin - appt.startMin) / SLOT_MINUTES) * SLOT_HEIGHT_PX - 4, 28);
                            const GAP = 4;
                            const leftPct = (appt.col / appt.totalCols) * 100;
                            const widthPct = (1 / appt.totalCols) * 100;
                            const color = getCategoryColor?.(appt.category) || '#F26389';

                            return (
                                <div
                                    key={appt.id}
                                    className="absolute z-10 bg-white dark:bg-[#111] border border-[#f4f2f4] dark:border-white/10 rounded-2xl shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all cursor-pointer overflow-hidden"
                                    style={{
                                        top: `${top}px`,
                                        height: `${height}px`,
                                        left: `calc(${leftPct}% + ${GAP}px)`,
                                        width: `calc(${widthPct}% - ${GAP * 2}px)`,
                                        borderLeftColor: color,
                                        borderLeftWidth: 3,
                                    }}
                                    onClick={(e) => { e.stopPropagation(); onAppointmentClick?.(appt); }}
                                >
                                    <div className="h-full flex flex-col justify-between p-3 pl-4 overflow-hidden">
                                        <div className="space-y-1">
                                            <span
                                                className="text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest inline-block"
                                                style={{ color, backgroundColor: `${color}18` }}
                                            >
                                                {appt.category || appt.type}
                                            </span>
                                            <h3 className="text-xs font-black uppercase tracking-tight leading-snug line-clamp-2">
                                                {appt.name}
                                            </h3>
                                        </div>
                                        {height > 64 && (
                                            <div className="flex items-center justify-between pt-2 border-t border-[#f4f2f4] dark:border-white/5">
                                                <p className="text-[8px] font-bold text-[#767676] dark:text-[#a0a0a0] uppercase flex items-center gap-1 truncate">
                                                    <Clock size={9} /> {(appt.startTime || appt.time)}{appt.endTime ? ` – ${appt.endTime}` : ''} · {appt.room}
                                                </p>
                                                <span className="text-[8px] font-black uppercase tracking-widest ml-1 shrink-0" style={{ color }}>
                                                    {appt.staff?.split(' ')?.pop()}
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
