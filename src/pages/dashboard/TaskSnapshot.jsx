import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, X } from "lucide-react";
import clsx from "clsx";
import Card from "../../components/ui/Card.jsx";

const getDaysUntilDue = (dueAt) => {
    if (!dueAt) return null;
    const due = new Date(dueAt);
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    return Math.ceil((dueDay - todayStart) / (1000 * 60 * 60 * 24));
};

const getDueLabel = (days) => {
    if (days === null) return null;
    if (days < 0) return `${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} overdue`;
    if (days === 0) return 'due today';
    return `due in ${days} day${days !== 1 ? 's' : ''}`;
};

export const TaskSnapshot = ({ tasks, onDismiss }) => {
    const navigate = useNavigate();

    return (
        <div className="lg:col-span-6 space-y-4">
            {/* Header Section */}
            <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-medium text-gray-400 uppercase tracking-[0.2em]">Priority Tasks</h2>
                <button
                    onClick={() => navigate('/kanban')}
                    className="group flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#F26389] hover:opacity-80 transition-all"
                >
                    View All
                    <ChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>

            <div className="space-y-2">
                {tasks.length === 0 && (
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest px-1">No priority tasks</p>
                )}
                {tasks.map((task) => {
                    const days = getDaysUntilDue(task.dueAt);
                    const isOverdue = days !== null && days < 0;
                    const dueLabel = getDueLabel(days);

                    return (
                        <Card
                            key={task.id}
                            className={clsx(
                                "p-3.5 sm:p-4 rounded-xl border group transition-all cursor-pointer",
                                isOverdue
                                    ? "bg-orange-50 dark:bg-orange-950/20 border-orange-300 dark:border-orange-500/30 hover:border-orange-400"
                                    : "bg-white dark:bg-[#111] border-[#f4f2f4] dark:border-white/10 hover:border-[#F26389]"
                            )}
                            hover={false}
                            onClick={() => navigate('/kanban')}
                        >
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="flex-1 min-w-0">
                                    {/* Task Title */}
                                    <h4 className={clsx(
                                        "text-[11px] sm:text-xs font-black uppercase tracking-tight truncate",
                                        isOverdue
                                            ? "text-orange-700 dark:text-orange-400"
                                            : "text-[#2f3035] dark:text-white group-hover:text-[#F26389] transition-colors"
                                    )}>
                                        {task.title}
                                    </h4>

                                    {/* Due label */}
                                    {dueLabel && (
                                        <p className={clsx(
                                            "text-[9px] font-bold uppercase tracking-tighter mt-0.5",
                                            isOverdue ? "text-orange-500" : "text-gray-400"
                                        )}>
                                            {dueLabel}
                                        </p>
                                    )}
                                </div>

                                {/* Priority dot */}
                                {task.priority === 'high' && !isOverdue && (
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 animate-pulse hidden sm:block" />
                                )}

                                {/* Dismiss button */}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDismiss?.(task.id);
                                    }}
                                    className={clsx(
                                        "shrink-0 p-1 rounded-lg transition-colors",
                                        isOverdue
                                            ? "text-orange-400 hover:text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/30"
                                            : "text-gray-300 dark:text-gray-700 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10"
                                    )}
                                    title="Dismiss"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
};