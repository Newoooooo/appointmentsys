import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { TaskCard } from "./TaskCard.jsx";

export const BoardView = ({ columns, tasks, scrollRef, onScroll }) => (
    <motion.div
        key="board"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        ref={scrollRef}
        onScroll={onScroll}
        className="h-full overflow-x-auto no-scrollbar touch-pan-x"
    >
        <div className="flex gap-6 min-h-full pb-8">
            {columns.map((col) => (
                <div key={col.name} className="flex flex-col w-[280px] md:flex-1 shrink-0 group/col">
                    <div className="flex items-center justify-between mb-4 px-1 shrink-0">
                        <div className="flex items-center gap-2">
                            <div className={clsx("w-1.5 h-1.5 rounded-full", col.color)} />
                            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#b1b1b1] group-hover/col:text-[#2f3035] dark:group-hover/col:text-white transition-colors">{col.name}</h2>
                            <span className="text-[9px] font-bold opacity-30">{tasks.filter(t => t.status === col.name).length.toString().padStart(2, '0')}</span>
                        </div>
                    </div>

                    <div className="relative space-y-3 pl-4 border-l border-[#f4f2f4] dark:border-white/5">
                        {tasks.filter(t => t.status === col.name).map((task) => (
                            <TaskCard key={task.id} task={task} />
                        ))}
                        <button className="w-full py-3 border border-dashed border-[#f4f2f4] dark:border-white/10 rounded-xl text-[8px] font-black uppercase tracking-widest text-[#b1b1b1] hover:border-[#f87941] transition-all">+ Add Initiative</button>
                    </div>
                </div>
            ))}
        </div>
    </motion.div>
);
