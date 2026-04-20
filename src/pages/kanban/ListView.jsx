import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, CalendarClock } from 'lucide-react';
import clsx from 'clsx';

const getDueLabel = (dueAt) => {
    if (!dueAt) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueAt);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.round((due - today) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return { label: 'Due today', overdue: false };
    if (diffDays > 0) return { label: `Due in ${diffDays}d`, overdue: false };
    return { label: `${Math.abs(diffDays)}d overdue`, overdue: true };
};

export const ListView = ({ columns, tasks, onTaskClick }) => (
    <motion.div
        key="list"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="space-y-8 pb-10"
    >
        {columns.map((col) => {
            const columnTasks = tasks.filter(t => t.status === col.name);
            return (
                <div key={col.name} className="space-y-4">
                    <div className="flex items-center gap-3 sticky top-0 bg-[#fdfcfc]/90 dark:bg-[#080808]/90 backdrop-blur-md z-10 py-2">
                        <div className={clsx("w-2 h-2 rounded-full", col.color)} />
                        <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#2f3035] dark:text-white">{col.name}</h2>
                        <div className="h-[px] flex-1 bg-[#f4f2f4] dark:bg-white/5" />
                        <span className="text-[10px] font-black opacity-20">{columnTasks.length}</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2 pl-5 border-l border-[#f4f2f4] dark:border-white/5">
                        {columnTasks.map(task => {
                            const dueInfo = getDueLabel(task.dueAt);
                            return (
                            <button
                                key={task.id}
                                type="button"
                                onClick={() => onTaskClick?.(task)}
                                className="flex items-center justify-between p-3 bg-white dark:bg-[#111] border border-[#f4f2f4] dark:border-white/10 rounded-xl group hover:border-[#F26389] transition-all text-left w-full"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-6 text-[8px] font-black opacity-20">{task.id}</div>
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-tight">{task.title}</h4>
                                        <p className="text-[8px] font-bold text-[#b1b1b1] uppercase tracking-widest mt-0.5">{task.tag}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {dueInfo && (
                                        <p className={clsx(
                                            "text-[8px] font-bold uppercase flex items-center gap-1 tracking-wider",
                                            dueInfo.overdue ? "text-[#F26389]" : "text-[#b1b1b1]"
                                        )}>
                                            <CalendarClock size={10} className={dueInfo.overdue ? "text-[#F26389]" : "text-[#F26389]/40"} />
                                            {dueInfo.label}
                                        </p>
                                    )}
                                    <ChevronRight size={14} className="text-[#b1b1b1] group-hover:translate-x-1 transition-transform" />
                                </div>
                            </button>
                            );
                        })}
                    </div>
                </div>
            );
        })}
    </motion.div>
);
