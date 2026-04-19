import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const formatLocalISODate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const MonthView = ({
    activeDay,
    onSelectDay,
    appointments = [],
    currentWeekStart,
    onPrevMonth,
    onNextMonth,
    getCategoryColor,
    todayIso
}) => {
    const monthStart = useMemo(() => {
        const d = new Date(currentWeekStart);
        d.setDate(1);
        d.setHours(0, 0, 0, 0);
        return d;
    }, [currentWeekStart]);

    const { weeks, monthLabel } = useMemo(() => {
        const year = monthStart.getFullYear();
        const month = monthStart.getMonth();
        const label = monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        // First day of month (0=Sun, 1=Mon … 6=Sat) → convert to Mon-based offset
        const firstDow = monthStart.getDay();
        const mondayOffset = (firstDow + 6) % 7; // 0=Mon

        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const totalCells = Math.ceil((mondayOffset + daysInMonth) / 7) * 7;

        const cells = [];
        for (let i = 0; i < totalCells; i++) {
            const dayNum = i - mondayOffset + 1;
            if (dayNum < 1 || dayNum > daysInMonth) {
                cells.push(null);
            } else {
                cells.push(new Date(year, month, dayNum));
            }
        }

        const rows = [];
        for (let i = 0; i < cells.length; i += 7) {
            rows.push(cells.slice(i, i + 7));
        }
        return { weeks: rows, monthLabel: label };
    }, [monthStart]);

    // Build a map: isoDate → appointments[]
    const appointmentsByDay = useMemo(() => {
        const map = {};
        appointments.forEach((appt) => {
            const key = appt.fullDate;
            if (!key) return;
            if (!map[key]) map[key] = [];
            map[key].push(appt);
        });
        return map;
    }, [appointments]);

    return (
        <motion.div
            key="month"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="h-full flex flex-col overflow-hidden"
        >
            {/* Month nav */}
            <div className="flex items-center justify-between mb-4 shrink-0">
                <button
                    type="button"
                    onClick={onPrevMonth}
                    className="h-8 w-8 rounded-lg border border-[#e6e4e6] dark:border-white/10 text-[#767676] dark:text-[#a0a0a0] hover:border-[#F26389] hover:text-[#F26389] flex items-center justify-center transition-all"
                >
                    <ChevronLeft size={14} />
                </button>
                <p className="text-sm font-black tracking-tight">{monthLabel}</p>
                <button
                    type="button"
                    onClick={onNextMonth}
                    className="h-8 w-8 rounded-lg border border-[#e6e4e6] dark:border-white/10 text-[#767676] dark:text-[#a0a0a0] hover:border-[#F26389] hover:text-[#F26389] flex items-center justify-center transition-all"
                >
                    <ChevronRight size={14} />
                </button>
            </div>

            {/* Day-of-week headers */}
            <div className="grid grid-cols-7 mb-1 shrink-0">
                {DAYS_OF_WEEK.map((d) => (
                    <div key={d} className="text-center text-[8px] font-black uppercase tracking-widest text-[#767676] dark:text-[#a0a0a0] py-1">
                        {d}
                    </div>
                ))}
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
                <div className="grid grid-cols-7 gap-1">
                    {weeks.flat().map((date, idx) => {
                        if (!date) {
                            return <div key={`empty-${idx}`} className="min-h-[80px]" />;
                        }
                        const iso = formatLocalISODate(date);
                        const dayAppts = appointmentsByDay[iso] || [];
                        const isToday = iso === todayIso;
                        const isActive = iso === activeDay;

                        return (
                            <button
                                key={iso}
                                type="button"
                                onClick={() => onSelectDay(iso)}
                                className={clsx(
                                    'min-h-[80px] p-1.5 rounded-xl border text-left flex flex-col gap-1 transition-all hover:border-[#F26389]/50',
                                    isActive
                                        ? 'border-[#F26389] bg-[#F26389]/5'
                                        : 'border-[#f4f2f4] dark:border-white/5 bg-white dark:bg-[#0c0c0c]'
                                )}
                            >
                                <span className={clsx(
                                    'text-[10px] font-black leading-none w-5 h-5 flex items-center justify-center rounded-full',
                                    isToday ? 'bg-[#F26389] text-white' : 'text-[#2f3035] dark:text-white'
                                )}>
                                    {date.getDate()}
                                </span>

                                {dayAppts.slice(0, 3).map((appt, i) => {
                                    const color = getCategoryColor(appt.category);
                                    return (
                                        <div
                                            key={appt.id || i}
                                            className="w-full rounded px-1 py-0.5 truncate text-[7px] font-black uppercase tracking-tight text-white leading-none"
                                            style={{ backgroundColor: color }}
                                        >
                                            {appt.name}
                                        </div>
                                    );
                                })}
                                {dayAppts.length > 3 && (
                                    <span className="text-[7px] font-black text-[#767676] dark:text-[#a0a0a0] pl-0.5">
                                        +{dayAppts.length - 3} more
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
};

export default MonthView;
