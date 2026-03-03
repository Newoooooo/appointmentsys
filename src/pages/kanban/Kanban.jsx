import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search,
    LayoutList, LayoutDashboard,
    ChevronRight
} from 'lucide-react';
import clsx from 'clsx';
import FilterDropdown from "../../components/dropdowns/FilterDropdown.jsx";


import {BoardView} from "./BoardView.jsx";
import {ListView} from "./ListView.jsx";

const Kanban = () => {
    const [view, setView] = useState('board');
    const scrollContainerRef = useRef(null);
    const [activeColIndex, setActiveColIndex] = useState(0);

    const columns = [
        { name: 'To Do', color: 'bg-[#b1b1b1]' },
        { name: 'In Progress', color: 'bg-blue-500' },
        { name: 'Reviewing', color: 'bg-[#f87941]' },
        { name: 'Completed', color: 'bg-emerald-500' }
    ];

    const tasks = [
        { id: 'T-90', title: 'Studio Rebrand', tag: 'Creative', time: '2h ago', status: 'In Progress', priority: 'high' },
        { id: 'T-91', title: 'SEO Audit', tag: 'Technical', time: '5h ago', status: 'To Do', priority: 'medium' },
        { id: 'T-92', title: 'API Integration', tag: 'Dev', time: '1h ago', status: 'In Progress', priority: 'high' },
    ];

    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        const index = Math.round((scrollLeft / (scrollWidth - clientWidth)) * (columns.length - 1));
        setActiveColIndex(index);
    };

    return (
        <div className="bg-[#fdfcfc] dark:bg-[#080808] text-[#2f3035] dark:text-[#fdfcfc] p-4 lg:p-6 flex flex-col overflow-hidden">
            <header className="flex items-center justify-between gap-3 mb-8 pb-6 border-b border-[#f4f2f4] dark:border-white/5 shrink-0 relative z-20">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="relative group min-w-[140px] md:max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b1b1b1] group-focus-within:text-[#f87941] transition-colors" size={14} />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full h-9 pl-10 pr-4 bg-white dark:bg-[#111] border border-[#f4f2f4] dark:border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest outline-none focus:border-[#f87941] transition-all"
                        />
                    </div>

                    <div className="flex bg-[#f4f2f4] dark:bg-[#111] p-1 rounded-xl border border-[#f4f2f4] dark:border-white/10 shrink-0">
                        <button onClick={() => setView('board')} className={clsx("p-1.5 rounded-lg transition-all", view === 'board' ? "bg-white dark:bg-white/10 shadow-sm text-[#f87941]" : "text-[#b1b1b1]")}>
                            <LayoutDashboard size={14} />
                        </button>
                        <button onClick={() => setView('list')} className={clsx("p-1.5 rounded-lg transition-all", view === 'list' ? "bg-white dark:bg-white/10 shadow-sm text-[#f87941]" : "text-[#b1b1b1]")}>
                            <LayoutList size={14} />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <FilterDropdown
                        activeFilter="This Week"
                        align="right"
                        options={["This Week", "Last Week", "This Month"]}
                    />
                    <button className="h-9 w-9 bg-[#f87941] text-white rounded-xl flex items-center justify-center shadow-lg shadow-[#f87941]/20 shrink-0">
                        <Plus size={14} strokeWidth={3} />
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto no-scrollbar">
                <AnimatePresence mode="wait">
                    {view === 'board' ? (
                        <BoardView
                            columns={columns}
                            tasks={tasks}
                            scrollRef={scrollContainerRef}
                            onScroll={handleScroll}
                        />
                    ) : (
                        <ListView
                            columns={columns}
                            tasks={tasks}
                        />
                    )}
                </AnimatePresence>
            </div>

            {view === 'board' && (
                <div className="flex md:hidden justify-center items-center gap-2 py-4 shrink-0 border-t border-[#f4f2f4] dark:border-white/5">
                    {columns.map((_, i) => (
                        <div key={i} className={clsx("h-1 rounded-full transition-all duration-300", activeColIndex === i ? "w-4 bg-[#f87941]" : "w-1 bg-[#b1b1b1]/30")} />
                    ))}
                </div>
            )}
        </div>
    );
};



export default Kanban;