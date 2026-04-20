import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
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

/**
 * Greedy interval-coloring algorithm.
 * Returns the input appointments enriched with `col` (0-based column index)
 * and `totalCols` (max simultaneous columns during the event's time range).
 */
const computeOverlapLayout = (dayAppts) => {
    if (!dayAppts.length) return [];
    const sorted = [...dayAppts].sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin || String(a.id).localeCompare(String(b.id)));
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
                            <p className={clsx('text-sm font-black tracking-tighter', activeDay === day.fullDate ? 'text-[#F26389]' : 'text-[#2f3035] dark:text-white')}>
                                {day.dateNumber}
                            </p>
                            <p className="text-[8px] text-[#767676] dark:text-[#a0a0a0] font-bold uppercase tracking-widest mt-0.5">{day.monthShort}</p>
                        </div>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar relative flex max-h-150">
                    {/* Hour labels — sticky on the left */}
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

                        {/* Day columns */}
                        {fullWeek.map((day) => {
                            const layout = dayLayouts[day.fullDate] || [];
                            return (
                                <div key={day.fullDate} className="flex-1 border-r border-[#f4f2f4] dark:border-white/10 last:border-r-0 relative min-h-full">
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

                                    {/* Absolutely-positioned appointment cards — side-by-side for overlaps */}
                                    {layout.map((appt) => {
                                        const top = ((appt.startMin - DAY_START_MINUTES) / SLOT_MINUTES) * SLOT_HEIGHT_PX + 2;
                                        const height = Math.max(((appt.endMin - appt.startMin) / SLOT_MINUTES) * SLOT_HEIGHT_PX - 4, 24);
                                        const GAP = 2;
                                        const leftPct = (appt.col / appt.totalCols) * 100;
                                        const widthPct = (1 / appt.totalCols) * 100;
                                        const isNarrow = appt.totalCols >= 3;
                                        const color = getCategoryColor?.(appt.category) || '#F26389';

                                        return (
                                            <div
                                                key={appt.id}
                                                onClick={(e) => { e.stopPropagation(); onAppointmentClick?.(appt); }}
                                                className="absolute z-10 bg-white dark:bg-[#151515] border border-[#f4f2f4] dark:border-white/10 rounded-xl shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden"
                                                style={{
                                                    top: `${top}px`,
                                                    height: `${height}px`,
                                                    left: `calc(${leftPct}% + ${GAP}px)`,
                                                    width: `calc(${widthPct}% - ${GAP * 2}px)`,
                                                    borderLeftColor: color,
                                                    borderLeftWidth: 3,
                                                }}
                                            >
                                                <div className={clsx('h-full flex flex-col justify-between overflow-hidden', isNarrow ? 'p-1' : 'p-2')}>
                                                    <div>
                                                        <span className="text-[7px] font-black uppercase block leading-tight truncate" style={{ color }}>
                                                            {appt.category || appt.type}
                                                        </span>
                                                        <h4 className={clsx('font-black uppercase tracking-tight leading-tight line-clamp-2', isNarrow ? 'text-[8px]' : 'text-[10px]')}>
                                                            {appt.name}
                                                        </h4>
                                                    </div>
                                                    {height > 44 && (
                                                        <div className="flex items-center justify-between border-t border-[#f4f2f4] dark:border-white/5 pt-1 mt-1">
                                                            <span className="text-[7px] font-bold text-[#767676] dark:text-[#a0a0a0] uppercase truncate">{appt.room}</span>
                                                            <span className="text-[7px] font-black uppercase ml-1 shrink-0" style={{ color }}>
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

class WeekViewErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="flex-1 flex items-center justify-center border border-[#f4f2f4] dark:border-white/10 rounded-3xl bg-white dark:bg-[#0c0c0c] text-[#b1b1b1] text-sm font-bold">
                    Week view unavailable — please refresh.
                </div>
            );
        }
        return this.props.children;
    }
}

const WeeklyGridViewWithBoundary = (props) => (
    <WeekViewErrorBoundary>
        <WeeklyGridView {...props} />
    </WeekViewErrorBoundary>
);

export default WeeklyGridViewWithBoundary;
