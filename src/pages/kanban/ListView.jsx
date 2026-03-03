import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import clsx from 'clsx';

export const ListView = ({ columns, tasks }) => (
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
                        {columnTasks.map(task => (
                            <div key={task.id} className="flex items-center justify-between p-3 bg-white dark:bg-[#111] border border-[#f4f2f4] dark:border-white/10 rounded-xl group hover:border-[#f87941] transition-all">
                                <div className="flex items-center gap-4">
                                    <div className="w-6 text-[8px] font-black opacity-20">{task.id}</div>
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-tight">{task.title}</h4>
                                        <p className="text-[8px] font-bold text-[#b1b1b1] uppercase tracking-widest mt-0.5">{task.tag}</p>
                                    </div>
                                </div>
                                <ChevronRight size={14} className="text-[#b1b1b1] group-hover:translate-x-1 transition-transform" />
                            </div>
                        ))}
                    </div>
                </div>
            );
        })}
    </motion.div>
);
