import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import clsx from 'clsx';

const WeeklyGridView = ({ activeDay, fullWeek, hours, appointments, staffColors }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            className="h-full w-full overflow-x-auto overflow-y-hidden touch-pan-x no-scrollbar border border-[#f4f2f4] dark:border-white/10 rounded-3xl bg-white dark:bg-[#0c0c0c]"
        >
            {/* The forced width that triggers the scroll */}
            <div className="min-w-[1000px] h-full flex flex-col relative">

                {/* --- GRID HEADER --- */}
                <div className="flex border-b border-[#f4f2f4] dark:border-white/10 bg-[#fdfcfc] dark:bg-[#0c0c0c] sticky top-0">
                    {/* Corner stays fixed to top-left */}
                    <div className="w-16 shrink-0 border-r border-[#f4f2f4] dark:border-white/10 bg-[#fdfcfc] dark:bg-[#0c0c0c] sticky left-0" />

                    {fullWeek.map(day => (
                        <div
                            key={day.date}
                            className={clsx(
                                "flex-1 py-4 text-center border-r border-[#f4f2f4] dark:border-white/10 last:border-r-0",
                                activeDay === day.date && "bg-[#f87941]/5"
                            )}
                        >
                            <p className="text-[8px] font-black text-[#b1b1b1] uppercase tracking-[0.2em] mb-1">{day.label}</p>
                            <p className={clsx(
                                "text-sm font-black tracking-tighter",
                                activeDay === day.date ? "text-[#f87941]" : "text-[#2f3035] dark:text-white"
                            )}>{day.date}</p>
                        </div>
                    ))}
                </div>

                {/* --- GRID BODY --- */}
                <div className="flex-1 overflow-y-auto no-scrollbar relative flex">

                    {/* Time Gutter - Sticky to the left during horizontal scroll */}
                    <div className="sticky left-0 bg-[#fdfcfc] dark:bg-[#0c0c0c] w-16 shrink-0 border-r border-[#f4f2f4] dark:border-white/10">
                        {hours.map(h => (
                            <div key={h} className="h-28 flex items-start justify-center pt-4 border-b border-[#f4f2f4]/50 dark:border-white/5 last:border-0">
                                <span className="text-[10px] font-black opacity-30 uppercase tracking-tighter">{h.split(':')[0]}</span>
                            </div>
                        ))}
                    </div>

                    {/* Columns */}
                    <div className="flex flex-1">
                        {fullWeek.map(day => (
                            <div key={day.date} className="flex-1 border-r border-[#f4f2f4] dark:border-white/10 last:border-r-0 min-h-full">
                                {hours.map(hour => {
                                    const appt = appointments.find(a => a.time === hour && a.day === day.date);
                                    return (
                                        <div key={`${day.date}-${hour}`} className="h-28 border-b border-[#f4f2f4]/50 dark:border-white/5 p-2 group relative">
                                            {appt ? (
                                                <div className="h-full w-full bg-white dark:bg-[#151515] border border-[#f4f2f4] dark:border-white/10 rounded-xl p-3 shadow-sm flex flex-col justify-between overflow-hidden relative">
                                                    <div className={clsx("absolute left-0 top-0 bottom-0 w-1", staffColors[appt.staff]?.bg)} />
                                                    <div className="space-y-1">
                                                        <span className="text-[7px] font-black text-[#f87941] uppercase">{appt.type}</span>
                                                        <h4 className="text-[10px] font-black uppercase tracking-tight leading-tight line-clamp-2">{appt.name}</h4>
                                                    </div>
                                                    <div className="flex items-center justify-between pt-2 border-t border-[#f4f2f4] dark:border-white/5">
                                                        <span className="text-[7px] font-bold text-[#b1b1b1] uppercase">{appt.room}</span>
                                                        <span className={clsx("text-[7px] font-black uppercase", staffColors[appt.staff]?.text)}>
                                                            {appt.staff.split(' ').pop()}
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