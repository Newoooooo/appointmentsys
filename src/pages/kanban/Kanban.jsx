import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Search,
    LayoutList, LayoutDashboard,
    ChevronRight
} from 'lucide-react';
import clsx from 'clsx';
import FilterDropdown from "../../components/dropdowns/FilterDropdown.jsx";
import AddTaskModal from "../../components/modals/AddTaskModal.jsx";
import { TaskService } from "../../api/services.js";

import {BoardView} from "./BoardView.jsx";
import {ListView} from "./ListView.jsx";

const Kanban = () => {
    const [view, setView] = useState('board');
    const scrollContainerRef = useRef(null);
    const [activeColIndex, setActiveColIndex] = useState(0);
    const [tasks, setTasks] = useState([]);
    const [isLoadingTasks, setIsLoadingTasks] = useState(true);
    const [taskModalOpen, setTaskModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [draggingTaskId, setDraggingTaskId] = useState(null);
    
    useEffect(() => {
        TaskService.getTasks().then(data => {
            setTasks(data);
            setIsLoadingTasks(false);
        }).catch(error => {
            console.error('Error loading tasks:', error);
            setIsLoadingTasks(false);
        });
    }, []);

    const handleRefreshTasks = () => {
        TaskService.getTasks().then(data => {
            setTasks(data);
        });
    };

    const handleDragStart = (taskId) => {
        setDraggingTaskId(taskId);
    };

    const handleDropOnColumn = async (columnName) => {
        if (!draggingTaskId) return;
        const task = tasks.find((t) => t.id === draggingTaskId);
        if (!task || task.status === columnName) {
            setDraggingTaskId(null);
            return;
        }
        setTasks((prev) => prev.map((t) => t.id === draggingTaskId ? { ...t, status: columnName } : t));
        setDraggingTaskId(null);
        try {
            await TaskService.updateTaskStatus(draggingTaskId, columnName);
        } catch (err) {
            console.error('Failed to update task status:', err);
            handleRefreshTasks();
        }
    };

    const columns = [
        { name: 'To Do', color: 'bg-[#b1b1b1]' },
        { name: 'In Progress', color: 'bg-blue-500' },
        { name: 'Reviewing', color: 'bg-[#F26389]' },
        { name: 'Completed', color: 'bg-emerald-500' }
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
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#b1b1b1] group-focus-within:text-[#F26389] transition-colors" size={14} />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full h-9 pl-10 pr-4 bg-white dark:bg-[#111] border border-[#f4f2f4] dark:border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest outline-none focus:border-[#F26389] transition-all"
                        />
                    </div>

                    <div className="flex bg-[#f4f2f4] dark:bg-[#111] p-1 rounded-xl border border-[#f4f2f4] dark:border-white/10 shrink-0">
                        <button onClick={() => setView('board')} className={clsx("p-1.5 rounded-lg transition-all", view === 'board' ? "bg-white dark:bg-white/10 shadow-sm text-[#F26389]" : "text-[#b1b1b1]")}>
                            <LayoutDashboard size={14} />
                        </button>
                        <button onClick={() => setView('list')} className={clsx("p-1.5 rounded-lg transition-all", view === 'list' ? "bg-white dark:bg-white/10 shadow-sm text-[#F26389]" : "text-[#b1b1b1]")}>
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
                    <button onClick={() => setTaskModalOpen(true)} className="h-9 w-9 bg-[#F26389] text-white rounded-xl flex items-center justify-center shadow-lg shadow-[#F26389]/20 shrink-0">
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
                            onDragStart={handleDragStart}
                            onDropOnColumn={handleDropOnColumn}
                            draggingTaskId={draggingTaskId}
                            onTaskClick={setSelectedTask}
                        />
                    ) : (
                        <ListView
                            columns={columns}
                            tasks={tasks}
                            onTaskClick={setSelectedTask}
                        />
                    )}
                </AnimatePresence>
            </div>

            {view === 'board' && (
                <div className="flex md:hidden justify-center items-center gap-2 py-4 shrink-0 border-t border-[#f4f2f4] dark:border-white/5">
                    {columns.map((_, i) => (
                        <div key={i} className={clsx("h-1 rounded-full transition-all duration-300", activeColIndex === i ? "w-4 bg-[#F26389]" : "w-1 bg-[#b1b1b1]/30")} />
                    ))}
                </div>
            )}

            {/* Add Task Modal */}
            <AddTaskModal
                isOpen={taskModalOpen}
                onClose={() => setTaskModalOpen(false)}
                onSuccess={handleRefreshTasks}
            />

            {/* Task Detail Modal */}
            <AnimatePresence>
                {selectedTask && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedTask(null)}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-[#111] rounded-2xl max-w-sm w-full p-6 space-y-4"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="space-y-1">
                                    <span className={clsx(
                                        'text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-widest border',
                                        selectedTask.priority === 'high'
                                            ? 'text-[#F26389] bg-[#F26389]/10 border-[#F26389]/20'
                                            : 'text-[#767676] bg-[#f4f2f4] dark:bg-white/5 border-transparent'
                                    )}>
                                        {selectedTask.tag}
                                    </span>
                                    <h3 className="text-sm font-black uppercase tracking-tight mt-2">{selectedTask.title}</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setSelectedTask(null)}
                                    className="text-[#767676] hover:text-[#2f3035] dark:hover:text-white transition-colors shrink-0"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-2 text-[10px] font-bold uppercase tracking-wide text-[#767676] dark:text-[#a0a0a0]">
                                <p><span className="text-[#2f3035] dark:text-white">Status:</span> {selectedTask.status}</p>
                                <p><span className="text-[#2f3035] dark:text-white">Time:</span> {selectedTask.time}</p>
                                {selectedTask.description && (
                                    <p><span className="text-[#2f3035] dark:text-white">Notes:</span> {selectedTask.description}</p>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};



export default Kanban;