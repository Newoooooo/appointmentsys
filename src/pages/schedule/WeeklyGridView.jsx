import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import clsx from 'clsx';

const WeeklyGridView = ({ activeDay, fullWeek, hours, appointments, staffColors, onSlotClick, onAppointmentClick }) => {
    const SLOT_MINUTES = 30;

    const toMinutes = (timeValue) => {
        if (!timeValue || !String(timeValue).includes(':')) return null;
        const [hour, minute] = String(timeValue).split(':').map((part) => Number.parseInt(part, 10));
        if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
        return hour * 60 + minute;
    };

    const getSlotState = (day, hour) => {
        const slotMinutes = toMinutes(hour);
        if (slotMinutes === null) {
            return { appointment: null, isContinuation: false, isOccupied: false, isStart: false, slotSpan: 1 };
        }

        const matching = appointments.find((item) => {
            if (item.fullDate !== day.fullDate) return false;
            const start = toMinutes(item.startTime || item.time);
            const end = toMinutes(item.endTime);
            if (start === null) return false;
            const resolvedEnd = end ?? (start + (Number(item.durationMinutes) || 60));
            return slotMinutes >= start && slotMinutes < resolvedEnd;
        });

        if (!matching) {
            return { appointment: null, isContinuation: false, isOccupied: false, isStart: false, slotSpan: 1 };
        }

        const startMinutes = toMinutes(matching.startTime || matching.time);
        const endMinutes = toMinutes(matching.endTime);
        const resolvedEnd = endMinutes ?? (startMinutes + (Number(matching.durationMinutes) || 60));
        const slotSpan = Math.max(1, Math.ceil((resolvedEnd - startMinutes) / SLOT_MINUTES));
        const isStart = slotMinutes === startMinutes;
        return {
            appointment: matching,
            isContinuation: slotMinutes !== startMinutes,
            isOccupied: true,
            isStart,
            slotSpan
        };
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            className="h-full w-full overflow-x-auto overflow-y-hidden touch-pan-x no-scrollbar border border-[#f4f2f4] dark:border-white/10 rounded-3xl bg-white dark:bg-[#0c0c0c]"
        >
            <div className="min-w-250 h-full flex flex-col relative">
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
                            <p
                                className={clsx(
                                    'text-sm font-black tracking-tighter',
                                    activeDay === day.fullDate ? 'text-[#F26389]' : 'text-[#2f3035] dark:text-white'
                                )}
                            >
                                {day.dateNumber}
                            </p>
                            <p className="text-[8px] text-[#b1b1b1] font-bold uppercase tracking-widest mt-0.5">{day.monthShort}</p>
                        </div>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar relative flex max-h-150">
                    <div className="sticky left-0 bg-[#fdfcfc] dark:bg-[#0c0c0c] w-16 shrink-0 border-r border-[#f4f2f4] dark:border-white/10">
                        {hours.map((hour) => (
                            <div key={hour} className="h-14 flex items-start justify-center pt-2 border-b border-[#f4f2f4]/50 dark:border-white/5 last:border-0">
                                <span className="text-[10px] font-black opacity-30 uppercase tracking-tighter">
                                    {hour.endsWith(':00') ? hour.split(':')[0] : ''}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-1">
                        {fullWeek.map((day) => (
                            <div key={day.fullDate} className="flex-1 border-r border-[#f4f2f4] dark:border-white/10 last:border-r-0 min-h-full">
                                {hours.map((hour) => {
                                    const slotState = getSlotState(day, hour);
                                    const appt = slotState.appointment;

                                    return (
                                        <div
                                            key={`${day.fullDate}-${hour}`}
                                            onClick={() => {
                                                if (!slotState.isOccupied) {
                                                    onSlotClick?.(day.fullDate, hour);
                                                }
                                            }}
                                            className={clsx(
                                                'h-14 border-b border-[#f4f2f4]/50 dark:border-white/5 p-1.5 group relative cursor-pointer hover:bg-[#F26389]/5 transition-colors',
                                                slotState.isOccupied && 'bg-[#F26389]/5'
                                            )}
                                        >
                                            {appt && slotState.isStart ? (
                                                <div 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onAppointmentClick?.(appt);
                                                    }}
                                                    className="absolute left-1.5 right-1.5 top-1.5 z-10 bg-white dark:bg-[#151515] border border-[#f4f2f4] dark:border-white/10 rounded-xl p-2 shadow-sm flex flex-col justify-between overflow-hidden relative hover:shadow-lg hover:border-[#F26389]/30 transition-all"
                                                    style={{ height: `calc(${slotState.slotSpan} * 3.5rem - 0.5rem)` }}
                                                >
                                                    <div className={clsx('absolute left-0 top-0 bottom-0 w-1', staffColors[appt.staff]?.bg)} />
                                                    <div className="space-y-1">
                                                        <span className="text-[7px] font-black text-[#F26389] uppercase">{appt.type}</span>
                                                        <h4 className="text-[10px] font-black uppercase tracking-tight leading-tight line-clamp-2">{appt.name}</h4>
                                                    </div>
                                                    <div className="flex items-center justify-between pt-2 border-t border-[#f4f2f4] dark:border-white/5">
                                                        <span className="text-[7px] font-bold text-[#b1b1b1] uppercase">{appt.room}</span>
                                                        <span className={clsx('text-[7px] font-black uppercase', staffColors[appt.staff]?.text)}>
                                                            {appt.staff?.split(' ')?.pop()}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Plus size={10} className="text-[#b1b1b1] opacity-20" />
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
